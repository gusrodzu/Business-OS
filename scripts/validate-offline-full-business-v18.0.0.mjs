import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {offlineDemoRequest} from '../apps/web/src/offlineDemo.js';

// Node runners do not always provide usable browser storage. Keep demo UAT isolated.
const demoStorage=new Map();
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>demoStorage.get(key)??null,setItem:(key,value)=>demoStorage.set(key,String(value)),removeItem:key=>demoStorage.delete(key),clear:()=>demoStorage.clear()}});

const coverage = [
  ['/products', ['products', 'categories']],
  ['/warehouses', ['warehouses', 'branches']],
  ['/purchase-requests', ['requests', 'products', 'warehouses']],
  ['/purchase-orders', ['orders', 'suppliers', 'warehouses']],
  ['/receipts', ['receipts', 'orders']],
  ['/inventory/balances', ['balances', 'warehouses', 'products']],
  ['/inventory/movements', ['movements', 'warehouses', 'products']],
  ['/inventory-operations', ['transfers', 'adjustments', 'balances']],
  ['/human-resources', ['employees', 'departments', 'positions', 'branches']],
  ['/hr-operations', ['employees', 'attendance', 'leaves', 'incidents']],
  ['/employee-documents', ['employees', 'documents']],
  ['/payroll', ['periods', 'employees']],
  ['/customers', ['customers']],
  ['/suppliers', ['suppliers']],
  ['/sales', ['quotes', 'orders']],
  ['/sales-enterprise/dashboard', ['prospects', 'activities', 'pipeline']],
  ['/sales-fulfillment', ['orders', 'deliveries', 'invoices']],
  ['/sales-returns', ['returns', 'creditNotes', 'deliveries']],
  ['/collections', ['payments', 'receivables', 'accounts', 'customers']],
  ['/business-parties/dashboard', ['parties', 'recentActivity']],
  ['/marketing/dashboard', ['campaigns', 'prospects', 'customers']],
  ['/projects/dashboard', ['projects', 'employees', 'customers']],
  ['/production/dashboard', ['orders', 'boms', 'workCenters']],
  ['/pos/dashboard', ['products', 'customers', 'warehouses', 'sales', 'sessions', 'terminals']],
  ['/accounts-payable', ['invoices']],
  ['/accounts-payable/catalogs', ['suppliers', 'purchaseOrders', 'accounts']],
  ['/accounts-receivable', ['invoices']],
  ['/accounts-receivable/catalogs', ['customers', 'accounts']],
  ['/treasury', ['accounts', 'movements']],
  ['/bank-reconciliation', ['accounts', 'statements', 'transactions']],
  ['/accounting', ['accounts', 'periods', 'entries', 'trialBalance']],
  ['/expenses/dashboard', ['expenses', 'categories', 'employees']],
  ['/fixed-assets/dashboard', ['assets', 'categories']],
  ['/budgets', ['costCenters', 'budgets', 'monthly']],
  ['/cash-flow', ['timeline', 'accounts', 'scenarios', 'receivables', 'payables']],
  ['/fiscal/dashboard', ['customers', 'invoices', 'salesInvoices']],
  ['/approvals/dashboard', ['workflows', 'requests', 'inbox']],
  ['/master-data/dashboard', ['catalogs', 'issues', 'recentActivity']],
  ['/master-data/entities', ['products', 'customers', 'suppliers', 'employees']],
  ['/data-hub/dashboard', ['jobs', 'definitions']],
  ['/integrations/catalog', ['providers', 'events']],
  ['/integrations/dashboard', ['connections', 'webhooks', 'apiKeys', 'deliveries']],
  ['/flow/catalog', ['triggerEvents', 'actionTypes', 'users']],
  ['/flow/dashboard', ['flows', 'runs']],
  ['/modules/dashboard', ['modules', 'companyModules', 'plans', 'subscriptions']],
  ['/billing/dashboard', ['invoices', 'methods', 'changes']],
  ['/admin/users', ['users']],
  ['/admin/roles', ['roles', 'permissions']],
  ['/activity/notifications', ['notifications']],
  ['/activity/activity', ['logs']],
  ['/agenda', ['items', 'events']],
  ['/agenda/meta', ['types', 'priorities', 'employees']],
  ['/reports/executive', ['monthly', 'decisions', 'supplierSpend', 'customerBalances']],
  ['/reports/demo', ['demoStory', 'actionItems', 'insights', 'readiness']],
  ['/intelligence/dashboard', ['insights', 'definitions']],
];

let assertions = 0;
const get = async (path) => offlineDemoRequest(path);
const post = async (path, body = {}) => offlineDemoRequest(path, {method: 'POST', body});

for (const [path, keys] of coverage) {
  const response = await get(path);
  assert.equal(response.ok, true, `${path} no respondió en modo offline`);
  for (const key of keys) {
    assert.ok(Array.isArray(response[key]), `${path}.${key} debe ser un arreglo`);
    assert.ok(response[key].length > 0, `${path}.${key} debe contener datos demo`);
    assertions += 2;
  }
}

const company = await get('/company');
assert.equal(company.company.legalName, 'MotorNorte Refacciones Automotrices, S.A. de C.V.');
assert.equal(company.branches.length, 3);
assertions += 2;

const [suppliers, customers, employees, purchases, receipts, fulfillment, payroll, documents, projects, pos] = await Promise.all([
  get('/suppliers'), get('/customers'), get('/human-resources'), get('/purchase-orders'), get('/receipts'),
  get('/sales-fulfillment'), get('/payroll'), get('/employee-documents'), get('/projects/dashboard'), get('/pos/dashboard'),
]);
const supplierIds = new Set(suppliers.suppliers.map(({id}) => id));
const customerIds = new Set(customers.customers.map(({id}) => id));
const employeeIds = new Set(employees.employees.map(({id}) => id));
const purchaseIds = new Set(purchases.orders.map(({id}) => id));
assert.ok(purchases.orders.every((order) => supplierIds.has(order.supplierId || order.supplier?.id)), 'Compras debe enlazar proveedores existentes');
assert.ok(receipts.receipts.every((receipt) => purchaseIds.has(receipt.purchaseOrderId || receipt.purchaseOrder?.id)), 'Recepciones debe enlazar órdenes existentes');
assert.ok(fulfillment.invoices.every((invoice) => customerIds.has(invoice.customerId || invoice.customer?.id)), 'Facturas debe enlazar clientes existentes');
assert.ok(payroll.periods.flatMap((period) => period.items || []).every((item) => employeeIds.has(item.employeeId || item.employee?.id)), 'Nómina debe enlazar empleados existentes');
assert.ok(documents.documents.every((document) => employeeIds.has(document.employeeId || document.employee?.id)), 'Expedientes debe enlazar empleados existentes');
assert.ok(employeeIds.has(projects.projects[0].managerId || projects.projects[0].manager?.id), 'Proyecto debe enlazar un responsable existente');
assert.ok(pos.sales.every((sale) => !sale.customerId || customerIds.has(sale.customerId)), 'POS debe enlazar clientes existentes');
assertions += 7;

const mutations = [
  ['/ai/ask', {question: '¿Qué debo atender hoy?'}, 'answer'],
  ['/intelligence/scan', {}, 'detected'],
  ['/employee-documents/upload', {employeeId: employees.employees[0].id}, 'file'],
  ['/expenses', {description: 'Mensajería local', amount: 480}, 'expense'],
  ['/fixed-assets', {name: 'Escáner de diagnóstico'}, 'asset'],
  [`/accounts-payable/${(await get('/accounts-payable')).invoices[0].id}/payments`, {amount: 1000}, 'invoice'],
  ['/business-parties/sync', {}, 'updated'],
  ['/data-hub/preview', {}, 'job'],
  ['/integrations/api-keys', {}, 'secret'],
  ['/integrations/webhooks/demo/test', {}, 'result'],
  ['/integrations/queue/process', {}, 'result'],
  ['/flow/demo/test', {}, 'run'],
  ['/production/orders', {quantity: 4}, 'order'],
  ['/marketing/campaigns', {name: 'Afinación de otoño'}, 'campaign'],
  ['/pos/sessions', {terminalId: 'term-1'}, 'session'],
  ['/pos/sales', {total: 1250}, 'sale'],
];

for (const [path, body, key] of mutations) {
  const response = await post(path, body);
  assert.ok(response[key] !== undefined && response[key] !== null, `${path} debe regresar ${key}`);
  assertions += 1;
}

const moduleRoot = path.resolve('apps/web/src/modules');
const componentFiles = [];
for (const moduleName of fs.readdirSync(moduleRoot)) {
  const routesFile = path.join(moduleRoot, moduleName, 'routes.jsx');
  if (!fs.existsSync(routesFile) || moduleName === 'platform') continue;
  const routesSource = fs.readFileSync(routesFile, 'utf8');
  for (const match of routesSource.matchAll(/lazy\(\(\)=>import\(['"](.+?)['"]\)\)/g)) {
    let componentFile = path.resolve(path.dirname(routesFile), match[1]);
    if (!path.extname(componentFile)) componentFile += '.jsx';
    componentFiles.push(componentFile);
  }
}
// These routes are intentionally handled outside the generic fixture GET scanner.
// Validate actual calendar methods and IDs instead of issuing GET against mutation-only endpoints.
const calendarMeta=await get('/agenda/meta');
const calendarPayload={title:'QA offline calendar contract',startAt:'2026-11-26T15:00:00Z',endAt:'2026-11-26T16:00:00Z',allDay:false,priority:'NORMAL',status:'ACTIVE',assigneeEmployeeId:calendarMeta.employees[0].id};
const calendarCreated=(await post('/agenda/events',calendarPayload)).event;
const calendarPath='/agenda/events/'+calendarCreated.id;
assert.equal((await get(calendarPath)).event.title,calendarPayload.title);
await offlineDemoRequest(calendarPath,{method:'PUT',body:{...calendarPayload,title:'QA actualizado'}});
assert.equal((await get(calendarPath)).event.title,'QA actualizado');
await offlineDemoRequest(calendarPath+'/status',{method:'PATCH',body:{status:'COMPLETED'}});
assert.equal((await get(calendarPath)).event.status,'COMPLETED');
await offlineDemoRequest(calendarPath,{method:'DELETE'});
await assert.rejects(get(calendarPath));
assertions+=4;
const exactMethodContracts=new Set(['/agenda/events','/agenda/events/','/agenda/events/${modal.id}','/agenda/events/${modal.id}/status']);
// Messenger explicitly bypasses API in offline sessions; the browser audit exercises its real demo UI.
const messengerLiveOnly=new Set(['/messenger/contacts','/messenger/direct/']);
const endpointTemplates = new Set();
for (const componentFile of componentFiles) {
  if (!fs.existsSync(componentFile)) continue;
  const source = fs.readFileSync(componentFile, 'utf8');
  for (const match of source.matchAll(/apiRequest\(\s*([`'"])(.+?)\1/gs)) endpointTemplates.add(match[2].trim());
}
const representativeEndpoint = (template) => {
  let value = template.replace(/\$\{[^}]+\}/g, 'demo-id').replace(/\?demo-id$/, '?year=2026');
  if (value.includes('?') && !value.includes('=')) value = value.split('?')[0];
  return value.startsWith('/') ? value : `/${value}`;
};
const standardKeys = new Set(['ok', 'success', 'message', 'company', 'user', 'summary', 'kpis', 'metrics', 'health', 'plan', 'subscription', 'billing', 'permissions', 'modules', 'companyModules']);
for (const template of endpointTemplates) {
  if(exactMethodContracts.has(template)||messengerLiveOnly.has(template))continue;
  const endpoint = representativeEndpoint(template);
  const response = await get(endpoint);
  const hasBusinessContent = Object.entries(response).some(([key, value]) => !standardKeys.has(key) && (
    (Array.isArray(value) && value.length > 0)
    || (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0)
    || (typeof value === 'string' && value.length > 0)
  ));
  assert.ok(hasBusinessContent, `${endpoint} debe incluir contenido empresarial simulado`);
  assertions += 1;
}

const unknown = await get('/cualquier-modulo/consulta-no-registrada');
assert.equal(unknown.ok, true);
assert.equal(unknown.company.id, 'offline-demo-company');
assert.deepEqual(unknown.rows, []);
assertions += 3;

console.log(`PASS · ${coverage.length} zonas de consulta con datos empresariales`);
console.log(`PASS · ${endpointTemplates.size} endpoints usados por pantallas contienen información demo`);
console.log('PASS · relaciones empleados/clientes/proveedores/compras/ventas/POS');
console.log(`PASS · ${mutations.length} contratos de acciones simuladas`);
console.log('PASS · fallback universal sin red para rutas desconocidas');
console.log(`\nOffline Full Business Demo: ${assertions} aserciones PASS`);
