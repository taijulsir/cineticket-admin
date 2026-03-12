"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CrudPage } from "@/components/admin/crud-page";
import type { State } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { locationsApi } from "@/features/locations/api/locations.api";
import { useArchiveState } from "@/features/locations/hooks/use-locations";

const columns: ColumnDef<State>[] = [
  { accessorKey: "name", header: "State Name" },
  {
    id: "cities",
    header: "Cities",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/states/${row.original._id}/cities`}>View Cities</Link>
      </Button>
    ),
  },
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

export default function StatesPage() {
  const archiveStateMutation = useArchiveState();

  return (
    <CrudPage
      title="States"
      entity="states"
      description="Manage states / regions for event location hierarchy"
      columns={columns}
      api={{ list: locationsApi.listStates }}
      onArchive={(row: State, archive: boolean) => archiveStateMutation.mutateAsync({ id: row._id, isArchive: archive })}
      searchPlaceholder="Search states…"
    />
  );
}
