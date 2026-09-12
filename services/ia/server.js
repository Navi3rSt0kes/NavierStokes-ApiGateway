const http = require('node:http');
const { sendJson, readJson, requestUrl, notFound } = require('../../lib/http');

const port = Number(process.env.IA_PORT || 3003);

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  const { pathname } = requestUrl(request);
  if (pathname === '/health') return sendJson(response, 200, { status: 'ok', service: 'ia' });
  if (pathname === '/generate' && request.method === 'POST') {
    try {
      const { prompt } = await readJson(request);
      if (!prompt || typeof prompt !== 'string') return sendJson(response, 400, { error: 'prompt es obligatorio' });
      return sendJson(response, 200, { response: `Respuesta simulada para: ${prompt}`, provider: 'local-mock' });
    } catch (error) { return sendJson(response, error.statusCode || 500, { error: error.message }); }
  }
  return notFound(response);
});

server.listen(port, () => console.log(`ia listening on :${port}`));
