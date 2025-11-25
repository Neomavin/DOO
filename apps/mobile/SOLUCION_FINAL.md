# ✅ Solución Final - Error 500 en Expo Web (Windows)

## 🎯 Problema Resuelto

**Error:** Pantalla en blanco con error 500 al cargar Expo Web en Windows
**URL problemática:** `http://localhost:8081/..%5C..%5Cnode_modules%5Cexpo-router%5Centry.bundle`
**Causa raíz:** Metro bundler no manejaba correctamente:
1. Backslashes codificados (`%5C`) en URLs de Windows
2. Rutas relativas fuera de la raíz del servidor en monorepos
3. Puerto inválido (65536) asignado automáticamente

## 🔧 Solución Implementada

### 1. Variable de Entorno EXPO_USE_METRO_WORKSPACE_ROOT (CRÍTICO)
```bash
EXPO_USE_METRO_WORKSPACE_ROOT=1
```
**Por qué es crítico:** En monorepos con node_modules hoisted en la raíz, Expo calcula rutas relativas como `../../node_modules/expo-router/entry`. Metro responde con JSON (500) porque considera que la petición "sale" de su server root. Esta variable fuerza a Metro a usar la raíz del workspace como serverRoot, convirtiendo las rutas a `/node_modules/...` y sirviéndolas con el MIME correcto.

**Ubicación:** `apps/mobile/.env`

### 2. Middleware de Normalización de URLs en Windows
```javascript
const normalizeRequestUrl = (incomingUrl) => {
  if (!incomingUrl) return incomingUrl;

  const [rawPathname, ...searchParts] = incomingUrl.split('?');
  const search = searchParts.join('?');
  
  // SOLO reemplazar backslashes - dejar que Metro resuelva rutas relativas
  const sanitizedPathname = rawPathname
    .replace(/%5C/gi, '/')  // %5C -> '/'
    .replace(/\\/g, '/');    // \ -> '/'
  
  return `${sanitizedPathname}${search ? `?${search}` : ''}`;
};
```

**Importante:** NO normalizar los `..` con `path.posix.normalize()`. Con `EXPO_USE_METRO_WORKSPACE_ROOT=1`, las rutas ya no contienen `..` y Metro las resuelve correctamente.

### 3. Puerto Fijo
```javascript
config.server.port = 8081;
```
Evita el error de puerto 65536 (fuera del rango válido 0-65535).

### 4. Middleware de Normalización
```javascript
config.server.enhanceMiddleware = (middleware) => {
  const baseMiddleware = previousEnhancer ? previousEnhancer(middleware) : middleware;
  
  return (req, res, next) => {
    if (req.url) {
      const normalizedUrl = normalizeRequestUrl(req.url);
      if (normalizedUrl !== req.url) {
        console.log(`[Metro] Normalized: ${req.url} -> ${normalizedUrl}`);
        req.url = normalizedUrl;
      }
    }
    return baseMiddleware(req, res, next);
  };
};
```

## 📋 Archivos Modificados

### `.env` (CRÍTICO)
```bash
EXPO_USE_METRO_WORKSPACE_ROOT=1
```
- ✅ Fuerza a Metro a usar la raíz del workspace como serverRoot
- ✅ Elimina rutas relativas `../../` del HTML generado
- ✅ Las rutas se convierten a `/node_modules/...`

### `metro.config.js`
- ✅ Puerto fijo 8081
- ✅ Función simple de normalización de URLs (solo backslashes)
- ✅ Middleware que preserva configuraciones previas
- ❌ NO usa `unstable_serverRoot` (se maneja con variable de entorno)

### `package.json`
- ✅ Todos los scripts incluyen `--port 8081`
- ✅ `npm start` → `npx expo start --port 8081`
- ✅ `npm run start:clear` → `npx expo start --clear --port 8081`

### Scripts de Automatización
- ✅ `fix-windows-paths.ps1` - Script de limpieza completa
- ✅ `TROUBLESHOOTING.md` - Guía completa de solución de problemas

## 🚀 Cómo Usar

### Inicio Normal
```powershell
npm start
```

### Inicio con Caché Limpia
```powershell
npm run start:clear
```

### Limpieza Completa (si hay problemas)
```powershell
.\fix-windows-paths.ps1
```

## ✅ Verificación

1. **Servidor iniciado:** Puerto 8081
2. **Abrir navegador:** `http://localhost:8081`
3. **Verificar logs:** Deberías ver `[Metro] Normalized:` si había URLs con backslashes
4. **Sin errores 500:** La aplicación carga correctamente
5. **MIME correcto:** Los bundles se sirven como `application/javascript`

## 🔍 Diagnóstico de Problemas

### Si el error persiste:

**1. Verificar variables de entorno:**
```powershell
Get-ChildItem Env: | Where-Object { $_.Name -like "*PORT*" -or $_.Name -like "*METRO*" }
```

**2. Limpiar caché del navegador:**
- `Ctrl + Shift + Delete`
- Seleccionar "Caché" y "Cookies"
- Cerrar completamente el navegador
- Volver a abrir

**3. Verificar que Metro esté sirviendo desde la raíz correcta:**
Los logs deberían mostrar:
```
[Metro] Normalized: /..%5C..%5Cnode_modules/expo-router/entry.bundle -> /node_modules/expo-router/entry.bundle
```

**4. Si el puerto 65536 persiste:**
```powershell
# Verificar variables
$env:RCT_METRO_PORT
$env:EXPO_DEV_SERVER_PORT

# Si existen con valor 65536, eliminarlas
Remove-Item Env:RCT_METRO_PORT -ErrorAction SilentlyContinue
Remove-Item Env:EXPO_DEV_SERVER_PORT -ErrorAction SilentlyContinue

# Reiniciar el servidor
npm run start:clear
```

## 📚 Recursos Adicionales

- **Metro Bundler Config:** https://facebook.github.io/metro/docs/configuration
- **Expo Router:** https://docs.expo.dev/router/introduction/
- **Monorepo Setup:** https://docs.expo.dev/guides/monorepos/

## 🎉 Resultado

Con esta configuración:
- ✅ Las URLs con backslashes se normalizan automáticamente
- ✅ Metro sirve correctamente desde la raíz del monorepo
- ✅ Los bundles se sirven con el MIME type correcto
- ✅ El puerto es siempre válido (8081)
- ✅ Compatible con Windows y monorepos

**La aplicación ahora carga correctamente en el navegador sin errores 500.**
