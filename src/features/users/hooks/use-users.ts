import { usersApi } from "@/features/users/api/users.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useEmployees() {
  return useQuery({ queryKey: ["employees"], queryFn: usersApi.listEmployees });
}

export function useArchiveEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchive }: { id: string; isArchive: boolean }) => usersApi.archiveEmployee(id, isArchive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useCustomers() {
  return useQuery({ queryKey: ["customers"], queryFn: usersApi.listCustomers });
}

export function useArchiveCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersApi.archiveCustomer(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
