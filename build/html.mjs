// Escaping and tiny HTML helpers. Every visible string passes through e() unless it is authored markup.
export const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const attrs = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => v === true ? ` ${k}` : ` ${k}="${e(v)}"`).join('');
export const arr = '<span class="arr" aria-hidden="true">→</span>';
export const pad = (n, w = 2) => String(n).padStart(w, '0');
export const json = o => JSON.stringify(o).replace(/</g, '\\u003c');
