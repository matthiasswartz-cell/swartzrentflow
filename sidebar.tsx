"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/payments", label: "Point of Sale", icon: "💳" },
  { href: "/dashboard/iot", label: "IoT HVAC", icon: "📡" },
  { href: "/dashboard/contracts", label: "Contracts", icon: "📝" },
  { href: "/dashboard/customers", label: "Customers", icon: "👥" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
  { href: "/dashboard/collections", label: "Collections", icon: "🎯" },
  { href: "/dashboard/reports", label: "Reports", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar({ tenantName }: { tenantName?: string }) {
  const pathname = usePathname();

  return (
    <div className="w-[200px] bg-brand-s1 border-r border-brand-b1 flex flex-col flex-shrink-0 h-screen">
      {/* Logo */}
      <div className="p-3 border-b border-brand-b1 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-accent to-brand-purple flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0">
          R
        </div>
        <div>
          <div className="text-sm font-extrabold text-white tracking-tight">
            RentFlow
          </div>
          <div className="text-[7px] text-slate-500 tracking-[2px] uppercase">
            Pro v5
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-1.5 space-y-0.5 overflow-auto">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors relative ${
                active
                  ? "bg-brand-accent/10 text-brand-accent font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-brand-hover"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-[22%] bottom-[22%] w-[3px] rounded-sm bg-brand-accent" />
              )}
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tenant + User */}
      <div className="p-3 border-t border-brand-b1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-brand-green to-brand-cyan flex items-center justify-center text-[8px] font-bold text-white">
            {tenantName?.[0] || "R"}
          </div>
          <div className="text-[10px]">
            <div className="font-semibold text-slate-200 truncate max-w-[120px]">
              {tenantName || "My Store"}
            </div>
            <div className="text-slate-500">Professional</div>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}
