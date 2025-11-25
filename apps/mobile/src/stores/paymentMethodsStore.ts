import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedPaymentMethodType = 'card' | 'cash' | 'transfer';

export interface SavedPaymentMethod {
  id: string;
  type: SavedPaymentMethodType;
  label: string;
  details: {
    last4?: string;
    holder?: string;
    bank?: string;
    reference?: string;
  };
  isDefault: boolean;
}

interface PaymentMethodsState {
  methods: SavedPaymentMethod[];
  addMethod: (method: Omit<SavedPaymentMethod, 'id' | 'isDefault'> & { isDefault?: boolean }) => void;
  removeMethod: (id: string) => void;
  setDefault: (id: string) => void;
}

const generateId = () => `pm_${Math.random().toString(36).slice(2, 10)}`;

export const usePaymentMethodsStore = create<PaymentMethodsState>()(
  persist(
    (set, get) => ({
      methods: [],
      addMethod: (method) =>
        set((state) => {
          const id = generateId();
          const newMethod: SavedPaymentMethod = {
            id,
            ...method,
            isDefault: method.isDefault ?? state.methods.length === 0,
          };
          return {
            methods: newMethod.isDefault
              ? [newMethod, ...state.methods.map((m) => ({ ...m, isDefault: false }))]
              : [...state.methods, newMethod],
          };
        }),
      removeMethod: (id) =>
        set((state) => ({
          methods: state.methods.filter((method) => method.id !== id),
        })),
      setDefault: (id) =>
        set((state) => ({
          methods: state.methods.map((method) => ({
            ...method,
            isDefault: method.id === id,
          })),
        })),
    }),
    {
      name: 'payment-methods',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
