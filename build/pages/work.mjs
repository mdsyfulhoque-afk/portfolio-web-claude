import { e, arr, pad } from '../html.mjs';
import { cases, others, allAssignments, families, familyById, site, photo, origin, map } from '../data.mjs';
import { print, exhibit, pillars, statusTag, matrix, crumbs, fxAttr, caseRow } from '../components.mjs';
import { crumbLd } from '../layout.mjs';
import { closing } from './home.mjs';

function card(a) {
  const media = a.id && a.photos?.length ? `<img src="/assets/media/${a.photos[0]}-480.webp" alt="" width="480" height="300" loading="lazy">` : exhibit(a);
  const inner = `<div class="card__media">${media}</div><div class="card__body"><span class="card__meta">${e(a.b)} · ${e(a.client)}${a.period ? ' · ' + e(a.period) : a.year && !a.id ? ' · ' + e(a.year) : ''}</span><h3>${e(a.short || a.title)}</h3><span class="card__meta">${e(a.role)}</span><div class="card__foot">${pillars(a.pillars)}${a.id ? statusTag(a.status) : '<span class="tag tag--proposed" style="border-style:solid">Record only</span>'}</div></div>`;
  const data = `data-row data-families="${a.families.join(' ')}" data-client="${a.client}" data-market="${a.market}" data-role="${a.role}" data-pillars="${a.pillars}"`;
  return a.id ? `<a class="card sel" href="/work/${a.id}/" ${data}>${inner}</a>` : `<div class="card is-other" ${data}>${inner}</div>`;
}

export function workIndex() {
  const trail = [['/', 'Home'], ['/work/', 'Work']];
  const sel = (id, label, opts) => `<label class="filter-group"><span>${label}</span><select data-filter="${id}"><option value="">All</option>${opts.map(([v, l]) => `<option value="${e(v)}">${e(l)}</option>`).join('')}</select></label>`;
  const body = `<section class="page-head"><div class="wrap">${crumbs(trail)}<div class="page-head__grid">
<p class="eyebrow"><b>THE WORK BOARD</b><span>${allAssignments.length} documented assignments · since 2008</span></p>
<h1 class="display-xl">The record, as a dataset.</h1>
<p class="lede">Every assignment in the record, filterable by service family, pillar, client, market and role. Roles include short-term, intermittent and consulting appointments, some through partner organisations — named on each case.</p>
</div></div></section>
<section class="wrap" data-board>
<div class="filters" role="group" aria-label="Filter the record">
${sel('family', 'Service family', families.map(f => [f.id, f.short]))}
${sel('pillar', 'Pillar', [['0', 'Economics'], ['1', 'Data stories'], ['2', 'Technology'], ['3', 'Research'], ['all', 'All four']])}
${sel('client', 'Client', Object.entries(site.clientTypes))}
${sel('market', 'Market', [['bangladesh', 'Bangladesh'], ['international', 'International / regional']])}
${sel('role', 'Role', [['lead', 'Lead / team leader'], ['specialist', 'Specialist']])}
</div>
<div class="board-head"><p class="board-count" aria-live="polite" data-count>${allAssignments.length} of ${allAssignments.length} records</p>
<div class="seg" role="group" aria-label="View"><button type="button" data-view="grid" aria-pressed="true">Grid</button><button type="button" data-view="list" aria-pressed="false">List (matrix)</button></div></div>
<div class="grid-view" data-view-panel="grid">${allAssignments.map(card).join('')}</div>
<div class="list-view" data-view-panel="list" hidden>${matrix(allAssignments, { caption: 'All documented assignments by pillar' })}</div>
<p class="empty" data-empty hidden>No record matches every filter. Clear one to widen the view.</p>
<p class="note" style="margin-block:40px 0">Pillars: E Economics · D Data stories · T Technology · R Research. Filled = demonstrated in the recorded methods; half = partial or planned. Institutional names describe assignment relationships, not endorsements.</p>
</section>
${closing('Facing a similar question?', 'Describe the decision, the evidence you already have and the support you need.')}`;
  return { route: '/work/', title: 'Work board', description: 'Thirty-seven documented assignments in economic and financial appraisal, feasibility, policy research, evaluation and data — filterable by service, pillar, client and market.', body, jsonld: [crumbLd(trail)] };
}

function mapSvgInline() {
  return `<svg viewBox="0 0 ${map.width} ${map.height}" role="img" aria-label="Map of the ten countries in the TA scope"><g>${map.context.map(d => `<path class="ctx" d="${d}"/>`).join('')}</g><g>${map.countries.map(c => c.id === '462' ? `<circle class="scope pt" cx="${c.cx}" cy="${c.cy}" r="5"/>` : `<path class="scope" d="${c.d}"/>`).join('')}</g><circle class="dhaka" cx="${map.dhaka[0]}" cy="${map.dhaka[1]}" r="5"/></svg>`;
}

export function casePage(c) {
  const trail = [['/', 'Home'], ['/work/', 'Work'], [`/work/${c.id}/`, c.short]];
  const fams = c.families.map(f => familyById[f]);
  const media = c.photos?.length
    ? print(c.photos[0], { developed: true, eager: true, sizes: '(max-width: 899px) 90vw, 40vw' })
    : c.exhibit === 'map' ? `<div class="map">${mapSvgInline()}<div class="map__cap"><span>10 countries in the TA scope</span><span>Scope, not presence</span></div></div>` : exhibit(c);
  const related = cases.filter(x => x.id !== c.id && x.families.some(f => c.families.includes(f))).slice(0, 4);
  const body = `<section class="wrap"><div class="case-hero">
<div class="case-hero__text">${crumbs(trail)}
<p class="eyebrow"><b>${e(c.b)}</b><span>${e(c.client)}</span></p>
<h1 class="display-l">${e(c.short)}</h1>
<p class="case-hero__full">${e(c.title)}</p>
<p class="lede">${e(c.summary)}</p>
<dl class="facts">
<div><dt>Role</dt><dd>${e(c.role)}</dd></div>
<div><dt>Period</dt><dd>${c.period ? e(c.period) : '<span class="muted">Dates being reconciled</span>'}</dd></div>
<div><dt>Geography</dt><dd>${e(c.location)}</dd></div>
<div><dt>Status</dt><dd>${statusTag(c.status)}</dd></div>
</dl>
</div>
<div class="case-hero__media">${media}
${c.stat ? `<div class="stat" style="margin-top:24px"${fxAttr(c.stat[2])}><div style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap"><span class="stat__fig" style="font-size:clamp(2.4rem,4vw,3.6rem)">${e(c.stat[0])}</span><span class="stat__unit">${e(c.stat[1])}</span></div><p class="stat__src">${e(c.stat[2])} · ${e(c.stat[2] && (c.stat[1].includes('scope') ? 'scope, not an outcome' : 'from the record'))}</p></div>` : ''}
</div>
</div></section>
<section class="section wrap"><div class="two-col">
<div class="main">
<h2 class="heading-l" style="margin-bottom:20px">${c.status === 'current' ? 'What the role covers.' : 'What I did.'}</h2>
<ol class="contrib">${c.activities.map(a => `<li>${e(a)}</li>`).join('')}</ol>
${c.features ? `<h2 class="heading-m" style="margin:40px 0 12px">The assignment.</h2><p class="body">${e(c.features)}</p>` : ''}
${c.status === 'current' ? '<p class="note" style="margin-top:24px">This assignment is current. The record lists responsibilities and planned outputs; it does not claim that every planned output has been completed.</p>' : ''}
${c.scale ? `<p class="note" style="margin-top:24px">Scope: ${e(c.scale)} — a description of the assignment’s scope, not of funds raised or outcomes achieved.</p>` : ''}
</div>
<aside class="side">
<div class="side-block"><h2>Service families</h2>${fams.map(f => `<a class="link" href="/services/${f.slug}/">${e(f.title)}</a>`).join('<br>')}</div>
<div class="side-block"><h2>Pillars demonstrated</h2>${pillars(c.pillars)}<p class="stat__src">${c.pillarsSource === 'ledger' ? 'EVIDENCE-LEDGER §3' : 'Assessed from the recorded methods'}</p></div>
${c.reference ? `<div class="side-block"><h2>Reference</h2><p class="mono" style="font-size:12px">${e(c.reference)}</p></div>` : ''}
<div class="side-block"><h2>In the ledger</h2><a class="link" href="/evidence/#${e(c.b)}">${e(c.b)} — source row ${arr}</a></div>
</aside>
</div></section>
${c.photos?.length > 1 ? `<section class="section wrap"><div class="section-head"><p class="eyebrow"><b>FROM THE ASSIGNMENT</b><span>Photographs</span></p></div><div class="gallery">${c.photos.slice(1).map(s => print(s, { developed: true, sizes: '(max-width: 899px) 45vw, 30vw' })).join('')}</div></section>` : ''}
<section class="section wrap"><div class="section-head"><p class="eyebrow"><b>RELATED</b><span>Same service families</span></p></div><div class="case-rows">${related.map(caseRow).join('')}</div></section>
${closing('Facing a similar question?', 'Describe the decision, the evidence you already have and the support you need.')}`;
  return { route: `/work/${c.id}/`, title: c.short, description: c.summary, body, jsonld: [crumbLd(trail), { '@type': 'CreativeWork', name: c.title, headline: c.short, description: c.summary, author: { '@type': 'Person', name: 'Mohammad Syful Hoque' }, funder: { '@type': 'Organization', name: c.client }, locationCreated: c.location, url: `${origin}/work/${c.id}/` }] };
}

export function mapSvgFile() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${map.width} ${map.height}" width="${map.width}" height="${map.height}"><title>Ten countries in the ADB TA 10103-REG scope</title><style>.ctx{fill:#e7eae4;stroke:#d8ddd7;stroke-width:.6}.scope{fill:#1d3fd0;stroke:#fff;stroke-width:.8}.dhaka{fill:#c8321f}</style><rect width="100%" height="100%" fill="#fff"/><g>${map.context.map(d => `<path class="ctx" d="${d}"/>`).join('')}</g><g>${map.countries.map(c => c.id === '462' ? `<circle class="scope" cx="${c.cx}" cy="${c.cy}" r="5" data-name="${e(c.name)}"/>` : `<path class="scope" d="${c.d}" data-name="${e(c.name)}"/>`).join('')}</g><circle class="dhaka" cx="${map.dhaka[0]}" cy="${map.dhaka[1]}" r="5"/></svg>`;
}
