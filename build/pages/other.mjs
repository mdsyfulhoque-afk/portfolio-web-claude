// Evidence ledger, About, Contact, ProposalDesk, Insights, Privacy, 404, legacy redirects.
import { e, arr, pad } from '../html.mjs';
import { profile, ledger, person, guides, packs, site, photo, origin, cases, allAssignments } from '../data.mjs';
import { print, crumbs, doors, tag, fxAttr } from '../components.mjs';
import { crumbLd, personLd } from '../layout.mjs';
import { closing } from './home.mjs';

const TURNSTILE = process.env.TURNSTILE_SITE_KEY || '';

const head = (trail, eyebrowB, eyebrowS, h1, lede, aside = '') => `<section class="page-head"><div class="wrap">${crumbs(trail)}<div class="page-head__grid">
<p class="eyebrow"><b>${eyebrowB}</b><span>${eyebrowS}</span></p><h1 class="display-xl">${h1}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}${aside ? `<div class="page-head__aside">${aside}</div>` : ''}</div></div></section>`;

export function evidencePage() {
  const trail = [['/', 'Home'], ['/evidence/', 'Evidence ledger']];
  const groups = [['A', 'A — Identity'], ['B', 'B — Assignments'], ['C', 'C — Figures'], ['D', 'D — Methods'], ['E', 'E — Photographs']];
  const rows = groups.map(([g, label]) => `<tr class="ledger-group"><th colspan="5" scope="colgroup">${label}</th></tr>` + ledger.filter(r => r.group === g).map(r => `<tr id="${e(r.addr)}"><td class="addr">${e(r.addr)}</td><td>${r.href ? `<a class="link" style="font-family:var(--font-serif);font-weight:400" href="${r.href}">${e(r.claim)}</a>` : e(r.claim)}</td><td class="val">${e(r.value)}</td><td>${e(r.note)}</td><td class="src">${e(r.source)}</td></tr>`).join('')).join('');
  const body = `${head(trail, 'THE EVIDENCE LEDGER', 'Every claim on this site, with its source', 'Nothing hidden.', 'Every figure, method, assignment and photograph used on this website has an address. The FormulaBar at the top of each page shows the address of whatever you are looking at; this page shows where it comes from.')}
<section class="wrap">
<div class="ledger-intro"><div><b>${ledger.length}</b><span>addressed claims</span></div><div><b>${allAssignments.length}</b><span>documented assignments (B1–B${allAssignments.length})</span></div><div><b>0</b><span>outcomes claimed that the record does not show</span></div></div>
<p class="note" style="margin-bottom:24px">Sources: the World Bank FORM TECH-6 CV signed 09/09/2026 and the portfolio record derived from it (portfolio.json). Scope figures describe an assignment’s scope, not money raised or outcomes achieved. Institutional names describe assignment relationships, not endorsements.</p>
<div class="scroll-x"><table class="ledger"><caption class="visually-hidden">Evidence ledger</caption><colgroup><col class="ledger__addr"><col class="ledger__claim"><col class="ledger__val"><col class="ledger__note"><col class="ledger__src"></colgroup><thead><tr><th scope="col">Addr</th><th scope="col">Claim</th><th scope="col">Value</th><th scope="col">Note</th><th scope="col">Source</th></tr></thead><tbody>${rows}</tbody></table></div>
</section>
${closing()}`;
  return { route: '/evidence/', title: 'Evidence ledger', description: 'Every figure, method, assignment and photograph on the site, with its address and source.', body, jsonld: [crumbLd(trail)] };
}

// Owner-supplied profile (content/profile.json): figures → capabilities → sectors → clients, one sheet style throughout.
function aboutProfile() {
  const P = profile, wb = P.worldBank;
  const list = items => `<ul class="tick-list">${items.map(i => `<li>${e(i)}</li>`).join('')}</ul>`;
  return `<section class="section wrap" aria-labelledby="profile-t">
<div class="section-head"><p class="eyebrow"><b>PROFILE</b><span>In his own account</span></p><h2 class="display-l" id="profile-t">Economist. Consulting leader. Development practitioner.</h2><p class="section-aside">The figures below are Syful Hoque’s own statement. The work board documents the assignments in his CV record.</p></div>
<div class="profile-figs">${P.figures.map(([addr, v, label]) => `<div${fxAttr(addr)}><b>${e(v)}</b><span>${e(label)}</span></div>`).join('')}</div>
<div class="prose profile-prose">${P.summary.map(p => `<p>${e(p)}</p>`).join('')}</div>
</section>
<section class="section wrap" aria-labelledby="wb-t"><div class="two-col"><div class="main">
<p class="eyebrow"><b>WORLD BANK</b><span>${e(wb.role)}</span></p>
<h2 class="heading-l" id="wb-t" style="margin:12px 0 20px">${e(wb.title)}</h2>
<div class="prose">${wb.paras.map(p => `<p>${e(p)}</p>`).join('')}</div>
</div><aside class="side"><div class="side-block"><h2>What the role involved</h2>${list(wb.points)}</div></aside></div></section>
<section class="section wrap" aria-labelledby="cap-t">
<div class="section-head"><p class="eyebrow"><b>CAPABILITIES</b><span>Six groups</span></p><h2 class="display-l" id="cap-t">What he brings to an assignment.</h2></div>
<div class="cap-grid">${P.capabilities.map(([n, h, items]) => `<article class="cap"><span class="cap__n">${e(n)}</span><h3>${e(h)}</h3>${n === '06' ? `<div class="chips">${items.map(i => `<span class="chip">${e(i)}</span>`).join('')}</div>` : list(items)}</article>`).join('')}</div>
</section>
<section class="section wrap" aria-labelledby="sec-t">
<div class="section-head"><p class="eyebrow"><b>SECTORS</b><span>Coverage so far</span></p><h2 class="display-l" id="sec-t">Where the work has been.</h2></div>
<div class="cap-grid cap-grid--2">${P.sectors.map(([h, items], i) => `<article class="cap"><span class="cap__n">S${i + 1}</span><h3>${e(h)}</h3>${list(items)}</article>`).join('')}</div>
</section>
<section class="section wrap" aria-labelledby="cli-t">
<div class="section-head"><p class="eyebrow"><b>CLIENTS</b><span>So far</span></p><h2 class="display-l" id="cli-t">Who he has worked for.</h2><p class="section-aside">Institutional names describe assignment relationships, not endorsements.</p></div>
<div class="client-groups">${P.clients.map(([h, items]) => `<div class="client-group"><h3>${e(h)} <span class="mono muted">${items.length}</span></h3><div class="chips">${items.map(i => `<span class="chip">${e(i)}</span>`).join('')}</div></div>`).join('')}</div>
</section>`;
}

export function aboutPage() {
  const trail = [['/', 'Home'], ['/about/', 'About']];
  const tl = [
    ['2008', 'Research on tobacco taxation and electricity regulatory reform', 'Price-elasticity estimation and advocacy; comparative cost-benefit analysis of regulation across Bangladesh, India and Nepal.', null],
    ['2012', 'MSc Economics, University of Surrey', 'After an MSS (2006) and BSS (2005) in Economics at the University of Dhaka.', null],
    ['2013', 'ADB training workshop, Dhaka', 'Presenting “What are Financial Soundness Indicators?” at an ADB workshop on GIS-based land and real-estate price estimation. The dating of this role against the record is being confirmed.', 'fsi-lecture-2013'],
    ['2014', 'ADB conference, The Westin Dhaka', 'Conference on Linking Financial Sector to the Real Economy, under ADB’s financial soundness indicators technical assistance.', 'adb-conference-group'],
    ['2019', 'Technology adoption survey briefing', 'A briefing on the structure of a technology adoption survey, Dhaka.', 'tech-adoption-slide'],
    ['2022', 'Economist and Financial Analyst — ADB education feasibility series', 'Economic and financial appraisal for secondary, madrasah, TVET and primary education programmes.', null],
    ['2024', 'Findings round-table', 'A round-table session on findings, Dhaka, June 2024.', 'findings-2024'],
    ['2025', 'Economic & Financial Analysis Specialist (International) — ADB TA 10103-REG', 'Early-warning systems, ten countries in scope; current to December 2026.', null]
  ];
  const body = `<section class="wrap"><div class="about-hero">
<div class="about-hero__portrait">${print('portrait', { developed: true, eager: true, sizes: '(max-width: 899px) 90vw, 36vw' })}</div>
<div class="about-hero__text">${crumbs(trail)}
<p class="eyebrow"><b>ABOUT</b><span>Mohammad Syful Hoque</span></p>
<h1 class="display-l">One capability. Many real-world contexts.</h1>
<p class="lede">${e(profile.lede)}</p>
<div class="prose"><p>Since 2008 his assignments have been for and with the Asian Development Bank, the World Bank Group, the European Commission, UNCTAD, JICA and the Gates Foundation, and for Bangladeshi public bodies including the Payra Seaport Authority and Dhaka South City Corporation. The work spans feasibility studies, cost estimates, ENPV/EIRR and sensitivity analysis, financing plans, results frameworks, impact evaluations including randomised trials, and policy research on trade, LDC graduation and green transition.</p><p>He is currently Economic and Financial Analysis Specialist on an ADB regional technical assistance for early-warning systems.</p></div>
<div class="actions"><a class="btn btn--primary" href="/contact/">Start a brief ${arr}</a><a class="btn btn--quiet" href="/evidence/">The evidence ledger</a></div>
</div></div></section>
${aboutProfile()}
<section class="section wrap"><div class="section-head"><p class="eyebrow"><b>TIMELINE</b><span>Selected moments from the record</span></p><h2 class="display-l">From the field to the table.</h2></div>
<ol class="timeline">${tl.map(([y, h, p, img]) => `<li><span class="yr">${y}</span><div><h3>${e(h)}</h3><p>${e(p)}</p></div>${img ? `<img src="/assets/media/${img}-480.webp" alt="${e(photo(img).alt)}" width="480" height="360" loading="lazy">` : '<span></span>'}</li>`).join('')}</ol></section>
<section class="section wrap"><div class="two-col"><div class="main">
<h2 class="heading-l" style="margin-bottom:16px">Education.</h2><ul class="cred-list">${person.education.map(d => `<li><strong>${e(d.degree)}</strong> — ${e(d.institution)}, ${e(d.year)}</li>`).join('')}</ul>
<h2 class="heading-l" style="margin:40px 0 16px">Certifications.</h2><ul class="cred-list">${person.certifications.map(c => `<li>${e(c)}</li>`).join('')}</ul>
<h2 class="heading-l" style="margin:40px 0 16px">Memberships.</h2><ul class="cred-list">${person.memberships.map(c => `<li>${e(c)}</li>`).join('')}</ul>
</div><aside class="side"><div class="side-block"><h2>Languages</h2><p>English (excellent) · Bengali (mother tongue)</p></div><div class="side-block"><h2>Based in</h2><p>Dhaka, Bangladesh. Working in Bangladesh and internationally, as an individual consultant or key expert.</p></div><div class="side-block"><h2>CV</h2><p class="body-s">CVs in World Bank, ADB or EU expert-profile format are shared on request.</p><a class="link" href="/contact/?intent=firm">Request a CV ${arr}</a></div></aside></div></section>
${closing()}`;
  return { route: '/about/', title: 'About', description: 'Mohammad Syful Hoque — Dhaka-based economist specialising in costing, financing, and economic and financial appraisal, since 2008.', body, jsonld: [crumbLd(trail), { '@type': 'ProfilePage', mainEntity: personLd() }] };
}

export function contactPage() {
  const trail = [['/', 'Home'], ['/contact/', 'Contact']];
  const services = ['Feasibility & project preparation', 'Cost-benefit & financial analysis', 'Policy research & advocacy', 'Management consulting, M&E & evaluation', 'Data stories & decision technology', 'ProposalDesk', 'Not sure yet'];
  const body = `${head(trail, 'START A BRIEF', 'A short brief is enough to start', 'What decision are you facing?', 'Tell me the context, the decision and the support you need. A short brief is enough to start.')}
<section class="wrap"><div class="contact-grid">
<aside class="contact-aside" id="direct" tabindex="-1">
<p class="target-note target-note--sent" id="sent" tabindex="-1" role="status">Sent. A reply will come to the email address you gave.</p>
<p class="target-note target-note--direct" role="status">The brief could not be sent from this page. Please email or WhatsApp it directly — the details are below.</p>
<h2 class="heading-m">A useful first conversation starts with your question.</h2>
<dl class="contact-dl"><dt>Email</dt><dd><a href="mailto:${e(person.email)}">${e(person.email)}</a></dd><dt>WhatsApp</dt><dd><a href="https://wa.me/${e(person.whatsapp)}" rel="noopener">${e(person.phoneDisplay)}</a></dd><dt>Based in</dt><dd>Dhaka, Bangladesh</dd><dt>Availability</dt><dd>Currently on an intermittent ADB assignment to December 2026</dd></dl>
<p class="note">Your brief is sent to the owner’s inbox when the website’s mail service is configured; otherwise it opens in your own email or WhatsApp app for you to review and send. Nothing is stored on this website.</p>
</aside>
<form class="contact-form" id="brief" action="/api/enquiry" method="post" novalidate>
<fieldset><legend>I’m reaching out as</legend><div class="choice">${site.doors.map((d, i) => `<label><input type="radio" name="intent" value="${d.id}"${i === 0 ? ' checked' : ''}><span>${e(d.who)}</span></label>`).join('')}</div></fieldset>
<div class="pair"><label class="field"><span>Your name</span><input id="f-name" name="name" autocomplete="name" required maxlength="100"></label><label class="field"><span>Organisation</span><input id="f-org" name="organisation" autocomplete="organization" required maxlength="160"></label></div>
<label class="field"><span>Email</span><input id="f-email" name="email" type="email" autocomplete="email" required maxlength="200"></label>
<div class="pair"><label class="field"><span>Service</span><select id="f-service" name="service">${services.map(s => `<option>${e(s)}</option>`).join('')}</select></label><label class="field"><span>Timing</span><select id="f-timing" name="timing"><option>Exploring / no fixed deadline</option><option>Within 2 weeks</option><option>Within 1–3 months</option><option>Later this year</option></select></label></div>
<label class="field"><span>The question, TOR or brief</span><textarea id="f-brief" name="brief" required minlength="20" maxlength="3000"></textarea><span class="help">What are you trying to decide or deliver? A link to a TOR is welcome.</span></label>
<label class="field"><span>Link to a TOR or document <small>(optional)</small></span><input id="f-link" name="link" type="url" maxlength="500" placeholder="https://"></label>
<div class="hp" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
<p class="body-s muted">Your details are used only to reply to this enquiry and are kept for no longer than 12 months. See the <a class="link" href="/privacy/">privacy note</a>.</p>
${TURNSTILE ? `<div class="cf-turnstile" data-sitekey="${e(TURNSTILE)}" data-theme="auto" style="margin-block:8px"></div><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : ''}
<div class="actions"><button class="btn btn--primary" type="submit" data-submit>Send the brief ${arr}</button><span class="form-status" data-status role="status" aria-live="polite"></span></div>
<div class="brief-out" data-fallback hidden tabindex="-1"><p class="label">Your brief is ready</p><pre data-brief-text></pre><div class="actions"><a class="btn btn--primary" data-mailto href="mailto:${e(person.email)}">Open in email ${arr}</a><a class="btn btn--quiet" data-wa href="https://wa.me/${e(person.whatsapp)}" rel="noopener">Open in WhatsApp</a><button class="btn btn--quiet" type="button" data-copy>Copy</button></div><p class="body-s muted">Nothing has been sent by this website. Review the brief in your email or WhatsApp app and send it from there.</p></div>
</form>
</div></section>`;
  return { route: '/contact/', title: 'Start a brief', description: 'Send a short brief: a TOR to staff, a feasibility study to prepare, a model to review or a study to commission.', body, jsonld: [crumbLd(trail)], contactData: { email: person.email, whatsapp: person.whatsapp } };
}

export function proposaldeskPage() {
  const trail = [['/', 'Home'], ['/proposaldesk/', 'ProposalDesk']];
  const body = `<div class="pd"><section class="pd-hero"><div class="wrap">${crumbs(trail).replace('class="crumbs"', 'class="crumbs" style="color:inherit;opacity:.7"')}
<p class="pd-lockup">ProposalDesk<i>.</i></p>
<p class="eyebrow" style="margin-top:20px"><b style="color:inherit">BUILD. FIX. DE-RISK. SUBMIT.</b><span>A product by Syful Hoque</span></p>
<h1 class="display-l" style="margin-top:28px;max-width:14ch">A stronger bid. A clearer case.</h1>
<p class="lede" style="margin-top:20px">Expert writing and submission assurance for donor bids, EOIs, RFPs and tenders. Bring a brief, an active draft or a submission under pressure.</p>
<div class="actions" style="margin-top:28px"><a class="btn btn--pd" href="#packs">Find your starting point ${arr}</a><a class="btn btn--quiet" href="/contact/?intent=firm&amp;service=ProposalDesk">Discuss your bid</a></div>
<div class="pd-logic"><div><b>Compliant</b><span>Requirements accounted for.</span></div><div><b>Coherent</b><span>Method, team and budget aligned.</span></div><div><b>Credible</b><span>Claims supported by evidence.</span></div></div>
</div></section>
<section class="section wrap" id="packs"><div class="section-head"><p class="eyebrow"><b>CHOOSE YOUR STARTING POINT</b><span>Fees agreed before work begins</span></p><h2 class="display-l">Right support. Right moment.</h2><p class="section-aside">Final scope, fee and turnaround depend on the tender, the document volume and the deadline.</p></div>
<div class="packs-grid">${packs.map(([n, t, time, list], i) => `<article class="pd-pack${i === 1 ? ' is-core' : ''}"><span class="eyebrow"><b>${i === 1 ? 'CORE' : pad(i + 1)}</b><span>${i === 3 ? 'Build' : 'Assurance'}</span></span><h3>${e(n)}</h3><p class="body-s">${e(t)}</p><ul>${list.map(l => `<li>${e(l)}</li>`).join('')}</ul><span class="mono muted" style="font-size:11px">${e(time)}</span><a class="link" href="/contact/?intent=firm&amp;service=${encodeURIComponent(n)}">Discuss this scope ${arr}</a></article>`).join('')}</div></section>
<section class="section wrap faq"><div class="section-head"><p class="eyebrow"><b>BEFORE WE BEGIN</b><span>Questions</span></p><h2 class="display-l">Straight answers.</h2></div>
${[['Can you work with an existing draft?', 'Yes. The Bid Fix Pack and Submission Assurance tracks are designed around active drafts. The initial review establishes what can be improved within the deadline.'], ['Can you write from the beginning?', 'The build track covers proposal writing or substantial rewriting, with the scope agreed against the actual tender and the available evidence.'], ['Is a successful award guaranteed?', 'No. ProposalDesk supports the quality, coherence and readiness of the submission. The procuring organisation makes the award decision.'], ['How do I share documents?', 'Start with a short brief. Document-sharing arrangements are agreed directly; this website does not collect uploads.']].map(([q, a]) => `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join('')}</section></div>
${closing('Make the submission count.', 'Share the tender, the stage you are at and the deadline.')}`;
  return { route: '/proposaldesk/', title: 'ProposalDesk — build, fix, de-risk', description: 'Expert bid writing and submission assurance for donor bids, EOIs, RFPs and tenders.', body, jsonld: [crumbLd(trail)] };
}

export function insightsIndex() {
  const trail = [['/', 'Home'], ['/insights/', 'Method guides']];
  const body = `${head(trail, 'METHOD GUIDES', 'Practical checklists', 'Useful thinking, made practical.', 'Short method guides on the questions that connect evidence, financing and implementation. They are website resources, separate from the professional record.')}
<section class="section wrap"><div class="guides">${guides.map((g, i) => `<a class="guide sel" href="/insights/${g.id}/"><span class="eyebrow"><b>${pad(i + 1)}</b><span>${e(g.cat)}</span></span><h2 style="font-size:1.6rem;font-stretch:84%;font-weight:680;line-height:1">${e(g.title)}</h2><p>${e(g.lead)}</p><span class="link">Read the guide ${arr}</span></a>`).join('')}</div></section>
${closing()}`;
  return { route: '/insights/', title: 'Method guides', description: 'Practical method guides on costing, financeable programmes, evidence-to-decision and proposal readiness.', body, jsonld: [crumbLd(trail)] };
}

export function guidePage(g) {
  const trail = [['/', 'Home'], ['/insights/', 'Method guides'], [`/insights/${g.id}/`, g.title]];
  const body = `${head(trail, e(g.cat.toUpperCase()), 'Method guide · 3 min read', e(g.title), e(g.lead))}
<article class="wrap article"><aside class="article__aside">Method guide<br>Syful Hoque</aside><div class="article__body">${g.blocks.map(([h, p], i) => `<section><span class="beat__num"><b>${pad(i + 1)}</b></span><h2>${e(h)}</h2><p class="body">${e(p)}</p></section>`).join('')}<p style="margin-top:32px"><a class="link" href="/insights/">All method guides</a></p></div></article>
${closing()}`;
  return { route: `/insights/${g.id}/`, title: g.title, description: g.lead, body, jsonld: [crumbLd(trail), { '@type': 'Article', headline: g.title, description: g.lead, author: { '@type': 'Person', name: 'Mohammad Syful Hoque' } }] };
}

export function privacyPage() {
  const trail = [['/', 'Home'], ['/privacy/', 'Privacy']];
  const body = `${head(trail, 'PRIVACY', 'How this website handles information', 'A straightforward approach.', '')}
<section class="section wrap"><div class="prose">
<h2>Enquiries.</h2><p>If you send a brief through the contact form and the website’s mail service is configured, your name, organisation, email address and message are sent to Mohammad Syful Hoque’s inbox so that he can reply. They are used only for that purpose and are kept for no longer than 12 months. If the mail service is not configured, the form prepares the brief in your browser and hands it to your own email or WhatsApp app; nothing is sent or stored by this website.</p>
<h2>Processors.</h2><p>When the mail service is enabled, the website’s hosting provider and the configured email delivery provider process the enquiry on the owner’s behalf. Spam protection, if enabled, is provided by Cloudflare Turnstile.</p>
<h2>Cookies and analytics.</h2><p>This website sets no advertising or tracking cookies. It remembers your theme and your chosen “door” in your own browser’s storage; this never leaves your device.</p>
<h2>Your rights.</h2><p>To ask what is held about you, or to have it deleted, email <a href="mailto:${e(person.email)}">${e(person.email)}</a>.</p>
</div></section>`;
  return { route: '/privacy/', title: 'Privacy', description: 'How this website handles enquiries, storage and analytics.', body, jsonld: [crumbLd(trail)] };
}

export function notFoundPage() {
  const body = `<section class="page-head"><div class="wrap"><div class="page-head__grid"><p class="eyebrow"><b>404</b><span>#REF!</span></p><h1 class="display-xl">That cell is empty.</h1><p class="lede">The page you asked for is not in the record. Try the work board, the services or the evidence ledger.</p><div class="page-head__aside"><div class="actions"><a class="btn btn--primary" href="/">Home ${arr}</a><a class="btn btn--quiet" href="/work/">Work board</a></div></div></div></div></section>`;
  return { route: '/404', title: 'Not found', description: 'This page is not in the record.', body, jsonld: [] };
}

export const REDIRECTS = [
  ['/products/', '/services/'], ['/expertise/', '/services/'],
  ['/expertise/evidence-economics/', '/services/cost-benefit-analysis/'], ['/expertise/policy-institutions/', '/services/policy-research-advocacy/'],
  ['/expertise/strategy-delivery/', '/services/feasibility-studies/'], ['/expertise/digital-ventures/', '/services/data-stories-technology/'],
  ['/work-with-me/', '/contact/'], ['/assets/syful-hoque-profile.txt', '/about/']
];
export const redirectPage = to => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${origin}${to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>This page has moved to <a href="${to}">${to}</a>.</p></body></html>`;
