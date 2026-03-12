"use client";

import { ActionDropdown } from "@/components/admin/action-dropdown";
import { DataTable } from "@/components/admin/data-table";
import { PageLayout } from "@/components/admin/page-layout";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateInput, FileUploadInput, SelectInput, ShortTextInput, TextareaInput } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/features/events/api/events.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { usePermission } from "@/hooks/use-permission";
import { appToast } from "@/lib/toast";
import { useConfirm } from "@/hooks/use-confirm";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  releaseType: z.enum(["THEATRICAL", "PRIVATE_SCREEN"]),
  trailerVideoLink: z.string().url(),
  status: z.enum(["UPCOMING", "NOW_SELLING", "PAST", "VOTE_TO_BRING"]),
  description: z.string().min(5),
  location: z.string().min(2),
  organizer: z.string().min(2),
  type: z.enum(["MOVIE", "OTHERS"]),
  bannerImage: z.any().optional(),
  releaseDate: z.string().min(1),
  duration: z.string().min(1),
  eventCurrency: z.string().min(1),
  poster: z.any().optional(),
});
type FormValues = z.infer<typeof schema>;

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api").replace(/\/api\/?$/, "");

function toPreviewUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function resolvePosterPreview(event: any) {
  return toPreviewUrl(event.cardImage ?? event.posterUrl ?? event.poster ?? event.bannerImage);
}

export default function EventsPage() {
  const { can } = usePermission();
  const { confirm } = useConfirm();
  const { value: globalSearch } = useGlobalSearch();
  const qc = useQueryClient();
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      releaseType: "THEATRICAL",
      trailerVideoLink: "",
      status: "UPCOMING",
      description: "",
      location: "",
      organizer: "",
      type: "MOVIE",
      bannerImage: null,
      releaseDate: new Date().toISOString().slice(0, 10),
      duration: "",
      eventCurrency: "AUD",
      poster: null,
    },
  });
  const query = useQuery({ queryKey: ["events", page], queryFn: eventsApi.list });
  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);

  const rows = (query.data ?? [])
    .filter((r: any) => r.name.toLowerCase().includes(search.toLowerCase()))
    .filter((r: any) => (statusFilter === "ALL" ? true : r.status === statusFilter));
  const mutate = useMutation({
    mutationFn: async (values: FormValues) => {
      let posterUrl: string | undefined;
      if (values.poster instanceof File) {
        posterUrl = await eventsApi.uploadPoster(values.poster);
      } else if (typeof values.poster === "string" && values.poster.length) {
        posterUrl = values.poster;
      }
      let bannerImageUrl: string | undefined;
      if (values.bannerImage instanceof File) {
        bannerImageUrl = await eventsApi.uploadPoster(values.bannerImage);
      } else if (typeof values.bannerImage === "string" && values.bannerImage.length) {
        bannerImageUrl = values.bannerImage;
      }
      if (!bannerImageUrl) throw new Error("Banner image is required");
      const payload = {
        name: values.name,
        slug: values.slug,
        releaseType: values.releaseType,
        trailerVideoLink: values.trailerVideoLink,
        status: values.status,
        description: values.description,
        location: values.location,
        organizer: values.organizer,
        type: values.type,
        bannerImage: bannerImageUrl,
        releaseDate: new Date(values.releaseDate).toISOString(),
        duration: values.duration,
        eventCurrency: values.eventCurrency,
        posterUrl,
        cardImage: posterUrl ?? edit?.cardImage ?? bannerImageUrl,
      };
      return edit ? eventsApi.update(edit.id, payload) : eventsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      setOpen(false);
      setEdit(null);
      form.reset();
      appToast.success(edit ? "Event updated successfully" : "Event created successfully");
    },
    onError: (error: any) => appToast.error(error?.message ?? "Failed to save event"),
  });
  const remove = useMutation({
    mutationFn: eventsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); appToast.success("Event deleted successfully"); },
    onError: () => appToast.error("Failed to delete event"),
  });
  const columns: ColumnDef<any>[] = useMemo(() => [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge variant={row.original.status === "NOW_SELLING" ? "success" : row.original.status === "UPCOMING" ? "info" : "neutral"}>{row.original.status}</StatusBadge> },
    { accessorKey: "releaseDate", header: "Release Date", cell: ({ row }) => new Date(row.original.releaseDate).toLocaleDateString() },
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
                const event = row.original;
                setEdit(event);
                setOpen(true);
                form.reset({
                  name: event.name,
                  slug: event.slug,
                  releaseType: event.releaseType,
                  trailerVideoLink: event.trailerVideoLink,
                  status: event.status,
                  description: event.description,
                  location: event.location,
                  organizer: event.organizer,
                  type: event.type,
                  bannerImage: toPreviewUrl(event.bannerImage),
                  releaseDate: new Date(event.releaseDate).toISOString().slice(0, 10),
                  duration: event.duration,
                  eventCurrency: event.eventCurrency ?? "AUD",
                  poster: resolvePosterPreview(event),
                });
              },
            },
            {
              label: "Archive/Delete",
              destructive: true,
              onClick: async () => {
                const ok = await confirm({ title: "Delete Event", description: "This action cannot be undone.", destructive: true });
                if (ok) remove.mutate(row.original.id);
              },
            },
          ]}
        />
      ),
    },
  ], [confirm, form, remove]);

  return (
    <PageLayout
      title="Events"
      description="Manage movie events lifecycle"
      actions={can("events.create") ? <Button onClick={() => { setEdit(null); form.reset(); setOpen(true); }}>Create Event</Button> : undefined}
    >
      <div className="space-y-4">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          filters={(
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="NOW_SELLING">Now Selling</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PAST">Past</option>
              <option value="VOTE_TO_BRING">Vote To Bring</option>
            </select>
          )}
        />
        <DataTable columns={columns} data={rows} loading={query.isLoading} />
      </div>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={edit ? "Edit Event" : "Create Event"}
        size="xl"
        bodyClassName="max-h-[68vh]"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={form.handleSubmit((v) => mutate.mutate(v))}>{edit ? "Update" : "Create"}</Button></>}
      >
        <form className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <ShortTextInput control={form.control} name="name" label="Event Name" placeholder="Enter event name" required />
          <ShortTextInput control={form.control} name="slug" label="Slug" placeholder="event-slug" required />
          <SelectInput control={form.control} name="releaseType" label="Release Type" options={[{ label: "THEATRICAL", value: "THEATRICAL" }, { label: "PRIVATE_SCREEN", value: "PRIVATE_SCREEN" }]} />
          <ShortTextInput control={form.control} name="trailerVideoLink" label="Trailer URL" placeholder="https://..." required />
          <SelectInput control={form.control} name="status" label="Status" options={[{ label: "NOW_SELLING", value: "NOW_SELLING" }, { label: "UPCOMING", value: "UPCOMING" }, { label: "PAST", value: "PAST" }, { label: "VOTE_TO_BRING", value: "VOTE_TO_BRING" }]} />
          <SelectInput control={form.control} name="type" label="Type" options={[{ label: "MOVIE", value: "MOVIE" }, { label: "OTHERS", value: "OTHERS" }]} />
          <ShortTextInput control={form.control} name="location" label="Location" required />
          <ShortTextInput control={form.control} name="organizer" label="Organizer" required />
          <FileUploadInput control={form.control} name="bannerImage" label="Banner Image" helperText="Upload banner image" required />
          <DateInput control={form.control} name="releaseDate" label="Release Date" required />
          <ShortTextInput control={form.control} name="duration" label="Duration" placeholder="2h 10m" required />
          <ShortTextInput control={form.control} name="eventCurrency" label="Currency" placeholder="AUD" required />
          <div className="md:col-span-2 xl:col-span-3">
            <TextareaInput control={form.control} name="description" label="Description" required />
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <FileUploadInput control={form.control} name="poster" label="Poster" helperText="Upload poster image (preview enabled)" />
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
