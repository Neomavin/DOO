# ✅ Geolocalización Implementada

## 📍 Resumen

Se ha implementado **geolocalización completa** en la app móvil de clientes para:
- Detectar ubicación automática del usuario
- Filtrar restaurantes por distancia (radio de 15km)
- Ordenar restaurantes por cercanía
- Mostrar distancia en lugar de tiempo estimado
- Validar zonas de cobertura

---

## 📦 Archivos Creados

### 1. **`services/location.service.ts`**
Servicio completo de geolocalización con:

✅ **Funciones principales:**
- `getCurrentLocation()` - Obtiene ubicación actual con permisos
- `calculateDistance()` - Calcula distancia entre dos puntos (Haversine)
- `calculateEstimatedDeliveryTime()` - Estima tiempo de entrega según distancia
- `isWithinCoverageArea()` - Valida si está en zona de cobertura
- `formatDistance()` - Formatea distancia (km o metros)
- `getAddressFromCoordinates()` - Geocoding inverso
- `hasLocationPermission()` - Verifica permisos

---

### 2. **`src/stores/locationStore.ts`**
Store de Zustand para gestionar estado de ubicación:

```typescript
interface LocationState {
  userLocation: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}
```

---

## 🔧 Archivos Modificados

### 3. **`app/addresses/new.tsx`**
✅ **Agregado:**
- Botón "📍 Usar mi ubicación actual"
- Detección automática de coordenadas
- Geocoding inverso para obtener dirección legible
- Loading state mientras detecta ubicación

**Antes:** Usuario escribía lat/lng manualmente  
**Ahora:** Un botón detecta todo automáticamente

---

### 4. **`app/(tabs)/home.tsx`**
✅ **Agregado:**
- Detección automática de ubicación al cargar
- Filtrado de restaurantes por distancia máxima (15km)
- Ordenamiento por cercanía (más cercanos primero)
- Muestra distancia real en lugar de tiempo estimado
- Store de ubicación integrado

**Lógica de filtrado:**
```typescript
// Solo muestra restaurantes a menos de 15km
if (userLocation) {
  filtered = filtered.filter((restaurant) => {
    const distance = locationService.calculateDistance(...);
    return distance <= MAX_DISTANCE_KM;
  });
}
```

---

### 5. **`app.json`**
✅ **Agregado:**
- Permisos de ubicación para Android (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`)
- Permisos de ubicación para iOS (`NSLocationWhenInUseUsageDescription`)
- Plugin de `expo-location` configurado
- Mensajes descriptivos para solicitar permisos

---

## 🎯 Funcionalidades Implementadas

### ✅ 1. Detección Automática de Ubicación
- Al abrir la app, solicita permisos
- Detecta ubicación en background
- Guarda en store global (Zustand)

### ✅ 2. Filtrado por Distancia
- Radio máximo: **15 km**
- Solo muestra restaurantes cercanos
- Si no hay ubicación, muestra todos

### ✅ 3. Ordenamiento por Cercanía
- Restaurantes más cercanos aparecen primero
- Usa fórmula de Haversine para precisión

### ✅ 4. Visualización de Distancia
- **Con ubicación:** Muestra "2.3 km" o "850 m"
- **Sin ubicación:** Muestra "30 min" (tiempo estimado)

### ✅ 5. Botón de Detección en Direcciones
- Detecta ubicación actual
- Obtiene dirección legible (geocoding inverso)
- Rellena campos automáticamente

### ✅ 6. Validación de Zona de Cobertura
- Función `isWithinCoverageArea()` lista para usar
- Puede validar si el usuario está en zona de entrega

---

## 📱 Experiencia de Usuario

### Flujo de Ubicación

1. **Primera vez:**
   - App solicita permiso de ubicación
   - Usuario acepta
   - Se detecta ubicación automática
   - Restaurantes se filtran por cercanía

2. **Pantalla de Home:**
   - Muestra solo restaurantes a menos de 15km
   - Ordenados por distancia
   - Muestra distancia real (ej: "1.2 km")

3. **Agregar Dirección:**
   - Usuario toca "📍 Usar mi ubicación actual"
   - Se detecta ubicación
   - Se obtiene dirección legible
   - Campos se rellenan automáticamente

---

## 🧪 Cómo Probar

### 1. En Expo Go (Simulador)
```bash
cd apps/mobile
pnpm start
```

**Nota:** En simulador, puedes simular ubicaciones:
- iOS: Debug → Location → Custom Location
- Android: Extended Controls → Location

### 2. En Dispositivo Real
```bash
pnpm start
# Escanear QR con Expo Go
```

**Permisos:**
- Primera vez pedirá permiso de ubicación
- Acepta "Permitir mientras uso la app"

### 3. Probar Filtrado
1. Abre la app
2. Ve a Home
3. Verás solo restaurantes cercanos (15km)
4. Ordenados por distancia
5. Muestra "X km" en lugar de tiempo

### 4. Probar Detección en Direcciones
1. Ve a Perfil → Direcciones
2. Toca "Nueva dirección"
3. Toca botón "📍 Usar mi ubicación actual"
4. Espera 2-3 segundos
5. Coordenadas y dirección se rellenan automáticamente

---

## 🔒 Permisos Configurados

### Android (`app.json`)
```json
"permissions": [
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION"
]
```

### iOS (`app.json`)
```json
"infoPlist": {
  "NSLocationWhenInUseUsageDescription": "Necesitamos tu ubicación..."
}
```

---

## 📊 Parámetros Configurables

### Radio de Búsqueda
**Archivo:** `app/(tabs)/home.tsx`
```typescript
const MAX_DISTANCE_KM = 15; // Cambiar según necesidad
```

### Velocidad Promedio (para cálculo de tiempo)
**Archivo:** `services/location.service.ts`
```typescript
const averageSpeed = 30; // km/h - Cambiar según ciudad
```

### Tiempo de Preparación
**Archivo:** `services/location.service.ts`
```typescript
const preparationTime = 15; // minutos - Cambiar según restaurante
```

---

## 🚀 Próximos Pasos Recomendados

### 1. Validación de Zona de Cobertura
Agregar en `home.tsx`:
```typescript
const OCOTEPEQUE_CENTER = { lat: 14.4370, lng: -89.1833 };
const COVERAGE_RADIUS_KM = 20;

if (userLocation) {
  const isInCoverage = locationService.isWithinCoverageArea(
    userLocation.lat,
    userLocation.lng,
    OCOTEPEQUE_CENTER.lat,
    OCOTEPEQUE_CENTER.lng,
    COVERAGE_RADIUS_KM
  );
  
  if (!isInCoverage) {
    Alert.alert('Fuera de zona', 'Lo sentimos, aún no llegamos a tu ubicación');
  }
}
```

### 2. Cálculo Dinámico de Costo de Delivery
```typescript
const calculateDeliveryCost = (distanceKm: number) => {
  const baseCost = 30; // L. 30 base
  const costPerKm = 10; // L. 10 por km adicional
  
  if (distanceKm <= 3) return baseCost;
  return baseCost + (distanceKm - 3) * costPerKm;
};
```

### 3. Mapa de Restaurantes Cercanos
Instalar `react-native-maps`:
```bash
pnpm add react-native-maps
```

Mostrar mapa con pins de restaurantes cercanos.

---

## ✅ Checklist de Implementación

- [x] Instalar `expo-location`
- [x] Crear `location.service.ts`
- [x] Crear `locationStore.ts`
- [x] Modificar `addresses/new.tsx` con botón de detección
- [x] Modificar `home.tsx` con filtrado por distancia
- [x] Actualizar `app.json` con permisos
- [x] Configurar plugin de expo-location
- [x] Agregar mensajes de permisos descriptivos
- [x] Implementar cálculo de distancia (Haversine)
- [x] Implementar formateo de distancia
- [x] Implementar geocoding inverso
- [x] Ordenar restaurantes por cercanía

---

## 🎉 Resultado Final

**Antes:**
- ❌ Sin geolocalización
- ❌ Usuario escribía coordenadas manualmente
- ❌ Mostraba todos los restaurantes sin filtro
- ❌ No sabía qué tan lejos estaban

**Ahora:**
- ✅ Geolocalización automática
- ✅ Detección con un botón
- ✅ Solo restaurantes cercanos (15km)
- ✅ Ordenados por distancia
- ✅ Muestra distancia real
- ✅ Listo para segmentación geográfica

---

## 📝 Notas Importantes

1. **Permisos:** La app pedirá permisos la primera vez
2. **GPS:** Debe estar activado en el dispositivo
3. **Precisión:** Usa `Accuracy.Balanced` para balance entre precisión y batería
4. **Fallback:** Si no hay ubicación, muestra todos los restaurantes
5. **Radio:** 15km es configurable según necesidad

---

**Implementado por:** Cascade AI  
**Fecha:** Noviembre 2025  
**Estado:** ✅ Completamente funcional
