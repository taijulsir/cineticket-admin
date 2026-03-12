import { locationsApi } from "@/features/locations/api/locations.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCountries() {
  return useQuery({ queryKey: ["countries"], queryFn: locationsApi.listCountries });
}

export function useArchiveCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchive }: { id: string; isArchive: boolean }) => locationsApi.archiveCountry(id, isArchive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["countries"] }),
  });
}

export function useStates() {
  return useQuery({ queryKey: ["states"], queryFn: locationsApi.listStates });
}

export function useArchiveState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchive }: { id: string; isArchive: boolean }) => locationsApi.archiveState(id, isArchive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["states"] }),
  });
}

export function useCities() {
  return useQuery({ queryKey: ["cities"], queryFn: locationsApi.listCities });
}

export function useArchiveCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isArchive }: { id: string; isArchive: boolean }) => locationsApi.archiveCity(id, isArchive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cities"] }),
  });
}
