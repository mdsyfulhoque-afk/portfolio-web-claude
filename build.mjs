// Syful Hoque — static site generator. Zero npm dependencies: Node built-ins only.
//   node build.mjs            preview build (consent-pending photos allowed, badge shown)
//   node build.mjs --release  production build (fails if a consent-pending photo is used)
import { readFile, writeFile, mkdir, copyFile, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { origin, RELEASE, families, cases, guides, pendingUsed, photos } from './build/data.mjs';
import { shell, PREPAINT_HASH } from './build/layout.mjs';
import { home } from './build/pages/home.mjs';
import { servicesIndex, familyPage } from './build/pages/services.mjs';
import { workIndex, casePage, mapSvgFile } from './build/pages/work.mjs';
import { evidencePage, aboutPage, contactPage, proposaldeskPage, insightsIndex, guidePage, privacyPage, notFoundPage, REDIRECTS, redirectPage } from './build/pages/other.mjs';

const OUT = 'dist';
await rm(OUT, { recursive: true, force: true });
await mkdir(`${OUT}/assets/js`, { recursive: true });

// ---------- Pages ----------
const pages = [home(), servicesIndex(), ...families.map(familyPage), workIndex(), ...cases.map(casePage), evidencePage(), aboutPage(), contactPage(), proposaldeskPage(), insightsIndex(), ...guides.map(guidePage), privacyPage()];
const routes = [];
for (const p of pages) {
  const file = p.route === '/' ? `${OUT}/index.html` : `${OUT}${p.route}index.html`;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, shell(p));
  routes.push(p.route);
}
const nf = notFoundPage();
await writeFile(`${OUT}/404.html`, shell(nf));
for (const [from, to] of REDIRECTS) {
  if (from.endsWith('/')) { await mkdir(`${OUT}${from}`, { recursive: true }); await writeFile(`${OUT}${from}index.html`, redirectPage(to)); }
}

// ---------- Consent gate ----------
const pending = [...pendingUsed];
if (pending.length) {
  const msg = `Consent pending for ${pending.length} photo(s) used on the site: ${pending.join(', ')}. Record owner consent in content/photos.json ("consent": "clear") before release.`;
  if (RELEASE) { console.error('✗ ' + msg); process.exit(1); } else console.warn('! ' + msg);
}

// ---------- Assets ----------
async function copyDir(src, dst) {
  await mkdir(dst, { recursive: true });
  for (const f of await readdir(src)) {
    const s = path.join(src, f), d = path.join(dst, f);
    if ((await stat(s)).isDirectory()) await copyDir(s, d); else await copyFile(s, d);
  }
}
await copyDir('assets/fonts', `${OUT}/assets/fonts`);
await copyDir('assets/vendor', `${OUT}/assets/vendor`);
// Media: only files for photos in the catalogue (the pending ones are excluded from release builds by the gate above).
await mkdir(`${OUT}/assets/media`, { recursive: true });
for (const f of await readdir('assets/media')) await copyFile(`assets/media/${f}`, `${OUT}/assets/media/${f}`);
for (const f of await readdir('src/js')) await copyFile(`src/js/${f}`, `${OUT}/assets/js/${f}`);

// CSS: concatenate in order and strip comments/whitespace (no minifier dependency).
const cssFiles = (await readdir('src/css')).filter(f => f.endsWith('.css')).sort();
let css = '';
for (const f of cssFiles) css += `\n/* ${f} */\n` + await readFile(`src/css/${f}`, 'utf8');
const min = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n').replace(/\n+/g, '\n').trim();
await writeFile(`${OUT}/assets/site.css`, min);

await writeFile(`${OUT}/assets/favicon.svg`, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0e1210"/><rect x="10" y="10" width="44" height="44" fill="none" stroke="#1d3fd0" stroke-width="4"/><rect x="48" y="48" width="9" height="9" fill="#1d3fd0" stroke="#f4f5f1" stroke-width="2"/><circle cx="22" cy="22" r="5" fill="#c8321f"/></svg>');
await writeFile(`${OUT}/assets/map-scope.svg`, mapSvgFile());

// ---------- SEO & host files ----------
const today = new Date().toISOString().slice(0, 10);
await writeFile(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r => `<url><loc>${origin}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
await writeFile(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(`${OUT}/llms.txt`, `# Mohammad Syful Hoque — development economist, Dhaka\n\n> Costing, cost-benefit and financing analysis, feasibility studies, surveys and evaluation, and policy research for Bangladesh and international clients. Every figure on the site has an address and a source in the Evidence Ledger.\n\n## Services\n${families.map(f => `- [${f.title}](${origin}/services/${f.slug}/): ${f.definition}`).join('\n')}\n\n## Record\n- [Work board — 37 documented assignments](${origin}/work/)\n- [Evidence ledger](${origin}/evidence/)\n${cases.map(c => `- [${c.short}](${origin}/work/${c.id}/): ${c.summary}`).join('\n')}\n`);

// Security headers — one definition, emitted for Vercel (vercel.json) and Netlify/Cloudflare (_headers).
const CSP = `default-src 'self'; script-src 'self' ${PREPAINT_HASH} https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests`;
const HEADERS = [
  ['Content-Security-Policy', CSP], ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains'],
  ['X-Content-Type-Options', 'nosniff'], ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Cross-Origin-Opener-Policy', 'same-origin'], ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()']
];
// Only fonts and the vendored library are safe to mark immutable; CSS/JS/media keep stable names, so they revalidate.
const CACHE = [
  ['/assets/fonts/', 'public, max-age=31536000, immutable'], ['/assets/vendor/', 'public, max-age=31536000, immutable'],
  ['/assets/media/', 'public, max-age=2592000, stale-while-revalidate=86400'],
  ['/assets/js/', 'public, max-age=0, must-revalidate'], ['/assets/site.css', 'public, max-age=0, must-revalidate']
];
await writeFile(`${OUT}/_headers`, `/*\n${HEADERS.map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n` + CACHE.map(([p, v]) => `${p.endsWith('/') ? p + '*' : p}\n  Cache-Control: ${v}\n`).join(''));
await writeFile(`${OUT}/_redirects`, REDIRECTS.map(([f, t]) => `${f} ${t} 301`).join('\n') + '\n');
const vercel = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  buildCommand: 'npm run build', outputDirectory: 'dist', cleanUrls: true, trailingSlash: true,
  redirects: REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true })),
  // trailingSlash redirects /api/enquiry → /api/enquiry/; route that back to the function.
  rewrites: [{ source: '/api/enquiry/', destination: '/api/enquiry' }],
  headers: [
    { source: '/(.*)', headers: HEADERS.map(([key, value]) => ({ key, value })) },
    ...CACHE.map(([p, value]) => ({ source: p.endsWith('/') ? `${p}(.*)` : p, headers: [{ key: 'Cache-Control', value }] }))
  ]
};
await writeFile('vercel.json', JSON.stringify(vercel, null, 2) + '\n');

console.log(`✓ Built ${routes.length} routes + 404 + ${REDIRECTS.filter(([f]) => f.endsWith('/')).length} redirect pages → ${OUT}/  (${RELEASE ? 'release' : 'preview'} build, origin ${origin})`);
