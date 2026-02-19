import { db } from "@/lib/db";
import { requireTenantId } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const tenantId = await requireTenantId();

  const [customers, contracts, payments, inventory, iotDevices, logs] =
    await Promise.all([
      db.customer.findMany({ where: { tenantId } }),
      db.contract.findMany({ where: { tenantId } }),
      db.payment.findMany({ where: { tenantId } }),
      db.inventory.findMany({ where: { tenantId } }),
      db.iotDevice.findMany({
        where: { tenantId },
        include: { inventory: { select: { name: true } } },
      }),
      db.activityLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
    ]);

  const totalRev = payments.reduce((a, p) => a + Number(p.amount), 0);
  const pastDue = customers.reduce((a, c) => a + Number(c.balance), 0);
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const safeMode = iotDevices.filter((d) => d.mode === "safe_mode").length;

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold">Dashboard</h1>
          <span className="text-xs bg-brand-green/10 text-brand-green border border-brand-green/30 px-2 py-0.5 rounded-full font-bold">
            Live
          </span>
        </div>
        <p className="text-sm text-slate-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { icon: "💰", label: "Revenue", value: formatCurrency(totalRev), sub: `${payments.length} payments`, color: "text-brand-green" },
          { icon: "📝", label: "Active Contracts", value: `${activeContracts}/${contracts.length}`, color: "text-brand-accent" },
          { icon: "📡", label: "IoT Devices", value: `${iotDevices.length}`, sub: "LTE Cellular", color: "text-brand-cyan" },
          { icon: "⚠️", label: "Past Due", value: formatCurrency(pastDue), sub: `${customers.filter((c) => Number(c.balance) > 0).length} accounts`, color: pastDue > 0 ? "text-brand-red" : "text-brand-green" },
          { icon: "❄️", label: "Safe Mode", value: `${safeMode}`, sub: "HVAC restricted", color: safeMode > 0 ? "text-brand-yellow" : "text-brand-green" },
        ].map((m, i) => (
          <div key={i} className="bg-brand-s1 border border-brand-b1 rounded-xl p-4">
            <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mb-1">
              {m.icon} {m.label}
            </div>
            <div className={`text-xl font-extrabold font-mono ${m.color}`}>
              {m.value}
            </div>
            {m.sub && (
              <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Activity Feed */}
        <div className="bg-brand-s1 border border-brand-b1 rounded-xl p-4">
          <h3 className="text-sm font-bold mb-3">⚡ Activity Feed</h3>
          <div className="space-y-1 max-h-[280px] overflow-auto">
            {logs.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-6">
                No activity yet. Start by adding customers and inventory.
              </p>
            )}
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-2 py-1.5 border-b border-brand-b1/10 items-center"
              >
                <span className="text-[9px] font-mono text-slate-500 min-w-[50px]">
                  {log.createdAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="text-[11px] text-slate-200">{log.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IoT Status */}
        <div className="bg-brand-s1 border border-brand-b1 rounded-xl p-4">
          <h3 className="text-sm font-bold mb-3">📡 IoT HVAC Status</h3>
          {iotDevices.length === 0 && (
            <p className="text-center text-slate-500 text-xs py-6">
              No IoT devices registered yet.
            </p>
          )}
          {iotDevices.map((d) => (
            <div
              key={d.id}
              className="flex justify-between items-center p-2 bg-brand-bg rounded-lg border border-brand-b1 mb-1.5"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    d.mode === "active"
                      ? "bg-brand-green shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                      : "bg-brand-yellow shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold">{d.inventory.name}</div>
                  <div className="text-[9px] text-slate-500">
                    {d.connectionType} · {d.signalStrength} dBm
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.currentTemp && (
                  <span className="text-xs font-mono">
                    {Number(d.currentTemp)}°F
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    d.mode === "active"
                      ? "text-brand-green bg-brand-green/10 border-brand-green/30"
                      : "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30"
                  }`}
                >
                  {d.mode === "active" ? "Active" : "Safe Mode"}
                </span>
              </div>
            </div>
          ))}
          {iotDevices.length > 0 && (
            <div className="mt-2 p-2 bg-brand-green/5 border border-brand-green/15 rounded-lg">
              <div className="text-[9px] text-brand-green font-semibold">
                ✅ All devices on cellular LTE — zero WiFi dependency
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
