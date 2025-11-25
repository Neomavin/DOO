import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../src/stores/cartStore';
import Card from '../src/components/Card';
import Button from '../src/components/Button';
import cartService from '../services/cart.service';
import addressesService from '../services/addresses.service';
import { COLORS } from '../constants/colors';
import { useCheckoutStore } from '../src/stores/checkoutStore';

const formatCurrency = (value: number) => `L.${value.toFixed(2)}`;

export default function OverviewScreen() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const subtotal = getSubtotal();
  const tax = subtotal * 0.15;
  const delivery = items.length > 0 ? 40 : 0;
  const total = subtotal + tax + delivery;
  const notes = useCheckoutStore((state) => state.notes);
  const setNotes = useCheckoutStore((state) => state.setNotes);
  const selectedAddressLabel = useCheckoutStore((state) => state.selectedAddressLabel);
  const selectedAddressId = useCheckoutStore((state) => state.selectedAddressId);
  const setSelectedAddress = useCheckoutStore((state) => state.setSelectedAddress);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      cartService
        .getCart()
        .then(setItems)
        .catch((err) => console.error('Error sincronizando carrito', err));
    }
  }, [items.length, setItems]);

  useEffect(() => {
    let mounted = true;
    const fetchAddress = async () => {
      try {
        setAddressLoading(true);
        const data = await addressesService.getAddresses();
        if (!mounted) return;
        const preferred =
          (selectedAddressId && data.find((addr) => addr.id === selectedAddressId)) ||
          data.find((addr) => addr.isDefault) ||
          data[0];
        if (preferred) {
          const label = `${preferred.label} · ${preferred.city}`;
          if (!selectedAddressId || selectedAddressId !== preferred.id || selectedAddressLabel !== label) {
            setSelectedAddress(preferred.id, label);
          }
          setAddressError(null);
        } else {
          setAddressError('No tienes direcciones guardadas.');
        }
      } catch (error) {
        if (mounted) {
          setAddressError('No pudimos cargar tus direcciones.');
        }
      } finally {
        if (mounted) {
          setAddressLoading(false);
        }
      }
    };
    fetchAddress();
    return () => {
      mounted = false;
    };
  }, [selectedAddressId, selectedAddressLabel, setSelectedAddress]);

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Resumen del Pedido</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Items */}
        <Card>
          <Text style={styles.sectionTitle}>Productos</Text>
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
        </Card>

        {/* Address */}
        <Card>
          <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
          {addressLoading ? (
            <View style={styles.addressRow}>
              <ActivityIndicator color={COLORS.accent} />
              <Text style={styles.addressText}>Buscando direcciones...</Text>
            </View>
          ) : addressError ? (
            <Text style={styles.addressText}>{addressError}</Text>
          ) : (
            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>📍</Text>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{selectedAddressLabel ?? 'Selecciona una dirección'}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/checkout/select-address')}>
                <Text style={styles.changeText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Summary */}
        <Card>
          <Text style={styles.sectionTitle}>Resumen</Text>
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
        </Card>

        {/* Notes */}
        <Card>
          <Text style={styles.sectionTitle}>Notas (Opcional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Agregar instrucciones especiales..."
            placeholderTextColor={COLORS.muted}
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </Card>
      </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Continuar al Pago"
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
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
    marginBottom: 2,
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  changeText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  notesPlaceholder: {
    fontSize: 14,
    color: COLORS.muted,
    fontStyle: 'italic',
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.white,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
