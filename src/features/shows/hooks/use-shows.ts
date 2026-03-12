import { showsApi } from "@/features/shows/api/shows.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useShows() {
  return useQuery({ queryKey: ["shows"], queryFn: showsApi.list });
}

export function useCreateShow() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: showsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["shows"] }) });
}

export function useUpdateShow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => showsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shows"] }),
  });
}

