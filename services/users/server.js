const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { sendJson, readJson, requestUrl, notFound } = require('../../lib/http');

const users = [];
const port = Number(process.env.USERS_PORT || 3001);

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  const { pathname } = requestUrl(request);
  if (pathname === '/health') return sendJson(response, 200, { status: 'ok', service: 'users' });
  if (pathname === '/users' && request.method === 'GET') return sendJson(response, 200, users);
  if (pathname === '/users' && request.method === 'POST') {
    try {
      const { name, email } = await readJson(request);
      if (!name || !email) return sendJson(response, 400, { error: 'name y email son obligatorios' });
      const user = { id: randomUUID(), name, email };
      users.push(user);
      return sendJson(response, 201, user);
    } catch (error) { return sendJson(response, error.statusCode || 500, { error: error.message }); }
  }
  const id = pathname.match(/^\/users\/([^/]+)$/)?.[1];
  if (id && request.method === 'GET') {
    const user = users.find((item) => item.id === id);
    return user ? sendJson(response, 200, user) : sendJson(response, 404, { error: 'Usuario no encontrado' });
  }
  return notFound(response);
});

server.listen(port, () => console.log(`users listening on :${port}`));
