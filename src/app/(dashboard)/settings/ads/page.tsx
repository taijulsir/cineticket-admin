"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { NumberInput, ShortTextInput } from "@/components/ui/form";
import { settingsApi } from "@/lib/api/settingsApi";
import { appToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = { poster: string; link: string; precedence: number | string };

export default function AdsSettingsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);

  const rowsQuery = useQuery({ queryKey: ["settings-ads"], queryFn: settingsApi.listAds });
  const form = useForm<FormValues>({ defaultValues: { poster: "", link: "", precedence: 1 } });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { poster: values.poster, link: values.link, precedence: Number(values.precedence) };
      return edit ? settingsApi.updateAd(edit.id, payload) : settingsApi.createAd(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-ads"] });
      appToast.success(edit ? "Ad updated" : "Ad created");
      setOpen(false);
      setEdit(null);
      form.reset({ poster: "", link: "", precedence: 1 });
    },
    onError: () => appToast.error("Failed to save ad"),
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteAd,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-ads"] });
      appToast.success("Ad deleted");
    },
    onError: () => appToast.error("Failed to delete ad"),
  });

  const columns: ColumnDef<any>[] = [
    { accessorKey: "poster", header: "Poster", cell: ({ row }) => row.original.poster },
    { accessorKey: "link", header: "Link" },
    { accessorKey: "precedence", header: "Precedence" },
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
                form.reset({ poster: row.original.poster, link: row.original.link, precedence: row.original.precedence });
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
    <PageLayout title="Advertisements" description="Manage ad placements across the site" actions={<Button onClick={() => { setEdit(null); form.reset({ poster: "", link: "", precedence: 1 }); setOpen(true); }}>Create Ad</Button>}>
      <DataTable columns={columns} data={rowsQuery.data ?? []} loading={rowsQuery.isLoading} />

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={edit ? "Edit Advertisement" : "Create Advertisement"}
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={form.handleSubmit((v) => saveMutation.mutate(v))}>{edit ? "Update" : "Create"}</Button></>}
      >
        <form className="grid gap-3 md:grid-cols-2">
          <ShortTextInput control={form.control} name="poster" label="Poster URL" required />
          <ShortTextInput control={form.control} name="link" label="Target Link" required />
          <NumberInput control={form.control} name="precedence" label="Precedence" />
        </form>
      </Modal>
    </PageLayout>
  );
}
