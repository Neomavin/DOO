import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import addressesService, { Address } from '../../services/addresses.service';
import { COLORS } from '../../constants/colors';
import { useCheckoutStore } from '../../src/stores/checkoutStore';

export default function SelectAddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSelectedAddress = useCheckoutStore((state) => state.setSelectedAddress);

  const loadAddresses = useCallback(async () => {
    try {
      setError(null);
      const data = await addressesService.getAddresses();
      setAddresses(data);
    } catch (err) {
      setError('No pudimos cargar tus direcciones.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSelect = (address: Address) => {
    setSelectedAddress(address.id, `${address.label} · ${address.city}`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Seleccionar dirección</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadAddresses();
            }}
          />
        }
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={COLORS.accent} />
            <Text style={styles.emptyText}>Cargando direcciones...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tienes direcciones aún</Text>
            <Text style={styles.emptyText}>Agrega una nueva para continuar.</Text>
            <TouchableOpacity onPress={() => router.push('/addresses/new')}>
              <Text style={styles.link}>Agregar dirección</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <TouchableOpacity key={address.id} style={styles.card} onPress={() => handleSelect(address)}>
              <Text style={styles.cardTitle}>{address.label}</Text>
              <Text style={styles.cardText}>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''} · {address.city}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
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
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
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
    paddingHorizontal: 20,
  },
  link: {
    marginTop: 12,
    color: COLORS.accent,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.accent,
    marginTop: 12,
  },
});
