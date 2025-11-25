# 🚀 Delivery Ocotepeque - Guía de la Plataforma

## 📋 Resumen Ejecutivo

Esta es una plataforma completa de delivery con:
- **Backend API** (NestJS + Prisma + PostgreSQL)
- **App Móvil** (React Native + Expo)
- **Diseño moderno** estilo DoorDash

---

## 🏗️ Arquitectura

### Backend (Puerto 4000)
```
apps/api/
├── src/
│   ├── auth/           # Autenticación JWT
│   ├── users/          # Gestión de usuarios
│   ├── restaurants/    # Restaurantes
│   ├── products/       # Productos/Platillos
│   ├── categories/     # Categorías
│   ├── cart/           # Carrito de compras
│   ├── orders/         # Pedidos
│   ├── addresses/      # Direcciones de entrega
│   ├── notifications/  # Notificaciones push
│   └── payments/       # Pagos (Stripe)
```

### Mobile App (Puerto 8081)
```
apps/mobile/
├── app/
│   ├── (tabs)/         # Navegación principal
│   │   ├── home.tsx    # ✅ Diseñado
│   │   ├── search.tsx  # ✅ Diseñado
│   │   ├── cart.tsx    # ✅ Diseñado
│   │   └── notifications.tsx # ✅ Diseñado
│   ├── index.tsx       # Splash
│   ├── onboarding.tsx  # Onboarding
│   ├── login.tsx       # Login
│   ├── register.tsx    # Registro
│   ├── overview.tsx    # Detalle restaurante
│   ├── confirm-order.tsx # Confirmar pedido
│   ├── payment-method.tsx # Método de pago
│   └── success.tsx     # Éxito
└── services/           # ✅ NUEVOS Servicios API
    ├── api.ts          # Cliente Axios configurado
    ├── auth.service.ts # Autenticación
    └── restaurants.service.ts # Restaurantes
```

---

## 🎨 Diseño Actual

### Paleta de Colores
- **Fondo**: `#0B1A2A` (Azul marino oscuro)
- **Cards**: `#0F2537` (Azul marino medio)
- **Texto Principal**: `#F5E6D3` (Crema)
- **Texto Secundario**: `#8FA3B8` (Azul claro)
- **Acentos**: `#E63946` (Rojo brillante)
- **Banner**: `#6D0F1A` (Rojo oscuro)

### Iconos
- ✅ Monocromáticos (Ionicons)
- ✅ Estilo outline (contorno)
- ✅ Sin emojis

---

## 🔧 Configuración Necesaria

### 1. Base de Datos (PostgreSQL)

Crear archivo `.env` en `apps/api/`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/delivery_ocotepeque"
JWT_SECRET="tu-secreto-super-seguro-aqui"
JWT_REFRESH_SECRET="tu-secreto-refresh-aqui"
PORT=4000
```

Luego ejecutar:
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed  # Si tienes seed data
```

### 2. Mobile App

Crear archivo `.env` en `apps/mobile/`:
```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

---

## 🚀 Cómo Iniciar

### Backend
```bash
cd apps/api
pnpm install
pnpm run start:dev
```

### Mobile
```bash
cd apps/mobile
pnpm install
pnpm start
```

---

## 📱 Flujo de Usuario

### 1. Onboarding
- Usuario ve slides de bienvenida
- Puede saltar o continuar

### 2. Autenticación
- **Registro**: Nombre, email, teléfono, contraseña
- **Login**: Email y contraseña
- Tokens guardados en SecureStore

### 3. Home
- Lista de restaurantes destacados
- Búsqueda
- Categorías horizontales
- Cards con rating, tiempo, delivery

### 4. Detalle Restaurante
- Banner del restaurante
- Lista de productos
- Agregar al carrito

### 5. Carrito
- Ver productos agregados
- Modificar cantidades
- Ver subtotal, impuestos, delivery
- Proceder al pago

### 6. Checkout
- Seleccionar dirección
- Seleccionar método de pago
- Confirmar pedido
- Ver código de confirmación

### 7. Seguimiento
- Ver estado del pedido
- Notificaciones push
- Historial de pedidos

---

## 🔌 Endpoints API Disponibles

### Auth
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /auth/me` - Perfil actual

### Restaurants
- `GET /restaurants` - Todos los restaurantes
- `GET /restaurants/featured` - Destacados
- `GET /restaurants/search?q=query` - Búsqueda
- `GET /restaurants/:id` - Detalle con productos

### Products
- `GET /products` - Todos los productos
- `GET /products/:id` - Detalle del producto

### Cart
- `GET /cart` - Ver carrito
- `POST /cart` - Agregar producto
- `PATCH /cart/:id` - Actualizar cantidad
- `DELETE /cart/:id` - Eliminar producto

### Orders
- `GET /orders` - Mis pedidos
- `POST /orders` - Crear pedido
- `GET /orders/:id` - Detalle del pedido

---

## ✅ Estado Actual

### ✅ Completado
- [x] Estructura del backend
- [x] Modelos de base de datos (Prisma)
- [x] Módulos de API (NestJS)
- [x] Diseño UI moderno (Mobile)
- [x] Iconos monocromáticos
- [x] Paleta de colores personalizada
- [x] Servicios API (axios)
- [x] Navegación (Expo Router)

### 🚧 Pendiente
- [ ] Conectar pantallas con API
- [ ] Implementar autenticación completa
- [ ] Cargar restaurantes reales desde API
- [ ] Implementar carrito funcional
- [ ] Implementar checkout
- [ ] Notificaciones push
- [ ] Pagos con Stripe
- [ ] Seed data para testing

---

## 🎯 Próximos Pasos

1. **Configurar Base de Datos**
   - Crear BD PostgreSQL
   - Ejecutar migraciones
   - Agregar datos de prueba

2. **Conectar Home con API**
   - Cargar restaurantes reales
   - Implementar búsqueda
   - Mostrar productos

3. **Implementar Autenticación**
   - Login funcional
   - Registro funcional
   - Guardar tokens
   - Proteger rutas

4. **Implementar Carrito**
   - Agregar productos
   - Ver carrito
   - Modificar cantidades
   - Calcular totales

5. **Implementar Checkout**
   - Seleccionar dirección
   - Método de pago
   - Crear pedido
   - Confirmación

---

## 📞 Soporte

Para cualquier duda o problema, revisar:
- Logs del backend: Terminal donde corre `pnpm start:dev`
- Logs del mobile: Metro bundler + DevTools
- Base de datos: Prisma Studio (`npx prisma studio`)

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
