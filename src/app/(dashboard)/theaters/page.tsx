"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ShortTextInput } from "@/components/ui/form";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { theatersApi } from "@/features/theaters/api/theaters.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Armchair, CheckCircle2, Circle } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";

type Mode = "THEATER" | "HALL";
type SeatType = "STANDARD" | "PREMIUM" | "RECLINER" | "KIDS" | "WHEELCHAIR" | "STAIR" | "UNAVAILABLE";
type SeatDesignType = "STANDARD" | "VIP" | "RECLINER" | "DISABLED" | "BLOCKED";
type SeatNamingPattern = "ROW_LETTER_COL_NUMBER" | "COL_LETTER_ROW_NUMBER" | "CUSTOM_PREFIX";

type TheaterForm = {
  name: string;
  countryId: string;
  stateId: string;
  cityId: string;
  address: string;
  zipCode: string;
};

type HallWizardForm = {
  theaterId: string;
  hallName: string;
  rows: string;
  columns: string;
  namingPattern: SeatNamingPattern;
  customPrefix: string;
};

type SeatCell = {
  key: string;
  row: number;
  column: number;
  label: string;
  type: SeatDesignType;
};

const paintTypes: SeatDesignType[] = ["STANDARD", "VIP", "RECLINER", "DISABLED", "BLOCKED"];

const seatColor: Record<SeatDesignType, string> = {
  STANDARD: "border-slate-300 bg-slate-100 text-slate-700",
  VIP: "border-amber-300 bg-amber-100 text-amber-700",
  RECLINER: "border-violet-300 bg-violet-100 text-violet-700",
  DISABLED: "border-blue-300 bg-blue-100 text-blue-700",
  BLOCKED: "border-rose-300 bg-rose-100 text-rose-700",
};

function toSeatCategory(type: SeatDesignType): SeatType {
  if (type === "VIP") return "PREMIUM";
  if (type === "DISABLED") return "WHEELCHAIR";
  if (type === "BLOCKED") return "UNAVAILABLE";
  return type;
}

function fromSeatCategory(type: SeatType): SeatDesignType {
  if (type === "PREMIUM") return "VIP";
  if (type === "WHEELCHAIR") return "DISABLED";
  if (type === "UNAVAILABLE") return "BLOCKED";
  return type === "RECLINER" ? "RECLINER" : "STANDARD";
}

function rowLetters(index: number) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[index - 1] ?? `R${index}`;
}

function getSeatLabel(row: number, col: number, pattern: SeatNamingPattern, prefix: string) {
  if (pattern === "COL_LETTER_ROW_NUMBER") return `${col}${rowLetters(row)}`;
  const base = `${rowLetters(row)}${col}`;
  if (pattern === "CUSTOM_PREFIX") return `${prefix || "VIP"}-${base}`;
  return base;
}

function generateCells(rows: number, columns: number, pattern: SeatNamingPattern, prefix: string, defaultType: SeatDesignType = "STANDARD") {
  const next: SeatCell[] = [];
  for (let row = 1; row <= rows; row += 1) {
    for (let col = 1; col <= columns; col += 1) {
      next.push({
        key: `${row}-${col}`,
        row,
        column: col,
        label: getSeatLabel(row, col, pattern, prefix),
        type: defaultType,
      });
    }
  }
  return next;
}

export default function TheatersPage() {
  const { value: globalSearch } = useGlobalSearch();
  const qc = useQueryClient();
  const { confirm } = useConfirm();

  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<Mode>("THEATER");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [manageSeatsOpen, setManageSeatsOpen] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState<string>("");
  const [manageStep, setManageStep] = useState(1);
  const [manageCells, setManageCells] = useState<SeatCell[]>([]);
  const [manageSelectedSeatKey, setManageSelectedSeatKey] = useState("");
  const [manageActiveSeatType, setManageActiveSeatType] = useState<SeatDesignType>("STANDARD");
  const [managePaintMode, setManagePaintMode] = useState<"SEAT" | "COLUMN" | "MULTI_COLUMN">("SEAT");
  const [manageSelectedColumns, setManageSelectedColumns] = useState<number[]>([]);
  const [manageIsPainting, setManageIsPainting] = useState(false);
  const [manageNamingPattern, setManageNamingPattern] = useState<SeatNamingPattern>("ROW_LETTER_COL_NUMBER");
  const [manageCustomPrefix, setManageCustomPrefix] = useState("VIP");

  const [wizardStep, setWizardStep] = useState(1);
  const [cells, setCells] = useState<SeatCell[]>([]);
  const [activeSeatType, setActiveSeatType] = useState<SeatDesignType>("STANDARD");
  const [selectedSeatKey, setSelectedSeatKey] = useState("");
  const [isPainting, setIsPainting] = useState(false);
  const [paintMode, setPaintMode] = useState<"SEAT" | "COLUMN" | "MULTI_COLUMN">("SEAT");
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);

  const theaterForm = useForm<TheaterForm>({
    defaultValues: { name: "", countryId: "", stateId: "", cityId: "", address: "", zipCode: "" },
  });

  const hallForm = useForm<HallWizardForm>({
    defaultValues: {
      theaterId: "",
      hallName: "Hall A",
      rows: "5",
      columns: "10",
      namingPattern: "ROW_LETTER_COL_NUMBER",
      customPrefix: "VIP",
    },
  });

  const theatersQuery = useQuery({ queryKey: ["admin-theaters"], queryFn: theatersApi.list });
  const hallsQuery = useQuery({ queryKey: ["admin-halls"], queryFn: theatersApi.listHalls });
  const hallSeatsQuery = useQuery({
    queryKey: ["admin-hall-seats", selectedHallId],
    queryFn: () => theatersApi.listHallSeats(selectedHallId),
    enabled: !!selectedHallId,
  });

  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);

  useEffect(() => {
    const handleUp = () => setIsPainting(false);
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, []);

  useEffect(() => {
    const handleUp = () => setManageIsPainting(false);
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, []);

  const theaters = useMemo(
    () =>
      (theatersQuery.data ?? [])
        .filter((t: any) => t?.name?.toLowerCase().includes(search.toLowerCase()))
        .filter((t: any) => (cityFilter === "ALL" ? true : t?.city?.name === cityFilter)),
    [cityFilter, search, theatersQuery.data],
  );

  const halls = useMemo(
    () =>
      (hallsQuery.data ?? [])
        .filter((hall: any) => `${hall.name} ${hall.theater?.name ?? ""}`.toLowerCase().includes(search.toLowerCase()))
        .filter((hall: any) => (cityFilter === "ALL" ? true : hall.theater?.city?.name === cityFilter)),
    [cityFilter, hallsQuery.data, search],
  );

  const selectedHall = useMemo(
    () => (hallsQuery.data ?? []).find((hall: any) => hall.id === selectedHallId) ?? null,
    [hallsQuery.data, selectedHallId],
  );

  const seatRows = useMemo(() => {
    const map = new Map<number, SeatCell[]>();
    cells.forEach((cell) => {
      if (!map.has(cell.row)) map.set(cell.row, []);
      map.get(cell.row)?.push(cell);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([row, seats]) => ({ row, seats: seats.sort((a, b) => a.column - b.column) }));
  }, [cells]);

  const manageSeatRows = useMemo(() => {
    const map = new Map<number, SeatCell[]>();
    manageCells.forEach((cell) => {
      if (!map.has(cell.row)) map.set(cell.row, []);
      map.get(cell.row)?.push(cell);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([row, seats]) => ({ row, seats: seats.sort((a, b) => a.column - b.column) }));
  }, [manageCells]);

  const selectedSeat = cells.find((cell) => cell.key === selectedSeatKey) ?? null;
  const manageSelectedSeat = manageCells.find((cell) => cell.key === manageSelectedSeatKey) ?? null;
  useEffect(() => {
    if (!manageSeatsOpen) return;
    if (!hallSeatsQuery.data?.length) {
      setManageCells([]);
      return;
    }
    setManageCells(
      hallSeatsQuery.data.map((seat: any) => ({
        key: seat.id,
        row: seat.row,
        column: seat.column,
        label: seat.seatName ?? seat.seatId,
        type: fromSeatCategory(seat.seatType as SeatType),
      })),
    );
    setManageStep(1);
    setManageSelectedSeatKey("");
    setManageSelectedColumns([]);
    setManagePaintMode("SEAT");
  }, [hallSeatsQuery.data, manageSeatsOpen]);

  const createTheaterMutation = useMutation({
    mutationFn: (payload: TheaterForm) => theatersApi.createTheater(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-theaters"] });
      appToast.success("Theater created");
      setOpen(false);
      theaterForm.reset();
    },
    onError: () => appToast.error("Failed to create theater"),
  });

  const createHallMutation = useMutation({
    mutationFn: async (payload: HallWizardForm) => {
      const createdHall = await theatersApi.createHall({
        theaterId: payload.theaterId,
        name: payload.hallName,
        numberOfRows: Number(payload.rows),
        numberOfColumns: Number(payload.columns),
      });

      await Promise.all(
        cells.map((cell) =>
          theatersApi.createHallSeat({
            hallId: createdHall.id,
            row: cell.row,
            column: cell.column,
            seatId: cell.label,
            seatName: cell.label,
            seatType: toSeatCategory(cell.type),
          }),
        ),
      );

      return createdHall;
    },
    onSuccess: (hall) => {
      qc.invalidateQueries({ queryKey: ["admin-halls"] });
      qc.invalidateQueries({ queryKey: ["admin-hall-seats", hall.id] });
      setSelectedHallId(hall.id);
      setManageSeatsOpen(true);
      appToast.success("Hall and seat layout created");
      setOpen(false);
      setWizardStep(1);
      setCells([]);
      setSelectedSeatKey("");
    },
    onError: (error: any) => appToast.error(error?.response?.data?.message ?? "Failed to create hall"),
  });

  const archiveHallMutation = useMutation({
    mutationFn: (id: string) => theatersApi.archiveHall(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-halls"] });
      if (selectedHallId) {
        setSelectedHallId("");
        setManageSeatsOpen(false);
      }
      appToast.success("Hall archived");
    },
    onError: () => appToast.error("Failed to archive hall"),
  });

  const deleteHallMutation = useMutation({
    mutationFn: (id: string) => theatersApi.deleteHall(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-halls"] });
      if (selectedHallId) {
        setSelectedHallId("");
        setManageSeatsOpen(false);
      }
      appToast.success("Hall deleted");
    },
    onError: () => appToast.error("Failed to delete hall"),
  });

  const saveManageLayoutMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        manageCells.map((cell) =>
          theatersApi.updateHallSeat(cell.key, {
            seatId: cell.label,
            seatName: cell.label,
            seatType: toSeatCategory(cell.type),
          }),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-hall-seats", selectedHallId] });
      appToast.success("Hall seat layout updated");
      setManageSeatsOpen(false);
    },
    onError: () => appToast.error("Failed to save hall seat layout"),
  });

  const theaterColumns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "country", header: "Country", cell: ({ row }) => row.original?.country?.name ?? "-" },
    { accessorKey: "state", header: "State", cell: ({ row }) => row.original?.state?.name ?? "-" },
    { accessorKey: "city", header: "City", cell: ({ row }) => row.original?.city?.name ?? "-" },
    { accessorKey: "zip", header: "Zip", cell: ({ row }) => row.original?.zipCode ?? "-" },
  ];

  const hallColumns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Hall Name" },
    { accessorKey: "theater", header: "Theater", cell: ({ row }) => row.original.theater?.name ?? "-" },
    { accessorKey: "rows", header: "Rows", cell: ({ row }) => row.original.numberOfRows ?? "-" },
    { accessorKey: "columns", header: "Columns", cell: ({ row }) => row.original.numberOfColumns ?? "-" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ActionDropdown
          actions={[
            {
              label: "Manage Seats",
              onClick: () => {
                setSelectedHallId(row.original.id);
                setManageSeatsOpen(true);
              },
            },
            {
              label: "Archive Hall",
              onClick: async () => {
                const ok = await confirm({ title: "Archive Hall", description: "This hall will be hidden from active list.", destructive: true });
                if (ok) archiveHallMutation.mutate(row.original.id);
              },
            },
            {
              label: "Delete Hall",
              destructive: true,
              onClick: async () => {
                const ok = await confirm({ title: "Delete Hall", description: "This action cannot be undone.", destructive: true });
                if (ok) deleteHallMutation.mutate(row.original.id);
              },
            },
          ]}
        />
      ),
    },
  ];

  const resetWizard = () => {
    setWizardStep(1);
    setCells([]);
    setSelectedSeatKey("");
    setActiveSeatType("STANDARD");
    setPaintMode("SEAT");
    setSelectedColumns([]);
  };

  const onWizardNext = () => {
    if (wizardStep === 1) {
      const rows = Number(hallForm.getValues("rows"));
      const columns = Number(hallForm.getValues("columns"));
      if (!hallForm.getValues("theaterId") || !hallForm.getValues("hallName")) {
        appToast.error("Theater and hall name are required");
        return;
      }
      if (!Number.isFinite(rows) || !Number.isFinite(columns) || rows < 1 || columns < 1) {
        appToast.error("Rows and columns must be valid positive numbers");
        return;
      }
      setCells(
        generateCells(
          Math.min(rows, 26),
          Math.min(columns, 40),
          hallForm.getValues("namingPattern"),
          hallForm.getValues("customPrefix"),
          "STANDARD",
        ),
      );
      setWizardStep(2);
      return;
    }

    if (wizardStep === 2) {
      setWizardStep(3);
    }
  };

  const applyNamingPattern = (pattern: SeatNamingPattern) => {
    hallForm.setValue("namingPattern", pattern);
    const prefix = hallForm.getValues("customPrefix");
    setCells((prev) => prev.map((cell) => ({ ...cell, label: getSeatLabel(cell.row, cell.column, pattern, prefix) })));
  };

  const applySeatType = (key: string) => {
    setCells((prev) => prev.map((cell) => (cell.key === key ? { ...cell, type: activeSeatType } : cell)));
  };

  const applyColumnType = (column: number) => {
    setCells((prev) => prev.map((cell) => (cell.column === column ? { ...cell, type: activeSeatType } : cell)));
  };

  const toggleColumnSelection = (column: number) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]));
  };

  const applySelectedColumns = () => {
    if (!selectedColumns.length) return;
    setCells((prev) => prev.map((cell) => (selectedColumns.includes(cell.column) ? { ...cell, type: activeSeatType } : cell)));
  };

  const applyManageNamingPattern = (pattern: SeatNamingPattern) => {
    setManageNamingPattern(pattern);
    setManageCells((prev) =>
      prev.map((cell) => ({
        ...cell,
        label: getSeatLabel(cell.row, cell.column, pattern, manageCustomPrefix),
      })),
    );
  };

  const applyManageSeatType = (key: string) => {
    setManageCells((prev) => prev.map((cell) => (cell.key === key ? { ...cell, type: manageActiveSeatType } : cell)));
  };

  const applyManageColumnType = (column: number) => {
    setManageCells((prev) => prev.map((cell) => (cell.column === column ? { ...cell, type: manageActiveSeatType } : cell)));
  };

  const toggleManageColumnSelection = (column: number) => {
    setManageSelectedColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]));
  };

  const applyManageSelectedColumns = () => {
    if (!manageSelectedColumns.length) return;
    setManageCells((prev) => prev.map((cell) => (manageSelectedColumns.includes(cell.column) ? { ...cell, type: manageActiveSeatType } : cell)));
  };

  return (
    <PageLayout title="Theaters" description="Professional hall + seat layout designer">
      <div className="space-y-5">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          onCreate={() => {
            setOpen(true);
            if (mode === "HALL") resetWizard();
          }}
          createLabel={mode === "THEATER" ? "Create Theater" : "Create Hall"}
          filters={(
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border p-1">
                <button type="button" className={`rounded px-3 py-1 text-sm ${mode === "THEATER" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`} onClick={() => setMode("THEATER")}>Theater Mode</button>
                <button type="button" className={`rounded px-3 py-1 text-sm ${mode === "HALL" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`} onClick={() => setMode("HALL")}>Hall Mode</button>
              </div>
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                <option value="ALL">All Cities</option>
                {Array.from(new Set((mode === "THEATER" ? theaters : halls).map((item: any) => (mode === "THEATER" ? item?.city?.name : item?.theater?.city?.name)).filter(Boolean))).map((cityName) => (
                  <option key={cityName} value={cityName}>{cityName}</option>
                ))}
              </select>
            </div>
          )}
        />

        <DataTable
          columns={mode === "THEATER" ? theaterColumns : hallColumns}
          data={mode === "THEATER" ? theaters : halls}
          loading={mode === "THEATER" ? theatersQuery.isLoading : hallsQuery.isLoading}
          onRowClick={mode === "HALL" ? (row: any) => { setSelectedHallId(row.id); setManageSeatsOpen(true); } : undefined}
        />
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={mode === "THEATER" ? "Create Theater" : "Create Hall Wizard"}
        size="xl"
        bodyClassName="max-h-[72vh]"
        footer={
          mode === "THEATER" ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={theaterForm.handleSubmit((values) => createTheaterMutation.mutate(values))} disabled={createTheaterMutation.isPending}>
                {createTheaterMutation.isPending ? "Creating..." : "Create Theater"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => { if (wizardStep === 1) setOpen(false); else setWizardStep((s) => s - 1); }}>
                {wizardStep === 1 ? "Cancel" : "Back"}
              </Button>
              {wizardStep < 3 ? (
                <Button onClick={onWizardNext}>Next</Button>
              ) : (
                <Button onClick={hallForm.handleSubmit((values) => createHallMutation.mutate(values))} disabled={createHallMutation.isPending || cells.length === 0}>
                  {createHallMutation.isPending ? "Creating Hall..." : "Create Hall"}
                </Button>
              )}
            </>
          )
        }
      >
        {mode === "THEATER" ? (
          <form className="grid gap-3 md:grid-cols-2">
            <ShortTextInput control={theaterForm.control} name="name" label="Theater Name" required />
            <ShortTextInput control={theaterForm.control} name="countryId" label="Country ID" required />
            <ShortTextInput control={theaterForm.control} name="stateId" label="State ID" required />
            <ShortTextInput control={theaterForm.control} name="cityId" label="City ID" required />
            <ShortTextInput control={theaterForm.control} name="address" label="Address" required />
            <ShortTextInput control={theaterForm.control} name="zipCode" label="Zip Code" required />
          </form>
        ) : (
          <div className="space-y-4">
            <ol className="grid gap-2 sm:grid-cols-3">
              {[
                { id: 1, title: "Hall Setup" },
                { id: 2, title: "Seat Naming" },
                { id: 3, title: "Seat Types" },
              ].map((step) => (
                <li key={step.id} className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", wizardStep === step.id ? "border-primary bg-primary/10 text-primary" : wizardStep > step.id ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "text-muted-foreground")}>
                  {wizardStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  {step.id}. {step.title}
                </li>
              ))}
            </ol>

            {wizardStep === 1 ? (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Select Theater</span>
                  <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={hallForm.watch("theaterId")} onChange={(e) => hallForm.setValue("theaterId", e.target.value)}>
                    <option value="">Select a theater</option>
                    {(theatersQuery.data ?? []).map((theater: any) => <option key={theater.id} value={theater.id}>{theater.name}</option>)}
                  </select>
                </label>
                <ShortTextInput control={hallForm.control} name="hallName" label="Hall Name" required />
                <ShortTextInput control={hallForm.control} name="rows" label="Number of Rows" required />
                <ShortTextInput control={hallForm.control} name="columns" label="Number of Columns" required />
              </div>
            ) : null}

            {wizardStep === 2 ? (
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">Naming Pattern</span>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={hallForm.watch("namingPattern")}
                      onChange={(e) => applyNamingPattern(e.target.value as SeatNamingPattern)}
                    >
                      <option value="ROW_LETTER_COL_NUMBER">Row letter + column number (A1)</option>
                      <option value="COL_LETTER_ROW_NUMBER">Column letter + row number (1A)</option>
                      <option value="CUSTOM_PREFIX">Custom prefix (VIP-A1)</option>
                    </select>
                  </label>
                  <ShortTextInput
                    control={hallForm.control}
                    name="customPrefix"
                    label="Custom Prefix"
                    placeholder="VIP"
                    disabled={hallForm.watch("namingPattern") !== "CUSTOM_PREFIX"}
                  />
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setCells((prev) =>
                          prev.map((cell) => ({
                            ...cell,
                            label: getSeatLabel(cell.row, cell.column, hallForm.getValues("namingPattern"), hallForm.getValues("customPrefix")),
                          })),
                        )
                      }
                    >
                      Apply Naming
                    </Button>
                  </div>
                </div>

                <SeatDesigner
                  rows={seatRows}
                  screenLabel="SCREEN"
                  onSeatClick={(seat) => setSelectedSeatKey(seat.key)}
                  getSeatClass={(seat) => cn(seatColor[seat.type], selectedSeatKey === seat.key && "ring-2 ring-primary")}
                />

                {selectedSeat ? (
                  <div className="grid gap-2 rounded-md border p-3 md:grid-cols-2">
                    <ShortTextInput
                      control={hallForm.control}
                      name="hallName"
                      label={`Editing ${selectedSeat.key} label`}
                      placeholder="Seat label"
                      helperText="Use the field below to update only this seat label"
                      disabled
                    />
                    <input
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                      value={selectedSeat.label}
                      onChange={(e) => setCells((prev) => prev.map((cell) => (cell.key === selectedSeat.key ? { ...cell, label: e.target.value } : cell)))}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {wizardStep === 3 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 rounded-md border p-2">
                  {paintTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={cn("rounded-md border px-3 py-1 text-xs font-medium", seatColor[type], activeSeatType === type && "ring-2 ring-primary")}
                      onClick={() => setActiveSeatType(type)}
                    >
                      {type}
                    </button>
                  ))}
                  <div className="mx-1 h-6 w-px bg-border" />
                  <button
                    type="button"
                    className={cn("rounded-md border px-3 py-1 text-xs font-medium", paintMode === "SEAT" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}
                    onClick={() => setPaintMode("SEAT")}
                  >
                    Seat Paint
                  </button>
                  <button
                    type="button"
                    className={cn("rounded-md border px-3 py-1 text-xs font-medium", paintMode === "COLUMN" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}
                    onClick={() => setPaintMode("COLUMN")}
                  >
                    Full Column
                  </button>
                  <button
                    type="button"
                    className={cn("rounded-md border px-3 py-1 text-xs font-medium", paintMode === "MULTI_COLUMN" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}
                    onClick={() => setPaintMode("MULTI_COLUMN")}
                  >
                    Multi Columns
                  </button>
                  {paintMode === "MULTI_COLUMN" ? (
                    <Button variant="outline" size="sm" onClick={applySelectedColumns} disabled={!selectedColumns.length}>
                      Apply Selected Columns
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => setCells((prev) => prev.map((cell) => ({ ...cell, type: "STANDARD" })))}>
                    Reset Seat
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setSelectedSeatKey(""); setSelectedColumns([]); }}>Clear Selection</Button>
                </div>

                <SeatDesigner
                  rows={seatRows}
                  screenLabel="SCREEN"
                  onSeatMouseDown={(seat) => {
                    setSelectedSeatKey(seat.key);
                    if (paintMode === "SEAT") {
                      setIsPainting(true);
                      applySeatType(seat.key);
                      return;
                    }
                    if (paintMode === "COLUMN") {
                      applyColumnType(seat.column);
                      return;
                    }
                  }}
                  onSeatMouseEnter={(seat) => {
                    if (paintMode === "SEAT" && isPainting) applySeatType(seat.key);
                  }}
                  onSeatClick={(seat) => {
                    setSelectedSeatKey(seat.key);
                    if (paintMode === "COLUMN") applyColumnType(seat.column);
                    if (paintMode === "MULTI_COLUMN") toggleColumnSelection(seat.column);
                  }}
                  getSeatClass={(seat) =>
                    cn(
                      seatColor[seat.type],
                      selectedSeatKey === seat.key && "ring-2 ring-primary",
                      selectedColumns.includes(seat.column) && "ring-2 ring-emerald-500",
                    )}
                />
              </div>
            ) : null}
          </div>
        )}
      </Modal>

      <Modal
        open={manageSeatsOpen}
        onOpenChange={setManageSeatsOpen}
        title="Manage Hall Seats Wizard"
        size="xl"
        bodyClassName="max-h-[72vh]"
        footer={
          <>
            <Button variant="outline" onClick={() => { if (manageStep === 1) setManageSeatsOpen(false); else setManageStep((s) => s - 1); }}>
              {manageStep === 1 ? "Close" : "Back"}
            </Button>
            {manageStep < 3 ? (
              <Button onClick={() => setManageStep((s) => Math.min(3, s + 1))}>Next</Button>
            ) : (
              <Button onClick={() => saveManageLayoutMutation.mutate()} disabled={saveManageLayoutMutation.isPending || !manageCells.length}>
                {saveManageLayoutMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <ol className="grid gap-2 sm:grid-cols-3">
            {[
              { id: 1, title: "Hall Setup" },
              { id: 2, title: "Seat Naming" },
              { id: 3, title: "Seat Types" },
            ].map((step) => (
              <li key={step.id} className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", manageStep === step.id ? "border-primary bg-primary/10 text-primary" : manageStep > step.id ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "text-muted-foreground")}>
                {manageStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {step.id}. {step.title}
              </li>
            ))}
          </ol>

          {hallSeatsQuery.isLoading ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">Loading hall seats...</div>
          ) : null}

          {manageStep === 1 ? (
            <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Hall Name</p><p className="font-medium">{selectedHall?.name ?? "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Theater</p><p className="font-medium">{selectedHall?.theater?.name ?? "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Rows</p><p className="font-medium">{selectedHall?.numberOfRows ?? "-"}</p></div>
              <div><p className="text-xs text-muted-foreground">Columns</p><p className="font-medium">{selectedHall?.numberOfColumns ?? "-"}</p></div>
              <div className="md:col-span-2"><p className="text-xs text-muted-foreground">Total Seats</p><p className="font-medium">{manageCells.length}</p></div>
            </div>
          ) : null}

          {manageStep === 2 ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Naming Pattern</span>
                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={manageNamingPattern}
                    onChange={(e) => applyManageNamingPattern(e.target.value as SeatNamingPattern)}
                  >
                    <option value="ROW_LETTER_COL_NUMBER">Row letter + column number (A1)</option>
                    <option value="COL_LETTER_ROW_NUMBER">Column letter + row number (1A)</option>
                    <option value="CUSTOM_PREFIX">Custom prefix (VIP-A1)</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Custom Prefix</span>
                  <input
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={manageCustomPrefix}
                    onChange={(e) => setManageCustomPrefix(e.target.value)}
                    disabled={manageNamingPattern !== "CUSTOM_PREFIX"}
                  />
                </label>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      setManageCells((prev) =>
                        prev.map((cell) => ({
                          ...cell,
                          label: getSeatLabel(cell.row, cell.column, manageNamingPattern, manageCustomPrefix),
                        })),
                      )
                    }
                  >
                    Apply Naming
                  </Button>
                </div>
              </div>

              <SeatDesigner
                rows={manageSeatRows}
                screenLabel="SCREEN"
                onSeatClick={(seat) => setManageSelectedSeatKey(seat.key)}
                getSeatClass={(seat) => cn(seatColor[seat.type], manageSelectedSeatKey === seat.key && "ring-2 ring-primary")}
              />

              {manageSelectedSeat ? (
                <div className="grid gap-2 rounded-md border p-3 md:grid-cols-2">
                  <div className="text-sm text-muted-foreground">Editing seat label for {manageSelectedSeat.label}</div>
                  <input
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={manageSelectedSeat.label}
                    onChange={(e) => setManageCells((prev) => prev.map((cell) => (cell.key === manageSelectedSeat.key ? { ...cell, label: e.target.value } : cell)))}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {manageStep === 3 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-md border p-2">
                {paintTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={cn("rounded-md border px-3 py-1 text-xs font-medium", seatColor[type], manageActiveSeatType === type && "ring-2 ring-primary")}
                    onClick={() => setManageActiveSeatType(type)}
                  >
                    {type}
                  </button>
                ))}
                <div className="mx-1 h-6 w-px bg-border" />
                <button type="button" className={cn("rounded-md border px-3 py-1 text-xs font-medium", managePaintMode === "SEAT" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")} onClick={() => setManagePaintMode("SEAT")}>Seat Paint</button>
                <button type="button" className={cn("rounded-md border px-3 py-1 text-xs font-medium", managePaintMode === "COLUMN" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")} onClick={() => setManagePaintMode("COLUMN")}>Full Column</button>
                <button type="button" className={cn("rounded-md border px-3 py-1 text-xs font-medium", managePaintMode === "MULTI_COLUMN" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")} onClick={() => setManagePaintMode("MULTI_COLUMN")}>Multi Columns</button>
                {managePaintMode === "MULTI_COLUMN" ? (
                  <Button variant="outline" size="sm" onClick={applyManageSelectedColumns} disabled={!manageSelectedColumns.length}>
                    Apply Selected Columns
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" onClick={() => setManageCells((prev) => prev.map((cell) => ({ ...cell, type: "STANDARD" })))}>
                  Reset Seat
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setManageSelectedSeatKey(""); setManageSelectedColumns([]); }}>
                  Clear Selection
                </Button>
              </div>

              <SeatDesigner
                rows={manageSeatRows}
                screenLabel="SCREEN"
                onSeatMouseDown={(seat) => {
                  setManageSelectedSeatKey(seat.key);
                  if (managePaintMode === "SEAT") {
                    setManageIsPainting(true);
                    applyManageSeatType(seat.key);
                    return;
                  }
                  if (managePaintMode === "COLUMN") {
                    applyManageColumnType(seat.column);
                    return;
                  }
                }}
                onSeatMouseEnter={(seat) => {
                  if (managePaintMode === "SEAT" && manageIsPainting) applyManageSeatType(seat.key);
                }}
                onSeatClick={(seat) => {
                  setManageSelectedSeatKey(seat.key);
                  if (managePaintMode === "COLUMN") applyManageColumnType(seat.column);
                  if (managePaintMode === "MULTI_COLUMN") toggleManageColumnSelection(seat.column);
                }}
                getSeatClass={(seat) =>
                  cn(
                    seatColor[seat.type],
                    manageSelectedSeatKey === seat.key && "ring-2 ring-primary",
                    manageSelectedColumns.includes(seat.column) && "ring-2 ring-emerald-500",
                  )}
              />
            </div>
          ) : null}
        </div>
      </Modal>

    </PageLayout>
  );
}

function SeatDesigner({
  rows,
  screenLabel,
  onSeatClick,
  onSeatMouseDown,
  onSeatMouseEnter,
  getSeatClass,
}: {
  rows: { row: number; seats: SeatCell[] }[];
  screenLabel: string;
  onSeatClick: (seat: SeatCell) => void;
  onSeatMouseDown?: (seat: SeatCell) => void;
  onSeatMouseEnter?: (seat: SeatCell) => void;
  getSeatClass: (seat: SeatCell) => string;
}) {
  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div className="mx-auto w-full max-w-xl rounded-md border bg-background py-2 text-center text-xs font-semibold tracking-[0.25em] text-muted-foreground">
        {screenLabel}
      </div>
      <div className="space-y-2 overflow-auto">
        {rows.map((row) => (
          <div key={row.row} className="flex items-center gap-2">
            <span className="w-6 text-center text-xs font-semibold text-muted-foreground">{rowLetters(row.row)}</span>
            <div className="flex flex-wrap gap-1.5">
              {row.seats.map((seat) => (
                <button
                  key={seat.key}
                  type="button"
                  className={cn("flex h-10 w-11 select-none flex-col items-center justify-center rounded-md border text-[10px] transition-transform hover:-translate-y-0.5", getSeatClass(seat))}
                  onMouseDown={() => onSeatMouseDown?.(seat)}
                  onMouseEnter={() => onSeatMouseEnter?.(seat)}
                  onClick={() => onSeatClick(seat)}
                >
                  <Armchair className="h-3.5 w-3.5" />
                  <span className="leading-none">{seat.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
