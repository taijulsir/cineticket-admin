"use client";

import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  /** Shows a red destructive style */
  destructive?: boolean;
  /** Divider above this item */
  separator?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  /** Custom trigger element — defaults to ⋯ button */
  trigger?: ReactNode;
}

/**
 * ActionDropdown — replaces the original CRUDButton row of action buttons
 * with a clean dropdown menu. Works identically but is far more compact.
 *
 * Why industry standard:
 * - Single entry point for all row actions
 * - Accessible via Radix DropdownMenu
 * - Action list is data-driven (no per-action JSX repetition)
 */
export function ActionDropdown({ actions, trigger }: ActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, i) => (
          <span key={i}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={action.destructive ? "text-destructive focus:text-destructive" : ""}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
