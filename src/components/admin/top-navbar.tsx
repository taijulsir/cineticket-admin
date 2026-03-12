"use client";

import { ThemeToggle } from "@/components/admin/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useSidebarLayout } from "@/context/SidebarLayoutContext";
import { Bell, Search, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TopNavbar() {
  const { employee, logout } = useAuth();
  const { collapsed } = useSidebarLayout();
  const { value, setValue } = useGlobalSearch();
  const router = useRouter();
  return (
    <header className={`fixed right-0 top-0 z-30 h-16 border-b bg-background/90 backdrop-blur transition-all ${collapsed ? "left-20" : "left-20 md:left-64"}`}>
      <div className="flex h-full items-center justify-between gap-3 px-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search events, shows, orders..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2"><User className="h-4 w-4" />{employee?.email ?? "Account"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); router.replace("/login"); }}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
