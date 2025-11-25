import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RatingEntry {
  rating: number;
  comment?: string;
  updatedAt: string;
}

interface RatingsState {
  orderRatings: Record<string, RatingEntry>;
  restaurantRatings: Record<string, RatingEntry>;
  rateOrder: (orderId: string, rating: number, comment?: string) => void;
  rateRestaurant: (restaurantId: string, rating: number, comment?: string) => void;
}

export const useRatingsStore = create<RatingsState>()(
  persist(
    (set) => ({
      orderRatings: {},
      restaurantRatings: {},
      rateOrder: (orderId, rating, comment) =>
        set((state) => ({
          orderRatings: {
            ...state.orderRatings,
            [orderId]: { rating, comment, updatedAt: new Date().toISOString() },
          },
        })),
      rateRestaurant: (restaurantId, rating, comment) =>
        set((state) => ({
          restaurantRatings: {
            ...state.restaurantRatings,
            [restaurantId]: { rating, comment, updatedAt: new Date().toISOString() },
          },
        })),
    }),
    {
      name: 'ratings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
