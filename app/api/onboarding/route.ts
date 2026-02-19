import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if user already has a tenant
  const existing = await db.user.findUnique({ where: { clerkId: userId } });
  if (existing) {
    return NextResponse.json({ message: "Already onboarded" });
  }

  const body = await req.json();
  const slug = body.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Create tenant and user in a transaction
  const result = await db.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: body.businessName,
        slug: slug,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zip: body.zip || null,
        defaultTaxRate: parseFloat(body.taxRate) || 0,
      },
    });

    const dbUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Owner",
        role: "owner",
      },
    });

    await tx.activityLog.create({
      data: {
        tenantId: tenant.id,
        userId: dbUser.id,
        action: `🚀 Store "${tenant.name}" created by ${dbUser.name}`,
        type: "system",
      },
    });

    return { tenant, user: dbUser };
  });

  return NextResponse.json(result);
}
