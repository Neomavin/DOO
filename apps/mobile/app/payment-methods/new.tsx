import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import { COLORS } from '../../constants/colors';
import { usePaymentMethodsStore, SavedPaymentMethodType } from '../../src/stores/paymentMethodsStore';

export default function NewPaymentMethodScreen() {
  const router = useRouter();
  const addMethod = usePaymentMethodsStore((state) => state.addMethod);
  const [type, setType] = useState<SavedPaymentMethodType>('card');
  const [label, setLabel] = useState('');
  const [holder, setHolder] = useState('');
  const [last4, setLast4] = useState('');
  const [bank, setBank] = useState('');
  const [reference, setReference] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!label) {
      Alert.alert('Campos incompletos', 'Ingresa un nombre para identificar el método.');
      return;
    }

    if (!holder && type !== 'cash') {
      Alert.alert('Campos incompletos', 'Ingresa el titular de la cuenta o tarjeta.');
      return;
    }

    if (type === 'card' && last4.length !== 4) {
      Alert.alert('Tarjeta inválida', 'Ingresa los últimos 4 dígitos de la tarjeta.');
      return;
    }

    if (type === 'transfer' && !bank) {
      Alert.alert('Banco requerido', 'Ingresa el banco para la transferencia.');
      return;
    }

    setSaving(true);
    addMethod({
      type,
      label,
      details: {
        holder,
        last4: type === 'card' ? last4 : undefined,
        bank: type === 'transfer' ? bank : undefined,
        reference: type === 'transfer' ? reference : undefined,
      },
      isDefault,
    });
    setSaving(false);
    router.back();
  };

  const renderTypeFields = () => {
    if (type === 'card') {
      return (
        <>
          <Text style={styles.label}>Últimos 4 dígitos</Text>
          <TextInput
            style={styles.input}
            placeholder="1234"
            placeholderTextColor={COLORS.muted}
            value={last4}
            onChangeText={(value) => setLast4(value.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
          />
        </>
      );
    }

    if (type === 'transfer') {
      return (
        <>
          <Text style={styles.label}>Banco</Text>
          <TextInput
            style={styles.input}
            placeholder="Banco Atlántida"
            placeholderTextColor={COLORS.muted}
            value={bank}
            onChangeText={setBank}
          />
          <Text style={styles.label}>Referencia (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de cuenta o referencia"
            placeholderTextColor={COLORS.muted}
            value={reference}
            onChangeText={setReference}
          />
        </>
      );
    }

    return (
      <Text style={styles.helperText}>
        Con este método pagarás al repartidor cuando llegue con tu pedido.
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Método</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Tipo de pago</Text>
        <View style={styles.typeSelector}>
          {[
            { id: 'card', label: 'Tarjeta' },
            { id: 'cash', label: 'Efectivo' },
            { id: 'transfer', label: 'Transferencia' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.typeButton, type === option.id && styles.typeButtonActive]}
              onPress={() => setType(option.id as SavedPaymentMethodType)}
            >
              <Text style={[styles.typeButtonText, type === option.id && styles.typeButtonTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Etiqueta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Tarjeta personal"
          placeholderTextColor={COLORS.muted}
          value={label}
          onChangeText={setLabel}
        />

        {type !== 'cash' && (
          <>
            <Text style={styles.label}>Titular</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del titular"
              placeholderTextColor={COLORS.muted}
              value={holder}
              onChangeText={setHolder}
            />
          </>
        )}

        {renderTypeFields()}

        <TouchableOpacity style={styles.defaultRow} onPress={() => setIsDefault((prev) => !prev)}>
          <Ionicons
            name={isDefault ? 'checkbox' : 'square-outline'}
            size={22}
            color={isDefault ? COLORS.accent : COLORS.muted}
          />
          <Text style={styles.defaultText}>Usar como predeterminado</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={saving ? 'Guardando...' : 'Guardar'} onPress={handleSave} loading={saving} />
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  typeButtonText: {
    color: COLORS.muted,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: COLORS.black,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  defaultText: {
    color: COLORS.white,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
