"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw]",
};

interface ReusableModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
}

/**
 * ReusableModal — wraps shadcn Dialog to replace the original Modal component.
 *
 * Why industry standard:
 * - Single open/close prop (controlled)
 * - Accessible via Radix Dialog
 * - Configurable size
 * - No coupling to page-level state shape
 */
export function ReusableModal({
  open,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ReusableModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn(sizeMap[size], "overflow-y-auto max-h-[90vh]", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
