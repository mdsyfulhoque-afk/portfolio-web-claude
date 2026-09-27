// Release gate for dist/. Zero dependencies. `node verify.mjs` (preview) or `node verify.mjs --release`.
// Fails on: broken routes/anchors/assets, page-structure faults, invalid JSON-LD, CSP drift, banned claims,
// FormulaBar refs with no ledger row, missing film structure, and (release only) photos without recorded consent.
import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const RELEASE = process.argv.includes('--release') || process.env.RELEASE === '1';
const root = path.resolve('dist');
const errors = [], warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

async function walk(dir) {
  const out = [];
  for (const d of await readdir(dir, { withFileTypes: true })) { const f = path.join(dir, d.name); if (d.isDirectory()) out.push(...await walk(f)); else out.push(f); }
  return out;
}
const exists = async p => { try { await stat(p); return true; } catch { return false; } };
const rel = f => path.relative(root, f).replaceAll('\\', '/');

const files = await walk(root);
const html = new Map(await Promise.all(files.filter(f => f.endsWith('.html')).map(async f => [f, await readFile(f, 'utf8')])));
const text = s => s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

// Claims the record does not support (MASTER-PROMPT §3.4 plus the base site's list).
const BANNED = [
  [/75\+\s*projects|30\+\s*global partners|1,200 firms/i, 'unsupported base-site statistic'],
  [/first[- ]of[- ]its[- ]kind|single-handedly|most chosen/i, 'unsupported superlative'],
  [/USD\s*1\.5\s*bn|sum of scope/i, 'summed scope figure'],
  [/World Bank standards?/i, '"World Bank standards" (no WB appraisal guideline is named in the record)'],
  [/\bUNDP\b|\bUNESCO\b/, 'UNDP/UNESCO engagement (IP3 profile only)'],
  [/\b(DPP|TAPP)\b/, 'DPP/TAPP authorship'],
  [/\bCGE\b|difference-in-differences|propensity score|\bGHG accounting|carbon shadow price/i, 'method the record never names'],
  [/\bPython\b/, 'named software the owner has not listed'],
  [/date of birth|\breferees?\b/i, 'CV personal data (DOB/referees)'],
  [/win rate|success rate of \d|\b\d+% (win|success)/i, 'win rate'],
  [/(?:\$|BDT|Tk\.?)\s?\d[\d,]*(?:\.\d+)?\s*(?:per|\/)\s*(?:day|hour|month|page)/i, 'price'],
  [/world[- ]class|award[- ]winning|cutting[- ]edge|passionate about|trusted by/i, 'marketing cliché'],
  [/\[(CONTENT|ASSET|EVIDENCE|PRICING) REQUIRED/, 'unresolved placeholder']
];

// Ledger addresses published on /evidence/ (FormulaBar refs must point at one; FIT!xx are computed grid cells).
const evidenceHtml = html.get(path.join(root, 'evidence', 'index.html')) || '';
const ledger = new Set(Array.from(evidenceHtml.matchAll(/<tr id="([A-E]\d+)"/g), m => m[1]));
if (ledger.size < 50) fail('evidence', `ledger has only ${ledger.size} rows`);

let links = 0, assets = 0, ldBlocks = 0, fxRefs = 0;
const inlineScripts = new Set();
for (const [file, src] of html) {
  const where = rel(file);
  const isRedirect = /http-equiv="refresh"/.test(src);
  if (isRedirect) {
    const to = src.match(/url=([^"]+)"/)?.[1];
    if (!to || !(await exists(path.join(root, to, 'index.html')))) fail(where, `redirect target missing: ${to}`);
    continue;
  }
  if ((src.match(/<h1[\s>]/g) || []).length !== 1) fail(where, 'must have exactly one <h1>');
  if (!src.includes('<main id="main">')) fail(where, 'main landmark missing');
  if (!/<title>[^<]{3,}<\/title>/.test(src)) fail(where, 'title missing');
  if (!/<meta name="description" content="[^"]{20,}"/.test(src)) fail(where, 'description missing or too short');
  if (!/<link rel="canonical" href="[^"]+"/.test(src)) fail(where, 'canonical missing');
  if (!/<html lang="en"/.test(src)) fail(where, 'html lang missing');

  const ids = Array.from(src.matchAll(/\bid="([^"]+)"/g), m => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail(where, `duplicate ids: ${[...new Set(dup)].join(', ')}`);

  const words = text(src);
  for (const [re, label] of BANNED) { const m = words.match(re); if (m) fail(where, `banned claim — ${label}: "${m[0]}"`); }

  // Inline scripts: only the hashed pre-paint script and JSON-LD are allowed by the CSP.
  for (const m of src.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json/.test(m[1])) {
      ldBlocks++;
      try { const o = JSON.parse(m[2]); if (!o['@context'] || !o['@type']) fail(where, 'JSON-LD without @context/@type'); } catch (e) { fail(where, `JSON-LD does not parse: ${e.message}`); }
    } else inlineScripts.add(m[2]);
  }

  for (const m of src.matchAll(/data-fx="([^"]+)"/g)) {
    fxRefs++;
    if (!m[1].startsWith('FIT!') && !ledger.has(m[1])) fail(where, `FormulaBar ref ${m[1]} has no ledger row`);
  }

  const refs = [...Array.from(src.matchAll(/\b(href|src|data-src)="([^"]+)"/g), m => [m[1], m[2]]),
    ...Array.from(src.matchAll(/\bsrcset="([^"]+)"/g)).flatMap(m => m[1].split(',').map(s => ['srcset', s.trim().split(/\s+/)[0]]))];
  for (const [attr, raw] of refs) {
    const url = raw.replaceAll('&amp;', '&');
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    const u = new URL(url, 'https://local.test/');
    if (u.pathname.startsWith('/api/')) { if (!(await exists(path.join('api', u.pathname.slice(5) + '.js')))) fail(where, `API route missing: ${url}`); continue; }
    let dest = path.join(root, decodeURIComponent(u.pathname));
    try { if ((await stat(dest)).isDirectory()) dest = path.join(dest, 'index.html'); } catch { /* checked below */ }
    if (!(await exists(dest))) { fail(where, `unresolved ${attr} ${url}`); continue; }
    attr === 'href' ? links++ : assets++;
    if (u.hash && dest.endsWith('.html')) { const body = html.get(dest) || ''; if (!body.includes(`id="${u.hash.slice(1)}"`)) fail(where, `missing anchor ${url}`); }
  }
}

// CSP: the only inline script must match the hash shipped in vercel.json and _headers.
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
const csp = vercel.headers.find(h => h.source === '/(.*)')?.headers.find(h => h.key === 'Content-Security-Policy')?.value || '';
for (const s of inlineScripts) {
  const h = `'sha256-${createHash('sha256').update(s).digest('base64')}'`;
  if (!csp.includes(h)) fail('CSP', `inline script not covered by the CSP hash (${s.slice(0, 40)}…)`);
}
if (inlineScripts.size !== 1) fail('CSP', `expected exactly one inline (pre-paint) script, found ${inlineScripts.size}`);
const headersFile = await readFile(path.join(root, '_headers'), 'utf8');
if (!headersFile.includes(csp)) fail('CSP', '_headers and vercel.json disagree');
if (vercel.outputDirectory !== 'dist') fail('vercel.json', 'outputDirectory must be dist');
if (/\/assets\/\(\.\*\)[\s\S]*immutable/.test(JSON.stringify(vercel))) fail('vercel.json', 'blanket immutable cache on /assets');
const redirects = (await readFile(path.join(root, '_redirects'), 'utf8')).trim().split('\n').length;
if (redirects !== vercel.redirects.length) fail('redirects', '_redirects and vercel.json disagree');

// CSS url() references and JS module imports resolve.
const css = await readFile(path.join(root, 'assets', 'site.css'), 'utf8');
for (const m of css.matchAll(/url\(['"]?(\/[^)'" ]+)/g)) if (!(await exists(path.join(root, m[1])))) fail('CSS', `missing ${m[1]}`);
for (const f of files.filter(f => f.endsWith('.js') && f.includes(`${path.sep}js${path.sep}`))) {
  const js = await readFile(f, 'utf8');
  for (const m of js.matchAll(/(?:import\s*\(|from\s*)['"](\.[^'"]+)['"]/g)) if (!(await exists(path.join(path.dirname(f), m[1])))) fail(rel(f), `import ${m[1]} missing`);
}

// The film: seven beats, a rail, a static stack by default, and a reduced-motion path.
const home = html.get(path.join(root, 'index.html'));
const beats = Array.from(home.matchAll(/data-beat="(\d)"/g), m => +m[1]);
if (beats.join() !== '1,2,3,4,5,6,7') fail('film', `expected beats 1–7, found ${beats.join()}`);
if ((home.match(/data-beat-jump=/g) || []).length !== 7) fail('film', 'rail must have 7 jump targets');
if (/class="[^"]*film-pin/.test(home)) fail('film', 'film must not be pinned in the static HTML');
if (!css.includes('prefers-reduced-motion')) fail('CSS', 'reduced-motion rules missing');
if (!css.includes('[data-motion=static]') && !css.includes('[data-motion="static"]')) fail('CSS', 'static motion tier missing');
if (!/ILLUSTRATIVE STRUCTURE/i.test(home)) fail('film', 'the cash-flow sheet must be labelled illustrative');

// Consent: every photo whose owner consent is not recorded blocks a release build.
const photos = JSON.parse(await readFile('content/photos.json', 'utf8'));
const list = Array.isArray(photos) ? photos : photos.photos;
const allHtml = [...html.values()].join('\n');
for (const p of list) {
  if (p.consent === 'clear') continue;
  if (!allHtml.includes(`/assets/media/${p.slug}-`)) continue;
  const msg = `photo "${p.slug}" is on the site without recorded consent (${p.consent || 'unknown'})`;
  if (p.consent === 'avoid' || p.risk === 'high' || RELEASE) fail('consent', msg); else warnings.push(msg);
}
if (RELEASE && /class="preview-build"/.test(home)) fail('release', 'dist was built as a preview; run npm run build:release');
if (RELEASE && /<link rel="canonical" href="https:\/\/[^"]*\.example\//.test(home)) fail('release', 'canonical origin is the placeholder; set SITE_ORIGIN');

// Sitemap covers every page; the OG image exists.
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
const pages = [...html.keys()].filter(f => !/http-equiv="refresh"/.test(html.get(f)) && !f.endsWith(`${path.sep}404.html`) && !f.includes(`${path.sep}404${path.sep}`));
for (const f of pages) { const route = '/' + rel(f).replace(/index\.html$/, ''); if (!sitemap.includes(`${route}</loc>`)) fail('sitemap', `missing ${route}`); }
if (!(await exists(path.join(root, 'assets', 'media', 'og.jpg')))) fail('og', 'assets/media/og.jpg missing');

// Budgets.
const size = async f => (await stat(f)).size;
const homeBytes = Buffer.byteLength(home);
const jsBytes = (await Promise.all(files.filter(f => f.endsWith('.js') && !f.includes('vendor')).map(size))).reduce((a, b) => a + b, 0);
const media = await Promise.all(files.filter(f => /\.(webp|avif|jpg|png)$/.test(f)).map(async f => [rel(f), await size(f)]));
const heavy = media.filter(([, b]) => b > 400_000);
if (homeBytes > 220_000) fail('budget', `home HTML ${homeBytes} B > 220 kB`);
if (jsBytes > 90_000) fail('budget', `own JS ${jsBytes} B > 90 kB`);
for (const [f, b] of heavy) fail('budget', `${f} is ${b} B > 400 kB`);
const total = (await Promise.all(files.map(size))).reduce((a, b) => a + b, 0);

for (const w of warnings) console.warn(`! ${w}`);
if (errors.length) { console.error(errors.map(e => `✗ ${e}`).join('\n')); console.error(`\n${errors.length} problem(s).`); process.exit(1); }
console.log(JSON.stringify({
  passed: true, mode: RELEASE ? 'release' : 'preview', pages: html.size, internal_links: links, asset_references: assets,
  json_ld_blocks: ldBlocks, formula_refs: fxRefs, ledger_rows: ledger.size, home_html_bytes: homeBytes, own_js_bytes: jsBytes,
  total_public_bytes: total, consent_warnings: warnings.length
}, null, 2));
