"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SidebarLayoutProvider, useSidebarLayout } from "@/context/SidebarLayoutContext";
import { DashboardSidebar } from "@/components/admin/dashboard-sidebar";
import { TopNavbar } from "@/components/admin/top-navbar";
import { Loader2 } from "lucide-react";

/**
 * DashboardLayout — wraps every authenticated admin/employee/producer page.
 *
 * Industry standard:
 * - Auth gate lives in the layout (single point of truth)
 * - Header + Sidebar are rendered once for all child pages
 * - Server components can use generateMetadata; client redirect here for smooth UX
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { employee, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !employee) {
      router.replace("/login");
    }
  }, [employee, isLoading, router]);

  if (isLoading || !employee) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarLayoutProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarLayoutProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarLayout();

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <TopNavbar />
      <main className={`min-h-screen px-4 pb-6 pt-20 transition-all ${collapsed ? "ml-20" : "ml-20 md:ml-64"}`}>
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
