import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setAuthHelpers } from '../api/client';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTenant: (tenant: Tenant) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_ACCESS = 'cashflow_access';
const STORAGE_REFRESH = 'cashflow_refresh';
const STORAGE_USER = 'cashflow_user';
const STORAGE_TENANT = 'cashflow_tenant';

function loadStored(): Partial<AuthState> {
  try {
    const access = localStorage.getItem(STORAGE_ACCESS);
    const refresh = localStorage.getItem(STORAGE_REFRESH);
    const userStr = localStorage.getItem(STORAGE_USER);
    const tenantStr = localStorage.getItem(STORAGE_TENANT);
    return {
      accessToken: access,
      refreshToken: refresh,
      user: userStr ? JSON.parse(userStr) : null,
      tenant: tenantStr ? JSON.parse(tenantStr) : null,
      isAuthenticated: !!(access && userStr),
    };
  } catch {
    return {};
  }
}

function saveTokens(access: string, refresh: string) {
  localStorage.setItem(STORAGE_ACCESS, access);
  localStorage.setItem(STORAGE_REFRESH, refresh);
}

function saveUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_USER);
}

function saveTenant(tenant: Tenant | null) {
  if (tenant) localStorage.setItem(STORAGE_TENANT, JSON.stringify(tenant));
  else localStorage.removeItem(STORAGE_TENANT);
}

function clearStorage() {
  [STORAGE_ACCESS, STORAGE_REFRESH, STORAGE_USER, STORAGE_TENANT].forEach((k) => localStorage.removeItem(k));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    ...loadStored(),
    isAuthenticated: !!loadStored().accessToken,
  } as AuthState));

  const logout = useCallback(() => {
    clearStorage();
    setState({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  }, []);

  useEffect(() => {
    setAuthHelpers({
      getAccessToken: () => state.accessToken,
      getRefreshToken: () => state.refreshToken,
      setTokens: (access, refresh) => {
        if (refresh != null) saveTokens(access, refresh);
        else localStorage.setItem(STORAGE_ACCESS, access);
        setState((s) => ({ ...s, accessToken: access }));
      },
      logout,
    });
  }, [state.accessToken, state.refreshToken, logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: User;
      tenant?: Tenant;
    }>('/auth/login', { email, password });
    saveTokens(data.accessToken, data.refreshToken);
    saveUser(data.user);
    saveTenant(data.tenant ?? null);
    setState({
      user: data.user,
      tenant: data.tenant ?? null,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
    });
  }, []);

  const setTenant = useCallback((tenant: Tenant) => {
    saveTenant(tenant);
    setState((s) => ({ ...s, tenant }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
