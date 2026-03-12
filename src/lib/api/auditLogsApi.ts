import { apiClient, unwrap } from './apiClient';

export function getAuditLogs(page = 1, limit = 50) {
  return apiClient.get('/admin/audit-logs', { params: { page, limit } }).then((r) =>
    unwrap<{ data: any[]; meta: { page: number; limit: number; total: number } }>(r.data),
  );
}
