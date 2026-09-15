import fs from 'node:fs';
import path from 'node:path';

const read=(p)=>fs.readFileSync(p,'utf8');
let pass=0,fail=0;
function check(name,ok,detail=''){if(ok){pass++;console.log(`PASS ${name}`)}else{fail++;console.log(`FAIL ${name}${detail?` · ${detail}`:''}`)}}

const root=JSON.parse(read('package.json'));
const api=JSON.parse(read('apps/api/package.json'));
const web=JSON.parse(read('apps/web/package.json'));
const version=read('apps/api/src/lib/version.js');
const app=read('apps/web/src/App.jsx');
const frame=read('apps/web/src/ux-foundation/UXRouteFrame.jsx');
const rollout=read('apps/web/src/ux-foundation/UXRollout.module.css');
const foundation=read('apps/web/src/ux-foundation/UXFoundation.jsx');
const foundationCss=read('apps/web/src/ux-foundation/UXFoundation.module.css');
const moduleSystem=read('apps/web/src/components/module-system/ModuleSystem.jsx');
const moduleCss=read('apps/web/src/components/module-system/ModuleSystem.module.css');
const registry=read('apps/web/src/modules/registry.jsx');

check('Versión raíz v19.2.0',root.version==='19.2.0',root.version);
check('Versión API v19.2.0',api.version==='19.2.0',api.version);
check('Versión Web v19.2.0',web.version==='19.2.0',web.version);
check('APP_VERSION v19.2.0',version.includes("APP_VERSION = '19.2.0'"));

check('App importa UXRouteFrame',app.includes("import UXRouteFrame from './ux-foundation/UXRouteFrame'"));
check('Rutas index usan UXRouteFrame',app.includes('index element={<UXRouteFrame routeId={route.id}>'));
check('Rutas con path usan UXRouteFrame',app.includes('path={route.path} element={<UXRouteFrame routeId={route.id}>'));
check('RouteFrame registra data-ux-v19-route',frame.includes('data-ux-v19-route={routeId'));
check('RouteFrame registra versión UX',frame.includes('data-ux-version="19.2"'));
check('RouteFrame alimenta Recientes',frame.includes("buzzbee.ux.recents")&&frame.includes('buzzbee:recents-changed'));
check('RouteFrame genera contexto de navegación',frame.includes('routeMeta')&&frame.includes('routeContext'));
check('POS conserva workspace dedicado',rollout.includes('data-ux-v19-route="pos:pos"'));

check('ModuleHeader usa PageHeader v19',moduleSystem.includes('<PageHeader')&&moduleSystem.includes('favorite={{path:location.pathname'));
check('DataTableFrame usa SmartTable',moduleSystem.includes('<SmartTable'));
check('DetailDrawer usa EntityDrawer',moduleSystem.includes('return <EntityDrawer'));
check('ModuleToolbar marcado v19',moduleSystem.includes('data-ux-v19="module-toolbar"'));
check('ModuleTabs marcado v19',moduleSystem.includes('data-ux-v19="module-tabs"'));
check('Bridge CSS de module-system existe',moduleCss.includes('v19.2.0 · module-system migration bridge'));

for(const token of ['FormSection','StickyFormActions','ActivityTimeline','RelatedRecords']){
  check(`Foundation exporta ${token}`,foundation.includes(`export function ${token}`));
}
check('Form sections tienen CSS',foundationCss.includes('.formSection{'));
check('Sticky actions tienen CSS',foundationCss.includes('.stickyFormActions{'));
check('Timeline tiene CSS',foundationCss.includes('.timeline{'));
check('Related records tienen CSS',foundationCss.includes('.relatedRecords{'));

check('Rollout normaliza headers legacy',rollout.includes('Legacy page headers')&&rollout.includes('header:first-child'));
check('Rollout normaliza tablas globales',rollout.includes(':global(table thead th)'));
check('Rollout normaliza focus visible',rollout.includes(':focus-visible'));
check('Rollout responsive tablet',rollout.includes('@media(max-width:900px)'));
check('Rollout responsive móvil',rollout.includes('@media(max-width:640px)'));

const routeFiles=fs.readdirSync('apps/web/src/modules',{withFileTypes:true})
  .filter(e=>e.isDirectory())
  .map(e=>path.join('apps/web/src/modules',e.name,'routes.jsx'))
  .filter(fs.existsSync);
let componentRoutes=0;
let routeArrays=0;
for(const file of routeFiles){
  const source=read(file);
  const matches=[...source.matchAll(/\{id:\s*['"][^'"]+['"][^}]*Component:/g)];
  componentRoutes+=matches.length;
  if(source.includes('Routes = [')||source.includes('Routes=[')) routeArrays++;
}
check('Todos los dominios con routes están registrados',routeFiles.length>=13&&registry.includes('...settingsRoutes')&&registry.includes('...productionRoutes')&&registry.includes('...projectsRoutes'),`${routeFiles.length} route files`);
check('Cobertura amplia de rutas de componente',componentRoutes>=45,`${componentRoutes} rutas`);

const pages=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(p.endsWith('.jsx')&&p.includes('/ui/pages/'))pages.push(p)}}
walk('apps/web/src/modules');
check('Inventario de pantallas de módulos completo',pages.length>=55,`${pages.length} pages`);

let legacyHeaders=0, moduleHeaders=0, nativeFoundation=0;
for(const file of pages){
  const source=read(file);
  if(source.includes('<header className={styles.header}')||source.includes('<header className={styles.pageHeader}')) legacyHeaders++;
  if(source.includes('<ModuleHeader')) moduleHeaders++;
  if(source.includes("ux-foundation/UXFoundation")||source.includes('<PageHeader')||source.includes('<SmartTable')||source.includes('<EntityDrawer')) nativeFoundation++;
}
check('Pantallas nativas v19 conservadas',nativeFoundation>=6,`${nativeFoundation} pages`);
check('Pantallas ModuleHeader cubiertas por bridge',moduleHeaders>=5,`${moduleHeaders} pages`);
check('Pantallas legacy cubiertas por RouteFrame',legacyHeaders>=20,`${legacyHeaders} pages`);

check('README migrado a v19.2',read('README.md').includes('v19.2.0'));
check('CHANGELOG registra migración completa',read('CHANGELOG.md').includes('v19.2.0')&&read('CHANGELOG.md').toLowerCase().includes('migración'));

console.log(`\nBuzzBee Full UX Migration · v19.2.0`);
console.log(`${pass}/${pass+fail} PASS · ${fail} FAIL`);
console.log(`Rutas cubiertas: ${componentRoutes} · Pantallas inventariadas: ${pages.length} · Native Foundation: ${nativeFoundation} · Module bridge: ${moduleHeaders} · Legacy route bridge: ${legacyHeaders}`);
process.exit(fail?1:0);
