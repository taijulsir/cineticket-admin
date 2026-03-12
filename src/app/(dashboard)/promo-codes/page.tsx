"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DateInput, NumberInput, SelectInput, ShortTextInput, ToggleInput } from "@/components/ui/form";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useCreatePromoCode, useDeletePromoCode, usePromoCodes, useUpdatePromoCode } from "@/features/promo-codes/hooks/use-promo-codes";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useForm } from "react-hook-form";

type PromoForm = {
  promoCode: string;
  category: "TICKET_DISCOUNTS" | "FOOD_SNACKS" | "PREMIUM_UPGRADES" | "STUDENT_OFFERS" | "WEEKEND_DEALS";
  description?: string;
  maxlimit: number | string;
  usageCount: number | string;
  discountType: "PERCENTAGE" | "AMOUNT" | "FREE_TICKET";
  discountAmount: number | string;
  minOrderAmount: number | string;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
};

export default function PromoCodesPage() {
  const { value: globalSearch } = useGlobalSearch();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const { data: rows = [], isLoading } = usePromoCodes();
  const createMutation = useCreatePromoCode();
  const updateMutation = useUpdatePromoCode();
  const deleteMutation = useDeletePromoCode();
  const form = useForm<PromoForm>({
    defaultValues: {
      promoCode: "",
      category: "TICKET_DISCOUNTS",
      description: "",
      maxlimit: 20,
      usageCount: 0,
      discountType: "PERCENTAGE",
      discountAmount: 10,
      minOrderAmount: 0,
      startsAt: "",
      expiresAt: "",
      isActive: true,
    },
  });
  async function createOne(values: PromoForm) {
    await createMutation.mutateAsync({
      ...values,
      maxlimit: Number(values.maxlimit),
      usageCount: Number(values.usageCount),
      discountAmount: Number(values.discountAmount),
      minOrderAmount: Number(values.minOrderAmount || 0),
      startsAt: values.startsAt || undefined,
      expiresAt: values.expiresAt || undefined,
    });
    form.reset();
    setOpen(false);
  }
  async function toggle(item: any) {
    await updateMutation.mutateAsync({ id: item.id, payload: { isActive: !item.isActive } });
  }
  async function remove(item: any) {
    await deleteMutation.mutateAsync(item.id);
  }
  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);

  const filtered = rows
    .filter((r) => r.promoCode.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => (statusFilter === "ALL" ? true : statusFilter === "ACTIVE" ? r.isActive : !r.isActive));
  const columns: ColumnDef<any>[] = [
    { accessorKey: "promoCode", header: "Code" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "discountType", header: "Discount Type" },
    { accessorKey: "discountAmount", header: "Discount Amount", cell: ({ row }) => `${row.original.discountAmount}` },
    { accessorKey: "minOrderAmount", header: "Min Order", cell: ({ row }) => `${row.original.minOrderAmount ?? 0}` },
    { accessorKey: "maxlimit", header: "Usage Limit" },
    { accessorKey: "usageCount", header: "Used Count" },
    { accessorKey: "expiresAt", header: "Expiry Date", cell: ({ row }) => row.original.expiresAt ? new Date(row.original.expiresAt).toLocaleDateString() : "-" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge variant={row.original.isActive ? "success" : "neutral"}>{row.original.isActive ? "ACTIVE" : "INACTIVE"}</StatusBadge> },
    { id: "actions", header: "", cell: ({ row }) => <ActionDropdown actions={[{ label: row.original.isActive ? "Disable" : "Enable", onClick: () => { void toggle(row.original); } }, { label: "Delete", destructive: true, onClick: () => { void remove(row.original); } }]} /> },
  ];
  return (
    <PageLayout title="Promo Codes" description="Configure discount campaigns and usage limits">
      <div className="space-y-4">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          onCreate={() => setOpen(true)}
          createLabel="Create Promo Code"
          filters={(
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          )}
        />
        <DataTable columns={columns} data={filtered} loading={isLoading} />
      </div>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Create Promo Code"
        size="md"
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit((values) => { void createOne(values); })} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </>
        )}
      >
        <form className="grid gap-3 md:grid-cols-2">
          <ShortTextInput control={form.control} name="promoCode" label="Code" required />
          <SelectInput
            control={form.control}
            name="category"
            label="Category"
            options={[
              { label: "Ticket Discounts", value: "TICKET_DISCOUNTS" },
              { label: "Food & Snacks", value: "FOOD_SNACKS" },
              { label: "Premium Upgrades", value: "PREMIUM_UPGRADES" },
              { label: "Student Offers", value: "STUDENT_OFFERS" },
              { label: "Weekend Deals", value: "WEEKEND_DEALS" },
            ]}
          />
          <ShortTextInput control={form.control} name="description" label="Description" />
          <NumberInput control={form.control} name="maxlimit" label="Usage Limit" required />
          <NumberInput control={form.control} name="usageCount" label="Used Count" />
          <SelectInput
            control={form.control}
            name="discountType"
            label="Discount Type"
            options={[
              { label: "PERCENTAGE", value: "PERCENTAGE" },
              { label: "AMOUNT", value: "AMOUNT" },
              { label: "FREE_TICKET", value: "FREE_TICKET" },
            ]}
          />
          <NumberInput control={form.control} name="discountAmount" label="Discount Amount" required />
          <NumberInput control={form.control} name="minOrderAmount" label="Minimum Order Amount" />
          <DateInput control={form.control} name="startsAt" label="Starts At" />
          <DateInput control={form.control} name="expiresAt" label="Expires At" />
          <div className="md:col-span-2">
            <ToggleInput control={form.control} name="isActive" label="Active" />
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
