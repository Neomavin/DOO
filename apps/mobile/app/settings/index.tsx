import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Tema oscuro</Text>
            <Text style={styles.rowDescription}>Ajusta el modo nocturno de la app</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Notificaciones push</Text>
            <Text style={styles.rowDescription}>Recibe alertas de tus pedidos</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Idioma</Text>
        {[
          { id: 'es', label: 'Español' },
          { id: 'en', label: 'Inglés' },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.radioRow}
            onPress={() => setLanguage(item.id as 'es' | 'en')}
          >
            <Text style={styles.rowTitle}>{item.label}</Text>
            <Ionicons
              name={language === item.id ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={language === item.id ? COLORS.accent : COLORS.muted}
            />
          </TouchableOpacity>
        ))}
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 12,
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
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
