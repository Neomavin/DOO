import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useOrderStore } from '../../src/stores/orderStore';
import OrderCard from '../../src/components/OrderCard';
import { COLORS } from '../../constants/colors';

export default function AvailableOrdersScreen() {
  const { available, fetchAvailable, loadingAvailable, acceptOrder, rejectOrder } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAvailable();
    setRefreshing(false);
  };

  const handleAccept = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
    } catch (error) {
      Alert.alert('Error', 'No pudimos aceptar el pedido.');
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await rejectOrder(orderId);
    } catch (error) {
      Alert.alert('Error', 'No pudimos rechazar el pedido.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos disponibles</Text>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing || loadingAvailable} onRefresh={handleRefresh} />}
      >
        {available.length === 0 && !loadingAvailable ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin pedidos por ahora</Text>
            <Text style={styles.emptySubtitle}>Mantente en línea para tomar el siguiente pedido.</Text>
          </View>
        ) : (
          available.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={() => handleAccept(order.id)}
              onReject={() => handleReject(order.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingTop: 48,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
  },
});
