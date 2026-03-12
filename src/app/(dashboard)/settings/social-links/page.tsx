"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ShortTextInput, ToggleInput } from "@/components/ui/form";
import { settingsApi } from "@/lib/api/settingsApi";
import { appToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = { name: string; link: string; visibility: boolean };

export default function SocialLinksSettingsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);

  const rowsQuery = useQuery({ queryKey: ["settings-social-links"], queryFn: settingsApi.listSocialLinks });
  const form = useForm<FormValues>({ defaultValues: { name: "", link: "", visibility: true } });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => (edit ? settingsApi.updateSocialLink(edit.id, values) : settingsApi.createSocialLink(values)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-social-links"] });
      appToast.success(edit ? "Social link updated" : "Social link created");
      setOpen(false);
      setEdit(null);
      form.reset({ name: "", link: "", visibility: true });
    },
    onError: () => appToast.error("Failed to save social link"),
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteSocialLink,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings-social-links"] });
      appToast.success("Social link deleted");
    },
    onError: () => appToast.error("Failed to delete social link"),
  });

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "link", header: "Link" },
    { accessorKey: "visibility", header: "Visible", cell: ({ row }) => (row.original.visibility ? "Yes" : "No") },
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
                form.reset({ name: row.original.name, link: row.original.link, visibility: row.original.visibility });
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
    <PageLayout title="Social Links" description="Manage social media profile links" actions={<Button onClick={() => { setEdit(null); form.reset({ name: "", link: "", visibility: true }); setOpen(true); }}>Create Social Link</Button>}>
      <DataTable columns={columns} data={rowsQuery.data ?? []} loading={rowsQuery.isLoading} />

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={edit ? "Edit Social Link" : "Create Social Link"}
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={form.handleSubmit((v) => saveMutation.mutate(v))}>{edit ? "Update" : "Create"}</Button></>}
      >
        <form className="grid gap-3 md:grid-cols-2">
          <ShortTextInput control={form.control} name="name" label="Name" required />
          <ShortTextInput control={form.control} name="link" label="Link" required />
          <div className="md:col-span-2">
            <ToggleInput control={form.control} name="visibility" label="Visible" />
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
