"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { NumberInput, SelectInput } from "@/components/ui/form";
import { eventsApi } from "@/features/events/api/events.api";
import { settingsApi } from "@/lib/api/settingsApi";
import { appToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = { eventId: string; precedence: number | string };

export default function HeroSlidersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);

  const rowsQuery = useQuery({ queryKey: ["settings-hero-sliders"], queryFn: settingsApi.listHeroSliders });
  const eventsQuery = useQuery({ queryKey: ["events-select"], queryFn: eventsApi.list });

  const form = useForm<FormValues>({ defaultValues: { eventId: "", precedence: 1 } });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { eventId: values.eventId, precedence: Number(values.precedence) };
      return edit ? settingsApi.updateHeroSlider(edit.id, payload) : settingsApi.createHeroSlider(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-hero-sliders"] });
      appToast.success(edit ? "Hero slider updated" : "Hero slider created");
      setOpen(false);
      setEdit(null);
      form.reset({ eventId: "", precedence: 1 });
    },
    onError: () => appToast.error("Failed to save hero slider"),
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteHeroSlider,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-hero-sliders"] });
      appToast.success("Hero slider deleted");
    },
    onError: () => appToast.error("Failed to delete hero slider"),
  });

  const columns: ColumnDef<any>[] = [
    { accessorKey: "event", header: "Event", cell: ({ row }) => row.original.event?.name ?? row.original.eventId },
    { accessorKey: "precedence", header: "Precedence" },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ActionDropdown
          actions={[
            {
              label: "Edit",
              onClick: () => {
                setEdit(row.original);
                form.reset({ eventId: row.original.eventId, precedence: row.original.precedence });
                setOpen(true);
              },
            },
            { label: "Delete", destructive: true, onClick: () => deleteMutation.mutate(row.original.id) },
          ]}
        />
      ),
    },
  ];

  return (
    <PageLayout title="Hero Sliders" description="Manage homepage carousel banners" actions={<Button onClick={() => { setEdit(null); form.reset({ eventId: "", precedence: 1 }); setOpen(true); }}>Create Slider</Button>}>
      <TableToolbar />
      <DataTable columns={columns} data={rowsQuery.data ?? []} loading={rowsQuery.isLoading} />

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={edit ? "Edit Hero Slider" : "Create Hero Slider"}
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={form.handleSubmit((v) => saveMutation.mutate(v))}>{edit ? "Update" : "Create"}</Button></>}
      >
        <form className="grid gap-3 md:grid-cols-2">
          <SelectInput control={form.control} name="eventId" label="Event" options={(eventsQuery.data ?? []).map((e: any) => ({ label: e.name, value: e.id }))} />
          <NumberInput control={form.control} name="precedence" label="Precedence" />
        </form>
      </Modal>
    </PageLayout>
  );
}
