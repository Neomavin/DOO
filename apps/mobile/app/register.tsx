import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import authService from '../services/auth.service';
import { COLORS } from '../constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authService.register({ name, email, password, phone });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Error en registro:', error);
      const message = error.response?.data?.message || 'No se pudo crear la cuenta. Verifica tus datos.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: COLORS.primary }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={[styles.logoBadge, { borderColor: COLORS.accent }]}>
          <Text style={[styles.logoLetter, { color: COLORS.accent }]}>DO</Text>
        </View>
        <Text style={[styles.title, { color: COLORS.white }]}>Crear Cuenta</Text>
        <Text style={[styles.subtitle, { color: COLORS.lightGray }]}>
          Regístrate para comenzar a ordenar sin fricción
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: COLORS.surface }]}>
        <Text style={[styles.sectionTitle, { color: COLORS.white }]}>Información personal</Text>
        <Text style={[styles.helperText, { color: COLORS.muted }]}>
          Tu nombre y teléfono ayudarán al repartidor a contactarte.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: COLORS.white }]}>Nombre Completo *</Text>
          <TextInput
            style={[styles.input, { borderColor: COLORS.border, color: COLORS.white, backgroundColor: COLORS.primary }]}
            placeholder="Juan Pérez"
            placeholderTextColor={COLORS.muted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex]}>
            <Text style={[styles.label, { color: COLORS.white }]}>Email *</Text>
            <TextInput
              style={[styles.input, { borderColor: COLORS.border, color: COLORS.white, backgroundColor: COLORS.primary }]}
              placeholder="tu@email.com"
              placeholderTextColor={COLORS.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={{ width: 16 }} />
          <View style={[styles.inputContainer, styles.flex]}>
            <Text style={[styles.label, { color: COLORS.white }]}>Teléfono</Text>
            <TextInput
              style={[styles.input, { borderColor: COLORS.border, color: COLORS.white, backgroundColor: COLORS.primary }]}
              placeholder="+504 1234-5678"
              placeholderTextColor={COLORS.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: COLORS.white, marginTop: 8 }]}>Credenciales</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: COLORS.white }]}>Contraseña *</Text>
          <TextInput
            style={[styles.input, { borderColor: COLORS.border, color: COLORS.white, backgroundColor: COLORS.primary }]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={COLORS.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: COLORS.white }]}>Confirmar Contraseña *</Text>
          <TextInput
            style={[styles.input, { borderColor: COLORS.border, color: COLORS.white, backgroundColor: COLORS.primary }]}
            placeholder="Repite tu contraseña"
            placeholderTextColor={COLORS.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: COLORS.accent },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: COLORS.white }]}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.loginContainer}>
        <Text style={[styles.loginText, { color: COLORS.muted }]}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={[styles.loginLink, { color: COLORS.accent }]}>Inicia Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const CARD_SHADOW: any = Platform.OS === 'web'
  ? { boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)' }
  : {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    ...CARD_SHADOW,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  flex: {
    flex: 1,
  },
});
