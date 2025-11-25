# 📱 Arquitectura Completa - Delivery Ocotepeque

## 🎯 Resumen Ejecutivo

**Delivery Ocotepeque** es una plataforma completa de delivery de comida compuesta por 4 aplicaciones principales que trabajan en conjunto para ofrecer un servicio integral de pedidos y entregas.

---

## 🏗️ Estructura del Proyecto

```
DELIVERY OCOTEPEQUE/
├── apps/
│   ├── api/                    # Backend (NestJS)
│   ├── mobile/                 # App Cliente (React Native + Expo)
│   ├── app_repartidor/         # App Courier (React Native + Expo)
│   └── restaurant-web/         # Panel Web Restaurante (Next.js)
├── package.json                # Configuración monorepo
└── pnpm-workspace.yaml         # Workspaces de pnpm
```

**Tipo de proyecto:** Monorepo con pnpm workspaces  
**Tamaño:** ~613 MB (normal para monorepo con node_modules)

---

## 🔧 Stack Tecnológico General

| Componente | Tecnología |
|------------|------------|
| **Lenguaje** | TypeScript |
| **Gestor de paquetes** | pnpm |
| **Base de datos** | SQLite (desarrollo) / PostgreSQL (producción) |
| **ORM** | Prisma |
| **Comunicación tiempo real** | Socket.IO (WebSocket) |
| **Autenticación** | JWT + Refresh Tokens |
| **Validación** | class-validator |
| **Documentación API** | Swagger/OpenAPI |

---

## 1️⃣ BACKEND (API)

### **📂 Ubicación:**
```
apps/api/
```

### **🛠️ Stack Tecnológico:**

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **NestJS** | ^10.0.0 | Framework backend |
| **TypeScript** | ^5.1.3 | Lenguaje |
| **Prisma** | ^5.9.0 | ORM |
| **Socket.IO** | ^4.6.0 | WebSocket |
| **Passport** | ^0.7.0 | Autenticación |
| **bcrypt** | ^5.1.1 | Hash de contraseñas |
| **class-validator** | ^0.14.1 | Validación DTOs |
| **@nestjs/swagger** | ^7.2.0 | Documentación API |

### **📁 Estructura:**

```
apps/api/
├── src/
│   ├── auth/                   # Autenticación y autorización
│   │   ├── guards/             # Guards (JWT, Roles)
│   │   ├── decorators/         # Decoradores personalizados
│   │   └── strategies/         # Estrategias Passport
│   ├── users/                  # Gestión de usuarios
│   ├── restaurants/            # Gestión de restaurantes
│   ├── products/               # Gestión de productos
│   ├── categories/             # Categorías de productos
│   ├── orders/                 # Gestión de pedidos
│   │   ├── dto/                # DTOs de validación
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── orders.gateway.ts   # WebSocket
│   ├── couriers/               # Gestión de repartidores
│   │   ├── dto/
│   │   ├── couriers.controller.ts
│   │   └── couriers.service.ts
│   ├── cart/                   # Carrito de compras
│   ├── notifications/          # Notificaciones
│   ├── push/                   # Push notifications (mock)
│   ├── payments/               # Pagos (mock)
│   ├── uploads/                # Subida de archivos
│   ├── ai/                     # Integración IA
│   ├── health/                 # Health checks
│   ├── prisma/                 # Servicio Prisma
│   ├── common/                 # Utilidades comunes
│   │   └── utils/
│   │       └── schedule.utils.ts  # Utilidades de horarios
│   ├── app.module.ts           # Módulo principal
│   └── main.ts                 # Entry point
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   └── seed.ts                 # Datos de prueba
├── .env                        # Variables de entorno
└── package.json
```

### **🗄️ Base de Datos (Prisma Schema):**

**Modelos principales:**

```prisma
User {
  - id, email, passwordHash, name, phone
  - role: CUSTOMER | RESTAURANT | COURIER | ADMIN
  - isAvailable (para couriers)
  - vehicleType (para couriers)
  - pushToken
}

Restaurant {
  - id, name, slug, logoUrl, bannerUrl
  - rating, etaMinutes
  - lat, lng (ubicación)
  - isOpen
  - openTime, closeTime, closedDays (horarios)
  - products[], orders[]
}

Product {
  - id, name, description, price
  - imageUrl, available, isFeatured
  - prepTimeMinutes, ingredients
  - category, restaurant
}

Order {
  - id, status, totalCents, deliveryCents
  - items (JSON), paymentMethod
  - user, restaurant, courier, address
  - timestamps (createdAt, acceptedAt, readyAt, deliveredAt)
  - confirmationCode, cancelReason
}

Address {
  - id, label, line1, line2
  - lat, lng, city
  - contactName, contactPhone
}

Category {
  - id, name, slug, imageUrl
  - products[]
}
```

### **🔌 Endpoints Principales:**

**Autenticación:**
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

**Restaurantes:**
- `GET /restaurants` - Listar restaurantes
- `GET /restaurants/:id` - Detalle
- `GET /restaurants/featured` - Destacados
- `PATCH /restaurants/:id/schedule` - Actualizar horarios

**Productos:**
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `PATCH /products/:id` - Actualizar

**Pedidos:**
- `POST /orders` - Crear pedido
- `GET /orders` - Mis pedidos
- `PATCH /orders/:id/accept` - Restaurante acepta
- `PATCH /orders/:id/reject` - Restaurante rechaza
- `PATCH /orders/:id/ready` - Marcar listo

**Couriers:**
- `GET /couriers/available-orders` - Pedidos disponibles
- `POST /couriers/orders/:id/accept` - Aceptar pedido
- `PATCH /couriers/orders/:id/pickup` - Marcar recogido
- `PATCH /couriers/orders/:id/deliver` - Marcar entregado
- `POST /couriers/location` - Actualizar ubicación

### **🔐 Seguridad:**

- **JWT** con access token (15min) y refresh token (7 días)
- **Bcrypt** para hash de contraseñas
- **Guards** para proteger rutas (JwtAuthGuard, RolesGuard)
- **Throttling** para prevenir ataques (10 req/min)
- **CORS** configurado
- **Validación** con class-validator en todos los DTOs

### **⚡ WebSocket (Socket.IO):**

**Eventos para clientes:**
- `join` - Conectar usuario
- `orderUpdate` - Actualización de pedido
- `orderStatusChange` - Cambio de estado
- `courierLocation` - Ubicación del courier

**Eventos para restaurantes:**
- `joinRestaurant` - Conectar restaurante
- `newOrder` - Nuevo pedido
- `orderUpdate` - Actualización

**Eventos para couriers:**
- `newOrderReady` - Pedido listo para recoger

### **📊 Estado de Implementación:**

```
✅ Autenticación completa (JWT + Refresh)
✅ CRUD de usuarios, restaurantes, productos
✅ Sistema de pedidos completo
✅ Confirmación de pedidos (accept/reject/ready)
✅ Módulo de couriers completo
✅ WebSocket para tiempo real
✅ Horarios de restaurantes
✅ Throttling y seguridad
⚠️ Push notifications (mock)
⚠️ Pagos (mock)
```

---

## 2️⃣ APP MÓVIL (CLIENTE)

### **📂 Ubicación:**
```
apps/mobile/
```

### **🛠️ Stack Tecnológico:**

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React Native** | 0.73.6 | Framework móvil |
| **Expo** | ~50.0.0 | Toolchain |
| **Expo Router** | ~3.4.0 | Navegación |
| **TypeScript** | ^5.1.3 | Lenguaje |
| **Zustand** | ^5.0.8 | Estado global |
| **Axios** | ^1.6.7 | Cliente HTTP |
| **Socket.IO Client** | ^4.7.5 | WebSocket |
| **expo-location** | ~16.5.0 | GPS |
| **react-native-maps** | 1.10.0 | Mapas |

### **📁 Estructura:**

```
apps/mobile/
├── app/                        # Expo Router (file-based routing)
│   ├── (tabs)/                 # Tabs principales
│   │   ├── home.tsx            # Home con restaurantes
│   │   ├── orders.tsx          # Mis pedidos
│   │   ├── profile.tsx         # Perfil
│   │   └── _layout.tsx         # Layout de tabs
│   ├── restaurant/
│   │   └── [id].tsx            # Detalle de restaurante
│   ├── cart.tsx                # Carrito
│   ├── checkout.tsx            # Checkout
│   ├── order/
│   │   └── [id].tsx            # Detalle de pedido con tracking
│   ├── login.tsx               # Login
│   ├── register.tsx            # Registro
│   ├── _layout.tsx             # Layout raíz
│   └── index.tsx               # Pantalla inicial
├── components/                 # Componentes reutilizables
│   ├── RestaurantCard.tsx
│   ├── ProductCard.tsx
│   ├── OrderCard.tsx
│   └── ...
├── services/                   # Servicios
│   ├── api.ts                  # Cliente HTTP con interceptors
│   ├── auth.service.ts         # Autenticación
│   ├── restaurants.service.ts
│   ├── products.service.ts
│   ├── orders.service.ts
│   ├── location.service.ts     # GPS y tracking
│   ├── socket.service.ts       # WebSocket
│   └── storage.ts              # AsyncStorage
├── stores/                     # Zustand stores
│   ├── authStore.ts            # Estado de autenticación
│   ├── cartStore.ts            # Carrito de compras
│   └── orderStore.ts           # Pedidos
├── constants/
│   └── colors.ts               # Paleta de colores
├── app.json                    # Config Expo
└── package.json
```

### **🎨 Características:**

**Pantallas principales:**
1. **Home** - Lista de restaurantes con filtros
2. **Restaurante** - Menú completo con categorías
3. **Carrito** - Resumen de pedido
4. **Checkout** - Dirección y pago
5. **Pedidos** - Historial y pedidos activos
6. **Detalle de Pedido** - Tracking en tiempo real con mapa
7. **Perfil** - Datos del usuario y direcciones

**Funcionalidades:**
- ✅ Autenticación (login/registro)
- ✅ Navegación con Expo Router
- ✅ Listado de restaurantes
- ✅ Carrito de compras (Zustand)
- ✅ Checkout completo
- ✅ Tracking en tiempo real con mapa
- ✅ WebSocket para actualizaciones
- ✅ Refresh token automático
- ✅ Manejo de errores
- ✅ Estados de carga

### **🗺️ Tracking en Tiempo Real:**

```typescript
// Escucha ubicación del courier
socket.on('courierLocation', ({ lat, lng }) => {
  setCourierLocation({ lat, lng });
  // Actualiza mapa en tiempo real
});

// Calcula distancia con Haversine
const distance = calculateDistance(
  courierLat, courierLng,
  customerLat, customerLng
);
```

### **📊 Estado de Implementación:**

```
✅ UI completa y funcional
✅ Navegación con Expo Router
✅ Autenticación completa
✅ Carrito de compras
✅ Checkout
✅ Tracking en tiempo real
✅ WebSocket integrado
✅ Manejo de estados
⚠️ Notificaciones push (pendiente)
```

---

## 3️⃣ APP REPARTIDOR (COURIER)

### **📂 Ubicación:**
```
apps/app_repartidor/
```

### **🛠️ Stack Tecnológico:**

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **React Native** | 0.73.6 | Framework móvil |
| **Expo** | ~50.0.0 | Toolchain |
| **Expo Router** | ~3.4.0 | Navegación |
| **TypeScript** | ^5.1.3 | Lenguaje |
| **Zustand** | ^5.0.8 | Estado global |
| **Axios** | ^1.6.7 | Cliente HTTP |
| **Socket.IO Client** | ^4.7.5 | WebSocket |
| **expo-location** | ~16.5.0 | GPS tracking |
| **react-native-maps** | 1.10.0 | Mapas |

### **📁 Estructura:**

```
apps/app_repartidor/
├── app/
│   ├── (tabs)/
│   │   ├── available.tsx       # Pedidos disponibles
│   │   ├── active.tsx          # Pedido activo con mapa
│   │   ├── history.tsx         # Historial de entregas
│   │   ├── profile.tsx         # Perfil y ganancias
│   │   └── _layout.tsx
│   ├── order/
│   │   └── [id].tsx            # Detalle de pedido
│   ├── login.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── MapView.tsx         # Mapa con ruta
│   │   └── OrderCard.tsx
│   └── stores/
│       ├── authStore.ts
│       └── orderStore.ts       # Estado de pedidos
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── orders.service.ts       # API de couriers
│   ├── location.service.ts     # GPS tracking
│   ├── socket.service.ts
│   └── storage.ts
├── constants/
│   └── colors.ts
└── package.json
```

### **🎨 Características:**

**Pantallas:**
1. **Disponibles** - Lista de pedidos para aceptar
2. **Activo** - Pedido en curso con mapa y navegación
3. **Historial** - Entregas completadas
4. **Perfil** - Estadísticas y ganancias

**Funcionalidades:**
- ✅ Ver pedidos disponibles
- ✅ Aceptar/Rechazar pedidos
- ✅ Marcar como recogido
- ✅ Marcar como entregado (con código)
- ✅ Tracking GPS automático
- ✅ Envío de ubicación cada 5-10s
- ✅ Mapa con ruta al cliente
- ✅ Toggle disponibilidad (online/offline)
- ✅ Historial de entregas
- ✅ Estadísticas de ganancias

### **📍 GPS Tracking:**

```typescript
// Tracking automático según estado
startTracking(status) {
  const accuracy = status === 'ON_ROUTE' 
    ? Location.Accuracy.High 
    : Location.Accuracy.Balanced;
    
  const timeInterval = status === 'ON_ROUTE' 
    ? 5000  // Cada 5s en ruta
    : 10000; // Cada 10s en espera
    
  // Envía ubicación al backend
  watchPositionAsync({ accuracy, timeInterval }, (location) => {
    updateLocation(location.coords.latitude, location.coords.longitude);
  });
}
```

### **📊 Estado de Implementación:**

```
✅ UI completa (85%)
✅ Funcionalidades core (100%)
✅ GPS tracking (95%)
✅ Integración con backend (100%)
⚠️ WebSocket listeners (20%)
❌ Notificaciones push (0%)
```

---

## 4️⃣ PANEL WEB RESTAURANTE

### **📂 Ubicación:**
```
apps/restaurant-web/
```

### **🛠️ Stack Tecnológico:**

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 14.1.0 | Framework React |
| **React** | ^18 | UI Library |
| **TypeScript** | ^5 | Lenguaje |
| **TailwindCSS** | ^3.4.0 | Estilos |
| **Recharts** | ^2.10.0 | Gráficas |
| **Axios** | ^1.6.7 | Cliente HTTP |
| **Socket.IO Client** | ^4.7.5 | WebSocket |

### **📁 Estructura:**

```
apps/restaurant-web/
├── app/
│   ├── (dashboard)/            # Rutas protegidas
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── orders/             # Gestión de pedidos
│   │   │   └── page.tsx
│   │   ├── menu/               # Gestión de menú
│   │   │   ├── page.tsx        # Lista de productos
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Crear producto
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Editar producto
│   │   ├── reports/            # Reportes y estadísticas
│   │   │   └── page.tsx
│   │   ├── settings/           # Configuración
│   │   │   └── page.tsx
│   │   └── layout.tsx          # Layout con sidebar
│   ├── login/
│   │   └── page.tsx
│   ├── layout.tsx              # Layout raíz
│   └── globals.css
├── components/                 # Componentes
│   ├── Sidebar.tsx
│   ├── OrderCard.tsx
│   ├── ProductForm.tsx
│   └── ...
├── services/                   # Servicios
│   ├── api.ts
│   ├── auth.service.ts
│   ├── products.service.ts
│   ├── orders.service.ts
│   └── categories.service.ts
├── lib/
│   └── utils.ts
├── tailwind.config.ts
└── package.json
```

### **🎨 Características:**

**Pantallas:**
1. **Dashboard** - Resumen de ventas y pedidos
2. **Pedidos** - Gestión de pedidos (pendientes, en preparación, listos)
3. **Menú** - CRUD de productos
4. **Reportes** - Estadísticas y gráficas (Recharts)
5. **Configuración** - Datos del restaurante y horarios

**Funcionalidades:**
- ✅ Dashboard con métricas
- ✅ CRUD de productos completo
- ✅ Gestión de categorías
- ✅ Subida de imágenes
- ✅ Reportes con gráficas (Recharts)
- ✅ Diseño responsive
- ⏸️ Gestión de pedidos (UI pendiente)
- ⏸️ WebSocket para pedidos en tiempo real
- ⏸️ Configuración de horarios (UI pendiente)

### **📊 Reportes:**

```typescript
// Gráfica de ventas (Recharts)
<LineChart data={salesTrend}>
  <XAxis dataKey="label" />
  <YAxis tickFormatter={(value) => `L ${value}`} />
  <Line type="monotone" dataKey="total" stroke="#fca311" />
</LineChart>

// Productos más vendidos
<BarChart data={topProducts}>
  <Bar dataKey="quantity" fill="#fca311" />
</BarChart>
```

### **📊 Estado de Implementación:**

```
✅ Dashboard (100%)
✅ CRUD productos (100%)
✅ Reportes con gráficas (100%)
✅ Autenticación (100%)
⏸️ Gestión de pedidos UI (0%)
⏸️ WebSocket pedidos (0%)
⏸️ Configuración horarios UI (0%)
```

---

## 🔄 Flujo Completo de un Pedido

```
1. CLIENTE (App Móvil)
   ├─ Selecciona restaurante
   ├─ Agrega productos al carrito
   ├─ Hace checkout
   └─ POST /orders → Estado: NEW

2. BACKEND
   ├─ Crea pedido en DB
   ├─ Emite WebSocket al restaurante
   └─ Notifica: "Nuevo pedido"

3. RESTAURANTE (Panel Web)
   ├─ Recibe notificación 🔔
   ├─ Ve pedido en "Pendientes"
   ├─ Opción A: ACEPTA
   │  ├─ PATCH /orders/:id/accept
   │  └─ Estado: NEW → ACCEPTED
   └─ Opción B: RECHAZA
      ├─ PATCH /orders/:id/reject
      └─ Estado: NEW → CANCELLED

4. CLIENTE
   └─ Recibe notificación: "Preparando tu pedido"

5. RESTAURANTE
   ├─ Prepara la comida
   ├─ PATCH /orders/:id/ready
   └─ Estado: ACCEPTED → READY

6. COURIER (App Repartidor)
   ├─ Ve pedido en "Disponibles"
   ├─ POST /couriers/orders/:id/accept
   ├─ Estado: READY → PICKED_UP
   └─ Inicia GPS tracking

7. CLIENTE
   ├─ Ve: "Juan está recogiendo tu pedido"
   └─ Mapa con ubicación en tiempo real

8. COURIER
   ├─ Recoge del restaurante
   ├─ PATCH /couriers/orders/:id/pickup
   ├─ Estado: PICKED_UP → ON_ROUTE
   └─ GPS tracking cada 5s

9. CLIENTE
   ├─ Ve: "Tu pedido va en camino"
   └─ Mapa actualizado en tiempo real

10. COURIER
    ├─ Llega a destino
    ├─ PATCH /couriers/orders/:id/deliver
    ├─ Ingresa código de confirmación
    └─ Estado: ON_ROUTE → DELIVERED

11. CLIENTE
    └─ Recibe: "¡Disfruta tu comida!"
```

---

## 🌐 Comunicación Entre Componentes

```
┌─────────────┐
│  App Móvil  │
│  (Cliente)  │
└──────┬──────┘
       │ HTTP (REST)
       │ WebSocket
       ↓
┌─────────────┐      WebSocket      ┌──────────────┐
│   Backend   │◄────────────────────│ Panel Web    │
│   (NestJS)  │                     │ (Restaurante)│
└──────┬──────┘                     └──────────────┘
       │ HTTP
       │ WebSocket
       ↓
┌─────────────┐
│ App Courier │
│ (Repartidor)│
└─────────────┘
```

**Protocolos:**
- **HTTP/REST** - CRUD y operaciones
- **WebSocket** - Tiempo real (pedidos, tracking)
- **JWT** - Autenticación en todas las apps

---

## 📊 Resumen de Completitud

| Componente | Completitud | Estado |
|------------|-------------|--------|
| **Backend API** | 95% | ✅ Funcional |
| **App Móvil Cliente** | 90% | ✅ Funcional |
| **App Courier** | 85% | ✅ Funcional |
| **Panel Web Restaurante** | 70% | ⚠️ Parcial |

### **Pendientes Principales:**

**Backend:**
- [ ] Push notifications reales
- [ ] Integración de pagos real
- [ ] Auto-cancelación de pedidos por timeout

**App Móvil:**
- [ ] Notificaciones push

**App Courier:**
- [ ] WebSocket listeners completos
- [ ] Notificaciones push

**Panel Web:**
- [ ] UI de gestión de pedidos
- [ ] WebSocket para pedidos en tiempo real
- [ ] UI de configuración de horarios

---

## 🚀 Cómo Ejecutar el Proyecto

### **1. Instalar dependencias:**
```bash
pnpm install
```

### **2. Configurar variables de entorno:**

**Backend (`apps/api/.env`):**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-secret-key"
JWT_REFRESH_SECRET="tu-refresh-secret"
```

**Apps móviles (`.env`):**
```env
EXPO_PUBLIC_API_URL="http://localhost:4000"
```

### **3. Inicializar base de datos:**
```bash
cd apps/api
pnpm run db:push
pnpm run db:seed
```

### **4. Ejecutar aplicaciones:**

**Backend:**
```bash
cd apps/api
pnpm run dev
# http://localhost:4000
```

**App Móvil:**
```bash
cd apps/mobile
pnpm start
# Escanear QR con Expo Go
```

**App Courier:**
```bash
cd apps/app_repartidor
pnpm start          # Metro fijo en http://localhost:8082 (modo offline)
# Si Metro se queda con cache o no libera el puerto:
pnpm run start:clear
# Si te pide usar otro puerto, mata el proceso que esté usando el 8082:
#   netstat -ano | findstr :8082
#   taskkill /PID <PID> /F
```

**Panel Web:**
```bash
cd apps/restaurant-web
pnpm run dev
# http://localhost:3000
```

---

## 📚 Documentación Adicional

- **`SISTEMA_CONFIRMACION_PEDIDOS.md`** - Sistema de confirmación
- **`HORARIOS_IMPLEMENTADOS.md`** - Horarios de restaurantes
- **`COURIERS_MODULE_IMPLEMENTED.md`** - Módulo de couriers
- **`MODELO_DE_NEGOCIO.md`** - Modelos de negocio
- **`MODELOS_NEGOCIO_COMPARATIVA.md`** - Comparativa de modelos

---

**Creado:** Nov 9, 2025  
**Versión:** 1.0  
**Estado:** Proyecto funcional al 85%
