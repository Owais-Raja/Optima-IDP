import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

// =================================================================================================
// Token Listener Helper
// -------------------------------------------------------------------------------------------------
// Allows the Auth Context to subscribe to token updates triggered by the interceptors.
// This ensures that login/logout state remains synced across the app even if triggered by API events.
// Optional callback so the auth store can stay in sync when tokens change here
let tokenListener = null;
export const registerTokenListener = (listener) => {
  tokenListener = listener;
  // Return unsubscribe so consumers can clean up on unmount
  return () => {
    if (tokenListener === listener) {
      tokenListener = null;
    }
  };
};
// Token Listener Helper ends here

// =================================================================================================
// Axios Instance Creation
// -------------------------------------------------------------------------------------------------
const api = axios.create({
  baseURL: API_BASE
});

// =================================================================================================
// Request Interceptor
// -------------------------------------------------------------------------------------------------
// Attaches the 'accessToken' from localStorage to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Request Interceptor ends here

// =================================================================================================
// Refresh Token Logic
// -------------------------------------------------------------------------------------------------
// Helper function to call the backend refresh endpoint when a 401 occurs.
let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  const storedRefresh = localStorage.getItem('refreshToken');
  if (!storedRefresh) throw new Error('No refresh token');

  const client = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
  });

  const res = await client.post('/auth/refresh', { refreshToken: storedRefresh });
  const newAccess = res.data?.accessToken;
  const newRefresh = res.data?.refreshToken ?? storedRefresh;
  const newUser = res.data?.user;
  if (!newAccess) throw new Error('No access token returned');

  localStorage.setItem('accessToken', newAccess);
  localStorage.setItem('refreshToken', newRefresh);

  if (tokenListener) {
    tokenListener({
      accessToken: newAccess,
      refreshToken: newRefresh,
      ...(newUser ? { user: newUser } : {})
    });
  }
  return { accessToken: newAccess, refreshToken: newRefresh };
}
// Refresh Token Logic ends here

// =================================================================================================
// Response Interceptor
// -------------------------------------------------------------------------------------------------
// Handles global error responses, specifically 401 Unauthorized.
// - If 401 received, attempts to refresh token silently.
// - If refresh fails, logs the user out.
// - Queues requests while refreshing to prevent race conditions.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;
    const isAuthError = status === 401;
    const path = original?.url || '';
    const isAuthEndpoint = path.includes('/auth/login') || path.includes('/auth/register');

    if (isAuthError && !isAuthEndpoint && !original?._retry) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken()
          .catch((err) => {
            // Bubble up logout event
            if (tokenListener) tokenListener({ accessToken: null, refreshToken: null, user: null, forceLogout: true });
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw err;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      try {
        const refreshed = await refreshPromise;
        original.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return api(original);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Unexpected error occurred';
    // eslint-disable-next-line no-console
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);
// Response Interceptor ends here

export default api;

