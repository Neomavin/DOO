import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CourierUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isAvailable?: boolean | null;
  vehicleType?: string | null;
}

interface AuthState {
  user: CourierUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: CourierUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<CourierUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'courier-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
