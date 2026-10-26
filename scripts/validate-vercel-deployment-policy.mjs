/**
 * Deployment policy regression guard.
 * Both supported Vercel roots must disable automatic PR/preview deploys and
 * retain automatic production deployment on main.
 *
 * This is a quota-prevention gate, NOT a quota reset or a production smoke test.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const configs=['vercel.json','apps/web/vercel.json'];
for(const file of configs){
  const parsed=JSON.parse(readFileSync(path.join(root,file),'utf8'));
  assert.equal(parsed.git?.deploymentEnabled?.['*'],false,`${file}: all preview branches must default to disabled`);
  assert.equal(parsed.git?.deploymentEnabled?.main,true,`${file}: production main must remain enabled`);
  assert.equal(typeof parsed.git.deploymentEnabled,'object',`${file}: expected per-branch configuration`);
  assert.equal(parsed.framework,'vite',`${file}: preserve Vite framework`);
  assert.ok(parsed.rewrites?.some(r=>r.destination==='/index.html'&&r.source.includes('?!assets/')),
    `${file}: preserve SPA routes and assets rewrite`);
  assert.ok(parsed.headers?.some(h=>h.headers?.some(v=>v.key==='Content-Security-Policy')),
    `${file}: preserve security headers`);
  console.log('PASS · '+file+' deploys main only; SPA and security rules retained');
}

const main=JSON.parse(readFileSync(path.join(root,'vercel.json'),'utf8'));
assert.equal(main.installCommand,'npm ci --include=dev','Preserve monorepo install');
assert.equal(main.buildCommand,'npm run build -w apps/web','Preserve monorepo build');
assert.equal(main.outputDirectory,'apps/web/dist','Preserve Vite dist directory');
assert.ok(main.headers.some(h=>h.headers?.some(v=>v.key==='Strict-Transport-Security')),
  'Preserve production transport security headers');
console.log('PASS · production build, output and headers unchanged');
