const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { sendJson, readJson, requestUrl, notFound } = require('../../lib/http');

const items = [];
const port = Number(process.env.WAREHOUSE_PORT || 3002);

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  const { pathname } = requestUrl(request);
  if (pathname === '/health') return sendJson(response, 200, { status: 'ok', service: 'warehouse' });
  if (pathname === '/items' && request.method === 'GET') return sendJson(response, 200, items);
  if (pathname === '/items' && request.method === 'POST') {
    try {
      const { name, quantity } = await readJson(request);
      if (!name || !Number.isFinite(quantity) || quantity < 0) return sendJson(response, 400, { error: 'name y quantity (>= 0) son obligatorios' });
      const item = { id: randomUUID(), name, quantity };
      items.push(item);
      return sendJson(response, 201, item);
    } catch (error) { return sendJson(response, error.statusCode || 500, { error: error.message }); }
  }
  const id = pathname.match(/^\/items\/([^/]+)$/)?.[1];
  if (id && request.method === 'PUT') {
    try {
      const item = items.find((entry) => entry.id === id);
      if (!item) return sendJson(response, 404, { error: 'Producto no encontrado' });
      const { quantity } = await readJson(request);
      if (!Number.isFinite(quantity) || quantity < 0) return sendJson(response, 400, { error: 'quantity debe ser un número >= 0' });
      item.quantity = quantity;
      return sendJson(response, 200, item);
    } catch (error) { return sendJson(response, error.statusCode || 500, { error: error.message }); }
  }
  return notFound(response);
});

server.listen(port, () => console.log(`warehouse listening on :${port}`));
