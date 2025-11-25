import api from '@/lib/api';

class AiService {
  async generateDescription(payload: { dishName: string; cuisineType?: string; ingredients?: string; tone?: string }) {
    const { data } = await api.post<{ text: string }>('/ai/descriptions', payload);
    return data;
  }
}

export default new AiService();
