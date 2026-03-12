"use client";

import { useAuth } from "@/context/AuthContext";

type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STAFF";

const grants: Record<Role, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "dashboard.view",
    "events.view", "events.create", "events.edit", "events.delete",
    "shows.view", "shows.create", "shows.edit", "shows.delete",
    "theaters.view", "theaters.create", "theaters.edit", "theaters.delete",
    "movies.view", "movies.create",
    "orders.view", "orders.edit", "orders.cancel",
    "promo-codes.view", "promo-codes.create", "promo-codes.edit", "promo-codes.delete",
    "customers.view", "customers.block", "customers.delete",
    "employees.view", "employees.invite", "employees.update",
    "settings.view", "audit-logs.view",
  ],
  MANAGER: [
    "dashboard.view",
    "events.view",
    "shows.view", "shows.create", "shows.edit",
    "theaters.view",
    "orders.view", "orders.edit", "orders.cancel",
    "customers.view",
    "promo-codes.view",
  ],
  STAFF: [
    "dashboard.view",
    "orders.view",
    "customers.view",
  ],
};

function mapLevelToRole(level?: string): Role {
  if (level === "superAdmin") return "SUPER_ADMIN";
  if (level === "admin") return "ADMIN";
  if (level === "manager") return "MANAGER";
  if (level === "employee" || level === "staff") return "STAFF";
  return "STAFF";
}

export function usePermission() {
  const { employee } = useAuth();
  const role = mapLevelToRole(employee?.level);
  const list = grants[role];
  
  function can(permission: string) {
    return list.includes("*") || list.includes(permission);
  }
  
  function canAny(permissions: string[]) {
    return permissions.some(p => can(p));
  }
  
  function canAll(permissions: string[]) {
    return permissions.every(p => can(p));
  }
  
  return { role, can, canAny, canAll };
}

