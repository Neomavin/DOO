import { create } from 'zustand';
import ordersService, { CourierOrder, EarningsSummary } from '../../services/orders.service';
import locationService from '../../services/location.service';
import { useAuthStore } from './authStore';

interface OrderState {
  available: CourierOrder[];
  activeOrder: CourierOrder | null;
  history: CourierOrder[];
  earnings: EarningsSummary | null;
  loadingAvailable: boolean;
  loadingActive: boolean;
  loadingHistory: boolean;
  updatingStatus: boolean;
  online: boolean;
  fetchAvailable: () => Promise<void>;
  fetchActive: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchEarnings: () => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string) => Promise<void>;
  markPickedUp: (orderId: string) => Promise<void>;
  markDelivered: (orderId: string, code: string) => Promise<void>;
  toggleAvailability: (value: boolean) => Promise<void>;
  clear: () => void;
}

async function handleTracking(order: CourierOrder | null) {
  if (order && order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
    try {
      const status = order.status === 'ON_ROUTE' ? 'ON_ROUTE' : 'READY';
      await locationService.startTracking(status);
    } catch (error) {
      console.warn('No pudimos iniciar el tracking de ubicación', error);
    }
  } else {
    locationService.stopTracking();
  }
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  available: [],
  activeOrder: null,
  history: [],
  earnings: null,
  loadingAvailable: false,
  loadingActive: false,
  loadingHistory: false,
  updatingStatus: false,
  online: Boolean(useAuthStore.getState().user?.isAvailable),

  fetchAvailable: async () => {
    set({ loadingAvailable: true });
    try {
      const data = await ordersService.getAvailableOrders();
      set({ available: data });
    } finally {
      set({ loadingAvailable: false });
    }
  },

  fetchActive: async () => {
    set({ loadingActive: true });
    try {
      const active = await ordersService.getActiveOrder();
      set({ activeOrder: active });
      await handleTracking(active);
    } finally {
      set({ loadingActive: false });
    }
  },

  fetchHistory: async () => {
    set({ loadingHistory: true });
    try {
      const history = await ordersService.getHistory();
      set({ history });
    } finally {
      set({ loadingHistory: false });
    }
  },

  fetchEarnings: async () => {
    const earnings = await ordersService.getEarnings();
    set({ earnings });
  },

  acceptOrder: async (orderId: string) => {
    set({ updatingStatus: true });
    try {
      const order = await ordersService.acceptOrder(orderId);
      set((state) => ({
        activeOrder: order,
        available: state.available.filter((o) => o.id !== orderId),
      }));
      await handleTracking(order);
    } finally {
      set({ updatingStatus: false });
    }
  },

  rejectOrder: async (orderId: string) => {
    await ordersService.rejectOrder(orderId);
    set((state) => ({ available: state.available.filter((o) => o.id !== orderId) }));
  },

  markPickedUp: async (orderId: string) => {
    set({ updatingStatus: true });
    try {
      const order = await ordersService.markPickedUp(orderId);
      set({ activeOrder: order });
      await handleTracking(order);
    } finally {
      set({ updatingStatus: false });
    }
  },

  markDelivered: async (orderId: string, code: string) => {
    set({ updatingStatus: true });
    try {
      const order = await ordersService.markDelivered(orderId, code);
      set((state) => ({
        activeOrder: null,
        history: [order, ...state.history],
      }));
      await handleTracking(null);
    } finally {
      set({ updatingStatus: false });
    }
  },

  toggleAvailability: async (value: boolean) => {
    const { isAvailable } = await ordersService.toggleAvailability(value);
    useAuthStore.getState().updateUser({ isAvailable });
    set({ online: isAvailable });
  },

  clear: () => {
    locationService.stopTracking();
    set({
      available: [],
      activeOrder: null,
      history: [],
      earnings: null,
      loadingAvailable: false,
      loadingActive: false,
      loadingHistory: false,
      updatingStatus: false,
    });
  },
}));
