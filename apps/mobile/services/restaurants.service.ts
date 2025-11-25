import api from './api';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl: string;
  rating: number;
  etaMinutes: number;
  lat: number;
  lng: number;
  isOpen: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description: string;
  price: number;
  priceCents: number;
  imageUrl?: string | null;
  ingredients?: string | null;
  available: boolean;
  isFeatured: boolean;
  prepTimeMinutes?: number | null;
}

export interface RestaurantDetails extends Restaurant {
  products: Product[];
}

type ApiProduct = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl?: string | null;
  isFeatured: boolean;
  available: boolean;
  prepTimeMinutes?: number | null;
  ingredients?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
};

const mapProduct = (product: ApiProduct): Product => ({
  id: product.id,
  restaurantId: product.restaurantId,
  categoryId: product.categoryId,
  categoryName: product.category?.name,
  name: product.name,
  description: product.description,
  priceCents: product.priceCents,
  price: product.priceCents / 100,
  imageUrl: product.imageUrl,
  isFeatured: product.isFeatured,
  available: product.available,
  prepTimeMinutes: product.prepTimeMinutes ?? 15,
  ingredients: product.ingredients,
});

class RestaurantsService {
  async getAll(): Promise<Restaurant[]> {
    const response = await api.get<Restaurant[]>('/restaurants');
    return response.data;
  }

  async getFeatured(): Promise<Restaurant[]> {
    const response = await api.get<Restaurant[]>('/restaurants/featured');
    return response.data;
  }

  async getById(id: string): Promise<RestaurantDetails> {
    const response = await api.get<Omit<RestaurantDetails, 'products'> & { products: ApiProduct[] }>(
      `/restaurants/${id}`,
    );
    return {
      ...response.data,
      products: response.data.products?.map(mapProduct) ?? [],
    };
  }

  async search(query: string): Promise<Restaurant[]> {
    const response = await api.get<Restaurant[]>('/restaurants/search', {
      params: { q: query },
    });
    return response.data;
  }
}

export default new RestaurantsService();
