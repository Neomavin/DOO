import { create } from 'zustand';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationState {
  userLocation: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  
  // Actions
  setUserLocation: (location: Coordinates) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasPermission: (hasPermission: boolean) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  userLocation: null,
  isLoading: false,
  error: null,
  hasPermission: false,

  setUserLocation: (location) => set({ userLocation: location, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  setHasPermission: (hasPermission) => set({ hasPermission }),
  clearLocation: () => set({ userLocation: null, error: null }),
}));
