"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({ businessName: "", phone: "", address: "", city: "", state: "IL", zip: "", taxRate: "8.75" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !isLoaded || !isSignedIn) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { router.replace("/dashboard"); router.refresh(); }
      else {
        const detail = await res.json().catch(() => null);
        setError(typeof detail?.error === "string" ? detail.error : `Store setup could not complete (HTTP ${res.status}). Your entries have been kept. The administrator should check authentication and database readiness.`);
      }
    } catch { setError("The server could not be reached. Your entries have been kept; please check the connection before retrying."); }
    finally { setLoading(false); }
  }
  const fields = [ ["businessName", "Business Name *"], ["phone", "Phone"], ["taxRate", "Default Tax Rate %"], ["address", "Address"], ["city", "City"], ["zip", "ZIP"] ] as const;
  const states = "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" ");
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="bg-brand-s1 border border-brand-b1 rounded-2xl p-8 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-accent to-brand-purple flex items-center justify-center text-lg font-extrabold text-white">R</div><div><h1 className="text-xl font-extrabold text-white">Set Up Your Store</h1><p className="text-xs text-slate-400">Welcome, {user?.firstName || "owner"}. Let&apos;s get you started.</p></div></div>
        {!isLoaded && <p role="status" className="text-slate-300 mb-4">Checking your sign-in...</p>}
        {isLoaded && !isSignedIn && <p className="text-amber-300 mb-4">Please <a className="underline" href="/sign-in">sign in</a> before creating your store.</p>}
        {error && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(([key, label]) => <div key={key}><label htmlFor={key} className="block text-xs text-slate-400 font-semibold mb-1">{label}</label><input id={key} required={key === "businessName"} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} type={key === "taxRate" ? "number" : "text"} min={key === "taxRate" ? 0 : undefined} max={key === "taxRate" ? 99.999 : undefined} step={key === "taxRate" ? "0.001" : undefined} className="w-full px-3 py-2 rounded-lg text-sm" /></div>)}
          <div><label htmlFor="state" className="block text-xs text-slate-400 font-semibold mb-1">State</label><select id="state" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-3 py-2 rounded-lg text-sm">{states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <button type="submit" disabled={loading || !isLoaded || !isSignedIn || !form.businessName.trim()} className="w-full py-3 bg-brand-accent text-white rounded-lg font-semibold hover:bg-brand-accent/90 transition disabled:opacity-50">{loading ? "Creating..." : "Create My Store"}</button>
        </form>
      </div>
    </div>
  );
}
