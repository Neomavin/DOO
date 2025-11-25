import api from './api';
import type { User } from '../src/stores/authStore';

class UserService {
  async getProfile() {
    const { data } = await api.get<User>('/users/me');
    return data;
  }

  async updateProfile(payload: Partial<{ name: string; phone: string; email: string; avatarUrl: string }>) {
    const { data } = await api.patch<User>('/users/profile', payload);
    return data;
  }
}

export default new UserService();
