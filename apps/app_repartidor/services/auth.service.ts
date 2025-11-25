import api from './api';
import { setItem, removeItem, getItem } from './storage';
import { useAuthStore } from '../src/stores/authStore';

interface LoginPayload {
  email: string;
  password: string;
}

class AuthService {
  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload);
    if (data.user.role !== 'COURIER') {
      throw new Error('Esta aplicación es exclusiva para repartidores.');
    }

    await setItem('accessToken', data.accessToken);
    await setItem('refreshToken', data.refreshToken);
    useAuthStore.getState().login(data.user, data.accessToken, data.refreshToken);
    return data.user;
  }

  async logout() {
    await removeItem('accessToken');
    await removeItem('refreshToken');
    useAuthStore.getState().logout();
  }

  async isAuthenticated() {
    const token = await getItem('accessToken');
    return Boolean(token && useAuthStore.getState().user);
  }
}

export default new AuthService();
