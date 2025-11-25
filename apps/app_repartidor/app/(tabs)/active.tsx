import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useOrderStore } from '../../src/stores/orderStore';
import MapViewCard from '../../src/components/MapView';
import Button from '../../src/components/Button';
import { COLORS } from '../../constants/colors';
import locationService, { Coordinates } from '../../services/location.service';

export default function ActiveOrderScreen() {
  const { activeOrder, loadingActive, fetchActive, markPickedUp, markDelivered, updatingStatus } =
    useOrderStore();
  const [courierLocation, setCourierLocation] = useState<Coordinates | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  useEffect(() => {
    if (!activeOrder) {
      setCourierLocation(null);
      return;
    }
    locationService
      .getCurrentLocation()
      .then(setCourierLocation)
      .catch((error) => console.warn('Ubicación no disponible', error));
  }, [activeOrder?.id]);

  const handlePickedUp = async () => {
    if (!activeOrder) return;
    try {
      await markPickedUp(activeOrder.id);
    } catch (error) {
      Alert.alert('Error', 'No pudimos actualizar el estado.');
    }
  };

  const handleDelivered = async () => {
    if (!activeOrder) return;
    if (!confirmationCode.trim()) {
      Alert.alert('Código requerido', 'Ingresa el código de confirmación del cliente.');
      return;
    }
    try {
      await markDelivered(activeOrder.id, confirmationCode.trim());
      setConfirmationCode('');
    } catch (error) {
      Alert.alert('Error', 'No pudimos marcar el pedido como entregado.');
    }
  };

  if (loadingActive) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.muted}>Buscando pedido activo...</Text>
      </View>
    );
  }

  if (!activeOrder) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No tienes pedidos activos</Text>
        <Text style={styles.muted}>Acepta un pedido para comenzar el seguimiento.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <Text style={styles.title}>Pedido en curso</Text>
      <MapViewCard order={activeOrder} courierLocation={courierLocation} />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <Text style={styles.text}>Restaurante: {activeOrder.restaurant.name}</Text>
        <Text style={styles.text}>Dirección del cliente: {activeOrder.address.line1}</Text>
        <Text style={styles.text}>Contacto: {activeOrder.user?.name ?? 'Cliente'}</Text>
        {activeOrder.user?.phone && <Text style={styles.text}>Teléfono: {activeOrder.user.phone}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Acciones</Text>
        <Button title="Pedido recogido" onPress={handlePickedUp} loading={updatingStatus} />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Código de entrega</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 1234"
            placeholderTextColor={COLORS.muted}
            value={confirmationCode}
            onChangeText={setConfirmationCode}
            keyboardType="number-pad"
          />
        </View>
        <Button
          title="Pedido entregado"
          onPress={handleDelivered}
          loading={updatingStatus}
          disabled={!confirmationCode}
        />
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
    padding: 16,
  },
  muted: {
    color: COLORS.muted,
    marginTop: 8,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
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
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  text: {
    color: COLORS.white,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.white,
    backgroundColor: COLORS.background,
  },
});
