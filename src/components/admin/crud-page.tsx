"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/admin/page-layout";
import { DataTable } from "@/components/admin/data-table";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ActionDropdown } from "@/components/admin/action-dropdown";
import { useConfirm } from "@/hooks/use-confirm";
import { appToast } from "@/lib/toast";

type CrudApi<T, TCreate = Partial<T>, TUpdate = Partial<T>> = {
  list: () => Promise<T[]>;
  create?: (payload: TCreate) => Promise<unknown>;
  update?: (id: string, payload: TUpdate) => Promise<unknown>;
  remove?: (id: string) => Promise<unknown>;
};

type CrudPageProps<T extends { _id: string }> = {
  title: string;
  entity: string;
  columns: ColumnDef<T, unknown>[];
  api: CrudApi<T>;
  createForm?: React.ReactNode;
  editForm?: React.ReactNode;
  description?: string;
  searchPlaceholder?: string;
  getRowActions?: (row: T) => Array<{ label: string; variant?: "danger"; action: () => void }>;
  onArchive?: (row: T, archive: boolean) => Promise<void>;
  archiveKey?: keyof T;
  archiveLabel?: string;
  unarchiveLabel?: string;
};

export function CrudPage<T extends { _id: string }>({
  title,
  entity,
  columns,
  api,
  createForm,
  editForm,
  description,
  searchPlaceholder,
  getRowActions,
  onArchive,
  archiveKey = "isArchive" as keyof T,
  archiveLabel = "Archive",
  unarchiveLabel = "Unarchive",
}: CrudPageProps<T>) {
  const qc = useQueryClient();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const query = useQuery({ queryKey: [entity], queryFn: api.list });
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!api.remove) return;
      const ok = await confirm({ title: `Delete ${title}`, description: "This action cannot be undone.", destructive: true, confirmLabel: "Delete" });
      if (!ok) return;
      await api.remove(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [entity] });
      appToast.success(`${title} updated`);
    },
    onError: () => appToast.error(`Failed to update ${title.toLowerCase()}`),
  });
  const archiveMutation = useMutation({
    mutationFn: async (row: T) => {
      if (!onArchive) return;
      const next = !Boolean(row[archiveKey]);
      const ok = await confirm({
        title: next ? `${archiveLabel} ${title}` : `${unarchiveLabel} ${title}`,
        description: next ? "This item will be archived." : "This item will be restored.",
        destructive: next,
        confirmLabel: next ? archiveLabel : unarchiveLabel,
      });
      if (!ok) return;
      await onArchive(row, next);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [entity] });
      appToast.success(`${title} updated`);
    },
    onError: () => appToast.error(`Failed to update ${title.toLowerCase()}`),
  });

  const tableRows = useMemo(() => {
    const rows = query.data ?? [];
    if (!search.trim()) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase()));
  }, [query.data, search]);

  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    const hasActions = !!api.remove || !!getRowActions;
    if (!hasActions) return columns;
    return [
      ...columns,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const base = getRowActions?.(row.original) ?? [];
          const actions = [
            ...base.map((a) => ({ label: a.label, destructive: a.variant === "danger", onClick: a.action })),
            ...(editForm ? [{ label: "Edit", onClick: () => { setEditing(row.original); setEditOpen(true); } }] : []),
            ...(onArchive ? [{ label: Boolean(row.original[archiveKey]) ? unarchiveLabel : archiveLabel, onClick: () => archiveMutation.mutate(row.original), destructive: !Boolean(row.original[archiveKey]) }] : []),
            ...(api.remove ? [{ label: "Delete", destructive: true, onClick: () => removeMutation.mutate(row.original._id) }] : []),
          ];
          return <ActionDropdown actions={actions} />;
        },
      },
    ];
  }, [api.remove, archiveKey, archiveLabel, archiveMutation, columns, editForm, getRowActions, onArchive, removeMutation, unarchiveLabel]);

  return (
    <PageLayout
      title={title}
      description={description}
      actions={api.create ? <Button onClick={() => setCreateOpen(true)}>Create</Button> : undefined}
    >
      <div className="space-y-4">
        <TableToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder={searchPlaceholder} />
        <DataTable columns={tableColumns} data={tableRows} loading={query.isLoading} />
      </div>
      {createForm ? (
        <Modal open={createOpen} onOpenChange={setCreateOpen} title={`Create ${title}`} size="lg">
          {createForm}
        </Modal>
      ) : null}
      {editForm ? (
        <Modal open={editOpen} onOpenChange={setEditOpen} title={`Edit ${title}`} size="lg">
          {editForm}
        </Modal>
      ) : null}
    </PageLayout>
  );
}
