import { apiClient, unwrap } from './apiClient';

export const settingsApi = {
  listHeroSliders: () => apiClient.get('/admin/hero-sliders').then((r) => unwrap<any[]>(r.data)),
  createHeroSlider: (payload: { eventId: string; precedence: number }) => apiClient.post('/admin/hero-sliders', payload).then((r) => unwrap<any>(r.data)),
  updateHeroSlider: (id: string, payload: { eventId?: string; precedence?: number }) => apiClient.patch(`/admin/hero-sliders/${id}`, payload).then((r) => unwrap<any>(r.data)),
  deleteHeroSlider: (id: string) => apiClient.delete(`/admin/hero-sliders/${id}`).then((r) => unwrap<any>(r.data)),

  listAds: () => apiClient.get('/admin/ads').then((r) => unwrap<any[]>(r.data)),
  createAd: (payload: { poster: string; link: string; precedence: number }) => apiClient.post('/admin/ads', payload).then((r) => unwrap<any>(r.data)),
  updateAd: (id: string, payload: { poster?: string; link?: string; precedence?: number }) => apiClient.patch(`/admin/ads/${id}`, payload).then((r) => unwrap<any>(r.data)),
  deleteAd: (id: string) => apiClient.delete(`/admin/ads/${id}`).then((r) => unwrap<any>(r.data)),

  listSocialLinks: () => apiClient.get('/admin/social-links').then((r) => unwrap<any[]>(r.data)),
  createSocialLink: (payload: { name: string; visibility: boolean; link: string }) => apiClient.post('/admin/social-links', payload).then((r) => unwrap<any>(r.data)),
  updateSocialLink: (id: string, payload: { name?: string; visibility?: boolean; link?: string }) => apiClient.patch(`/admin/social-links/${id}`, payload).then((r) => unwrap<any>(r.data)),
  deleteSocialLink: (id: string) => apiClient.delete(`/admin/social-links/${id}`).then((r) => unwrap<any>(r.data)),
};
