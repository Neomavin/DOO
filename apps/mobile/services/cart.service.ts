import api from './api';
import { CartItem } from '../src/stores/cartStore';

interface ApiCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    priceCents: number;
    imageUrl?: string;
    restaurant: {
      id: string;
      name: string;
    };
  };
}

class CartService {
  private mapToCartItem(item: ApiCartItem): CartItem {
    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.priceCents / 100,
      quantity: item.quantity,
      image: item.product.imageUrl,
      restaurantId: item.product.restaurant.id,
      restaurantName: item.product.restaurant.name,
    };
  }

  async getCart() {
    const { data } = await api.get<ApiCartItem[]>('/cart');
    return data.map((item) => this.mapToCartItem(item));
  }

  async addItem(productId: string, quantity = 1) {
    await api.post('/cart/items', { productId, quantity });
    return this.getCart();
  }

  async updateQuantity(itemId: string, quantity: number) {
    await api.patch(`/cart/items/${itemId}`, { quantity });
    return this.getCart();
  }

  async removeItem(itemId: string) {
    await api.delete(`/cart/items/${itemId}`);
    return this.getCart();
  }

  async clearCart() {
    await api.delete('/cart');
    return [];
  }
}

export default new CartService();
