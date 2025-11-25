import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '../constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      await SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[id]" />
      </Stack>
      <StatusBar style="light" backgroundColor={COLORS.background} />
    </>
  );
}
