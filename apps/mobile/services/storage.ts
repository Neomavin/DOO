import { Platform } from 'react-native';

type SecureStoreModule = typeof import('expo-secure-store');
const secureStore: SecureStoreModule | null =
  Platform.OS === 'web' ? null : require('expo-secure-store');

export async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await secureStore?.setItemAsync(key, value);
}

export async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return secureStore?.getItemAsync(key) ?? null;
}

export async function removeItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await secureStore?.deleteItemAsync(key);
}
