import { createContext, useContext, useEffect, useState } from 'react';
import api, { registerTokenListener } from '../services/api';

const AuthContext = createContext(null);

const storageKeys = {
  access: 'accessToken',
  refresh: 'refreshToken',
  user: 'userProfile'
};

// =================================================================================================
// Auth Provider Component
// -------------------------------------------------------------------------------------------------
// Managed global authentication state.
// - Initializes state from localStorage.
// - Syncs state changes back to localStorage.
// - Listens to API interceptor events for auto-logout or token refresh.
// =================================================================================================

export function AuthProvider({ children }) {
  // =================================================================================================
  // State Initialization
  // -------------------------------------------------------------------------------------------------
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(storageKeys.access) || null
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem(storageKeys.refresh) || null
  );
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(storageKeys.user);
    return cached ? JSON.parse(cached) : null;
  });
  // State Initialization ends here

  // =================================================================================================
  // Persistence & Synchronization Effects
  // -------------------------------------------------------------------------------------------------

  // Persist to storage
  useEffect(() => {
    if (accessToken) localStorage.setItem(storageKeys.access, accessToken);
    else localStorage.removeItem(storageKeys.access);
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) localStorage.setItem(storageKeys.refresh, refreshToken);
    else localStorage.removeItem(storageKeys.refresh);
  }, [refreshToken]);

  useEffect(() => {
    if (user) localStorage.setItem(storageKeys.user, JSON.stringify(user));
    else localStorage.removeItem(storageKeys.user);
  }, [user]);

  // Sync with API-driven token refresh/logout
  useEffect(() => {
    const unsubscribe = registerTokenListener((payload) => {
      if (payload?.forceLogout) {
        logout();
        return;
      }
      if (payload?.accessToken) setAccessToken(payload.accessToken);
      if (payload?.refreshToken !== undefined) setRefreshToken(payload.refreshToken);
      if (payload?.user !== undefined) setUser(payload.user);
    });

    return unsubscribe;
  }, []);
  // Persistence & Synchronization Effects ends here

  // =================================================================================================
  // Auth Actions
  // -------------------------------------------------------------------------------------------------
  const login = (payload) => {
    setAccessToken(payload?.accessToken || null);
    setRefreshToken(payload?.refreshToken || null);
    setUser(payload?.user || null);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/user/me');
      if (res.data.user) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Failed to refresh user profile", error);
    }
  };
  // Auth Actions ends here

  // Auto-refresh user profile on mount if token exists
  useEffect(() => {
    if (accessToken) {
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshToken, user, login, logout, refreshUser }}
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

