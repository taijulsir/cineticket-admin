import type { ReactNode } from "react";

interface StatsCardProps {
  /** Lucide icon or any React node */
  icon: ReactNode;
  heading: string;
  total: number | string;
  /** Optional CSS classes for the card wrapper */
  className?: string;
}

/**
 * StatsCard — reusable dashboard metric card.
 *
 * Industry standard: Single-responsibility, no side effects, purely presentational.
 * Can be composed into any grid or list layout.
 */
export function StatsCard({ icon, heading, total, className }: StatsCardProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:bg-card/80 ${className ?? ""}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-2xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">
          {heading}
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {typeof total === "number" ? total.toLocaleString() : total}
        </p>
      </div>
    </div>
  );
}
