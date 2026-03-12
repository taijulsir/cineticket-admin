"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { useConfirm } from "@/hooks/use-confirm";
import { useArchiveOrder, useOrdersByShow, useSendOrderEmail } from "@/features/orders/hooks/use-orders";
import { appToast } from "@/lib/toast";
import type { ColumnDef } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function OrdersByShowPage() {
  const params = useParams<{ showId: string }>();
  const showId = params?.showId ?? "";
  const [filter, setFilter] = useState<"active" | "archived" | "all">("active");
  const { data, isLoading } = useOrdersByShow(showId, filter);
  const archive = useArchiveOrder();
  const sendEmail = useSendOrderEmail();
  const { confirm } = useConfirm();
  const rows = data ?? [];
  const columns: ColumnDef<any>[] = [
    { accessorKey: "orderId", header: "Order ID" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "customerEmail", header: "Email" },
    { accessorKey: "totalAmount", header: "Amount", cell: ({ row }) => `$${Number(row.original.totalAmount ?? 0).toFixed(2)}` },
    { accessorKey: "isArchive", header: "Status", cell: ({ row }) => <StatusBadge variant={row.original.isArchive ? "warning" : "success"}>{row.original.isArchive ? "ARCHIVED" : "ACTIVE"}</StatusBadge> },
    { id: "actions", header: "", cell: ({ row }) => <ActionDropdown actions={[{ label: "Send Email", onClick: async () => { await sendEmail.mutateAsync(row.original._id); appToast.success("Email sent"); } }, { label: row.original.isArchive ? "Unarchive" : "Archive", destructive: !row.original.isArchive, onClick: async () => { const ok = await confirm({ title: row.original.isArchive ? "Unarchive Order" : "Archive Order", description: "Confirm order state update", destructive: !row.original.isArchive }); if (ok) { await archive.mutateAsync({ id: row.original._id, isArchive: !row.original.isArchive }); appToast.success("Order updated"); } } }]} /> },
  ];

  return (
    <PageLayout title="Orders" description={`Orders for show ${showId}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-2 py-1 text-xs" onClick={() => setFilter("active")}>Active</button>
          <button className="rounded-md border px-2 py-1 text-xs" onClick={() => setFilter("archived")}>Archived</button>
          <button className="rounded-md border px-2 py-1 text-xs" onClick={() => setFilter("all")}>All</button>
        </div>
        <DataTable columns={columns} data={rows} loading={isLoading} />
      </div>
    </PageLayout>
  );
}

