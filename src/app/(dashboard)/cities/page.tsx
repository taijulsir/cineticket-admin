"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CrudPage } from "@/components/admin/crud-page";
import type { City } from "@/types";
import { Badge } from "@/components/ui/badge";
import { locationsApi } from "@/features/locations/api/locations.api";
import { useArchiveCity } from "@/features/locations/hooks/use-locations";

const columns: ColumnDef<City>[] = [
  { accessorKey: "name", header: "City Name" },
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

export default function CitiesPage() {
  const archiveCityMutation = useArchiveCity();

  return (
    <CrudPage
      title="Cities"
      entity="cities"
      description="Manage cities for event location hierarchy"
      columns={columns}
      api={{ list: locationsApi.listCities }}
      onArchive={(row: City, archive: boolean) => archiveCityMutation.mutateAsync({ id: row._id, isArchive: archive })}
      searchPlaceholder="Search cities…"
    />
  );
}
