import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { Coordinates } from '../../services/location.service';
import { CourierOrder } from '../../services/orders.service';
import { COLORS } from '../../constants/colors';

interface Props {
  order: CourierOrder;
  courierLocation?: Coordinates | null;
}

export default function MapDisplay({ order, courierLocation }: Props) {
  const region = {
    latitude: courierLocation?.lat ?? order.restaurant.lat,
    longitude: courierLocation?.lng ?? order.restaurant.lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const points = [
    { latitude: order.restaurant.lat, longitude: order.restaurant.lng },
    { latitude: order.address.lat, longitude: order.address.lng },
  ];

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} provider={PROVIDER_GOOGLE} region={region}>
        <Marker
          coordinate={{ latitude: order.restaurant.lat, longitude: order.restaurant.lng }}
          title={order.restaurant.name}
          pinColor={COLORS.warning}
        />
        <Marker
          coordinate={{ latitude: order.address.lat, longitude: order.address.lng }}
          title={order.address.label}
          pinColor={COLORS.success}
        />
        {courierLocation && (
          <Marker
            coordinate={{ latitude: courierLocation.lat, longitude: courierLocation.lng }}
            title="Tu ubicación"
            pinColor={COLORS.accent}
          />
        )}
        <Polyline coordinates={points} strokeColor={COLORS.accent} strokeWidth={3} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
