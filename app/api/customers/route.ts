import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTenantId } from "@/lib/auth";

export async function GET(req: Request) {
  const tenantId = await requireTenantId();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const where: any = { tenantId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const customers = await db.customer.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { contracts: true } } },
  });

  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const tenantId = await requireTenantId();
  const body = await req.json();

  const customer = await db.customer.create({
    data: {
      tenantId,
      name: body.name,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      city: body.city || null,
      county: body.county || null,
      state: body.state || null,
      zip: body.zip || null,
      taxRate: parseFloat(body.taxRate) || 0,
      references: body.references || null,
    },
  });

  await db.activityLog.create({
    data: {
      tenantId,
      action: `👤 New customer: ${customer.name}`,
      type: "system",
      entityType: "customer",
      entityId: customer.id,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
