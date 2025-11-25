import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentMethodsStore } from '../../src/stores/paymentMethodsStore';
import Button from '../../src/components/Button';
import { COLORS } from '../../constants/colors';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const methods = usePaymentMethodsStore((state) => state.methods);
  const removeMethod = usePaymentMethodsStore((state) => state.removeMethod);
  const setDefault = usePaymentMethodsStore((state) => state.setDefault);

  const handleRemove = (id: string) => {
    Alert.alert('Eliminar método', '¿Seguro que deseas eliminar este método de pago?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeMethod(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Métodos de Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {methods.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Sin métodos guardados</Text>
            <Text style={styles.emptyText}>Agrega una tarjeta o transferencia para pagar más rápido.</Text>
          </View>
        ) : (
          methods.map((method) => (
            <View key={method.id} style={[styles.methodCard, method.isDefault && styles.methodCardDefault]}>
              <View style={styles.methodHeader}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                {method.isDefault && <Text style={styles.defaultBadge}>Predeterminado</Text>}
              </View>
              <Text style={styles.methodDetail}>
                {method.type === 'card'
                  ? `Tarjeta terminada en ${method.details.last4 ?? '----'}`
                  : method.type === 'transfer'
                  ? `Cuenta bancaria (${method.details.bank ?? 'Banco'})`
                  : 'Pago en efectivo'}
              </Text>
              {method.details.holder && <Text style={styles.methodDetail}>Titular: {method.details.holder}</Text>}

              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity onPress={() => setDefault(method.id)}>
                    <Text style={styles.actionText}>Usar como predeterminado</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleRemove(method.id)}>
                  <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Agregar método" onPress={() => router.push('/payment-methods/new')} />
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
  methodCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodCardDefault: {
    borderColor: COLORS.accent,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  defaultBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.black,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  methodDetail: {
    fontSize: 14,
    color: COLORS.muted,
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  deleteText: {
    color: '#ff5c5c',
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
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
