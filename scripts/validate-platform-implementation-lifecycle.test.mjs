import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  IMPLEMENTATION_KINDS,IMPLEMENTATION_STAGES,IMPLEMENTATION_TRANSITIONS,
  validateImplementationLink,implementationTransitionReview,
} from '../apps/api/src/modules/platform/domain/implementationLifecycle.js';

const source=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const schema=source('apps/api/prisma/schema.prisma');
const sql=source('apps/api/prisma/migrations/20261029183000_platform_implementation_lifecycle/migration.sql');

test('onboarding stages and categories are separate from commercial subscriptions',()=>{
  assert.deepEqual(IMPLEMENTATION_KINDS,['PROSPECT','REGISTERED_TENANT']);
  assert.deepEqual(IMPLEMENTATION_STAGES,['LEAD','CONFIGURATION','TESTING','ACTIVE','PAUSED','CANCELLED']);
  assert.match(schema,/model PlatformImplementation \{/);
  assert.match(schema,/model PlatformImplementationEvent \{/);
  assert.match(schema,/enum ImplementationStage \{/);
  assert.match(schema,/enum ImplementationKind \{/);
  assert.match(schema,/model Company \{/);
  assert.match(schema,/implementationRecord\s+PlatformImplementation\?/);
  assert.match(schema,/companyId\s+String\?\s+@unique/);
  assert.match(schema,/company\s+Company\?\s+@relation\(fields: \[companyId\], references: \[id\], onDelete: SetNull\)/);
  assert.match(schema,/events\s+PlatformImplementationEvent\[\]/);
  assert.match(schema,/actorUserId\s+String/);
});

test('additive SQL does not touch existing tenant, subscription or user data',()=>{
  assert.match(sql,/CREATE TABLE "PlatformImplementation" \(/);
  assert.match(sql,/CREATE TABLE "PlatformImplementationEvent" \(/);
  assert.match(sql,/CREATE UNIQUE INDEX "PlatformImplementation_companyId_key"/);
  assert.match(sql,/ON DELETE SET NULL/);
  assert.match(sql,/ON DELETE RESTRICT/);
  assert.doesNotMatch(sql,/\b(DROP|TRUNCATE|UPDATE|DELETE FROM|INSERT INTO)\b/i);
  assert.doesNotMatch(sql,/ALTER TABLE "(Company|User|CompanySubscription)"/);
  assert.doesNotMatch(sql,/CREATE TABLE "(Company|User|CompanySubscription)"/);
});

test('no Demo Local data or client identity becomes a real tenant automatically',()=>{
  assert.equal(validateImplementationLink({kind:'PROSPECT',companyId:null}),true);
  assert.equal(validateImplementationLink({kind:'PROSPECT',companyId:'tenant-a'}),false);
  assert.equal(validateImplementationLink({kind:'REGISTERED_TENANT',companyId:'tenant-a'}),true);
  assert.equal(validateImplementationLink({kind:'REGISTERED_TENANT',companyId:null}),false);
  assert.equal(validateImplementationLink({kind:'DEMO_LOCAL',companyId:'tenant-a'}),false);
});

test('legal progression requires a contact and refuses direct tenant activation',()=>{
  const lead={name:'Nueva empresa',contactEmail:'ventas@example.com',kind:'PROSPECT',companyId:null,stage:'LEAD'};
  assert.equal(implementationTransitionReview(lead,'CONFIGURATION').allowed,true);
  assert.equal(implementationTransitionReview(lead,'ACTIVE').allowed,false);
  assert.equal(implementationTransitionReview({...lead,contactEmail:''},'CONFIGURATION').allowed,false);
  assert.equal(implementationTransitionReview({...lead,stage:'CONFIGURATION'},'TESTING').allowed,false);
  assert.equal(implementationTransitionReview({...lead,stage:'TESTING'},'ACTIVE').allowed,false);
  assert.equal(implementationTransitionReview({...lead,kind:'REGISTERED_TENANT',companyId:'tenant-a',stage:'TESTING'},'ACTIVE').allowed,false);
  assert.equal(implementationTransitionReview({...lead,stage:'CANCELLED'},'LEAD').allowed,false);
  assert.equal(IMPLEMENTATION_TRANSITIONS.CANCELLED.length,0);
});

test('implementation persistence is not exposed through an unreviewed writer',()=>{
  const api=source('apps/api/src/modules/platform/api/platformAdmin.js');
  assert.ok(api.includes("router.use(requirePlatformAuth, requirePlatformSession, requirePermission('platform.manage'))"));
  assert.ok(!api.includes('prisma.platformImplementation.create('));
  assert.ok(!api.includes('prisma.platformImplementation.update('));
  assert.ok(!api.includes('prisma.platformImplementation.delete('));
});
