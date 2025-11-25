import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../src/components/Button';
import { useCheckoutStore } from '../src/stores/checkoutStore';
import { COLORS } from '../constants/colors';
import { OrderStatus } from '../services/orders.service';

const formatCurrency = (value: number) => `L.${value.toFixed(2)}`;

export default function SuccessScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lastOrder = useCheckoutStore((state) => state.lastOrder);
  const resetCheckout = useCheckoutStore((state) => state.reset);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleContinue = () => {
    resetCheckout();
    router.replace('/(tabs)/home');
  };

  const handleViewOrder = () => {
    if (lastOrder?.id) {
      const orderId = lastOrder.id;
      resetCheckout();
      router.push({
        pathname: '/order/[id]',
        params: { id: orderId },
      });
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const resolvedStatuses: OrderStatus[] =
    lastOrder?.status === 'CANCELLED'
      ? (['PENDING', 'CANCELLED'] as OrderStatus[])
      : (['PENDING', 'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'] as OrderStatus[]);

  const statusTitles: Record<OrderStatus, string> = {
    PENDING: 'Pedido confirmado',
    NEW: 'Confirmado',
    ACCEPTED: 'Aceptado',
    PREPARING: 'Preparando',
    READY: 'Listo',
    ON_ROUTE: 'En camino',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  };

  const friendlyStatus = lastOrder?.status ? statusTitles[lastOrder.status as OrderStatus] ?? lastOrder.status : 'Pendiente';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>¡Pedido Exitoso!</Text>
          <Text style={styles.subtitle}>
            {lastOrder?.restaurantName
              ? `Tu pedido en ${lastOrder.restaurantName} está en proceso`
              : 'Tu pedido ha sido confirmado y está siendo preparado'}
          </Text>

          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Número de Orden</Text>
              <Text style={styles.orderValue}>{lastOrder?.id?.slice(0, 8) ?? '#---'}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total</Text>
              <Text style={styles.orderValue}>
                {lastOrder ? formatCurrency(lastOrder.total) : 'L.--'}
              </Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Estado</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{friendlyStatus}</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeline}>
            {resolvedStatuses.map((status, index) => {
              const isActive = lastOrder?.status
                ? resolvedStatuses.indexOf(lastOrder.status as OrderStatus) >= index
                : index === 0;
              return (
                <View key={status}>
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, isActive && styles.timelineDotActive]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{statusTitles[status as OrderStatus]}</Text>
                      <Text style={styles.timelineTime}>{isActive ? 'Progreso' : 'Pendiente'}</Text>
                    </View>
                  </View>
                  {status !== resolvedStatuses[resolvedStatuses.length - 1] && <View style={styles.timelineLine} />}
                </View>
              );
            })}
          </View>
        </Animated.View>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button title="Seguir mi Pedido" onPress={handleViewOrder} />
        <Button title="Volver al Inicio" onPress={handleContinue} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  messageContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  orderCard: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  statusBadge: {
    backgroundColor: '#2d2520',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  timeline: {
    width: '100%',
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333333',
    marginTop: 4,
    marginRight: 16,
  },
  timelineDotActive: {
    backgroundColor: COLORS.accent,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 13,
    color: '#666666',
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#333333',
    marginLeft: 5,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    gap: 12,
  },
});
