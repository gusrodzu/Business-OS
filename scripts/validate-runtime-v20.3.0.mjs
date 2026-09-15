import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(root, file));
const text = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const check = (name, ok, detail='') => checks.push({name, ok:Boolean(ok), detail});

const pkg = readJson('package.json');
const api = readJson('apps/api/package.json');
const web = readJson('apps/web/package.json');
const requiredRootScripts = ['dev','dev:api','dev:web','build','db:generate','db:migrate','db:deploy','db:status','db:seed','db:seed:demo','db:seed:demo-company','runtime:health'];
check('Versiones root/API/WEB alineadas', api.version === pkg.version && web.version === pkg.version, `${pkg.version}/${api.version}/${web.version}`);
check('Aliases runtime y DB en raíz', requiredRootScripts.every((key) => pkg.scripts?.[key]), requiredRootScripts.filter((key) => !pkg.scripts?.[key]).join(', '));
check('Prisma schema presente', exists('apps/api/prisma/schema.prisma'));
check('Baseline Prisma presente', exists('apps/api/prisma/migrations/0_init/migration.sql'));
check('Seed base presente', exists('apps/api/prisma/seed.js'));
check('Seed demo presente', exists('apps/api/prisma/seed-demo.js'));
check('Seed empresa automotriz presente', exists('apps/api/prisma/seed-demo-company-v8.js'));
check('API health + ready', text('apps/api/src/index.js').includes("'/api/health'") && text('apps/api/src/index.js').includes("'/api/ready'"));
check('API reporta la versión del paquete', text('apps/api/src/lib/version.js').includes(`'${pkg.version}'`));
check('Adaptador Offline universal presente', exists('apps/web/src/offlineDemo.js') && exists('apps/web/src/offlineBusinessData.js'));
check('Offline bloquea bypass de red', text('apps/web/src/api.js').includes('OFFLINE_NETWORK_BLOCKED') && text('apps/web/src/api.js').includes('offlineDemoRequest'));
check('Contrato de capacidades offline', exists('apps/web/src/offlineCapabilities.js'));
check('MotorNorte demo transversal', text('apps/web/src/offlineDemo.js').includes('MotorNorte Refacciones') && text('apps/web/src/offlineBusinessData.js').includes('MotorNorte'));
check('Aislamiento tenant QA disponible', exists('scripts/runtime-tenant-isolation-v15.0.3.mjs') && exists('scripts/fix-tenant-isolation-v15.0.3.mjs'));
check('Runtime P2P/O2C/POS disponible', exists('scripts/runtime-p2p-functional-v9.1.0.mjs') && exists('scripts/runtime-o2c-functional-v9.6.0.mjs') && exists('scripts/runtime-pos-functional-v10.1.0.mjs'));
check('Runtime Inventario/Finanzas/RRHH/CRM disponible', exists('scripts/runtime-inventory-functional-v9.7.0.mjs') && exists('scripts/runtime-admin-finance-v9.8.0.mjs') && exists('scripts/runtime-hr-functional-v9.9.0.mjs') && exists('scripts/runtime-crm-parties-v10.0.0.mjs'));

for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} · ${item.name}${item.detail ? ` · ${item.detail}` : ''}`);
const failed = checks.filter((item) => !item.ok);
console.log(`Runtime current-version audit: ${checks.length - failed.length} PASS / ${failed.length} FAIL`);
if (failed.length) process.exit(1);
