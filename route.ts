import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTenantId, requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  const tenantId = await requireTenantId();
  const payments = await db.payment.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      customer: { select: { name: true } },
      contract: { select: { id: true } },
    },
  });
  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const tenantId = user.tenantId;
  const body = await req.json();

  const result = await db.$transaction(async (tx) => {
    // Create payment record
    const payment = await tx.payment.create({
      data: {
        tenantId,
        customerId: body.customerId,
        contractId: body.contractId,
        amount: parseFloat(body.amount),
        method: body.method || "cash",
        type: body.type || "manual",
        processedById: user.id,
        notes: body.notes || null,
      },
    });

    // Update contract
    const contract = await tx.contract.findUnique({
      where: { id: body.contractId },
    });
    if (contract) {
      const newPaid = contract.paymentsMade + 1;
      const newLate = Math.max(0, contract.daysLate - 30);
      const newStatus =
        newPaid >= contract.termMonths
          ? "paid_out"
          : newLate === 0
          ? "active"
          : contract.status;

      await tx.contract.update({
        where: { id: body.contractId },
        data: {
          paymentsMade: newPaid,
          daysLate: newLate,
          lateFee: newLate === 0 ? 0 : contract.lateFee,
          status: newStatus,
        },
      });
    }

    // Update customer balance
    const customer = await tx.customer.findUnique({
      where: { id: body.customerId },
    });
    if (customer) {
      const newBal = Math.max(
        0,
        Number(customer.balance) - parseFloat(body.amount)
      );
      await tx.customer.update({
        where: { id: body.customerId },
        data: {
          balance: newBal,
          status: newBal === 0 ? "active" : customer.status,
          daysLate: newBal === 0 ? 0 : customer.daysLate,
          hvacMode: newBal === 0 ? null : customer.hvacMode,
        },
      });

      // If payment brings account current and customer had HVAC Safe Mode,
      // auto-restore IoT device to Active
      if (newBal === 0 && customer.hvacMode === "Safe Mode") {
        const contracts = await tx.contract.findMany({
          where: { customerId: customer.id },
          include: { inventory: { include: { iotDevice: true } } },
        });
        for (const con of contracts) {
          if (con.inventory.iotDevice) {
            await tx.iotDevice.update({
              where: { id: con.inventory.iotDevice.id },
              data: { mode: "active" },
            });
            await tx.activityLog.create({
              data: {
                tenantId,
                userId: user.id,
                action: `📡 IoT AUTO-RESTORE: ${con.inventory.name} → Active (payment received)`,
                type: "iot",
                entityType: "iot_device",
                entityId: con.inventory.iotDevice.id,
              },
            });
          }
        }
      }
    }

    return payment;
  });

  await db.activityLog.create({
    data: {
      tenantId,
      userId: user.id,
      action: `💰 Payment $${body.amount} from ${body.customerName || "customer"} via ${body.method}`,
      type: "payment",
      entityType: "payment",
      entityId: result.id,
    },
  });

  return NextResponse.json(result, { status: 201 });
}
