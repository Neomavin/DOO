import api from '@/lib/api';
import type { User } from '@/types';

type AuthResponse = {
  accessToken: string;
  user: User;
};

const persistSession = (data: AuthResponse) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=Lax`;
};

const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  document.cookie = 'accessToken=; path=/; max-age=0;';
};

class AuthService {
  async login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    persistSession(data);
    return data;
  }

  async register(payload: { name: string; email: string; password: string; phone?: string }) {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      ...payload,
      role: 'RESTAURANT',
    });
    persistSession(data);
    return data;
  }

  async requestPasswordReset(email: string) {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    await api.post('/auth/reset-password', { token, password });
  }

  logout() {
    clearSession();
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  }
}

const authService = new AuthService();
export default authService;
