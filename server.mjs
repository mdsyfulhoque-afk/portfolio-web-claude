// Local preview server: serves dist/ and mounts api/enquiry.js, mirroring the Vercel layout. No dependencies.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { handle as enquiry } from './api/enquiry.js';

const root = path.resolve('dist');
const port = +process.env.PORT || 4173;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8' };

async function api(req, res) {
  const chunks = []; for await (const c of req) chunks.push(c);
  const request = new Request(`http://127.0.0.1:${port}${req.url}`, { method: req.method, headers: req.headers, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
  const response = await enquiry(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname === '/api/enquiry') return await api(req, res);
    let p = path.resolve(root, '.' + decodeURIComponent(u.pathname));
    if (p !== root && !p.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    try { if ((await stat(p)).isDirectory()) p = path.join(p, 'index.html'); } catch { p = path.join(p, 'index.html'); }
    const body = await readFile(p);
    res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(path.join(root, '404.html')).catch(() => '<h1>Page not found</h1>'));
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
