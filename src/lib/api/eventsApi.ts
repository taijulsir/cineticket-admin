import { apiClient, unwrap } from './apiClient';

export type EventQuery = { page?: number; limit?: number; status?: string };

export function getEvents(params: EventQuery = {}) {
  return apiClient.get('/events', { params }).then((r) => unwrap<{ data: any[]; meta: any }>(r.data));
}

export function createEvent(payload: Record<string, unknown>) {
  return apiClient.post('/admin/events', payload).then((r) => unwrap<any>(r.data));
}

export function updateEvent(id: string, payload: Record<string, unknown>) {
  return apiClient.patch(`/admin/events/${id}`, payload).then((r) => unwrap<any>(r.data));
}

export function deleteEvent(id: string) {
  return apiClient.delete(`/admin/events/${id}`).then((r) => unwrap<any>(r.data));
}
