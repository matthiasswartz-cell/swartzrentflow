import { db } from "@/lib/db";
import { requireTenantId } from "@/lib/auth";
import { formatCurrency, statusColor } from "@/lib/utils";
import Link from "next/link";

export default async function CustomersPage() {
  const tenantId = await requireTenantId();
  const customers = await db.customer.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
    include: { _count: { select: { contracts: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-extrabold">👥 Customers</h1>
          <p className="text-sm text-slate-400">{customers.length} customers</p>
        </div>
      </div>
      <div className="bg-brand-s1 border border-brand-b1 rounded-xl p-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {["Customer", "Contact", "Risk", "Balance", "AutoPay", "HVAC", "Status"].map((h) => (
                <th key={h} className="text-left text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-2 border-b border-brand-b1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-brand-b1/10 hover:bg-brand-hover">
                <td className="px-2 py-2">
                  <div className="font-semibold text-xs">{c.name} <span className="text-slate-500">({c.rating})</span></div>
                  <div className="text-[9px] text-slate-500">{c.address}, {c.city} {c.state} · {c.county} Co.</div>
                </td>
                <td className="px-2 py-2">
                  <div className="text-xs">{c.phone}</div>
                  <div className="text-[9px] text-slate-500">{c.email}</div>
                </td>
                <td className="px-2 py-2">
                  <span className={`font-mono text-xs font-bold ${Number(c.riskScore) >= 75 ? "text-brand-green" : Number(c.riskScore) >= 50 ? "text-brand-yellow" : "text-brand-red"}`}>{c.riskScore}</span>
                </td>
                <td className="px-2 py-2">
                  <span className={`font-mono text-xs font-semibold ${Number(c.balance) > 0 ? "text-brand-red" : "text-brand-green"}`}>
                    {Number(c.balance) > 0 ? formatCurrency(Number(c.balance)) : "Current"}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.autopayEnabled ? "text-brand-purple bg-brand-purple/10 border-brand-purple/30" : "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30"}`}>
                    {c.autopayEnabled ? c.paymentDisplay || "Yes" : "No"}
                  </span>
                </td>
                <td className="px-2 py-2">
                  {c.hvacMode ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-brand-orange bg-brand-orange/10 border-brand-orange/30">{c.hvacMode}</span> : <span className="text-slate-500">—</span>}
                </td>
                <td className="px-2 py-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(c.status)}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-center text-slate-500 text-sm py-8">No customers yet. Add your first customer to get started.</p>}
      </div>
    </div>
  );
}
