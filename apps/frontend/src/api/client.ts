import axios, { type AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

let getAccessToken: (() => string | null) = () => null;
let getRefreshToken: (() => string | null) = () => null;
let setTokens: ((access: string, refresh: string) => void) = () => {};
let logoutFn: (() => void) = () => {};

export function setAuthHelpers(helpers: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (access: string, refresh?: string) => void;
  logout: () => void;
}) {
  getAccessToken = helpers.getAccessToken;
  getRefreshToken = helpers.getRefreshToken;
  setTokens = helpers.setTokens;
  logoutFn = helpers.logout;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await axios.post(baseURL + '/auth/refresh', { refreshToken: refresh });
          setTokens(data.accessToken, refresh);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          logoutFn();
        }
      } else {
        logoutFn();
      }
    }
    return Promise.reject(err);
  }
);
