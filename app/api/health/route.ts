import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authConfigurationIssue } from "@/lib/auth-configuration";
export const dynamic = "force-dynamic";
// Readiness for credential format and required tables; not an end-to-end login test.
export async function GET() {
  if (authConfigurationIssue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, process.env.CLERK_SECRET_KEY)) return NextResponse.json({ status: "not_ready" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const rows = await db.$queryRaw<Array<{ table_name: string }>>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`;
    const names = new Set(rows.map(row => row.table_name));
    const ready = ["Tenant", "User", "Customer", "Inventory", "Contract", "Payment", "IotDevice", "ActivityLog"].every(name => names.has(name));
    return NextResponse.json({ status: ready ? "configuration_and_schema_ready" : "not_ready" }, { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ status: "not_ready" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
