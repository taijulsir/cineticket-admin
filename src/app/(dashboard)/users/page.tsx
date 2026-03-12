"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CrudPage } from "@/components/admin/crud-page";
import { getImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { usersApi } from "@/features/users/api/users.api";
import { useArchiveCustomer } from "@/features/users/hooks/use-users";
type Customer = {
  _id: string;
  name: string;
  email: string;
  dp?: string;
  isActive?: boolean;
};

const columns: ColumnDef<Customer>[] = [
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
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs">
          {row.original.name?.[0]?.toUpperCase()}
        </div>
      ),
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Blocked"}
      </Badge>
    ),
  },
];

export default function UsersPage() {
  const archiveMutation = useArchiveCustomer();

  return (
    <CrudPage
      title="Customers"
      entity="customers"
      description="Manage registered customers"
      columns={columns}
      api={{ list: usersApi.listCustomers }}
      onArchive={(row: Customer, archive: boolean) => archiveMutation.mutateAsync({ id: row._id, isActive: !archive })}
      archiveKey="isActive"
      archiveLabel="Block"
      unarchiveLabel="Unblock"
      searchPlaceholder="Search customers…"
    />
  );
}
