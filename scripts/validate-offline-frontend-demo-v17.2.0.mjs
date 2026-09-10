import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[];
const check=(name,pass)=>checks.push({name,pass:Boolean(pass)});

const api=read('apps/web/src/api.js');
const auth=read('apps/web/src/auth/AuthContext.jsx');
const login=read('apps/web/src/pages/Login.jsx');
const mock=read('apps/web/src/offlineDemo.js');
const shell=read('apps/web/src/layout/AppShell.jsx');

check('Offline demo module exists', fs.existsSync(path.join(root,'apps/web/src/offlineDemo.js')));
check('admin@erp.local declared as local account', mock.includes("OFFLINE_DEMO_EMAIL = 'admin@erp.local'"));
check('Offline password declared locally', mock.includes("OFFLINE_DEMO_PASSWORD = 'Admin123!'"));
check('Login bypasses backend for offline account', auth.includes('normalizedEmail === OFFLINE_DEMO_EMAIL') && auth.includes("token: 'buzzbee-offline-demo'"));
check('Offline session skips /auth/me', auth.includes('if (session?.offlineDemo)'));
check('Logout does not call backend in offline demo', auth.includes("if (!session?.offlineDemo) await apiRequest('/auth/logout'"));
check('apiRequest routes demo traffic locally', api.includes('activeSession?.offlineDemo') && api.includes('offlineDemoRequest(path, options)'));
check('Mock API has dashboard fixture', mock.includes("'/dashboard':"));
check('Mock API has module fixture', mock.includes("'/modules/dashboard':"));
check('Mock API has core business fixtures', ['/products','/human-resources','/sales','/marketing/dashboard','/projects/dashboard'].every(x=>mock.includes(`'${x}'`)));
check('Unknown endpoints stay offline', mock.includes('return baseResponse();'));
check('Frontend shows offline demo access', login.includes('Usar Demo Local sin backend'));
check('Workspace labels offline mode', shell.includes('DEMO LOCAL') && shell.includes('sin API ni PostgreSQL'));

const passed=checks.filter(x=>x.pass).length;
for(const c of checks) console.log(`${c.pass?'PASS':'FAIL'}  ${c.name}`);
console.log(`\n${passed}/${checks.length} PASS`);
if(passed!==checks.length) process.exit(1);
