import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import addressesService, { Address } from '../../services/addresses.service';
import Button from '../../src/components/Button';
import { COLORS } from '../../constants/colors';

export default function AddressesScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      setError(null);
      const data = await addressesService.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Error cargando direcciones', err);
      setError('No pudimos cargar tus direcciones. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    try {
      await addressesService.updateAddress(address.id, { isDefault: true });
      loadAddresses();
    } catch (err) {
      Alert.alert('Error', 'No pudimos actualizar la dirección predeterminada.');
    }
  };

  const handleDelete = async (address: Address) => {
    Alert.alert('Eliminar dirección', `¿Deseas eliminar ${address.label}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await addressesService.deleteAddress(address.id);
            loadAddresses();
          } catch (err) {
            Alert.alert('Error', 'No pudimos eliminar esta dirección.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Direcciones</Text>
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
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.emptyText}>Cargando direcciones...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name='location-outline' size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Sin direcciones</Text>
            <Text style={styles.emptyText}>Agrega una dirección para facilitar tus pedidos.</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[styles.addressCard, address.isDefault && styles.addressCardDefault]}
              onPress={() => router.push({ pathname: '/addresses/edit', params: { id: address.id } })}
            >
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                {address.isDefault && <Text style={styles.badge}>Predeterminada</Text>}
              </View>
              <Text style={styles.addressText}>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ''} · {address.city}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleSetDefault(address)}>
                  <Text style={styles.actionText}>{address.isDefault ? 'Seleccionada' : 'Establecer predeterminada'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(address)}>
                  <Text style={[styles.actionText, styles.actionDelete]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        {error && !loading && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Agregar dirección" onPress={() => router.push('/addresses/new')} />
      </View>
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
  addressCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressCardDefault: {
    borderColor: COLORS.accent,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.black,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  actionDelete: {
    color: '#ff5c5c',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 80,
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
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: 12,
  },
});
