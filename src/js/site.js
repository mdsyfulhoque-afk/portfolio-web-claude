// Syful Hoque — site runtime. Progressive enhancement only: every page is complete without this file.
const d = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable: per-visitor convenience only */ } }
};
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const tier = () => d.dataset.motion || 'static';

/* ---------- Theme: system → dark → light ---------- */
function themeLabel() {
  const t = d.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  $$('[data-theme-toggle] span').forEach(s => { s.textContent = t === 'dark' ? 'Night' : 'Paper'; });
}
$$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
  const current = d.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  d.dataset.theme = next; store.set('theme', next); themeLabel();
}));
themeLabel();

/* ---------- Mobile menu ---------- */
const menuBtn = $('.menu-toggle'), mobileNav = $('#mobile-nav');
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true';
  menuBtn.setAttribute('aria-expanded', String(open)); mobileNav.hidden = !open; menuBtn.textContent = open ? 'Close' : 'Menu';
});
addEventListener('keydown', ev => { if (ev.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') { menuBtn.click(); menuBtn.focus(); } });

/* ---------- Chrome height → scroll padding & sticky offsets ---------- */
const chrome = $('#chrome');
const setChrome = () => d.style.setProperty('--chrome-h', `${chrome?.offsetHeight || 96}px`);
setChrome(); addEventListener('resize', setChrome, { passive: true });

/* ---------- FormulaBar: provenance of whatever claim is in focus ---------- */
const bar = $('[data-fx-bar]');
const fxRef = $('[data-fx-ref]'), fxFormula = $('[data-fx-formula]'), fxStatus = $('[data-fx-status]'), fxLive = $('[data-fx-live]');
const FX_DEFAULT = { ref: fxRef?.textContent, formula: fxFormula?.textContent, status: 'Method' };
let fxTimer = 0, fxLast = '';
export function setFx(el) {
  if (!bar) return;
  const next = el ? { ref: el.dataset.fx, formula: `=SOURCE("${el.dataset.fxSrc}") → ${el.dataset.fxValue} · ${el.dataset.fxClaim}`, status: 'Verified' } : FX_DEFAULT;
  const key = next.ref + next.formula;
  if (key === fxLast) return;
  fxLast = key;
  clearTimeout(fxTimer);
  bar.classList.add('is-swapping');
  fxTimer = setTimeout(() => {
    fxRef.textContent = next.ref; fxFormula.textContent = next.formula; fxStatus.textContent = next.status;
    bar.classList.remove('is-swapping');
    if (el && fxLive) fxLive.textContent = `${next.ref}: ${el.dataset.fxClaim}, ${el.dataset.fxValue}. Source: ${el.dataset.fxSrc}.`;
  }, 90);
}
window.__setFx = setFx;
let fxHoverEl = null;
document.addEventListener('pointerover', ev => { const el = ev.target.closest?.('[data-fx]'); if (el && el !== fxHoverEl && !el.matches('.beat')) { fxHoverEl = el; setFx(el); } }, { passive: true });
document.addEventListener('focusin', ev => { const el = ev.target.closest?.('[data-fx]'); if (el && !el.matches('.beat')) setFx(el); });

/* ---------- Doors: remember the visitor's side of the table ---------- */
const DOORS = { multilateral: 'Check availability for a TOR', government: 'Discuss a feasibility study', firm: 'Propose me as key expert', private: 'Get a bankability read', research: 'Commission a study' };
function applyDoor(id) {
  if (!DOORS[id]) return;
  $$('[data-door]').forEach(a => { if (a.dataset.door === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  $$('[data-door-cta]').forEach(a => {
    if (a.closest('.header')) return; // keep the header CTA short
    a.firstChild.textContent = DOORS[id] + ' ';
    a.href = `/contact/?intent=${id}`;
  });
}
$$('[data-door]').forEach(a => a.addEventListener('click', () => store.set('door', a.dataset.door)));
applyDoor(store.get('door'));

/* ---------- Sheet tabs (service families) ---------- */
$$('.sheet-tabs').forEach(list => {
  const tabs = $$('[role="tab"]', list);
  const select = t => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls'))?.classList.toggle('is-active', on); });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', ev => {
      const k = ev.key, n = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
      if (n === null) return; ev.preventDefault(); const t2 = tabs[(n + tabs.length) % tabs.length]; select(t2); t2.focus();
    });
  });
});

/* ---------- Hero: the loupe develops whatever print it passes over ---------- */
const table = $('[data-table]');
if (table && finePointer && tier() !== 'static' && tier() !== 'lite' && innerWidth >= 960) {
  const loupe = $('[data-loupe]'), label = $('[data-loupe-label]');
  const prints = $$('.print', table).filter(p => !p.classList.contains('is-developed'));
  const R = 90;
  let loaded = false, raf = 0, mx = 0, my = 0, inside = false;
  const loadColour = () => {
    if (loaded) return; loaded = true;
    $$('img[data-src]', table).forEach(img => { img.srcset = img.dataset.srcset; img.src = img.dataset.src; img.removeAttribute('data-src'); });
  };
  const frame = () => {
    raf = 0;
    const tr = table.getBoundingClientRect();
    loupe.style.setProperty('--lx', `${mx - tr.left}px`); loupe.style.setProperty('--ly', `${my - tr.top}px`);
    let over = null;
    for (const p of prints) {
      const img = p.querySelector('.print__color'); if (!img) continue;
      const r = img.getBoundingClientRect();
      // Local pointer position in the image's own (unrotated) box — close enough for small rotations.
      img.style.setProperty('--lmx', `${mx - r.left}px`); img.style.setProperty('--lmy', `${my - r.top}px`);
      img.style.setProperty('--lr', inside ? `${R}px` : '0px');
      if (inside && mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom) over = p;
    }
    label.textContent = over ? over.dataset.cap : 'The light table';
  };
  table.addEventListener('pointerenter', () => { inside = true; loadColour(); d.classList.add('has-loupe'); loupe.classList.add('is-on'); });
  table.addEventListener('pointerleave', () => { inside = false; loupe.classList.remove('is-on'); if (!raf) raf = requestAnimationFrame(frame); });
  table.addEventListener('pointermove', ev => { mx = ev.clientX; my = ev.clientY; if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
}

/* ---------- Work board: filters + Grid/List ---------- */
const board = $('[data-board]');
if (board) {
  const params = new URLSearchParams(location.search);
  const selects = $$('[data-filter]', board);
  const items = () => [...$$('.grid-view [data-row]', board), ...$$('.list-view [data-row]', board)];
  const count = $('[data-count]', board), empty = $('[data-empty]', board);
  const total = $$('.grid-view [data-row]', board).length;
  selects.forEach(s => { const v = params.get(s.dataset.filter); if (v) s.value = v; });
  function apply() {
    const f = Object.fromEntries(selects.map(s => [s.dataset.filter, s.value]));
    let shown = 0;
    for (const el of items()) {
      const p = el.dataset.pillars;
      const ok = (!f.family || el.dataset.families.split(' ').includes(f.family))
        && (!f.pillar || (f.pillar === 'all' ? p === 'ffff' : p[+f.pillar] === 'f'))
        && (!f.client || el.dataset.client === f.client) && (!f.market || el.dataset.market === f.market) && (!f.role || el.dataset.role === f.role);
      el.hidden = !ok; if (ok && el.closest('.grid-view')) shown++;
    }
    count.textContent = `${shown} of ${total} records`; empty.hidden = shown > 0;
    const q = new URLSearchParams(); Object.entries(f).forEach(([k, v]) => v && q.set(k, v)); const view = board.dataset.view; if (view === 'list') q.set('view', 'list');
    history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
  }
  selects.forEach(s => s.addEventListener('change', apply));
  const setView = v => {
    board.dataset.view = v;
    $$('[data-view]', board).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    $$('[data-view-panel]', board).forEach(p => { p.hidden = p.dataset.viewPanel !== v; });
    apply();
  };
  $$('[data-view]', board).forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  setView(params.get('view') === 'list' ? 'list' : 'grid');
}

/* ---------- Contact: send via the site's endpoint when configured; otherwise hand off to email/WhatsApp ---------- */
const form = $('#brief');
if (form) {
  const q = new URLSearchParams(location.search);
  const intent = q.get('intent') || store.get('door');
  if (intent) { const r = form.querySelector(`input[name="intent"][value="${CSS.escape(intent)}"]`); if (r) r.checked = true; }
  const svc = q.get('service'); if (svc) { const s = form.querySelector('select[name="service"]'); const opt = [...s.options].find(o => o.text.toLowerCase().includes(svc.toLowerCase().split(' ')[0])); if (opt) s.value = opt.value; }
  const status = $('[data-status]', form), fallback = $('[data-fallback]', form), submit = $('[data-submit]', form);
  const started = Date.now();
  const briefText = data => [
    `Brief for Syful Hoque`, ``, `From: ${data.name} — ${data.organisation}`, `Email: ${data.email}`,
    `Reaching out as: ${form.querySelector('input[name="intent"]:checked')?.nextElementSibling?.textContent || data.intent}`,
    `Service: ${data.service}`, `Timing: ${data.timing}`, data.link ? `TOR / document: ${data.link}` : null, ``, data.brief
  ].filter(x => x !== null).join('\n');
  function showFallback(data) {
    const text = briefText(data);
    $('[data-brief-text]', fallback).textContent = text;
    const mail = $('[data-mailto]', fallback);
    const body = text.length > 1800 ? text.slice(0, 1780) + '\n[…truncated — full brief copied to clipboard]' : text;
    mail.href = `${mail.href.split('?')[0]}?subject=${encodeURIComponent('Brief: ' + data.service + ' — ' + data.organisation)}&body=${encodeURIComponent(body)}`;
    const wa = $('[data-wa]', fallback); wa.href = `${wa.href.split('?')[0]}?text=${encodeURIComponent(body)}`;
    fallback.hidden = false; fallback.focus();
    status.dataset.state = ''; status.textContent = 'Review your brief below and send it from your own app.';
  }
  $('[data-copy]', form)?.addEventListener('click', async ev => {
    const text = $('[data-brief-text]', fallback).textContent;
    try { await navigator.clipboard.writeText(text); ev.target.textContent = 'Copied'; setTimeout(() => { ev.target.textContent = 'Copy'; }, 2000); }
    catch { const r = document.createRange(); r.selectNodeContents($('[data-brief-text]', fallback)); getSelection().removeAllRanges(); getSelection().addRange(r); }
  });
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); status.dataset.state = 'error'; status.textContent = 'Please complete the highlighted fields.'; return; }
    const data = Object.fromEntries(new FormData(form));
    if (data.website) return; // honeypot
    data.elapsed = Date.now() - started;
    submit.setAttribute('aria-busy', 'true'); status.dataset.state = ''; status.textContent = 'Sending…';
    try {
      const res = await fetch('/api/enquiry', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) { status.dataset.state = 'sent'; status.textContent = 'Sent. A reply will come to the email address you gave.'; form.reset(); }
      else if (out.fallback || res.status === 404 || res.status === 405 || res.status >= 500) showFallback(data);
      else { status.dataset.state = 'error'; status.textContent = out.error || 'The brief could not be sent. Try again, or email directly.'; }
    } catch { showFallback(data); }
    finally { submit.removeAttribute('aria-busy'); }
  });
}

/* ---------- The film: pinned stage on capable desktops; readable stack everywhere else ---------- */
const film = $('[data-film]');
if (film) {
  const capable = () => (tier() === 'webgl' || tier() === 'dom') && innerWidth >= 960 && innerHeight >= 620;
  const start = () => { if (capable() && window.gsap && window.ScrollTrigger) import('./film.js').then(m => m.init(film, { gl: tier() === 'webgl', setFx }).catch(err => { console.warn('[film] static fallback:', err); m.rollback(film); })).catch(err => console.warn('[film] module unavailable:', err)); };
  if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { if (e.matches) location.reload(); });
}
