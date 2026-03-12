"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { useConfirm } from "@/hooks/use-confirm";
import { eventsApi } from "@/features/events/api/events.api";
import { appToast } from "@/lib/toast";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function EventStatusPage() {
  const params = useParams<{ status: string }>();
  const statusParam = params?.status ?? "upcoming";
  const status = statusParam.toUpperCase();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ["events", "status", status], queryFn: eventsApi.list });
  const archive = useMutation({
    mutationFn: eventsApi.remove,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["events"] }); appToast.success("Event archived"); },
    onError: () => appToast.error("Failed to archive event"),
  });
  const rows = (data ?? []).filter((event: any) => event.status?.toUpperCase() === status || status === "ALL");
  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "organizer", header: "Organizer" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge variant="info">{row.original.status}</StatusBadge> },
    { id: "actions", header: "", cell: ({ row }) => <ActionDropdown actions={[{ label: "View Orders", onClick: () => router.push(`/orders?eventId=${row.original.id}`) }, { label: "Archive", destructive: true, onClick: async () => { const ok = await confirm({ title: "Archive Event", description: "This action cannot be undone.", destructive: true }); if (ok) archive.mutate(row.original.id); } }]} /> },
  ];

  return (
    <PageLayout title={`${statusParam} Events`} description="Status-based event operations">
      <DataTable columns={columns} data={rows} loading={isLoading} />
    </PageLayout>
  );
}
