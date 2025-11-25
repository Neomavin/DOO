# 🚀 Instrucciones de Configuración - Delivery Ocotepeque

## ⚠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- ✅ Node.js (v18 o superior)
- ✅ pnpm (gestor de paquetes)
- ✅ PostgreSQL (base de datos)
- ✅ Expo Go app (en tu teléfono móvil)

---

## 📋 Paso 1: Configurar Base de Datos

### 1.1 Crear Base de Datos PostgreSQL

Abre tu cliente de PostgreSQL (pgAdmin, DBeaver, o terminal) y ejecuta:

```sql
CREATE DATABASE delivery_ocotepeque;
```

### 1.2 Crear archivo .env para el Backend

Crea el archivo `apps/api/.env` con el siguiente contenido:

```env
# Database
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/delivery_ocotepeque?schema=public"

# JWT Secrets (cambia estos valores por algo seguro)
JWT_SECRET="mi-super-secreto-jwt-2024-delivery-ocotepeque"
JWT_REFRESH_SECRET="mi-super-secreto-refresh-2024-delivery-ocotepeque"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# App
PORT=4000
NODE_ENV=development
```

**⚠️ IMPORTANTE**: Reemplaza `tu_usuario` y `tu_password` con tus credenciales de PostgreSQL.

### 1.3 Ejecutar Migraciones

```bash
cd apps/api
npx prisma migrate dev --name init
```

### 1.4 Poblar Base de Datos con Datos de Prueba

```bash
npx prisma db seed
```

Esto creará:
- ✅ 3 usuarios de prueba
- ✅ 6 restaurantes
- ✅ 6 categorías
- ✅ ~20 productos
- ✅ 2 notificaciones

**Usuarios de Prueba:**
- **Cliente**: `demo@food.dev` / `Demo123!`
- **Repartidor**: `courier@food.dev` / `Demo123!`
- **Admin**: `admin@food.dev` / `Demo123!`

---

## 📋 Paso 2: Configurar App Móvil

### 2.1 Crear archivo .env para Mobile

Crea el archivo `apps/mobile/.env` con:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000

# Mapbox (opcional por ahora)
EXPO_PUBLIC_MAPBOX_TOKEN=
```

**⚠️ IMPORTANTE**: Reemplaza `TU_IP_LOCAL` con tu IP local (ejemplo: `http://192.168.1.100:4000`)

Para encontrar tu IP:
- **Windows**: `ipconfig` (busca IPv4)
- **Mac/Linux**: `ifconfig` o `ip addr`

### 2.2 Instalar Dependencias Faltantes

```bash
cd apps/mobile
pnpm install
```

---

## 📋 Paso 3: Iniciar Servidores

### 3.1 Iniciar Backend (Terminal 1)

```bash
cd apps/api
pnpm run start:dev
```

Deberías ver:
```
[Nest] 12345  - Application is running on: http://localhost:4000
```

### 3.2 Iniciar Mobile App (Terminal 2)

```bash
cd apps/mobile
pnpm start
```

O si tienes problemas:
```bash
npx expo start --clear --offline
```

---

## 📋 Paso 4: Conectar tu Teléfono

### 4.1 Instalar Expo Go

- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 4.2 Escanear QR

1. Abre Expo Go en tu teléfono
2. Escanea el código QR que aparece en la terminal
3. Espera a que la app se cargue

---

## 📋 Paso 5: Probar la Aplicación

### 5.1 Flujo Completo de Prueba

1. **Abrir App** → Ver splash screen
2. **Skip Onboarding** → Saltar introducción
3. **Login** → Usar `demo@food.dev` / `Demo123!`
4. **Ver Home** → Ver restaurantes cargados desde la API
5. **Buscar** → Probar búsqueda de restaurantes
6. **Ver Detalle** → Tocar un restaurante
7. **Agregar al Carrito** → Agregar productos
8. **Ver Carrito** → Revisar productos agregados
9. **Checkout** → Proceder al pago
10. **Confirmar** → Ver pedido confirmado

---

## 🔧 Solución de Problemas Comunes

### Problema 1: "Cannot connect to database"

**Solución:**
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Prueba la conexión: `npx prisma studio`

### Problema 2: "Network request failed" en la app

**Solución:**
- Verifica que el backend esté corriendo (`http://localhost:4000`)
- Verifica que uses tu IP local en `EXPO_PUBLIC_API_URL`
- Asegúrate de estar en la misma red WiFi

### Problema 3: "Module not found: axios"

**Solución:**
```bash
cd apps/mobile
pnpm install axios expo-secure-store
```

### Problema 4: Metro bundler no inicia

**Solución:**
```bash
# Limpiar cache
cd apps/mobile
rm -rf node_modules
pnpm install
npx expo start --clear
```

### Problema 5: "Prisma Client not generated"

**Solución:**
```bash
cd apps/api
npx prisma generate
```

---

## 📊 Verificar que Todo Funciona

### Backend API

Abre en tu navegador:
- http://localhost:4000 → Deberías ver "Hello World" o similar
- http://localhost:4000/restaurants → Deberías ver JSON con restaurantes

### Prisma Studio (Explorador de BD)

```bash
cd apps/api
npx prisma studio
```

Abre http://localhost:5555 para ver tus datos.

### Mobile App

En la app deberías ver:
- ✅ Restaurantes reales (no mock data)
- ✅ Iconos monocromáticos
- ✅ Colores personalizados (azul + rojo + crema)
- ✅ Diseño estilo DoorDash

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Conectar Pantallas con API**
   - Actualizar `home.tsx` para cargar restaurantes reales
   - Implementar búsqueda funcional
   - Conectar detalle de restaurante

2. **Implementar Autenticación**
   - Conectar login/register con API
   - Guardar tokens
   - Proteger rutas privadas

3. **Implementar Carrito**
   - Agregar productos al carrito
   - Sincronizar con backend
   - Calcular totales

4. **Implementar Checkout**
   - Seleccionar dirección
   - Crear pedido
   - Confirmar pago

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. **Revisa los logs**:
   - Backend: Terminal donde corre `pnpm start:dev`
   - Mobile: Metro bundler + DevTools del navegador

2. **Verifica configuración**:
   - `.env` files existen y tienen valores correctos
   - Base de datos está corriendo
   - Puertos no están ocupados (4000, 8081)

3. **Reinicia todo**:
   ```bash
   # Detener todos los procesos
   # Ctrl+C en ambas terminales
   
   # Reiniciar backend
   cd apps/api
   pnpm run start:dev
   
   # Reiniciar mobile
   cd apps/mobile
   pnpm start
   ```

---

## ✅ Checklist Final

Antes de continuar, verifica que:

- [ ] PostgreSQL está corriendo
- [ ] Base de datos `delivery_ocotepeque` existe
- [ ] Migraciones ejecutadas (`prisma migrate dev`)
- [ ] Seed ejecutado (`prisma db seed`)
- [ ] Archivo `apps/api/.env` creado con credenciales correctas
- [ ] Archivo `apps/mobile/.env` creado con tu IP local
- [ ] Backend corriendo en puerto 4000
- [ ] Mobile app corriendo en puerto 8081
- [ ] Puedes hacer login con `demo@food.dev`
- [ ] Ves restaurantes en la app

---

**¡Listo! Tu plataforma de delivery está configurada y lista para usar.** 🎉
