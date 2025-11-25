import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import addressesService from '../../services/addresses.service';
import locationService from '../../services/location.service';
import Button from '../../src/components/Button';
import { COLORS } from '../../constants/colors';

export default function NewAddressScreen() {
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const location = await locationService.getCurrentLocation();
      setLat(location.lat.toString());
      setLng(location.lng.toString());
      
      // Intentar obtener la dirección legible
      const address = await locationService.getAddressFromCoordinates(location.lat, location.lng);
      if (address !== 'Dirección desconocida' && !line1) {
        setLine1(address);
      }
      
      Alert.alert('✅ Ubicación detectada', 'Se obtuvo tu ubicación actual correctamente');
    } catch (error: any) {
      console.error('Error detectando ubicación:', error);
      Alert.alert('Error', error.message || 'No pudimos obtener tu ubicación. Verifica que el GPS esté activado.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!label || !line1 || !city) {
      Alert.alert('Campos incompletos', 'Llena al menos etiqueta, dirección y ciudad.');
      return;
    }

    setSaving(true);
    try {
      await addressesService.createAddress({
        label,
        line1,
        line2: line2 || undefined,
        city,
        lat: Number(lat) || 0,
        lng: Number(lng) || 0,
      });
      Alert.alert('Dirección guardada', 'Se agregó correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Error guardando dirección', err);
      Alert.alert('Error', 'No pudimos guardar la dirección. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Dirección</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.formGroup}>
          <Text style={styles.label}>Etiqueta</Text>
          <TextInput
            style={styles.input}
            placeholder="Casa, Oficina..."
            placeholderTextColor={COLORS.muted}
            value={label}
            onChangeText={setLabel}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            placeholder="Calle principal #123"
            placeholderTextColor={COLORS.muted}
            value={line1}
            onChangeText={setLine1}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Referencia (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Apto 4B, frente al parque..."
            placeholderTextColor={COLORS.muted}
            value={line2}
            onChangeText={setLine2}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ocotepeque"
            placeholderTextColor={COLORS.muted}
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Botón para detectar ubicación */}
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={handleDetectLocation}
          disabled={detectingLocation}
        >
          {detectingLocation ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.locationIcon}>📍</Text>
          )}
          <Text style={styles.locationButtonText}>
            {detectingLocation ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
          </Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Latitud (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="14.4370"
              placeholderTextColor={COLORS.muted}
              value={lat}
              onChangeText={setLat}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={styles.spacer} />
          <View style={[styles.formGroup, styles.flex]}>
            <Text style={styles.label}>Longitud (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="-89.1833"
              placeholderTextColor={COLORS.muted}
              value={lng}
              onChangeText={setLng}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
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
  row: {
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
