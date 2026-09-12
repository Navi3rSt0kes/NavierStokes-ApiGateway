const { URL } = require('node:url');

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let raw = '';
  for await (const chunk of request) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('El cuerpo debe ser JSON válido');
    error.statusCode = 400;
    throw error;
  }
}

function requestUrl(request) {
  return new URL(request.url, `http://${request.headers.host || 'localhost'}`);
}

function notFound(response) {
  sendJson(response, 404, { error: 'Ruta no encontrada' });
}

module.exports = { sendJson, readJson, requestUrl, notFound };
