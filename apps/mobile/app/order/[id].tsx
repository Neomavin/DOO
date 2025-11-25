import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import ordersService, { Order, OrderStatus } from '../../services/orders.service';
import locationService from '../../services/location.service';
import Button from '../../src/components/Button';
import { COLORS } from '../../constants/colors';
import { getSocket, disconnectSocket } from '../../services/socket.service';
import { useRatingsStore } from '../../src/stores/ratingsStore';

const STATUS_STEPS: Array<{ key: OrderStatus; title: string; description: string }> = [
  { key: 'PENDING', title: 'Pedido recibido', description: 'Estamos confirmando tu orden.' },
  { key: 'NEW', title: 'Confirmado', description: 'El restaurante aceptó tu pedido.' },
  { key: 'ACCEPTED', title: 'Preparando', description: 'Comenzamos a preparar tu comida.' },
  { key: 'PREPARING', title: 'En preparación', description: 'Tu pedido está casi listo.' },
  { key: 'READY', title: 'Listo para enviar', description: 'El repartidor recogerá tu pedido.' },
  { key: 'ON_ROUTE', title: 'En camino', description: 'El repartidor va hacia tu ubicación.' },
  { key: 'DELIVERED', title: 'Entregado', description: 'Disfruta tu pedido.' },
  { key: 'CANCELLED', title: 'Cancelado', description: 'El pedido fue cancelado.' },
];

const TERMINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED'] as OrderStatus[];
const CANCELABLE_STATUSES: OrderStatus[] = ['PENDING', 'NEW', 'ACCEPTED'] as OrderStatus[];

const formatCurrency = (value: number) => `L.${value.toFixed(2)}`;

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [courierLocation, setCourierLocation] = useState<{ lat: number; lng: number } | null>(null);
  const orderRatings = useRatingsStore((state) => state.orderRatings);
  const rateOrder = useRatingsStore((state) => state.rateOrder);
  const [currentRating, setCurrentRating] = useState(
    orderRatings[orderId ?? '']?.rating ?? 0
  );
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setError(null);
      const data = await ordersService.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Error al cargar pedido', err);
      setError('No pudimos cargar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!order || TERMINAL_STATUSES.includes(order.status)) {
      return;
    }
    const interval = setInterval(() => {
      fetchOrder();
    }, 15000);
    return () => clearInterval(interval);
  }, [order?.status, fetchOrder]);

  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    
    const handleUpdate = (payload: Order) => {
      if (payload.id === orderId) {
        setOrder(payload);
      }
    };
    
    // 🆕 Escuchar ubicación del courier en tiempo real
    const handleCourierLocation = (location: { lat: number; lng: number }) => {
      setCourierLocation(location);
      console.log('Ubicación del courier actualizada:', location);
    };
    
    socket.on('order:update', handleUpdate);
    socket.on('courierLocation', handleCourierLocation);
    
    return () => {
      socket.off('order:update', handleUpdate);
      socket.off('courierLocation', handleCourierLocation);
    };
  }, [orderId]);

  const activeStepIndex = useMemo(() => {
    if (!order?.status) return 0;
    const index = STATUS_STEPS.findIndex((step) => step.key === order.status);
    return index === -1 ? 0 : index;
  }, [order?.status]);

  const canCancel = order ? CANCELABLE_STATUSES.includes(order.status as OrderStatus) : false;
  const canRate = order?.status === 'DELIVERED';

  const handleRate = (value: number) => {
    setCurrentRating(value);
  };

  const handleSubmitRating = () => {
    if (!orderId || !order) return;
    setRatingSubmitting(true);
    setTimeout(() => {
      rateOrder(orderId, currentRating);
      setRatingSubmitting(false);
      Alert.alert('Gracias', 'Tu calificación fue registrada.');
    }, 400);
  };

  const handleCancelOrder = () => {
    if (!order) return;
    Alert.alert('Cancelar pedido', '¿Deseas cancelar este pedido?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar pedido',
        style: 'destructive',
        onPress: async () => {
          try {
            setCancelling(true);
            const updated = await ordersService.cancelOrder(order.id);
            setOrder(updated);
          } catch (err) {
            Alert.alert('Error', 'No pudimos cancelar tu pedido. Intenta nuevamente.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (!orderId) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Pedido no encontrado.</Text>
        <Button title="Volver al inicio" onPress={() => router.replace('/(tabs)/home')} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Cargando pedido...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, styles.center, styles.padded]}>
        <Text style={styles.errorText}>{error ?? 'No pudimos cargar este pedido.'}</Text>
        <Button title="Reintentar" onPress={fetchOrder} />
      </View>
    );
  }

  // 🗺️ Mostrar mapa cuando el pedido está en camino
  const showMap = order.status === 'ON_ROUTE' && courierLocation && order.address;
  
  // Calcular distancia si hay ubicación del courier
  const distanceToCustomer = courierLocation && order.address
    ? locationService.calculateDistance(
        courierLocation.lat,
        courierLocation.lng,
        order.address.lat,
        order.address.lng
      )
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pedido #{order.id.slice(0, 8)}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 🆕 MAPA EN TIEMPO REAL */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: courierLocation.lat,
              longitude: courierLocation.lng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            region={{
              latitude: courierLocation.lat,
              longitude: courierLocation.lng,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {/* Pin del courier (moviéndose en tiempo real) */}
            <Marker
              coordinate={{
                latitude: courierLocation.lat,
                longitude: courierLocation.lng,
              }}
              title="Tu repartidor"
              description="En camino hacia ti"
            >
              <View style={styles.courierMarker}>
                <Ionicons name="bicycle" size={24} color={COLORS.white} />
              </View>
            </Marker>

            {/* Pin de tu dirección */}
            <Marker
              coordinate={{
                latitude: order.address.lat,
                longitude: order.address.lng,
              }}
              title="Tu dirección"
              description={order.address.line1}
              pinColor={COLORS.accent}
            />

            {/* Línea de ruta */}
            <Polyline
              coordinates={[
                { latitude: courierLocation.lat, longitude: courierLocation.lng },
                { latitude: order.address.lat, longitude: order.address.lng },
              ]}
              strokeColor={COLORS.accent}
              strokeWidth={3}
            />
          </MapView>

          {/* Info de tracking */}
          <View style={styles.trackingInfo}>
            <View style={styles.trackingRow}>
              <Ionicons name="bicycle" size={20} color={COLORS.accent} />
              <Text style={styles.trackingTitle}>Tu pedido está en camino 🚴</Text>
            </View>
            {distanceToCustomer !== null && (
              <Text style={styles.trackingDistance}>
                A {locationService.formatDistance(distanceToCustomer)} de distancia
              </Text>
            )}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrder();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado</Text>
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= activeStepIndex;
            return (
              <View key={step.key}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusIndicator, isActive && styles.statusIndicatorActive]}>
                    <Ionicons
                      name={isActive ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={isActive ? COLORS.accent : COLORS.border}
                    />
                  </View>
                  <View style={styles.statusTextContainer}>
                    <Text style={[styles.statusTitle, isActive && styles.statusTitleActive]}>{step.title}</Text>
                    <Text style={styles.statusDescription}>{step.description}</Text>
                  </View>
                </View>
                {index < STATUS_STEPS.length - 1 && <View style={styles.statusDivider} />}
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entrega</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.delivery)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
          {order.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.summaryLabel}>Notas</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Artículos</Text>
          {order.items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrega</Text>
          {order.address ? (
            <View style={styles.addressBlock}>
              <Text style={styles.addressLabel}>{order.address.label}</Text>
              <Text style={styles.addressText}>
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''} · {order.address.city}
              </Text>
            </View>
          ) : (
            <Text style={styles.summaryLabel}>Sin dirección registrada</Text>
          )}
        </View>

        {canRate && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Califica tu experiencia</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => handleRate(value)}>
                  <Ionicons
                    name={value <= currentRating ? 'star' : 'star-outline'}
                    size={28}
                    color={COLORS.accent}
                    style={styles.ratingStar}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title={ratingSubmitting ? 'Enviando...' : 'Enviar calificación'}
              onPress={handleSubmitRating}
              loading={ratingSubmitting}
              disabled={currentRating === 0}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {canCancel && (
          <Button
            title={cancelling ? 'Cancelando...' : 'Cancelar pedido'}
            variant="secondary"
            onPress={handleCancelOrder}
            loading={cancelling}
            disabled={cancelling}
          />
        )}
        <Button title="Actualizar estado" onPress={fetchOrder} />
        <Button title="Volver al inicio" variant="outline" onPress={() => router.replace('/(tabs)/home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  padded: {
    paddingHorizontal: 24,
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
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicatorActive: {
    backgroundColor: 'rgba(252,163,17,0.15)',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '600',
  },
  statusTitleActive: {
    color: COLORS.white,
  },
  statusDescription: {
    fontSize: 13,
    color: COLORS.muted,
  },
  statusDivider: {
    height: 24,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    marginLeft: 16,
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
  },
  notesBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  notesText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
  },
  itemQuantity: {
    fontSize: 13,
    color: COLORS.muted,
  },
  itemPrice: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
  },
  addressBlock: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  footer: {
    padding: 20,
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ratingStar: {
    marginHorizontal: 6,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  // 🆕 Estilos del mapa
  mapContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  courierMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  trackingInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
  trackingDistance: {
    fontSize: 14,
    color: COLORS.muted,
    marginLeft: 28,
  },
});
