import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const checks=[]; const check=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});
const components=['Button','Input','Select','Switch','Checkbox','Card','Badge','Chip','Tabs','Dialog','Drawer','Snackbar','DataTable'];
for(const c of components){check(`Componente MD3 ${c}`,exists(`apps/web/src/design-system/components/${c}.jsx`)&&exists(`apps/web/src/design-system/components/${c}.module.css`));}
const idx=read('apps/web/src/design-system/components/index.js');
for(const c of components) check(`Export ${c}`,idx.includes(`{${c}}`));
const rollout=read('apps/web/src/design-system/styles/md3-full-rollout.css');
check('Contrato visual por módulo',rollout.includes('[data-md3-module]'));
check('Tablas globales MD3',rollout.includes('table th')&&rollout.includes('--md-sys-color-surface-container-low'));
check('Reduced motion',rollout.includes('prefers-reduced-motion'));
check('More contrast',rollout.includes('prefers-contrast:more'));
const main=read('apps/web/src/main.jsx'); check('Rollout importado globalmente',main.includes("md3-full-rollout.css"));
const appShell=read('apps/web/src/layout/AppShell.jsx'); check('AppShell etiqueta módulo',appShell.includes('data-md3-module={moduleKey}'));
const platformShell=read('apps/web/src/layout/PlatformShell.jsx'); check('PlatformShell etiquetado',platformShell.includes('data-md3-module="platform"'));
for(const f of ['Topbar.module.css','Sidebar.module.css','ModuleTabBar.module.css','AppShell.module.css','PlatformShell.module.css']){
 const s=read(`apps/web/src/layout/${f}`); check(`Shell ${f} usa roles MD3`,s.includes('--md-sys-color-'));
}
const kpi=read('apps/web/src/components/KpiCard.module.css'); check('KPI migrado a MD3',kpi.includes('--md-sys-color-on-surface')&&kpi.includes('--md-sys-color-primary'));
const ms=read('apps/web/src/components/module-system/ModuleSystem.module.css');
check('ModuleSystem MD3',ms.includes('--md-sys-color-primary')&&ms.includes('--md-sys-color-on-surface'));
check('DataTableFrame MD3',ms.includes('.tableFrame{')&&ms.includes('--md-sys-color-outline-variant')&&ms.includes('.tableScroller'));
check('RecordModal MD3',ms.includes('var(--md-sys-color-surface-container-high)'));
const moduleDirs=fs.readdirSync(path.join(root,'apps/web/src/modules'),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
const required=['core','procurement','inventory','finance','hr','crm','sales','projects','production','pos','intelligence','operations','settings','platform'];
for(const m of required) check(`Módulo ${m} bajo rollout`,moduleDirs.includes(m)&&appShell.includes('moduleKey') || m==='platform'&&platformShell.includes('data-md3-module="platform"'));
const pkg=JSON.parse(read('package.json')); check('Versión MD3 v16+', Number(pkg.version.split('.')[0]) >= 16); check('QA MD3 Full registrado',pkg.scripts?.['qa:md3-full']);
const pass=checks.filter(x=>x.ok).length; const fail=checks.length-pass;
console.log(`BuzzBee MD3 Full Rollout v16.0.0\n${pass}/${checks.length} PASS`);
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'}  ${c.name}${c.detail?` · ${c.detail}`:''}`);
if(fail) process.exit(1);
