import { createPromoCode, deletePromoCode, getPromoCodes, updatePromoCode } from "@/lib/api/promoCodesApi";

export const promoCodesApi = {
  list: getPromoCodes,
  create: createPromoCode,
  update: updatePromoCode,
  remove: deletePromoCode,
};
