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
    positions: [],
    branches: [],
    leaves: [],
    attendance: [],
    approvals: [],
    issues: [],
    insights: [],
    workCenters: [],
    flows: [],
    runs: [],
    jobs: [],
    definitions: [],
    paymentComplements: [],
    costCenters: [],
    risks: [],
    sales: [],
    stages: [],
    terminals: [],
    trialBalance: [],
    adjustments: [],
    actionItems: [],
    attention: [],
    budgets: [],
    demoStory: [],
    recentMovements: [],
    salesInvoices: [],
    timeline: [],
    payables: [],
    providers: [],
    queue: [],
    triggerEvents: [],
    actionTypes: [],
    approvalWorkflows: [],
    // v17.3.0: route-safe collections used by dashboards and secondary modules.
    workflows: [],
    inbox: [],
    requestedByMe: [],
    sessions: [],
    boms: [],
    salesOrders: [],
    credits: [],
    methods: [],
    changes: [],
    plans: [],
    subscriptions: [],
    overrides: [],
    usage: [],
    permissions: [],
    catalogs: [],
    sources: [],
    receivables: [],
    deliveries: [],
    budgetLines: [],
    monthly: [],
    // Common object containers. Keeping these present prevents dashboard reads such as data.stats.total.
    stats: {},
    pipeline: [],
    coverage: {},
    filters: {entities: [], actions: []},
    issuer: {},
    product: {},
    warehouse: {},
    activity: {users: [], activeUsers: 0},
    history: {series: {}},
    forecasts: {},
    comparisons: {},
    comparison: {},
    selectedScenario: null,
    details: {},
    values: {},
  };
}

const products = [
  {id:'p1', sku:'PAPEL-CARTA', name:'Caja papel carta premium', category:{id:'c1',name:'Consumibles'}, categoryId:'c1', unit:'PZA', cost:610, price:890, minStock:10, active:true},
  {id:'p2', sku:'DOCK-USBC', name:'Docking station USB-C', category:{id:'c2',name:'Equipo tecnológico'}, categoryId:'c2', unit:'PZA', cost:2450, price:3890, minStock:12, active:true},
  {id:'p3', sku:'LAP-PRO-14', name:'Laptop empresarial 14”', category:{id:'c2',name:'Equipo tecnológico'}, categoryId:'c2', unit:'PZA', cost:18200, price:26400, minStock:8, active:true},
  {id:'p4', sku:'SILLA-ERG', name:'Silla ergonómica ejecutiva', category:{id:'c3',name:'Mobiliario y oficina'}, categoryId:'c3', unit:'PZA', cost:4200, price:6900, minStock:6, active:true},
];

const employees = [
  {id:'e1', employeeNumber:'EMP-101', firstName:'Ana', lastName:'Martínez', email:'ana.martinez@demo.local', departmentId:'d1', positionId:'pos1', branchId:'b1', department:{id:'d1',name:'Comercial'}, position:{id:'pos1',name:'Gerencia Comercial'}, branch:{id:'b1',name:'Sucursal Monterrey'}, hireDate:'2025-02-03', salary:48000, status:'ACTIVE', active:true},
  {id:'e2', employeeNumber:'EMP-102', firstName:'Luis', lastName:'Hernández', email:'luis.hernandez@demo.local', departmentId:'d1', positionId:'pos2', branchId:'b1', department:{id:'d1',name:'Comercial'}, position:{id:'pos2',name:'Ejecutivo de Ventas'}, branch:{id:'b1',name:'Sucursal Monterrey'}, hireDate:'2025-02-03', salary:28000, status:'ACTIVE', active:true},
  {id:'e3', employeeNumber:'EMP-105', firstName:'Mónica', lastName:'Flores', email:'monica.flores@demo.local', departmentId:'d2', positionId:'pos3', branchId:'b2', department:{id:'d2',name:'Operaciones'}, position:{id:'pos3',name:'Analista de Inventario'}, branch:{id:'b2',name:'Sucursal Guadalajara'}, hireDate:'2025-02-03', salary:25000, status:'ACTIVE', active:true},
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

const departments = [
  {id:'d1',code:'COM',name:'Comercial',description:'Ventas y desarrollo comercial',active:true},
  {id:'d2',code:'OPS',name:'Operaciones',description:'Operación e inventarios',active:true},
];

const positions = [
  {id:'pos1',code:'GER-COM',name:'Gerencia Comercial',departmentId:'d1',department:departments[0],active:true},
  {id:'pos2',code:'EJV',name:'Ejecutivo de Ventas',departmentId:'d1',department:departments[0],active:true},
  {id:'pos3',code:'AINV',name:'Analista de Inventario',departmentId:'d2',department:departments[1],active:true},
];

const branches = [
  {id:'b1',code:'MTY',name:'Sucursal Monterrey',active:true},
  {id:'b2',code:'GDL',name:'Sucursal Guadalajara',active:true},
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
  '/human-resources': {employees,departments,positions,branches,summary:{totalEmployees:employees.length,departments:departments.length,positions:positions.length,monthlyPayroll:101000,activeEmployees:employees.length}},
  '/suppliers': {suppliers},
  '/customers': {customers},
  '/purchase-requests': {requests:purchaseRequests,purchaseRequests},
  '/purchase-orders': {orders:[{id:'po1',folio:'OC-DEMO-0001',supplier:suppliers[0],status:'APPROVED',total:140824,createdAt:'2026-08-28'}],purchaseOrders:[{id:'po1',folio:'OC-DEMO-0001',supplier:suppliers[0],status:'APPROVED',total:140824,createdAt:'2026-08-28'}]},
  '/receipts': {receipts:[]},
  '/procurement/dashboard': {summary:{pendingRequests:0,openOrders:1,monthlySpend:225504,pendingReceipts:0},recentRequests:purchaseRequests,purchaseOrders:[{id:'po1',folio:'OC-DEMO-0001',supplier:suppliers[0],total:140824,status:'APPROVED'}],topSuppliers:[{supplier:suppliers[0],orders:3,total:225504}]},
  '/accounts-payable': {summary:{invoiced:220168,paid:60000,pending:160168,overdue:79344},invoices:[{id:'ap1',folio:'PROV-DEMO-MOB-1902',supplier:suppliers[1],dueDate:'2026-08-29',total:79344,balance:79344,status:'OVERDUE'},{id:'ap2',folio:'PROV-DEMO-TEC-8821',supplier:suppliers[0],dueDate:'2026-08-28',total:140824,balance:80824,status:'PARTIAL'}]},
  '/accounts-receivable': {summary:{invoiced:446396,collected:145000,pending:301396,overdue:0},invoices:[]},
  '/collections': {
    customers,
    receivables:[
      {id:'ar1',customerId:'cu1',customer:customers[0],invoiceNumber:'FAC-DEMO-1001',dueDate:'2026-09-15',total:120000,paidAmount:80000,status:'PARTIAL'},
      {id:'ar2',customerId:'cu1',customer:customers[0],invoiceNumber:'FAC-DEMO-1002',dueDate:'2026-09-25',total:180000,paidAmount:0,status:'OPEN'},
      {id:'ar3',customerId:'cu2',customer:customers[1],invoiceNumber:'FAC-DEMO-2001',dueDate:'2026-09-18',total:145000,paidAmount:0,status:'OPEN'},
    ],
    accounts:[
      {id:'ta1',code:'BBVA-001',name:'BBVA Operativa',type:'BANK',currency:'MXN',active:true},
      {id:'ta2',code:'CAJA-001',name:'Caja General',type:'CASH',currency:'MXN',active:true},
    ],
    stats:{outstanding:365000,openInvoices:3,overdue:0,collected:101032.4,unapplied:20000},
    payments:[
      {id:'pay1',folio:'COB-2026-0002',customerId:'cu1',customer:customers[0],paymentDate:'2026-09-07',method:'TRANSFER',reference:'SPEI-0907',treasuryAccountId:'ta1',treasuryAccount:{id:'ta1',code:'BBVA-001',name:'BBVA Operativa'},amount:1032.4,unappliedAmount:0,status:'APPLIED',applications:[{id:'app1',accountsReceivableId:'ar1',amount:1032.4}]},
      {id:'pay2',folio:'COB-DEMO-0001',customerId:'cu1',customer:customers[0],paymentDate:'2026-08-30',method:'TRANSFER',reference:'ANTICIPO-DEMO',treasuryAccountId:'ta1',treasuryAccount:{id:'ta1',code:'BBVA-001',name:'BBVA Operativa'},amount:100000,unappliedAmount:20000,status:'PARTIAL',applications:[{id:'app2',accountsReceivableId:'ar1',amount:80000}]},
    ],
  },
  '/sales': {summary:{salesThisMonth:1032,openQuotes:1,activeOrders:0,pendingCollections:345364,activeProspects:2},quotes:[{id:'q1',folio:'COT-DEMO-001',customer:customers[0],status:'OPEN',total:1032}],orders:[],customers},
  '/sales-enterprise/dashboard': {summary:{salesThisMonth:1032,openQuotes:1,activeOrders:0,pendingCollections:345364,activeProspects:2},pipeline:[{stage:'PROSPECT',label:'Prospecto',value:335000,count:2},{stage:'WON',label:'Ganado',value:420000,count:1}],activities:[{id:'a1',title:'Prospecto convertido a cliente',description:'Cuenta demo convertida a cliente',createdAt:now(),createdBy:offlineDemoUser}]},
  '/sales-enterprise/prospects': {prospects:[{id:'lead1',name:'Óscar Peña',companyName:'Hoteles Camino Real del Norte',stage:'LEAD',value:240000,probability:50},{id:'lead2',name:'Arturo Lozano',companyName:'Logística Delta',stage:'QUALIFIED',value:95000,probability:35}]},
  '/marketing/dashboard': {campaigns:[{id:'camp1',name:'Roadshow Empresarial Norte 2026',channelName:'Eventos B2B',status:'ACTIVE',budget:42000,spend:42000,leads:24,revenue:0,roas:0},{id:'camp2',name:'Nurturing · Base comercial',channelName:'Email marketing',status:'ACTIVE',budget:4800,spend:4800,leads:60,revenue:247237,roas:51.51}],events:[],channels:[],owners:employees,summary:{activeCampaigns:2,spend:46800,budget:46800,leads:84,cpl:557.14,revenue:247237,conversions:1,roi:428.3,roas:5.28,ctr:4.2}},
  '/projects/dashboard': {projects:[{id:'proj1',code:'PRY-DEMO-002',name:'Expansión operación Horizonte',description:'Proyecto demo de expansión operativa',status:'PLANNING',priority:'HIGH',budget:750000,plannedHours:420,tags:'Expansión',customer:customers[0],manager:employees[0],tasks:[],timeEntries:[],members:[],subprojects:[],salesOrders:[],purchaseOrders:[],comments:[],documents:[]}],employees,customers,salesOrders:[],purchaseOrders:[],summary:{total:1,active:0,planning:1,budget:750000}},
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


const NESTED_COLLECTION_KEYS = new Set([
  'items','rules','steps','members','subprojects','salesOrders','purchaseOrders','comments','documents','tasks','timeEntries',
  'lines','payments','deliveries','invoices','returns','creditNotes','activities','contacts','addresses','sessions','boms',
  'products','warehouses','employees','customers','suppliers','prospects','quotes','orders','receipts','entries','periods',
  'accounts','statements','transactions','adjustments','transfers','movements','incidents','leaves','attendance','campaigns',
  'channels','events','runs','jobs','definitions','connections','webhooks','apiKeys','entities','issues','insights','terminals',
  'actionItems','attention','budgets','demoStory','recentMovements','salesInvoices','timeline','payables','providers','queue',
  'triggerEvents','actionTypes','approvalWorkflows','catalogs','costCenters','risks','scenarios','workCenters','flows'
]);

function deepNormalizeCollections(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) deepNormalizeCollections(item, seen);
    return value;
  }
  for (const key of NESTED_COLLECTION_KEYS) {
    if (!(key in value)) value[key] = [];
    else if (value[key] == null) value[key] = [];
  }
  for (const child of Object.values(value)) deepNormalizeCollections(child, seen);
  return value;
}

function endpointDefaults(path) {
  if (path === '/approvals/dashboard') return {
    workflows: [], requests: [], inbox: [], requestedByMe: [],
    summary: {myInbox: 0, pending: 0, approved: 0, rejected: 0},
  };
  if (path === '/production/dashboard') return {orders:[],boms:[],workCenters:[],products:[],warehouses:[],employees:[],salesOrders:[],projects:[],summary:{}};
  if (path === '/pos/dashboard') return {terminals:[],sessions:[],sales:[],products:[],customers:[],warehouses:[],summary:{}};
  if (path === '/marketing/dashboard') return {campaigns:[],channels:[],prospects:[],customers:[],salesOrders:[],users:[],events:[],summary:{impressions:0,clicks:0,leads:0,conversions:0,revenue:0,spend:0,budget:0,roas:0,roi:0}};
  if (path === '/modules/dashboard') return {modules:[],companyModules:[],plans:[],subscriptions:[],overrides:[],usage:[],summary:{}};
  if (path === '/billing/dashboard') return {subscription:null,invoices:[],credits:[],methods:[],changes:[]};
  if (path === '/integrations/dashboard') return {summary:{},connections:[],webhooks:[],apiKeys:[],deliveries:[]};
  if (path === '/master-data/dashboard') return {summary:{},catalogs:[],issues:[]};
  if (path === '/flow/dashboard') return {summary:{},flows:[],runs:[]};
  if (path === '/intelligence/dashboard') return {company:{},summary:{},metrics:{},insights:[],definitions:[],comparisons:{},forecasts:{},history:{series:{}},details:{},values:{}};
  if (path === '/projects/dashboard') return {projects:[],employees:[],customers:[],salesOrders:[],purchaseOrders:[],summary:{total:0,active:0,planning:0,budget:0,revenue:0,cost:0,hours:0}};
  if (path === '/sales-enterprise/dashboard') return {summary:{},pipeline:[],prospects:[],activities:[],quotes:[],orders:[],receivables:[]};
  if (path === '/sales') return {quotes:[],orders:[],customers:[],products:[],stats:{quotes:0,orders:0,monthSales:0,openQuotes:0,activeOrders:0}};
  if (path === '/collections') return {payments:[],customers:[],receivables:[],accounts:[],stats:{outstanding:0,openInvoices:0,overdue:0,collected:0,unapplied:0}};
  if (path === '/accounting') return {accounts:[],periods:[],entries:[],trialBalance:[],sources:[],stats:{}};
  if (path === '/bank-reconciliation') return {accounts:[],statements:[],stats:{}};
  if (path === '/treasury') return {accounts:[],movements:[],stats:{}};
  if (path === '/fiscal/dashboard') return {summary:{},issuer:{},customers:[],invoices:[],salesInvoices:[],receipts:[],paymentComplements:[]};
  if (path === '/hr-operations') return {employees:[],attendance:[],leaves:[],incidents:[]};
  if (path === '/payroll') return {periods:[],employees:[],stats:{draft:0,approved:0,pendingNet:0}};
  if (path === '/employee-documents') return {employees:[],documents:[],stats:{total:0,valid:0,pending:0,alerts:0,employeesComplete:0}};
  if (path === '/activity/notifications') return {notifications:[],unread:0};
  if (path === '/activity/activity') return {logs:[],filters:{entities:[],actions:[]}};
  if (path === '/budgets') return {costCenters:[],budgets:[],monthly:[],summary:{plannedTotal:0,actualTotal:0,variance:0,utilization:0,activeCostCenters:0}};
  if (path === '/cash-flow') return {summary:{openingBalance:0,totalReceivables:0,totalPayables:0,netProjection:0,projectedClosingBalance:0,minimumBalance:0},timeline:[],monthly:[],accounts:[],scenarios:[],selectedScenario:null,receivables:[],payables:[],recentMovements:[],risks:[],filters:{scenarioId:''}};
  if (path === '/reports/executive') return {company:offlineDemoUser.company,generatedAt:now(),summary:{},comparison:{},monthly:[],actionItems:[],modules:[]};
  if (path === '/flow/catalog') return {triggerEvents:[],actionTypes:[],users:[],approvalWorkflows:[]};
  if (path === '/integrations/catalog') return {providers:[],events:[]};
  if (path === '/integrations/dashboard') return {summary:{},connections:[],webhooks:[],apiKeys:[],queue:[]};
  if (path === '/master-data/entities') return {customers:[],suppliers:[],products:[],employees:[]};
  if (path === '/order-to-cash/dashboard') return {summary:{},stages:[],attention:[],quotes:[],orders:[],deliveries:[],invoices:[],payments:[],customers:[]};
  if (path === '/sales-fulfillment') return {summary:{},deliveries:[],invoices:[],orders:[],warehouses:[],customers:[]};
  if (path === '/sales-returns') return {summary:{},returns:[],creditNotes:[],deliveries:[],warehouses:[],invoices:[],customers:[]};
  if (path === '/business-parties') return {parties:[],customers:[],suppliers:[],duplicates:[]};
  if (path === '/business-parties/dashboard') return {summary:{},parties:[],duplicates:[],recentActivity:[]};
  if (path === '/data-hub/dashboard') return {summary:{},jobs:[],definitions:[]};
  if (path === '/data-hub/definitions') return {definitions:[]};
  if (path === '/accounts-payable/catalogs' || path === '/accounts-receivable/catalogs') return {suppliers:[],customers:[],accounts:[],costCenters:[],projects:[]};
  if (path === '/agenda/meta') return {types:[],priorities:[],users:[]};
  if (path === '/administration/dashboard') return {company:offlineDemoUser.company,counts:{},health:{status:'GOOD',score:100},summary:{},processStatus:[],queue:[],upcoming:{agenda:[]},activity:[]};
  if (path === '/procurement/dashboard') return {summary:{},recentRequests:[],purchaseOrders:[],topSuppliers:[]};
  return {};
}

function normalizeOfflineShape(path, payload = {}) {
  const result = {...baseResponse(), ...clone(endpointDefaults(path)), ...clone(payload || {})};
  const arrayKeys = [
    'employees','departments','positions','branches','products','categories','warehouses','balances','movements',
    'requests','purchaseRequests','orders','purchaseOrders','receipts','suppliers','customers','prospects','activities',
    'quotes','deliveries','invoices','returns','creditNotes','payments','collections','payrolls','incidents','documents',
    'projects','tasks','timeEntries','campaigns','channels','owners','accounts','periods','entries','expenses','assets',
    'statements','transactions','scenarios','transfers','integrations','connections','webhooks','apiKeys','entities',
    'duplicates','users','roles','tickets','support','recentRequests','monthlyPurchases','recentActivity','criticalStock',
    'criticalProducts','upcoming','topSuppliers','topCustomers','leaves','attendance','approvals','issues','insights',
    'workCenters','flows','runs','jobs','definitions','paymentComplements','costCenters','risks','sales','stages','terminals',
    'trialBalance','adjustments','agenda','events','items','rows','data','modules','companyModules','notifications',
    'workflows','inbox','requestedByMe','logs','sessions','boms','salesOrders','credits','methods','changes','plans','subscriptions','overrides','usage','permissions','catalogs','sources','receivables','deliveries','budgetLines','monthly',
    'actionItems','attention','budgets','demoStory','recentMovements','salesInvoices','timeline','payables','providers','queue','triggerEvents','actionTypes','approvalWorkflows'
  ];
  for (const key of arrayKeys) if (!Array.isArray(result[key])) result[key] = [];

  if (path === '/human-resources') {
    result.departments = Array.isArray(result.departments) ? result.departments : [];
    result.positions = Array.isArray(result.positions) ? result.positions : [];
    result.branches = Array.isArray(result.branches) ? result.branches : [];
  }
  if (/^\/employee-documents/.test(path)) {
    result.stats = {total:0,valid:0,pending:0,alerts:0,employeesComplete:0,...(result.stats || {})};
  }
  if (/^\/projects/.test(path)) {
    result.projects = result.projects.map((project) => ({
      members:[], subprojects:[], salesOrders:[], purchaseOrders:[], comments:[], documents:[], tasks:[], timeEntries:[],
      metrics:{taskProgress:0,loggedHours:0,plannedHours:Number(project?.plannedHours||0),budgetUsed:0,revenue:0,cost:0,margin:0},
      ...project,
      metrics:{taskProgress:0,loggedHours:0,plannedHours:Number(project?.plannedHours||0),budgetUsed:0,revenue:0,cost:0,margin:0,...(project?.metrics||{})},
    }));
    if (result.project) result.project = {members:[],subprojects:[],salesOrders:[],purchaseOrders:[],comments:[],documents:[],tasks:[],timeEntries:[],metrics:{taskProgress:0,loggedHours:0,plannedHours:Number(result.project?.plannedHours||0),budgetUsed:0,revenue:0,cost:0,margin:0},...result.project,metrics:{taskProgress:0,loggedHours:0,plannedHours:Number(result.project?.plannedHours||0),budgetUsed:0,revenue:0,cost:0,margin:0,...(result.project?.metrics||{})}};
  }
  if (/^\/billing/.test(path)) result.plan = {modules:[], ...(result.plan || {})};
  if (path === '/administration/dashboard') {
    result.counts = result.counts && typeof result.counts === 'object' && !Array.isArray(result.counts) ? result.counts : {};
    result.health = result.health && typeof result.health === 'object' && !Array.isArray(result.health) ? result.health : {status:'GOOD',score:100};
    result.summary = result.summary && typeof result.summary === 'object' && !Array.isArray(result.summary) ? result.summary : {};
    result.processStatus = Array.isArray(result.processStatus) ? result.processStatus : [];
    result.queue = Array.isArray(result.queue) ? result.queue : [];
    result.activity = Array.isArray(result.activity) ? result.activity : [];
    result.upcoming = result.upcoming && typeof result.upcoming === 'object' && !Array.isArray(result.upcoming) ? result.upcoming : {agenda:[]};
    result.upcoming.agenda = Array.isArray(result.upcoming.agenda) ? result.upcoming.agenda : [];
  }
  if (path === '/activity/activity') {
    result.logs = Array.isArray(result.logs) ? result.logs : [];
    result.filters = {
      entities: Array.isArray(result.filters?.entities) ? result.filters.entities : [],
      actions: Array.isArray(result.filters?.actions) ? result.filters.actions : [],
    };
  }
  if (path === '/activity/notifications') {
    result.notifications = Array.isArray(result.notifications) ? result.notifications : [];
    result.unread = Number.isFinite(Number(result.unread)) ? Number(result.unread) : result.notifications.filter((item) => !item?.read).length;
  }
  if (path === '/sales-enterprise/dashboard') {
    result.pipeline = Array.isArray(result.pipeline) ? result.pipeline : [];
    result.prospects = Array.isArray(result.prospects) ? result.prospects : [];
    result.quotes = Array.isArray(result.quotes) ? result.quotes : [];
    result.orders = Array.isArray(result.orders) ? result.orders : [];
    result.receivables = Array.isArray(result.receivables) ? result.receivables : [];
    result.activities = (Array.isArray(result.activities) ? result.activities : []).map((activity) => ({createdBy: offlineDemoUser, ...activity, createdBy: activity?.createdBy || offlineDemoUser}));
    result.summary = {monthSales:0,openQuotes:0,conversionRate:0,activeOrders:0,openReceivables:0,activeProspects:0,...(result.summary || {})};
  }
  if (path === '/sales') {
    result.quotes = (Array.isArray(result.quotes) ? result.quotes : []).map((quote) => ({items:[], customer: customers[0], createdBy: offlineDemoUser, quoteDate: now(), validUntil: now(), total:0, ...quote, createdBy: quote?.createdBy || offlineDemoUser}));
    result.orders = (Array.isArray(result.orders) ? result.orders : []).map((order) => ({items:[], customer: customers[0], createdBy: offlineDemoUser, orderDate: now(), deliveryDate: now(), total:0, ...order, createdBy: order?.createdBy || offlineDemoUser}));
    result.customers = Array.isArray(result.customers) ? result.customers : [];
    result.products = Array.isArray(result.products) ? result.products : products;
    result.stats = {...(result.stats || {})};
  }
  if (path === '/projects/dashboard') {
    result.projects = (Array.isArray(result.projects) ? result.projects : []).map((project) => ({
      members:[], subprojects:[], salesOrders:[], purchaseOrders:[], comments:[], documents:[], tasks:[], timeEntries:[],
      customer:null, manager:null,
      metrics:{taskProgress:0,loggedHours:0,plannedHours:Number(project?.plannedHours||0),budgetUsed:0,revenue:0,cost:0,margin:0},
      ...project,
      metrics:{taskProgress:0,loggedHours:0,plannedHours:Number(project?.plannedHours||0),budgetUsed:0,revenue:0,cost:0,margin:0,...(project?.metrics||{})},
    }));
    result.employees = Array.isArray(result.employees) ? result.employees : [];
    result.customers = Array.isArray(result.customers) ? result.customers : [];
    result.salesOrders = Array.isArray(result.salesOrders) ? result.salesOrders : [];
    result.purchaseOrders = Array.isArray(result.purchaseOrders) ? result.purchaseOrders : [];
    result.summary = {total:0,active:0,planning:0,budget:0,revenue:0,cost:0,hours:0,...(result.summary || {})};
  }
  if (path === '/collections') {
    result.customers = Array.isArray(result.customers) ? result.customers : [];
    result.receivables = (Array.isArray(result.receivables) ? result.receivables : []).map((row) => ({
      customer:null, invoiceNumber:'—', dueDate:null, total:0, paidAmount:0, status:'OPEN', ...row,
    }));
    result.accounts = (Array.isArray(result.accounts) ? result.accounts : []).map((row) => ({
      code:'CTA-DEMO', name:'Cuenta demo', type:'BANK', currency:'MXN', active:true, ...row,
    }));
    const fallbackAccount = result.accounts[0] || {id:'offline-account',code:'CTA-DEMO',name:'Cuenta demo'};
    const fallbackCustomer = result.customers[0] || customers[0];
    result.payments = (Array.isArray(result.payments) ? result.payments : []).map((row, index) => ({
      folio:`COB-DEMO-${String(index+1).padStart(4,'0')}`,
      customer:fallbackCustomer,
      paymentDate:null, method:'TRANSFER', reference:'', treasuryAccount:fallbackAccount,
      amount:0, unappliedAmount:0, status:'APPLIED', applications:[],
      ...row,
      customer:row?.customer || fallbackCustomer,
      treasuryAccount:row?.treasuryAccount || fallbackAccount,
      applications:Array.isArray(row?.applications) ? row.applications : [],
    }));
    result.stats = {outstanding:0,openInvoices:0,overdue:0,collected:0,unapplied:0,...(result.stats || {})};
  }
  if (path === '/marketing/dashboard') {
    const defaultPerformance = {spend:0,revenue:0,roas:0,roi:0,cpl:0,conversionRate:0,impressions:0,clicks:0,ctr:0,leads:0,conversions:0,budgetUsed:0};
    result.campaigns = (Array.isArray(result.campaigns) ? result.campaigns : []).map((campaign, index) => {
      const spend = Number(campaign?.spend ?? campaign?.performance?.spend ?? 0);
      const revenue = Number(campaign?.revenue ?? campaign?.performance?.revenue ?? 0);
      const leads = Number(campaign?.leadsCount ?? campaign?.performance?.leads ?? campaign?.leads ?? 0);
      const budget = Number(campaign?.budget || 0);
      const performance = {
        ...defaultPerformance,
        spend,
        revenue,
        leads: Number.isFinite(leads) ? leads : 0,
        roas: Number(campaign?.roas ?? campaign?.performance?.roas ?? (spend ? revenue/spend : 0)),
        budgetUsed: budget ? (spend/budget)*100 : 0,
        ...(campaign?.performance || {}),
      };
      return {
        code:`MKT-DEMO-${String(index+1).padStart(3,'0')}`,
        objective:'LEAD_GENERATION', status:'ACTIVE', startDate:'2026-09-01', endDate:'2026-12-31',
        ...campaign,
        channel: campaign?.channel || {id:`channel-${index+1}`,name:campaign?.channelName || 'Canal demo',type:'OTHER'},
        owner: campaign?.owner || offlineDemoUser,
        leads: Array.isArray(campaign?.leads) ? campaign.leads : [],
        opportunities: Array.isArray(campaign?.opportunities) ? campaign.opportunities : [],
        expenses: Array.isArray(campaign?.expenses) ? campaign.expenses : [],
        metrics: Array.isArray(campaign?.metrics) ? campaign.metrics : [],
        performance,
      };
    });
    result.channels = Array.isArray(result.channels) ? result.channels : [];
    result.prospects = Array.isArray(result.prospects) ? result.prospects : [];
    result.customers = Array.isArray(result.customers) ? result.customers : [];
    result.salesOrders = Array.isArray(result.salesOrders) ? result.salesOrders : [];
    result.users = Array.isArray(result.users) ? result.users : employees;
    result.events = (Array.isArray(result.events) ? result.events : []).map((event)=>({type:'OTHER',completedAt:null,...event}));
    result.summary = {impressions:0,clicks:0,leads:0,conversions:0,revenue:0,spend:0,budget:0,roas:0,roi:0,...(result.summary || {})};
  }
  // Normalize nested collections used by detail cards so .length/.map/.reduce never receive undefined in Demo Local.
  deepNormalizeCollections(result);
  return result;
}

function readFixture(path) {
  const persisted = getPersisted();
  const exact = persisted[path] ?? fixtures[path];
  if (exact) return normalizeOfflineShape(path, exact);

  // Common detail routes inherit their collection fixture so pages never contact the API.
  if (/^\/customers\//.test(path)) return normalizeOfflineShape(path, {...baseResponse(), customer: customers[0], ...clone(persisted['/customers'] || fixtures['/customers'])});
  if (/^\/products\//.test(path)) return normalizeOfflineShape(path, {...baseResponse(), product: products[0], ...clone(persisted['/products'] || fixtures['/products'])});
  if (/^\/projects\//.test(path)) return normalizeOfflineShape(path, {...baseResponse(), project: clone((persisted['/projects/dashboard'] || fixtures['/projects/dashboard']).projects[0])});
  if (/^\/business-parties/.test(path)) return {...baseResponse(), parties:[...customers,...suppliers],customers,suppliers,duplicates:[]};
  if (/^\/sales-fulfillment/.test(path)) return {...baseResponse(),summary:{pendingDeliveries:0,pendingInvoices:0},deliveries:[],invoices:[],orders:[]};
  if (/^\/sales-returns/.test(path)) return {...baseResponse(),summary:{returns:0,creditNotes:0},returns:[],creditNotes:[]};
  if (/^\/order-to-cash/.test(path)) return {...baseResponse(),summary:{quotes:1,orders:0,deliveries:0,invoices:1,collections:2},customers,quotes:fixtures['/sales'].quotes,orders:[],deliveries:[],invoices:[],payments:normalizeOfflineShape('/collections', fixtures['/collections']).payments};
  if (/^\/hr-operations/.test(path)) return {...baseResponse(),employees,summary:{employees:employees.length,incidents:0,attendance:100},incidents:[],attendance:[],leaves:[]};
  if (/^\/payroll/.test(path)) return {...baseResponse(),employees,summary:{employees:employees.length,gross:101000,net:84000},payrolls:[]};
  if (/^\/employee-documents/.test(path)) return {...baseResponse(),employees,documents:[],stats:{total:0,valid:0,pending:0,alerts:0,employeesComplete:0}};
  if (/^\/fiscal/.test(path)) return {...baseResponse(),summary:{invoices:3,subtotal:399237,tax:63878,total:463115},invoices:[]};
  if (/^\/activity\/activity/.test(path)) return normalizeOfflineShape('/activity/activity', {
    logs:[
      {id:'log-demo-1',entity:'SESSION',action:'LOGIN',description:'Inicio de sesión Demo Local',createdAt:now(),user:offlineDemoUser},
      {id:'log-demo-2',entity:'PURCHASE_REQUEST',action:'VIEW',description:'Consulta de solicitudes de compra',createdAt:now(),user:offlineDemoUser},
    ],
    filters:{entities:['SESSION','PURCHASE_REQUEST'],actions:['LOGIN','VIEW']},
  });
  if (/^\/approvals/.test(path)) return normalizeOfflineShape(path, {
    summary:{myInbox:2,pending:2,approved:8,rejected:0},
    workflows:[{
      id:'wf-demo-1',entityType:'PURCHASE_REQUEST',name:'Aprobación de compras',description:'Flujo demo de autorización',active:true,
      rules:[{id:'rule-demo-1',sequence:1,name:'Autorización administrativa',actorType:'PERMISSION',permissionKey:'procurement.approve'}]
    }],
    requests:[],
    inbox:[],
    requestedByMe:[],
    approvals:[]
  });
  if (/^\/integrations/.test(path)) return {...baseResponse(),summary:{active:0,errors:0},integrations:[],connections:[],webhooks:[],apiKeys:[]};
  if (/^\/master-data/.test(path)) return {...baseResponse(),summary:{entities:0,issues:0},entities:[],issues:[]};
  if (/^\/billing/.test(path)) return {...baseResponse(),plan:{id:'demo',name:'Business OS Demo',modules:[]},subscription:{status:'ACTIVE',billingCycle:'MONTHLY'},invoices:[]};
  if (path === '/budgets') return normalizeOfflineShape(path, endpointDefaults(path));
  if (path === '/reports/executive') return normalizeOfflineShape(path, endpointDefaults(path));
  if (path === '/flow/catalog') return normalizeOfflineShape(path, endpointDefaults(path));
  if (path === '/integrations/catalog') return normalizeOfflineShape(path, endpointDefaults(path));
  if (path === '/master-data/entities') return normalizeOfflineShape(path, endpointDefaults(path));
  if (path === '/order-to-cash/dashboard') return normalizeOfflineShape(path, endpointDefaults(path));
  if (/^\/cash-flow/.test(path)) return normalizeOfflineShape('/cash-flow', {...endpointDefaults('/cash-flow'), summary:{openingBalance:825000,totalReceivables:145000,totalPayables:92300,netProjection:52700,projectedClosingBalance:877700,minimumBalance:790000}});

  return normalizeOfflineShape(path, baseResponse());
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

  if (normalized === '/collections/payments' && method === 'POST') {
    const body = options.body ?? options.data ?? {};
    const current = readFixture('/collections');
    const customer = current.customers.find((item) => item.id === body.customerId) || current.customers[0] || customers[0];
    const treasuryAccount = current.accounts.find((item) => item.id === body.treasuryAccountId) || current.accounts[0] || {id:'offline-account',name:'Cuenta demo'};
    const applications = Array.isArray(body.applications) ? body.applications.map((item,index)=>({id:`offline-app-${Date.now()}-${index}`,...item})) : [];
    const applied = applications.reduce((sum,item)=>sum+Number(item.amount||0),0);
    const amount = Number(body.amount || 0);
    const payment = {
      id:`offline-payment-${Date.now()}`,
      folio:`COB-DEMO-${String(current.payments.length+1).padStart(4,'0')}`,
      customerId:customer?.id || body.customerId || '', customer,
      treasuryAccountId:treasuryAccount?.id || body.treasuryAccountId || '', treasuryAccount,
      paymentDate:body.paymentDate || new Date().toISOString().slice(0,10), method:body.method || 'TRANSFER',
      reference:body.reference || '', notes:body.notes || '', amount, applications,
      unappliedAmount:Math.max(0, amount-applied), status:applied >= amount && amount > 0 ? 'APPLIED' : 'PARTIAL',
      createdBy:offlineDemoUser, createdAt:now(),
    };
    const next = normalizeOfflineShape('/collections', {
      ...current, payments:[payment,...current.payments],
      stats:{...current.stats,collected:Number(current.stats?.collected||0)+amount,unapplied:Number(current.stats?.unapplied||0)+payment.unappliedAmount},
    });
    const persisted = getPersisted();
    persisted['/collections'] = next;
    setPersisted(persisted);
    return {...baseResponse(), payment};
  }

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
