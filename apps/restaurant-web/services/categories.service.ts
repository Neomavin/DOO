import api from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

class CategoriesService {
  async list() {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  }
}

export default new CategoriesService();
