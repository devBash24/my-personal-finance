import { redirect } from "next/navigation";
import { authServer } from "@/lib/auth/server";
import { ensureProfile } from "@/lib/db/ensure-profile";
import { DashboardNav } from "@/components/dashboard-nav";
import { MobileNav } from "@/components/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await authServer.getSession();
  if (!session?.user) redirect("/");

  const result = await ensureProfile(session.user.id);
  if ("deleted" in result) redirect("/");

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-background">
      <DashboardNav />
      <main className="min-w-0 max-w-full flex-1 p-3 pb-16 sm:p-4 sm:pb-4 lg:p-6 lg:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
