import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {companyReadiness,IMPLEMENTATION_CHECKS} from '../apps/web/src/modules/platform/domain/companyReadiness.js';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
function check(name,condition){assert.ok(condition,name);console.log('PASS · '+name);}

const basic={id:'tenant-a',name:'Empresa A',industry:'Refaccionaria',active:true,_count:{users:3,enabledModules:2},subscriptions:[{status:'ACTIVE',plan:{name:'Plan registrado'}}]};
const incomplete={id:'tenant-b',name:'Empresa B',industry:null,active:false,_count:{users:0,enabledModules:0},subscriptions:[]};
const ready=companyReadiness(basic);
const pending=companyReadiness(incomplete);
check('Four configuration signals are documented, not a persisted lifecycle',
  IMPLEMENTATION_CHECKS.length===4
  && ready.complete===4 && ready.total===4
  && ready.summary==='Base documentada'
  && ready.checks.every(row=>row.ready));
check('Missing tenant configuration is shown without inventing activation',
  pending.complete===0 && pending.summary==='Sin configuración registrada'
  && pending.active===false && pending.subscriptionStatus===null);
check('Paused tenant retains its real status independent of completeness',
  companyReadiness({...basic,active:false}).active===false
  && companyReadiness({...basic,active:false}).complete===4);
check('Plan status and module count do not impersonate licenses',
  ready.subscriptionStatus==='ACTIVE'
  && ready.checks.find(c=>c.id==='modules').detail.includes('asignación')
  && !ready.checks.some(c=>c.label.includes('Licencia activa')));
check('No tenant identity mutation on summary construction',
  basic.id==='tenant-a' && ready.id==='tenant-a' && incomplete.id==='tenant-b' && pending.id==='tenant-b');

const api=read('apps/api/src/modules/platform/api/platformAdmin.js');
const ui=read('apps/web/src/modules/platform/ui/pages/PlatformAdmin.jsx');
const board=read('apps/web/src/modules/platform/ui/pages/CompanyReadinessBoard.jsx');
const css=read('apps/web/src/modules/platform/ui/pages/CompanyReadinessBoard.module.css');
check('Company API already enforces platform session and permission server-side',
  api.includes('router.use(requirePlatformAuth, requirePlatformSession, requirePermission(')
  && api.includes("router.get('/companies',")
  && !board.includes('apiRequest(')
  && !board.includes('localStorage'));
check('Super Admin gate and real companies API remain the source of truth',
  ui.includes("user?.permissions?.includes('platform.manage')&&platformSession")
  && ui.includes('CompanyReadinessBoard companies={data?.companies??[]}')
  && ui.includes("endpoint={")===false
  && ui.includes('companies:\\'companies\\'')===false); // No additional company-switching transport.
check('Read-only readiness does not present a tenant dashboard or fake live onboarding',
  board.includes('data-company-readiness-board="real-tenant"')
  && board.includes('Solo lectura')
  && board.includes('no crea tenants ni habilita módulos')
  && board.includes('no un estado formal de onboarding')
  && !board.includes('platform-admin/companies/')
  && !board.includes('method:'));
check('Responsive cards use theme tokens without legacy CSS overrides',
  css.includes('var(--md-sys-color-on-surface)')
  && css.includes('@media(max-width:760px)')
  && !css.includes('!important'));
console.log('PASS · Business OS onboarding phase 2 read-only readiness');
