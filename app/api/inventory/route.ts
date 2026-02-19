import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTenantId } from "@/lib/auth";

export async function GET(req: Request) {
  const tenantId = await requireTenantId();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const where: any = { tenantId };
  if (category) where.category = category;
  if (status) where.status = status;

  const inventory = await db.inventory.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { iotDevice: true },
  });

  return NextResponse.json(inventory);
}

export async function POST(req: Request) {
  const tenantId = await requireTenantId();
  const body = await req.json();

  const item = await db.inventory.create({
    data: {
      tenantId,
      name: body.name,
      category: body.category || "electronics",
      serialNumber: body.serialNumber || null,
      cost: parseFloat(body.cost) || 0,
      cashPrice: parseFloat(body.cashPrice) || 0,
      rbv: parseFloat(body.cost) || 0, // starts at cost
      depMethod: body.depMethod || "macrs",
      agent: body.agent || "rental",
      iotEnabled: body.iotEnabled || false,
    },
  });

  await db.activityLog.create({
    data: {
      tenantId,
      action: `📦 New inventory: ${item.name} ($${item.cost})`,
      type: "system",
      entityType: "inventory",
      entityId: item.id,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
