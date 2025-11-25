# Guía de Solución de Problemas - App Mobile

## Error 500 y MIME Type Incorrecto en Windows

### Síntomas
- Pantalla en blanco al cargar la aplicación
- Error 500 en la consola del navegador
- Error: "MIME type ('application/json') is not executable"
- URLs con backslashes codificados (%5C o %5C%5C)
- Error específico: `..%5C..%5Cnode_modules%5Cexpo-router%5Centry.bundle`
- Error: `net::ERR_ABORTED 500 (Internal Server Error)`

### Causa
Este problema ocurre en Windows con monorepos debido a:
1. **Node_modules hoisted:** En monorepos, los node_modules están en la raíz (`../../`), no en `apps/mobile/`
2. **Rutas relativas:** Expo calcula rutas como `../../node_modules/expo-router/entry`
3. **Metro rechaza la petición:** Metro considera que `../../` está "fuera" de su server root y responde con JSON (500)
4. **Backslashes en Windows:** Las URLs contienen `%5C` (backslash codificado) en lugar de `/`
5. **Puerto inválido:** A veces Expo asigna el puerto 65536 (fuera del rango válido)

### Solución

#### ⭐ Paso 0: Configurar Variable de Entorno (CRÍTICO)
```bash
# Agregar a apps/mobile/.env
EXPO_USE_METRO_WORKSPACE_ROOT=1
```

**Esta es la solución principal.** Sin esta variable, Metro no puede servir archivos desde la raíz del monorepo.

Si el archivo `.env` no existe, cópialo desde `.env.example`:
```powershell
Copy-Item .env.example .env
# Luego agrega la línea EXPO_USE_METRO_WORKSPACE_ROOT=1
```

#### Solución Rápida (Recomendada)
```powershell
# Ejecutar el script automatizado
.\fix-windows-paths.ps1
```

#### 1. Limpiar la caché manualmente
```powershell
# Opción 1: Usar el script de limpieza
npm run start:clear

# Opción 2: Limpieza manual completa
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
npm cache clean --force
```

#### 2. Reiniciar el servidor
```powershell
# Iniciar con caché limpia y puerto explícito
npx expo start --clear --port 8081

# O para web específicamente
npx expo start --clear --web --port 8081

# O usar el script de npm
npm run start:clear
```

#### 3. Limpiar caché del navegador
- Presiona `Ctrl + Shift + Delete` en tu navegador
- Selecciona "Caché" y "Cookies"
- Limpia los datos
- Cierra y vuelve a abrir el navegador

#### 3. Si el problema persiste
```bash
# Reinstalar dependencias
Remove-Item -Path "node_modules" -Recurse -Force
npm install

# Limpiar caché de npm
npm cache clean --force

# Iniciar de nuevo
npx expo start --clear
```

### Configuración de Metro (metro.config.js)

El archivo `metro.config.js` ha sido configurado para:
- **Puerto fijo 8081** para evitar el error de puerto 65536
- **Normalizar URLs en Windows** (convertir `%5C` y `\` a `/`)
- **Middleware simple** que solo reemplaza backslashes
- **Soportar monorepos** con múltiples carpetas de node_modules

**Variable de entorno clave (.env):**
```bash
EXPO_USE_METRO_WORKSPACE_ROOT=1
```
Esta variable fuerza a Expo/Metro a usar la raíz del workspace como serverRoot. Sin ella, Metro considera que las rutas `../../node_modules/...` están "fuera" de su raíz y responde con JSON (500) en lugar de JavaScript, causando el error de MIME type incorrecto.

**Por qué NO usar `unstable_serverRoot` en metro.config.js:**
Aunque `config.server.unstable_serverRoot = workspaceRoot` parece la solución obvia, causa problemas con la resolución de módulos internos de React Native. La variable de entorno `EXPO_USE_METRO_WORKSPACE_ROOT=1` es la forma correcta y soportada de lograr lo mismo.

### Prevención

Para evitar este problema en el futuro:
1. Siempre usar `npm run start:clear` después de cambios importantes
2. No modificar manualmente archivos en `.expo/` o `dist/`
3. Mantener las dependencias actualizadas
4. Usar rutas relativas en lugar de absolutas cuando sea posible

### Comandos Útiles

```bash
# Iniciar con caché limpia
npm run start:clear

# Iniciar normalmente
npm start

# Ver todos los comandos disponibles
npx expo start --help
```

## Otros Problemas Comunes

### Error: Puerto 65536 (Puerto Inválido)
Si ves un error sobre el puerto 65536 (fuera del rango válido 0-65535):

**Causa:** Expo a veces asigna un puerto inválido automáticamente en Windows.

**Solución:**
```powershell
# Siempre especificar el puerto explícitamente
npx expo start --port 8081

# O usar los scripts de npm que ya tienen el puerto configurado
npm start
```

**Configuración permanente:**
El archivo `metro.config.js` ya tiene configurado `config.server.port = 8081` para forzar un puerto válido.

### Puerto en uso
Si el puerto 8081 está en uso:
```powershell
# Encontrar el proceso usando el puerto
netstat -ano | findstr :8081

# Matar el proceso (reemplazar PID con el ID del proceso)
taskkill /PID <PID> /F

# O matar todos los procesos de Node
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

### Problemas de permisos
Si hay errores de permisos:
```bash
# Ejecutar PowerShell como administrador
# Luego ejecutar los comandos de limpieza
```

### Problemas con watchman (si está instalado)
```bash
watchman watch-del-all
```
