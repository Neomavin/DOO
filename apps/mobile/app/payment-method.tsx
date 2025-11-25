import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '../src/components/Button';
import { COLORS } from '../constants/colors';
import { useCheckoutStore, PaymentSelection } from '../src/stores/checkoutStore';
import paymentsService, { PaymentMethod } from '../services/payments.service';
import { usePaymentMethodsStore } from '../src/stores/paymentMethodsStore';

export default function PaymentMethodScreen() {
  const router = useRouter();
  const {
    paymentMethod,
    selectPaymentMethod,
    cardDetails,
    cashDetails,
    transferDetails,
    setCardDetails,
    setCashDetails,
    setTransferDetails,
  } = useCheckoutStore();
  const savedMethods = usePaymentMethodsStore((state) => state.methods);
  const defaultSavedMethod = savedMethods.find((m) => m.isDefault);
  const [cardHolder, setCardHolder] = useState(cardDetails.holderName ?? '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cashAmount, setCashAmount] = useState(cashDetails.amount ?? '');
  const [transferReference, setTransferReference] = useState(transferDetails.reference ?? '');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  useEffect(() => {
    let mounted = true;
    paymentsService
      .getMethods()
      .then((data) => {
        if (!mounted) return;
        setMethods(data);
        // Ensure selected method still exists
        if (!data.find((method) => method.id === paymentMethod && method.enabled)) {
          const fallback = data.find((method) => method.enabled)?.id as PaymentSelection | undefined;
          if (fallback) {
            selectPaymentMethod(fallback);
          }
        }
      })
      .catch((err) => {
        console.error('Error cargando métodos de pago', err);
        Alert.alert('Pago', 'No pudimos cargar los métodos de pago. Usaremos opciones locales.');
      })
      .finally(() => {
        if (mounted) setLoadingMethods(false);
      });

    return () => {
      mounted = false;
    };
  }, [paymentMethod, selectPaymentMethod]);

  useEffect(() => {
    setCashAmount(cashDetails.amount ?? '');
    setTransferReference(transferDetails.reference ?? '');
  }, [cashDetails.amount, transferDetails.reference]);

  useEffect(() => {
    if (defaultSavedMethod) {
      selectPaymentMethod(defaultSavedMethod.type);
      if (defaultSavedMethod.type === 'card') {
        setCardDetails({
          holderName: defaultSavedMethod.details.holder,
          last4: defaultSavedMethod.details.last4,
        });
      }
    }
  }, [defaultSavedMethod, selectPaymentMethod, setCardDetails]);

  const handleContinue = () => {
    if (paymentMethod === 'card') {
      if (!cardHolder || cardNumber.length < 12 || !cardExpiry) {
        Alert.alert('Datos incompletos', 'Ingresa los datos de tu tarjeta para continuar.');
        return;
      }
      setCardDetails({
        holderName: cardHolder,
        last4: cardNumber.slice(-4),
        expiry: cardExpiry,
      });
    }

    if (paymentMethod === 'cash') {
      setCashDetails({ amount: cashAmount });
    }

    if (paymentMethod === 'transfer') {
      if (!transferReference) {
        Alert.alert('Referencia requerida', 'Ingresa el número de comprobante de la transferencia.');
        return;
      }
      setTransferDetails({ reference: transferReference });
    }

    router.push({ pathname: '/pay-now' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Método de Pago</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Selecciona cómo deseas pagar</Text>

        {loadingMethods ? (
          <View style={styles.loadingMethods}>
            <ActivityIndicator color={COLORS.accent} />
            <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
          </View>
        ) : (
          (methods.length
            ? methods
            : [
                { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳', enabled: true },
                { id: 'cash', name: 'Efectivo', icon: '💵', enabled: true },
                { id: 'transfer', name: 'Transferencia Bancaria', icon: '🏦', enabled: true },
              ]
          ).map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              paymentMethod === method.id && styles.methodCardSelected,
            ]}
            onPress={() => selectPaymentMethod(method.id as PaymentSelection)}
            disabled={!method.enabled}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodEmoji}>{method.icon}</Text>
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              {!method.enabled && (
                <Text style={styles.methodDisabled}>No disponible</Text>
              )}
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === method.id && styles.radioSelected,
              ]}
            >
              {paymentMethod === method.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        )))}

        {paymentMethod === 'card' && (
          <View style={styles.cardForm}>
            <Text style={styles.formTitle}>Información de la Tarjeta</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre en la tarjeta</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Juan Pérez"
                placeholderTextColor={COLORS.muted}
                value={cardHolder}
                onChangeText={setCardHolder}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Número de Tarjeta</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={COLORS.muted}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Vencimiento</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/AA"
                  placeholderTextColor={COLORS.muted}
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {paymentMethod === 'cash' && (
          <View style={styles.cashForm}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color={COLORS.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Pago en Efectivo</Text>
                <Text style={styles.infoText}>
                  Pagarás al repartidor cuando recibas tu pedido. Asegúrate de tener el monto exacto o cambio disponible.
                </Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>¿Con cuánto vas a pagar? (Opcional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: L.500"
                placeholderTextColor={COLORS.muted}
                value={cashAmount}
                onChangeText={setCashAmount}
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>
                Esto ayuda al repartidor a llevar el cambio adecuado
              </Text>
            </View>

            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Consejos:</Text>
              <Text style={styles.tipItem}>• Ten el dinero listo para agilizar la entrega</Text>
              <Text style={styles.tipItem}>• Verifica tu pedido antes de pagar</Text>
              <Text style={styles.tipItem}>• El repartidor te dará tu factura</Text>
            </View>
          </View>
        )}

        {paymentMethod === 'transfer' && (
          <View style={styles.transferForm}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color={COLORS.accent} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Transferencia Bancaria</Text>
                <Text style={styles.infoText}>
                  Realiza la transferencia a nuestra cuenta y envía el comprobante.
                </Text>
              </View>
            </View>

            <View style={styles.bankInfo}>
              <Text style={styles.bankLabel}>Banco:</Text>
              <Text style={styles.bankValue}>Banco Atlántida</Text>
              <Text style={styles.bankLabel}>Cuenta:</Text>
              <Text style={styles.bankValue}>1234-5678-9012-3456</Text>
              <Text style={styles.bankLabel}>A nombre de:</Text>
              <Text style={styles.bankValue}>Delivery Ocotepeque S.A.</Text>
              <Text style={[styles.bankLabel, { marginTop: 12 }]}>Número de comprobante</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ref. bancaria"
                placeholderTextColor={COLORS.muted}
                value={transferReference}
                onChangeText={setTransferReference}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button title="Continuar" onPress={handleContinue} />
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
  subtitle: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surface,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodEmoji: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  methodDisabled: {
    fontSize: 12,
    color: COLORS.muted,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.accent,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },
  cardForm: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  cashForm: {
    marginTop: 8,
  },
  transferForm: {
    marginTop: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.white,
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  tipsBox: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 8,
    lineHeight: 20,
  },
  bankInfo: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  bankLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 8,
  },
  bankValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  loadingMethods: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
