// Loads the content record and the editorial layer, applies publication wording, derives the Evidence Ledger.
import { readFile } from 'node:fs/promises';

const json = async p => JSON.parse(await readFile(p, 'utf8'));
export const record = await json('content/portfolio.json');
export const site = await json('content/site.json');
export const photoCat = (await json('content/photos.json')).photos;
export const media = await json('content/media.json');
export const map = await json('content/map-scope.json');

// Canonical origin: SITE_ORIGIN, else Vercel's production domain (set automatically at build), else a placeholder
// that `npm run check:release` refuses.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const origin = (process.env.SITE_ORIGIN || (vercelHost ? `https://${vercelHost}` : 'https://syful-hoque.example')).replace(/\/$/, '');
export const RELEASE = process.argv.includes('--release') || process.env.RELEASE === '1';

export const person = record.person;

// Publication wording — the imported record stays unchanged; overclaims are reconciled here (carried over from the base build).
for (const p of record.projects) {
  p.features = p.features?.replace('Pioneered the first-of-its-kind economic and financial feasibility study in the education sector in Bangladesh', 'Contributed economic and financial feasibility analysis in the education sector in Bangladesh');
  p.activities = p.activities.map(a => a
    .replace('Single-handedly ran the entire Bangladesh project from questionnaire design to survey implementation, data analysis and report writing.', 'Contributed questionnaire design, survey implementation, data analysis and report writing for the Bangladesh study.')
    .replace('Designed and promoted bankable, environment-friendly municipal infrastructure projects', 'Contributed financial-planning and project-design inputs for environment-friendly municipal infrastructure projects'));
  if (p.id === 'jolshiri') p.activities[0] = 'Led the feasibility assignment, including study design and budget, research and survey teams, stakeholder coordination and report delivery.';
}

// Cases: the 28 detailed assignments (B1–B28 in record order), enriched.
export const cases = record.projects.map((p, i) => {
  const x = site.cases[p.id];
  if (!x) throw new Error(`content/site.json has no editorial entry for case "${p.id}"`);
  return { ...p, ...x, b: `B${i + 1}`, index: i };
});
export const caseById = Object.fromEntries(cases.map(c => [c.id, c]));

// Other assignments (B29–B37): listed, no case page.
export const others = record.otherAssignments.map((o, i) => ({ ...o, ...site.others[i], id: null }));
if (others.some(o => !o.b)) throw new Error('site.others must align with portfolio.json otherAssignments');
export const allAssignments = [...cases, ...others];

export const families = site.families;
export const familyById = Object.fromEntries(families.map(f => [f.id, f]));

// Photos — catalogue × generated media. The consent gate is enforced here.
export const photos = Object.fromEntries(photoCat.map(p => {
  const m = media[p.slug];
  if (!m) throw new Error(`Photo "${p.slug}" has no generated media — run: python tools/build-media.py`);
  return [p.slug, { ...p, ...m }];
}));
export const pendingUsed = new Set();
export function photo(slug) {
  const p = photos[slug];
  if (!p) throw new Error(`Unknown photo "${slug}"`);
  if (p.consent === 'pending') pendingUsed.add(slug);
  return p;
}

// The Evidence Ledger: A identity, B assignments, C figures, D methods, E photos.
export const ledger = [
  ...site.identity.map(([addr, claim, value, source]) => ({ addr, group: 'A', claim, value, note: '', source })),
  ...allAssignments.map(a => ({ addr: a.b, group: 'B', claim: a.title, value: a.role, note: [a.client, a.year].filter(Boolean).join(' · '), source: 'portfolio.json (CV FORM TECH-6, signed 09/09/2026)', href: a.id ? `/work/${a.id}/` : null })),
  ...site.facts.map(([addr, claim, value, note, source]) => ({ addr, group: 'C', claim, value, note, source })),
  ...site.methods.map(([addr, claim, value, source]) => ({ addr, group: 'D', claim, value, note: '', source })),
  ...photoCat.map((p, i) => ({ addr: `E${i + 1}`, group: 'E', claim: p.alt, value: `FR ${p.fr}`, note: [p.caption.year, p.caption.place, p.caption.event].filter(Boolean).join(' · ') + (p.consent === 'pending' ? ' · consent pending' : ''), source: `photos/${p.source} · mapping confidence: ${p.confidence}` }))
];
export const ledgerByAddr = Object.fromEntries(ledger.map(r => [r.addr, r]));
{
  const seen = new Set();
  for (const r of ledger) { if (seen.has(r.addr)) throw new Error(`Duplicate ledger address ${r.addr}`); seen.add(r.addr); }
}
export function fx(addr) {
  const r = ledgerByAddr[addr];
  if (!r) throw new Error(`Unknown ledger address ${addr}`);
  return r;
}

export const guides = [
  { id: 'financeable-programme', cat: 'Costing & financing', title: 'What makes a programme financeable?', lead: 'A useful investment case connects costs, funding, implementation and the assumptions that hold them together.', blocks: [['Start with the decision', 'Define who needs to decide what, by when, and which alternatives remain open. A model should serve that decision.'], ['Separate cost from funding', 'Identify capital, operating and lifecycle costs. Then ask which funding sources can credibly cover them, on what terms and when.'], ['Expose the assumptions', 'Make the key drivers visible: uptake, delivery pace, unit costs, financing terms and maintenance. Use sensitivity analysis to understand which assumptions change the choice.'], ['Cost the implementation system', 'Include the capacity, procurement, governance, monitoring and ongoing operations needed to make the programme work.'], ['Make the financing gap explicit', 'Show what is funded, what is conditional and what remains unresolved. A clear gap is more useful than an apparently balanced plan built on optimistic assumptions.']] },
  { id: 'evidence-to-decision', cat: 'Evidence & decisions', title: 'An evidence-to-decision checklist.', lead: 'Five questions to ask before treating a convincing analysis as a decision-ready one.', blocks: [['What question does this evidence answer?', 'Be specific about the decision and the population or context the findings apply to.'], ['What is observed, assumed or estimated?', 'Keep these categories distinct. Trace important numbers back to their source or calculation.'], ['What would change the conclusion?', 'Test plausible alternatives, uncertain inputs and competing explanations.'], ['Who needs to act?', 'Identify the institution, incentives, capacity and authority required to carry the decision forward.'], ['What will tell us whether it works?', 'Choose practical results measures, specify the baseline and decide how learning will feed back into implementation.']] },
  { id: 'submission-readiness', cat: 'ProposalDesk checklist', title: 'The last review before submission.', lead: 'A structured final pass helps a proposal team focus on preventable errors while there is still time to act.', blocks: [['Reconcile the requirements', 'Check eligibility, instructions, formats, signatures, annexes and the deadline against the actual tender documents.'], ['Follow the logic across sections', 'Make sure the methodology, workplan, team responsibilities, outputs and budget describe the same engagement.'], ['Check every material claim', 'Confirm that project experience, qualifications, roles and dates are accurate and supported.'], ['Review the submission package', 'Check file names, versions, page limits, required attachments and the prescribed submission method.'], ['Leave time for the final handover', 'Assign one person to confirm the complete package and submission receipt. Do not assume that a finished draft is a submitted proposal.']] }
];

export const packs = [
  ['Tender Readiness Scan', 'Spot the red flags early.', '24–48 hours', ['Tender / ToR alignment screen', 'Bid-fit and red-flag snapshot', 'Document strength and gap notes']],
  ['Bid Fix Pack', 'Strengthen an active draft.', '48-hour core turnaround', ['Draft improvement priorities', 'CV and team presentation review', 'Budget, timeline and deliverable consistency']],
  ['Submission Assurance', 'Check the whole submission.', '3–5 days, scope-dependent', ['Full submission risk review', 'Annex and signature readiness', 'Formatting and pre-submit assurance']],
  ['Proposal Writing + Assurance', 'Build a coherent submission.', 'Timeline agreed after scoping', ['Technical proposal writing or rewrite', 'Methodology, workplan and deliverables', 'Team sections and submission readiness']]
];
