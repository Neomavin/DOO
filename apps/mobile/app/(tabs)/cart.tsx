import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import cartService from '../../services/cart.service';
import { useCartStore } from '../../src/stores/cartStore';
import { COLORS } from '../../constants/colors';

const formatCurrency = (value: number) => `L.${value.toFixed(2)}`;

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setItems(data);
    } catch (error) {
      console.error('Error cargando carrito', error);
      Alert.alert('Error', 'No pudimos cargar tu carrito. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [setItems]);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleQuantityChange = async (itemId: string, nextQuantity: number) => {
    try {
      setUpdatingItemId(itemId);
      const updatedItems =
        nextQuantity <= 0
          ? await cartService.removeItem(itemId)
          : await cartService.updateQuantity(itemId, nextQuantity);
      setItems(updatedItems);
    } catch (error) {
      console.error('Error actualizando carrito', error);
      Alert.alert('Error', 'No pudimos actualizar el producto. Intenta nuevamente.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos para continuar con el pedido.');
      return;
    }
    router.push('/overview');
  };

  const renderItemVisual = (image?: string | null, name?: string) => {
    if (image?.startsWith('http')) {
      return <Image source={{ uri: image }} style={styles.itemImage} />;
    }
    if (image) {
      return <Text style={styles.itemEmoji}>{image}</Text>;
    }
    return <Text style={styles.itemEmoji}>{name?.charAt(0)}</Text>;
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.15;
  const delivery = items.length > 0 ? 40 : 0;
  const total = subtotal + tax + delivery;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Carrito</Text>
        <Text style={styles.itemCount}>{items.length} productos</Text>
      </View>

      <ScrollView style={styles.items} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.emptyText}>Cargando tu carrito...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Carrito vacío</Text>
            <Text style={styles.emptyText}>Agrega productos para comenzar tu pedido</Text>
          </View>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemIcon}>{renderItemVisual(item.image, item.name)}</View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    disabled={updatingItemId === item.id}
                    onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  {updatingItemId === item.id ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.quantity}>{item.quantity}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.quantityButton}
                    disabled={updatingItemId === item.id}
                    onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.summary}>
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
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, items.length === 0 && styles.buttonDisabled]}
          onPress={handleCheckout}
          disabled={items.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
          <Text style={styles.checkoutTotal}>{formatCurrency(total)}</Text>
        </TouchableOpacity>
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
    padding: 24,
    paddingTop: 55,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.muted,
  },
  items: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  itemEmoji: {
    fontSize: 26,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.muted,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    minWidth: 24,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: COLORS.muted,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.accent,
  },
  footer: {
    padding: 24,
    paddingBottom: 30,
    backgroundColor: COLORS.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  checkoutButton: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  checkoutTotal: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
