import { spawnSync } from 'node:child_process';

const checks = [
  ['P2P', 'scripts/runtime-p2p-functional-v9.1.0.mjs'],
  ['O2C', 'scripts/runtime-o2c-functional-v9.6.0.mjs'],
  ['POS', 'scripts/runtime-pos-functional-v10.1.0.mjs'],
  ['Inventario', 'scripts/runtime-inventory-functional-v9.7.0.mjs'],
  ['Finanzas', 'scripts/runtime-admin-finance-v9.8.0.mjs'],
  ['RRHH', 'scripts/runtime-hr-functional-v9.9.0.mjs'],
  ['CRM', 'scripts/runtime-crm-parties-v10.0.0.mjs'],
  ['Proyectos', 'scripts/validate-projects-v5.mjs'],
  ['Producción', 'scripts/validate-production-v5.3.mjs'],
  ['Marketing', 'scripts/validate-marketing-v5.1.mjs'],
  ['Demo Offline', 'scripts/validate-offline-full-business-v18.0.0.mjs'],
  ['Multiempresa', 'scripts/validate-multitenant-isolation-v12.0.0.mjs'],
  ['Demo Administrator', 'scripts/validate-demo-company-unified-v20.3.1.mjs'],
];

console.log('BuzzBee v20.3.2 · UAT consolidado');
console.log('API debe estar activa para los checks runtime.\n');
let failures = 0;
for (const [name, file] of checks) {
  console.log(`\n=== ${name} ===`);
  const r = spawnSync(process.execPath, [file], { stdio: 'inherit', env: process.env });
  if (r.status !== 0) failures++;
}
console.log(`\nUAT consolidado: ${checks.length - failures} PASS / ${failures} FAIL`);
process.exitCode = failures ? 1 : 0;
