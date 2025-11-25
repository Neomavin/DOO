import api from './api';

export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER';

export type OrderStatus =
  | 'PENDING'
  | 'NEW'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'ON_ROUTE'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  priceCents: number;
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  priceCents: number;
}

export interface OrderAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  restaurantId: string;
  restaurantName: string;
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
  notes?: string | null;
  confirmationCode?: string | null;
  address?: OrderAddress;
}

export interface CreateOrderPayload {
  restaurantId: string;
  addressId: string;
  items: Array<CreateOrderItem>;
  subtotalCents: number;
  taxCents: number;
  deliveryCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

type ApiOrder = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  restaurantId: string;
  restaurant?: { id: string; name: string };
  subtotalCents: number;
  deliveryCents: number;
  totalCents: number;
  paymentMethod: string;
  items: Array<{ productId: string; name: string; quantity: number; priceCents: number }>;
  address?: {
    id: string;
    label: string;
    line1: string;
    line2?: string | null;
    city: string;
  };
  notes?: string | null;
  confirmationCode?: string | null;
};

const mapOrder = (order: ApiOrder): Order => ({
  id: order.id,
  status: order.status,
  createdAt: order.createdAt,
  restaurantId: order.restaurantId,
  restaurantName: order.restaurant?.name ?? 'Restaurante',
  subtotal: order.subtotalCents / 100,
  delivery: order.deliveryCents / 100,
  total: order.totalCents / 100,
  paymentMethod: order.paymentMethod,
  notes: order.notes,
  confirmationCode: order.confirmationCode,
  address: order.address
    ? {
        id: order.address.id,
        label: order.address.label,
        line1: order.address.line1,
        line2: order.address.line2,
        city: order.address.city,
      }
    : undefined,
  items: order.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    priceCents: item.priceCents,
    price: item.priceCents / 100,
  })),
});

class OrdersService {
  async createOrder(payload: CreateOrderPayload) {
    const { data } = await api.post<ApiOrder>('/orders', payload);
    return mapOrder(data);
  }

  async listMyOrders() {
    const { data } = await api.get<ApiOrder[]>('/orders');
    return data.map(mapOrder);
  }

  async getOrder(id: string) {
    const { data } = await api.get<ApiOrder>(`/orders/${id}`);
    return mapOrder(data);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const { data } = await api.patch<ApiOrder>(`/orders/${id}/status`, { status });
    return mapOrder(data);
  }

  async cancelOrder(id: string) {
    return this.updateStatus(id, 'CANCELLED');
  }
}

export default new OrdersService();
