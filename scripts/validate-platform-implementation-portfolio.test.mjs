import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {summarizeImplementationCompany} from '../apps/api/src/modules/platform/domain/implementationPortfolio.js';

const sample={
  id:'tenant-real-a',name:'Empresa existente A',industry:null,active:true,
  createdAt:'2026-10-01T12:00:00Z',
  industryProfiles:[{activityKey:'refaccionaria',isPrimary:true}],
  _count:{users:3},
  enabledModules:[
    {enabled:true,expiresAt:null,module:{key:'inventory',name:'Inventario'}},
    {enabled:true,expiresAt:null,module:{key:'sales',name:'Ventas'}},
    {enabled:false,expiresAt:null,module:{key:'finance',name:'Finanzas'}},
    {enabled:true,expiresAt:'2000-01-01T00:00:00Z',module:{key:'pos',name:'POS'}},
  ],
  subscriptions:[{status:'TRIAL',plan:{name:'Prueba'}}],
};

test('portfolio summarizes real platform metadata without inventing onboarding state',()=>{
  const value=summarizeImplementationCompany(sample);
  assert.equal(value.name,sample.name);
  assert.equal(value.onboardingStage,null);
  assert.equal(value.plan,'Prueba');
  assert.equal(value.subscriptionStatus,'TRIAL');
  assert.equal(value.primaryActivityKey,'refaccionaria');
  assert.equal(value.readiness.completed,4);
  assert.equal(value.readiness.total,4);
  assert.deepEqual(value.enabledModules.map(x=>x.key),['inventory','sales']);
  assert.ok(value.recommendedModules.includes('pos'));
  assert.ok(!Object.hasOwn(value,'passwordHash'));
});

test('companies without a profile, license, modules and users are flagged for review',()=>{
  const result=summarizeImplementationCompany({
    id:'tenant-b',name:'Otro tenant',industry:'Servicios',active:false,createdAt:'2026-10-02',
    industryProfiles:[],_count:{users:0},enabledModules:[],subscriptions:[],
  });
  assert.equal(result.readiness.completed,0);
  assert.equal(result.industry,'Servicios');
  assert.equal(result.onboardingStage,null);
  assert.deepEqual(result.recommendedModules,[]);
  assert.equal(result.active,false);
});

test('the portfolio code is read-only and requires platform session authorization',()=>{
  const api=readFileSync(new URL('../apps/api/src/modules/platform/api/platformAdmin.js',import.meta.url),'utf8');
  const start=api.indexOf("router.get('/implementation-portfolio'");
  const end=api.indexOf("router.get('/companies'",start);
  const route=api.slice(start,end);
  assert.ok(api.includes("router.use(requirePlatformAuth, requirePlatformSession, requirePermission('platform.manage'));"));
  assert.ok(start>0 && end>start);
  assert.ok(route.includes('prisma.company.findMany'));
  assert.ok(route.includes('select:{'));
  assert.ok(route.includes('companies.map(summarizeImplementationCompany)'));
  assert.ok(!/\.(?:create|update|delete|upsert|createMany|deleteMany|updateMany)\s*\(/.test(route));
  assert.ok(!route.includes('request.params'));
  assert.ok(!route.includes('request.auth.companyId'));
});

test('Super Admin navigation never exposes tenant impersonation actions',()=>{
  const ui=readFileSync(new URL('../apps/web/src/modules/platform/ui/pages/ImplementationPortfolio.jsx',import.meta.url),'utf8');
  const shell=readFileSync(new URL('../apps/web/src/layout/PlatformShell.jsx',import.meta.url),'utf8');
  const page=readFileSync(new URL('../apps/web/src/modules/platform/ui/pages/PlatformAdmin.jsx',import.meta.url),'utf8');
  assert.ok(shell.includes("tab:'implementations'"));
  assert.ok(page.includes("implementations:'implementation-portfolio'"));
  assert.ok(ui.includes('lifecyclePersisted')===false);
  assert.ok(ui.includes('Sin etapa de onboarding persistida'));
  assert.ok(!ui.includes('enterDemoLive'));
  assert.ok(!ui.includes("apiRequest("));
  assert.ok(ui.includes('aria-expanded={open}'));
});
