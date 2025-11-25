import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import authService from '../services/auth.service';
import { COLORS } from '../constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@food.dev');
  const [password, setPassword] = useState('Demo123!');
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Intentando login con:', email);
      const response = await authService.login({ email, password });
      console.log('✅ Login exitoso:', response.user.name);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      
      let message = 'Error al iniciar sesión';
      
      if (error.message?.includes('No pudimos comunicarnos')) {
        message = 'No se puede conectar al servidor.\n\nVerifica que:\n1. El backend esté corriendo\n2. La URL del API sea correcta\n3. Tu conexión a internet funcione';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.status === 401) {
        message = 'Credenciales inválidas.\n\nPrueba con:\nEmail: demo@food.dev\nContraseña: Demo123!';
      } else {
        message = error.message || 'Error desconocido. Revisa la consola para más detalles.';
      }
      
      Alert.alert('Error de Login', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={styles.hero}>
        <View style={[styles.logoBadge, { borderColor: COLORS.accent }]}>
          <Text style={[styles.logoLetter, { color: COLORS.accent }]}>DO</Text>
        </View>
        <Text style={[styles.title, { color: COLORS.white }]}>Bienvenido de nuevo</Text>
        <Text style={[styles.subtitle, { color: COLORS.lightGray }]}>
          Inicia sesión para continuar con tus pedidos
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: COLORS.surface }]}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: COLORS.white }]}>Email</Text>
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

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: COLORS.white }]}>Contraseña</Text>
          <TextInput
            style={[styles.input, { borderColor: COLORS.border, color: COLORS.white, backgroundColor: COLORS.primary }]}
            placeholder="••••••••"
            placeholderTextColor={COLORS.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity onPress={() => router.push('/forgot')}>
          <Text style={[styles.forgotText, { color: COLORS.muted }]}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: COLORS.accent },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: COLORS.white }]}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: COLORS.muted }]}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={[styles.registerLink, { color: COLORS.accent }]}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoLetter: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    ...CARD_SHADOW,
  },
  inputContainer: {
    marginBottom: 20,
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
  forgotText: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#888888',
    fontSize: 16,
  },
  registerLink: {
    color: '#FF7C4D',
    fontSize: 16,
    fontWeight: '600',
  },
});
