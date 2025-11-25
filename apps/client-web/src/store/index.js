import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) => set({ user, isAuthenticated: true }),

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
    },

    initAuth: () => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (user && token) {
            set({ user: JSON.parse(user), isAuthenticated: true });
        }
    },
}));

export const useCartStore = create((set, get) => ({
    items: [],
    restaurant: null,

    addItem: (item, restaurant) => {
        const { items, restaurant: currentRestaurant } = get();

        // Si es de otro restaurante, limpiar carrito
        if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
            set({ items: [{ ...item, quantity: 1 }], restaurant });
            return;
        }

        // Verificar si el item ya existe
        const existingIndex = items.findIndex(i => i.id === item.id);

        if (existingIndex >= 0) {
            const newItems = [...items];
            newItems[existingIndex].quantity += 1;
            set({ items: newItems, restaurant });
        } else {
            set({ items: [...items, { ...item, quantity: 1 }], restaurant });
        }
    },

    removeItem: (itemId) => {
        const { items } = get();
        const newItems = items.filter(i => i.id !== itemId);
        set({
            items: newItems,
            restaurant: newItems.length === 0 ? null : get().restaurant
        });
    },

    updateQuantity: (itemId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
            get().removeItem(itemId);
            return;
        }

        const newItems = items.map(i =>
            i.id === itemId ? { ...i, quantity } : i
        );
        set({ items: newItems });
    },

    clearCart: () => set({ items: [], restaurant: null }),

    getTotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },
}));
