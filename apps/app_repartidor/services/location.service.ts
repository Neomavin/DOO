import * as Location from 'expo-location';
import { Alert } from 'react-native';
import api from './api';

export interface Coordinates {
  lat: number;
  lng: number;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos tu ubicación para compartir el progreso del pedido.');
      return false;
    }
    return true;
  }

  async getCurrentLocation(): Promise<Coordinates> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permiso de ubicación denegado');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  }

  async updateLocation(lat: number, lng: number) {
    try {
      await api.post('/couriers/location', { lat, lng });
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
    }
  }

  async startTracking(orderStatus: 'PICKED_UP' | 'ON_ROUTE' | 'READY' = 'READY') {
    if (this.isTracking) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permiso de ubicación denegado');
    }

    this.isTracking = true;

    const accuracy = orderStatus === 'ON_ROUTE' ? Location.Accuracy.High : Location.Accuracy.Balanced;
    const timeInterval = orderStatus === 'ON_ROUTE' ? 5000 : 10000;

    this.watchSubscription = await Location.watchPositionAsync(
      {
        accuracy,
        timeInterval,
        distanceInterval: 10,
      },
      (location) => {
        this.updateLocation(location.coords.latitude, location.coords.longitude);
      },
    );
  }

  stopTracking() {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    this.isTracking = false;
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default new LocationService();
