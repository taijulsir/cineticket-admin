"use client";

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login as loginApi, logout as logoutApi } from '@/lib/api/authApi';
import { clearStoredTokens, getStoredAccessToken, getStoredRefreshToken } from '@/lib/api/apiClient';
import type { Employee, LoginPayload, RegisterPayload } from '@/types';

type JwtPayload = { sub: string; email: string; role: 'Admin' | 'Employee' | 'Customer' };

interface AuthContextValue {
  employee: Employee | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  setIsLoading: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodePayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

function buildEmployee(accessToken: string, refreshToken: string): Employee | null {
  const payload = decodePayload(accessToken);
  if (!payload) return null;
  return {
    _id: payload.sub,
    name: payload.email,
    email: payload.email,
    level: payload.role === 'Admin' ? 'admin' : payload.role === 'Employee' ? 'employee' : 'producer',
    token: accessToken,
    refreshToken,
  } as Employee;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(() => {
    if (typeof window === 'undefined') return null;
    const access = getStoredAccessToken();
    const refresh = getStoredRefreshToken();
    if (!access || !refresh) return null;
    return buildEmployee(access, refresh);
  });

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      setIsLoading(true);
      const tokens = await loginApi({ email: payload.email, password: payload.password, role: 'Admin' });
      const user = buildEmployee(tokens.accessToken, tokens.refreshToken);
      setEmployee(user);
      toast.success('Logged in successfully');
      router.replace('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (_payload: RegisterPayload) => {
    toast.error('Register flow is not available in admin panel.');
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    clearStoredTokens();
    setEmployee(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(() => ({ employee, isLoading, login, register, logout, setIsLoading }), [employee, isLoading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
