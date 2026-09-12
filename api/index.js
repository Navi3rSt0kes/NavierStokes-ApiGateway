const { randomUUID } = require('node:crypto');

// Vercel keeps a function instance warm when possible; this preserves the
// original gateway's in-memory behavior, but it is not durable storage.
const users = [];
const items = [];

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('access-control-allow-origin', '*');
  response.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('access-control-allow-headers', 'content-type');
  response.end(status === 204 ? undefined : JSON.stringify(body));
}

function readBody(request) {
  if (request.body && typeof request.body === 'object') return Promise.resolve(request.body);
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => { raw += chunk; });
    request.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('El cuerpo debe ser JSON válido')); }
    });
    request.on('error', reject);
  });
}

function notFound(response) {
  sendJson(response, 404, { error: 'Ruta no encontrada' });
}

module.exports = async (request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  const pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;

  if (pathname === '/health') return sendJson(response, 200, { status: 'ok', service: 'gateway' });
  if (pathname === '/api/users/health') return sendJson(response, 200, { status: 'ok', service: 'users' });
  if (pathname === '/api/warehouse/health') return sendJson(response, 200, { status: 'ok', service: 'warehouse' });
  if (pathname === '/api/ia/health') return sendJson(response, 200, { status: 'ok', service: 'ia' });

  if (pathname === '/api/users/users' && request.method === 'GET') return sendJson(response, 200, users);
  if (pathname === '/api/users/users' && request.method === 'POST') {
    try {
      const { name, email } = await readBody(request);
      if (!name || !email) return sendJson(response, 400, { error: 'name y email son obligatorios' });
      const user = { id: randomUUID(), name, email };
      users.push(user);
      return sendJson(response, 201, user);
    } catch (error) { return sendJson(response, 400, { error: error.message }); }
  }

  const userId = pathname.match(/^\/api\/users\/users\/([^/]+)$/)?.[1];
  if (userId && request.method === 'GET') {
    const user = users.find((entry) => entry.id === userId);
    return user ? sendJson(response, 200, user) : sendJson(response, 404, { error: 'Usuario no encontrado' });
  }

  if (pathname === '/api/warehouse/items' && request.method === 'GET') return sendJson(response, 200, items);
  if (pathname === '/api/warehouse/items' && request.method === 'POST') {
    try {
      const { name, quantity } = await readBody(request);
      if (!name || !Number.isFinite(quantity) || quantity < 0) return sendJson(response, 400, { error: 'name y quantity (>= 0) son obligatorios' });
      const item = { id: randomUUID(), name, quantity };
      items.push(item);
      return sendJson(response, 201, item);
    } catch (error) { return sendJson(response, 400, { error: error.message }); }
  }

  const itemId = pathname.match(/^\/api\/warehouse\/items\/([^/]+)$/)?.[1];
  if (itemId && request.method === 'PUT') {
    try {
      const item = items.find((entry) => entry.id === itemId);
      if (!item) return sendJson(response, 404, { error: 'Producto no encontrado' });
      const { quantity } = await readBody(request);
      if (!Number.isFinite(quantity) || quantity < 0) return sendJson(response, 400, { error: 'quantity debe ser un número >= 0' });
      item.quantity = quantity;
      return sendJson(response, 200, item);
    } catch (error) { return sendJson(response, 400, { error: error.message }); }
  }

  if (pathname === '/api/ia/generate' && request.method === 'POST') {
    try {
      const { prompt } = await readBody(request);
      if (!prompt || typeof prompt !== 'string') return sendJson(response, 400, { error: 'prompt es obligatorio' });
      return sendJson(response, 200, { response: `Respuesta simulada para: ${prompt}`, provider: 'local-mock' });
    } catch (error) { return sendJson(response, 400, { error: error.message }); }
  }

  return notFound(response);
};
