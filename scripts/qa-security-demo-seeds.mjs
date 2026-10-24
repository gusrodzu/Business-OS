import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {assertDemoSeedSafe} from '../apps/api/prisma/assertDemoSeedSafe.js';

const local='postgresql://demo:demo@127.0.0.1:5432/erpqa?schema=public';
test('dev and ephemeral CI may populate only local PostgreSQL',()=>{
  for (const hostname of ['localhost','127.0.0.1','[::1]']) {
    assert.doesNotThrow(()=>assertDemoSeedSafe({nodeEnv:'test',databaseUrl:`postgresql://demo:demo@${hostname}:5432/erpqa`}));
  }
});
test('known seeded passwords are blocked on remote hosts or production',()=>{
  assert.throws(()=>assertDemoSeedSafe({nodeEnv:'production',databaseUrl:local}),/production/);
  assert.throws(()=>assertDemoSeedSafe({nodeEnv:'development',databaseUrl:'postgresql://user:pass@production-db.example.com:5432/erp_cliente'}),/local/);
  assert.throws(()=>assertDemoSeedSafe({nodeEnv:'development',databaseUrl:'mysql://user:pass@localhost:3306/erpqa'}),/PostgreSQL local/);
  assert.throws(()=>assertDemoSeedSafe({nodeEnv:'test',databaseUrl:''}),/DATABASE_URL/);
});
test('all known-password seed entrypoints invoke the guard before opening Prisma',()=>{
  for (const file of ['seed.js','seed-demo.js','seed-demo-company-v8.js']) {
    const text=readFileSync(new URL('../apps/api/prisma/'+file,import.meta.url),'utf8');
    assert.ok(text.includes("from './assertDemoSeedSafe.js'"),file+' must import safety guard');
    assert.ok(text.indexOf('assertDemoSeedSafe();') >= 0 && text.indexOf('assertDemoSeedSafe();') < text.indexOf('createPrismaClient();'),file+' must guard before DB access');
  }
});
