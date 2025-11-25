import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    badge: '01',
    title: 'Explora Restaurantes',
    description: 'Encuentra propuestas locales cuidadosamente seleccionadas.',
  },
  {
    id: '2',
    badge: '02',
    title: 'Entrega Rápida',
    description: 'Seguimiento en tiempo real para que sepas cuándo llegará tu pedido.',
  },
  {
    id: '3',
    badge: '03',
    title: 'Pago Seguro',
    description: 'Procesamos tus pagos con total seguridad y soporte local.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/login');
    }
  };


  const renderItem = ({ item }: any) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.badge, { borderColor: COLORS.accent }]}>
        <Text style={[styles.badgeText, { color: COLORS.accent }]}>{item.badge}</Text>
      </View>
      <Text style={[styles.title, { color: COLORS.white }]}>{item.title}</Text>
      <Text style={[styles.description, { color: COLORS.lightGray }]}>{item.description}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={[styles.footer, { backgroundColor: 'transparent' }]}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: COLORS.border },
                currentIndex === index && { backgroundColor: COLORS.accent, width: 32 },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.accent }]}
          onPress={scrollTo}
        >
          <Text style={[styles.buttonText, { color: COLORS.white }]}>
            {currentIndex === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={[styles.skipText, { color: COLORS.muted }]}>Saltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  badge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipText: {
    fontSize: 16,
    textAlign: 'center',
  },
  badgeText: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
