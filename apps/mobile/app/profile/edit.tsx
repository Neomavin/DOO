import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import Button from '../../src/components/Button';
import { COLORS } from '../../constants/colors';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa tu nombre completo.');
      return;
    }

    setSaving(true);
    try {
      updateUser({ name: name.trim(), phone: phone.trim() });
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron localmente.');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'No pudimos actualizar tus datos. Intenta de nuevo.');
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
        <Text style={styles.title}>Editar Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor={COLORS.muted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="+504 1234-5678"
          placeholderTextColor={COLORS.muted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
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
});
