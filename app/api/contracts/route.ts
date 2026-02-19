import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTenantId } from "@/lib/auth";

export async function GET(req: Request) {
  const tenantId = await requireTenantId();
  const contracts = await db.contract.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      inventory: { select: { id: true, name: true, category: true, iotEnabled: true } },
    },
  });
  return NextResponse.json(contracts);
}

export async function POST(req: Request) {
  const tenantId = await requireTenantId();
  const body = await req.json();

  const contract = await db.$transaction(async (tx) => {
    const con = await tx.contract.create({
      data: {
        tenantId,
        customerId: body.customerId,
        inventoryId: body.inventoryId,
        type: body.type || "rto",
        monthlyAmount: parseFloat(body.monthlyAmount) || 0,
        termMonths: parseInt(body.termMonths) || 24,
        dueDate: new Date(body.dueDate || Date.now()),
        taxAmount: parseFloat(body.taxAmount) || 0,
        epoAmount: parseFloat(body.epoAmount) || 0,
      },
    });

    // Update inventory status
    await tx.inventory.update({
      where: { id: body.inventoryId },
      data: { status: "on_contract" },
    });

    return con;
  });

  await db.activityLog.create({
    data: {
      tenantId,
      action: `📝 New contract created: ${contract.id}`,
      type: "system",
      entityType: "contract",
      entityId: contract.id,
    },
  });

  return NextResponse.json(contract, { status: 201 });
}
