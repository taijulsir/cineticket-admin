"use client";

import { SidebarItem } from "./SidebarItem";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  Clapperboard,
  Building2,
  Tag,
  ShoppingCart,
  Settings,
  ScrollText,
} from "lucide-react";
import type { SidebarItemConfig } from "./SidebarItem";

// ─── Nav config (data-driven, fully configurable) ────────────────────────

const ADMIN_NAV: SidebarItemConfig[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/shows", label: "Shows", icon: Clapperboard },
  { href: "/theaters", label: "Theaters", icon: Building2 },
  { href: "/promo-codes", label: "Promo Codes", icon: Tag },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/settings", label: "App Settings", icon: Settings },
];

const PRODUCER_NAV: SidebarItemConfig[] = [
  { href: "/events", label: "Events", icon: CalendarDays },
];

/**
 * Sidebar — role-based, configurable navigation sidebar.
 *
 * Architecture notes:
 * - Nav items are pure data — adding a new route is one array entry
 * - Role-based rendering is a single conditional, not duplicated JSX
 * - SidebarItem is extracted as its own reusable component
 */
export function Sidebar() {
  const { employee } = useAuth();
  if (!employee) return null;

  const nav =
    employee.level === "producer" ? PRODUCER_NAV : ADMIN_NAV;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-sidebar-border bg-sidebar lg:w-56 transition-all">
      {/* Logo area */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        <span className="hidden lg:block text-primary font-bold text-lg tracking-tight">
          CineTicket
        </span>
        <span className="block lg:hidden text-primary font-bold text-lg">C</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            collapsed={false} /* On small screens SidebarItem auto-collapses */
          />
        ))}
      </nav>
    </aside>
  );
}
