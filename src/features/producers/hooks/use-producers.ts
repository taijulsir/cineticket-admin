import { producersApi } from "@/features/producers/api/producers.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProducers() {
  return useQuery({ queryKey: ["producers"], queryFn: producersApi.list });
}

export function useArchiveProducer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchive }: { id: string; isArchive: boolean }) => producersApi.archive(id, isArchive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["producers"] }),
  });
}
