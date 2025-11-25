import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  restaurantId: string;
  restaurantName: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      setItems: (items) =>
        set({
          items,
          restaurantId: items.length > 0 ? items[0].restaurantId : null,
        }),
      clearCart: () => set({ items: [], restaurantId: null }),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTotal: () => {
        const subtotal = get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = subtotal * 0.15;
        const delivery = get().items.length > 0 ? 40 : 0;
        return subtotal + tax + delivery;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
