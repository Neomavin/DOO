import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../src/stores/cartStore';
import Button from '../src/components/Button';
import cartService from '../services/cart.service';
import { COLORS } from '../constants/colors';

const formatCurrency = (value: number) => `L.${value.toFixed(2)}`;

export default function ConfirmOrderScreen() {
  const router = useRouter();
  const { items, setItems, getSubtotal } = useCartStore((state) => ({
    items: state.items,
    setItems: state.setItems,
    getSubtotal: state.getSubtotal,
  }));
  const subtotal = getSubtotal();
  const tax = subtotal * 0.15;
  const delivery = items.length > 0 ? 40 : 0;
  const total = subtotal + tax + delivery;

  useEffect(() => {
    if (items.length === 0) {
      cartService
        .getCart()
        .then(setItems)
        .catch((err) => console.error('Error sincronizando carrito', err));
    }
  }, [items.length, setItems]);

  const renderItemVisual = (image?: string | null, name?: string) => {
    if (image?.startsWith('http')) {
      return <Image source={{ uri: image }} style={styles.itemImage} />;
    }
    if (image) {
      return <Text style={styles.itemEmoji}>{image}</Text>;
    }
    return <Text style={styles.itemEmoji}>{name?.charAt(0)}</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirmar Pedido</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Productos</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemVisual}>{renderItemVisual(item.image, item.name)}</View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.confirmBox}>
          <Text style={styles.confirmIcon}>✓</Text>
          <Text style={styles.confirmText}>
            Al confirmar, aceptas los términos y condiciones
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen de Pago</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Impuesto (15%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entrega</Text>
            <Text style={styles.summaryValue}>{formatCurrency(delivery)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Confirmar y Pagar"
          onPress={() => router.push('/payment-method')}
          disabled={items.length === 0}
        />
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
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemVisual: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  itemEmoji: {
    fontSize: 20,
    color: COLORS.white,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: COLORS.white,
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.muted,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  confirmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  confirmIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  confirmText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.muted,
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
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
});
