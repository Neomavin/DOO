import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import ordersService, { CourierOrder } from '../../services/orders.service';
import { COLORS } from '../../constants/colors';

const formatCurrency = (cents: number) => `L.${(cents / 100).toFixed(2)}`;

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<CourierOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        const data = await ordersService.getOrderById(orderId);
        setOrder(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Pedido no encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{order.restaurant.name}</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cliente</Text>
        <Text style={styles.text}>{order.user?.name ?? 'Cliente'}</Text>
        {order.user?.phone && <Text style={styles.text}>{order.user.phone}</Text>}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Entrega</Text>
        <Text style={styles.text}>{order.address.line1}</Text>
        {order.address.line2 ? <Text style={styles.text}>{order.address.line2}</Text> : null}
        <Text style={styles.text}>Estado: {order.status}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Total</Text>
        <Text style={styles.amount}>{formatCurrency(order.totalCents)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingTop: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  muted: {
    color: COLORS.muted,
  },
  back: {
    color: COLORS.accent,
    marginBottom: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    color: COLORS.white,
  },
  amount: {
    color: COLORS.accent,
    fontSize: 28,
    fontWeight: '700',
  },
});
