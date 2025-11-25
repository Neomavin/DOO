import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import authService from '../services/auth.service';
import { COLORS } from '../constants/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      Alert.alert(
        'Revisa tu correo',
        'Si tu correo existe, recibirás instrucciones para restablecer tu contraseña.',
        [{ text: 'Volver al login', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'No se pudo procesar la solicitud.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}> 
      <View style={styles.card}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>
          Ingresa tu email y te enviaremos instrucciones para restablecerla.
        </Text>
        <TextInput
          style={[styles.input, { borderColor: COLORS.border, color: COLORS.white, backgroundColor: COLORS.primary }]}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.accent }, loading && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Enviar instrucciones'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  link: {
    textAlign: 'center',
    color: COLORS.accent,
    fontWeight: '600',
  },
});
