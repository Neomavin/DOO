import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import authService from '../../services/auth.service';
import { COLORS } from '../../constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Editar Perfil', action: () => router.push('/profile/edit') },
    { icon: 'location-outline', label: 'Mis Direcciones', action: () => router.push('/addresses') },
    { icon: 'receipt-outline', label: 'Historial de Pedidos', action: () => router.push('/orders') },
    { icon: 'card-outline', label: 'Métodos de Pago', action: () => router.push('/payment-methods') },
    { icon: 'notifications-outline', label: 'Notificaciones Push', action: () => router.push('/settings/notifications') },
    { icon: 'settings-outline', label: 'Configuración', action: () => router.push('/settings') },
    { icon: 'help-circle-outline', label: 'Ayuda y Soporte', action: () => router.push('/support') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/profile/edit')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.email}>{user?.email || 'email@ejemplo.com'}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color={COLORS.accent} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.black,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.muted,
  },
  menuContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    marginHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 32,
    marginBottom: 24,
  },
});
