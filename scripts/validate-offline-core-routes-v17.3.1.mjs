import path from 'node:path';
import {pathToFileURL} from 'node:url';

global.localStorage={_m:new Map(),getItem(k){return this._m.get(k)??null},setItem(k,v){this._m.set(k,String(v))},removeItem(k){this._m.delete(k)}};
global.sessionStorage={_m:new Map(),getItem(k){return this._m.get(k)??null},setItem(k,v){this._m.set(k,String(v))},removeItem(k){this._m.delete(k)}};

const root=process.cwd();
const {offlineDemoRequest}=await import(pathToFileURL(path.join(root,'apps/web/src/offlineDemo.js')).href);
const checks=[];
const check=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});

const sales=await offlineDemoRequest('/sales');
check('Ventas base arrays', ['quotes','orders','customers','products'].every(k=>Array.isArray(sales[k])));
check('Ventas nested quote items', sales.quotes.every(q=>Array.isArray(q.items)));

const salesEnterprise=await offlineDemoRequest('/sales-enterprise/dashboard');
check('Ventas dashboard arrays', ['pipeline','prospects','activities','quotes','orders','receivables'].every(k=>Array.isArray(salesEnterprise[k])));
check('Ventas pipeline supports map', Array.isArray(salesEnterprise.pipeline));

const projects=await offlineDemoRequest('/projects/dashboard');
check('Proyectos base arrays', ['projects','employees','customers','salesOrders','purchaseOrders'].every(k=>Array.isArray(projects[k])));
check('Proyectos nested collections', projects.projects.every(p=>['members','subprojects','salesOrders','purchaseOrders','comments','documents','tasks','timeEntries'].every(k=>Array.isArray(p[k]))));

const marketing=await offlineDemoRequest('/marketing/dashboard');
check('Marketing base arrays', ['campaigns','channels','prospects','customers','salesOrders','users','events'].every(k=>Array.isArray(marketing[k])));
check('Marketing performance contract', marketing.campaigns.every(c=>c.performance && typeof c.performance==='object' && Number.isFinite(Number(c.performance.roas))));
check('Marketing campaign collections', marketing.campaigns.every(c=>['leads','opportunities','expenses','metrics'].every(k=>Array.isArray(c[k]))));

const activity=await offlineDemoRequest('/activity/activity?q=demo');
check('Actividad logs array', Array.isArray(activity.logs));
check('Actividad filters arrays', Array.isArray(activity.filters?.entities) && Array.isArray(activity.filters?.actions));

const notifications=await offlineDemoRequest('/activity/notifications');
check('Actividad notifications contract', Array.isArray(notifications.notifications) && Number.isFinite(Number(notifications.unread)));

const failed=checks.filter(c=>!c.ok);
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'}  ${c.name}${c.detail?` · ${c.detail}`:''}`);
console.log(`\n${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length) process.exit(1);
