import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (!user.tenant) redirect("/onboarding");

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      <Sidebar tenantName={user.tenant.name} />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-[1100px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
