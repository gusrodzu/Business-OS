import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const VERSION = '18.3.6';
const runtimeRequested = process.argv.includes('--runtime');
const reportDir = path.resolve('artifacts/qa');
fs.mkdirSync(reportDir, {recursive: true});

const staticSuites = [
  ['Base', 'Navegación', 'node scripts/validate-navigation.mjs'],
  ['Base', 'Foundation', 'node scripts/validate-foundation.mjs'],
  ['Base', 'Integración de pantallas', 'node scripts/validate-data-integration.mjs'],
  ['Base', 'Core', 'node scripts/core-audit-v7.5.1.mjs'],

  ['Flujos', 'Compras P2P', 'node scripts/validate-p2p-functional-v9.1.0.mjs'],
  ['Flujos', 'Ventas O2C', 'node scripts/validate-order-to-cash-v9.6.0.mjs'],
  ['Flujos', 'Inventario', 'node scripts/validate-inventory-functional-v9.7.0.mjs'],
  ['Flujos', 'Administración y finanzas', 'node scripts/validate-admin-finance-v9.8.0.mjs'],
  ['Flujos', 'RR. HH.', 'node scripts/validate-hr-functional-v9.9.0.mjs'],
  ['Flujos', 'CRM y terceros', 'node scripts/validate-crm-parties-v10.0.0.mjs'],
  ['Flujos', 'POS', 'node scripts/validate-pos-functional-v10.1.0.mjs'],
  ['Flujos', 'Proyectos', 'node scripts/validate-projects-v5.mjs'],
  ['Flujos', 'Producción', 'node scripts/validate-production-v5.3.mjs'],
  ['Flujos', 'Rutas críticas v18.1', 'node scripts/validate-critical-routes-v18.1.0.mjs'],
  ['Flujos', 'Offline rutas críticas v18.3.1', 'node scripts/validate-offline-critical-routes-v18.3.1.mjs'],

  ['Plataforma', 'Intelligence / AI', 'node scripts/validate-intelligence-ai-v10.2.0.mjs'],
  ['Plataforma', 'Core SaaS', 'node scripts/validate-core-saas-v10.3.0.mjs'],
  ['Plataforma', 'Confiabilidad core', 'node scripts/validate-idempotency-observability-concurrency-v10.6.0.mjs'],
  ['Plataforma', 'Workers', 'node scripts/validate-worker-reliability-traceability-v10.7.0.mjs'],
  ['Plataforma', 'Integraciones', 'node scripts/validate-integration-reliability-v10.8.0.mjs'],
  ['Plataforma', 'Secuencias', 'node scripts/validate-complete-sequence-migration-v10.9.0.mjs'],
  ['Plataforma', 'Integridad transaccional', 'node scripts/validate-transactional-integrity-v11.0.0.mjs'],
  ['Plataforma', 'Máquinas de estado', 'node scripts/validate-state-transitions-v12.0.0.mjs'],
  ['Plataforma', 'Auditoría', 'node scripts/validate-audit-trail-v12.0.0.mjs'],
  ['Plataforma', 'Permisos', 'node scripts/validate-permissions-matrix-v12.0.0.mjs'],
  ['Plataforma', 'Recovery', 'node scripts/validate-background-recovery-v12.0.0.mjs'],
  ['Plataforma', 'Contratos API', 'node scripts/validate-api-contracts-v12.0.0.mjs'],
  ['Plataforma', 'Multiempresa', 'node scripts/validate-multitenant-isolation-v12.0.0.mjs'],
  ['Plataforma', 'Performance', 'node scripts/validate-performance-pagination-v12.0.0.mjs'],
  ['Plataforma', 'Production readiness', 'node scripts/validate-production-readiness-v12.0.0.mjs'],
  ['Plataforma', 'Final hardening', 'node scripts/validate-final-hardening-v12.1.0.mjs'],
  ['Plataforma', 'Seguridad empresarial v18.1', 'node scripts/validate-enterprise-security-v18.1.0.mjs'],
  ['Plataforma', 'Production Ready v18.3', 'node scripts/validate-production-ready-v18.3.0.mjs'],
  ['Plataforma', 'Cloud Deploy v18.3', 'node scripts/validate-cloud-deployment-v18.3.0.mjs'],

  ['UX/UI', 'Workspace UI', 'node scripts/validate-workspace-ui-v17.0.0.mjs'],
  ['UX/UI', 'Unified UI Contract', 'node scripts/validate-unified-ui-contract-v17.1.0.mjs'],
  ['UX/UI', 'MD3 Full', 'node scripts/validate-md3-full-rollout-v16.0.0.mjs'],
  ['UX/UI', 'Navegación sin duplicados', 'node scripts/validate-navigation-dedup-v10.5.1.mjs'],
  ['UX/UI', 'Tabs sin duplicados', 'node scripts/validate-module-tab-dedup-v10.5.2.mjs'],
  ['UX/UI', 'Topbar tabs', 'node scripts/validate-all-tabs-topbar-v10.5.3.mjs'],
  ['UX/UI', 'Accesibilidad', 'node scripts/validate-md3-accessibility-v16.0.0.mjs'],
  ['UX/UI', 'Administración / Finanzas navigation', 'node scripts/validate-admin-finance-navigation-v10.6.1.mjs'],
  ['UX/UI', 'Racionalización de módulos', 'node scripts/validate-module-rationalization-v12.2.0.mjs'],
  ['UX/UI', 'Estandarización visual', 'node scripts/validate-visual-standardization-v12.3.0.mjs'],
  ['UX/UI', 'Switches', 'node scripts/validate-switch-standardization-v12.3.1.mjs'],
  ['UX/UI', 'Interacciones', 'node scripts/validate-ux-interactions-v13.0.0.mjs'],
  ['UX/UI', 'Menú de usuario v18.3.2', 'node scripts/validate-user-menu-v18.3.2.mjs'],
  ['UX/UI', 'Dark Theme Visual System v18.3.4', 'node scripts/validate-dark-theme-visual-system-v18.3.4.mjs'],
  ['UX/UI', 'Operational Summary Card v18.3.5', 'node scripts/validate-operational-summary-card-v18.3.5.mjs'],
  ['UX/UI', 'POS Shopify UX v18.3.6', 'node scripts/validate-pos-shopify-ux-v18.3.6.mjs'],
  ['UX/UI', 'Idioma es-MX', 'node scripts/validate-ui-language-v13.0.0.mjs'],
  ['UX/UI', 'Deployment UI/API', 'node scripts/validate-deployment-v13.0.0.mjs'],
  ['UX/UI', 'Agenda', 'node scripts/validate-agenda-v13.0.4.mjs'],
  ['UX/UI', 'Tablas responsive', 'node scripts/validate-table-standard-v13.0.5.mjs'],

  ['100/100', 'Dirección', 'node scripts/validate-direction-100-v13.1.0.mjs'],
  ['100/100', 'Administración', 'node scripts/validate-administration-100-v13.2.0.mjs'],
  ['Release', 'Release Candidate', 'node scripts/validate-release-candidate-v13.0.0.mjs'],
];

const runtimeSuites = [
  ['Runtime', 'Smoke', 'node scripts/runtime-smoke-v7.5.1.mjs'],
  ['Runtime', 'Compras P2P', 'node scripts/runtime-p2p-functional-v9.1.0.mjs'],
  ['Runtime', 'Ventas O2C', 'node scripts/runtime-o2c-functional-v9.6.0.mjs'],
  ['Runtime', 'Inventario', 'node scripts/runtime-inventory-functional-v9.7.0.mjs'],
  ['Runtime', 'Administración y finanzas', 'node scripts/runtime-admin-finance-v9.8.0.mjs'],
  ['Runtime', 'RR. HH.', 'node scripts/runtime-hr-functional-v9.9.0.mjs'],
  ['Runtime', 'CRM y terceros', 'node scripts/runtime-crm-parties-v10.0.0.mjs'],
  ['Runtime', 'POS', 'node scripts/runtime-pos-functional-v10.1.0.mjs'],
  ['Runtime', 'Intelligence / AI', 'node scripts/runtime-intelligence-ai-v10.2.0.mjs'],
  ['Runtime', 'Core SaaS', 'node scripts/runtime-core-saas-v10.3.0.mjs'],
  ['Runtime', 'Consistencia cross-module', 'node scripts/runtime-cross-module-consistency-v12.0.0.mjs'],
];

function runSuite([category, name, cmd]) {
  const started = Date.now();
  const result = spawnSync(cmd, {shell: true, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024});
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  return {
    category,
    name,
    cmd,
    status: result.status === 0 ? 'PASS' : 'FAIL',
    exitCode: result.status ?? 1,
    seconds: Number(((Date.now() - started) / 1000).toFixed(2)),
    output,
  };
}

console.log(`\nBuzzBee ERP · QA integral v${VERSION}`);
console.log('=================================');
console.log(runtimeRequested ? 'Modo: STATIC + RUNTIME' : 'Modo: STATIC (seguro, sin requerir API/DB)');

const suites = runtimeRequested ? [...staticSuites, ...runtimeSuites] : staticSuites;
const results = [];
let currentCategory = '';
for (const suite of suites) {
  if (suite[0] !== currentCategory) {
    currentCategory = suite[0];
    console.log(`\n[${currentCategory}]`);
  }
  const result = runSuite(suite);
  results.push(result);
  const outputLines = result.output.split('\n').map((line) => line.trim()).filter(Boolean);
  const preferredDetail = [...outputLines].reverse().find((line) =>
    !/^Node\.js v/i.test(line) &&
    (/^ERROR QA:/i.test(line) || /^FAIL\s+/i.test(line) || /PrismaClient/i.test(line) || /HTTP\s+\d{3}/i.test(line))
  );
  const detail = preferredDetail || [...outputLines].reverse().find((line) => !/^Node\.js v/i.test(line)) || '';
  console.log(`${result.status === 'PASS' ? 'PASS' : 'FAIL'}  ${result.name}${detail ? ` · ${detail}` : ''}`);
}

const byCategory = {};
for (const result of results) {
  byCategory[result.category] ||= {total: 0, pass: 0, fail: 0};
  byCategory[result.category].total++;
  byCategory[result.category][result.status === 'PASS' ? 'pass' : 'fail']++;
}
const failed = results.filter((item) => item.status === 'FAIL');
const passed = results.length - failed.length;
const report = {
  version: VERSION,
  generatedAt: new Date().toISOString(),
  mode: runtimeRequested ? 'static+runtime' : 'static',
  summary: {total: results.length, pass: passed, fail: failed.length},
  categories: byCategory,
  results,
};

const jsonPath = path.join(reportDir, `qa-all-v${VERSION}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

console.log('\nReporte QA persistente: sólo JSON; el historial humano vive en CHANGELOG.md.');

console.log('\nResumen por área');
console.log('----------------');
for (const [name, row] of Object.entries(byCategory)) {
  console.log(`${name}: ${row.pass}/${row.total} PASS${row.fail ? ` · ${row.fail} FAIL` : ''}`);
}
console.log(`\nTOTAL: ${passed}/${results.length} PASS · ${failed.length} FAIL`);
console.log(`JSON:    ${path.relative(process.cwd(), jsonPath)}`);

process.exit(failed.length ? 1 : 0);
