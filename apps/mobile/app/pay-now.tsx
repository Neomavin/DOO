import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../src/stores/cartStore';
import Button from '../src/components/Button';
import cartService from '../services/cart.service';
import ordersService from '../services/orders.service';
import addressesService, { Address } from '../services/addresses.service';
import { useCheckoutStore } from '../src/stores/checkoutStore';
import { COLORS } from '../constants/colors';
import paymentsService from '../services/payments.service';

const formatCurrency = (value: number) => `L.${value.toFixed(2)}`;
const toCents = (value: number) => Math.round(value * 100);

export default function PayNowScreen() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const setItems = useCartStore((state) => state.setItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  const {
    paymentMethod,
    cardDetails,
    cashDetails,
    transferDetails,
    notes,
    setLastOrder,
    selectedAddressId,
    selectedAddressLabel,
    setSelectedAddress,
  } = useCheckoutStore();

  const subtotal = getSubtotal();
  const tax = subtotal * 0.15;
  const delivery = items.length > 0 ? 40 : 0;
  const total = subtotal + tax + delivery;

  const paymentInfo = useMemo(() => {
    const map = {
      card: {
        label: 'Tarjeta de Crédito',
        detail: cardDetails.last4 ? `•••• ${cardDetails.last4}` : 'Tarjeta registrada',
        method: 'CARD',
        icon: '💳',
      },
      cash: {
        label: 'Efectivo',
        detail: cashDetails.amount ? `Pagará con ${cashDetails.amount}` : 'Pagar al repartidor',
        method: 'CASH',
        icon: '💵',
      },
      transfer: {
        label: 'Transferencia Bancaria',
        detail: transferDetails.reference ? `Ref: ${transferDetails.reference}` : 'Banco Atlántida',
        method: 'TRANSFER',
        icon: '🏦',
      },
    } as const;
    return map[paymentMethod] ?? map.card;
  }, [paymentMethod, cardDetails.last4, cashDetails.amount, transferDetails.reference]);

  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
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
    const loadAddress = async () => {
      try {
        setAddressLoading(true);
        const data = await addressesService.getAddresses();
        const preferred =
          (selectedAddressId && data.find((addr) => addr.id === selectedAddressId)) ||
          data.find((addr) => addr.isDefault) ||
          data[0] ||
          null;
        if (!preferred) {
          setAddress(null);
          setAddressError('Necesitas registrar una dirección antes de confirmar el pedido.');
        } else {
          setAddress(preferred);
          const label = `${preferred.label} · ${preferred.city}`;
          if (!selectedAddressId || selectedAddressLabel !== label) {
            setSelectedAddress(preferred.id, label);
          }
          setAddressError(null);
        }
      } catch (error) {
        console.error('Error cargando direcciones', error);
        setAddressError('No pudimos cargar tu dirección. Intenta más tarde.');
      } finally {
        setAddressLoading(false);
      }
    };

    loadAddress();
  }, [selectedAddressId, selectedAddressLabel, setSelectedAddress]);

  const summaryItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceCents: toCents(item.price),
      })),
    [items]
  );

  const handlePayment = async () => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de realizar el pago.');
      return;
    }
    if (!restaurantId) {
      Alert.alert('Restaurante no disponible', 'Vuelve a seleccionar tus productos.');
      return;
    }
    if (!address) {
      Alert.alert('Sin dirección', addressError || 'Agrega una dirección para continuar.');
      return;
    }

    setProcessing(true);
    try {
      if (paymentMethod !== 'cash') {
        const intent = await paymentsService.createIntent(toCents(total));
        await paymentsService.confirmPayment(
          intent.id,
          paymentMethod === 'card'
            ? `pm_card_${cardDetails.last4 ?? '0000'}`
            : transferDetails.reference || 'pm_transfer',
        );
      }

      const order = await ordersService.createOrder({
        restaurantId,
        addressId: address.id,
        items: summaryItems,
        subtotalCents: toCents(subtotal),
        taxCents: toCents(tax),
        deliveryCents: toCents(delivery),
        totalCents: toCents(total),
        paymentMethod: paymentInfo.method,
        notes: notes || undefined,
      });

      await cartService.clearCart();
      clearCart();
      setLastOrder(order);

      if (order?.confirmationCode) {
        router.replace({
          pathname: '/confirm-code',
          params: { id: order.id },
        });
      } else {
        router.replace('/success');
      }
    } catch (error: any) {
      console.error('Error creando pedido', error);
      const message = error.response?.data?.message || 'No pudimos procesar el pago. Intenta de nuevo.';
      Alert.alert('Error', message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={processing}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirmar Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen del Pago</Text>

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
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Método de Pago</Text>
          <View style={styles.methodRow}>
            <Text style={styles.methodIcon}>{paymentInfo.icon}</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{paymentInfo.label}</Text>
              <Text style={styles.methodDetails}>{paymentInfo.detail}</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.changeText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dirección de Entrega</Text>
          {addressLoading ? (
            <ActivityIndicator color={COLORS.accent} />
          ) : address ? (
            <TouchableOpacity
              style={styles.addressRow}
              onPress={() => router.push('/checkout/select-address')}
            >
              <Text style={styles.addressIcon}>📍</Text>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{selectedAddressLabel ?? address.label}</Text>
                <Text style={styles.addressText}>
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''} · {address.city}
                </Text>
              </View>
              <Text style={styles.changeText}>Cambiar</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.addressError}>{addressError}</Text>
          )}
        </View>

        {notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notas</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        ) : null}

        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>Tu pago está protegido con encriptación de extremo a extremo</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={processing ? 'Procesando...' : `Pagar ${formatCurrency(total)}`}
          onPress={handlePayment}
          loading={processing}
          disabled={processing || !address}
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 13,
    color: COLORS.muted,
  },
  changeText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  addressError: {
    fontSize: 13,
    color: COLORS.accent,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2a1f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#88aa88',
    lineHeight: 18,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
