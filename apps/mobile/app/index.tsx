import { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import authService from '../services/auth.service';
import { COLORS } from '../constants/colors';

const RUNS_ON_NATIVE_DRIVER = Platform.OS !== 'web';

export default function SplashScreen() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: RUNS_ON_NATIVE_DRIVER,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: RUNS_ON_NATIVE_DRIVER,
      }),
    ]).start();

    if (!navigationState?.key) {
      return;
    }

    // Verificar autenticación y navegar
    const checkAuth = async () => {
      const isAuth = await authService.isAuthenticated();

      setTimeout(() => {
        if (isAuth) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/onboarding');
        }
      }, 2000);
    };

    checkAuth();
  }, [navigationState?.key]);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.logoBadge, { borderColor: COLORS.accent }]}>
          <Text style={[styles.logoLetters, { color: COLORS.accent }]}>DO</Text>
        </View>
        <Text style={[styles.title, { color: COLORS.white }]}>Delivery Ocotepeque</Text>
        <Text style={[styles.tagline, { color: COLORS.lightGray }]}>
          Comida deliciosa a tu puerta
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  logoLetters: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 4,
  },
});
