import { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOrderStore } from '../../src/stores/orderStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../constants/colors';
import Button from '../../src/components/Button';
import authService from '../../services/auth.service';

const formatCurrency = (cents: number) => `L.${(cents / 100).toFixed(2)}`;

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { online, toggleAvailability, earnings, fetchEarnings, clear } = useOrderStore();

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleToggle = async (value: boolean) => {
    try {
      await toggleAvailability(value);
    } catch (error) {
      Alert.alert('Error', 'No pudimos actualizar tu estado.');
    }
  };

  const handleLogout = async () => {
    clear();
    await authService.logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.muted}>{user?.email}</Text>
        <Text style={styles.muted}>Vehículo: {user?.vehicleType ?? 'No configurado'}</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Disponible</Text>
          <Switch value={online} onValueChange={handleToggle} trackColor={{ true: COLORS.accent }} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ganancias</Text>
        <Text style={styles.amount}>{earnings ? formatCurrency(earnings.totalEarnedCents) : 'L.0.00'}</Text>
        <Text style={styles.muted}>Entregas: {earnings?.totalDeliveries ?? 0}</Text>
      </View>

      <Button title="Cerrar sesión" variant="outline" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingTop: 48,
    gap: 16,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  name: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
  },
  muted: {
    color: COLORS.muted,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  switchLabel: {
    color: COLORS.white,
    fontSize: 16,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  amount: {
    color: COLORS.accent,
    fontSize: 32,
    fontWeight: '700',
  },
});
