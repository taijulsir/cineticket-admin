import { apiClient, unwrap } from './apiClient';

export function getTheaters() {
  return apiClient.get('/admin/theaters').then((r) => unwrap<any[]>(r.data));
}

export function getHalls() {
  return apiClient.get('/admin/halls').then((r) => unwrap<any[]>(r.data));
}

export function getHallSeats(hallId: string) {
  return apiClient.get(`/admin/halls/${hallId}/seats`).then((r) => unwrap<any[]>(r.data));
}

export function createTheater(payload: Record<string, unknown>) {
  return apiClient.post('/admin/theaters', payload).then((r) => unwrap<any>(r.data));
}

export function createHall(payload: Record<string, unknown>) {
  return apiClient.post('/admin/halls', payload).then((r) => unwrap<any>(r.data));
}

export function createHallSeat(payload: Record<string, unknown>) {
  return apiClient.post('/admin/hall-seats', payload).then((r) => unwrap<any>(r.data));
}

export function updateHallSeat(id: string, payload: Record<string, unknown>) {
  return apiClient.patch(`/admin/hall-seats/${id}`, payload).then((r) => unwrap<any>(r.data));
}

export function archiveHall(id: string) {
  return apiClient.patch(`/admin/halls/${id}/archive`).then((r) => unwrap<any>(r.data));
}

export function deleteHall(id: string) {
  return apiClient.delete(`/admin/halls/${id}`).then((r) => unwrap<any>(r.data));
}
