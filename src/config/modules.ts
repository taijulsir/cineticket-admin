import {
  Building2,
  CalendarDays,
  Clapperboard,
  Film,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tag,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AppModule = {
  name: string;
  path: string;
  icon: LucideIcon;
  section: "CORE" | "SYSTEM";
  permission: string;
  subItems?: Omit<AppModule, "subItems">[];
};

export const modules: AppModule[] = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard, section: "CORE", permission: "dashboard.view" },
  { name: "Events", path: "/events", icon: CalendarDays, section: "CORE", permission: "events.view" },
  { name: "Shows", path: "/shows", icon: Clapperboard, section: "CORE", permission: "shows.view" },
  { name: "Theaters", path: "/theaters", icon: Building2, section: "CORE", permission: "theaters.view" },
  { name: "Promo Codes", path: "/promo-codes", icon: Tag, section: "CORE", permission: "promo-codes.view" },
  { name: "Movies Import", path: "/movies/import", icon: Film, section: "CORE", permission: "movies.view" },
  { name: "Orders", path: "/orders", icon: ShoppingCart, section: "CORE", permission: "orders.view" },
  { name: "Customers", path: "/customers", icon: Users, section: "CORE", permission: "customers.view" },
  {
    name: "Employee Management",
    path: "/employees",
    icon: UserCog,
    section: "SYSTEM",
    permission: "employees.view",
    subItems: [
      { name: "All Employees", path: "/employees", icon: Users, section: "SYSTEM", permission: "employees.view" },
      { name: "Invite Employee", path: "/employees/invite", icon: UserPlus, section: "SYSTEM", permission: "employees.invite" },
      { name: "Roles & Permissions", path: "/employees/roles", icon: ShieldCheck, section: "SYSTEM", permission: "employees.view" },
    ],
  },
  { name: "Audit Logs", path: "/audit-logs", icon: ScrollText, section: "SYSTEM", permission: "audit-logs.view" },
  { name: "App Settings", path: "/settings", icon: Settings, section: "SYSTEM", permission: "settings.view" },
];
