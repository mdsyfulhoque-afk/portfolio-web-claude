// Optional authoring tool: renders tools/og-card.html to assets/media/og.jpg (1200×630) with headless Chrome.
// Zero dependencies (Node ≥ 22 for the global WebSocket). Run `npm run build` first so dist/assets exists.
// Usage: node tools/capture-og.mjs   (set CHROME_PATH if Chrome/Chromium/Edge is not found)
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
if (!existsSync(join(dist, 'assets', 'site.css'))) { console.error('Run `npm run build` first.'); process.exit(1); }

const candidates = [process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
const chromePath = candidates.find(p => existsSync(p));
if (!chromePath) { console.error('No Chrome/Chromium found. Set CHROME_PATH.'); process.exit(1); }

const MIME = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.js': 'text/javascript' };
const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = url === '/' ? join(root, 'tools', 'og-card.html') : join(dist, url);
  if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const site = `http://127.0.0.1:${server.address().port}/`;

const port = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'og-'))}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let targets = [];
for (let i = 0; i < 50 && !targets.length; i++) { try { targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).filter(t => t.type === 'page'); } catch { await sleep(200); } }
const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id) pending.get(m.id)?.(m); });
const send = (method, params = {}) => new Promise(r => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
await send('Page.navigate', { url: site });
await sleep(800);
await send('Runtime.evaluate', { expression: 'Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(() => {}))])', awaitPromise: true });
const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
const out = join(root, 'assets', 'media', 'og.jpg');
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(`✓ ${out}`);
ws.close(); chrome.kill(); server.close();
process.exit(0);
