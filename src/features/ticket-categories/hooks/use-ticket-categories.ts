import { ticketCategoriesApi } from "@/features/ticket-categories/api/ticket-categories.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTicketCategories() {
  return useQuery({ queryKey: ["ticket-categories"], queryFn: ticketCategoriesApi.list });
}

export function useArchiveTicketCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchive }: { id: string; isArchive: boolean }) => ticketCategoriesApi.archive(id, isArchive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ticket-categories"] }),
  });
}
