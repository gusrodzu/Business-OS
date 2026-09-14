import fs from 'node:fs';

const checks=[];
const check=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});
const read=(file)=>fs.readFileSync(file,'utf8');

const pkg=JSON.parse(read('package.json'));
const apiPkg=JSON.parse(read('apps/api/package.json'));
const webPkg=JSON.parse(read('apps/web/package.json'));
const page=read('apps/web/src/modules/operations/ui/pages/Reports.jsx');
const css=read('apps/web/src/modules/operations/ui/pages/Reports.module.css');

check('Versión raíz 18.3.5',/^(18\.3\.(?:5|[6-9]|[1-9]\d+)|19\.\d+\.\d+)$/.test(pkg.version),pkg.version);
check('Versiones API/WEB alineadas',apiPkg.version===pkg.version&&webPkg.version===pkg.version,`${apiPkg.version}/${webPkg.version}`);
check('Card mantiene Foto operativa',page.includes('Foto operativa'));
check('Card mantiene Resumen de operación',page.includes('Resumen de operación'));
check('Card mantiene subtítulo financiero',page.includes('Indicadores que complementan la lectura financiera.'));
check('Icono hero Boxes',page.includes('snapshotHeroIcon')&&page.includes('<Boxes size={24}'));
check('Iconos semánticos importados',page.includes('Database,')&&page.includes('FileText,')&&page.includes('BadgeCheck,')&&page.includes('BarChart3,'));
check('Valor de inventario navega',page.includes("navigate('/inventario/existencias')"));
check('Empleados activos navega',page.includes("navigate('/recursos-humanos')"));
check('SOLPED navega',page.includes("navigate('/compras/solicitudes')"));
check('Aprobaciones navega',page.includes("navigate('/aprobaciones')"));
check('Tesorería navega',page.includes("navigate('/finanzas/tesoreria')"));
check('Cinco métricas estilizadas',(page.match(/className=\{styles\.snapshotMetric\}/g)||[]).length===5);
check('Valores monetarios destacados',(page.match(/snapshotMoney/g)||[]).length>=2);
check('Filas usan icon tile',css.includes('.snapshotMetricIcon{')&&css.includes('width:38px'));
check('Card clara premium',css.includes('background:#FFFFFF!important')&&css.includes('border-radius:20px!important'));
check('Filas claras suaves',css.includes('linear-gradient(180deg,#FCFDFF 0%,#F7FAFF 100%)'));
check('Dark mode específico',css.includes(":global(:root[data-theme='dark']) .snapshotCard"));
check('Dark surface consistente',css.includes('background:#0B1724!important'));
check('Dark row consistente',css.includes('background:linear-gradient(180deg,#0F1D2C 0%,#0D1A28 100%)!important'));
check('Tonos semánticos',css.includes('.snapshotToneBlue')&&css.includes('.snapshotToneGreen')&&css.includes('.snapshotToneOrange')&&css.includes('.snapshotTonePurple'));
check('Hover y focus accesibles',css.includes('.snapshotMetric:hover')&&css.includes('.snapshotMetric:focus-visible'));
check('Responsive móvil',css.includes('@media(max-width:520px)'));
check('CSS balanceado',(css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length);

const failed=checks.filter(item=>!item.ok);
for(const item of checks) console.log(`${item.ok?'PASS':'FAIL'}  ${item.name}${item.detail?` · ${item.detail}`:''}`);
console.log(`\nOperational Summary Card v18.3.5: ${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length) process.exit(1);
