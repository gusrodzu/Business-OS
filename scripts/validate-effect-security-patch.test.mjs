import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const pkg=JSON.parse(readFileSync(new URL('package.json',root),'utf8'));
const lock=JSON.parse(readFileSync(new URL('package-lock.json',root),'utf8'));
test('Effect security override and locked artifact match',()=>{
 assert.equal(pkg.overrides?.effect,'3.22.1');
 const effect=lock.packages['node_modules/effect'];
 assert.equal(effect.version,'3.22.1');
 assert.equal(effect.resolved,'https://registry.npmjs.org/effect/-/effect-3.22.1.tgz');
 assert.equal(effect.integrity,'sha512-TNoXushmPOBAjJlthF5d2QwnX2xBPEtcNJr5XKNKbRLbDvBcOYkXlYDfvGfSA0zriwLFuCll5MDtNMAdZL17PQ==');
});
test('Prisma ORM and runtime stay on matched 7.x versions',()=>{
 const api=JSON.parse(readFileSync(new URL('apps/api/package.json',root),'utf8'));
 assert.equal(api.dependencies['@prisma/client'],api.devDependencies.prisma);
 assert.equal(api.dependencies['@prisma/adapter-pg'],api.dependencies['@prisma/client']);
 assert.equal(lock.packages['node_modules/prisma'].version,api.devDependencies.prisma);
});
