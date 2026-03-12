import { promoCodesApi } from "@/features/promo-codes/api/promo-codes.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePromoCodes() {
  return useQuery({ queryKey: ["promo-codes"], queryFn: promoCodesApi.list });
}

export function useCreatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promoCodesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo-codes"] }),
  });
}

export function useUpdatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => promoCodesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo-codes"] }),
  });
}

export function useDeletePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promoCodesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promo-codes"] }),
  });
}
