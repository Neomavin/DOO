import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ordersService, { Order } from '../../services/orders.service';
import { COLORS } from '../../constants/colors';

const formatCurrency = (value: number) => `L.${value.toFixed(2)}`;

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await ordersService.listMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error cargando pedidos', err);
      setError('No pudimos cargar tus pedidos. Desliza para reintentar.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const statusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'NEW':
        return 'Confirmado';
      case 'ACCEPTED':
        return 'Aceptado';
      case 'PREPARING':
        return 'Preparando';
      case 'READY':
        return 'Listo para enviar';
      case 'ON_ROUTE':
        return 'En camino';
      case 'DELIVERED':
        return 'Entregado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Pedidos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.emptyText}>Cargando tus pedidos...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Aún no tienes pedidos</Text>
            <Text style={styles.emptyText}>Haz tu primera orden para verla aquí.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() =>
                router.push({
                  pathname: '/order/[id]',
                  params: { id: order.id },
                })
              }
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderRestaurant}>{order.restaurantName}</Text>
                <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
              </View>
              <View style={styles.orderMeta}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    order.status === 'CANCELLED' && styles.statusBadgeCancelled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      order.status === 'CANCELLED' && styles.statusTextCancelled,
                    ]}
                  >
                    {statusLabel(order.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</Text>
            </TouchableOpacity>
          ))
        )}

        {error && !loading && <Text style={styles.errorText}>{error}</Text>}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    fontSize: 28,
    color: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 13,
    color: COLORS.muted,
  },
  statusBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeCancelled: {
    backgroundColor: 'rgba(255,92,92,0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  statusTextCancelled: {
    color: '#ff5c5c',
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.muted,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.accent,
    marginTop: 12,
  },
});
