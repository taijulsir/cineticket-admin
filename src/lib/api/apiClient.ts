import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api';
const ACCESS_KEY = 'ct_access_token';
const REFRESH_KEY = 'ct_refresh_token';

type TokenPair = { accessToken: string; refreshToken: string };

let refreshPromise: Promise<string | null> | null = null;

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getStoredAccessToken() {
  return isBrowser() ? localStorage.getItem(ACCESS_KEY) : null;
}

export function getStoredRefreshToken() {
  return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
}

export function setStoredTokens(tokens: TokenPair) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  document.cookie = `ct_access=${tokens.accessToken}; path=/; samesite=lax`;
}

export function clearStoredTokens() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  document.cookie = 'ct_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string }>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original || original._retry || error.response?.status !== 401) throw error;

    original._retry = true;
    if (!refreshPromise) refreshPromise = refreshAccessToken();
    const nextAccess = await refreshPromise;
    refreshPromise = null;
    if (!nextAccess) {
      clearStoredTokens();
      throw error;
    }
    original.headers.Authorization = `Bearer ${nextAccess}`;
    return apiClient(original);
  },
);

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    const payload = data?.data ?? data;
    if (!payload?.accessToken || !payload?.refreshToken) return null;
    setStoredTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken });
    return payload.accessToken;
  } catch {
    return null;
  }
}

export function unwrap<T>(response: { data?: { success?: boolean; data?: T; message?: string } } | any): T {
  const payload = response?.data ?? response;
  if (payload?.success === false) throw new Error(payload?.message ?? 'Request failed');
  if (payload?.success === true) return payload.data as T;
  return payload as T;
}

// Legacy compatibility exports for existing pages/services.
export function createAuthClient(): AxiosInstance {
  return axios.create({ baseURL: API_BASE_URL });
}

export function createProtectedClient(token: string, onUnauthorized?: () => void): AxiosInstance {
  const instance = axios.create({ baseURL: API_BASE_URL });
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && onUnauthorized) onUnauthorized();
      return Promise.reject(error);
    },
  );
  return instance;
}
