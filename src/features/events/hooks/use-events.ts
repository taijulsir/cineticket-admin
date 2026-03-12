import { eventsApi } from "@/features/events/api/events.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useEvents() {
  return useQuery({ queryKey: ["events"], queryFn: eventsApi.list });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => eventsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: eventsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

