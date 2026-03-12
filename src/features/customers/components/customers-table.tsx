"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/data-table";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { ActionDropdown } from "@/components/admin/action-dropdown";
import { CustomerStatusBadge } from "@/features/customers/components/customer-status-badge";
import {
  useCustomerList,
  useUpdateCustomerStatus,
  useDeleteCustomer,
} from "@/features/customers/hooks/use-customers";
import { useConfirm } from "@/hooks/use-confirm";
import { appToast } from "@/lib/toast";
import type { Customer } from "@/types";

export function CustomersTable() {
  const router = useRouter();
  const { data, isLoading } = useCustomerList();
  const updateStatus = useUpdateCustomerStatus();
  const deleteCustomer = useDeleteCustomer();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");

  const rows = useMemo(() => {
    const list = data ?? [];
    return list
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) =>
        `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase()),
      );
  }, [data, search, statusFilter]);

  async function handleToggleStatus(customer: Customer) {
    const isBlocking = customer.status === "active";
    const ok = await confirm({
      title: isBlocking ? "Block Customer" : "Unblock Customer",
      description: isBlocking
        ? `Block ${customer.name}? They will no longer be able to book tickets.`
        : `Unblock ${customer.name}? They will be able to book tickets again.`,
      destructive: isBlocking,
      confirmLabel: isBlocking ? "Block" : "Unblock",
    });
    if (!ok) return;
    try {
      await updateStatus.mutateAsync({
        id: customer._id,
        status: isBlocking ? "blocked" : "active",
      });
      appToast.success(`Customer ${isBlocking ? "blocked" : "unblocked"} successfully`);
    } catch {
      appToast.error("Failed to update customer status");
    }
  }

  async function handleDelete(customer: Customer) {
    const ok = await confirm({
      title: "Delete Customer",
      description: `Permanently delete ${customer.name}? This action cannot be undone.`,
      destructive: true,
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await deleteCustomer.mutateAsync(customer._id);
      appToast.success("Customer deleted successfully");
    } catch {
      appToast.error("Failed to delete customer");
    }
  }

  const columns: ColumnDef<Customer>[] = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) =>
        row.original.dp ? (
          <img
            src={row.original.dp}
            alt={row.original.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {row.original.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        ),
    },
    {
      accessorKey: "name",
      header: "Customer Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.provider ?? "email"}</span>
      ),
    },
    {
      accessorKey: "totalBookings",
      header: "Total Bookings",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.totalBookings ?? 0}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Account Status",
      cell: ({ row }) => <CustomerStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString()
          : "-",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const customer = row.original;
        const isBlocked = customer.status === "blocked";
        return (
          <ActionDropdown
            actions={[
              {
                label: "View Details",
                onClick: () => {
                  router.push(`/customers/${customer._id}`);
                },
              },
              {
                label: isBlocked ? "Unblock" : "Block",
                destructive: !isBlocked,
                onClick: () => handleToggleStatus(customer),
              },
              {
                label: "Delete",
                destructive: true,
                onClick: () => handleDelete(customer),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email…"
        filters={
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        }
      />
      <DataTable columns={columns} data={rows} loading={isLoading} />
    </div>
  );
}
