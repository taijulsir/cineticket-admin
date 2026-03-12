"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CrudPage } from "@/components/admin/crud-page";
import type { TicketCategory } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ticketCategoriesApi } from "@/features/ticket-categories/api/ticket-categories.api";
import { useArchiveTicketCategory } from "@/features/ticket-categories/hooks/use-ticket-categories";

const columns: ColumnDef<TicketCategory>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "description", header: "Description" },
  {
    accessorKey: "isArchive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isArchive ? "destructive" : "default"}>
        {row.original.isArchive ? "Archived" : "Active"}
      </Badge>
    ),
  },
];

export default function TicketCategoriesPage() {
  const archiveMutation = useArchiveTicketCategory();

  return (
    <CrudPage
      title="Ticket Categories"
      entity="ticket-categories"
      description="Manage ticket categories (e.g. Gold, Silver, Standard)"
      columns={columns}
      api={{ list: ticketCategoriesApi.list }}
      onArchive={(row: TicketCategory, archive: boolean) => archiveMutation.mutateAsync({ id: row._id, isArchive: archive })}
      searchPlaceholder="Search ticket categories…"
    />
  );
}
