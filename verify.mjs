import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist'),errors=[];
async function walk(dir){let all=[];for(const entry of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())all.push(...await walk(full));else all.push(full);}return all;}
const files=await walk(root),htmlFiles=files.filter(f=>f.endsWith('.html'));
const textByFile=new Map(await Promise.all(htmlFiles.map(async f=>[f,await readFile(f,'utf8')])));
let links=0,assets=0;
for(const [file,html] of textByFile){const label=path.relative(root,file);if((html.match(/<h1(?:\s|>)/g)||[]).length!==1)errors.push(label+': must have one h1');if(!html.includes('<main id="main">'))errors.push(label+': main landmark missing');if(!/<title>[^<]+<\/title>/.test(html))errors.push(label+': title missing');if(!/name="description" content="[^\"]+"/.test(html))errors.push(label+': description missing');if(/\[(CONTENT|ASSET|EVIDENCE|PRICING) REQUIRED/.test(html))errors.push(label+': unresolved placeholder');if(/first-of-its-kind|Single-handedly|Most chosen/.test(html))errors.push(label+': unsupported claim');
 const ids=Array.from(html.matchAll(/\bid="([^\"]+)"/g),m=>m[1]);if(new Set(ids).size!==ids.length)errors.push(label+': duplicate ids');
 for(const m of html.matchAll(/\b(href|src)="([^\"]+)"/g)){const url=m[2].replaceAll('&amp;','&');if(!url.startsWith('/')&&!url.startsWith('#'))continue;const u=new URL(url,'https://local.test/'+path.relative(root,file).replaceAll('\\','/'));let dest=path.join(root,decodeURIComponent(u.pathname));try{if((await stat(dest)).isDirectory())dest=path.join(dest,'index.html');await stat(dest);if(m[1]==='href')links++;else assets++;if(u.hash){const body=textByFile.get(dest)||await readFile(dest,'utf8');if(!body.includes('id="'+u.hash.slice(1)+'"'))errors.push(label+': missing anchor '+url);}}catch{errors.push(label+': unresolved '+url);}}
}
const css=await readFile('dist/assets/site.css','utf8');
const js=await readFile('dist/assets/site.js','utf8');
for(const m of css.matchAll(/url\(['"]?(\/[^)'" ]+)/g)){try{await stat(path.join(root,m[1]));}catch{errors.push('CSS: missing '+m[1]);}}
const home=textByFile.get(path.join(root,'index.html'));
if((home.match(/data-fragment=/g)||[]).length!==48)errors.push('Film must have 48 persistent fragments');
if((home.match(/data-scene="/g)||[]).length!==6)errors.push('Film must have six DOM captions');
if(!css.includes('.film:not(.is-enhanced)')||!css.includes('prefers-reduced-motion:reduce'))errors.push('Static/reduced-motion fallback missing');
if(!js.includes("pin:$('.film-sticky'),pinSpacing:false")||!js.includes("trigger:film")||!js.includes('scrub:1.15'))errors.push('GSAP film pin/scrub choreography missing');
if(!js.includes("film.classList.add('gsap-enhanced','is-enhanced')"))errors.push('GSAP film must bypass static presentation styles');
if(!js.includes('Math.min(1,(index+.08)/tl.duration())'))errors.push('GSAP scene rail must navigate across the complete timeline');
if(js.includes('gsap.set(node,pose(0,i))')||!js.includes('rotateX:p.rX')||!js.includes('rotateY:p.rY'))errors.push('Fragment rotations must be applied as valid 3D transform properties');
if(!js.includes('!motion.matches')||!js.includes("!matchMedia('(prefers-reduced-motion: reduce)').matches"))errors.push('Reduced-motion preference must bypass GSAP motion');
if(!js.includes('rotateY:-9')||!js.includes("trigger:hero")||!js.includes('scrub:1.2'))errors.push('Hero camera drift missing');
const contact=textByFile.get(path.join(root,'work-with-me','index.html'));
if(!contact.includes('id="prepare-brief" disabled')||!contact.includes('class="brief-form" inert'))errors.push('Form must fail closed before JS initializes');
if(!contact.includes('<noscript>'))errors.push('No-JS contact route missing');
const manifest=JSON.parse(await readFile('.openai/hosting.json','utf8'));if(!manifest.project_id||manifest.static.directory!=='dist')errors.push('Invalid Sites manifest');
const img=await stat('dist/assets/evidence-sculpture.webp');if(img.size>350000)errors.push('Hero asset exceeds budget');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(JSON.stringify({passed:true,pages:htmlFiles.length,internal_links:links,asset_references:assets,hero_bytes:img.size,total_public_bytes:(await Promise.all(files.map(async f=>(await stat(f)).size))).reduce((a,b)=>a+b,0),checks:['routes and anchors','asset closure','metadata and landmarks','48-node/6-caption GSAP pin/scrub film','3D fragment transforms','hero scroll camera drift','static and reduced-motion fallback','fail-closed enquiry form','unsupported claims and placeholders','hosting manifest']},null,2));
