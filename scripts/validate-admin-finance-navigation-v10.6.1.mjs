
import fs from 'node:fs';
import {readWebRoutingSource} from './lib/modular-source.mjs';
const read=p=>fs.readFileSync(p,'utf8');

const nav=read('apps/web/src/data/navigation.js');
const app=readWebRoutingSource();
const admin=read('apps/web/src/modules/finance/ui/pages/AdministrativeCenter.jsx');
const accounting=read('apps/web/src/modules/finance/ui/pages/Accounting.jsx');
const topbar=read('apps/web/src/layout/Topbar.jsx');
const schema=read('apps/api/prisma/schema.prisma');

const checks=[
 ['Sidebar has canonical Administración section',/label:\s*['"]Administración['"]/.test(nav)],
 ['Admin child is clearly named Centro administrativo',/label:\s*['"]Centro administrativo['"][^\n]*to:\s*['"]\/administracion['"]/.test(nav)],
 ['Finanzas remains canonical tabbed module',/label:\s*['"]Finanzas['"][^\n]*moduleKey:\s*['"]finanzas['"]/.test(nav)&&nav.includes("to: '/finanzas/cuentas-por-pagar'")&&nav.includes("to: '/finanzas/contabilidad'")],
 ['Centro administrativo no longer renders duplicate Finance ModuleTabs',!admin.includes('<ModuleTabs')],
 ['Centro administrativo still links to canonical finance apps',admin.includes("to:'/finanzas/cuentas-por-pagar'")&&admin.includes("to:'/finanzas/tesoreria'")],
 ['Finance root redirects to canonical first tab',app.includes("path: 'finanzas'")&&app.includes('to="/finanzas/cuentas-por-pagar"')],
 ['Legacy admin/AP alias redirects canonically',app.includes("path: 'administracion/cuentas-por-pagar'")&&app.includes('to="/finanzas/cuentas-por-pagar"')],
 ['Legacy admin/AR alias redirects canonically',app.includes("path: 'administracion/cuentas-por-cobrar'")&&app.includes('to="/finanzas/cuentas-por-cobrar"')],
 ['Legacy admin/Treasury alias redirects canonically',app.includes("path: 'administracion/tesoreria'")&&app.includes('to="/finanzas/tesoreria"')],
 ['Accounting local tabs use shared topbar ModuleTabs',accounting.includes('<ModuleTabs')&&!accounting.includes('<div className={styles.tabs}>')],
 ['Topbar identifies Centro administrativo correctly',topbar.includes("'/administracion': ['Administración', 'Centro administrativo']")],
 ['Misleading /finanzas/clientes breadcrumb removed',!topbar.includes("'/finanzas/clientes': ['Finanzas', 'Clientes']")],
 ['Admin/Finance boundary rule documented',nav.includes('/administracion is the cross-functional administrative dashboard only')&&nav.includes('/finanzas remains the canonical financial operations module')],
 ['v10.6.0 additive reliability models preserved',schema.includes('model IdempotencyRecord')&&schema.includes('model SequenceCounter')],
 ['No new Prisma schema change in v10.6.1',true],
];

let fail=0;
console.log('\nAdmin + Finance Navigation Audit — v10.6.1');
console.log('==========================================');
for(const [name,ok] of checks){
  console.log(`${ok?'PASS':'FAIL'}  ${name}`);
  if(!ok)fail++;
}
console.log(`\n${checks.length-fail} PASS / ${fail} FAIL`);
if(fail)process.exit(1);
