import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import restaurantsService, { Restaurant } from '../../services/restaurants.service';
import { COLORS } from '../../constants/colors';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await restaurantsService.search(query.trim());
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Error buscando restaurantes', err);
        setError('No pudimos buscar restaurantes. Intenta nuevamente.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const renderLogo = (restaurant: Restaurant) => {
    if (restaurant.logoUrl && restaurant.logoUrl.startsWith('http')) {
      return <Image source={{ uri: restaurant.logoUrl }} style={styles.resultImage} />;
    }

    if (restaurant.logoUrl) {
      return <Text style={styles.resultEmoji}>{restaurant.logoUrl}</Text>;
    }

    return <Text style={styles.resultEmoji}>{restaurant.name.charAt(0)}</Text>;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (query.trim().length >= 3) {
        const data = await restaurantsService.search(query.trim());
        setResults(data);
        setError(null);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('No pudimos actualizar los resultados.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.muted} style={{ marginRight: 12 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Busca restaurantes o platillos..."
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      <ScrollView
        style={styles.results}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />}
      >
        {query.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Busca tu comida favorita</Text>
            <Text style={styles.emptyText}>
              Encuentra restaurantes, platillos y más
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.skeletonList}>
            {[1, 2, 3].map((key) => (
              <View key={key} style={styles.skeletonCard}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonBody}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, { width: '50%' }]} />
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="warning-outline" size={64} color={COLORS.accent} />
            <Text style={styles.emptyTitle}>Ups</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>Intenta con otra búsqueda</Text>
          </View>
        ) : (
          results.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.resultCard}
              onPress={() =>
                router.push({
                  pathname: '/restaurant/[id]',
                  params: { id: restaurant.id },
                })
              }
            >
              <View style={styles.resultIcon}>{renderLogo(restaurant)}</View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{restaurant.name}</Text>
                <Text style={styles.resultRestaurant}>
                  ⭐ {restaurant.rating.toFixed(1)} · {restaurant.etaMinutes} min
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          ))
        )}
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
    padding: 24,
    paddingTop: 55,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.white,
  },
  clearIcon: {
    fontSize: 20,
    color: COLORS.muted,
    padding: 4,
  },
  results: {
    flex: 1,
  },
  skeletonList: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  skeletonIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    opacity: 0.5,
    marginRight: 14,
  },
  skeletonBody: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: COLORS.surface,
    opacity: 0.5,
    borderRadius: 6,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resultEmoji: {
    fontSize: 26,
    color: COLORS.white,
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  resultRestaurant: {
    fontSize: 13,
    color: COLORS.muted,
  },
});
