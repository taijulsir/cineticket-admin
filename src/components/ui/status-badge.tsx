import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        danger: "border-rose-200 bg-rose-50 text-rose-700",
        info: "border-blue-200 bg-blue-50 text-blue-700",
        neutral: "border-slate-200 bg-slate-50 text-slate-700",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type StatusBadgeProps = VariantProps<typeof statusBadgeVariants> & {
  children: React.ReactNode;
  className?: string;
};

export function StatusBadge({ variant, className, children }: StatusBadgeProps) {
  return <span className={cn(statusBadgeVariants({ variant }), className)}>{children}</span>;
}

