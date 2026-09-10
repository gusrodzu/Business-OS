import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=process.cwd();
const web=path.join(root,'apps/web/src');
const modulesDir=path.join(web,'modules');
global.localStorage={_m:new Map(),getItem(k){return this._m.get(k)??null},setItem(k,v){this._m.set(k,String(v))},removeItem(k){this._m.delete(k)}};
global.sessionStorage={_m:new Map(),getItem(k){return this._m.get(k)??null},setItem(k,v){this._m.set(k,String(v))},removeItem(k){this._m.delete(k)}};

const {offlineDemoRequest}=await import(pathToFileURL(path.join(web,'offlineDemo.js')).href);
const checks=[];
const check=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});

const routeFiles=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name==='routes.jsx')routeFiles.push(p)}}
walk(modulesDir);
let routes=[];
for(const f of routeFiles){const t=fs.readFileSync(f,'utf8');for(const m of t.matchAll(/path:\s*'([^']+)'/g))routes.push(m[1]); if(/index:\s*true/.test(t))routes.push('/');}
check('ERP route registry discovered',routes.length>=35,`${routes.length} routes`);

// Every page must use the shared apiRequest adapter. Direct network calls would bypass offline mode.
const pageFiles=[];
function walkPages(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walkPages(p);else if(/\.jsx?$/.test(e.name))pageFiles.push(p)}}
walkPages(modulesDir);
const directNetwork=[];
for(const f of pageFiles){const t=fs.readFileSync(f,'utf8');if(/\bfetch\s*\(/.test(t)||(/axios\./.test(t)&&!f.endsWith('api.js')))directNetwork.push(path.relative(root,f));}
check('No module bypasses offline adapter',directNetwork.length===0,directNetwork.join(', '));

const vercel=JSON.parse(fs.readFileSync(path.join(root,'apps/web/vercel.json'),'utf8'));
check('Vercel SPA rewrite present',Array.isArray(vercel.rewrites)&&vercel.rewrites.some(r=>String(r.destination)==='/index.html'));

const endpoints=[
 '/dashboard','/agenda','/human-resources','/hr-operations','/employee-documents','/payroll',
 '/sales-enterprise/dashboard','/customers','/marketing/dashboard','/business-parties/dashboard',
 '/products','/warehouses','/inventory/balances','/inventory/movements','/inventory-operations',
 '/procurement/dashboard','/purchase-requests','/purchase-orders','/receipts','/suppliers',
 '/administration/dashboard','/accounts-payable','/accounts-payable/catalogs','/accounts-receivable','/accounts-receivable/catalogs',
 '/treasury','/bank-reconciliation','/accounting','/expenses/dashboard','/fixed-assets/dashboard','/fiscal/dashboard','/cash-flow',
 '/approvals/dashboard','/master-data/dashboard','/data-hub/dashboard','/integrations/dashboard','/flow/dashboard','/reports/demo','/reports/demo-readiness',
 '/intelligence/dashboard','/projects/dashboard','/pos/dashboard','/production/dashboard','/modules/dashboard','/billing/dashboard','/admin/users','/admin/roles'
];
let endpointErrors=[];
for(const ep of endpoints){try{const r=await offlineDemoRequest(ep);if(!r||typeof r!=='object')endpointErrors.push(`${ep}: non-object`)}catch(e){endpointErrors.push(`${ep}: ${e.message}`)}}
check('All primary offline endpoints resolve',endpointErrors.length===0,endpointErrors.join('; '));

const approvals=await offlineDemoRequest('/approvals/dashboard');
check('Approvals collections are safe',Array.isArray(approvals.workflows)&&Array.isArray(approvals.requests)&&Array.isArray(approvals.inbox)&&Array.isArray(approvals.requestedByMe));
check('Approval workflow rules are safe',approvals.workflows.every(w=>Array.isArray(w.rules)));

const pr=await offlineDemoRequest('/purchase-requests');
check('Purchase request nested items are safe',(pr.requests||[]).every(r=>Array.isArray(r.items)));
const po=await offlineDemoRequest('/purchase-orders');
check('Purchase order nested items are safe',(po.orders||[]).every(r=>Array.isArray(r.items)));

const requiredTop=['workflows','inbox','requestedByMe','sessions','boms','salesOrders','credits','methods','changes','plans','subscriptions','overrides','usage','permissions'];
const generic=await offlineDemoRequest('/__offline-shape-probe__');
check('Generic offline response has route-safe arrays',requiredTop.every(k=>Array.isArray(generic[k])),requiredTop.filter(k=>!Array.isArray(generic[k])).join(','));

const failed=checks.filter(c=>!c.ok);
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'}  ${c.name}${c.detail?` · ${c.detail}`:''}`);
console.log(`\n${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length) process.exit(1);
