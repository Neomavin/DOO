import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../src/stores/authStore';
import { getItem, removeItem, setItem } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.3:4000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
    isAvailable?: boolean | null;
    vehicleType?: string | null;
  };
};

type AxiosRequestWithRetry = AxiosRequestConfig & { _retry?: boolean };

const logout = async () => {
  await removeItem('accessToken');
  await removeItem('refreshToken');
  useAuthStore.getState().logout();
};

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = await getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const { data } = await refreshClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  await setItem('accessToken', data.accessToken);
  await setItem('refreshToken', data.refreshToken);
  useAuthStore.getState().login(data.user, data.accessToken, data.refreshToken);
  return data.accessToken;
};

const formatAxiosError = (error: AxiosError) => {
  if (error.response) {
    const message =
      (error.response.data as any)?.message ||
      `Error ${error.response.status}: ${error.response.statusText || 'Solicitud fallida'}`;
    const err = new Error(message);
    (err as any).status = error.response.status;
    return err;
  }
  if (error.request) {
    return new Error('No pudimos comunicarnos con el servidor. Verifica tu conexión.');
  }
  return new Error(error.message || 'Ocurrió un error inesperado.');
};

api.interceptors.request.use(
  async (config) => {
    const token = await getItem('accessToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestWithRetry;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await logout();
        return Promise.reject(formatAxiosError(error));
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      await logout();
    }

    return Promise.reject(formatAxiosError(error));
  },
);

export default api;
