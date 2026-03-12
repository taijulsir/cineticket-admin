"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CrudPage } from "@/components/admin/crud-page";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/utils";
import type { Producer } from "@/types";
import { producersApi } from "@/features/producers/api/producers.api";
import { useArchiveProducer } from "@/features/producers/hooks/use-producers";

// ─── Columns ───────────────────────────────────────────────────────────────

const columns: ColumnDef<Producer>[] = [
  {
    id: "image",
    header: "Image",
    cell: ({ row }) =>
      row.original.dp ? (
        <img
          src={getImageUrl(row.original.dp)}
          alt={row.original.name}
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
          {row.original.name?.[0]?.toUpperCase()}
        </div>
      ),
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
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

// ─── Page ─────────────────────────────────────────────────────────────────

export default function ProducersPage() {
  const archiveProducerMutation = useArchiveProducer();

  return (
    <CrudPage
      title="Producers"
      entity="producers"
      description="Manage event producers"
      columns={columns}
      api={{ list: producersApi.list }}
      onArchive={(row: Producer, archive: boolean) => archiveProducerMutation.mutateAsync({ id: row._id, isArchive: archive })}
      searchPlaceholder="Search producers…"
    />
  );
}
