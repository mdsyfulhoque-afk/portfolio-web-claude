// The darkroom develop: one WebGL2 canvas per film stage draws only the prints that are mid-develop (0 < p < 1).
// Ink (dithered) → colour through a noisy threshold with a thin red "developer" edge. DOM owns p = 0 and p = 1.
const VS = `#version 300 es
in vec2 a; out vec2 v; void main(){ v = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }`;
const FS = `#version 300 es
precision highp float;
uniform sampler2D uInk, uCol; uniform float uP, uSeed, uAspect; uniform vec3 uEdge;
in vec2 v; out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
void main(){
  vec2 uv = vec2(v.x, 1. - v.y);
  vec2 q = uv * vec2(uAspect, 1.);
  float field = uv.x * .62 + n(q * 5. + uSeed) * .28 + n(q * 19. + uSeed * 1.7) * .10;
  float t = uP * 1.12 - .06;
  float ink = smoothstep(t - .035, t + .004, field);
  vec3 c = mix(texture(uCol, uv).rgb, texture(uInk, uv).rgb, ink);
  float edge = 1. - smoothstep(0., .018, abs(field - t));
  o = vec4(mix(c, uEdge, edge * .85), 1.);
}`;

export function createDeveloper(stage) {
  const canvas = document.createElement('canvas');
  canvas.className = 'film-gl'; canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const u = { ink: U('uInk'), col: U('uCol'), p: U('uP'), seed: U('uSeed'), aspect: U('uAspect'), edge: U('uEdge') };
  gl.uniform1i(u.ink, 0); gl.uniform1i(u.col, 1);
  const edge = getComputedStyle(document.documentElement).getPropertyValue('--markup').trim() || '#c8321f';
  const rgb = edge.startsWith('#') ? [1, 3, 5].map(i => parseInt(edge.slice(i, i + 2), 16) / 255) : [0.78, 0.2, 0.12];
  gl.uniform3f(u.edge, ...rgb);
  stage.appendChild(canvas);

  const tex = new WeakMap();
  const upload = img => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    return t;
  };
  const texturesFor = print => {
    if (tex.has(print)) return tex.get(print);
    const ink = print.querySelector('.print__ink'), col = print.querySelector('.print__color');
    if (!ink?.complete || !col?.complete || !ink.naturalWidth || !col.naturalWidth) { col?.setAttribute('loading', 'eager'); ink?.setAttribute('loading', 'eager'); return null; }
    try { const pair = [upload(ink), upload(col)]; tex.set(print, pair); return pair; } catch { tex.set(print, null); return null; }
  };

  let lost = false;
  canvas.addEventListener('webglcontextlost', ev => { ev.preventDefault(); lost = true; canvas.remove(); });

  return {
    get lost() { return lost; },
    // items: [{ el: printFigure, p: 0..1, seed }]
    render(items) {
      if (lost) return false;
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      const sr = stage.getBoundingClientRect();
      const W = Math.round(sr.width * dpr), H = Math.round(sr.height * dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      gl.disable(gl.SCISSOR_TEST); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.enable(gl.SCISSOR_TEST);
      let drew = 0;
      for (const it of items) {
        if (!(it.p > 0.001 && it.p < 0.999)) continue;
        const pair = texturesFor(it.el); if (!pair) continue;
        const r = it.el.querySelector('.print__frame').getBoundingClientRect();
        const x = Math.round((r.left - sr.left) * dpr), y = Math.round((sr.bottom - r.bottom) * dpr), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
        if (w <= 0 || h <= 0 || x > W || y > H || x + w < 0 || y + h < 0) continue;
        gl.viewport(x, y, w, h); gl.scissor(x, y, w, h);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, pair[0]);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, pair[1]);
        gl.uniform1f(u.p, it.p); gl.uniform1f(u.seed, it.seed || 0); gl.uniform1f(u.aspect, r.width / r.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); drew++;
      }
      return drew;
    },
    destroy() { gl.getExtension('WEBGL_lose_context')?.loseContext(); canvas.remove(); }
  };
}
