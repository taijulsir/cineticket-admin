import { apiClient, unwrap } from './apiClient';

export type ShowsQuery = { page?: number; limit?: number; eventId?: string; date?: string };

export function getShows(params: ShowsQuery = {}) {
  return apiClient.get('/shows', { params }).then((r) => unwrap<{ data: any[]; meta: any }>(r.data));
}

export function createShow(payload: Record<string, unknown>) {
  return apiClient.post('/admin/shows', payload).then((r) => unwrap<any>(r.data));
}

export function updateShow(id: string, payload: Record<string, unknown>) {
  return apiClient.patch(`/admin/shows/${id}`, payload).then((r) => unwrap<any>(r.data));
}

export function getSeatMap(showId: string) {
  return apiClient.get(`/shows/${showId}/seat-map`).then((r) => unwrap<{ rows: any[] }>(r.data));
}

export function getShowSeats(showId: string) {
  return apiClient.get(`/shows/${showId}/seats`).then((r) => unwrap<any[]>(r.data));
}
