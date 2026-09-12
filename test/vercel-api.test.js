const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const handler = require('../api');

let server;
let baseUrl;
test.before(async () => { server = http.createServer(handler); await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve)); baseUrl = `http://127.0.0.1:${server.address().port}`; });
test.after(() => new Promise((resolve) => server.close(resolve)));
async function request(path, options) { const response = await fetch(`${baseUrl}${path}`, options); return { status: response.status, body: response.status === 204 ? null : await response.json() }; }

test('health no divulga credenciales cuando la base no está configurada', async () => {
  const result = await request('/health');
  assert.ok([200, 503].includes(result.status));
  assert.equal(typeof result.body.status, 'string');
  assert.equal(JSON.stringify(result.body).includes('mongodb+srv'), false);
});

test('buyer consulta catálogo y obtiene recomendaciones reales', { skip: !process.env.MONGODB_URI }, async () => {
  const login = await request('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'buyer@markecia.demo', password: process.env.DEMO_BUYER_PASSWORD }) });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.role, 'BUYER');
  const catalog = await request('/api/products?category=frutas');
  assert.equal(catalog.status, 200);
  assert.ok(catalog.body.products.length > 0);
  const agent = await request('/api/agent/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'necesito frutas para una ensalada' }) });
  assert.equal(agent.status, 200);
  assert.ok(Array.isArray(agent.body.recommendations));
});
