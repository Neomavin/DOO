import api from '@/lib/api';
import type { Product } from '@/types';

type ApiProduct = Product & {
  priceCents: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
};

const mapProduct = (product: ApiProduct): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  priceCents: product.priceCents,
  price: product.priceCents / 100,
  categoryId: product.categoryId,
  categoryName: product.category?.name,
  imageUrl: product.imageUrl,
  available: product.available,
  isFeatured: product.isFeatured,
  ingredients: product.ingredients,
  prepTimeMinutes: product.prepTimeMinutes,
});

const toPayload = (payload: Partial<Product>) => ({
  name: payload.name,
  description: payload.description,
  categoryId: payload.categoryId,
  ingredients: payload.ingredients,
  imageUrl: payload.imageUrl,
  available: payload.available,
  isFeatured: payload.isFeatured,
  prepTimeMinutes: payload.prepTimeMinutes,
  priceCents:
    payload.priceCents ?? (typeof payload.price === 'number' ? Math.round(payload.price * 100) : undefined),
});

class ProductsService {
  async list(restaurantId: string) {
    const { data } = await api.get<ApiProduct[]>(`/restaurants/${restaurantId}/products`);
    return data.map(mapProduct);
  }

  async getById(productId: string) {
    const { data } = await api.get<ApiProduct>(`/products/${productId}`);
    return mapProduct(data);
  }

  async create(restaurantId: string, payload: Partial<Product>) {
    const { data } = await api.post<ApiProduct>(
      `/restaurants/${restaurantId}/products`,
      toPayload(payload),
    );
    return mapProduct(data);
  }

  async update(productId: string, payload: Partial<Product>) {
    const { data } = await api.put<ApiProduct>(`/products/${productId}`, toPayload(payload));
    return mapProduct(data);
  }

  async remove(productId: string) {
    await api.delete(`/products/${productId}`);
  }
}

export default new ProductsService();
