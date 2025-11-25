import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, useWindowDimensions, LayoutChangeEvent, ImageBackground, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import restaurantsService, { Restaurant } from '../../services/restaurants.service';
import authService from '../../services/auth.service';
import locationService from '../../services/location.service';
import { useAuthStore } from '../../src/stores/authStore';
import { useLocationStore } from '../../src/stores/locationStore';
import { COLORS } from '../../constants/colors';

const categories = [
  { id: 'all', name: 'All', tag: '' },
  { id: 'pizza', name: 'Pizza', tag: 'pizza' },
  { id: 'burgers', name: 'Burgers', tag: 'burger' },
  { id: 'sushi', name: 'Sushi', tag: 'sushi' },
  { id: 'tacos', name: 'Tacos', tag: 'taco' },
  { id: 'desserts', name: 'Desserts', tag: 'dessert' },
  { id: 'healthy', name: 'Healthy', tag: 'healthy' },
  { id: 'asian', name: 'Asian', tag: 'asian' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const userLocation = useLocationStore((state) => state.userLocation);
  const setUserLocation = useLocationStore((state) => state.setUserLocation);
  const scrollRef = useRef<ScrollView>(null);
  const chipMeasurements = useRef<Record<string, { x: number; width: number }>>({});
  const { width: windowWidth } = useWindowDimensions();
  const MAX_DISTANCE_KM = 15; // Radio máximo de búsqueda

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar perfil del usuario si aún no existe en memoria
      if (!user) {
        const profile = await authService.getProfile();
        updateUser(profile);
      }

      // Obtener ubicación del usuario si no existe
      if (!userLocation) {
        try {
          const location = await locationService.getCurrentLocation();
          setUserLocation(location);
        } catch (error) {
          console.log('No se pudo obtener ubicación, mostrando todos los restaurantes');
        }
      }

      // Cargar restaurantes
      const data = await restaurantsService.getFeatured();
      setRestaurants(data);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los restaurantes. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [user, updateUser, userLocation, setUserLocation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const selectedTag = useMemo(() => {
    const current = categories.find((category) => category.id === selectedCategoryId);
    return current?.tag ?? '';
  }, [selectedCategoryId]);

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;

    // Filtrar por categoría
    if (selectedTag) {
      const tagValue = selectedTag.toLowerCase();
      filtered = filtered.filter((restaurant) => {
        const haystack = `${restaurant.name} ${restaurant.slug}`.toLowerCase();
        return haystack.includes(tagValue);
      });
    }

    // Filtrar por distancia si hay ubicación del usuario
    if (userLocation) {
      filtered = filtered.filter((restaurant) => {
        const distance = locationService.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          restaurant.lat,
          restaurant.lng
        );
        return distance <= MAX_DISTANCE_KM;
      });

      // Ordenar por distancia (más cercanos primero)
      filtered = filtered.sort((a, b) => {
        const distanceA = locationService.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.lat,
          a.lng
        );
        const distanceB = locationService.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.lat,
          b.lng
        );
        return distanceA - distanceB;
      });
    }

    return filtered;
  }, [restaurants, selectedTag, userLocation]);

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleCategoryLayout = (id: string) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    chipMeasurements.current[id] = { x, width };
  };

  const centerCategoryChip = (id: string) => {
    const measurement = chipMeasurements.current[id];
    if (!measurement || !scrollRef.current) return;
    const targetOffset = measurement.x + measurement.width / 2 - windowWidth / 2;
    scrollRef.current.scrollTo({ x: Math.max(0, targetOffset), animated: true });
  };

  const handleCategoryPress = (id: string) => {
    setSelectedCategoryId(id);
    requestAnimationFrame(() => centerCategoryChip(id));
  };

  return (
    <View style={styles.container}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>DELIVER TO</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
            <Text style={styles.address}>Ocotepeque, HN</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.muted} style={{ marginLeft: 4 }} />
          </View>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
          <Ionicons name="person-outline" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.muted} style={{ marginRight: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor={COLORS.muted}
          />
        </View>

        {/* Categories */}
        <ScrollView 
          ref={scrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => {
            const isActive = category.id === selectedCategoryId;
            return (
            <TouchableOpacity 
              key={category.id} 
              style={[
                styles.categoryChip,
                isActive && styles.categoryChipActive
              ]}
                onPress={() => handleCategoryPress(category.id)}
                onLayout={handleCategoryLayout(category.id)}
            >
              <Text style={[
                styles.categoryText,
                isActive && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Banner */}
        <View style={styles.featuredBanner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <MaterialCommunityIcons name="bike-fast" size={24} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.bannerTitle}>Free Delivery</Text>
              <Text style={styles.bannerSubtitle}>On orders over $20</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </View>

        {/* Restaurants Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Near You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3].map((key) => (
                <View key={key} style={styles.skeletonCard}>
                  <View style={styles.skeletonImage} />
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, { width: '50%' }]} />
                </View>
              ))}
            </View>
          ) : filteredRestaurants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No encontramos opciones para esa categoría</Text>
            </View>
          ) : (
            filteredRestaurants.map((restaurant) => (
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
                {/* Badge */}
                {restaurant.isOpen && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Abierto</Text>
                  </View>
                )}
                
                {/* Restaurant Image */}
                <View style={styles.restaurantImage}>
                  <ImageBackground
                    source={{ uri: restaurant.bannerUrl }}
                    style={styles.imageBackground}
                    imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                  >
                    <View style={styles.imageOverlay} />
                    <Text style={styles.imageRestaurant}>{restaurant.name}</Text>
                  </ImageBackground>
                </View>
                
                {/* Restaurant Info */}
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantCategory}>Restaurante</Text>
                  
                  <View style={styles.restaurantMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={COLORS.accent} style={{ marginRight: 4 }} />
                      <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
                    </View>
                    <View style={styles.metaDivider} />
                    {userLocation ? (
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={14} color={COLORS.muted} style={{ marginRight: 4 }} />
                        <Text style={styles.etaText}>
                          {locationService.formatDistance(
                            locationService.calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              restaurant.lat,
                              restaurant.lng
                            )
                          )}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={COLORS.muted} style={{ marginRight: 4 }} />
                        <Text style={styles.etaText}>{restaurant.etaMinutes} min</Text>
                      </View>
                    )}
                    <View style={styles.metaDivider} />
                    <View style={styles.metaItem}>
                      <Ionicons name="bicycle-outline" size={14} color={COLORS.accent} style={{ marginRight: 4 }} />
                      <Text style={styles.deliveryText}>Gratis</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
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
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '400',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 24,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 0.2,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  featuredBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconContainer: {
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '400',
    opacity: 0.9,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  restaurantCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  restaurantImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.surface,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  imageRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  restaurantCategory: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 12,
    fontWeight: '400',
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  etaText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  deliveryText: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 160,
    backgroundColor: COLORS.surface,
    opacity: 0.5,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: COLORS.surface,
    opacity: 0.5,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 6,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.muted,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
