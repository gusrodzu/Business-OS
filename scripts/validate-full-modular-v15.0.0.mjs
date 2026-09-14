import fs from 'node:fs';
import path from 'node:path';

const apiRoot='apps/api/src/modules';
const webRoot='apps/web/src/modules';
const apiDomains=['core','procurement','inventory','finance','hr','crm','sales','projects','production','pos','intelligence','platform','operations'];
const webDomains=[...apiDomains,'settings'];
const checks=[];
const add=(name,ok,detail='')=>checks.push([name,Boolean(ok),detail]);

for(const d of apiDomains){
  add(`API ${d} boundary`,fs.existsSync(`${apiRoot}/${d}/index.js`)&&fs.existsSync(`${apiRoot}/${d}/api`)&&fs.existsSync(`${apiRoot}/${d}/domain/contracts.js`));
}
for(const d of webDomains){
  add(`WEB ${d} boundary`,fs.existsSync(`${webRoot}/${d}/routes.jsx`)&&fs.existsSync(`${webRoot}/${d}/domain/contracts.js`));
}
const apiIndexes=apiDomains.map(d=>fs.readFileSync(`${apiRoot}/${d}/index.js`,'utf8')).join('\n');
add('API modules do not import legacy routes',!apiIndexes.includes('../../routes/'));
const webRoutes=webDomains.map(d=>fs.readFileSync(`${webRoot}/${d}/routes.jsx`,'utf8')).join('\n');
add('WEB modules do not import legacy pages',!webRoutes.includes('../../pages/'));

const apiShimCount=fs.existsSync('apps/api/src/routes')?fs.readdirSync('apps/api/src/routes').filter(f=>{const p=`apps/api/src/routes/${f}`;return fs.statSync(p).isFile()&&fs.readFileSync(p,'utf8').includes('Compatibility shim. Canonical API lives');}).length:0;
const webShimCount=fs.existsSync('apps/web/src/pages')?fs.readdirSync('apps/web/src/pages').filter(f=>{const p=`apps/web/src/pages/${f}`;return fs.statSync(p).isFile()&&fs.readFileSync(p,'utf8').includes('Compatibility shim. Canonical UI lives');}).length:0;
add('Legacy API routes directory removed',!fs.existsSync('apps/api/src/routes'),`${apiShimCount}`);
add('No UI compatibility shims',webShimCount===0,`${webShimCount}`);
add('Shared event bus exists',fs.existsSync(`${apiRoot}/shared/eventBus.js`));
add('Shared kernel documented',fs.existsSync('README.md')&&fs.readFileSync('README.md','utf8').includes('Shared kernel'));
add('Architecture rules documented',fs.existsSync('README.md')&&fs.readFileSync('README.md','utf8').includes('Arquitectura modular'));

// no duplicate API mounts
const mountPaths=[];
for(const d of apiDomains){
 const src=fs.readFileSync(`${apiRoot}/${d}/index.js`,'utf8');
 mountPaths.push(...[...src.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(m=>m[1]));
}
const duplicates=mountPaths.filter((p,i)=>mountPaths.indexOf(p)!==i);
add('API mounts unique',duplicates.length===0,duplicates.join(','));

// no duplicate web paths
const uiPaths=[];
for(const d of webDomains){
 const src=fs.readFileSync(`${webRoot}/${d}/routes.jsx`,'utf8');
 uiPaths.push(...[...src.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(m=>m[1]));
}
const uiDup=uiPaths.filter((p,i)=>uiPaths.indexOf(p)!==i);
add('Web routes unique',uiDup.length===0,uiDup.join(','));

let fail=0;
console.log('\nBuzzBee Full Modular Audit v15.0.0');
console.log('==================================');
for(const [name,ok,detail] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}${detail?` · ${detail}`:''}`);if(!ok)fail++;}
console.log(`\n${checks.length-fail}/${checks.length} PASS${fail?` · ${fail} FAIL`:''}`);
if(fail) process.exit(1);
