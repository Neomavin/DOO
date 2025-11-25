# 🔧 Guía de Solución - Login App Móvil

**Problema:** No se puede ingresar a la app móvil del cliente.

---

## ✅ Cambios Implementados

### 1. **Mejoras en `services/api.ts`**

#### Logging Mejorado
- ✅ Log de la URL del API al iniciar
- ✅ Log de cada petición HTTP (método + URL)
- ✅ Log detallado de errores con toda la información

#### Timeout Aumentado
- Antes: 10 segundos
- Ahora: **15 segundos**
- Razón: Dar más tiempo en conexiones lentas

#### Mensajes de Error Mejorados
- ✅ Error de conexión muestra la URL exacta del backend
- ✅ Error 401 muestra credenciales de demo
- ✅ Errores del servidor muestran el mensaje real del backend

---

### 2. **Mejoras en `app/login.tsx`**

#### Manejo de Errores Específicos
```typescript
if (error.message?.includes('No pudimos comunicarnos')) {
  // Error de conexión
  message = 'No se puede conectar al servidor.\n\n' +
            'Verifica que:\n' +
            '1. El backend esté corriendo\n' +
            '2. La URL del API sea correcta\n' +
            '3. Tu conexión a internet funcione';
}
```

#### Logging de Debug
- ✅ Log antes de intentar login
- ✅ Log si el login es exitoso
- ✅ Log detallado del error si falla

---

## 🔍 Cómo Diagnosticar el Problema

### Paso 1: Verificar que el Backend esté corriendo

```bash
cd apps/api
pnpm run start:dev
```

**Deberías ver:**
```
🚀 API running on http://localhost:4000
📚 Swagger docs available at http://localhost:4000/docs
```

Si no ves esto, el backend no está corriendo. **Inícialo primero**.

---

### Paso 2: Verificar la URL del API

#### En desarrollo local (mismo dispositivo)
```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

#### En dispositivo físico o emulador diferente
Necesitas usar la IP de tu computadora:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:4000
```

**¿Cómo encontrar tu IP?**

**Windows:**
```bash
ipconfig
# Busca "Dirección IPv4" en tu conexión Wi-Fi o Ethernet
```

**macOS/Linux:**
```bash
ifconfig | grep "inet "
# Busca tu IP local (usualmente 192.168.x.x)
```

**Ejemplo:**
Si tu IP es `192.168.1.37`, tu `.env` debe ser:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.37:4000
```

---

### Paso 3: Verificar el archivo `.env`

#### Crear el archivo si no existe
```bash
cd apps/mobile
cp .env.example .env
```

#### Editar el archivo `.env`
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://TU_IP:4000

# Mapbox (opcional por ahora)
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token_here
```

**IMPORTANTE:** Después de modificar `.env`, debes **reiniciar Metro**:
```bash
# Detén Metro (Ctrl+C)
# Luego reinicia:
pnpm start --clear
```

---

### Paso 4: Revisar los Logs

Cuando intentes hacer login, deberías ver en la consola:

#### ✅ Si todo va bien:
```
🔌 API_URL configurada: http://192.168.1.37:4000
🔐 Intentando login con: demo@food.dev
📤 POST http://192.168.1.37:4000/auth/login
✅ Login exitoso: Demo User
```

#### ❌ Si hay un error de conexión:
```
🔌 API_URL configurada: http://localhost:4000
🔐 Intentando login con: demo@food.dev
📤 POST http://localhost:4000/auth/login
❌ No se pudo conectar al servidor. URL: http://localhost:4000
❌ Error en login: No pudimos comunicarnos con el servidor...
```
**Solución:** Cambiar `localhost` por tu IP local.

#### ❌ Si el backend no está corriendo:
```
❌ Error de API: {
  message: 'Network Error',
  request: {...}
}
❌ No se pudo conectar al servidor. URL: http://192.168.1.37:4000
```
**Solución:** Iniciar el backend.

#### ❌ Si las credenciales son incorrectas:
```
❌ Error de API: {
  status: 401,
  statusText: 'Unauthorized',
  data: { message: 'Invalid credentials' }
}
```
**Solución:** Usar credenciales correctas.

---

## 🚀 Pasos para Ejecutar Correctamente

### 1. Iniciar el Backend
```bash
# Terminal 1
cd apps/api
pnpm run start:dev

# Espera a ver:
# 🚀 API running on http://localhost:4000
```

### 2. Configurar .env de la App Móvil

#### Si usas emulador Android en la misma PC:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

#### Si usas emulador iOS en la misma Mac:
```env
EXPO_PUBLIC_API_URL=http://localhost:4000
```

#### Si usas dispositivo físico:
```env
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:4000
```

### 3. Iniciar la App Móvil
```bash
# Terminal 2
cd apps/mobile
pnpm start --clear

# Presiona:
# - 'a' para Android
# - 'i' para iOS
# O escanea el QR con Expo Go
```

### 4. Intentar Login

**Credenciales de prueba:**
- Email: `demo@food.dev`
- Password: `Demo123!`

---

## 🐛 Errores Comunes y Soluciones

### Error: "No pudimos comunicarnos con el servidor"

**Causas posibles:**
1. ❌ El backend no está corriendo
2. ❌ La URL en `.env` es incorrecta
3. ❌ Firewall bloqueando el puerto 4000
4. ❌ No estás en la misma red (dispositivo físico)

**Soluciones:**
1. ✅ Inicia el backend: `cd apps/api && pnpm run start:dev`
2. ✅ Verifica tu IP: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
3. ✅ Actualiza `.env` con la IP correcta
4. ✅ Reinicia Metro: `pnpm start --clear`

---

### Error: "Invalid credentials" o 401

**Causa:**
- Credenciales incorrectas o usuario no existe

**Soluciones:**
1. ✅ Usa las credenciales de demo: `demo@food.dev` / `Demo123!`
2. ✅ Verifica que la base de datos tenga el usuario de prueba:
   ```bash
   cd apps/api
   pnpm run db:seed
   ```

---

### Error: "Network Error" o "timeout"

**Causas posibles:**
1. ❌ El backend tarda mucho en responder
2. ❌ Problemas de red
3. ❌ URL incorrecta

**Soluciones:**
1. ✅ El timeout ya está aumentado a 15 segundos
2. ✅ Verifica tu conexión a internet
3. ✅ Prueba la URL en el navegador: `http://TU_IP:4000/docs`

---

## 📱 Configuraciones Específicas por Plataforma

### Android Emulator (AVD)
```env
# Android emulator usa una IP especial para acceder al host
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

### iOS Simulator
```env
# iOS simulator puede usar localhost
EXPO_PUBLIC_API_URL=http://localhost:4000
```

### Expo Go en Dispositivo Físico
```env
# Debe estar en la misma red Wi-Fi
EXPO_PUBLIC_API_URL=http://192.168.1.X:4000
```

**Para encontrar tu IP:**
```bash
# Windows
ipconfig

# Mac/Linux  
ifconfig

# Busca algo como: 192.168.1.37
```

---

## ✅ Checklist de Verificación

Antes de intentar hacer login, verifica:

- [ ] Backend corriendo en `http://localhost:4000`
- [ ] Puedes acceder a `http://localhost:4000/docs` en el navegador
- [ ] Archivo `.env` existe en `apps/mobile/`
- [ ] `EXPO_PUBLIC_API_URL` tiene la URL correcta
- [ ] Reiniciaste Metro después de cambiar `.env`
- [ ] La app móvil está conectada (cable o misma red Wi-Fi)
- [ ] Usas las credenciales correctas: `demo@food.dev` / `Demo123!`

---

## 🔬 Testing Manual

### Test 1: Backend Funcionando
```bash
curl http://localhost:4000/docs
```
**Esperado:** Debe responder con HTML de Swagger

### Test 2: Endpoint de Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@food.dev","password":"Demo123!"}'
```
**Esperado:** 
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Demo User",
    "email": "demo@food.dev"
  }
}
```

### Test 3: Conexión desde Dispositivo
Abre el navegador de tu teléfono y ve a:
```
http://TU_IP:4000/docs
```
Si no carga, **no estás en la misma red** o el **firewall está bloqueando**.

---

## 🔥 Solución Rápida (TL;DR)

```bash
# 1. Inicia el backend
cd apps/api
pnpm run start:dev

# 2. Encuentra tu IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# 3. Edita apps/mobile/.env
EXPO_PUBLIC_API_URL=http://TU_IP:4000

# 4. Reinicia la app móvil
cd apps/mobile
pnpm start --clear

# 5. Intenta login con:
# Email: demo@food.dev
# Password: Demo123!
```

---

## 📊 Logs que Debes Ver

### En la consola del Backend (Terminal 1):
```
[Nest] 12345  - 11/10/2025, 8:00:00 AM     LOG [NestApplication] Nest application successfully started
🚀 API running on http://localhost:4000
📚 Swagger docs available at http://localhost:4000/docs
```

### En la consola de Metro (Terminal 2):
```
🔌 API_URL configurada: http://192.168.1.37:4000
```

### Al hacer login:
```
🔐 Intentando login con: demo@food.dev
📤 POST http://192.168.1.37:4000/auth/login
✅ Login exitoso: Demo User
```

---

## 🎯 Resumen de Cambios

| Archivo | Cambio | Beneficio |
|---------|--------|-----------|
| `services/api.ts` | Logging mejorado | Ver exactamente qué URL se está usando |
| `services/api.ts` | Timeout 15s | Más tiempo para conexiones lentas |
| `services/api.ts` | Errores detallados | Mensajes claros sobre qué falló |
| `app/login.tsx` | Manejo de errores específicos | Guía al usuario sobre qué hacer |
| `app/login.tsx` | Logging de debug | Ver el flujo completo del login |

---

## 💡 Consejos Adicionales

1. **Siempre revisa la consola** - Los logs ahora son muy detallados
2. **Reinicia Metro después de cambiar .env** - Las variables de entorno se cargan al inicio
3. **Usa tu IP local, no localhost** - Si usas dispositivo físico o emulador remoto
4. **Verifica el firewall** - El puerto 4000 debe estar abierto
5. **Misma red Wi-Fi** - Tu PC y teléfono deben estar conectados a la misma red

---

**¿Sigues teniendo problemas?**

Revisa los logs completos y busca:
- ❌ Errores de red (Network Error)
- ❌ Errores 401 (credenciales)
- ❌ Timeout (backend lento)
- ❌ CORS (backend bloqueando)

El logging mejorado te dirá exactamente dónde está el problema. 🔍
