// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Configurar para monorepo
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Configurar para evitar errores de permisos con symlinks en Windows
config.resolver.blockList = [
  /\.ignored_.*$/,
  /node_modules\/.*\/node_modules\/\.ignored_.*$/,
];

// Normaliza las URLs provenientes del navegador para que Metro no falle en Windows
const normalizeRequestUrl = (incomingUrl) => {
  if (!incomingUrl) {
    return incomingUrl;
  }

  // Separar pathname y query string
  const [rawPathname, ...searchParts] = incomingUrl.split('?');
  const search = searchParts.join('?');

  // SOLO reemplazar backslashes por forward slashes
  // NO normalizar los .. porque Metro necesita resolverlos desde su raíz
  const sanitizedPathname = rawPathname
    .replace(/%5C/gi, '/')  // %5C -> '/'
    .replace(/\\/g, '/');    // \ -> '/'

  return `${sanitizedPathname}${search ? `?${search}` : ''}`;
};

// Configuración del servidor Metro
config.server = config.server || {};
config.server.port = 8081; // Forzar puerto válido para evitar error 65536
// NO usar unstable_serverRoot - causa problemas con resolución de módulos de React Native

const previousRewriteRequestUrl = config.server.rewriteRequestUrl;

config.server.rewriteRequestUrl = (url) => {
  if (!url) {
    return url;
  }

  const normalizedUrl = normalizeRequestUrl(url);

  if (normalizedUrl !== url) {
    console.log(`[Metro] rewriteRequestUrl: ${url} -> ${normalizedUrl}`);
  }

  return previousRewriteRequestUrl
    ? previousRewriteRequestUrl(normalizedUrl)
    : normalizedUrl;
};

const previousEnhancer = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware, server) => {
  const baseMiddleware = previousEnhancer
    ? previousEnhancer(middleware, server)
    : middleware;

  return (req, res, next) => {
    // Normalizar URLs entrantes
    if (req.url) {
      const normalizedUrl = normalizeRequestUrl(req.url);

      if (normalizedUrl !== req.url) {
        console.log(`[Metro] Normalized: ${req.url} -> ${normalizedUrl}`);
        req.url = normalizedUrl;
      }
    }

    // Interceptar respuestas HTML para corregir rutas de Windows
    const originalWrite = res.write;
    const originalEnd = res.end;
    const chunks = [];

    res.write = function (chunk, ...args) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return true;
    };

    res.end = function (chunk, ...args) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      // Solo procesar respuestas HTML
      const contentType = res.getHeader('content-type') || '';
      if (contentType.includes('text/html')) {
        let html = Buffer.concat(chunks).toString('utf8');

        // Reemplazar todas las rutas de Windows en el HTML
        // Convertir node_modules\expo-router a node_modules/expo-router
        html = html.replace(/node_modules\\+/g, 'node_modules/');
        html = html.replace(/%5C/gi, '/');

        console.log('[Metro] Fixed Windows paths in HTML');

        res.write = originalWrite;
        res.end = originalEnd;
        return res.end(html, ...args);
      }

      // Para respuestas no-HTML, restaurar y enviar normalmente
      res.write = originalWrite;
      res.end = originalEnd;

      chunks.forEach(chunk => res.write(chunk));
      return res.end(...args);
    };

    return baseMiddleware(req, res, next);
  };
};

module.exports = config;
