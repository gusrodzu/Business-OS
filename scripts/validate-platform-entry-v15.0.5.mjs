import fs from 'node:fs';

const read=(f)=>fs.readFileSync(f,'utf8');
const checks=[];
const check=(name,ok)=>{checks.push([name,Boolean(ok)]);};

const login=read('apps/web/src/pages/Login.jsx');
const entry=read('apps/web/src/pages/PlatformEntry.jsx');
const auth=read('apps/web/src/auth/AuthContext.jsx');
const protectedRoute=read('apps/web/src/auth/ProtectedRoute.jsx');
const app=read('apps/web/src/App.jsx');
const shell=read('apps/web/src/layout/AppShell.jsx');
const platformApi=read('apps/api/src/modules/platform/api/platformAdmin.js');
const coreAuth=read('apps/api/src/modules/core/api/auth.js');

check('Login redirects platform to selector', login.includes("'/platform-entry'"));
check('Selector route exists', app.includes('path="/platform-entry"'));
check('Selector has Demo LIVE', entry.includes('Demo LIVE') && entry.includes('enterDemoLive'));
check('Selector has Super Admin option', entry.includes('/admin-saas'));
check('Demo token endpoint exists', platformApi.includes("router.post('/demo-live/session'"));
check('Demo token is ERP-scoped', platformApi.includes("kind: 'erp'") && platformApi.includes('demoLive: true'));
check('Demo tenant fixed to demo account', platformApi.includes("demo@buzzbee.mx"));
check('Platform return session uses sessionStorage helper', auth.includes('savePlatformReturnSession') && auth.includes('getPlatformReturnSession'));
check('Demo context flag propagated by /me', coreAuth.includes('demoLive:Boolean(request.auth.demoLive)'));
check('Demo banner exists', shell.includes('DEMO LIVE') && shell.includes('Volver al Super Admin'));
check('Platform routes protected', protectedRoute.includes("location.pathname.startsWith('/platform-entry')"));
check('Platform default redirect is selector', protectedRoute.includes('to="/platform-entry"'));

const failed=checks.filter(([,ok])=>!ok);
console.log('\nSuper Admin Entry Audit — v15.0.5');
for(const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'}  ${name}`);
console.log(`\n${checks.length-failed.length}/${checks.length} PASS`);
if(failed.length) process.exit(1);
