import { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useOrderStore } from '../../src/stores/orderStore';
import { COLORS } from '../../constants/colors';

const formatCurrency = (cents: number) => `L.${(cents / 100).toFixed(2)}`;

export default function HistoryScreen() {
  const { history, fetchHistory, loadingHistory } = useOrderStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de entregas</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        onRefresh={fetchHistory}
        refreshing={loadingHistory}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.restaurant}>{item.restaurant.name}</Text>
              <Text style={styles.amount}>{formatCurrency(item.totalCents)}</Text>
            </View>
            <Text style={styles.subtitle}>{item.address.line1}</Text>
            <Text style={styles.badge}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin entregas registradas</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingTop: 48,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  restaurant: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  amount: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.muted,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    color: COLORS.muted,
  },
});
