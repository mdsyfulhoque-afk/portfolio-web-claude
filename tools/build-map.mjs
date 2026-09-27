// Optional authoring tool: projects the ADB TA 10103-REG 10-country scope to static SVG path data.
// Run: cd tools && npm install && npm run map   → writes ../content/map-scope.json (committed).
import { readFile, writeFile } from 'node:fs/promises';
import { geoConicEqualArea, geoPath, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';

const topo = JSON.parse(await readFile(new URL('./node_modules/world-atlas/countries-50m.json', import.meta.url), 'utf8'));
const all = feature(topo, topo.objects.countries).features;
const coarseTopo = JSON.parse(await readFile(new URL('./node_modules/world-atlas/countries-110m.json', import.meta.url), 'utf8'));
const coarse = feature(coarseTopo, coarseTopo.objects.countries).features;
// ISO 3166-1 numeric ids — select by id, never by name (the atlas says Kyrgyzstan/Laos).
const SCOPE = { '050': 'Bangladesh', '116': 'Cambodia', '398': 'Kazakhstan', '417': 'Kyrgyz Republic', '418': 'Lao PDR', '462': 'Maldives', '496': 'Mongolia', '524': 'Nepal', '762': 'Tajikistan', '860': 'Uzbekistan' };
const W = 800, H = 560;
const scope = all.filter(f => SCOPE[f.id]);
const frame = { type: 'FeatureCollection', features: scope };
const projection = geoConicEqualArea().parallels([10, 45]).rotate([-88, 0]).fitExtent([[24, 24], [W - 24, H - 24]], frame);
const path = geoPath(projection);
const r = n => Math.round(n * 10) / 10;
const simplify = d => d.replace(/(\d+)\.(\d)\d*/g, '$1.$2');
const context = coarse.filter(f => { const b = path.bounds(f); return b[1][0] > -40 && b[0][0] < W + 40 && b[1][1] > -40 && b[0][1] < H + 40 && !SCOPE[f.id]; })
  .map(f => simplify(path(f) || '')).filter(Boolean);
const countries = scope.map(f => { const [cx, cy] = projection(geoCentroid(f)); return { id: f.id, name: SCOPE[f.id], d: simplify(path(f) || ''), cx: r(cx), cy: r(cy) }; });
const [dx, dy] = projection([90.4125, 23.8103]);
await writeFile(new URL('../content/map-scope.json', import.meta.url), JSON.stringify({ width: W, height: H, source: 'Natural Earth via world-atlas@2 countries-50m; projection conic equal-area', dhaka: [r(dx), r(dy)], countries, context }, null, 0));
console.log('countries', countries.map(c => `${c.name} ${c.d.length}`).join(', '), '| context', context.length);
