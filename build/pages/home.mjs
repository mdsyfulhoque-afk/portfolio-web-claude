// Home: the light table → the film "Show your working" → promise → doors → services → matrix → proof → close.
import { e, arr, pad } from '../html.mjs';
import { site, families, allAssignments, caseById, guides, person, fx, origin } from '../data.mjs';
import { print, fxAttr, packs, doors, matrix, plate } from '../components.mjs';
import { personLd } from '../layout.mjs';

// ---------- Hero: the light table ----------
// x/y/w in % of the print field; m* = phone layout; desk = hidden below 960px.
const TABLE = [
  { s: 'portrait', x: 27, y: 5, w: 35, r: -1.2, z: 6, lead: true, mx: 25, my: 6, mw: 52 },
  { s: 'fsi-nameplate', x: 0, y: 1, w: 30, r: -3.2, z: 3, mx: -6, my: 2, mw: 38 },
  { s: 'adb-conference-2014', x: 64, y: 0, w: 29, r: 2.6, z: 2, mx: 70, my: 4, mw: 38 },
  { s: 'gis-workshop-2013', x: 1, y: 37, w: 27, r: 1.6, z: 4, mx: -4, my: 60, mw: 42 },
  { s: 'field-enumerator', x: 61, y: 35, w: 33, r: -2.1, z: 5, mx: 58, my: 58, mw: 46 },
  { s: 'fsi-lecture-2013', x: 30, y: 62, w: 25, r: 2.2, z: 5, desk: true },
  { s: 'rmg-floor', x: 57, y: 70, w: 29, r: -1.1, z: 3, desk: true },
  { s: 'tech-adoption-slide', x: -3, y: 68, w: 28, r: -2.6, z: 2, desk: true },
  { s: 'findings-2024', x: 86, y: 52, w: 26, r: 3.1, z: 1, desk: true },
  { s: 'field-capi', x: 91, y: 10, w: 22, r: -3.4, z: 1, desk: true }
];

function hero() {
  const prints = TABLE.map((t, i) => print(t.s, {
    cls: [t.lead && 'print--lead', t.desk && 'print--desk-only'].filter(Boolean).join(' '),
    developed: !!t.lead, eager: i < 5, lazyColor: !t.lead,
    sizes: t.lead ? '(max-width: 959px) 52vw, 24vw' : '(max-width: 959px) 40vw, 18vw',
    style: `--x:${t.x}%;--y:${t.y}%;--w:${t.w}%;--r:${t.r}deg;--z:${t.z};--i:${i}${t.mx !== undefined ? `;--mx:${t.mx}%;--my:${t.my}%;--mw:${t.mw}%` : ''}`
  })).join('');
  return `<header class="hero" id="top">
<div class="wrap"><div class="hero__ruler" aria-hidden="true">${'ABCDEFGHIJKL'.split('').map(c => `<span>${c}</span>`).join('')}</div></div>
<div class="wrap"><div class="hero__inner">
<div class="hero__text">
<p class="eyebrow"><b>FR 00</b><span>Dhaka · development economist · since 2008</span></p>
<h1 class="display-xl hero__title">The economics behind the <em class="hl">yes.</em></h1>
<p class="lede">${e(site.lede)}</p>
<ul class="hero__proof">${site.proof.map(p => `<li tabindex="0"${fxAttr(p.ref)}><b>${e(p.fig)}</b>${e(p.text)}</li>`).join('')}</ul>
<div class="actions"><a class="btn btn--primary" href="/contact/?intent=multilateral" data-door-cta>Check availability for a TOR ${arr}</a><a class="btn btn--quiet" href="/work/">See the work</a></div>
</div></div></div>
<div class="hero__prints" data-table>${prints}<div class="loupe" aria-hidden="true" data-loupe><span class="loupe__label" data-loupe-label></span></div></div>
<p class="hero__hint" aria-hidden="true">Move the loupe across the prints</p>
</header>`;
}

// ---------- The film ----------
const mark = (vb, inner) => `<svg class="print__mark" viewBox="${vb}" preserveAspectRatio="none" aria-hidden="true">${inner}</svg>`;

function beat(n, title, claim, src, link, visual, o = {}) {
  return `<article class="beat" data-beat="${n}" aria-labelledby="beat-${n}-t"${o.fxAddr ? fxAttr(o.fxAddr) : ''}${o.fxFormula ? ` data-fx-formula-override="${e(o.fxFormula)}"` : ''}>
<div class="beat__text">
<p class="beat__num"><b>${pad(n)}</b> / 07 · ${e(o.label)}</p>
<h3 class="beat__title" id="beat-${n}-t">${title}</h3>
<p class="beat__claim">${claim}</p>
<p class="beat__src">${src}</p>
${link ? `<a class="beat__link" href="${link[0]}">${e(link[1])} ${arr}</a>` : ''}
</div>
<div class="beat__visual">${visual}</div>
</article>`;
}

// Illustrative cash-flow structure for the Economics beat. NOT client data — labelled everywhere it appears.
const YEARS = 16;
const CF = Array.from({ length: YEARS }, (_, t) => {
  const capex = t === 0 ? -100 : t === 1 ? -60 : 0;
  const om = t >= 2 ? -4 : 0;
  const ben = t < 2 ? 0 : Math.min(32, 8 + (t - 2) * 6);
  return { t, capex, om, ben, net: capex + om + ben };
});
const npv = r => CF.reduce((s, c) => s + c.net / Math.pow(1 + r, c.t), 0);

function economicsVisual() {
  const maxAbs = Math.max(...CF.map(c => Math.abs(c.net)));
  const wide = t => t >= 8 ? ' wide' : '';
  const row = (label, key, cls) => `<span class="rh">${label}</span>` + CF.map(c => `<span class="${cls}${wide(c.t)}">${c[key] || '·'}</span>`).join('');
  return `<div class="sheetvis" data-sheet>
<div class="sheetvis__bg" style="background-image:url(/assets/media/rmg-floor-ink-960.webp)" aria-hidden="true"></div>
<div class="sheetvis__head"><span>MODEL SHEET · Y0–Y15</span><b>ILLUSTRATIVE STRUCTURE — NOT CLIENT DATA</b></div>
<div class="cf" role="img" aria-label="Illustrative cash-flow sheet over 16 years: capital cost in years 0 and 1, operating cost and rising benefits from year 2">
<span class="rh">Year</span>${CF.map(c => `<span class="ch${wide(c.t)}">Y${c.t}</span>`).join('')}
${row('Capex', 'capex', 'in')}${row('O&amp;M', 'om', 'in')}${row('Benefits', 'ben', 'in')}${row('Net', 'net', 'out')}
</div>
<div class="bars" aria-hidden="true"><span class="axis"><span>+</span><span>−</span></span>${CF.map(c => `<i class="${c.net < 0 ? 'neg' : ''}${wide(c.t)}" data-t="${c.t}" style="--v:${(Math.abs(c.net) / maxAbs / 2).toFixed(3)}"></i>`).join('')}</div>
<div class="sheetvis__foot"><span>r = <b data-rate>12%</b> real · illustrative</span><span>ENPV = Σ (Bₜ − Cₜ) / (1 + r)ᵗ = <b data-npv>${npv(0.12).toFixed(1)}</b></span></div>
</div>`;
}

function halftoneVisual() {
  // Final (static) state: 528 equal squares — 400 firms, 120 KIIs, 8 FGDs. The animated tier draws the same grid on canvas.
  const rects = Array.from({ length: 528 }, (_, n) => {
    const col = n % 33, row = Math.floor(n / 33);
    const fill = n < 400 ? 'var(--evidence)' : n < 520 ? 'var(--ink)' : 'var(--markup)';
    return `<rect x="${col * 10 + 1}" y="${row * 10 + 1}" width="8" height="8" fill="${fill}"/>`;
  }).join('');
  return `<div class="halftone" data-halftone${fxAttr('C22')}>
<canvas data-halftone-canvas aria-hidden="true"></canvas>
<svg class="halftone__static" viewBox="0 0 330 160" role="img" aria-label="Unit chart: 400 firms, 120 key informant interviews and 8 focus group discussions — 528 units">${rects}</svg>
<div class="stat"><div style="display:flex;gap:14px;align-items:baseline;flex-wrap:wrap"><span class="stat__fig" data-count>528</span><span class="stat__unit">units of primary evidence</span></div>
<div class="key"><span>400 firms</span><span class="k">120 KIIs</span><span class="f">8 FGDs</span></div>
<p class="stat__src">=SOURCE("Securing Green Transition of the Textile &amp; RMG Sector in Bangladesh", Embassy of Sweden &amp; CPD, 2022–23)</p></div>
</div>`;
}

function mapVisual() {
  return `<div class="map" data-map>
<img src="/assets/map-scope.svg" width="800" height="560" loading="lazy" alt="Map of the ten countries in the ADB early-warning technical assistance scope: Bangladesh, Cambodia, Kazakhstan, Kyrgyz Republic, Lao PDR, Maldives, Mongolia, Nepal, Tajikistan and Uzbekistan, with Dhaka marked">
<div class="map__cap"><span>ADB TA 10103-REG · 10 countries</span><span>Assignment scope — not presence</span></div>
</div>`;
}

function film() {
  const b1 = `<div class="strip-window"><div class="strip" data-strip>
${print('field-enumerator', { developed: true, sizes: '(max-width: 959px) 90vw, 30vw', mark: mark('0 0 100 75', `<ellipse class="mark-draw" cx="79" cy="50" rx="11" ry="8.5" pathLength="1" style="--len:1"/>`) + `<span class="print__note" style="left:52%;top:70%">the questionnaire, in the field</span>` })}
${print('field-capi', { developed: true, sizes: '(max-width: 959px) 45vw, 22vw' })}
${print('field-pilot', { developed: true, sizes: '(max-width: 959px) 45vw, 22vw' })}
${print('field-capi-2', { developed: true, sizes: '(max-width: 959px) 45vw, 22vw' })}
</div><span class="develop-line" aria-hidden="true"><span>developing</span></span></div>`;

  const b3 = `<div class="board">
${print('gis-workshop-2013', { developed: true, sizes: '(max-width: 959px) 90vw, 36vw', mark: mark('0 0 100 68', `<path class="mark-draw" d="M56 14.2 C 63 13.2, 71 14.6, 80 13.6" pathLength="1" style="--len:1"/>`) + `<span class="print__note" style="left:36%;top:25%">the workshop banner, Oct 2013</span>` })}
${print('fsi-lecture-2013', { developed: true, sizes: '(max-width: 959px) 45vw, 18vw' })}
${print('tech-adoption-slide', { developed: true, sizes: '(max-width: 959px) 45vw, 26vw' })}
</div>`;

  const b5 = `<div class="zoom" data-zoom>
<div class="zoom__layer zoom__layer--a" data-zoom-a><img src="/assets/media/adb-conference-2014-960.webp" width="960" height="720" loading="lazy" alt="" aria-hidden="true" style="--fx:55%;--fy:45%"></div>
<div class="zoom__layer zoom__layer--b" data-zoom-b><img src="/assets/media/fsi-nameplate-960.webp" width="960" height="540" loading="lazy" alt="Mohammad Syful Hoque on a panel beside a Bangladesh Bank official, name plates in front of them" style="--fx:38%;--fy:63%"></div>
<div class="nameplate" data-nameplate><span class="nameplate__dot" aria-hidden="true"></span><span class="nameplate__name">Mohammad Syful Hoque</span><span class="nameplate__role">Economist · costing &amp; financing · Dhaka</span></div>
<p class="zoom__cap"><span data-cap-b>FR 12 · Dhaka · FSI panel with Bangladesh Bank</span><span data-cap-a>FR 11 · 2014 · ADB conference, The Westin Dhaka</span></p>
</div>`;

  const b6 = `<div class="package">
<div class="docs" data-docs>
<div class="doc"><span class="file">.xlsx</span><span>Costing toolkits<small>ADB TA 10103-REG · developed</small></span></div>
<div class="doc"><span class="file">.xlsx</span><span>Cost-benefit analysis models<small>ADB TA 10103-REG · developed</small></span></div>
<div class="doc"><span class="file">.docx</span><span>Economic &amp; financial analysis chapters<small>ADB TA 10103-REG · in preparation</small></span></div>
<div class="doc"><span class="file">.docx</span><span>Results framework, 5-year operation<small>World Bank · Dhaka sanitation</small></span></div>
<div class="doc"><span class="file">.xlsx</span><span>10-year financial roadmap<small>BMDF · municipal infrastructure</small></span></div>
</div>
${mapVisual()}
</div>`;

  const top8 = ['fat-survey', 'rct-stitching-motors', 'tiga-bmgf', 'bicf-ifc', 'adb-ews-facility', 'nextgen-primary-gpe', 'bmdf-green-municipal', 'green-transition-rmg'].map(id => caseById[id]);
  const b7 = `<div class="dataset">${matrix(top8, { caption: 'Eight assignments by pillar; four demonstrate all four' })}
<div class="actions"><a class="btn btn--primary" href="/work/?view=list">Open all 37 records ${arr}</a><a class="btn btn--quiet" href="/evidence/">The evidence ledger</a></div></div>`;

  return `<section class="film" id="film" aria-labelledby="film-title">
<div class="wrap film__intro">
<p class="eyebrow"><b>THE FILM</b><span>Seven beats · real photographs · every figure sourced</span></p>
<h2 class="display-l" id="film-title">Show your working.</h2>
<p>How a question becomes a decision: from the field, to the data, to the model, to the table where it is decided — and the package that makes it work on Monday.<br><a class="film__skip link" href="#services">Skip the film → Services</a></p>
</div>
<div class="film__stage" data-film>
<div class="film__beats wrap">
${beat(1, 'Evidence starts in the field.', 'Survey design, fieldwork and trials: <strong>3 RCT-linked assignments</strong> — with the World Bank, Johns Hopkins and Columbia; HALOW+; and the Gates Foundation — and large firm and household surveys for the World Bank, IFC, ADB and CPD.', '=SOURCE(portfolio.json: rct-stitching-motors, halow, tiga-bmgf) · photographs: survey fieldwork, Bangladesh — assignment not captioned', ['/services/management-consulting-me/', 'Management consulting, M&E & evaluation'], b1, { label: 'Research', fxAddr: 'C16' })}
${beat(2, 'Then every dot is counted.', 'One study, <strong>528 units of primary evidence</strong>: 400 randomly selected firms, 120 key informant interviews and 8 focus groups on the barriers to a green transition in Bangladesh’s textile and garment industry.', '=SOURCE("Securing Green Transition of the Textile & RMG Sector", Embassy of Sweden & CPD, 2022–23) · C6 + C7 + C8', ['/work/green-transition-rmg/', 'Read the green-transition case'], halftoneVisual(), { label: 'Data stories', fxAddr: 'C22' })}
${beat(3, 'Technology is part of the method.', 'Presented “What are Financial Soundness Indicators?” at an ADB workshop on GIS-based land and real-estate price estimation · <strong>GIS-informed investment pipelines</strong> for municipalities (BMDF) · a technology-adoption survey across <strong>8 manufacturing sectors</strong> (World Bank) · feasibility of digital and AI-powered learning (ADB/GPE) · Bangladesh entries of the WTO–World Bank Services Trade Policy Database.', '=SOURCE(portfolio.json: bmdf-green-municipal, fat-survey, nextgen-primary-gpe, wto-services-trade) · banner: ADB training workshop, BRAC Inn Centre, Dhaka, 21–24 Oct 2013', ['/services/data-stories-technology/', 'Data stories & decision technology'], b3, { label: 'Technology', fxAddr: 'D9' })}
${beat(4, 'Then the model has to hold.', 'Sections of a <strong>Planning Commission-compliant feasibility report</strong> for a USD 44.108M TVET programme (ADB) · a <strong>15-year financial model</strong> for the Payra Seaport Authority · Team Leader on a feasibility study with USD 1,414M of capital investment in scope (Jolshiri). ENPV, EIRR, FNPV, FIRR, benefit-cost ratios, switching values, national shadow pricing.', '=SOURCE(portfolio.json: nsep-tvet, payra-port, jolshiri; CV) · the sheet opposite is an illustrative structure, not client data', ['/services/cost-benefit-analysis/', 'Cost-benefit & financial analysis'], economicsVisual(), { label: 'Economics', fxAddr: 'D1' })}
${beat(5, 'The decision is made at a table.', 'Presented economic, financial and implementation findings to ADB and Government counterparts (ADB education feasibility series) · focal point coordinating with the EC Delegation, the Prime Minister’s Office, ministries and the Planning Commission (EU LDC-graduation study, <strong>Deputy Team Leader</strong>) · advocacy from tobacco taxation (2008) to policy briefs recommending a carbon (green) tax (2022–23).', '=SOURCE(CV; portfolio.json: ec-ldc-graduation, tobacco-taxation, green-transition-rmg) · photographs: ADB conference, The Westin Dhaka, 3 Nov 2014', ['/services/policy-research-advocacy/', 'Policy research & advocacy'], b5, { label: 'Decision', fxAddr: 'B11' })}
${beat(6, 'And leave with something that works on Monday.', 'Costing toolkits and cost-benefit models developed; economic and financial chapters and financing structures in preparation — <strong>ADB TA 10103-REG, ten countries in scope</strong>, current to December 2026 · a results framework for a 5-year sanitation operation (World Bank) · a 10-year financial roadmap (BMDF).', '=SOURCE(portfolio.json: adb-ews-facility, dsip-dwasa, bmdf-green-municipal; CV) · map: Natural Earth, assignment scope only', ['/services/feasibility-studies/', 'Feasibility & project preparation'], b6, { label: 'Package', fxAddr: 'C5' })}
${beat(7, 'The record, as a dataset.', 'Economics × Data stories × Technology × Research across <strong>37 documented assignments</strong>. Four of them demonstrate all four at once.', '=SOURCE(EVIDENCE-LEDGER §3; portfolio.json) · pillars assessed from each assignment’s recorded methods', null, b7, { label: 'Board', fxAddr: 'C1' })}
</div>
<nav class="film__rail" aria-label="Film beats">${['Research', 'Data', 'Technology', 'Economics', 'Decision', 'Package', 'Board'].map((l, i) => `<button type="button" data-beat-jump="${i + 1}" aria-label="Beat ${i + 1}: ${l}"${i === 0 ? ' aria-current="step"' : ''}><span>${pad(i + 1)}</span><i></i></button>`).join('')}</nav>
<p class="film__readout" aria-hidden="true"><b data-readout>01</b> / 07</p>
</div>
</section>`;
}

// ---------- Promise band: the formula, and how often each pillar appears in the record ----------
function promise() {
  const counts = [0, 0, 0, 0];
  allAssignments.forEach(a => [...a.pillars].forEach((c, i) => { if (c === 'f') counts[i]++; }));
  const names = site.formula;
  return `<section class="promise" aria-labelledby="promise-t">
<div class="wrap promise__grid">
<p class="eyebrow"><b>ONE DIRECTION</b><span>The core strength</span></p>
<h2 class="promise__formula" id="promise-t">${names.map((n, i) => `<span>${e(n)}${i < 3 ? '<span class="x" aria-hidden="true">×</span>' : ''}</span>`).join(' ')}</h2>
<p class="promise__why">A decision needs all four at once: the field evidence, the model that prices it, the technology context it runs in, and a story someone can act on — from one accountable person. That is the difference between an analysis and a decision a ministry, a development bank or an investor can defend.</p>
<div class="promise__pillars" aria-label="Assignments that fully demonstrate each pillar, of 37">${names.map((n, i) => `<div><b>${counts[i]}<span style="font-size:13px;opacity:.7"> / 37</span></b><span>${e(n)} demonstrated</span></div>`).join('')}</div>
</div>
</section>`;
}

// Client type × service family: every square is one assignment from portfolio.json.
const CLIENT_TYPES = [['multilateral', 'Multilateral banks & agencies'], ['bilateral', 'Bilateral donors'], ['government', 'Government'], ['foundation', 'Foundations'], ['research', 'Research institutes'], ['private', 'Private sector']];
function fitGrid() {
  const cols = 'BCDEF';
  const fams = [...families].sort((a, b) => a.id.localeCompare(b.id));
  const hit = (ct, f) => allAssignments.filter(a => a.client === ct && (!f || a.families.includes(f)));
  const rows = CLIENT_TYPES.filter(([ct]) => hit(ct).length);
  const head = `<thead><tr><th scope="col" class="fit__corner"><span>Client ↓ · Service →</span></th>${fams.map((f, i) => `<th scope="col"><b>${cols[i]} · ${f.id}</b><a href="/services/${f.slug}/">${e(f.short)}</a></th>`).join('')}<th scope="col" class="fit__tot"><b>G</b>Assignments</th></tr></thead>`;
  const body = rows.map(([ct, label], r) => {
    const all = hit(ct);
    const cells = fams.map((f, i) => {
      const n = hit(ct, f.id).length;
      if (!n) return `<td class="fit__empty"><span aria-hidden="true">—</span><span class="visually-hidden">None</span></td>`;
      return `<td><a class="fit__cell" href="/work/?client=${ct}&amp;family=${f.id}" data-fx="FIT!${cols[i]}${r + 2}" data-fx-src="portfolio.json · client = ${ct} ∩ ${f.id}" data-fx-value="${n}" data-fx-claim="${e(label)} × ${e(f.short)}" aria-label="${n} ${n === 1 ? 'assignment' : 'assignments'}: ${e(label)}, ${e(f.short)}"><span class="fit__dots" aria-hidden="true">${'<i></i>'.repeat(n)}</span><b>${n}</b></a></td>`;
    }).join('');
    return `<tr><th scope="row"><a href="/work/?client=${ct}">${e(label)}</a></th>${cells}<td class="fit__tot" data-fx="FIT!G${r + 2}" data-fx-src="portfolio.json · client = ${ct}" data-fx-value="${all.length}" data-fx-claim="${e(label)}: documented assignments"><b>${all.length}</b></td></tr>`;
  }).join('');
  const colTot = fams.map((f, i) => { const n = allAssignments.filter(a => a.families.includes(f.id)).length; return `<td class="fit__tot" data-fx="FIT!${cols[i]}${rows.length + 2}" data-fx-src="portfolio.json · family ∋ ${f.id}" data-fx-value="${n}" data-fx-claim="${e(f.short)}: documented assignments"><b>${n}</b></td>`; }).join('');
  const foot = `<tfoot><tr><th scope="row">All clients</th>${colTot}<td class="fit__tot fit__grand" data-fx="FIT!G${rows.length + 2}" data-fx-src="portfolio.json projects + otherAssignments" data-fx-value="${allAssignments.length}" data-fx-claim="Documented assignments"><b>${allAssignments.length}</b></td></tr></tfoot>`;
  return `<div class="scroll-x"><table class="fit"><caption class="visually-hidden">Documented assignments by client type and service family. Counts; an assignment can belong to more than one family.</caption>${head}<tbody>${body}</tbody>${foot}</table></div>`;
}

export function home() {
  const plates = ['adb-ews-facility', 'nsep-tvet', 'jolshiri', 'green-transition-rmg', 'adb-fsi-reta', 'fat-survey'];
  const body = `${hero()}
${film()}
${promise()}
<section class="section wrap" aria-labelledby="doors-t">
<div class="section-head"><p class="eyebrow"><b>01</b><span>Where do you sit?</span></p><h2 class="display-l" id="doors-t">Five buyers. One next step each.</h2><p class="section-aside">Choose your door. The page remembers it and puts the most relevant proof first.</p></div>
${doors()}
</section>
<section class="section wrap" id="services" aria-labelledby="services-t">
<div class="section-head"><p class="eyebrow"><b>02</b><span>Services</span></p><h2 class="display-l" id="services-t">What you receive, and the standard it follows.</h2><p class="section-aside">Five service families for local and international policy research, advocacy and management consultancy — each shown as the package the client actually receives.</p></div>
${packs(families, { tabbed: true })}
</section>
<section class="section wrap" aria-labelledby="fit-t">
<div class="section-head"><p class="eyebrow"><b>03</b><span>Why it fits</span></p><h2 class="display-l" id="fit-t">Six kinds of client. Five kinds of work. One record.</h2><p class="section-aside">Each square is one documented assignment, placed by who commissioned it and what they received. An assignment can sit in more than one service family. Open any cell to see its records.</p></div>
${fitGrid()}
<p style="margin-top:20px"><a class="link" href="/work/?view=list">All 37 records in the list view ${arr}</a></p>
</section>
<section class="section wrap" aria-labelledby="proof-t">
<div class="section-head"><p class="eyebrow"><b>04</b><span>Proof</span></p><h2 class="display-l" id="proof-t">The work, as the advertisement.</h2><p class="section-aside">Six assignments, each with the decision at stake, the role, the method and a sourced figure. Scope figures are labelled as scope — never as outcomes.</p></div>
<div class="plates" data-plates>${plates.map(id => plate(id)).join('')}</div>
<div class="standards" style="margin-top:48px"><h3>Standards this work followed</h3><ul><li>ADB guidelines for economic and financial analysis</li><li>Planning Division / Planning Commission feasibility format</li><li>National shadow pricing parameters</li></ul></div>
</section>
<section class="section wrap" aria-labelledby="guides-t">
<div class="section-head"><p class="eyebrow"><b>05</b><span>Method guides</span></p><h2 class="display-l" id="guides-t">Useful thinking, made practical.</h2></div>
<div class="guides">${guides.map((g, i) => `<a class="guide sel" href="/insights/${g.id}/"><span class="eyebrow"><b>${pad(i + 1)}</b><span>${e(g.cat)}</span></span><h3>${e(g.title)}</h3><p>${e(g.lead)}</p><span class="link">Read the guide ${arr}</span></a>`).join('')}</div>
</section>
${closing()}`;
  return { route: '/', title: 'Syful Hoque — the economics behind the yes', description: 'Development economist in Dhaka: costing, cost-benefit and financing analysis, feasibility studies, surveys and evaluation, and policy research for Bangladesh and international clients.', body, film: true, bodyClass: 'home', jsonld: [personLd(), { '@type': 'WebSite', name: 'Syful Hoque', url: origin + '/' }] };
}

export function closing(title = 'Bring the decision you need to defend.', sub = 'A TOR to staff, a feasibility study to prepare, a model to review or a study to commission.') {
  return `<section class="closing" aria-labelledby="close-t"><div class="wrap closing__grid">
<h2 class="display-l" id="close-t">${e(title)}</h2>
<div class="closing__act"><p class="body-s muted">${e(sub)}</p><div class="actions"><a class="btn btn--primary" href="/contact/" data-door-cta>Start a brief ${arr}</a></div>
<p class="closing__contact">Email <a href="mailto:${e(person.email)}">${e(person.email)}</a><br>Dhaka, Bangladesh · currently on an intermittent ADB assignment to December 2026</p></div>
</div></section>`;
}
