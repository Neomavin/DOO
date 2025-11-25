import api from '@/lib/api';
import type { Order, OrderItem } from '@/types';

type ApiOrder = Order & {
  totalCents: number;
  user?: { name?: string };
  items: Array<
    OrderItem & {
      priceCents?: number;
    }
  >;
};

const mapOrder = (order: ApiOrder): Order => ({
  id: order.id,
  customerName: order.user?.name ?? 'Cliente',
  status: order.status,
  createdAt: order.createdAt,
  eta: order.eta,
  totalCents: order.totalCents,
  total: order.totalCents / 100,
  items: order.items?.map((item) => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    price: item.price ?? (item.priceCents ?? 0) / 100,
  })) ?? [],
});

class OrdersService {
  async list(restaurantId: string) {
    const { data } = await api.get<ApiOrder[]>(`/restaurants/${restaurantId}/orders`);
    return data.map(mapOrder);
  }

  async get(orderId: string) {
    const { data } = await api.get<ApiOrder>(`/orders/${orderId}`);
    return mapOrder(data);
  }

  async updateStatus(orderId: string, status: string) {
    const { data } = await api.patch<ApiOrder>(`/orders/${orderId}/status`, { status });
    return mapOrder(data);
  }

  async accept(orderId: string) {
    const { data } = await api.patch<ApiOrder>(`/orders/${orderId}/accept`);
    return mapOrder(data);
  }

  async reject(orderId: string, reason?: string) {
    const { data } = await api.patch<ApiOrder>(`/orders/${orderId}/reject`, { reason });
    return mapOrder(data);
  }

  async ready(orderId: string) {
    const { data } = await api.patch<ApiOrder>(`/orders/${orderId}/ready`);
    return mapOrder(data);
  }

  async cancel(orderId: string, reason?: string) {
    const { data } = await api.patch<ApiOrder>(`/orders/${orderId}/cancel`, { reason });
    return mapOrder(data);
  }
}

export default new OrdersService();
