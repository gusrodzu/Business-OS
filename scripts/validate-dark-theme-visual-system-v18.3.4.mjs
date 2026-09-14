import fs from 'node:fs';

const checks=[];
const check=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});
const read=(file)=>fs.readFileSync(file,'utf8');

const pkg=JSON.parse(read('package.json'));
const apiPkg=JSON.parse(read('apps/api/package.json'));
const webPkg=JSON.parse(read('apps/web/package.json'));
const main=read('apps/web/src/main.jsx');
const theme=read('apps/web/src/design-system/styles/dark-reference-theme.css');
const procurement=read('apps/web/src/modules/procurement/ui/pages/ProcurementCenter.module.css');
const admin=read('apps/web/src/modules/finance/ui/pages/AdministrativeCenter.module.css');
const fiscal=read('apps/web/src/modules/finance/ui/pages/Fiscal.module.css');
const pos=read('apps/web/src/modules/pos/ui/pages/Pos.module.css');

check('Versión raíz compatible >=18.3.4',/^18\.3\.[4-9]$/.test(pkg.version),pkg.version);
check('Versión API alineada',apiPkg.version===pkg.version,apiPkg.version);
check('Versión WEB alineada',webPkg.version===pkg.version,webPkg.version);
check('Tema visual dark importado',main.includes("dark-reference-theme.css"));
check('Tema visual carga después del polish',main.indexOf('dark-reference-theme.css')>main.indexOf('dark-mode-polish.css'));
check('Paleta navy aprobada',theme.includes('--bb-dark-page:#07111D')&&theme.includes('--bb-dark-surface:#0B1724'));
check('Primario azul aprobado',theme.includes('--bb-dark-blue:#4F9BFF')&&theme.includes('--md-sys-color-primary:#5A9FFF'));
check('Shell dark refinado',theme.includes('[class*="_sidebar_"]')&&theme.includes('[class*="_topbar_"]'));
check('Sidebar activo premium',theme.includes('linear-gradient(90deg,#0D4EA4 0%,#155FC0 100%)'));
check('KPI con icon tile',theme.includes('[data-kpi-card="true"]>svg')&&theme.includes('width:38px!important'));
check('KPI por tono',theme.includes(':nth-child(2)>svg')&&theme.includes(':nth-child(4)>svg'));
check('Botón primario azul',theme.includes('linear-gradient(135deg,#2E8BFF 0%,#195BE8 100%)'));
check('Compras usa selector de ruta real',theme.includes('[data-md3-module="compras"] [class*="_attentionCard_"]'));
check('Compras elimina bloque claro de prioridad',theme.includes('background:linear-gradient(90deg,#351B29,#201827)'));
check('Centro administrativo usa ruta real',theme.includes('[data-md3-module="administracion"] [class*="_healthScore_"]'));
check('Centro administrativo hover dark',theme.includes('[data-md3-module="administracion"] [class*="_queueList_"]>a:hover'));
check('Facturación usa ruta real',theme.includes('[data-md3-module="facturacion-fiscal"] [class*="_notice_"]'));
check('Banner fiscal dark',theme.includes('background:linear-gradient(90deg,#0B3159 0%,#0A2441 100%)'));
check('POS usa ruta real',theme.includes('[data-md3-module="pos"] [class*="_catalogToolbar_"]'));
check('POS search dark',theme.includes('[data-md3-module="pos"] :where([class*="_search_"]'));
check('POS categorías y productos dark',theme.includes('[class*="_categoryActive_"]')&&theme.includes('[class*="_productCard_"]'));
check('POS cliente dark',theme.includes('[class*="_customerCard_"]')&&theme.includes('[class*="_customerIcon_"]'));
check('Controles nativos dark',theme.includes('input:not([type="checkbox"]):not([type="radio"])'));
check('Responsive preservado',theme.includes('@media(max-width:900px)'));
check('Llaves CSS balanceadas',(theme.match(/{/g)||[]).length===(theme.match(/}/g)||[]).length);
check('Módulos fuente siguen presentes',procurement.length>1000&&admin.length>1000&&fiscal.length>1000&&pos.length>1000);

const failed=checks.filter(item=>!item.ok);
for(const item of checks) console.log(`${item.ok?'PASS':'FAIL'}  ${item.name}${item.detail?` · ${item.detail}`:''}`);
console.log(`\nDark Theme Visual System v18.3.4: ${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length) process.exit(1);
