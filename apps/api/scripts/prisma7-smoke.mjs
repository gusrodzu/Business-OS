import assert from 'node:assert/strict';
import {prisma} from '../src/lib/prisma.js';

// This script intentionally writes ONLY to an ephemeral, disposable QA database.
const url=new URL(process.env.DATABASE_URL || 'postgresql://invalid/');
assert.equal(process.env.ERP_QA_EPHEMERAL_DB,'1','Explicit ephemeral test database opt-in is required');
assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'Refusing to write to a remote database');
assert.equal(url.pathname,'/erpqa','Refusing to write outside the dedicated erpqa database');

try {
  await prisma.$connect();
  assert.equal(await prisma.company.count(),0,'Isolated QA database should start empty');
  const row=await prisma.company.create({data:{name:'Prisma 7 QA temporary tenant'}});
  assert.ok(row.id,'Company create should generate ID');
  const found=await prisma.company.findUnique({where:{id:row.id}});
  assert.equal(found?.name,'Prisma 7 QA temporary tenant');
  // Exercise the phase-2 implementation ledger only in this disposable test DB.
  const record=await prisma.platformImplementation.create({
    data:{
      name:'Implementation QA example',kind:'REGISTERED_TENANT',
      stage:'CONFIGURATION',companyId:row.id,industryKey:'refaccionaria',
      requestedModuleKeys:['inventario','ventas'],
      events:{create:{actorUserId:'qa-platform-actor',toStage:'CONFIGURATION',reason:'QA setup'}},
    },
    include:{events:true},
  });
  assert.equal(record.events.length,1,'Stage event must be persisted');
  assert.equal(record.events[0].toStage,'CONFIGURATION');
  assert.equal((await prisma.platformImplementation.findUnique({where:{companyId:row.id}}))?.name,'Implementation QA example');
  // Removing a tenant must not erase its independent implementation history.
  await prisma.company.delete({where:{id:row.id}});
  assert.equal((await prisma.platformImplementation.findUnique({where:{id:record.id}}))?.companyId,null);
  await assert.rejects(
    prisma.platformImplementation.delete({where:{id:record.id}}),
    'Implementation history must prevent an accidental hard delete',
  );
  await prisma.platformImplementationEvent.deleteMany({where:{implementationId:record.id}});
  await prisma.platformImplementation.delete({where:{id:record.id}});
  assert.equal(await prisma.company.count(),0,'QA company record must be removed');
  assert.equal(await prisma.platformImplementation.count(),0,'QA implementation record must be removed');
  console.log('PASS · Prisma 7 PostgreSQL 17, additive implementation ledger and history constraints');
} finally { await prisma.$disconnect(); }
