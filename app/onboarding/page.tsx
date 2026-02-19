"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    phone: "",
    address: "",
    city: "",
    state: "IL",
    zip: "",
    taxRate: "8.75",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Error creating account. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="bg-brand-s1 border border-brand-b1 rounded-2xl p-8 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-accent to-brand-purple flex items-center justify-center text-lg font-extrabold text-white">
            R
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">
              Set Up Your Store
            </h1>
            <p className="text-xs text-slate-400">
              Welcome, {user?.firstName}! Let&apos;s get you started.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1">
              Business Name *
            </label>
            <input
              required
              value={form.businessName}
              onChange={(e) =>
                setForm({ ...form, businessName: e.target.value })
              }
              placeholder="Acme Rent-to-Own"
              className="w-full px-3 py-2 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 100-2000"
                className="w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">
                Default Tax Rate %
              </label>
              <input
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                placeholder="8.75"
                className="w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1">
              Address
            </label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main St"
              className="w-full px-3 py-2 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">
                City
              </label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">
                State
              </label>
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm"
              >
                {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">
                ZIP
              </label>
              <input
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !form.businessName}
            className="w-full py-3 bg-brand-accent text-white rounded-lg font-semibold hover:bg-brand-accent/90 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "🚀 Launch My Store"}
          </button>
        </form>
      </div>
    </div>
  );
}
