import fs from 'node:fs';
import path from 'node:path';

const read=(p)=>fs.readFileSync(p,'utf8');
const exists=(p)=>fs.existsSync(p);
const apiRoot='apps/api/src/modules/procurement';
const webRoot='apps/web/src/modules/procurement';
const manifest=read(`${apiRoot}/index.js`);
const webRoutes=read(`${webRoot}/routes.jsx`);
const flow=read(`${apiRoot}/application/procurementFlow.js`);
const legacyFlow=read('apps/api/src/services/procurementFlow.js');
const apiFiles=['warehouses','suppliers','purchaseRequests','procurement','purchaseOrders','receipts'];
const uiFiles=['ProcurementCenter','PurchaseRequests','PurchaseOrders','GoodsReceipts','Suppliers'];
const checks=[];
const add=(name,ok)=>checks.push([name,Boolean(ok)]);

add('Backend module directory',exists(apiRoot));
for(const layer of ['api','application','domain','infrastructure','tests']) add(`Backend layer ${layer}`,exists(`${apiRoot}/${layer}`));
for(const name of apiFiles) add(`Canonical API ${name}`,exists(`${apiRoot}/api/${name}.router.js`));
add('Manifest owns canonical routers',apiFiles.every(name=>manifest.includes(`./api/${name}.router.js`)));
add('Manifest no longer imports global Procurement routes',!manifest.includes("../../routes/"));
add('Application flow canonical',flow.includes('createApprovalForEntity')&&flow.includes('procurementDashboard'));
add('Legacy service is shim',legacyFlow.includes('Compatibility shim')&&legacyFlow.includes('modules/procurement/application'));
add('Domain contracts exist',read(`${apiRoot}/domain/contracts.js`).includes('procurementPermissions'));
add('Frontend module directory',exists(webRoot));
for(const layer of ['ui/pages','application','domain','infrastructure','tests']) add(`Frontend layer ${layer}`,exists(`${webRoot}/${layer}`));
for(const name of uiFiles) add(`Canonical UI ${name}`,exists(`${webRoot}/ui/pages/${name}.jsx`));
add('Frontend routes own canonical UI',uiFiles.every(name=>webRoutes.includes(`./ui/pages/${name}`)));
add('Frontend routes no longer import global Procurement pages',!webRoutes.includes("../../pages/ProcurementCenter")&&!webRoutes.includes("../../pages/PurchaseRequests"));
add('Legacy page shims removed',uiFiles.every(name=>!fs.existsSync(`apps/web/src/pages/${name}.jsx`)));
add('Canonical UI consumes shared API transport',uiFiles.every(name=>read(`${webRoot}/ui/pages/${name}.jsx`).includes("../../../../api")));
add('Procurement API still uses auth',apiFiles.every(name=>read(`${apiRoot}/api/${name}.router.js`).includes('requireAuth')));
add('P2P routes retain permissions',read(`${apiRoot}/api/purchaseRequests.router.js`).includes('purchase_requests')&&read(`${apiRoot}/api/purchaseOrders.router.js`).includes('purchase_orders'));
add('Receipt retains inventory integration',read(`${apiRoot}/api/receipts.router.js`).includes('inventoryBalance.upsert'));
add('Receipt retains CxP integration',read(`${apiRoot}/api/receipts.router.js`).includes('accountsPayable.create'));
add('Supplier retains Business Party sync',read(`${apiRoot}/api/suppliers.router.js`).includes('syncBusinessParties'));
add('Module docs',exists('PROCUREMENT-MODULE-V14.1.0.md'));

let fail=0;
console.log('\nProcurement Reference Module Audit — v14.1.0');
console.log('============================================');
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}  ${name}`);if(!ok)fail++;}
console.log(`\n${checks.length-fail}/${checks.length} PASS`);
if(fail)process.exit(1);
