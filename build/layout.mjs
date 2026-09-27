// Page shell: head (meta, pre-paint script, JSON-LD), chrome (header + FormulaBar), footer.
import { createHash } from 'node:crypto';
import { e, arr, json } from './html.mjs';
import { origin, person, site, families, RELEASE } from './data.mjs';

// Runs before first paint: theme + motion tier. Plain JS (never transpiled); hashed into the CSP.
export const PREPAINT = "(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t)}catch(x){}var rm=matchMedia('(prefers-reduced-motion: reduce)').matches,c=navigator.connection,lite=!!(c&&(c.saveData||/2g/.test(c.effectiveType||''))),weak=(navigator.deviceMemory||8)<4||!matchMedia('(pointer:fine)').matches;d.setAttribute('data-motion',rm?'static':lite?'lite':weak?'dom':'webgl')})();";
export const PREPAINT_HASH = `'sha256-${createHash('sha256').update(PREPAINT).digest('base64')}'`;

const NAV = [['/services/', 'Services'], ['/work/', 'Work'], ['/evidence/', 'Evidence'], ['/insights/', 'Insights'], ['/about/', 'About']];
const F = site.formula;
const DEFAULT_FX = `=${F.join(' × ')}`;

export function shell({ route, title, description, body, jsonld = [], film = false, bodyClass = '', ogImage = '/assets/media/og.jpg' }) {
  const full = route === '/' ? `${title}` : `${title} — Syful Hoque`;
  const ld = jsonld.map(o => `<script type="application/ld+json">${json({ '@context': 'https://schema.org', ...o })}</script>`).join('');
  return `<!doctype html>
<html lang="en"${RELEASE ? '' : ' class="preview-build"'}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${e(full)}</title>
<meta name="description" content="${e(description)}">
<link rel="canonical" href="${origin}${route}">
<meta property="og:type" content="website"><meta property="og:title" content="${e(full)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${origin}${route}"><meta property="og:image" content="${origin}${ogImage}"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f4f5f1" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#0b0f0d" media="(prefers-color-scheme: dark)">
<script>${PREPAINT}</script>
<link rel="preload" href="/assets/fonts/anek-latin-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/newsreader-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
${film ? '<script defer src="/assets/vendor/gsap.min.js"></script><script defer src="/assets/vendor/ScrollTrigger.min.js"></script>' : ''}
<script type="module" src="/assets/js/site.js"></script>
${ld}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip-link" href="#main">Skip to content</a>
<div class="sheet-rules" aria-hidden="true"><div class="wrap"><div>${'<i></i>'.repeat(12)}</div></div></div>
<div class="chrome" id="chrome">
<div class="header-bar"><header class="header wrap">
<a class="brand" href="/" aria-label="Syful Hoque — home"><span class="brand-name">Syful Hoque</span><span class="brand-role">Development economist · Dhaka</span></a>
<nav class="nav" aria-label="Main">${NAV.map(([u, l]) => `<a href="${u}"${route.startsWith(u) ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
<button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch colour theme"><i aria-hidden="true"></i><span>Theme</span></button>
<a class="btn btn--primary" href="/contact/" data-door-cta>Check availability ${arr}</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav">Menu</button>
</header></div>
<nav id="mobile-nav" class="mobile-nav wrap" aria-label="Mobile" hidden>${NAV.map(([u, l]) => `<a href="${u}">${l}</a>`).join('')}<a href="/contact/">Start a brief</a><p style="margin-top:16px"><button class="theme-toggle" type="button" data-theme-toggle><i aria-hidden="true"></i><span>Theme</span></button></p></nav>
<div class="fx-bar"><div class="fx wrap" data-fx-bar>
<span class="fx__ref" data-fx-ref>A1</span><span class="fx__fn" aria-hidden="true">fx</span>
<span class="fx__formula"><span data-fx-formula>${e(DEFAULT_FX)}</span></span>
<span class="fx__status"><span class="tag tag--verified" data-fx-status>Method</span></span>
<span class="visually-hidden" role="status" aria-live="polite" data-fx-live></span>
</div></div>
</div>
<main id="main">
${body}
</main>
<footer class="footer">
<div class="wrap">
<div class="footer-grid">
<p class="footer-mark">Syful Hoque<span>${e(site.method)}</span></p>
<div class="footer-col"><h2>Services</h2>${families.map(f => `<a href="/services/${f.slug}/">${e(f.short)}</a>`).join('')}</div>
<div class="footer-col"><h2>Record</h2><a href="/work/">Work board</a><a href="/evidence/">Evidence ledger</a><a href="/insights/">Method guides</a><a href="/about/">About</a><a href="/proposaldesk/">ProposalDesk</a></div>
<div class="footer-col"><h2>Contact</h2><a href="/contact/">Start a brief</a><a href="mailto:${e(person.email)}">Email</a><p class="mono muted" style="font-size:11px;margin-top:8px">Dhaka, Bangladesh<br>Working in Bangladesh and internationally</p></div>
</div>
<div class="footer-base"><span>© ${new Date().getFullYear()} Mohammad Syful Hoque</span><span>${e(F.join(' × '))}</span><span>Institutional names describe assignment relationships, not endorsements.</span><a href="/privacy/">Privacy</a></div>
</div>
</footer>
</body>
</html>`;
}

export const personLd = () => ({
  '@type': 'Person', name: person.name, alternateName: person.shortName, url: origin + '/', image: origin + '/assets/media/portrait-960.webp',
  jobTitle: ['Development Economist', 'Costing and Financing Expert'],
  description: 'Economist specialising in costing, cost-benefit and financing analysis, feasibility studies, surveys and evaluation, and policy research, for Bangladesh and international clients.',
  homeLocation: { '@type': 'Place', name: 'Dhaka, Bangladesh' }, knowsLanguage: ['English', 'Bengali'],
  alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'University of Surrey' }, { '@type': 'CollegeOrUniversity', name: 'University of Dhaka' }],
  knowsAbout: ['Cost-benefit analysis', 'Economic and financial analysis', 'Feasibility studies', 'Programme costing and financing', 'Impact evaluation', 'Policy research', 'Results frameworks']
});
export const crumbLd = trail => ({ '@type': 'BreadcrumbList', itemListElement: trail.map(([href, name], i) => ({ '@type': 'ListItem', position: i + 1, name, item: origin + href })) });
