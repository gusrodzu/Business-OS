import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const main=fs.readFileSync(path.join(root,'apps/web/src/main.jsx'),'utf8');
const platformJsx=fs.readFileSync(path.join(root,'apps/web/src/modules/platform/ui/pages/PlatformAdmin.jsx'),'utf8');
const platformCss=fs.readFileSync(path.join(root,'apps/web/src/modules/platform/ui/pages/PlatformAdmin.module.css'),'utf8');
const stylesDir=path.join(root,'apps/web/src/design-system/styles');
const legacy=['interface-v9.css','global-ui-v10.5.css','global-ui-v12.3.css','global-ui-v13.css'];
const checks=[];
const add=(name,ok,detail='')=>checks.push({name,ok,detail});
for(const f of legacy){
  add(`Legacy CSS disabled from runtime: ${f}`, fs.existsSync(path.join(stylesDir,f)) && !main.includes(f));
}
add('Platform uses canonical DataTable', platformJsx.includes("import {DataTable}") && platformJsx.includes('<DataTable'));
add('No legacy tableWrap in PlatformAdmin JSX', !platformJsx.includes('styles.tableWrap'));
add('Platform table styles are scoped', platformCss.includes('.embeddedTable table') && !/(^|})table\s*\{/m.test(platformCss));
add('No naked th rule in PlatformAdmin CSS', !/(^|})th\s*\{/m.test(platformCss));
add('No naked td rule in PlatformAdmin CSS', !/(^|})td\s*\{/m.test(platformCss));
const pass=checks.filter(x=>x.ok).length;
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'}  ${c.name}${c.detail?` · ${c.detail}`:''}`);
console.log(`\n${pass}/${checks.length} PASS`);
if(pass!==checks.length) process.exit(1);
