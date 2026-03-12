"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CrudPage } from "@/components/admin/crud-page";
import type { Country } from "@/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { locationsApi } from "@/features/locations/api/locations.api";
import { useArchiveCountry } from "@/features/locations/hooks/use-locations";

const columns: ColumnDef<Country>[] = [
  { accessorKey: "name", header: "Country Name" },
  {
    id: "states",
    header: "States",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/countries/${row.original._id}/states`}>View States</Link>
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

export default function CountriesPage() {
  const archiveCountryMutation = useArchiveCountry();

  return (
    <CrudPage
      title="Countries"
      entity="countries"
      description="Manage countries for event location hierarchy"
      columns={columns}
      api={{ list: locationsApi.listCountries }}
      onArchive={(row: Country, archive: boolean) => archiveCountryMutation.mutateAsync({ id: row._id, isArchive: archive })}
      searchPlaceholder="Search countries…"
    />
  );
}
