import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  api: path.join(root, 'apps/api/src/modules/operations/api/reports.js'),
  page: path.join(root, 'apps/web/src/modules/operations/ui/pages/Reports.jsx'),
  css: path.join(root, 'apps/web/src/modules/operations/ui/pages/Reports.module.css'),
  kpi: path.join(root, 'apps/web/src/components/KpiCard.jsx'),
  kpiCss: path.join(root, 'apps/web/src/components/KpiCard.module.css'),
};

const source = Object.fromEntries(
  Object.entries(files).map(([key, file]) => [key, fs.readFileSync(file, 'utf8')]),
);

const checks = [
  ['Ventas integradas', source.api.includes('prisma.salesOrder.findMany') && source.api.includes('salesTotal')],
  ['Cobranza real integrada', source.api.includes('prisma.customerPayment.findMany') && source.api.includes('collectionsTotal')],
  ['Liquidez de Tesorería', source.api.includes('prisma.treasuryAccount.findMany') && source.api.includes('liquidity')],
  ['Flujo de caja operativo', source.api.includes('cashIn') && source.api.includes('cashOut')],
  ['Presupuesto vs ejecución', source.api.includes('budgetPlanned') && source.api.includes('budgetActual') && source.api.includes('budgetUtilization')],
  ['Aprobaciones ejecutivas', source.api.includes('prisma.approvalRequest.findMany') && source.api.includes('pendingApprovals')],
  ['Comparación periodo anterior', source.api.includes('previousPeriod') && source.api.includes('comparison') && source.api.includes('percentChange')],
  ['Saldos históricos reconstruidos', source.api.includes('payments: {') && source.api.includes('paymentDate: {lte: to}') && source.api.includes('balanceAt')],
  ['Score de salud empresarial', source.api.includes('healthScore') && source.api.includes('healthStatus')],
  ['Decisiones priorizadas', source.api.includes('decisions.sort') && source.api.includes('severityWeight')],
  ['Evolución mensual integral', source.api.includes("field, amount") && source.api.includes("'sales'") && source.api.includes("'collections'")],
  ['Fuentes de datos declaradas', source.api.includes('dataSources')],
  ['Drill-down ejecutivo', source.page.includes('useNavigate') && source.page.includes("navigate('/ventas')") && source.page.includes("navigate('/finanzas/tesoreria')")],
  ['KPIs comparativos', source.page.includes('<Trend change=') && source.page.includes('vs periodo anterior')],
  ['Bloque salud del negocio', source.page.includes('Salud del negocio') && source.page.includes('health.score') && source.css.includes('.healthScore')],
  ['Bloque decisiones', source.page.includes('Decisiones que requieren tu atención') && source.page.includes('decisionList')],
  ['Exportación ejecutiva ampliada', source.page.includes('REPORTE EJECUTIVO BUZZBEE') && source.page.includes('PRESUPUESTO') && source.page.includes('DECISIONES')],
  ['Tablas con navegación', source.page.includes('Ver módulo') && source.page.includes('Ver cartera') && source.page.includes('Ver RR. HH.')],
  ['KPI accesible por teclado', source.kpi.includes("event.key === 'Enter'") && source.kpi.includes("event.key === ' '") && source.kpi.includes('tabIndex={onClick ? 0')],
  ['KPI clickable estandarizado', source.kpi.includes('data-kpi-clickable') && source.kpiCss.includes('cursor:pointer')],
  ['Tablas sin recorte', source.css.includes('.tableScroll') && source.css.includes('overflow-x:auto') && source.css.includes('white-space:normal')],
  ['Responsive ejecutivo', source.css.includes('@media(max-width:1180px)') && source.css.includes('.executiveGrid,.mainGrid,.tablesGrid{grid-template-columns:1fr}')],
];

let passed = 0;
for (const [name, ok] of checks) {
  if (ok) {
    passed += 1;
    console.log(`✓ ${name}`);
  } else {
    console.error(`✗ ${name}`);
  }
}

if (passed !== checks.length) {
  console.error(`\nDirección 100/100 v13.1.0 FALLÓ · ${passed}/${checks.length} checks`);
  process.exit(1);
}

console.log(`\nDirección 100/100 v13.1.0 OK · ${passed}/${checks.length} checks passed.`);
