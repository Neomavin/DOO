import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useCartStore } from '../../src/stores/cartStore';
import { COLORS } from '../../constants/colors';

export default function TabsLayout() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={24} color={color} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
