// "Show your working" — the pinned film. One ScrollTrigger scrubs one master timeline; beats are labelled segments.
// Everything here is additive: without it the film is a readable stack of beats in their final state.
import { createDeveloper } from './develop-gl.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

export function rollback(stage) {
  const html = document.documentElement;
  window.ScrollTrigger?.getAll().forEach(t => t.kill(true));
  html.classList.remove('film-pin', 'film-live', 'film-gl-on');
  stage.querySelector('.film-gl')?.remove();
  stage.querySelectorAll('.beat, .beat__text, .beat__visual, .beat *').forEach(el => { el.style.removeProperty('opacity'); el.style.removeProperty('transform'); el.style.removeProperty('translate'); el.style.removeProperty('scale'); el.style.removeProperty('filter'); });
  stage.querySelectorAll('.beat .print').forEach(p => { p.classList.add('is-developed'); p.classList.remove('is-developing'); p.style.removeProperty('--p'); });
  stage.querySelectorAll('.mark-draw').forEach(m => m.style.removeProperty('--draw'));
}

export async function init(stage, { gl, setFx }) {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const html = document.documentElement;
  const beats = [...stage.querySelectorAll('.beat')];
  const rail = [...stage.querySelectorAll('[data-beat-jump]')];
  const readout = stage.querySelector('[data-readout]');
  const chromeH = () => document.getElementById('chrome')?.offsetHeight || 96;

  // Inline the map (so countries can light up) before the timeline is built.
  const mapBox = stage.querySelector('[data-map]');
  if (mapBox) {
    try {
      const txt = await (await fetch('/assets/map-scope.svg')).text();
      const svg = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
      svg.querySelector('style')?.remove(); svg.querySelector('rect')?.remove();
      svg.removeAttribute('width'); svg.removeAttribute('height'); svg.setAttribute('aria-hidden', 'true');
      mapBox.querySelector('img').replaceWith(document.importNode(svg, true));
    } catch { /* keep the static image */ }
  }

  html.classList.add('film-pin', 'film-live');
  const prints = [...stage.querySelectorAll('.beat .print')];
  const state = new Map(prints.map((p, i) => [p, { el: p, p: 0, seed: i * 3.7 + 1 }]));
  const setP = (el, v) => {
    const s = state.get(el); if (!s) return;
    s.p = v; el.style.setProperty('--p', v.toFixed(4));
    el.classList.toggle('is-developing', v > 0.001 && v < 0.999);
  };
  prints.forEach(p => { p.classList.remove('is-developed'); setP(p, 0); });
  const dev = gl ? (() => { try { return createDeveloper(stage); } catch (e) { console.warn('[film] WebGL develop unavailable', e); return null; } })() : null;
  if (dev) html.classList.add('film-gl-on');

  let strip, stripWin, stripLine, stripPrints = [];
  let active = -1;
  const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });
  const develop = (el, at, dur) => { const o = { p: 0 }; tl.to(o, { p: 1, duration: dur, onUpdate: () => setP(el, o.p) }, at); };

  beats.forEach((b, i) => {
    const t0 = i;
    tl.addLabel(`b${i + 1}`, t0);
    const text = b.querySelector('.beat__text'), vis = b.querySelector('.beat__visual');
    if (i === 0) gsap.set(b, { opacity: 1 });
    else {
      tl.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.1 }, t0 - 0.06)
        .fromTo(text, { y: 28 }, { y: 0, duration: 0.16, ease: 'power2.out' }, t0 - 0.06)
        .fromTo(vis, { y: 40 }, { y: 0, duration: 0.18, ease: 'power2.out' }, t0 - 0.05);
    }
    if (i < beats.length - 1) tl.to(b, { opacity: 0, duration: 0.1 }, t0 + 0.93);
    const n = +b.dataset.beat;
    if (n === 1) beatResearch(b, t0);
    if (n === 2) beatData(b, t0);
    if (n === 3) beatTechnology(b, t0);
    if (n === 4) beatEconomics(b, t0);
    if (n === 5) beatDecision(b, t0);
    if (n === 6) beatPackage(b, t0);
    if (n === 7) beatBoard(b, t0);
  });
  tl.set({}, {}, beats.length - 0.02);

  // --- 01 Research: a filmstrip crosses the developing line; each print develops as it crosses.
  function beatResearch(b, t0) {
    strip = b.querySelector('[data-strip]'); stripWin = b.querySelector('.strip-window'); stripLine = b.querySelector('.develop-line');
    stripPrints = [...strip.querySelectorAll('.print')];
    tl.fromTo(strip, { x: () => stripWin.clientWidth * 0.56 }, { x: () => -(strip.scrollWidth - stripWin.clientWidth * 0.42), duration: 0.86, immediateRender: true }, t0 + 0.04);
    const ring = b.querySelector('.mark-draw');
    if (ring) tl.fromTo(ring, { '--draw': 0 }, { '--draw': 1, duration: 0.14 }, t0 + 0.3);
    const note = b.querySelector('.print__note');
    if (note) tl.fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.06 }, t0 + 0.4);
  }
  function syncStrip() {
    if (!stripLine) return;
    const lx = stripLine.getBoundingClientRect().left;
    for (const p of stripPrints) { const r = p.querySelector('.print__frame').getBoundingClientRect(); setP(p, clamp((lx - r.left) / r.width)); }
  }

  // --- 02 Data stories: the numeral "528" as a halftone; its dots become 528 equal squares — 400 firms, 120 KIIs, 8 FGDs.
  function beatData(b, t0) {
    const cv = b.querySelector('[data-halftone-canvas]'); if (!cv) return;
    const c2 = cv.getContext('2d');
    const cov = new Float32Array(528).fill(0);
    const colours = { evidence: cssVar('--evidence'), ink: cssVar('--ink'), markup: cssVar('--markup'), grid: cssVar('--grid') };
    const off = document.createElement('canvas'); off.width = 330; off.height = 160;
    const o = off.getContext('2d');
    const measure = () => {
      o.clearRect(0, 0, 330, 160); o.fillStyle = '#000'; o.textAlign = 'center'; o.textBaseline = 'middle';
      o.font = `600 150px ${cssVar('--font-mono') || 'monospace'}`; o.fillText('528', 165, 88);
      const px = o.getImageData(0, 0, 330, 160).data;
      for (let n = 0; n < 528; n++) {
        const cx = (n % 33) * 10, cy = Math.floor(n / 33) * 10; let a = 0;
        for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) a += px[((cy + y) * 330 + cx + x) * 4 + 3];
        cov[n] = a / (100 * 255);
      }
    };
    measure(); document.fonts?.ready.then(() => { measure(); draw(proxy.q); });
    const proxy = { q: 0 };
    const counter = b.querySelector('[data-count]');
    function draw(q) {
      const w = cv.clientWidth; if (!w) return;
      const dpr = Math.min(devicePixelRatio || 1, 2), W = Math.round(w * dpr), H = Math.round(w * 16 / 33 * dpr);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      const cell = W / 33, e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
      c2.clearRect(0, 0, W, H);
      for (let n = 0; n < 528; n++) {
        const col = n % 33, row = Math.floor(n / 33);
        const target = cov[n] > 0.05 ? cov[n] : 0.06;
        const s = cell * (0.08 + 0.74 * (target + (1 - target) * e));
        c2.fillStyle = e < 0.45 ? colours.ink : (n < 400 ? colours.evidence : n < 520 ? colours.ink : colours.markup);
        c2.globalAlpha = e < 0.45 ? 0.25 + 0.75 * Math.max(target, e * 1.8) : 1;
        c2.fillRect(col * cell + (cell - s) / 2, row * cell + (cell - s) / 2, s, s);
      }
      c2.globalAlpha = 1;
      if (counter) counter.textContent = String(Math.round(528 * clamp((q - 0.3) / 0.55)));
    }
    tl.to(proxy, { q: 1, duration: 0.7, onUpdate: () => draw(proxy.q) }, t0 + 0.1);
    draw(0);
    if (counter) counter.textContent = '528';
    addEventListener('resize', () => draw(proxy.q), { passive: true });
  }

  // --- 03 Technology: three prints develop in turn; the red pencil underlines the banner.
  function beatTechnology(b, t0) {
    const ps = [...b.querySelectorAll('.board .print')];
    ps.forEach((p, i) => develop(p, t0 + 0.08 + i * 0.2, 0.28));
    const line = b.querySelector('.mark-draw');
    if (line) tl.fromTo(line, { '--draw': 0 }, { '--draw': 1, duration: 0.12 }, t0 + 0.34);
    const note = b.querySelector('.print__note');
    if (note) tl.fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.06 }, t0 + 0.44);
  }

  // --- 04 Economics: bars rise, then discounting at r = 0 → 12% (illustrative) shrinks later years.
  function beatEconomics(b, t0) {
    const bars = [...b.querySelectorAll('.bars i')];
    const rateEl = b.querySelector('[data-rate]'), npvEl = b.querySelector('[data-npv]');
    const nets = [...b.querySelectorAll('.cf .out')].map(s => parseFloat(s.textContent) || 0);
    tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.2, stagger: 0.008, ease: 'power2.out' }, t0 + 0.06);
    const r = { v: 0 };
    const upd = () => {
      bars.forEach(bar => { const t = +bar.dataset.t; bar.style.setProperty('--d', (1 / Math.pow(1 + r.v, t)).toFixed(4)); });
      if (rateEl) rateEl.textContent = `${(r.v * 100).toFixed(1)}%`;
      if (npvEl && nets.length) npvEl.textContent = nets.reduce((s, x, t) => s + x / Math.pow(1 + r.v, t), 0).toFixed(1);
    };
    tl.to(r, { v: 0.12, duration: 0.5, onUpdate: upd }, t0 + 0.32);
    upd();
  }

  // --- 05 Decision: the conference, then the camera closes on his real nameplate and hands over to live type.
  function beatDecision(b, t0) {
    const A = b.querySelector('[data-zoom-a]'), B = b.querySelector('[data-zoom-b]'), np = b.querySelector('[data-nameplate]');
    const imgA = A.querySelector('img'), imgB = B.querySelector('img'), dot = np.querySelector('.nameplate__dot');
    const capA = b.querySelector('[data-cap-a]'), capB = b.querySelector('[data-cap-b]');
    // Push toward the photographed name plate (--fx/--fy) and bring it to centre, where the live plate lands.
    const focus = k => (parseFloat(getComputedStyle(imgB).getPropertyValue(k)) || 50) / 100;
    gsap.set(A, { opacity: 1 }); gsap.set(B, { opacity: 0 }); gsap.set(np, { opacity: 0 });
    if (capA && capB) { gsap.set(capB, { opacity: 0 }); tl.to(capA, { opacity: 0, duration: 0.06 }, t0 + 0.32).fromTo(capB, { opacity: 0 }, { opacity: 1, duration: 0.06 }, t0 + 0.34); }
    tl.fromTo(imgA, { scale: 1 }, { scale: 1.16, duration: 0.4 }, t0)
      .to(A, { opacity: 0, duration: 0.1 }, t0 + 0.32)
      .fromTo(B, { opacity: 0 }, { opacity: 1, duration: 0.1 }, t0 + 0.3)
      .fromTo(imgB, { scale: 1, x: 0, y: 0 }, { scale: 3.1, x: () => (0.5 - focus('--fx')) * imgB.clientWidth, y: () => (0.5 - focus('--fy')) * imgB.clientHeight, duration: 0.4, ease: 'power1.in' }, t0 + 0.34)
      .fromTo(imgB, { filter: 'grayscale(0) contrast(1)' }, { filter: 'grayscale(1) contrast(1.5)', duration: 0.1 }, t0 + 0.66)
      .to(B, { opacity: 0.3, duration: 0.1 }, t0 + 0.7)
      .fromTo(np, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.12, ease: 'back.out(1.7)' }, t0 + 0.7)
      .fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.06, ease: 'back.out(3)' }, t0 + 0.82);
  }

  // --- 06 Package: the documents stack up; the ten countries of the TA scope light up; Dhaka marked.
  function beatPackage(b, t0) {
    tl.fromTo(b.querySelectorAll('.doc'), { x: -26, opacity: 0 }, { x: 0, opacity: 1, duration: 0.12, stagger: 0.05, ease: 'power2.out' }, t0 + 0.06);
    const scope = b.querySelectorAll('.map .scope'), dhaka = b.querySelector('.map .dhaka');
    if (scope.length) tl.fromTo(scope, { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.08, stagger: 0.035 }, t0 + 0.3);
    if (dhaka) tl.fromTo(dhaka, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.06, ease: 'back.out(3)' }, t0 + 0.72);
  }

  // --- 07 Board: the record assembles as a dataset.
  function beatBoard(b, t0) {
    tl.fromTo(b.querySelectorAll('.matrix tbody tr'), { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.1, stagger: 0.03, ease: 'power2.out' }, t0 + 0.06)
      .fromTo(b.querySelectorAll('.matrix td.m i'), { scale: 0 }, { scale: 1, duration: 0.05, stagger: 0.004, ease: 'back.out(2)' }, t0 + 0.24);
  }

  // --- Sync: active beat, rail, readout, FormulaBar, develop-by-position, WebGL.
  function sync() {
    const time = tl.time();
    const idx = clamp(Math.floor(time + 0.04), 0, beats.length - 1);
    if (idx !== active) {
      active = idx;
      beats.forEach((b, i) => b.classList.toggle('is-active', i === idx));
      rail.forEach((r, i) => { if (i === idx) r.setAttribute('aria-current', 'step'); else r.removeAttribute('aria-current'); });
      if (readout) readout.textContent = String(idx + 1).padStart(2, '0');
      setFx(beats[idx]);
    }
    rail.forEach((r, i) => r.querySelector('i').style.setProperty('--fill', clamp(time - i).toFixed(3)));
    if (active === 0) syncStrip();
    if (dev && !dev.lost) {
      const items = [...state.values()].filter(s => beats[active].contains(s.el));
      dev.render(items);
    }
  }
  tl.eventCallback('onUpdate', sync);

  const st = ScrollTrigger.create({
    trigger: stage, start: () => `top top+=${chromeH()}`, end: () => `+=${Math.round(innerHeight * 6.2)}`,
    pin: true, scrub: 0.6, animation: tl, invalidateOnRefresh: true, anticipatePin: 1
  });
  sync();

  const jumpTo = (i, smooth = true) => {
    const lab = tl.labels[`b${i}`] ?? 0;
    const top = st.start + ((lab + 0.5) / tl.duration()) * (st.end - st.start);
    scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  };
  rail.forEach(r => r.addEventListener('click', () => jumpTo(+r.dataset.beatJump)));
  // Keyboard users: focusing into a beat that is not showing brings it on stage.
  stage.addEventListener('focusin', ev => { const b = ev.target.closest('.beat'); if (b && !b.classList.contains('is-active')) jumpTo(beats.indexOf(b) + 1, false); });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  return { tl, st };
}
