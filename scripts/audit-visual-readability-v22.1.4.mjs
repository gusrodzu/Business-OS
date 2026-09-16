import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root,'apps','web','src');
const problems=[];
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk(src);
const jsx=files.filter(f=>/\.(jsx|js)$/.test(f));
const css=files.filter(f=>/\.css$/.test(f));

for(const f of jsx){
  const s=fs.readFileSync(f,'utf8');
  const dup=[...s.matchAll(/([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ]{2,})\s*[·|]\s*\1/g)];
  if(dup.length) problems.push(`Etiqueta duplicada: ${path.relative(root,f)}`);
  if(/[ÃÂ][\x80-\xBF]|â€|ðŸ/.test(s)) problems.push(`Texto mojibake: ${path.relative(root,f)}`);
}
// v22 is superseded and known to contain broad substring selectors that caused header regressions.
const foundation=fs.readFileSync(path.join(src,'design-system','styles','foundation.css'),'utf8');
if(foundation.includes("buzzbee-visual-v22.css")) problems.push('foundation.css todavía importa buzzbee-visual-v22.css');
if(!foundation.includes("readability-v24.css")) problems.push('Falta readability-v24.css en foundation.css');
const pageHeader=fs.readFileSync(path.join(src,'design-system','components','PageHeader.module.css'),'utf8');
for(const token of ['flex-direction:column','text-wrap:balance','max-width:72ch']) if(!pageHeader.includes(token)) problems.push(`PageHeader sin regla: ${token}`);

console.log('BuzzBee visual/readability audit v22.1.4');
console.log(`JS/JSX revisados: ${jsx.length}`);
console.log(`CSS revisados: ${css.length}`);
if(problems.length){console.error(`FAIL · ${problems.length} hallazgos`); for(const p of problems) console.error(`- ${p}`); process.exit(1);}
console.log('PASS · jerarquía, lectura y guardrails visuales');
