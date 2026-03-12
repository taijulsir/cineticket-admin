import { apiClient, unwrap } from './apiClient';

export type OrdersQuery = { page?: number; limit?: number; customerId?: string };

export function getOrders(params: OrdersQuery = {}) {
  return apiClient.get('/orders', { params }).then((r) => unwrap<{ data: any[]; meta: any }>(r.data));
}
