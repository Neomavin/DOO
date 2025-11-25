import { View, Text, StyleSheet } from 'react-native';
import { CourierOrder } from '../../services/orders.service';
import Button from './Button';
import { COLORS } from '../../constants/colors';

interface Props {
  order: CourierOrder;
  onAccept?: () => void;
  onReject?: () => void;
}

const formatCurrency = (cents: number) => `L.${(cents / 100).toFixed(2)}`;

export default function OrderCard({ order, onAccept, onReject }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.restaurant}>{order.restaurant.name}</Text>
        <Text style={styles.total}>{formatCurrency(order.totalCents)}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Recoger en</Text>
        <Text style={styles.text}>{order.restaurant.address ?? 'Restaurante'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Entregar a</Text>
        <Text style={styles.text}>{order.address.line1}</Text>
        {order.address.line2 ? <Text style={styles.text}>{order.address.line2}</Text> : null}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Contacto</Text>
        <Text style={styles.text}>{order.user?.name ?? 'Cliente'}</Text>
        {order.user?.phone ? <Text style={styles.text}>{order.user.phone}</Text> : null}
      </View>
      {(onAccept || onReject) && (
        <View style={styles.actions}>
          {onReject && <Button title="Rechazar" variant="secondary" onPress={onReject} />}
          {onAccept && <Button title="Aceptar" onPress={onAccept} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurant: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 18,
  },
  total: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 18,
  },
  section: {
    marginBottom: 10,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  text: {
    color: COLORS.white,
    fontSize: 15,
  },
  actions: {
    marginTop: 12,
    gap: 10,
  },
});
