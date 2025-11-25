import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import restaurantsService, { RestaurantDetails, Product } from '../../services/restaurants.service';
import cartService from '../../services/cart.service';
import { useCartStore } from '../../src/stores/cartStore';
import { COLORS } from '../../constants/colors';
import Button from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRatingsStore } from '../../src/stores/ratingsStore';

const formatCurrency = (value: number) => `L.${value.toFixed(2)}`;

export default function RestaurantScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const setItems = useCartStore((state) => state.setItems);
  const restaurantRatings = useRatingsStore((state) => state.restaurantRatings);
  const rateRestaurant = useRatingsStore((state) => state.rateRestaurant);
  const [ratingValue, setRatingValue] = useState(
    restaurantRatings[restaurantId ?? '']?.rating ?? 0
  );
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const handleRestaurantRating = (value: number) => {
    setRatingValue(value);
  };

  const submitRestaurantRating = () => {
    if (!restaurantId) return;
    setRatingSubmitting(true);
    setTimeout(() => {
      rateRestaurant(restaurantId, ratingValue);
      setRatingSubmitting(false);
      Alert.alert('Gracias', 'Tu calificación ayuda a toda la comunidad.');
    }, 400);
  };

  useEffect(() => {
    if (!restaurantId) return;
    restaurantsService
      .getById(restaurantId)
      .then((data) => setRestaurant(data))
      .catch(() => setError('No pudimos cargar el restaurante.'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const renderProductVisual = (product: Product) => {
    if (product.imageUrl?.startsWith('http')) {
      return <Image source={{ uri: product.imageUrl }} style={styles.productImage} />;
    }
    if (product.imageUrl) {
      return <Text style={styles.productEmoji}>{product.imageUrl}</Text>;
    }
    return <Text style={styles.productEmoji}>{product.name.charAt(0)}</Text>;
  };

  const handleAddToCart = async (product: Product) => {
    if (!product.available) {
      Alert.alert('Producto no disponible', 'Este platillo está agotado por el momento.');
      return;
    }

    setAddingProductId(product.id);
    try {
      const updatedItems = await cartService.addItem(product.id, 1);
      setItems(updatedItems);
      Alert.alert('Agregado', `${product.name} se añadió a tu carrito.`);
    } catch (err) {
      console.error('Error agregando producto al carrito', err);
      Alert.alert('Error', 'No pudimos agregar el producto. Intenta nuevamente.');
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error ?? 'Restaurante no disponible'}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrapper}>
          <ImageBackground
            source={{ uri: restaurant.bannerUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay} />
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <View style={styles.heroContent}>
              <Text style={styles.heroName}>{restaurant.name}</Text>
              <Text style={styles.heroMeta}>
                ⭐ {restaurant.rating.toFixed(1)} · {restaurant.etaMinutes} min · {restaurant.isOpen ? 'Abierto' : 'Cerrado'}
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Menú</Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>¿Te gusta este restaurante?</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => handleRestaurantRating(value)}>
                <Ionicons
                  name={value <= ratingValue ? 'star' : 'star-outline'}
                  size={28}
                  color={COLORS.accent}
                  style={styles.ratingStar}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title={ratingSubmitting ? 'Enviando...' : 'Calificar'}
            onPress={submitRestaurantRating}
            disabled={ratingValue === 0}
            loading={ratingSubmitting}
            fullWidth={false}
          />
        </View>

        <View style={styles.productsWrapper}>
          {restaurant.products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productVisual}>{renderProductVisual(product)}</View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.categoryName ?? 'General'} · Prep. {product.prepTimeMinutes ?? 15} min</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                {product.ingredients && (
                  <Text style={styles.productIngredients}>Ingredientes: {product.ingredients}</Text>
                )}
                <View style={styles.productFooter}>
                  <View>
                    <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                    <Text
                      style={[
                        styles.productStatus,
                        product.available ? styles.statusAvailable : styles.statusUnavailable,
                      ]}
                    >
                      {product.available ? 'Disponible' : 'Agotado'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      (!product.available || addingProductId === product.id) && styles.addButtonDisabled,
                    ]}
                    onPress={() => handleAddToCart(product)}
                    disabled={!product.available || addingProductId === product.id}
                  >
                    {addingProductId === product.id ? (
                      <ActivityIndicator color={COLORS.black} />
                    ) : (
                      <Text style={styles.addButtonText}>Agregar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroWrapper: {
    height: 260,
  },
  heroImage: {
    flex: 1,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 20,
    color: COLORS.white,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  heroMeta: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  ratingSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  ratingStar: {
    marginHorizontal: 6,
  },
  productsWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  productCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
  },
  productVisual: {
    height: 160,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productEmoji: {
    fontSize: 48,
  },
  productInfo: {
    padding: 16,
    gap: 6,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.muted,
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  productIngredients: {
    fontSize: 12,
    color: COLORS.muted,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
  },
  productStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 110,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  statusAvailable: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  statusUnavailable: {
    backgroundColor: 'rgba(244,67,54,0.2)',
    color: '#f44336',
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 12,
  },
  link: {
    color: COLORS.accent,
    fontWeight: '600',
    fontSize: 16,
  },
});
