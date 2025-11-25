import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface Coordinates {
  lat: number;
  lng: number;
}

class LocationService {
  private currentLocation: Coordinates | null = null;

  /**
   * Solicita permisos de ubicación al usuario
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tu ubicación para mostrarte restaurantes cercanos y calcular tiempos de entrega.'
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error solicitando permisos de ubicación:', error);
      return false;
    }
  }

  /**
   * Obtiene la ubicación actual del usuario
   */
  async getCurrentLocation(): Promise<Coordinates> {
    const hasPermission = await this.requestPermissions();
    
    if (!hasPermission) {
      throw new Error('Permiso de ubicación denegado');
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      this.currentLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      throw new Error('No pudimos obtener tu ubicación. Verifica que el GPS esté activado.');
    }
  }

  /**
   * Obtiene la última ubicación conocida (sin solicitar nueva)
   */
  getLastKnownLocation(): Coordinates | null {
    return this.currentLocation;
  }

  /**
   * Calcula la distancia entre dos puntos en kilómetros
   * Usa la fórmula de Haversine
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Calcula el tiempo estimado de entrega basado en la distancia
   * Asume velocidad promedio de 30 km/h + 15 minutos de preparación
   */
  calculateEstimatedDeliveryTime(distanceKm: number): number {
    const preparationTime = 15; // minutos
    const averageSpeed = 30; // km/h
    const travelTime = (distanceKm / averageSpeed) * 60; // convertir a minutos
    
    return Math.ceil(preparationTime + travelTime);
  }

  /**
   * Verifica si una ubicación está dentro del área de cobertura
   * @param centerLat Latitud del centro de cobertura (ej: centro de Ocotepeque)
   * @param centerLng Longitud del centro de cobertura
   * @param radiusKm Radio de cobertura en kilómetros
   */
  isWithinCoverageArea(
    userLat: number,
    userLng: number,
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(userLat, userLng, centerLat, centerLng);
    return distance <= radiusKm;
  }

  /**
   * Formatea la distancia para mostrar al usuario
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  }

  /**
   * Convierte grados a radianes
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Obtiene la dirección legible desde coordenadas (geocoding inverso)
   */
  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      
      if (addresses.length > 0) {
        const address = addresses[0];
        const parts = [
          address.street,
          address.streetNumber,
          address.district,
          address.city,
        ].filter(Boolean);
        
        return parts.join(', ') || 'Dirección desconocida';
      }
      
      return 'Dirección desconocida';
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      return 'Dirección desconocida';
    }
  }

  /**
   * Verifica si los permisos de ubicación están otorgados
   */
  async hasLocationPermission(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  }
}

export default new LocationService();
