import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const checks=[];
const pass=(name,ok,detail='')=>checks.push({name,ok,detail});
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const exists=(p)=>fs.existsSync(path.join(root,p));

const apiIndex=read('apps/api/src/index.js');
const webApp=read('apps/web/src/App.jsx');
const apiRegistry=read('apps/api/src/bootstrap/registerApiModules.js');
const webRegistry=read('apps/web/src/modules/registry.jsx');

pass('API bootstrap modular', apiIndex.includes('registerApiModules(app)'));
pass('API index sin routers de negocio', !apiIndex.includes("./routes/"));
pass('Workers centralizados', apiIndex.includes('startWorkers()') && exists('apps/api/src/bootstrap/workers.js'));
pass('Web App usa registry modular', webApp.includes('erpModuleRoutes') && webApp.includes('platformRoutes'));
pass('Web App sin imports de páginas funcionales masivas', (webApp.match(/\.\/pages\//g)||[]).length <= 3);
pass('Web registry valida duplicados', webRegistry.includes('assertUniqueModuleRoutes'));

const apiModules=['core','procurement','inventory','finance','hr','sales','crm','projects','production','pos','intelligence','platform','operations'];
const webModules=['core','procurement','inventory','finance','hr','sales','crm','projects','production','pos','intelligence','platform','operations','settings'];
for(const m of apiModules) pass(`API módulo ${m}`,exists(`apps/api/src/modules/${m}/index.js`));
for(const m of webModules) pass(`Web módulo ${m}`,exists(`apps/web/src/modules/${m}/routes.jsx`) || (m==='platform'&&exists('apps/web/src/modules/platform/routes.jsx')));

// Detect duplicate API paths from module manifests.
const paths=[];
for(const m of apiModules){
  const text=read(`apps/api/src/modules/${m}/index.js`);
  paths.push(...[...text.matchAll(/path:\s*'([^']+)'/g)].map(x=>x[1]));
}
pass('API paths únicos', new Set(paths).size===paths.length, `${paths.length} mounts`);

pass('Documentación modular',exists('README.md')&&read('README.md').includes('Arquitectura modular'));

const failed=checks.filter(c=>!c.ok);
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'}  ${c.name}${c.detail?` · ${c.detail}`:''}`);
console.log(`\nModular Architecture v14.0.0: ${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length) process.exit(1);
