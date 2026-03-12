"use client";

import { createContext, useContext, useMemo, useState } from "react";

type SidebarLayoutValue = {
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
  toggleCollapsed: () => void;
};

const SidebarLayoutContext = createContext<SidebarLayoutValue | null>(null);

export function SidebarLayoutProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const value = useMemo(
    () => ({ collapsed, setCollapsed, toggleCollapsed: () => setCollapsed((prev) => !prev) }),
    [collapsed],
  );

  return <SidebarLayoutContext.Provider value={value}>{children}</SidebarLayoutContext.Provider>;
}

export function useSidebarLayout() {
  const context = useContext(SidebarLayoutContext);
  if (!context) throw new Error("useSidebarLayout must be used within SidebarLayoutProvider");
  return context;
}
