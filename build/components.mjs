// Components — the design system's contract (REDESIGN-2026/design-system/project/components/*) rendered to static HTML.
import { e, attrs, arr, pad } from './html.mjs';
import { photo, fx, familyById, site, caseById } from './data.mjs';

const M = '/assets/media/';

// Data-fx attribute: lets the FormulaBar show where a claim comes from.
export function fxAttr(addr) {
  const r = fx(addr);
  return ` data-fx="${e(addr)}" data-fx-claim="${e(r.claim)}" data-fx-value="${e(r.value)}" data-fx-src="${e(r.source)}"`;
}

export function caption(p) {
  const left = [`<b>FR ${e(p.fr)}</b>`, p.caption.year, p.caption.place].filter(Boolean).map((x, i) => i ? e(x) : x).join(' · ');
  return `<figcaption class="print__cap"><span>${left}</span><span>${e(p.caption.event || '')}</span></figcaption>`;
}

// FilmPrint: ink (dithered) base image carries the alt text; colour image is presentational and develops over it.
export function print(slug, o = {}) {
  const p = photo(slug);
  const ar = o.ar || `${p.w}/${p.h}`;
  const [fxp, fyp] = p.focal || [0.5, 0.5];
  const inkSet = p.inkWidths.map(w => `${M}${slug}-ink-${w}.webp ${w}w`).join(', ');
  const webp = p.widths.map(w => `${M}${slug}-${w}.webp ${w}w`).join(', ');
  const avif = p.widths.map(w => `${M}${slug}-${w}.avif ${w}w`).join(', ');
  const sizes = o.sizes || '(max-width: 959px) 90vw, 40vw';
  const small = Math.min(...p.widths);
  const inkSmall = Math.min(...p.inkWidths);
  const eager = o.eager ? { loading: 'eager', fetchpriority: 'high' } : { loading: 'lazy' };
  const lazyColor = o.lazyColor; // defer colour download until needed (hero loupe)
  const colorImg = lazyColor
    ? `<img class="print__color" data-src="${M}${slug}-${small}.webp" data-srcset="${webp}" sizes="${sizes}" alt="" aria-hidden="true" width="${p.w}" height="${p.h}" decoding="async">`
    : `<picture><source type="image/avif" srcset="${avif}" sizes="${sizes}"><img class="print__color" src="${M}${slug}-${small}.webp" srcset="${webp}" sizes="${sizes}" alt="" aria-hidden="true" width="${p.w}" height="${p.h}" decoding="async"${attrs(eager)}></picture>`;
  const cls = ['print', o.cls, o.developed && 'is-developed', p.consent === 'pending' && 'print--pending'].filter(Boolean).join(' ');
  const style = `--ar:${ar};--fx:${Math.round(fxp * 100)}%;--fy:${Math.round(fyp * 100)}%${o.style ? ';' + o.style : ''}`;
  return `<figure class="${cls}" style="${style}" data-photo="${e(slug)}" data-cap="${e(`FR ${p.fr} · ${[p.caption.year, p.caption.place, p.caption.event].filter(Boolean).join(' · ')}`)}"${o.attrs || ''}>`
    + `<div class="print__frame">`
    + `<img class="print__ink" src="${M}${slug}-ink-${inkSmall}.webp" srcset="${inkSet}" sizes="${sizes}" alt="${e(p.alt)}" width="${p.w}" height="${p.h}" decoding="async"${attrs(o.eager ? { loading: 'eager' } : { loading: 'lazy' })}>`
    + colorImg
    + `<i class="print__edge" aria-hidden="true"></i>`
    + (o.mark || '')
    + `</div>${o.noCaption ? '' : caption(p)}</figure>`;
}

export const tag = (variant, label) => `<span class="tag tag--${variant}">${e(label)}</span>`;
export const statusTag = s => s === 'current' ? tag('current', 'Current') : tag('delivered', 'Delivered');

export function pillars(str, label = true) {
  const names = ['Economics', 'Data stories', 'Technology', 'Research'];
  const cells = [...str].map((c, i) => `<span class="${c === 'f' ? 'f' : c === 'h' ? 'h' : ''}" title="${names[i]}: ${c === 'f' ? 'demonstrated' : c === 'h' ? 'partial or planned' : 'not in this assignment'}">${'EDTR'[i]}</span>`).join('');
  const text = [...str].map((c, i) => c === 'n' ? null : `${names[i]}${c === 'h' ? ' (partial)' : ''}`).filter(Boolean).join(', ') || 'none recorded';
  return `<span class="pillars" role="img" aria-label="${label ? 'Pillars demonstrated: ' + e(text) : ''}">${cells}</span>`;
}

export function exhibit(c) {
  if (!c.stat) return `<div class="exhibit"><span class="exhibit__ref">${e(c.b)}</span><span class="exhibit__label">Pillars demonstrated</span><span class="exhibit__edtr" aria-hidden="true">${[...c.pillars].map((p, i) => `<i class="${p}">${'EDTR'[i]}</i>`).join('')}</span><span class="exhibit__label" style="color:var(--ink)">${[...c.pillars].map((p, i) => p === 'n' ? null : ['Economics', 'Data stories', 'Technology', 'Research'][i] + (p === 'h' ? ' (partial)' : '')).filter(Boolean).map(e).join(' × ') || 'Not assessed'}</span></div>`;
  const [fig, unit, addr] = c.stat;
  return `<div class="exhibit"${fxAttr(addr)}><span class="exhibit__ref">${e(addr)}</span><span class="exhibit__label">${e(fx(addr).note && /scope/.test(fx(addr).note) ? 'In scope — not an outcome' : fx(addr).claim)}</span><span class="exhibit__fig">${e(fig)}</span><span class="exhibit__label" style="color:var(--ink)">${e(unit)}</span></div>`;
}

export function eyebrow(c) {
  return [c.client, c.role, c.period].filter(Boolean).map(e).join(' · ');
}

export function plate(id, o = {}) {
  const c = caseById[id];
  const media = c.photos?.length ? print(c.photos[0], { developed: true, sizes: '(max-width: 760px) 90vw, 45vw' }) : exhibit(c);
  return `<a class="plate sel" href="/work/${c.id}/">`
    + `<div class="plate__media">${media}</div>`
    + `<div class="plate__body"><span class="plate__eyebrow">${eyebrow(c)}</span>`
    + `<${o.h || 'h3'} class="plate__title">${e(c.short)}</${o.h || 'h3'}>`
    + (c.stat ? `<div class="plate__stat"${fxAttr(c.stat[2])}><span class="figure">${e(c.stat[0])}</span><span>${e(c.stat[1])}</span></div>` : '')
    + `<p class="body-s muted">${e(c.summary)}</p>`
    + `<div class="chips">${c.families.map(f => `<span class="chip">${e(familyById[f].short)}</span>`).join('')}</div>`
    + `<div class="plate__foot"><span class="actions">${pillars(c.pillars)}${statusTag(c.status)}</span><span class="link">Read the case ${arr}</span></div>`
    + `</div></a>`;
}

const cell = c => c === 'f' ? '<i class="f"></i>' : c === 'h' ? '<i class="h"></i>' : '<i class="n"></i>';
export function matrixRow(a, o = {}) {
  const all4 = a.pillars === 'ffff';
  const name = a.id ? `<a href="/work/${a.id}/">${e(a.short || a.title)}</a>` : e(a.title);
  const pillText = [...a.pillars].map((c, i) => `${['Economics', 'Data stories', 'Technology', 'Research'][i]}: ${c === 'f' ? 'yes' : c === 'h' ? 'partial' : 'no'}`).join('; ');
  return `<tr class="${all4 ? 'all4' : ''}" data-row data-families="${a.families.join(' ')}" data-client="${a.client}" data-market="${a.market}" data-role="${a.role}" data-pillars="${a.pillars}" data-fx="${a.b}" data-fx-claim="${e(a.title)}" data-fx-value="${e(a.role)}" data-fx-src="portfolio.json (CV FORM TECH-6)">`
    + `<td class="n">${e(a.b)}</td><td class="id">${name}</td><td class="who">${e(a.client)}</td>`
    + [...a.pillars].map(c => `<td class="m">${cell(c)}</td>`).join('')
    + `<td class="visually-hidden">${e(pillText)}</td></tr>`;
}
export function matrix(rows, o = {}) {
  return `<div class="scroll-x"><table class="matrix"><caption class="visually-hidden">${e(o.caption || 'Assignments by pillar: Economics, Data stories, Technology, Research')}</caption><thead><tr><th scope="col">Ref</th><th scope="col">Assignment</th><th scope="col">Client</th><th scope="col" class="p" title="Economics">E</th><th scope="col" class="p" title="Data stories">D</th><th scope="col" class="p" title="Technology">T</th><th scope="col" class="p" title="Research">R</th><th class="visually-hidden">Summary</th></tr></thead><tbody>${rows.map(r => matrixRow(r, o)).join('')}</tbody></table></div>`;
}

export function pack(f, o = {}) {
  const proof = f.proof.slice(0, o.proofLimit || 4).map(id => caseById[id]);
  return `<section class="pack${o.active ? ' is-active' : ''}" id="pack-${f.id}" role="${o.tabbed ? 'tabpanel' : 'region'}" aria-labelledby="pack-${f.id}-t"${o.tabbed ? ` tabindex="0"` : ''}>`
    + `<div class="pack__head"><span class="pack__n">SERVICE FAMILY ${f.id}</span><h3 class="pack__title" id="pack-${f.id}-t">${e(f.title)}</h3><p class="pack__def">${e(f.definition)}</p>`
    + `<div class="chips">${f.includes.map(i => `<span class="chip">${e(i)}</span>`).join('')}</div>`
    + `<div class="actions"><a class="btn btn--primary" href="/contact/?intent=${e(f.cta[1])}&amp;service=${encodeURIComponent(f.short)}">${e(f.cta[0])} ${arr}</a><a class="link" href="/services/${f.slug}/">The full family</a></div></div>`
    + `<div><ul class="pack__list">${f.deliverables.map(([t, d]) => `<li><span class="file">.${e(t)}</span>${e(d)}</li>`).join('')}</ul>`
    + (f.standards.length ? `<p class="pack__std">Standards this work followed: ${f.standards.map(e).join(' · ')}</p>` : '')
    + `<div class="pack__proof"><h4>Proof in the record</h4>${proof.map(c => `<a href="/work/${c.id}/"><span class="mono muted">${e(c.b)}</span>${e(c.short)}</a>`).join('')}</div></div></section>`;
}

export function packs(fams, o = {}) {
  if (!o.tabbed) return `<div class="packs">${fams.map(f => pack(f)).join('')}</div>`;
  return `<div class="packs packs--tabbed" data-tabs>${fams.map((f, i) => pack(f, { tabbed: true, active: i === 0 })).join('')}</div>`
    + `<div class="sheet-tabs" role="tablist" aria-label="Service families">${fams.map((f, i) => `<button role="tab" title="${e(f.title)}" id="tab-${f.id}" aria-controls="pack-${f.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${e(f.id)} · ${e(f.short)}</button>`).join('')}<span class="plus" aria-hidden="true">+</span></div>`;
}

export function doors(o = {}) {
  return `<nav class="doors" aria-label="${e(o.label || 'Choose how you would engage')}" data-doors>${site.doors.map((d, i) => `<a class="door sel" data-door="${d.id}" href="/contact/?intent=${d.id}"><span class="door__n">${pad(i + 1)}</span><span class="door__who">${e(d.who)}<small>${e(d.sub)}</small></span><span class="door__cta">${e(d.cta)} ${arr}</span></a>`).join('')}</nav>`;
}

export function caseRow(c) {
  return `<a class="case-row sel" href="/work/${c.id}/"><span class="case-row__n">${e(c.b)}</span><div><h3>${e(c.short)}</h3><p>${e(c.client)} · ${e(c.role)}</p></div><span class="case-row__meta">${e(c.period || '')}</span></a>`;
}

export function crumbs(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb">${trail.map(([href, label], i) => i === trail.length - 1 ? `<span aria-current="page">${e(label)}</span>` : `<a href="${href}">${e(label)}</a><span aria-hidden="true">/</span>`).join('')}</nav>`;
}
