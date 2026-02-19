import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent to-brand-purple flex items-center justify-center text-2xl font-extrabold text-white">
            R
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              RentFlow Pro
            </h1>
            <p className="text-xs text-brand-b2 tracking-widest uppercase">
              Complete RTO SaaS Platform
            </p>
          </div>
        </div>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The all-in-one platform for rent-to-own businesses. Payments,
          contracts, IoT HVAC, collections, and more — fully automated.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/sign-in"
            className="px-6 py-3 bg-brand-accent text-white rounded-lg font-semibold hover:bg-brand-accent/90 transition"
          >
            Sign In
          </a>
          <a
            href="/sign-up"
            className="px-6 py-3 border border-brand-b1 text-slate-300 rounded-lg font-semibold hover:bg-brand-s1 transition"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
