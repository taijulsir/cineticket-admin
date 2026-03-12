import { apiClient, unwrap } from './apiClient';

export function getPromoCodes() {
  return apiClient.get('/admin/promo-codes').then((r) => unwrap<any[]>(r.data));
}

export function createPromoCode(payload: Record<string, unknown>) {
  return apiClient.post('/admin/promo-codes', payload).then((r) => unwrap<any>(r.data));
}

export function updatePromoCode(id: string, payload: Record<string, unknown>) {
  return apiClient.patch(`/admin/promo-codes/${id}`, payload).then((r) => unwrap<any>(r.data));
}

export function deletePromoCode(id: string) {
  return apiClient.delete(`/admin/promo-codes/${id}`).then((r) => unwrap<any>(r.data));
}

export function getPendingOrdersAdmin() {
  return apiClient.get('/admin/orders/pending').then((r) => unwrap<any[]>(r.data));
}
