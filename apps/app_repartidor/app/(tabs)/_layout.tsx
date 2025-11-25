import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            available: 'list-circle',
            active: 'navigate',
            history: 'time',
            profile: 'person',
          };
          const name = icons[route.name] || 'ellipse';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="available" options={{ title: 'Disponibles' }} />
      <Tabs.Screen name="active" options={{ title: 'Activo' }} />
      <Tabs.Screen name="history" options={{ title: 'Historial' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
