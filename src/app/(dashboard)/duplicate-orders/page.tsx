"use client";

import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDuplicateOrders } from "@/features/orders/hooks/use-orders";
import type { ColumnDef } from "@tanstack/react-table";

export default function DuplicateOrdersPage() {
  const { data, isLoading } = useDuplicateOrders();
  const rows = (data?.conflicts ?? []).flat().map((entry: any) => ({
    id: entry.order?._id ?? Math.random().toString(),
    orderId: entry.order?.orderId,
    customer: entry.order?.customerName ?? entry.order?.customerEmail ?? "Guest",
    seats: (entry.seats ?? []).map((s: any) => s.seatName).join(", "),
  }));
  const columns: ColumnDef<any>[] = [
    { accessorKey: "orderId", header: "Order ID" },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "seats", header: "Conflicting Seats" },
    { id: "status", header: "Status", cell: () => <StatusBadge variant="danger">CONFLICT</StatusBadge> },
  ];
  return (
    <PageLayout title="Duplicate Orders" description="Detect seat conflict anomalies in orders">
      <DataTable columns={columns} data={rows} loading={isLoading} />
    </PageLayout>
  );
}

