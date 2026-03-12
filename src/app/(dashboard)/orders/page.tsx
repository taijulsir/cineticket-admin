"use client";

import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useEffect } from "react";

export default function OrdersPage() {
  const { value: globalSearch } = useGlobalSearch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const { data, isLoading } = useOrders(page, 20);
  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);
  const rows = useMemo(
    () =>
      (data?.data ?? [])
        .filter((o: any) => `${o.orderCode} ${o.email ?? ""}`.toLowerCase().includes(search.toLowerCase()))
        .filter((o: any) => (statusFilter === "ALL" ? true : o.state === statusFilter))
        .filter((o: any) => {
          if (paymentFilter === "ALL") return true;
          const paid = !!o.transactionId;
          return paymentFilter === "PAID" ? paid : !paid;
        }),
    [data, paymentFilter, search, statusFilter],
  );
  const total = data?.meta?.total ?? 0;
  const maxPage = Math.max(1, Math.ceil(total / 20));
  const columns: ColumnDef<any>[] = [
    { accessorKey: "orderCode", header: "Order ID" },
    { accessorKey: "customer", header: "Customer", cell: ({ row }) => row.original.name || row.original.email || "Guest" },
    { accessorKey: "event", header: "Event", cell: ({ row }) => row.original.eventName ?? "-" },
    { accessorKey: "show", header: "Show", cell: ({ row }) => row.original.showId ?? "-" },
    { accessorKey: "seats", header: "Seats", cell: ({ row }) => row.original.seatCount ?? "-" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => `$${row.original.total ?? 0}` },
    { accessorKey: "paymentStatus", header: "Payment", cell: ({ row }) => <StatusBadge variant={row.original.transactionId ? "success" : "warning"}>{row.original.transactionId ? "PAID" : "PENDING"}</StatusBadge> },
    { accessorKey: "state", header: "Order Status", cell: ({ row }) => <StatusBadge variant={row.original.state === "CONFIRMED" ? "success" : "info"}>{row.original.state}</StatusBadge> },
    { accessorKey: "createdAt", header: "Created At", cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
  ];

  return (
    <PageLayout title="Orders" description="Track ticket sales and payment lifecycle">
      <div className="space-y-4">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          filters={(
            <>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </select>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </>
          )}
        />
        <DataTable columns={columns} data={rows} loading={isLoading} />
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {maxPage}</span>
          <Button variant="outline" disabled={page >= maxPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </PageLayout>
  );
}
