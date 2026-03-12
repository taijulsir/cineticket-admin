import { customersApi } from "@/features/customers/api/customers.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustomerStatus } from "@/types";

const QUERY_KEY = "customers";

export function useCustomerList() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: customersApi.list,
  });
}

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateCustomerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerStatus }) =>
      customersApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
