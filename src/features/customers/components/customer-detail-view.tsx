"use client";

import { Mail, Calendar, ShieldCheck, ShieldOff, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/admin/page-layout";
import { CustomerStatusBadge } from "@/features/customers/components/customer-status-badge";
import { CustomerBookings } from "@/features/customers/components/customer-bookings";
import {
  useCustomerDetail,
  useUpdateCustomerStatus,
  useDeleteCustomer,
} from "@/features/customers/hooks/use-customers";
import { useConfirm } from "@/hooks/use-confirm";
import { appToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CustomerDetailViewProps {
  customerId: string;
}

export function CustomerDetailView({ customerId }: CustomerDetailViewProps) {
  const router = useRouter();
  const { data: customer, isLoading } = useCustomerDetail(customerId);
  const updateStatus = useUpdateCustomerStatus();
  const deleteCustomer = useDeleteCustomer();
  const { confirm } = useConfirm();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Customer not found.
      </div>
    );
  }

  const isBlocked = customer.status === "blocked";

  async function handleToggleStatus() {
    if (!customer) return;
    const ok = await confirm({
      title: isBlocked ? "Unblock Customer" : "Block Customer",
      description: isBlocked
        ? `Unblock ${customer.name}? They will be able to book tickets again.`
        : `Block ${customer.name}? They will no longer be able to book tickets.`,
      destructive: !isBlocked,
      confirmLabel: isBlocked ? "Unblock" : "Block",
    });
    if (!ok) return;
    try {
      await updateStatus.mutateAsync({
        id: customer._id,
        status: isBlocked ? "active" : "blocked",
      });
      appToast.success(`Customer ${isBlocked ? "unblocked" : "blocked"} successfully`);
    } catch {
      appToast.error("Failed to update customer status");
    }
  }

  async function handleDelete() {
    if (!customer) return;
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
      router.push("/customers");
    } catch {
      appToast.error("Failed to delete customer");
    }
  }

  return (
    <PageLayout
      title="Customer Details"
      description="View customer profile, booking activity, and manage account"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button
            variant={isBlocked ? "outline" : "destructive"}
            size="sm"
            onClick={handleToggleStatus}
            disabled={updateStatus.isPending}
          >
            {isBlocked ? (
              <>
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                Unblock
              </>
            ) : (
              <>
                <ShieldOff className="mr-1.5 h-4 w-4" />
                Block
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteCustomer.isPending}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {customer.dp ? (
                <img
                  src={customer.dp}
                  alt={customer.name}
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground ring-2 ring-border">
                  {customer.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <CustomerStatusBadge status={customer.status} />
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {customer.email}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Joined {new Date(customer.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Sign-in via:{" "}
                <span className="font-medium capitalize">
                  {customer.provider ?? "email"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {customer.totalBookings ?? 0}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total Amount Spent</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              ${(customer.totalAmountSpent ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Account Status</p>
            <div className="mt-2">
              <CustomerStatusBadge status={customer.status} />
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold">Booking History</h3>
          <CustomerBookings bookings={customer.bookings ?? []} />
        </div>
      </div>
    </PageLayout>
  );
}
