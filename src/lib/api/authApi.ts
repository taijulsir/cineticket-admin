import { apiClient, clearStoredTokens, setStoredTokens, unwrap } from './apiClient';

export type LoginInput = { email: string; password: string; role?: 'Admin' | 'Employee' | 'Customer' };

export async function login(input: LoginInput) {
  const res = await apiClient.post('/auth/login', {
    email: input.email,
    password: input.password,
    role: input.role ?? 'Admin',
  });
  const data = unwrap<{ accessToken: string; refreshToken: string; expiresIn: string }>(res.data);
  setStoredTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('ct_refresh_token');
  if (!refreshToken) throw new Error('Missing refresh token');
  const res = await apiClient.post('/auth/refresh', { refreshToken });
  const data = unwrap<{ accessToken: string; refreshToken: string }>(res.data);
  setStoredTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function logout() {
  const refreshToken = localStorage.getItem('ct_refresh_token');
  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // keep client logout deterministic
    }
  }
  clearStoredTokens();
}
