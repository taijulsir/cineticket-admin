import { cn } from "@/lib/utils";
import type { CustomerStatus } from "@/types";

const variants: Record<CustomerStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blocked: "border-rose-200 bg-rose-50 text-rose-700",
};

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        variants[status] ?? "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      {status}
    </span>
  );
}
