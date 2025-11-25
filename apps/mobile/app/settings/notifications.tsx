import { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [reminders, setReminders] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Actualizaciones de pedidos</Text>
            <Text style={styles.rowDescription}>Alertas de estado, entregas y cancelaciones</Text>
          </View>
          <Switch value={orderUpdates} onValueChange={setOrderUpdates} />
        </View>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Promociones</Text>
            <Text style={styles.rowDescription}>Ofertas especiales y descuentos</Text>
          </View>
          <Switch value={promotions} onValueChange={setPromotions} />
        </View>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Recordatorios</Text>
            <Text style={styles.rowDescription}>Recomendaciones basadas en tus pedidos</Text>
          </View>
          <Switch value={reminders} onValueChange={setReminders} />
        </View>
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
  section: {
    margin: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  rowDescription: {
    fontSize: 12,
    color: COLORS.muted,
  },
});
