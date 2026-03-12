"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { SeatGrid } from "@/components/admin/seat-grid";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Modal } from "@/components/ui/modal";
import { SelectInput, ShortTextInput } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { showsApi } from "@/features/shows/api/shows.api";
import { eventsApi } from "@/features/events/api/events.api";
import { theatersApi } from "@/features/theaters/api/theaters.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { appToast } from "@/lib/toast";

const schema = z.object({
  eventId: z.string().min(1),
  hallId: z.string().min(1),
  theaterId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

function mapSeatsToRows(seats: any[]) {
  const grouped = new Map<string, any[]>();
  seats.forEach((seat) => {
    const rowKey = String(seat.row ?? "-");
    if (!grouped.has(rowKey)) grouped.set(rowKey, []);
    grouped.get(rowKey)!.push({
      id: seat.hallSeatId ?? seat.id,
      label: seat.seatName ?? seat.label,
      type: seat.seatType ?? seat.type ?? "STANDARD",
      state: seat.status ?? seat.state ?? "AVAILABLE",
    });
  });
  return Array.from(grouped.entries()).map(([row, rowSeats]) => ({ row, seats: rowSeats }));
}

export default function ShowsPage() {
  const { value: globalSearch } = useGlobalSearch();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [seatRows, setSeatRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { eventId: "", hallId: "", theaterId: "", date: new Date().toISOString().slice(0, 10), startTime: "18:00", endTime: "20:00" } });
  const showQuery = useQuery({ queryKey: ["shows"], queryFn: showsApi.list });
  const eventQuery = useQuery({ queryKey: ["events-select"], queryFn: eventsApi.list });
  const theaterQuery = useQuery({ queryKey: ["theaters-select"], queryFn: theatersApi.list });
  const hallQuery = useQuery({ queryKey: ["halls-select"], queryFn: theatersApi.listHalls });
  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);

  const rows = (showQuery.data ?? [])
    .filter((s: any) => `${s.event?.name ?? ""} ${s.theater?.name ?? ""}`.toLowerCase().includes(search.toLowerCase()))
    .filter((s: any) => (eventFilter === "ALL" ? true : s.eventId === eventFilter));
  const selectedTheaterId = form.watch("theaterId");
  const hallOptions = useMemo(
    () =>
      (hallQuery.data ?? [])
        .filter((hall: any) => !selectedTheaterId || hall.theaterId === selectedTheaterId)
        .map((hall: any) => ({ label: hall.name, value: hall.id })),
    [hallQuery.data, selectedTheaterId],
  );
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, date: new Date(values.date).toISOString(), totalSeats: 100 };
      return edit ? showsApi.update(edit.id, payload) : showsApi.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shows"] }); setOpen(false); setEdit(null); },
  });
  const columns: ColumnDef<any>[] = [
    { accessorKey: "event", header: "Event", cell: ({ row }) => row.original.event?.name ?? "-" },
    { accessorKey: "theater", header: "Theater", cell: ({ row }) => row.original.theater?.name ?? "-" },
    { accessorKey: "hall", header: "Hall", cell: ({ row }) => row.original.hall?.name ?? "-" },
    { accessorKey: "date", header: "Date", cell: ({ row }) => new Date(row.original.date).toLocaleDateString() },
    { accessorKey: "time", header: "Time", cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime ?? "-"}` },
    { accessorKey: "sold", header: "Seats Sold", cell: ({ row }) => row.original.totalSoldTickets ?? 0 },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ActionDropdown
          actions={[
            {
              label: "Edit",
              onClick: () => {
                const r = row.original;
                setEdit(r);
                setOpen(true);
                form.reset({
                  eventId: r.eventId,
                  hallId: r.hallId,
                  theaterId: r.theaterId,
                  date: new Date(r.date).toISOString().slice(0, 10),
                  startTime: r.startTime,
                  endTime: r.endTime ?? "20:00",
                });
              },
            },
            {
              label: "Seat Map",
              onClick: async () => {
                try {
                  const result = await showsApi.getSeatMap(row.original.id);
                  const mappedRows = Array.isArray(result?.rows)
                    ? result.rows.map((x: any) => ({
                        row: String(x.row),
                        seats: (x.seats ?? []).map((s: any) => ({
                          id: s.hallSeatId ?? s.id,
                          label: s.seatName ?? s.label,
                          type: s.seatType ?? s.type ?? "STANDARD",
                          state: s.status ?? s.state ?? "AVAILABLE",
                        })),
                      }))
                    : [];
                  if (mappedRows.length) {
                    setSeatRows(mappedRows);
                    return;
                  }
                  const seats = await showsApi.getShowSeats(row.original.id);
                  setSeatRows(mapSeatsToRows(seats));
                } catch (error: any) {
                  appToast.error(error?.message ?? "Failed to load seat map");
                }
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <PageLayout title="Shows" description="Schedule screenings and monitor seat occupancy" actions={<Button onClick={() => { setEdit(null); setOpen(true); }}>Create Show</Button>}>
      <div className="space-y-4">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          filters={(
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="ALL">All Events</option>
              {(eventQuery.data ?? []).map((event: any) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          )}
        />
        <DataTable columns={columns} data={rows} loading={showQuery.isLoading} />
        {seatRows.length ? <div className="rounded-lg border p-4"><h3 className="mb-3 font-semibold">Seat Map</h3><SeatGrid rows={seatRows} /></div> : null}
      </div>
      <Modal open={open} onOpenChange={setOpen} title={edit ? "Edit Show" : "Create Show"} footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={form.handleSubmit((v) => mutation.mutate(v))}>{edit ? "Update" : "Create"}</Button></>}>
        <form className="grid gap-3 md:grid-cols-2">
          <SelectInput control={form.control} name="eventId" label="Select Event" options={(eventQuery.data ?? []).map((e: any) => ({ label: e.name, value: e.id }))} />
          <label className="space-y-1 text-sm">
            <span className="font-medium">Select Theater</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.watch("theaterId")}
              onChange={(e) => {
                form.setValue("theaterId", e.target.value);
                form.setValue("hallId", "");
              }}
            >
              <option value="">Select...</option>
              {(theaterQuery.data ?? []).map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <SelectInput control={form.control} name="hallId" label="Select Hall" options={hallOptions} />
          <ShortTextInput control={form.control} name="date" label="Date" placeholder="YYYY-MM-DD" />
          <ShortTextInput control={form.control} name="startTime" label="Start Time" placeholder="18:00" />
          <ShortTextInput control={form.control} name="endTime" label="End Time" placeholder="20:00" />
        </form>
      </Modal>
    </PageLayout>
  );
}
