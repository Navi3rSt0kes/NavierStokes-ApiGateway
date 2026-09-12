const http = require('node:http');
const { sendJson } = require('../lib/http');

const services = {
  users: process.env.USERS_URL || 'http://localhost:3001',
  warehouse: process.env.WAREHOUSE_URL || 'http://localhost:3002',
  ia: process.env.IA_URL || 'http://localhost:3003'
};
const port = Number(process.env.GATEWAY_PORT || 3000);

function proxy(request, response, target) {
  const upstream = new URL(request.url.replace(/^\/api\/(users|warehouse|ia)/, '') || '/', target);
  const upstreamRequest = http.request(upstream, {
    method: request.method,
    headers: { ...request.headers, host: upstream.host }
  }, (upstreamResponse) => {
    response.writeHead(upstreamResponse.statusCode || 502, {
      ...upstreamResponse.headers,
      'access-control-allow-origin': '*'
    });
    upstreamResponse.pipe(response);
  });
  upstreamRequest.on('error', () => sendJson(response, 502, { error: 'Servicio no disponible' }));
  request.pipe(upstreamRequest);
}

const server = http.createServer((request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  if (request.url === '/health') return sendJson(response, 200, { status: 'ok', service: 'gateway' });
  const match = request.url.match(/^\/api\/(users|warehouse|ia)(\/|\?|$)/);
  if (match) return proxy(request, response, services[match[1]]);
  return sendJson(response, 404, { error: 'Ruta no encontrada', routes: Object.keys(services).map((name) => `/api/${name}`) });
});

server.listen(port, () => console.log(`gateway listening on :${port}`));
