import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const src=path.join(root,'apps/web/src');
const failures=[]; const notes=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const web=JSON.parse(read('apps/web/package.json'));
const api=JSON.parse(read('apps/api/package.json'));
if(!(pkg.version===web.version && web.version===api.version)) failures.push(`Versiones root/web/api no están sincronizadas: ${pkg.version} / ${web.version} / ${api.version}`);
const main=read('apps/web/src/main.jsx');
if(!main.includes("./design-system/styles/foundation.css")) failures.push('main.jsx no usa foundation.css');
const globalImports=[...main.matchAll(/import\s+['\"](.+\.css)['\"]/g)].map(x=>x[1]);
if(globalImports.length!==1) failures.push(`main.jsx contiene ${globalImports.length} imports CSS globales; esperado 1`);
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);e.isDirectory()?walk(p,out):out.push(p)}return out}
const jsx=walk(src).filter(p=>/\.(jsx|js)$/.test(p));
let directApi=[];
for(const p of jsx){const rel=path.relative(src,p).replaceAll('\\','/'); if(!rel.startsWith('modules/')) continue; const t=fs.readFileSync(p,'utf8'); if(/from\s+['\"][^'\"]*(api\/client|services\/api|lib\/api)['\"]/.test(t)) directApi.push(rel)}
if(directApi.length) failures.push(`Módulos con acceso API global directo: ${directApi.join(', ')}`);
const large=jsx.map(p=>({p:path.relative(src,p).replaceAll('\\','/'),n:fs.readFileSync(p,'utf8').split(/\r?\n/).length})).filter(x=>x.n>700).sort((a,b)=>b.n-a.n);
notes.push(`${jsx.length} archivos JS/JSX revisados`);
notes.push(`${large.length} pantallas >700 líneas identificadas para refactor incremental post-RC`);
console.log('BuzzBee v22.1 Final Release Gate');
console.log('--------------------------------');
for(const n of notes) console.log('INFO',n);
if(failures.length){for(const f of failures) console.error('FAIL',f); process.exit(1)}
console.log('PASS Global CSS centralizado');
console.log('PASS Versiones sincronizadas');
console.log('PASS Domain/API boundary');
console.log('PASS Final static release gate');
