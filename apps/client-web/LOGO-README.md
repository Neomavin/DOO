# Cómo Reemplazar el Logo

## Ubicación del Logo
El logo está en: `apps/client-web/public/ghost-logo.svg`

## Cómo Cambiarlo

### Opción 1: Reemplazar el SVG
1. Crea tu logo en formato SVG
2. Guárdalo como `ghost-logo.svg`
3. Reemplaza el archivo en `apps/client-web/public/ghost-logo.svg`
4. Recarga la página

### Opción 2: Usar PNG/JPG
1. Guarda tu logo como `ghost-logo.png` (o `.jpg`)
2. Colócalo en `apps/client-web/public/`
3. Edita `src/components/Logo.jsx`:
   ```jsx
   <img src="/ghost-logo.png" alt="Ghost Logo" />
   ```

## Recomendaciones
- **Tamaño**: 200x200px o mayor
- **Formato**: SVG (preferido) o PNG con fondo transparente
- **Colores**: Usa los colores de la marca (#8b5cf6, #6366f1)

## El Logo se Usa En
- Página de Login
- Página de Registro
- Header de la app (próximamente)

## Tamaños Disponibles
El componente `<Logo />` acepta 3 tamaños:
- `small` - 40px
- `medium` - 80px (default)
- `large` - 120px

Ejemplo:
```jsx
<Logo size="small" />
<Logo size="medium" />
<Logo size="large" />
```
