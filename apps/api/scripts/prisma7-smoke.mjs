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
  await prisma.company.delete({where:{id:row.id}});
  assert.equal(await prisma.company.count(),0,'QA record must be removed');
  console.log('PASS · Prisma 7 PostgreSQL 17 create/read/delete with adapter');
} finally { await prisma.$disconnect(); }
