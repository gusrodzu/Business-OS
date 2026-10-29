import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  createPlatformProspect,transitionPlatformImplementation,ImplementationOperationError,
} from '../apps/api/src/modules/platform/domain/implementationService.js';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const api=source('apps/api/src/modules/platform/api/implementationRecords.js');
const registry=source('apps/api/src/modules/platform/index.js');
const schema=source('apps/api/prisma/schema.prisma');
const migration=source('apps/api/prisma/migrations/20261029190000_platform_implementation_idempotency/migration.sql');

test('new platform API is guarded by MFA, permissions, reauth and off-by-default feature gate',()=>{
  assert.ok(registry.includes("'/api/platform-admin/implementation-records'"));
  assert.ok(api.includes("router.use(requirePlatformAuth,requirePlatformSession,requirePermission('platform.manage'))"));
  assert.ok(api.includes("process.env.PLATFORM_IMPLEMENTATIONS_ENABLED!=='true'"));
  assert.ok(api.includes("code:'IMPLEMENTATIONS_NOT_ENABLED'"));
  assert.ok(api.includes("response.set('Cache-Control','no-store')"));
  assert.equal((api.match(/requireRecentReauth\(600\)/g)||[]).length,2);
  assert.ok(api.includes('z.strictObject('));
  assert.ok(api.includes("request.headers['idempotency-key']"));
  assert.ok(api.includes("sendError(response,error,next)"));
  assert.ok(api.includes("code:'IMPLEMENTATION_SCHEMA_NOT_READY'"));
  assert.ok(api.includes("z.enum(['CONFIGURATION','PAUSED','CANCELLED'])"));
  assert.ok(!api.includes('prisma.company.create('));
  assert.ok(!api.includes('prisma.companyModule.'));
  assert.ok(!api.includes('prisma.companySubscription.'));
  assert.ok(!api.includes('router.post(\'/companies'));
});

test('idempotency key is nullable/unique and added with an additive migration',()=>{
  assert.match(schema,/model PlatformImplementation \{[\s\S]*?requestKey\s+String\?\s+@unique/);
  assert.match(migration,/ADD COLUMN "requestKey" TEXT/);
  assert.match(migration,/CREATE UNIQUE INDEX "PlatformImplementation_requestKey_key"/);
  assert.doesNotMatch(migration,/^\s*(DROP|TRUNCATE|DELETE|UPDATE|INSERT)\b/gmi);
});

function fakeDb(){
  const records=new Map(), keys=new Map(), events=[], audits=[];
  let counter=0;
  const db={
    platformImplementation:{
      async create({data}){
        if(keys.has(data.requestKey)){const e=new Error('Unique constraint');e.code='P2002';throw e;}
        const row={id:'rec-'+(++counter),companyId:null,notes:null,industryKey:null,scianCode:null,
          planKey:null,ownerUserId:null,targetDate:null,activatedAt:null,createdAt:new Date(),
          updatedAt:new Date(),...data};
        records.set(row.id,row);keys.set(row.requestKey,row.id);return {...row};
      },
      async findUnique({where}){
        const row=where.id?records.get(where.id):records.get(keys.get(where.requestKey));
        return row?{...row}:null;
      },
      async updateMany({where,data}){
        const current=records.get(where.id);
        if(!current||current.stage!==where.stage)return {count:0};
        records.set(where.id,{...current,...data});return {count:1};
      },
    },
    platformImplementationEvent:{async create({data}){events.push(data);return data;}},
    auditLog:{async create({data}){audits.push(data);return data;}},
  };
  db.$transaction=async(fn)=>fn(db);
  return {db,records,events,audits};
}

test('prospect creation is idempotent and never auto-creates a real tenant',async()=>{
  const {db,records,events,audits}=fakeDb();
  const data={name:'Negocio ejemplo',contactEmail:'contacto@example.com',
    requestKey:'5ac4d158-dd3d-40eb-87c0-1a1bbd681029',industryKey:null,scianCode:null,
    notes:null,requestedModuleKeys:[]};
  const first=await createPlatformProspect(db,data,'actor-a');
  assert.equal(first.created,true);
  assert.equal(first.record.kind,'PROSPECT');
  assert.equal(first.record.stage,'LEAD');
  assert.equal(first.record.companyId,null);
  assert.equal((await createPlatformProspect(db,data,'actor-a')).created,false);
  assert.equal(records.size,1);assert.equal(events.length,1);assert.equal(audits.length,1);
  await assert.rejects(createPlatformProspect(db,{...data,name:'Otro negocio'},'actor-a'),
    error=>error instanceof ImplementationOperationError && error.code==='IDEMPOTENCY_CONFLICT');
});

test('safe stage change is audited, blocks activation, and verifies current stage',async()=>{
  const {db,events,audits,records}=fakeDb();
  const input={name:'Negocio B',contactEmail:'lead@example.com',requestKey:'c2d247b3-426a-4ff1-b0fd-ce24026ed0ac'};
  const {record}=await createPlatformProspect(db,input,'actor-b');
  const advanced=await transitionPlatformImplementation(db,{
    id:record.id,toStage:'CONFIGURATION',reason:'El contacto ya está validado por plataforma',
  },'actor-b');
  assert.equal(advanced.stage,'CONFIGURATION');
  assert.equal(events.length,2);assert.equal(events[1].fromStage,'LEAD');
  assert.equal(audits.length,2);
  for(const forbidden of ['TESTING','ACTIVE','LEAD']){
    await assert.rejects(transitionPlatformImplementation(db,{
      id:record.id,toStage:forbidden,reason:'No hay evidencia completa',
    },'actor-b'),error=>error.code==='IMPLEMENTATION_TRANSITION_LOCKED');
  }
  assert.equal(records.get(record.id).stage,'CONFIGURATION');
  await assert.rejects(transitionPlatformImplementation(db,{id:'missing',toStage:'CANCELLED',reason:'Caso cerrado'},'actor-b'),
    error=>error.code==='IMPLEMENTATION_NOT_FOUND');
});
