import { feesApi } from "@/features/fees/api/fees.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFees() {
  return useQuery({ queryKey: ["fees"], queryFn: feesApi.list });
}

export function useArchiveFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchive }: { id: string; isArchive: boolean }) => feesApi.archive(id, isArchive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fees"] }),
  });
}
