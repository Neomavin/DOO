import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import authService from '../services/auth.service';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS } from '../constants/colors';

export default function SplashScreen() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!navigationState?.key) return;
    const bootstrap = async () => {
      const stillAuthenticated = isAuthenticated || (await authService.isAuthenticated());
      if (stillAuthenticated) {
        router.replace('/(tabs)/available');
      } else {
        router.replace('/login');
      }
    };
    bootstrap();
  }, [isAuthenticated, navigationState?.key, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={styles.text}>Preparando tu turno...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: 16,
    color: COLORS.white,
    fontSize: 16,
  },
});
