import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('apps/web/src');
const walk = (dir) => fs.readdirSync(dir,{withFileTypes:true}).flatMap((e)=>{
  const p=path.join(dir,e.name); return e.isDirectory()?walk(p):[p];
});
const files=walk(root);
const jsx=files.filter((p)=>p.endsWith('.jsx'));
const modules=files.filter((p)=>p.endsWith('.module.css'));
const globalCss=files.filter((p)=>p.endsWith('.css')&&!p.endsWith('.module.css'));
const violations=[];
for(const file of jsx){
  const src=fs.readFileSync(file,'utf8');
  const hasRenderedClass=/className\s*=/.test(src);
  const importsModule=/from\s+['"][^'"]+\.module\.css['"]/.test(src);
  const rawLiteral=/<[A-Za-z][^>]*\sclassName\s*=\s*['"]/.test(src);
  if(hasRenderedClass && !importsModule) violations.push(`${path.relative(root,file)}: usa className sin CSS Module`);
  if(rawLiteral) violations.push(`${path.relative(root,file)}: contiene className literal`);
  if(path.basename(file)!=='main.jsx' && /import\s+['"][^'"]+\.css['"]/.test(src) && !/\.module\.css/.test(src)) violations.push(`${path.relative(root,file)}: importa CSS global directamente`);
}
console.log(`React/CSS Modules v21 audit`);
console.log(`JSX: ${jsx.length}`);
console.log(`CSS Modules: ${modules.length}`);
console.log(`CSS global de foundation/theme: ${globalCss.length}`);
if(violations.length){ console.error(`FAIL (${violations.length})`); violations.forEach(v=>console.error(`- ${v}`)); process.exit(1); }
console.log('PASS: componentes/páginas React no dependen de className global literal ni importan CSS global directamente.');
