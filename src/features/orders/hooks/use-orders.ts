import { ordersApi } from "@/features/orders/api/orders.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useOrders(page = 1, limit = 20) {
  return useQuery({ queryKey: ["orders", page, limit], queryFn: () => ordersApi.list(page, limit) });
}

export function useOrdersByShow(showId: string, filter: "active" | "archived" | "all" = "active") {
  return useQuery({ queryKey: ["orders", "show", showId, filter], queryFn: () => ordersApi.listByShow(showId, filter), enabled: !!showId });
}

export function useArchiveOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchive }: { id: string; isArchive: boolean }) => ordersApi.archive(id, isArchive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useSendOrderEmail() {
  return useMutation({ mutationFn: (id: string) => ordersApi.sendEmail(id) });
}

export function useSearchOrder(searchMethod: "orderId" | "transactionId", searchText: string) {
  return useQuery({
    queryKey: ["orders", "search", searchMethod, searchText],
    queryFn: () => ordersApi.searchOrder(searchMethod, searchText),
    enabled: !!searchText,
  });
}

export function useDuplicateOrders() {
  return useQuery({ queryKey: ["orders", "duplicates"], queryFn: ordersApi.duplicates });
}
