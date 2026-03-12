"use client";

import { cn } from "@/lib/utils";
import { modules, type AppModule } from "@/config/modules";
import { usePermission } from "@/hooks/use-permission";
import { useSidebarLayout } from "@/context/SidebarLayoutContext";
import { PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const core = modules.filter((x) => x.section === "CORE");
const system = modules.filter((x) => x.section === "SYSTEM");

export function DashboardSidebar() {
  const { collapsed, toggleCollapsed } = useSidebarLayout();
  const pathname = usePathname();
  const { can } = usePermission();
  const coreModules = core.filter((m) => can(m.permission));
  const systemModules = system.filter((m) => can(m.permission));
  return (
    <aside className={cn("fixed inset-y-0 left-0 z-40 border-r bg-sidebar transition-all", collapsed ? "w-20" : "w-64")}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Image src="/icon.svg" alt="CineTicket" width={24} height={24} className="h-6 w-6" />
          <span className={cn("font-semibold tracking-tight text-primary", collapsed && "hidden")}>CineTicket</span>
        </div>
        <button
          className="rounded-md border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-3">
        <NavSection title="CORE" items={coreModules} pathname={pathname} collapsed={collapsed} />
        <NavSection title="SYSTEM" items={systemModules} pathname={pathname} collapsed={collapsed} className="mt-6" />
      </nav>
    </aside>
  );
}

function NavSection({
  title, items, pathname, collapsed, className,
}: { title: string; items: AppModule[]; pathname: string; collapsed: boolean; className?: string }) {
  return (
    <div className={className}>
      {!collapsed ? <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">{title}</p> : null}
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.path} item={item} pathname={pathname} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}

function NavItem({
  item, pathname, collapsed,
}: { item: AppModule; pathname: string; collapsed: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { can } = usePermission();
  const Icon = item.icon;
  const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const visibleSubItems = hasSubItems ? item.subItems!.filter((sub) => can(sub.permission)) : [];

  if (hasSubItems && visibleSubItems.length === 0) {
    return null; // Don't show parent if no sub-items are visible
  }

  if (!hasSubItems) {
    return (
      <Link 
        href={item.path} 
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm", 
          active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {!collapsed ? item.name : null}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm",
          active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {!collapsed ? item.name : null}
        </div>
        {!collapsed && (
          expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {expanded && !collapsed && (
        <div className="ml-6 mt-1 space-y-1">
          {visibleSubItems.map((subItem) => {
            const SubIcon = subItem.icon;
            const subActive = pathname === subItem.path;
            return (
              <Link
                key={subItem.path}
                href={subItem.path}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  subActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <SubIcon className="h-3 w-3" />
                {subItem.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

