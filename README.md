# 🍕 Delivery Ocotepeque

Una aplicación completa de delivery de comida para Ocotepeque, Honduras. Desarrollada con React Native (Expo) y NestJS.

## 🚀 Características

- **Frontend**: React Native con Expo Router
- **Backend**: NestJS con Prisma y PostgreSQL
- **Autenticación**: JWT con refresh tokens
- **Tiempo real**: WebSockets para seguimiento de pedidos
- **Pagos**: Integración mock con Stripe/PixelPay
- **Notificaciones**: Push notifications con Expo
- **Mapas**: Integración con Mapbox para distancias
- **Moneda**: Configurado para Lempiras hondureñas

## 📋 Requisitos Previos

- Node.js 18+
- pnpm 8+
- PostgreSQL
- Expo CLI

## 🛠️ Instalación

1. **Instalar dependencias**
```bash
pnpm install
```

2. **Configurar variables de entorno**

Backend (`apps/api/.env`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/delivery_ocotepeque?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
PORT=4000
```

Frontend (`apps/mobile/.env`):
```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

3. **Configurar base de datos**
```bash
pnpm --filter api db:push
pnpm --filter api db:seed
```

4. **Iniciar el proyecto**
```bash
pnpm dev
```

## 👤 Usuarios Demo

- **Cliente**: `demo@food.dev` / `Demo123!`
- **Repartidor**: `courier@food.dev` / `Courier123!`
- **Admin**: `admin@food.dev` / `Admin123!`

## 💰 Cálculo de Totales

```
subtotal = suma(cantidad × precio)
delivery = L.40 + (L.5 × distancia_km)
tax = 15% del subtotal
total = subtotal + tax + delivery
```

## 📚 Documentación API

Swagger disponible en: `http://localhost:4000/docs`

## 🏪 Restaurantes en Ocotepeque

- Pizzería Don Carlos
- Burger House
- Tacos El Primo
- Pollo Campero Ocotepeque
- Cafetería Central
- Comida Típica Honduras

---

**Desarrollado con ❤️ para Ocotepeque, Honduras** 🇭🇳
