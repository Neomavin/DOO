const http = require('http');
const httpProxy = require('http-proxy');

// Crear proxy
const proxy = httpProxy.createProxyServer({});

// Crear servidor que intercepta y modifica HTML
const server = http.createServer((req, res) => {
    // Interceptar respuestas
    proxy.web(req, res, { target: 'http://localhost:8081' }, (err) => {
        console.error('Proxy error:', err);
        res.writeHead(500);
        res.end('Proxy error');
    });
});

// Modificar respuestas HTML
proxy.on('proxyRes', (proxyRes, req, res) => {
    const contentType = proxyRes.headers['content-type'] || '';

    if (contentType.includes('text/html')) {
        let body = '';
        proxyRes.on('data', (chunk) => {
            body += chunk.toString();
        });

        proxyRes.on('end', () => {
            // Reemplazar rutas de Windows
            body = body.replace(/node_modules\\+/g, 'node_modules/');
            body = body.replace(/%5C/gi, '/');

            console.log('[Proxy] Fixed Windows paths in HTML');

            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(body);
        });
    } else {
        // Para otros tipos de contenido, pasar sin modificar
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    }
});

server.listen(3000, () => {
    console.log('Proxy server running on http://localhost:3000');
    console.log('Forwarding to Expo on http://localhost:8081');
});
