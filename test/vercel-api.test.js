const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const handler = require('../api');

let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}

test('expone salud y operaciones del gateway en una función serverless', async () => {
  assert.deepEqual(await request('/health'), { status: 200, body: { status: 'ok', service: 'gateway' } });
  const user = await request('/api/users/users', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Ana', email: 'ana@example.com' }) });
  assert.equal(user.status, 201);
  assert.equal((await request(`/api/users/users/${user.body.id}`)).body.email, 'ana@example.com');
  const item = await request('/api/warehouse/items', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Teclado', quantity: 5 }) });
  assert.equal(item.status, 201);
  assert.equal((await request(`/api/warehouse/items/${item.body.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quantity: 4 }) })).body.quantity, 4);
  assert.equal((await request('/api/ia/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'Resume inventario' }) })).body.provider, 'local-mock');
});
