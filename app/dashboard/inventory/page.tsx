import { db } from "@/lib/db";
import { requireTenantId } from "@/lib/auth";
import { formatCurrency, statusColor } from "@/lib/utils";

export default async function InventoryPage() {
  const tenantId = await requireTenantId();
  const inventory = await db.inventory.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { iotDevice: true },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-extrabold">📦 Inventory</h1>
          <p className="text-sm text-slate-400">{inventory.length} items</p>
        </div>
      </div>
      <div className="bg-brand-s1 border border-brand-b1 rounded-xl p-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {["Item", "Category", "Serial", "Cost", "RBV", "Dep Method", "IoT", "Status"].map((h) => (
                <th key={h} className="text-left text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-2 border-b border-brand-b1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b border-brand-b1/10 hover:bg-brand-hover">
                <td className="px-2 py-2">
                  <div className="font-semibold text-xs">{item.name}</div>
                  <div className="text-[9px] text-slate-500">{item.id.slice(0, 8)}</div>
                </td>
                <td className="px-2 py-2 text-xs">{item.category}</td>
                <td className="px-2 py-2 font-mono text-[10px]">{item.serialNumber || "—"}</td>
                <td className="px-2 py-2 font-mono text-xs">{formatCurrency(Number(item.cost))}</td>
                <td className="px-2 py-2 font-mono text-xs font-bold">{formatCurrency(Number(item.rbv))}</td>
                <td className="px-2 py-2 text-[10px]">{item.depMethod}</td>
                <td className="px-2 py-2">
                  {item.iotDevice ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.iotDevice.mode === "active" ? "text-brand-green bg-brand-green/10 border-brand-green/30" : "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30"}`}>
                      {item.iotDevice.mode === "active" ? "Active" : "Safe Mode"}
                    </span>
                  ) : <span className="text-slate-500 text-[10px]">—</span>}
                </td>
                <td className="px-2 py-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(item.status)}`}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && <p className="text-center text-slate-500 text-sm py-8">No inventory yet. Add items to get started.</p>}
      </div>
    </div>
  );
}
