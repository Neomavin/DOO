import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import addressesService from '../../services/addresses.service';
import Button from '../../src/components/Button';
import { COLORS } from '../../constants/colors';

export default function EditAddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const addressId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!addressId) return;
    addressesService
      .getAddresses()
      .then((data) => data.find((addr) => addr.id === addressId))
      .then((address) => {
        if (address) {
          setLabel(address.label);
          setLine1(address.line1);
          setLine2(address.line2 ?? '');
          setCity(address.city);
        }
      })
      .finally(() => setLoading(false));
  }, [addressId]);

  const handleSave = async () => {
    if (!addressId) return;
    if (!label || !line1 || !city) {
      Alert.alert('Campos incompletos', 'Completa etiqueta, dirección y ciudad.');
      return;
    }
    setSaving(true);
    try {
      await addressesService.updateAddress(addressId, {
        label,
        line1,
        line2,
        city,
      });
      Alert.alert('Dirección actualizada', 'Se guardaron los cambios.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('Error', 'No pudimos actualizar la dirección.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Cargando dirección...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Dirección</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Etiqueta</Text>
        <TextInput
          style={styles.input}
          placeholder="Casa, Oficina..."
          placeholderTextColor={COLORS.muted}
          value={label}
          onChangeText={setLabel}
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Calle principal #123"
          placeholderTextColor={COLORS.muted}
          value={line1}
          onChangeText={setLine1}
        />

        <Text style={styles.label}>Referencia (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Apto 4B, frente al parque..."
          placeholderTextColor={COLORS.muted}
          value={line2}
          onChangeText={setLine2}
        />

        <Text style={styles.label}>Ciudad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ocotepeque"
          placeholderTextColor={COLORS.muted}
          value={city}
          onChangeText={setCity}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button title={saving ? 'Guardando...' : 'Guardar cambios'} onPress={handleSave} loading={saving} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  loadingText: {
    color: COLORS.muted,
  },
});
