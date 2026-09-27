import { e, arr, pad } from '../html.mjs';
import { families, caseById, origin } from '../data.mjs';
import { pack, caseRow, crumbs, doors } from '../components.mjs';
import { crumbLd } from '../layout.mjs';
import { closing } from './home.mjs';

export function servicesIndex() {
  const trail = [['/', 'Home'], ['/services/', 'Services']];
  const body = `<section class="page-head"><div class="wrap">${crumbs(trail)}<div class="page-head__grid">
<p class="eyebrow"><b>SERVICES</b><span>Five families · Bangladesh and international</span></p>
<h1 class="display-xl">What you receive.</h1>
<p class="lede">Policy research, advocacy and management consultancy — built on one integrated capability: economics, data stories, technology and research, applied to the decision in front of you.</p>
</div></div></section>
<section class="section wrap"><div class="family-list">${families.map((f, i) => `<a class="family-row sel" href="/services/${f.slug}/"><span class="family-row__n">${e(f.id)}</span><div><h2>${e(f.title)}</h2><div class="chips" style="margin-top:12px">${f.includes.map(x => `<span class="chip">${e(x)}</span>`).join('')}</div></div><p>${e(f.definition)}</p><span class="family-row__go">Open ${arr}</span></a>`).join('')}</div></section>
<section class="section wrap"><div class="section-head"><p class="eyebrow"><b>NEXT</b><span>Where do you sit?</span></p><h2 class="display-l">Start from your side of the table.</h2></div>${doors()}</section>
${closing()}`;
  return { route: '/services/', title: 'Services', description: 'Feasibility studies, cost-benefit and financial analysis, policy research and advocacy, management consulting and M&E, data stories and decision technology.', body, jsonld: [crumbLd(trail)] };
}

export function familyPage(f) {
  const trail = [['/', 'Home'], ['/services/', 'Services'], [`/services/${f.slug}/`, f.short]];
  const proof = f.proof.map(id => caseById[id]);
  const body = `<section class="page-head"><div class="wrap">${crumbs(trail)}<div class="page-head__grid">
<p class="eyebrow"><b>SERVICE FAMILY ${e(f.id)}</b><span>${f.includes.map(e).join(' · ')}</span></p>
<h1 class="display-xl">${e(f.title)}</h1>
<p class="lede">${e(f.definition)}</p>
<div class="page-head__aside"><a class="btn btn--primary" href="/contact/?intent=${e(f.cta[1])}&amp;service=${encodeURIComponent(f.short)}">${e(f.cta[0])} ${arr}</a></div>
</div></div></section>
<section class="section wrap">${pack(f, { proofLimit: 6 })}
${f.note ? `<p class="note" style="margin-top:24px;max-width:80ch">${e(f.note)}</p>` : ''}</section>
<section class="section wrap"><div class="section-head"><p class="eyebrow"><b>PROOF</b><span>${proof.length} assignments in the record</span></p><h2 class="display-l">Where this has been done.</h2></div>
<div class="case-rows">${proof.map(caseRow).join('')}</div></section>
${closing()}`;
  return { route: `/services/${f.slug}/`, title: f.title, description: f.definition, body, jsonld: [crumbLd(trail), { '@type': 'Service', name: f.title, description: f.definition, areaServed: ['Bangladesh', 'International'], provider: { '@type': 'Person', name: 'Mohammad Syful Hoque', url: origin + '/about/' } }] };
}
