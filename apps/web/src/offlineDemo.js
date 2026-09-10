const OFFLINE_DEMO_STORE = 'buzzbee-offline-demo-state-v1';

const now = () => new Date().toISOString();
const clone = (value) => JSON.parse(JSON.stringify(value));

export const OFFLINE_DEMO_EMAIL = 'admin@erp.local';
export const OFFLINE_DEMO_PASSWORD = 'Admin123!';

export const offlineDemoUser = {
  id: 'offline-admin',
  email: OFFLINE_DEMO_EMAIL,
  firstName: 'Admin',
  lastName: 'Demo',
  companyId: 'offline-demo-company',
  active: true,
  company: {
    id: 'offline-demo-company',
    name: 'Empresa Demo Local',
    legalName: 'Empresa Demo Local, S.A. de C.V.',
    currency: 'MXN',
    country: 'MX',
    timezone: 'America/Monterrey',
  },
  roles: [{id: 'offline-admin-role', name: 'Administrador Demo', permissions: ['*']}],
};

function baseResponse() {
  return {
    ok: true,
    success: true,
    message: 'Operación simulada en Demo Local',
    company: offlineDemoUser.company,
    user: offlineDemoUser,
    summary: {},
    kpis: {},
    metrics: {},
    health: {},
    plan: {},
    subscription: {},
    billing: {},
    permissions: [],
    modules: [],
    companyModules: [],
    notifications: [],
    agenda: [],
    events: [],
    items: [],
    rows: [],
    data: [],
    products: [],
    categories: [],
    warehouses: [],
    balances: [],
    movements: [],
    requests: [],
    purchaseRequests: [],
    orders: [],
    purchaseOrders: [],
    receipts: [],
    suppliers: [],
    customers: [],
    prospects: [],
    activities: [],
    quotes: [],
    deliveries: [],
    invoices: [],
    returns: [],
    creditNotes: [],
    payments: [],
    collections: [],
    employees: [],
    departments: [],
    payrolls: [],
    incidents: [],
    documents: [],
    projects: [],
    tasks: [],
    timeEntries: [],
    campaigns: [],
    channels: [],
    owners: [],
    accounts: [],
    periods: [],
    entries: [],
    expenses: [],
    assets: [],
    statements: [],
    transactions: [],
    scenarios: [],
    transfers: [],
    integrations: [],
    connections: [],
    webhooks: [],
    apiKeys: [],
    entities: [],
    duplicates: [],
    users: [],
    roles: [],
    tickets: [],
    support: [],
    recentRequests: [],
    monthlyPurchases: [],
    recentActivity: [],
    criticalStock: [],
    upcoming: [],
    topSuppliers: [],
    topCustomers: [],
  };
}

const products = [
  {id:'p1', sku:'PAPEL-CARTA', name:'Caja papel carta premium', category:{id:'c1',name:'Consumibles'}, categoryId:'c1', unit:'PZA', cost:610, price:890, minStock:10, active:true},
  {id:'p2', sku:'DOCK-USBC', name:'Docking station USB-C', category:{id:'c2',name:'Equipo tecnológico'}, categoryId:'c2', unit:'PZA', cost:2450, price:3890, minStock:12, active:true},
  {id:'p3', sku:'LAP-PRO-14', name:'Laptop empresarial 14”', category:{id:'c2',name:'Equipo tecnológico'}, categoryId:'c2', unit:'PZA', cost:18200, price:26400, minStock:8, active:true},
  {id:'p4', sku:'SILLA-ERG', name:'Silla ergonómica ejecutiva', category:{id:'c3',name:'Mobiliario y oficina'}, categoryId:'c3', unit:'PZA', cost:4200, price:6900, minStock:6, active:true},
];

const employees = [
  {id:'e1', employeeNumber:'EMP-101', firstName:'Ana', lastName:'Martínez', email:'ana.martinez@demo.local', department:{name:'Comercial'}, position:{name:'Gerencia Comercial'}, branch:{name:'Sucursal Monterrey'}, hireDate:'2025-02-03', salary:48000, active:true},
  {id:'e2', employeeNumber:'EMP-102', firstName:'Luis', lastName:'Hernández', email:'luis.hernandez@demo.local', department:{name:'Comercial'}, position:{name:'Ejecutivo de Ventas'}, branch:{name:'Sucursal Monterrey'}, hireDate:'2025-02-03', salary:28000, active:true},
  {id:'e3', employeeNumber:'EMP-105', firstName:'Mónica', lastName:'Flores', email:'monica.flores@demo.local', department:{name:'Operaciones'}, position:{name:'Analista de Inventario'}, branch:{name:'Sucursal Guadalajara'}, hireDate:'2025-02-03', salary:25000, active:true},
];

const customers = [
  {id:'cu1', code:'CLI-001', legalName:'ACME México, S.A. de C.V.', commercialName:'ACME', taxId:'ACM010101AA1', contactName:'Óscar Peña', email:'compras@acme.demo', phone:'8110001000', creditDays:30, creditLimit:500000, active:true},
  {id:'cu2', code:'CLI-002', legalName:'Nova Retail, S.A. de C.V.', commercialName:'Nova Retail', taxId:'NRE020202BB2', contactName:'Laura Ruiz', email:'finanzas@nova.demo', phone:'8110002000', creditDays:15, creditLimit:250000, active:true},
];

const suppliers = [
  {id:'s1', code:'PROV-001', legalName:'Tecnología del Norte SA de CV', commercialName:'TecNorte', taxId:'TNO010101AA1', active:true},
  {id:'s2', code:'PROV-002', legalName:'MobiCorp SA de CV', commercialName:'MobiCorp', taxId:'MOB020202BB2', active:true},
];

const purchaseRequests = [
  {id:'pr1', folio:'SOL-DEMO-0001', area:'Almacén General Monterrey', requester:'Admin Demo', amount:194400, status:'Aprobada', createdAt:'2026-09-03T12:00:00Z'},
  {id:'pr2', folio:'SOL-DEMO-0002', area:'Almacén de Refacciones', requester:'Admin Demo', amount:59900, status:'Aprobada', createdAt:'2026-09-03T13:00:00Z'},
];

const warehouses = [
  {id:'w1', code:'MTY-GEN', name:'Almacén General Monterrey', active:true, branch:{id:'b1',name:'Sucursal Monterrey'}},
  {id:'w2', code:'CDMX-GEN', name:'Almacén General CDMX', active:true, branch:{id:'b2',name:'Sucursal Ciudad de México'}},
];

const fixtures = {
  '/auth/me': {user: offlineDemoUser, sessionKind:'erp', offlineDemo:true},
  '/company': {...offlineDemoUser.company, commercialName:'Empresa Demo Local', taxId:'XAXX010101000', email:'contacto@demo.local', phone:'81 1000 0000', website:'https://buzzbee.demo', address:'Monterrey, N.L.'},
  '/dashboard': {
    company: offlineDemoUser.company,
    user: offlineDemoUser,
    kpis:{pendingRequests:2,ordersThisMonth:4,purchaseChange:12.4,inventoryValue:738420,criticalStock:4},
    recentRequests: purchaseRequests,
    monthlyPurchases:[
      {key:'2026-04',year:2026,month:4,date:'2026-04-01',total:82000},
      {key:'2026-05',year:2026,month:5,date:'2026-05-01',total:104000},
      {key:'2026-06',year:2026,month:6,date:'2026-06-01',total:92000},
      {key:'2026-07',year:2026,month:7,date:'2026-07-01',total:225504},
      {key:'2026-08',year:2026,month:8,date:'2026-08-01',total:118000},
      {key:'2026-09',year:2026,month:9,date:'2026-09-01',total:146000},
    ],
    notifications:[{id:'n1',title:'Stock bajo detectado',message:'Silla ergonómica ejecutiva está por debajo del mínimo en Monterrey.',read:false,createdAt:now()}],
    criticalStock:[{product:products[3],warehouse:warehouses[0],quantity:4,minStock:6}],
    criticalProducts:[
      {sku:'SILLA-ERG',name:'Silla ergonómica ejecutiva',warehouse:'Almacén General Monterrey',stock:4,min:6},
      {sku:'PAPEL-CARTA',name:'Caja papel carta premium',warehouse:'Almacén General CDMX',stock:0,min:10},
    ],
    upcoming:[{id:'u1',title:'Cobro CLI-001',date:'2026-09-12',type:'Cobro'}],
    agenda:[{id:'u1',title:'Cobro CLI-001',date:'2026-09-12',type:'RECEIVABLE',meta:'ACME',amount:1032.4}],
    categorySpend:[
      {label:'Equipo tecnológico',percent:52},
      {label:'Mobiliario y oficina',percent:28},
      {label:'Consumibles',percent:20},
    ],
    topSuppliers:[{supplier:suppliers[0],orders:3,total:225504}],
    topCustomers:[{customer:customers[0],invoices:2,balance:301396}],
  },
  '/products': {products, categories:[{id:'c1',name:'Consumibles'},{id:'c2',name:'Equipo tecnológico'},{id:'c3',name:'Mobiliario y oficina'}]},
  '/warehouses': {warehouses},
  '/inventory/balances': {balances: products.map((product,index)=>({id:`bal${index}`,product,warehouse:warehouses[index%2],quantity:[0,9,7,4][index],available:[0,9,7,4][index],minStock:product.minStock}))},
  '/inventory/movements': {movements:[{id:'m1',occurredAt:now(),type:'IN',product:products[1],warehouse:warehouses[0],reference:'REC-DEMO-01',quantity:8,balanceAfter:9,createdBy:{firstName:'Admin',lastName:'Demo'}}]},
  '/inventory-operations': {warehouses,products,transfers:[],adjustments:[],recentMovements:[]},
  '/human-resources': {employees,departments:[{id:'d1',name:'Comercial'},{id:'d2',name:'Operaciones'}],summary:{totalEmployees:employees.length,departments:2,monthlyPayroll:101000,activeEmployees:employees.length}},
  '/suppliers': {suppliers},
  '/customers': {customers},
  '/purchase-requests': {requests:purchaseRequests,purchaseRequests},
  '/purchase-orders': {orders:[{id:'po1',folio:'OC-DEMO-0001',supplier:suppliers[0],status:'APPROVED',total:140824,createdAt:'2026-08-28'}],purchaseOrders:[{id:'po1',folio:'OC-DEMO-0001',supplier:suppliers[0],status:'APPROVED',total:140824,createdAt:'2026-08-28'}]},
  '/receipts': {receipts:[]},
  '/procurement/dashboard': {summary:{pendingRequests:0,openOrders:1,monthlySpend:225504,pendingReceipts:0},recentRequests:purchaseRequests,purchaseOrders:[{id:'po1',folio:'OC-DEMO-0001',supplier:suppliers[0],total:140824,status:'APPROVED'}],topSuppliers:[{supplier:suppliers[0],orders:3,total:225504}]},
  '/accounts-payable': {summary:{invoiced:220168,paid:60000,pending:160168,overdue:79344},invoices:[{id:'ap1',folio:'PROV-DEMO-MOB-1902',supplier:suppliers[1],dueDate:'2026-08-29',total:79344,balance:79344,status:'OVERDUE'},{id:'ap2',folio:'PROV-DEMO-TEC-8821',supplier:suppliers[0],dueDate:'2026-08-28',total:140824,balance:80824,status:'PARTIAL'}]},
  '/accounts-receivable': {summary:{invoiced:446396,collected:145000,pending:301396,overdue:0},invoices:[]},
  '/collections': {summary:{total:101032.4,applied:81032.4,unapplied:20000},payments:[{id:'pay1',folio:'COB-2026-0002',customer:customers[0],date:'2026-09-07',method:'TRANSFER',accountName:'BBVA Operativa',amount:1032.4,applied:1032.4,unapplied:0,status:'Applied'},{id:'pay2',folio:'COB-DEMO-0001',customer:customers[0],date:'2026-08-30',method:'TRANSFER',accountName:'BBVA Operativa',amount:100000,applied:80000,unapplied:20000,status:'Applied'}]},
  '/sales': {summary:{salesThisMonth:1032,openQuotes:1,activeOrders:0,pendingCollections:345364,activeProspects:2},quotes:[{id:'q1',folio:'COT-DEMO-001',customer:customers[0],status:'OPEN',total:1032}],orders:[],customers},
  '/sales-enterprise/dashboard': {summary:{salesThisMonth:1032,openQuotes:1,activeOrders:0,pendingCollections:345364,activeProspects:2},pipeline:[{stage:'PROSPECT',label:'Prospecto',value:335000,count:2},{stage:'WON',label:'Ganado',value:420000,count:1}],activities:[{id:'a1',title:'Prospecto convertido a cliente',description:'Cuenta demo convertida a cliente',createdAt:now()}]},
  '/sales-enterprise/prospects': {prospects:[{id:'lead1',name:'Óscar Peña',companyName:'Hoteles Camino Real del Norte',stage:'LEAD',value:240000,probability:50},{id:'lead2',name:'Arturo Lozano',companyName:'Logística Delta',stage:'QUALIFIED',value:95000,probability:35}]},
  '/marketing/dashboard': {campaigns:[{id:'camp1',name:'Roadshow Empresarial Norte 2026',channelName:'Eventos B2B',status:'ACTIVE',budget:42000,spend:42000,leads:24,revenue:0,roas:0},{id:'camp2',name:'Nurturing · Base comercial',channelName:'Email marketing',status:'ACTIVE',budget:4800,spend:4800,leads:60,revenue:247237,roas:51.51}],events:[],channels:[],owners:employees,summary:{activeCampaigns:2,spend:46800,budget:46800,leads:84,cpl:557.14,revenue:247237,conversions:1,roi:428.3,roas:5.28,ctr:4.2}},
  '/projects/dashboard': {projects:[{id:'proj1',code:'PRY-DEMO-002',name:'Expansión operación Horizonte',description:'Proyecto demo de expansión operativa',status:'PLANNING',priority:'HIGH',budget:750000,plannedHours:420,tags:'Expansión',customer:customers[0],manager:employees[0],tasks:[],timeEntries:[]}],employees,customers,salesOrders:[],purchaseOrders:[],summary:{total:1,active:0,planning:1,budget:750000}},
  '/administration/dashboard': {summary:{suppliers:2,customerBalance:446396,employees:employees.length,payroll:101000,criticalStock:4},topSuppliers:[{supplier:'TecNorte',orders:1,total:225504}],customerBalances:[{customer:'ACME',invoices:2,balance:301396},{customer:'Nova Retail',invoices:1,balance:145000}],humanCapital:[{department:'Comercial',employees:2,payroll:76000},{department:'Operaciones',employees:1,payroll:25000}],criticalStock:[{product:products[0],warehouse:warehouses[1],quantity:0,minStock:10},{product:products[3],warehouse:warehouses[0],quantity:4,minStock:6}]},
  '/agenda': {events:[{id:'ag1',title:'Seguimiento ACME',startAt:'2026-09-12T15:00:00Z',type:'CRM',priority:'HIGH'}]},
  '/agenda/meta': {types:['CRM','FINANCE','HR','PROCUREMENT'],priorities:['LOW','MEDIUM','HIGH']},
  '/activity/notifications': {notifications:[{id:'n1',title:'Demo local activa',message:'Todos los datos se ejecutan en el navegador.',read:false,createdAt:now()}]},
  '/modules/dashboard': {companyModules:[
    'inicio','aprobaciones','ventas','crm','compras','inventario','finanzas','facturacion-fiscal','rrhh','reportes','pos','produccion','proyectos','marketing'
  ].map((key)=>({id:`cm-${key}`,enabled:true,module:{id:key,key,name:key}})),modules:[]},
  '/admin/users': {users:[offlineDemoUser]},
  '/admin/roles': {roles:[{id:'offline-admin-role',name:'Administrador Demo',description:'Acceso total al frontend demo',permissions:['*']}]},
  '/reports/demo-readiness': {score:100,ready:true,checks:[]},
  '/reports/demo': {summary:{revenue:399237,pipeline:335000,inventoryValue:738420,employees:employees.length},demoStory:[],modules:[]},
  '/intelligence/dashboard': {summary:{alerts:2,opportunities:3,score:88},insights:[{id:'i1',title:'Inventario crítico',description:'Revisar mínimos de inventario en Monterrey.',severity:'warning'}]},
  '/pos/dashboard': {summary:{salesToday:12500,tickets:18,averageTicket:694},products,transactions:[]},
  '/production/dashboard': {summary:{orders:3,inProgress:2,efficiency:91},orders:[],workCenters:[]},
  '/flow/dashboard': {summary:{active:2,runsToday:6,successRate:100},flows:[]},
  '/flow/catalog': {triggers:[],actions:[]},
  '/data-hub/dashboard': {summary:{imports:3,rows:820,errors:0},jobs:[]},
  '/data-hub/definitions': {definitions:[]},
  '/expenses/dashboard': {summary:{month:48750,pending:2,approved:8},expenses:[]},
  '/expenses': {expenses:[]},
  '/fixed-assets/dashboard': {summary:{assets:12,bookValue:980000,depreciation:125000},assets:[]},
  '/fixed-assets': {assets:[]},
  '/treasury': {summary:{balance:825000,inflows:145000,outflows:92300},accounts:[],movements:[]},
  '/bank-reconciliation': {summary:{pending:2,reconciled:18,difference:0},accounts:[],statements:[],transactions:[]},
  '/accounting': {summary:{accounts:24,entries:14,openPeriods:1},accounts:[],periods:[],entries:[]},
};

function getPersisted() {
  try { return JSON.parse(localStorage.getItem(OFFLINE_DEMO_STORE) || '{}'); } catch { return {}; }
}

function setPersisted(next) {
  try { localStorage.setItem(OFFLINE_DEMO_STORE, JSON.stringify(next)); } catch { /* demo remains ephemeral */ }
}

function normalizePath(path) {
  const raw = String(path || '/').split('?')[0];
  return raw.length > 1 && raw.endsWith('/') ? raw.slice(0,-1) : raw;
}

function readFixture(path) {
  const persisted = getPersisted();
  const exact = persisted[path] ?? fixtures[path];
  if (exact) return {...baseResponse(), ...clone(exact)};

  // Common detail routes inherit their collection fixture so pages never contact the API.
  if (/^\/customers\//.test(path)) return {...baseResponse(), customer: customers[0], ...clone(persisted['/customers'] || fixtures['/customers'])};
  if (/^\/products\//.test(path)) return {...baseResponse(), product: products[0], ...clone(persisted['/products'] || fixtures['/products'])};
  if (/^\/projects\//.test(path)) return {...baseResponse(), project: clone((persisted['/projects/dashboard'] || fixtures['/projects/dashboard']).projects[0])};
  if (/^\/business-parties/.test(path)) return {...baseResponse(), parties:[...customers,...suppliers],customers,suppliers,duplicates:[]};
  if (/^\/sales-fulfillment/.test(path)) return {...baseResponse(),summary:{pendingDeliveries:0,pendingInvoices:0},deliveries:[],invoices:[],orders:[]};
  if (/^\/sales-returns/.test(path)) return {...baseResponse(),summary:{returns:0,creditNotes:0},returns:[],creditNotes:[]};
  if (/^\/order-to-cash/.test(path)) return {...baseResponse(),summary:{quotes:1,orders:0,deliveries:0,invoices:1,collections:2},customers,quotes:fixtures['/sales'].quotes,orders:[],deliveries:[],invoices:[],payments:fixtures['/collections'].payments};
  if (/^\/hr-operations/.test(path)) return {...baseResponse(),employees,summary:{employees:employees.length,incidents:0,attendance:100},incidents:[],attendance:[]};
  if (/^\/payroll/.test(path)) return {...baseResponse(),employees,summary:{employees:employees.length,gross:101000,net:84000},payrolls:[]};
  if (/^\/employee-documents/.test(path)) return {...baseResponse(),employees,documents:[]};
  if (/^\/fiscal/.test(path)) return {...baseResponse(),summary:{invoices:3,subtotal:399237,tax:63878,total:463115},invoices:[]};
  if (/^\/approvals/.test(path)) return {...baseResponse(),summary:{pending:2,approved:8,rejected:0},approvals:purchaseRequests};
  if (/^\/integrations/.test(path)) return {...baseResponse(),summary:{active:0,errors:0},integrations:[],connections:[],webhooks:[],apiKeys:[]};
  if (/^\/master-data/.test(path)) return {...baseResponse(),summary:{entities:0,issues:0},entities:[],issues:[]};
  if (/^\/billing/.test(path)) return {...baseResponse(),plan:{id:'demo',name:'Business OS Demo'},subscription:{status:'ACTIVE',billingCycle:'MONTHLY'},invoices:[]};
  if (/^\/cash-flow/.test(path)) return {...baseResponse(),summary:{opening:825000,inflows:145000,outflows:92300,closing:877700},scenarios:[]};

  return baseResponse();
}

function mutationResult(path, body = {}) {
  const response = baseResponse();
  const id = `offline-${Date.now()}`;
  if (/^\/projects(?:\/[^/]+)?$/.test(path)) response.project = {id,...body};
  if (/^\/customers(?:\/[^/]+)?$/.test(path)) response.customer = {id,...body};
  if (/^\/products(?:\/[^/]+)?$/.test(path)) response.product = {id,...body};
  if (/^\/business-parties(?:\/[^/]+)?$/.test(path)) response.party = {id,...body};
  if (/^\/billing\/change-plan$/.test(path)) response.subscription = {status:'ACTIVE',...body};
  return response;
}

export async function offlineDemoRequest(path, options = {}) {
  // Keep async behavior so loading states behave exactly like production without network I/O.
  await new Promise((resolve) => setTimeout(resolve, 60));
  const normalized = normalizePath(path);
  const method = String(options.method || 'GET').toUpperCase();
  if (method === 'GET') return readFixture(normalized);

  const result = mutationResult(normalized, options.body ?? options.data ?? {});
  // Store exact responses for simple settings-style PUTs so the demo feels stateful.
  if (normalized === '/company' && (method === 'PUT' || method === 'PATCH')) {
    const next = {...fixtures['/company'], ...(options.body || {})};
    const persisted = getPersisted();
    persisted['/company'] = next;
    setPersisted(persisted);
    return {...baseResponse(), ...clone(next)};
  }
  return result;
}

export function resetOfflineDemo() {
  try { localStorage.removeItem(OFFLINE_DEMO_STORE); } catch { /* noop */ }
}
