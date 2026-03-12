import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  hint?: string;
  className?: string;
};

export function StatCard({ title, value, icon, hint, className }: StatCardProps) {
  return (
    <article className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="rounded-lg bg-primary/15 p-2.5 text-primary">{icon}</div>
      </div>
    </article>
  );
}

