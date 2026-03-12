"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { useState } from "react";

type ReusableTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  loading?: boolean;
  searchKey?: keyof TData;
  searchPlaceholder?: string;
};

export function ReusableTable<TData>({
  data,
  columns,
  loading = false,
  searchPlaceholder = "Search...",
}: ReusableTableProps<TData>) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? data.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
      />
      <DataTable columns={columns} data={filtered} loading={loading} />
    </div>
  );
}
