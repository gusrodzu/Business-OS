import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const files={
  service:path.join(root,'apps/api/src/services/administrativeCenter.js'),
  route:path.join(root,'apps/api/src/modules/operations/api/administrativeCenter.js'),
  page:path.join(root,'apps/web/src/modules/finance/ui/pages/AdministrativeCenter.jsx'),
  css:path.join(root,'apps/web/src/modules/finance/ui/pages/AdministrativeCenter.module.css'),
};
const source=Object.fromEntries(Object.entries(files).map(([k,p])=>[k,fs.readFileSync(p,'utf8')]));

const checks=[
  ['Aprobaciones integradas',source.service.includes('prisma.approvalRequest.findMany')&&source.service.includes('agedApprovals')],
  ['Compras y recepciones integradas',source.service.includes('prisma.purchaseRequest.findMany')&&source.service.includes('prisma.purchaseOrder.findMany')&&source.service.includes('overdueOrders')],
  ['Expedientes RH integrados',source.service.includes('prisma.employeeDocument.findMany')&&source.service.includes('expiredDocuments')&&source.service.includes('expiringDocuments')],
  ['Nómina integrada',source.service.includes('prisma.payrollPeriod.findMany')&&source.service.includes('overduePayroll')],
  ['Agenda integrada',source.service.includes('prisma.agendaEvent.findMany')&&source.service.includes('agendaNext7')],
  ['Notificaciones integradas',source.service.includes('prisma.notification.count')&&source.service.includes('unreadNotifications')],
  ['Auditoría integrada',source.service.includes('prisma.auditLog.findMany')&&source.service.includes('activity')],
  ['Presupuesto mensual vs ejecución',source.service.includes('budgetMonth')&&source.service.includes('budgetExecution')&&source.service.includes('budgetRemaining')],
  ['Capital de trabajo',source.service.includes('workingCapital:treasuryBalance+receivableBalance-payableBalance')],
  ['Score administrativo',source.service.includes('healthScore')&&source.service.includes('healthStatus')&&source.service.includes("healthScore=clamp")],
  ['Bandeja unificada',source.service.includes('const queue=[]')&&source.service.includes('queue.sort')&&source.service.includes("kind:'PAYABLE'")&&source.service.includes("kind:'APPROVAL'")],
  ['Semáforo de procesos',source.service.includes('processStatus')&&source.service.includes("label:'Aprobaciones'")&&source.service.includes("label:'Expedientes laborales'")],
  ['Contexto de usuario en dashboard',source.route.includes('getAdministrativeCenter(req.auth.companyId, req.auth.sub)')],
  ['KPIs navegables',source.page.includes('<KpiCard onClick=')&&source.page.includes("navigate('/finanzas/tesoreria')")],
  ['Salud administrativa visible',source.page.includes('Salud administrativa')&&source.page.includes('data.health?.score')],
  ['Centro de pendientes visible',source.page.includes('Centro de pendientes')&&source.page.includes('filteredQueue.map')],
  ['Filtros de pendientes',source.page.includes("queueFilter==='HIGH'")&&source.page.includes("queueFilter==='MEDIUM'")],
  ['Estado de procesos visible',source.page.includes('Estado de procesos')&&source.page.includes('data.processStatus')],
  ['Próximos 7 días visibles',source.page.includes('Próximos 7 días')&&source.page.includes('data.upcoming?.agenda')],
  ['Actividad y trazabilidad visible',source.page.includes('Actividad reciente')&&source.page.includes('data.activity')],
  ['Apps administrativas conectadas',source.page.includes("title:'Aprobaciones'")&&source.page.includes("title:'Compras'")&&source.page.includes("title:'Nómina'")&&source.page.includes("title:'Agenda'")],
  ['Textos sin recorte',source.css.includes('white-space:normal')&&source.css.includes('overflow-wrap:anywhere')&&source.css.includes('min-width:0')],
  ['Responsive administrativo',source.css.includes('@media(max-width:1180px)')&&source.css.includes('.controlGrid,.secondaryGrid{grid-template-columns:1fr}')],
  ['Responsive móvil profundo',source.css.includes('@media(max-width:520px)')&&source.css.includes('.healthFacts{grid-template-columns:1fr}')],
];

let passed=0;
for(const [name,ok] of checks){
  if(ok){passed++;console.log(`✓ ${name}`)}else console.error(`✗ ${name}`);
}
if(passed!==checks.length){
  console.error(`\nAdministración 100/100 v13.2.0 FALLÓ · ${passed}/${checks.length} checks`);
  process.exit(1);
}
console.log(`\nAdministración 100/100 v13.2.0 OK · ${passed}/${checks.length} checks passed.`);
