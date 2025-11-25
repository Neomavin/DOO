import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../src/components/Button';
import { useCheckoutStore } from '../src/stores/checkoutStore';
import { COLORS } from '../constants/colors';

export default function ConfirmCodeScreen() {
  const router = useRouter();
  const { lastOrder } = useCheckoutStore();
  const expectedCode = lastOrder?.confirmationCode;
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<TextInput[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);

    if (sanitized && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleConfirm = () => {
    if (!lastOrder) {
      Alert.alert('Sin pedido', 'Crea un pedido antes de confirmar el código.');
      router.replace('/(tabs)/home');
      return;
    }

    if (!expectedCode) {
      router.replace('/success');
      return;
    }

    const fullCode = code.join('');
    if (fullCode.length < 4) {
      Alert.alert('Código incompleto', 'Ingresa los 4 dígitos del código enviado.');
      return;
    }

    if (fullCode !== expectedCode) {
      Alert.alert('Código incorrecto', 'Verifica el código e inténtalo nuevamente.');
      return;
    }

    router.replace('/success');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>📱</Text>
        <Text style={styles.title}>Código de Confirmación</Text>
        <Text style={styles.subtitle}>
          Ingresa el código de 4 dígitos enviado a tu teléfono
        </Text>

        {expectedCode ? (
          <Text style={styles.helperText}>Código para tu referencia: {expectedCode}</Text>
        ) : (
          <Text style={styles.helperText}>Este pedido no requiere verificación adicional.</Text>
        )}

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => ref && (inputs.current[index] = ref)}
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Código reenviado',
              'Enviaremos el código nuevamente a tu número registrado.',
            )
          }
        >
          <Text style={styles.resendText}>Reenviar código</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button title="Confirmar" onPress={handleConfirm} />
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
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    fontSize: 28,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 40,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 20,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  codeInput: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  resendText: {
    fontSize: 15,
    color: '#FF7C4D',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
});
