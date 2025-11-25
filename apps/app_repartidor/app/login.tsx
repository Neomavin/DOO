import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../src/components/Button';
import authService from '../services/auth.service';
import { COLORS } from '../constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Datos incompletos', 'Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await authService.login({ email, password });
      router.replace('/(tabs)/available');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos iniciar sesión.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.heading}>Modo Repartidor</Text>
        <Text style={styles.subtitle}>Accede con tu cuenta de courier para comenzar a recibir pedidos.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Ingresar" onPress={handleLogin} loading={loading} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  content: {
    gap: 24,
  },
  heading: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
