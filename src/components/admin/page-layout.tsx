import { cn } from "@/lib/utils";

type PageLayoutProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function PageLayout({
  title,
  description,
  actions,
  filters,
  children,
  className,
}: PageLayoutProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      {filters ? <div className="rounded-xl border bg-card p-3">{filters}</div> : null}
      <div className="rounded-xl border bg-card p-4 shadow-sm">{children}</div>
    </section>
  );
}

