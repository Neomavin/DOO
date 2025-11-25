import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const SUPPORT_EMAIL = 'soporte@delivery-ocotepeque.com';
const SUPPORT_PHONE = '+504 1234-5678';

export default function SupportScreen() {
  const router = useRouter();

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ayuda y Soporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contáctanos</Text>
          <Text style={styles.cardText}>
            ¿Tienes alguna duda o problema con tu pedido? Escríbenos o llámanos y con gusto te ayudamos.
          </Text>

          <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={24} color={COLORS.accent} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Correo electrónico</Text>
              <Text style={styles.contactValue}>{SUPPORT_EMAIL}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
            <Ionicons name="call-outline" size={24} color={COLORS.accent} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Teléfono</Text>
              <Text style={styles.contactValue}>{SUPPORT_PHONE}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preguntas frecuentes</Text>
          {[
            {
              question: '¿Dónde está mi pedido?',
              answer: 'Consulta el estado en Historial de Pedidos. Te notificaremos cuando esté en camino.',
            },
            {
              question: '¿Cómo reporto un problema?',
              answer: 'Puedes escribirnos al correo o teléfono arriba para ayudarte lo antes posible.',
            },
            {
              question: '¿Cómo actualizo mi dirección?',
              answer: 'Ve a Mis Direcciones y agrega o edita tus ubicaciones favoritas.',
            },
          ].map((faq) => (
            <View key={faq.question} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactInfo: {
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  faqItem: {
    marginTop: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },
});
