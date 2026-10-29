import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=source('apps/web/src/modules/platform/ui/pages/PlatformAdmin.jsx');
const ui=source('apps/web/src/modules/platform/ui/pages/ImplementationRecords.jsx');
const css=source('apps/web/src/modules/platform/ui/pages/ImplementationRecords.module.css');
const api=source('apps/api/src/modules/platform/api/implementationRecords.js');
const client=source('apps/web/src/modules/platform/services/platformApi.js');

test('onboarding and technical portfolio stay separate inside existing secured platform route',()=>{
  assert.match(page,/import ImplementationPortfolio from '\.\/ImplementationPortfolio'/);
  assert.match(page,/import ImplementationRecords from '\.\/ImplementationRecords'/);
  assert.ok(page.includes("implementations:'implementation-portfolio'"));
  assert.ok(page.includes("user?.permissions?.includes('platform.manage')&&platformSession"));
  assert.ok(page.includes("if(!canAccess)return"));
  assert.ok(page.includes("<ImplementationRecords critical={critical}/>"));
  assert.ok(page.includes("<ImplementationPortfolio data={data}/>"));
  assert.ok(!ui.includes('enterDemoLive'));
  assert.ok(!ui.includes('prisma.'));
  assert.ok(!ui.includes('CompanySubscription'));
});

test('UI honors explicit backend gate and never silently switches to simulated records',()=>{
  assert.ok(ui.includes('IMPLEMENTATIONS_NOT_ENABLED'));
  assert.ok(ui.includes('IMPLEMENTATION_SCHEMA_NOT_READY'));
  assert.ok(ui.includes("state==='gated'"));
  assert.ok(ui.includes('setRecords([])'));
  assert.ok(ui.includes('El registro de implementaciones no está habilitado'));
  assert.ok(ui.includes("await platformRequest(url)"));
  assert.ok(client.includes("apiRequest(path, options)"));
  assert.ok(!ui.includes('localStorage'));
  assert.ok(!ui.includes('offlineDemoRequest'));
});

test('write flow uses backend MFA/reauth, fixed idempotency key per retry and restrictive data',()=>{
  assert.ok(page.includes("if(e.code==='REAUTH_REQUIRED')"));
  assert.ok(ui.includes('await critical(async()=>'));
  assert.ok(ui.includes("method:'POST'"));
  assert.ok(ui.includes("method:'PATCH'"));
  assert.ok(ui.includes('crypto.randomUUID()'));
  assert.ok(ui.includes("'idempotency-key':key"));
  assert.ok(ui.includes("requestId.current=null"));
  assert.ok(ui.includes('await load()'));
  assert.ok(ui.includes('minLength={10}'));
  assert.ok(ui.includes('length<10'));
  assert.ok(ui.includes('encodeURIComponent(id)'));
  assert.ok(!ui.includes('companyId:'));
  assert.ok(!ui.includes('TESTING\''));
  assert.ok(!ui.includes('ACTIVE\''));
  assert.ok(api.includes("router.use(requirePlatformAuth,requirePlatformSession,requirePermission('platform.manage'))"));
  assert.ok(api.includes("process.env.PLATFORM_IMPLEMENTATIONS_ENABLED!=='true'"));
  assert.equal((api.match(/requireRecentReauth\(600\)/g)||[]).length,2);
  assert.ok(!ui.includes("prisma.company.create("));
});

test('flow includes honest state feedback, responsive forms and accessible action controls',()=>{
  for(const fragment of ['role="status"','role="alert"','aria-labelledby="implementation-records-heading"','aria-expanded={createOpen}','aria-expanded={selected===row.id}','aria-label','type="email"','inputMode="numeric"','required','disabled={busy}','Cargando historial','No hay implementaciones'])assert.ok(ui.includes(fragment),fragment);
  assert.match(css,/@media\(max-width:750px\)/);
  assert.match(css,/\.fields\{display:grid/);
  assert.match(css,/focus-visible/);
  assert.match(css,/var\(--md-sys-color-/);
  assert.doesNotMatch(css,/!important/);
  assert.doesNotMatch(css,/#(?:f{3,6}|000|2563eb|0f172a)/i);
});
