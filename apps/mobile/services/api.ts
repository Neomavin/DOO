import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../src/stores/authStore';
import { getItem, removeItem, setItem } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

console.log('🔌 API_URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Aumentado a 15 segundos
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
  console.error('❌ Error de API:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    message: error.message,
  });

  if (error.response) {
    const message =
      (error.response.data as any)?.message ||
      `Error ${error.response.status}: ${error.response.statusText || 'Solicitud fallida'}`;
    const err = new Error(message);
    (err as any).status = error.response.status;
    (err as any).response = error.response;
    return err;
  }
  if (error.request) {
    console.error('❌ No se pudo conectar al servidor. URL:', API_URL);
    return new Error('No pudimos comunicarnos con el servidor. Verifica que el backend esté corriendo en ' + API_URL);
  }
  return new Error(error.message || 'Ocurrió un error inesperado.');
};

// Interceptor de request: agregar token y logging
api.interceptors.request.use(
  async (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = await getItem('accessToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
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
  }
);

export default api;
