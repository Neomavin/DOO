export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: 'CLIENT' | 'RESTAURANT' | 'COURIER' | 'ADMIN';
  createdAt?: string;
  restaurantId?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceCents?: number;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  ingredients?: string;
  available: boolean;
  isFeatured?: boolean;
  prepTimeMinutes?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  totalCents?: number;
  status: string;
  createdAt: string;
  eta?: string;
  items: OrderItem[];
}

export interface StatsSummary {
  salesToday: number;
  pendingOrders: number;
  activeProducts: number;
  rating: number;
}
