import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import restaurantsService, { Restaurant } from '../services/restaurants.service';
import { COLORS } from '../constants/colors';

export default function CategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; tag?: string }>();
  const categoryName = typeof params.name === 'string' ? params.name : 'Categoría';
  const categoryTag = typeof params.tag === 'string' ? params.tag : undefined;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = categoryTag
          ? await restaurantsService.search(categoryTag)
          : await restaurantsService.getAll();
        if (!isMounted) return;
        const filtered =
          categoryTag && categoryName.toLowerCase() !== 'all'
            ? data.filter((restaurant) =>
                `${restaurant.name} ${restaurant.slug}`.toLowerCase().includes(categoryTag.toLowerCase()),
              )
            : data;
        setRestaurants(filtered);
      } catch (err) {
        console.error('Error cargando restaurantes por categoría', err);
        if (isMounted) {
          setError('No pudimos cargar esta categoría. Intenta nuevamente.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [categoryTag, categoryName]);

  const emptyMessage = useMemo(() => {
    if (error) return error;
    return 'No encontramos restaurantes para esta categoría.';
  }, [error]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{categoryName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.emptyText}>Buscando opciones deliciosas...</Text>
          </View>
        ) : restaurants.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        ) : (
          restaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() =>
                router.push({
                  pathname: '/restaurant/[id]',
                  params: { id: restaurant.id },
                })
              }
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{restaurant.isOpen ? 'Abierto' : 'Cerrado'}</Text>
              </View>
              <ImageBackground
                source={{ uri: restaurant.bannerUrl }}
                style={styles.cover}
                imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              >
                <View style={styles.coverOverlay} />
                <Text style={styles.coverTitle}>{restaurant.name}</Text>
              </ImageBackground>

              <View style={styles.cardBody}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantCategory}>{categoryName}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={14} color={COLORS.accent} />
                    <Text style={styles.metaText}>{restaurant.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.muted} />
                    <Text style={styles.metaText}>{restaurant.etaMinutes} min</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS.muted} />
                    <Text style={styles.metaText}>Ocotepeque</Text>
                  </View>
                </View>
              </View>
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
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },
  restaurantCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.black,
  },
  cover: {
    height: 160,
    justifyContent: 'flex-end',
    padding: 16,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  coverTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardBody: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  restaurantCategory: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
});
