"use client";

import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuditLogs } from "@/features/audit-logs/hooks/use-audit-logs";
import { useGlobalSearch } from "@/hooks/use-global-search";

export default function AuditLogsPage() {
  const { value: globalSearch } = useGlobalSearch();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const { data, isLoading } = useAuditLogs(1, 100);
  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);
  const rows = useMemo(
    () =>
      (data?.data ?? [])
        .filter((log: any) => `${log.action} ${log.resource}`.toLowerCase().includes(search.toLowerCase()))
        .filter((log: any) => (actionFilter === "ALL" ? true : log.action === actionFilter)),
    [actionFilter, data, search],
  );
  const columns: ColumnDef<any>[] = [
    { accessorKey: "user", header: "User", cell: ({ row }) => row.original.user?.email || row.original.userId || "system" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "resource", header: "Entity" },
    { accessorKey: "ipAddress", header: "IP Address", cell: ({ row }) => row.original.metadata?.ipAddress ?? "-" },
    { accessorKey: "timestamp", header: "Timestamp", cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
  ];

  return (
    <PageLayout title="Audit Logs" description="Security and operations activity feed">
      <div className="space-y-4">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          filters={(
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              {Array.from(new Set((data?.data ?? []).map((log: any) => log.action))).map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          )}
        />
        <DataTable columns={columns} data={rows} loading={isLoading} />
      </div>
    </PageLayout>
  );
}
