# 🗺️ Sistema de Tracking en Tiempo Real - Explicación Completa

## 🎯 ¿Cómo Funciona?

El sistema conecta **3 componentes** para que el cliente vea dónde está el repartidor en tiempo real:

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  COURIER APP │ ──────> │   BACKEND    │ ──────> │  CLIENT APP  │
│  (Repartidor)│         │  (WebSocket) │         │   (Cliente)  │
└──────────────┘         └──────────────┘         └──────────────┘
```

---

## 📱 1. APP DEL REPARTIDOR (Courier)

### ¿Qué hace?
- Detecta su ubicación GPS cada 5 segundos
- Envía las coordenadas al backend
- Muestra mapa con 3 pins: Restaurante, Cliente, y Él mismo

### Código clave:
```typescript
// Inicia tracking automático al aceptar pedido
await locationService.startTracking();

// Cada 5 segundos envía:
POST /couriers/location
{
  lat: 14.4370,
  lng: -89.1833
}
```

### Pantalla del Courier:
```
┌─────────────────────────────┐
│  🗺️ MAPA                    │
│                              │
│    🏪 Restaurante            │
│         │                    │
│         │ (ruta)             │
│         ▼                    │
│    🚴 TÚ (moviéndose)       │
│         │                    │
│         │ (ruta)             │
│         ▼                    │
│    🏠 Cliente                │
│                              │
│  [Recogido] [Entregado]     │
└─────────────────────────────┘
```

---

## 🖥️ 2. BACKEND (API + WebSocket)

### ¿Qué hace?
- Recibe ubicación del courier cada 5 segundos
- Identifica qué cliente está esperando ese pedido
- Emite la ubicación al cliente via WebSocket

### Código clave:
```typescript
// Endpoint que recibe ubicación
POST /couriers/location
async updateLocation(courierId, lat, lng) {
  // 1. Buscar pedido activo del courier
  const order = await getActiveOrder(courierId);
  
  // 2. Emitir ubicación al cliente via WebSocket
  ordersGateway.emitCourierLocation(order.userId, { lat, lng });
  
  // 3. Calcular distancia
  const distance = calculateDistance(lat, lng, order.address.lat, order.address.lng);
  
  // 4. Notificar si está cerca (< 500m)
  if (distance < 0.5) {
    sendPushNotification(order.userId, '¡Tu pedido está cerca!');
  }
}
```

### WebSocket Gateway:
```typescript
// Emite al cliente específico
emitCourierLocation(userId: string, location: { lat, lng }) {
  const socketId = this.userSockets.get(userId);
  this.server.to(socketId).emit('courierLocation', location);
}
```

---

## 📱 3. APP DEL CLIENTE (Customer)

### ¿Qué hace?
- Escucha eventos de WebSocket
- Recibe ubicación del courier cada 5 segundos
- Actualiza el pin en el mapa en tiempo real

### Código clave:
```typescript
// Escucha ubicación del courier
useEffect(() => {
  const socket = getSocket();
  
  socket.on('courierLocation', (location) => {
    setCourierLocation(location); // Actualiza estado
    // El mapa se re-renderiza automáticamente
  });
  
  return () => socket.off('courierLocation');
}, []);
```

### Pantalla del Cliente:
```
┌─────────────────────────────┐
│  📦 Tu Pedido en Camino     │
│                              │
│  🗺️ MAPA                    │
│                              │
│    🚴 Repartidor             │
│       (moviéndose)           │
│         │                    │
│         │ 1.2 km             │
│         ▼                    │
│    🏠 Tu Casa                │
│                              │
│  ⏱️ Llega en ~5 minutos     │
└─────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO PASO A PASO

### Paso 1: Cliente hace pedido
```
Cliente → Backend: POST /orders (crear pedido)
Backend → Cliente: { orderId: "123", status: "PENDING" }
```

### Paso 2: Restaurante acepta y prepara
```
Restaurante → Backend: PATCH /orders/123/status { status: "READY" }
```

### Paso 3: Courier acepta pedido
```
Courier → Backend: POST /couriers/orders/123/accept
Backend → Courier: { order: {...}, status: "ON_ROUTE" }
Backend → Cliente (WebSocket): orderStatusChange("ON_ROUTE")
```

### Paso 4: Tracking en tiempo real (LOOP)
```
Cada 5 segundos:

Courier App:
  - Detecta GPS: { lat: 14.4370, lng: -89.1833 }
  - Envía: POST /couriers/location { lat, lng }

Backend:
  - Recibe ubicación
  - Identifica cliente del pedido
  - Emite: WebSocket → Cliente: courierLocation({ lat, lng })

Cliente App:
  - Recibe ubicación
  - Actualiza pin en mapa
  - Calcula distancia: "1.2 km"
```

### Paso 5: Courier llega y entrega
```
Courier → Backend: PATCH /couriers/orders/123/deliver { code: "1234" }
Backend → Cliente (WebSocket): orderStatusChange("DELIVERED")
Courier App: stopTracking() (detiene GPS)
```

---

## 🔋 OPTIMIZACIONES

### 1. Precisión Adaptativa
```typescript
// Alta precisión cuando va al cliente
if (status === 'ON_ROUTE') {
  accuracy = Location.Accuracy.High;
  interval = 5000; // 5 segundos
}

// Precisión media cuando va al restaurante
else {
  accuracy = Location.Accuracy.Balanced;
  interval = 10000; // 10 segundos
}
```

### 2. Detener tracking cuando no es necesario
```typescript
// Detener al entregar
await ordersService.markDelivered(orderId);
locationService.stopTracking(); // ✅ Ahorra batería
```

### 3. Notificaciones inteligentes
```typescript
// Solo notificar UNA VEZ cuando está cerca
if (distance < 0.5 && !notificationSent) {
  sendPush('¡Tu pedido está cerca!');
  markNotificationSent();
}
```

---

## 🎨 EXPERIENCIA DE USUARIO

### Para el Cliente:
1. ✅ Ve pedido "En preparación"
2. ✅ Recibe notificación "Tu pedido está en camino"
3. ✅ Abre app → Ve mapa con courier moviéndose
4. ✅ Ve distancia en tiempo real: "1.2 km"
5. ✅ Recibe notificación "¡Tu pedido está cerca!"
6. ✅ Courier llega → Entrega con código

### Para el Courier:
1. ✅ Ve lista de pedidos disponibles
2. ✅ Acepta pedido
3. ✅ Ve mapa con restaurante y cliente
4. ✅ Navega al restaurante
5. ✅ Marca "Recogido"
6. ✅ Navega al cliente (tracking automático)
7. ✅ Marca "Entregado" con código
8. ✅ Tracking se detiene automáticamente

---

## 🛠️ TECNOLOGÍAS USADAS

### Frontend (Apps Móviles)
- **React Native** - Framework
- **Expo Location** - GPS y tracking
- **React Native Maps** - Mapas
- **Socket.IO Client** - WebSocket
- **Zustand** - Estado global

### Backend
- **NestJS** - Framework
- **Socket.IO** - WebSocket server
- **Prisma** - Base de datos
- **PostgreSQL/SQLite** - DB

### Comunicación
- **REST API** - Operaciones CRUD
- **WebSocket** - Tiempo real
- **Push Notifications** - Alertas

---

## 📊 DATOS QUE SE TRANSMITEN

### Del Courier al Backend:
```json
{
  "lat": 14.4370,
  "lng": -89.1833,
  "timestamp": "2025-11-09T03:00:00Z",
  "accuracy": 10
}
```

### Del Backend al Cliente (WebSocket):
```json
{
  "event": "courierLocation",
  "data": {
    "lat": 14.4370,
    "lng": -89.1833,
    "orderId": "123",
    "distance": 1.2,
    "eta": 5
  }
}
```

---

## 🔒 SEGURIDAD

### 1. Solo el cliente del pedido ve la ubicación
```typescript
// Backend verifica que el socket pertenezca al usuario correcto
const socketId = this.userSockets.get(order.userId);
this.server.to(socketId).emit('courierLocation', location);
```

### 2. Tracking solo cuando hay pedido activo
```typescript
// No se envía ubicación si no hay pedido
if (!activeOrder) return;
```

### 3. Autenticación en WebSocket
```typescript
// Socket requiere token JWT
socket.on('join', (userId, token) => {
  if (verifyToken(token)) {
    this.userSockets.set(userId, socket.id);
  }
});
```

---

## 🧪 CÓMO PROBAR

### 1. Simular ubicación (Desarrollo)
```typescript
// En lugar de GPS real, usar ubicación fija
const mockLocation = { lat: 14.4370, lng: -89.1833 };
locationService.updateLocation(mockLocation.lat, mockLocation.lng);
```

### 2. Probar en dos dispositivos
- Dispositivo 1: App de cliente (ver mapa)
- Dispositivo 2: App de courier (mover ubicación)

### 3. Usar simulador
- iOS: Debug → Location → Custom Location
- Android: Extended Controls → Location → Simular ruta

---

## 📈 MÉTRICAS

### Frecuencia de actualización:
- **Courier → Backend:** Cada 5 segundos
- **Backend → Cliente:** Inmediato (WebSocket)
- **Precisión GPS:** ±10 metros

### Consumo de batería:
- **Alta precisión:** ~5-8% por hora
- **Precisión media:** ~3-5% por hora

### Latencia:
- **GPS → Backend:** ~100-500ms
- **Backend → Cliente:** ~50-100ms
- **Total:** ~150-600ms

---

## 🎉 RESULTADO FINAL

**El cliente ve:**
- 🗺️ Mapa en tiempo real
- 🚴 Pin del courier moviéndose
- 📍 Distancia exacta
- ⏱️ Tiempo estimado de llegada
- 🔔 Notificación cuando está cerca

**El courier ve:**
- 🗺️ Mapa con ruta
- 🏪 Ubicación del restaurante
- 🏠 Ubicación del cliente
- 📊 Distancia restante
- ✅ Botones de acción

**Todo conectado en tiempo real via WebSocket** 🚀

---

**Implementado por:** Sistema completo de tracking  
**Tecnología:** React Native + NestJS + Socket.IO + GPS  
**Estado:** ✅ Listo para implementar
