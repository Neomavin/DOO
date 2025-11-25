import api from './api';
import { useAuthStore } from '../src/stores/authStore';
import { setItem, getItem, removeItem } from './storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

type Credentials = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    avatarUrl?: string;
  };
}

class AuthService {
  private saveSession(response: AuthResponse) {
    useAuthStore.getState().login(response.user, response.accessToken, response.refreshToken);
  }

  private async persistTokens(accessToken: string, refreshToken: string) {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  async login(credentials: Credentials) {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    await this.persistTokens(data.accessToken, data.refreshToken);
    this.saveSession(data);
    return data;
  }

  async register(payload: RegisterPayload) {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    await this.persistTokens(data.accessToken, data.refreshToken);
    this.saveSession(data);
    return data;
  }

  async requestPasswordReset(email: string) {
    await api.post('/auth/forgot-password', { email });
  }

  async logout() {
    await removeItem(ACCESS_TOKEN_KEY);
    await removeItem(REFRESH_TOKEN_KEY);
    useAuthStore.getState().logout();
  }

  async getAccessToken() {
    return getItem(ACCESS_TOKEN_KEY);
  }

  async getRefreshToken() {
    return getItem(REFRESH_TOKEN_KEY);
  }

  async getProfile() {
    const { data } = await api.get('/auth/me');
    useAuthStore.getState().updateUser(data);
    return data;
  }

  async isAuthenticated() {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export default new AuthService();
