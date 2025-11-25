import api from '@/lib/api';

interface Schedule {
  openTime: string;
  closeTime: string;
  closedDays: string[];
}

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  openTime: string;
  closeTime: string;
  closedDays: string[];
  isOpen: boolean;
  deliveryRadius?: number;
}

class RestaurantsService {
  async get(restaurantId: string) {
    const { data } = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
    return data;
  }

  async update(restaurantId: string, payload: Partial<Restaurant>) {
    const { data } = await api.patch<Restaurant>(`/restaurants/${restaurantId}`, payload);
    return data;
  }

  async updateSchedule(restaurantId: string, schedule: Schedule) {
    const { data } = await api.patch<Restaurant>(
      `/restaurants/${restaurantId}/schedule`,
      schedule
    );
    return data;
  }

  async toggleOpen(restaurantId: string, isOpen: boolean) {
    const { data } = await api.patch<Restaurant>(`/restaurants/${restaurantId}`, { isOpen });
    return data;
  }
}

export default new RestaurantsService();
