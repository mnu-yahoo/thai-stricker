const http = require('http');

const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 8081;
const PROXY_HOST = '0.0.0.0';
const PROXY_PORT = 8082;
const EMULATOR_HOST = '10.0.2.2';

function rewriteContent(body) {
  return body
    .replaceAll(`http://${TARGET_HOST}:${TARGET_PORT}`, `http://${EMULATOR_HOST}:${PROXY_PORT}`)
    .replaceAll(`http://[::1]:${TARGET_PORT}`, `http://${EMULATOR_HOST}:${PROXY_PORT}`)
    .replaceAll(`"${TARGET_HOST}:${TARGET_PORT}"`, `"${EMULATOR_HOST}:${PROXY_PORT}"`)
    .replaceAll(`"[::1]:${TARGET_PORT}"`, `"${EMULATOR_HOST}:${PROXY_PORT}"`);
}

const server = http.createServer((req, res) => {
  const upstream = http.request(
    {
      host: TARGET_HOST,
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${TARGET_HOST}:${TARGET_PORT}`,
      },
    },
    (upstreamRes) => {
      const contentType = upstreamRes.headers['content-type'] || '';
      const shouldRewrite =
        contentType.includes('application/json') ||
        contentType.includes('application/expo+json') ||
        contentType.includes('text/plain') ||
        contentType.includes('application/javascript');

      if (!shouldRewrite) {
        res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
        upstreamRes.pipe(res);
        return;
      }

      const chunks = [];
      upstreamRes.on('data', (chunk) => chunks.push(chunk));
      upstreamRes.on('end', () => {
        const rewritten = rewriteContent(Buffer.concat(chunks).toString('utf8'));
        const headers = { ...upstreamRes.headers, 'content-length': Buffer.byteLength(rewritten) };
        res.writeHead(upstreamRes.statusCode || 502, headers);
        res.end(rewritten);
      });
    },
  );

  upstream.on('error', (error) => {
    res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`Proxy error: ${error.message}`);
  });

  req.pipe(upstream);
});

server.listen(PROXY_PORT, PROXY_HOST, () => {
  console.log(`Expo emulator proxy listening on http://${PROXY_HOST}:${PROXY_PORT}`);
});
