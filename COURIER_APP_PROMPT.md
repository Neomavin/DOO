# 🚴 PROMPT: App de Repartidores - Delivery Ocotepeque

## 📋 RESUMEN EJECUTIVO

Crear una **app móvil React Native/Expo para repartidores** que se integre con el backend existente. La app permitirá a los couriers ver pedidos disponibles, aceptarlos, navegar hacia ubicaciones, y confirmar entregas.

---

## 🎯 FUNCIONALIDADES CORE

1. ✅ Login exclusivo para repartidores (role: COURIER)
2. ✅ Ver lista de pedidos disponibles para entregar
3. ✅ Aceptar/rechazar pedidos
4. ✅ Ver pedido activo con mapa de navegación
5. ✅ Actualizar estado: Recogido → En camino → Entregado
6. ✅ Confirmar entrega con código
7. ✅ Ver historial de entregas y ganancias
8. ✅ Tracking de ubicación en tiempo real (WebSocket)
9. ✅ Toggle de disponibilidad (online/offline)

---

## 🏗️ ESTRUCTURA DEL PROYECTO

```
apps/courier/                    # 🆕 Nueva app
├── app/
│   ├── (tabs)/
│   │   ├── available.tsx       # Pedidos disponibles
│   │   ├── active.tsx          # Pedido activo + mapa
│   │   ├── history.tsx         # Historial
│   │   └── profile.tsx         # Perfil
│   ├── login.tsx
│   └── order/[id].tsx          # Detalle de pedido
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── orders.service.ts       # 🆕 Endpoints de courier
│   ├── location.service.ts     # 🆕 Geolocalización
│   └── socket.service.ts
├── src/
│   ├── components/
│   │   ├── OrderCard.tsx       # 🆕
│   │   ├── MapView.tsx         # 🆕
│   │   └── Button.tsx
│   └── stores/
│       ├── authStore.ts
│       └── orderStore.ts       # 🆕
└── package.json
```

---

## 🔧 CAMBIOS EN EL BACKEND

### 1. Actualizar Schema de Prisma

**Archivo:** `apps/api/prisma/schema.prisma`

**Agregar campos a User:**
```prisma
model User {
  // ... campos existentes
  isAvailable  Boolean?  @default(false)  // 🆕
  vehicleType  String?                    // 🆕 BIKE | MOTORCYCLE | CAR
  
  courierOrders Order[] @relation("CourierOrders")  // 🆕
}
```

**Agregar campos a Order:**
```prisma
model Order {
  // ... campos existentes
  courierId    String?      // 🆕
  acceptedAt   DateTime?    // 🆕
  pickedUpAt   DateTime?    // 🆕
  deliveredAt  DateTime?    // 🆕
  
  courier User? @relation("CourierOrders", fields: [courierId], references: [id])  // 🆕
}
```

**Migrar:**
```bash
cd apps/api
npx prisma migrate dev --name add_courier_fields
```

---

### 2. Crear Módulo de Couriers

**Archivos a crear:**
- `apps/api/src/couriers/couriers.controller.ts`
- `apps/api/src/couriers/couriers.service.ts`
- `apps/api/src/couriers/couriers.module.ts`

**Endpoints necesarios:**
```typescript
GET    /couriers/available-orders      // Pedidos disponibles
GET    /couriers/active-order           // Pedido activo del courier
POST   /couriers/orders/:id/accept     // Aceptar pedido
PATCH  /couriers/orders/:id/pickup     // Marcar como recogido
PATCH  /couriers/orders/:id/deliver    // Marcar como entregado
PATCH  /couriers/availability           // Toggle disponibilidad
POST   /couriers/location               // Actualizar ubicación
GET    /couriers/earnings               // Ver ganancias
GET    /couriers/history                // Historial de entregas
```

---

### 3. Implementar Guards de Roles

**Archivo:** `apps/api/src/auth/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.includes(user.role);
  }
}
```

**Decorador:**
```typescript
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

---

## 📱 IMPLEMENTACIÓN DE LA APP

### 1. Inicializar Proyecto

```bash
cd apps
npx create-expo-app courier --template blank-typescript
cd courier
pnpm add expo-router axios zustand socket.io-client
pnpm add @react-native-async-storage/async-storage
pnpm add expo-location react-native-maps
pnpm add react-native-safe-area-context react-native-screens
```

---

### 2. Servicios Principales

**`services/orders.service.ts`:**
```typescript
class OrdersService {
  async getAvailableOrders() {
    const { data } = await api.get('/couriers/available-orders');
    return data;
  }

  async getActiveOrder() {
    const { data } = await api.get('/couriers/active-order');
    return data;
  }

  async acceptOrder(orderId: string) {
    const { data } = await api.post(`/couriers/orders/${orderId}/accept`);
    return data;
  }

  async markPickedUp(orderId: string) {
    const { data } = await api.patch(`/couriers/orders/${orderId}/pickup`);
    return data;
  }

  async markDelivered(orderId: string, code: string) {
    const { data } = await api.patch(`/couriers/orders/${orderId}/deliver`, {
      confirmationCode: code,
    });
    return data;
  }
}
```

**`services/location.service.ts`:** (COMPLETO)
```typescript
import * as Location from 'expo-location';
import api from './api';

export interface Coordinates {
  lat: number;
  lng: number;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;

  /**
   * Solicita permisos de ubicación
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Obtiene ubicación actual
   */
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

  /**
   * Envía ubicación al backend (se emite al cliente via WebSocket)
   */
  async updateLocation(lat: number, lng: number) {
    try {
      await api.post('/couriers/location', { lat, lng });
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
    }
  }

  /**
   * Inicia tracking continuo de ubicación
   * Envía ubicación al backend cada vez que cambia
   */
  async startTracking() {
    if (this.isTracking) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Permiso de ubicación denegado');
    }

    this.isTracking = true;

    // Tracking en tiempo real con alta precisión
    this.watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,      // Actualizar cada 5 segundos
        distanceInterval: 10,    // O cada 10 metros
      },
      (location) => {
        // Enviar ubicación al backend (se emite al cliente)
        this.updateLocation(
          location.coords.latitude,
          location.coords.longitude
        );
      }
    );
  }

  /**
   * Detiene el tracking de ubicación
   */
  stopTracking() {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    this.isTracking = false;
  }

  /**
   * Calcula distancia entre dos puntos (Haversine)
   */
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
```

---

### 3. Pantallas Clave

**Login:** Verificar que `user.role === 'COURIER'`

**Available Orders:** Lista de pedidos con estado `READY` sin courier asignado

**Active Order (CON TRACKING EN TIEMPO REAL):** 
```typescript
import { useState, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import locationService from '../../services/location.service';

export default function ActiveOrderScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const [courierLocation, setCourierLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    loadActiveOrder();
    startLocationTracking();
    
    return () => {
      // Detener tracking al salir
      locationService.stopTracking();
    };
  }, []);

  const startLocationTracking = async () => {
    try {
      // Iniciar tracking continuo
      await locationService.startTracking();
      
      // Obtener ubicación inicial
      const location = await locationService.getCurrentLocation();
      setCourierLocation(location);
    } catch (error) {
      Alert.alert('Error', 'No pudimos acceder a tu ubicación');
    }
  };

  return (
    <View style={styles.container}>
      {/* Mapa con ubicación en tiempo real */}
      <MapView
        style={styles.map}
        region={{
          latitude: courierLocation?.lat || order?.restaurant.lat || 0,
          longitude: courierLocation?.lng || order?.restaurant.lng || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Pin del restaurante */}
        {order && (
          <Marker
            coordinate={{
              latitude: order.restaurant.lat,
              longitude: order.restaurant.lng,
            }}
            title={order.restaurant.name}
            pinColor="red"
          />
        )}

        {/* Pin del cliente */}
        {order && (
          <Marker
            coordinate={{
              latitude: order.address.lat,
              longitude: order.address.lng,
            }}
            title="Cliente"
            pinColor="green"
          />
        )}

        {/* Pin del courier (TÚ) */}
        {courierLocation && (
          <Marker
            coordinate={{
              latitude: courierLocation.lat,
              longitude: courierLocation.lng,
            }}
            title="Tu ubicación"
            pinColor="blue"
          />
        )}

        {/* Línea de ruta */}
        {courierLocation && order && (
          <Polyline
            coordinates={[
              { latitude: courierLocation.lat, longitude: courierLocation.lng },
              { latitude: order.address.lat, longitude: order.address.lng },
            ]}
            strokeColor="#E63946"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <Button title="Recogido" onPress={handleMarkPickedUp} />
        <Button title="Entregado" onPress={handleMarkDelivered} />
      </View>
    </View>
  );
}
```

**History:** Lista de pedidos con estado `DELIVERED` del courier

**Profile:** 
- Toggle de disponibilidad
- Estadísticas (entregas totales, ganancias)
- Logout

---

### 4. 🔥 TRACKING EN TIEMPO REAL (Cliente ve al Courier)

**FLUJO COMPLETO:**

#### En la App del Courier:
```typescript
// 1. Courier acepta pedido
await ordersService.acceptOrder(orderId);

// 2. Inicia tracking automático
await locationService.startTracking();
// → Envía ubicación cada 5 segundos a /couriers/location

// 3. Backend recibe ubicación
// → Emite via WebSocket al cliente: ordersGateway.emitCourierLocation(userId, {lat, lng})
```

#### En la App del Cliente:
```typescript
// En order/[id].tsx (ya existe pero mejorado)
useEffect(() => {
  const socket = getSocket();
  
  // Escuchar ubicación del courier en tiempo real
  socket.on('courierLocation', (location: { lat: number; lng: number }) => {
    setCourierLocation(location);
    console.log('Courier está en:', location);
  });
  
  return () => {
    socket.off('courierLocation');
  };
}, []);

// Mostrar en mapa
<MapView>
  {/* Pin del courier moviéndose en tiempo real */}
  {courierLocation && (
    <Marker
      coordinate={{
        latitude: courierLocation.lat,
        longitude: courierLocation.lng,
      }}
      title="Tu repartidor"
    >
      <Image source={require('./bike-icon.png')} />
    </Marker>
  )}
</MapView>
```

---

### 5. 📍 DIAGRAMA DE FLUJO DE TRACKING

```
┌─────────────────────────────────────────────────────────────┐
│                    TRACKING EN TIEMPO REAL                   │
└─────────────────────────────────────────────────────────────┘

[COURIER APP]                [BACKEND]                [CLIENT APP]
     │                           │                          │
     │ 1. Acepta pedido          │                          │
     ├──────────────────────────>│                          │
     │   POST /couriers/         │                          │
     │   orders/:id/accept       │                          │
     │                           │                          │
     │ 2. Inicia tracking        │                          │
     │   startTracking()         │                          │
     │                           │                          │
     │ 3. Cada 5 segundos:       │                          │
     │   POST /couriers/location │                          │
     │   { lat: 14.43, lng: -89 }│                          │
     ├──────────────────────────>│                          │
     │                           │ 4. Emite via WebSocket   │
     │                           │   courierLocation        │
     │                           ├─────────────────────────>│
     │                           │   { lat, lng }           │
     │                           │                          │
     │                           │                          │ 5. Actualiza mapa
     │                           │                          │    setCourierLocation()
     │                           │                          │    Pin se mueve
     │                           │                          │
     │ 6. Marca como entregado   │                          │
     ├──────────────────────────>│                          │
     │   PATCH /couriers/        │                          │
     │   orders/:id/deliver      │                          │
     │                           │                          │
     │ 7. Detiene tracking       │                          │
     │   stopTracking()          │                          │
     │                           │                          │
```

---

### 6. 🔧 MODIFICACIONES EN LA APP DEL CLIENTE

**Archivo:** `apps/mobile/app/order/[id].tsx` (YA EXISTE, MEJORAR)

**Agregar:**
```typescript
import { useState } from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function OrderDetailScreen() {
  const [courierLocation, setCourierLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const socket = getSocket();
    
    // 🆕 Escuchar ubicación del courier
    socket.on('courierLocation', (location: { lat: number; lng: number }) => {
      setCourierLocation(location);
    });
    
    return () => {
      socket.off('courierLocation');
    };
  }, [orderId]);

  // 🆕 Mostrar mapa cuando el pedido está en ruta
  if (order?.status === 'ON_ROUTE' && courierLocation) {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={{
            latitude: courierLocation.lat,
            longitude: courierLocation.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {/* Pin del courier moviéndose */}
          <Marker
            coordinate={{
              latitude: courierLocation.lat,
              longitude: courierLocation.lng,
            }}
            title="Tu repartidor"
          >
            <View style={styles.courierMarker}>
              <Ionicons name="bicycle" size={24} color="white" />
            </View>
          </Marker>

          {/* Pin de tu dirección */}
          <Marker
            coordinate={{
              latitude: order.address.lat,
              longitude: order.address.lng,
            }}
            title="Tu dirección"
            pinColor="green"
          />
        </MapView>

        <View style={styles.trackingInfo}>
          <Text style={styles.trackingTitle}>Tu pedido está en camino 🚴</Text>
          <Text style={styles.trackingDistance}>
            A {calculateDistance(courierLocation, order.address)} de distancia
          </Text>
        </View>
      </View>
    );
  }

  // ... resto del código existente
}
```

---

### 7. ⚡ OPTIMIZACIONES DE BATERÍA

**En el servicio de location del courier:**

```typescript
// Ajustar precisión según estado del pedido
async startTracking(orderStatus: string) {
  const accuracy = orderStatus === 'ON_ROUTE' 
    ? Location.Accuracy.High      // Alta precisión cuando va al cliente
    : Location.Accuracy.Balanced; // Precisión media cuando va al restaurante

  this.watchSubscription = await Location.watchPositionAsync(
    {
      accuracy,
      timeInterval: orderStatus === 'ON_ROUTE' ? 5000 : 10000, // Más frecuente en ruta
      distanceInterval: 10,
    },
    (location) => {
      this.updateLocation(location.coords.latitude, location.coords.longitude);
    }
  );
}
```

---

### 8. 🔔 NOTIFICACIONES AL CLIENTE

**Cuando el courier se acerca:**

```typescript
// En el backend (couriers.service.ts)
async updateLocation(courierId: string, lat: number, lng: number) {
  const activeOrder = await this.getActiveOrder(courierId);
  
  if (activeOrder) {
    // Emitir ubicación
    this.ordersGateway.emitCourierLocation(activeOrder.userId, { lat, lng });
    
    // Calcular distancia al cliente
    const distance = this.calculateDistance(
      lat, lng,
      activeOrder.address.lat,
      activeOrder.address.lng
    );
    
    // Notificar cuando está cerca (< 500m)
    if (distance < 0.5 && !activeOrder.nearbyNotificationSent) {
      await this.pushService.sendPushNotification(
        activeOrder.userId,
        '¡Tu pedido está cerca! 🎉',
        'El repartidor llegará en menos de 5 minutos'
      );
      
      // Marcar que ya se envió la notificación
      await this.prisma.order.update({
        where: { id: activeOrder.id },
        data: { nearbyNotificationSent: true }
      });
    }
  }
}
```

---

## 🎨 DISEÑO Y UX

**Colores (tema oscuro):**
```typescript
export const COLORS = {
  background: '#1A1A2E',
  primary: '#16213E',
  accent: '#E63946',      // Rojo para acciones
  success: '#06D6A0',     // Verde para completado
  warning: '#FFD166',     // Amarillo para alertas
  white: '#FFFFFF',
  muted: '#8E8E93',
  border: '#2C2C3E',
};
```

**Estados de pedido:**
- `READY` → Disponible para recoger (azul)
- `ON_ROUTE` → Courier en camino (amarillo)
- `DELIVERED` → Entregado (verde)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Migrar schema de Prisma (agregar campos de courier)
- [ ] Crear módulo `couriers/`
- [ ] Implementar 8 endpoints de courier
- [ ] Crear guards de roles (`RolesGuard`)
- [ ] Actualizar `OrdersGateway` para emitir ubicación
- [ ] Registrar `CouriersModule` en `AppModule`

### App Móvil
- [ ] Inicializar proyecto Expo
- [ ] Configurar Expo Router
- [ ] Implementar login con validación de rol
- [ ] Crear servicio de orders (courier endpoints)
- [ ] Crear servicio de location
- [ ] Pantalla de pedidos disponibles
- [ ] Pantalla de pedido activo con mapa
- [ ] Pantalla de historial
- [ ] Pantalla de perfil con toggle de disponibilidad
- [ ] Integrar WebSocket para tracking
- [ ] Pedir permisos de ubicación
- [ ] Implementar tracking en background

---

## 🧪 FLUJO DE PRUEBA

1. **Crear usuario courier en backend:**
```sql
UPDATE users SET role = 'COURIER', isAvailable = true WHERE email = 'courier@test.com';
```

2. **Crear pedido de prueba:**
- Usar app de cliente para crear pedido
- Cambiar estado a `READY` desde panel de restaurante

3. **Probar app de courier:**
- Login con cuenta de courier
- Ver pedido en "Disponibles"
- Aceptar pedido
- Ver en "Activo" con mapa
- Marcar como "Recogido"
- Marcar como "Entregado" con código

4. **Verificar tracking:**
- Abrir app de cliente
- Ver ubicación del courier en tiempo real

---

## 📦 DEPENDENCIAS COMPLETAS

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "expo-location": "~16.5.0",
    "react-native-maps": "1.10.0",
    "axios": "^1.6.7",
    "zustand": "^5.0.8",
    "socket.io-client": "^4.7.5",
    "@react-native-async-storage/async-storage": "1.21.0",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0"
  }
}
```

---

## 🚀 COMANDOS PARA EMPEZAR

```bash
# 1. Backend
cd apps/api
npx prisma migrate dev --name add_courier_fields
pnpm run start:dev

# 2. Crear app
cd apps
npx create-expo-app courier --template blank-typescript
cd courier
pnpm add expo-router axios zustand socket.io-client expo-location react-native-maps

# 3. Copiar estructura desde apps/mobile
# - services/api.ts
# - services/auth.service.ts
# - constants/colors.ts
# - src/components/Button.tsx

# 4. Iniciar
pnpm start
```

---

## 🎯 RESULTADO ESPERADO

Una app completamente funcional donde los repartidores pueden:
- ✅ Ver y aceptar pedidos en tiempo real
- ✅ Navegar con mapa hacia restaurante y cliente
- ✅ Actualizar estados del pedido
- ✅ Confirmar entregas con código
- ✅ Ver historial y ganancias
- ✅ Ser rastreados por los clientes

**Tiempo estimado:** 20-30 horas de desarrollo

**Conectividad:** 100% con backend (todos los endpoints necesarios)
