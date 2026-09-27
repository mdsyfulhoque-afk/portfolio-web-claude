// POST /api/enquiry — the contact form's only server code.
// A standard Web Request → Response handler: Vercel runs it as-is (named POST export);
// Netlify, Cloudflare or any Node server can mount the same `handle` function.
// JSON callers (the enhanced form) get JSON back. Plain form posts (JavaScript off) are redirected to
// /contact/#sent or /contact/#direct. Without RESEND_API_KEY + ENQUIRY_TO the answer is {fallback:true}
// and the page hands the brief to the visitor's own email or WhatsApp.

const MAX_BODY = 20_000;
const MIN_ELAPSED_MS = 3_000;
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const FIELDS = { name: 100, organisation: 160, email: 200, intent: 40, service: 120, timing: 60, brief: 3000, link: 500 };

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
});
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);

async function evaluate(input, request, env) {
  // Bots: accept silently so they learn nothing.
  if (clean(input.website, 200)) return [200, { ok: true }];
  if (Number(input.elapsed) > 0 && Number(input.elapsed) < MIN_ELAPSED_MS) return [200, { ok: true }];

  const d = Object.fromEntries(Object.entries(FIELDS).map(([k, max]) => [k, clean(input[k], max)]));
  const missing = ['name', 'organisation', 'email', 'brief'].filter(k => !d[k]);
  if (missing.length) return [400, { error: `Please complete: ${missing.join(', ')}.` }];
  if (!EMAIL.test(d.email)) return [400, { error: 'Please check the email address.' }];
  if (d.brief.length < 20) return [400, { error: 'Please add a little more detail to the brief.' }];
  if (d.link && !/^https?:\/\//i.test(d.link)) return [400, { error: 'The document link must start with https://' }];

  if (env.TURNSTILE_SECRET_KEY) {
    const token = clean(input['cf-turnstile-response'], 2048);
    if (!token) return [400, { error: 'Please complete the spam check.' }];
    const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip) form.set('remoteip', ip);
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form }).then(r => r.json()).catch(() => ({ success: false }));
    if (!check.success) return [400, { error: 'The spam check failed. Please try again.' }];
  }

  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO) return [503, { fallback: true }];

  const text = [
    `New brief from the website`, ``,
    `Name: ${d.name}`, `Organisation: ${d.organisation}`, `Email: ${d.email}`,
    `Reaching out as: ${d.intent || '—'}`, `Service: ${d.service || '—'}`, `Timing: ${d.timing || '—'}`,
    d.link ? `TOR / document: ${d.link}` : null, ``, d.brief
  ].filter(x => x !== null).join('\n');

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM || 'Website brief <onboarding@resend.dev>',
      to: env.ENQUIRY_TO.split(',').map(s => s.trim()).filter(Boolean),
      reply_to: d.email,
      subject: `Brief: ${d.service || 'enquiry'} — ${d.organisation}`.slice(0, 180),
      text
    })
  }).catch(() => null);

  return sent?.ok ? [200, { ok: true }] : [502, { fallback: true }];
}

export async function handle(request, env = globalThis.process?.env ?? {}) {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const type = request.headers.get('content-type') || '';
  const isJson = type.includes('application/json');
  const isForm = type.includes('application/x-www-form-urlencoded');
  const reply = (status, body) => isForm
    ? new Response(null, { status: 303, headers: { location: status === 200 ? '/contact/#sent' : '/contact/#direct', 'cache-control': 'no-store' } })
    : json(status, body);

  const origin = request.headers.get('origin');
  if (env.SITE_ORIGIN && origin && origin !== new URL(env.SITE_ORIGIN).origin) return reply(403, { error: 'Cross-origin request refused' });
  if (!isJson && !isForm) return json(415, { error: 'Send JSON' });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return reply(413, { error: 'Brief too long' });
  let input;
  try { input = isJson ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw)); } catch { return reply(400, { error: 'Invalid request' }); }
  if (!input || typeof input !== 'object') return reply(400, { error: 'Invalid request' });

  return reply(...await evaluate(input, request, env));
}

export const POST = request => handle(request);
export const GET = () => json(405, { error: 'Method not allowed' });
