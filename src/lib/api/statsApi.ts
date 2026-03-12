import { apiClient, unwrap } from './apiClient';

export function getAdminStats() {
  return apiClient.get('/admin/stats').then((r) => unwrap<{
    totalEvents: number;
    totalShows: number;
    totalOrders: number;
    todayRevenue: number;
    totalTicketsSold: number;
  }>(r.data));
}
