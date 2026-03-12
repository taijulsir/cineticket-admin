"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/**
 * Header (Navbar) — top navigation bar with user avatar + dropdown.
 *
 * Migrated from the original NavBar.js:
 * - Replaced react-router Link → next/link
 * - Replaced useState dropdown → Radix DropdownMenu
 * - Replaced react-icons → lucide-react
 * - Identical behaviour (profile + logout)
 */
export function Header() {
  const { employee, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-primary text-lg">CineTicket Admin</span>
        </Link>

        {/* Right — user area */}
        {employee && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-secondary">
                  {employee.dp ? (
                    <Image
                      src={getImageUrl(employee.dp)}
                      alt={employee.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 m-auto mt-1.5 text-muted-foreground" />
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none">{employee.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{employee.level}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
