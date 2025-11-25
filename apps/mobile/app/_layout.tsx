import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '../constants/colors';

// Mantener la splash screen visible mientras cargamos recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Ocultar splash screen después de que el layout esté listo
    const prepare = async () => {
      try {
        // Aquí puedes cargar fuentes u otros recursos si los necesitas
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.primary },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
    </>
  );
}
