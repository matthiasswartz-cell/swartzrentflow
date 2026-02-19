import { db } from "@/lib/db";
import { requireTenantId } from "@/lib/auth";
import { formatCurrency, statusColor } from "@/lib/utils";

export default async function ContractsPage() {
  const tenantId = await requireTenantId();
  const contracts = await db.contract.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      inventory: { select: { name: true, iotEnabled: true } },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-extrabold">📝 Contracts</h1>
          <p className="text-sm text-slate-400">{contracts.length} contracts</p>
        </div>
      </div>
      <div className="bg-brand-s1 border border-brand-b1 rounded-xl p-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {["ID", "Customer", "Item", "Type", "Payment", "Progress", "Late", "Status"].map((h) => (
                <th key={h} className="text-left text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-2 border-b border-brand-b1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-brand-b1/10 hover:bg-brand-hover">
                <td className="px-2 py-2 font-mono text-[10px]">{c.id.slice(0, 8)}</td>
                <td className="px-2 py-2 font-semibold text-xs">{c.customer.name}</td>
                <td className="px-2 py-2 text-xs">{c.inventory.name}{c.inventory.iotEnabled ? " 📡" : ""}</td>
                <td className="px-2 py-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-brand-accent bg-brand-accent/10 border-brand-accent/30">{c.type}</span></td>
                <td className="px-2 py-2 font-mono font-bold text-xs">{formatCurrency(Number(c.monthlyAmount))}<span className="text-slate-500 font-normal"> +{formatCurrency(Number(c.taxAmount))} tax</span></td>
                <td className="px-2 py-2">
                  <div className="w-16 h-1 bg-brand-bg rounded overflow-hidden"><div className="h-full rounded" style={{ width: `${Math.min((c.paymentsMade / c.termMonths) * 100, 100)}%`, background: c.daysLate > 0 ? "#EF4444" : "#10B981" }} /></div>
                  <span className="text-[8px] text-slate-500">{c.paymentsMade}/{c.termMonths} · EPO {formatCurrency(Number(c.epoAmount))}</span>
                </td>
                <td className="px-2 py-2">{c.daysLate > 0 ? <span className="font-mono font-bold text-brand-red">{c.daysLate}d</span> : <span className="text-brand-green text-xs">Current</span>}</td>
                <td className="px-2 py-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(c.status)}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {contracts.length === 0 && <p className="text-center text-slate-500 text-sm py-8">No contracts yet.</p>}
      </div>
    </div>
  );
}
