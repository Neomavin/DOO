import api from './api';

export type CourierOrderStatus =
  | 'NEW'
  | 'READY'
  | 'ACCEPTED'
  | 'ON_ROUTE'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

export interface LocationPoint {
  lat: number;
  lng: number;
}

export interface CourierOrder {
  id: string;
  status: CourierOrderStatus;
  totalCents: number;
  deliveryCents?: number;
  restaurant: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address?: string;
  };
  address: {
    id: string;
    label: string;
    line1: string;
    line2?: string | null;
    city?: string;
    lat: number;
    lng: number;
    contactName?: string;
    contactPhone?: string;
  };
  user?: {
    id: string;
    name: string;
    phone?: string;
  };
  confirmationCode?: string | null;
  notes?: string | null;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
}

export interface EarningsSummary {
  totalDeliveries: number;
  totalEarnedCents: number;
  period?: string;
}

class OrdersService {
  async getAvailableOrders() {
    const { data } = await api.get<CourierOrder[]>('/couriers/available-orders');
    return data;
  }

  async getActiveOrder() {
    const { data } = await api.get<CourierOrder | null>('/couriers/active-order');
    return data;
  }

  async acceptOrder(orderId: string) {
    const { data } = await api.post<CourierOrder>(`/couriers/orders/${orderId}/accept`);
    return data;
  }

  async rejectOrder(orderId: string) {
    const { data } = await api.post(`/couriers/orders/${orderId}/reject`);
    return data;
  }

  async markPickedUp(orderId: string) {
    const { data } = await api.patch<CourierOrder>(`/couriers/orders/${orderId}/pickup`);
    return data;
  }

  async markDelivered(orderId: string, code: string) {
    const { data } = await api.patch<CourierOrder>(`/couriers/orders/${orderId}/deliver`, {
      confirmationCode: code,
    });
    return data;
  }

  async getOrderById(orderId: string) {
    const { data } = await api.get<CourierOrder>(`/couriers/orders/${orderId}`);
    return data;
  }

  async getHistory() {
    const { data } = await api.get<CourierOrder[]>('/couriers/history');
    return data;
  }

  async getEarnings() {
    const { data } = await api.get<EarningsSummary>('/couriers/earnings');
    return data;
  }

  async toggleAvailability(isAvailable: boolean) {
    const { data } = await api.patch<{ isAvailable: boolean }>('/couriers/availability', {
      isAvailable,
    });
    return data;
  }
}

export default new OrdersService();
