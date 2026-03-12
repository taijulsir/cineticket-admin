"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  enableSearch?: boolean;
  filters?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  className?: string;
};

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found.",
  searchPlaceholder = "Search...",
  pageSize = 20,
  enableSearch = false,
  filters,
  onRowClick,
  className,
}: DataTableProps<TData>) {
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const navbarQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    if (!enableSearch) {
      setGlobalFilter(navbarQuery);
    }
  }, [enableSearch, navbarQuery]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const totalRows = useMemo(() => table.getFilteredRowModel().rows.length, [table]);

  return (
    <div className={cn("flex h-[calc(100vh-20rem)] min-h-[420px] flex-col gap-4", className)}>
      {(enableSearch || filters) ? (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {enableSearch ? (
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full md:max-w-sm"
            />
          ) : (
            <div />
          )}
          {filters}
        </div>
      ) : null}
      <div className="flex-1 overflow-hidden rounded-lg border">
        <div className="h-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {header.isPlaceholder ? null : (
                        <button className={cn("flex items-center gap-1", header.column.getCanSort() && "cursor-pointer")} onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() ? (
                            header.column.getIsSorted() === "asc" ? <ChevronUp className="h-3 w-3" /> : header.column.getIsSorted() === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronsUpDown className="h-3 w-3" />
                          ) : null}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {loading ? (
                <tr><td colSpan={columns.length} className="py-12"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></td></tr>
              ) : null}
              {!loading && table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="py-12 text-center text-muted-foreground">{emptyMessage}</td></tr>
              ) : null}
              {!loading && table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={cn("hover:bg-muted/20", onRowClick && "cursor-pointer")} onClick={() => onRowClick?.(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())} · {totalRows} rows</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}
