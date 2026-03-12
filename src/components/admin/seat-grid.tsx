import { cn } from "@/lib/utils";

type SeatState = "AVAILABLE" | "RESERVED" | "BOOKED" | "BLOCKED";
type SeatType = "STANDARD" | "VIP" | "PREMIUM" | "WHEELCHAIR" | "STAIRS" | "UNAVAILABLE";

export type SeatCell = {
  id: string;
  label: string;
  type: SeatType;
  state: SeatState;
};

export type SeatRow = { row: string; seats: SeatCell[] };

const stateClass: Record<SeatState, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  RESERVED: "bg-amber-100 text-amber-700 border-amber-200",
  BOOKED: "bg-rose-100 text-rose-700 border-rose-200",
  BLOCKED: "bg-slate-200 text-slate-700 border-slate-300",
};

export function SeatGrid({ rows }: { rows: SeatRow[] }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.row} className="flex items-center gap-2">
          <span className="w-6 text-xs font-medium text-muted-foreground">{row.row}</span>
          <div className="flex flex-wrap gap-1.5">
            {row.seats.map((seat) => (
              <span key={seat.id} className={cn("rounded-md border px-2 py-1 text-xs", stateClass[seat.state])}>
                {seat.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

