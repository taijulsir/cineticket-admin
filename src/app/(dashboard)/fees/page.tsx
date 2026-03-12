"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CrudPage } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";
import { feesApi } from "@/features/fees/api/fees.api";
import { useArchiveFee } from "@/features/fees/hooks/use-fees";
import type { Fee } from "@/features/fees/types/fee.types";

const columns: ColumnDef<Fee>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      row.original.type === "percentage"
        ? `${row.original.amount}%`
        : `$${row.original.amount?.toFixed(2)}`,
  },
  { accessorKey: "type", header: "Type" },
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

export default function FeesPage() {
  const archiveFeeMutation = useArchiveFee();

  return (
    <CrudPage
      title="Fees"
      entity="fees"
      description="Platform fees applied to ticket purchases"
      columns={columns}
      api={{ list: feesApi.list }}
      onArchive={(row: Fee, archive: boolean) => archiveFeeMutation.mutateAsync({ id: row._id, isArchive: archive })}
      searchPlaceholder="Search fees…"
    />
  );
}
