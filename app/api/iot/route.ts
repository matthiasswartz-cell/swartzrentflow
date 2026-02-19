import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTenantId, requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  const tenantId = await requireTenantId();
  const devices = await db.iotDevice.findMany({
    where: { tenantId },
    include: {
      inventory: {
        select: {
          id: true,
          name: true,
          category: true,
          serialNumber: true,
          contracts: {
            where: { status: { not: "paid_out" } },
            include: { customer: { select: { id: true, name: true, balance: true, daysLate: true } } },
            take: 1,
          },
        },
      },
    },
  });
  return NextResponse.json(devices);
}

export async function PUT(req: Request) {
  const user = await requireUser();
  const tenantId = user.tenantId;
  const body = await req.json();

  // ═══ CRITICAL: SAFE MODE ONLY ═══
  // NEVER allow "disabled" or "off" — only "active" or "safe_mode"
  const allowedModes = ["active", "safe_mode"];
  const newMode = (body.mode || "").toLowerCase().replace(" ", "_");

  if (!allowedModes.includes(newMode)) {
    return NextResponse.json(
      {
        error:
          "INVALID MODE. Only 'active' and 'safe_mode' are permitted. Full shutoff is NOT allowed.",
      },
      { status: 400 }
    );
  }

  const device = await db.iotDevice.update({
    where: { id: body.deviceId, tenantId },
    data: {
      mode: newMode,
      setTemp: newMode === "safe_mode" ? 85 : null,
    },
    include: { inventory: { select: { name: true } } },
  });

  await db.activityLog.create({
    data: {
      tenantId,
      userId: user.id,
      action: `📡 IoT: ${device.inventory.name} → ${newMode === "active" ? "ACTIVE (full service)" : "SAFE MODE (85°F max cool / 55°F max heat)"}`,
      type: "iot",
      entityType: "iot_device",
      entityId: device.id,
    },
  });

  return NextResponse.json(device);
}
