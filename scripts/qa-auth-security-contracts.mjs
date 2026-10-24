import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL(path,import.meta.url),'utf8');
const auth=read('../apps/api/src/modules/core/api/auth.js');
const csrf=read('../apps/api/src/middleware/csrfOrigin.js');
const api=read('../apps/api/src/index.js');
const middleware=read('../apps/api/src/middleware/auth.js');
for (const route of ["'/mfa/confirm'","'/mfa/verify'","'/reauth'"]) {
  const start=auth.indexOf("router.post("+route);
  assert.ok(start >= 0, 'Missing sensitive route '+route);
  const snippet=auth.slice(start,start+330);
  assert.ok(snippet.includes('checkIpRateLimit(request.ip)'),'Missing MFA/reauth request throttle '+route);
}
assert.ok(auth.includes('while (ipAttempts.size >= MAX_TRACKED_IPS)'),'IP tracking must remain memory-bounded');
assert.ok(!csrf.includes("authorization.startsWith('Bearer bb_live_')"),'Credential headers cannot disable cookie CSRF');
assert.ok(!csrf.includes("request.headers['x-api-key']) return next()"),'API key headers cannot disable cookie CSRF');
assert.ok(api.includes('app.use(cookieCsrfOriginGuard)'),'Origin guard must be globally installed');
assert.ok(middleware.includes("algorithms:['HS256']"),'JWT verification must pin a single algorithm');
assert.ok(api.includes('ALLOW_LEGACY_BEARER_AUTH debe permanecer deshabilitado en producción'),'No legacy bearer login in production');
assert.ok(api.includes("!isProduction && process.env.ALLOW_PUBLIC_LOCAL_UPLOADS !== 'false'"),'Production uploads must remain private');
console.log('PASS · auth, MFA throttling, CSRF, JWT and private file contracts');
