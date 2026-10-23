import {createOfflineBusinessData} from './offlineBusinessData.js';

const OFFLINE_DEMO_STORE = 'buzzbee-offline-demo-state-v2';
const OFFLINE_INDUSTRY_PROFILES=[
 {slug:'refaccionaria',name:'Refaccionaria',sector:'46',required:['pos','inventario','compras','ventas'],optional:['crm','finanzas'],capabilities:['vehicle_fitment','multi_warehouse','part_cross_references']},
 {slug:'restaurante',name:'Restaurante',sector:'72',required:['pos','inventario','compras'],optional:['crm','rrhh','finanzas'],capabilities:['tables','kitchen_orders']},
 {slug:'barberia',name:'Barbería y estética',sector:'81',required:['agenda','crm','pos'],optional:['rrhh','inventario'],capabilities:['staff_booking','commissions']},
 {slug:'transporte',name:'Empresa de transporte',sector:'48-49',required:['ventas','crm','rrhh','compras','finanzas','proyectos','operaciones'],optional:['inventario'],capabilities:['fleet','dispatch','routing','proof_of_delivery']},
 {slug:'manufactura',name:'Manufactura',sector:'31-33',required:['produccion','inventario','compras','ventas'],optional:['rrhh','finanzas'],capabilities:['bom','quality_control']},
 {slug:'clinica',name:'Clínica',sector:'62',required:['agenda','crm','finanzas'],optional:['inventario','rrhh'],capabilities:['medical_records','restricted_access']},
 {slug:'escuela',name:'Escuela',sector:'61',required:['crm','finanzas','rrhh'],optional:['agenda','proyectos'],capabilities:['enrollment','attendance']},
 {slug:'constructora',name:'Constructora',sector:'23',required:['proyectos','compras','finanzas','rrhh'],optional:['inventario','ventas'],capabilities:['work_sites','progress_tracking']},
 {slug:'tienda',name:'Tienda minorista',sector:'46',required:['pos','inventario','compras'],optional:['ventas','crm','finanzas']},
 {slug:'agencia',name:'Agencia y consultoría',sector:'54',required:['crm','proyectos','ventas'],optional:['finanzas','rrhh'],capabilities:['billable_hours']},
 {slug:'taller_automotriz',name:'Taller automotriz',sector:'81',required:['ventas','inventario','compras','crm'],optional:['agenda','finanzas','rrhh'],capabilities:['service_orders','vehicle_history','technician_assignment']},
 {slug:'ferreteria',name:'Ferretería',sector:'46',required:['pos','inventario','compras','ventas'],optional:['crm','finanzas'],capabilities:['multi_warehouse','unit_conversions']},
 {slug:'mayorista',name:'Distribuidora mayorista',sector:'43',required:['ventas','inventario','compras','crm'],optional:['finanzas','operaciones'],capabilities:['tiered_pricing','multi_warehouse','dispatch']},
 {slug:'ecommerce',name:'Comercio electrónico',sector:'46',required:['ventas','inventario','crm'],optional:['compras','finanzas','marketing'],capabilities:['online_orders','returns','shipping_integrations']},
 {slug:'cafeteria',name:'Cafetería',sector:'72',required:['pos','inventario','compras'],optional:['rrhh','finanzas','crm'],capabilities:['recipes','kitchen_orders']},
 {slug:'hotel',name:'Hotel y alojamiento',sector:'72',required:['ventas','crm','finanzas'],optional:['agenda','rrhh','inventario'],capabilities:['room_inventory','bookings','housekeeping']},
 {slug:'inmobiliaria',name:'Inmobiliaria',sector:'53',required:['crm','ventas','finanzas'],optional:['proyectos','agenda'],capabilities:['property_inventory','contracts','commissions']},
 {slug:'logistica',name:'Operador logístico',sector:'48-49',required:['operaciones','ventas','crm','finanzas'],optional:['inventario','rrhh'],capabilities:['routing','proof_of_delivery','dispatch']},
 {slug:'agricola',name:'Empresa agrícola',sector:'11',required:['inventario','compras','finanzas'],optional:['rrhh','ventas','produccion'],capabilities:['crop_cycles','field_costs','traceability']},
 {slug:'mantenimiento',name:'Servicios de mantenimiento',sector:'81',required:['ventas','crm','proyectos'],optional:['inventario','agenda','finanzas'],capabilities:['service_orders','technician_assignment','recurring_maintenance']}
];

const now = () => new Date().toISOString();
const clone = (value) => JSON.parse(JSON.stringify(value));

export const OFFLINE_DEMO_EMAIL = 'admin@erp.local';
export const OFFLINE_DEMO_PASSWORD = 'Admin123!';

export const offlineDemoUser = {
  id: 'offline-admin',
  email: OFFLINE_DEMO_EMAIL,
  firstName: 'Demo',
  lastName: 'BuzzBee',
  fullName: 'Demo BuzzBee',
  permissions: ['*'],
  preferences: {theme:'system', density:'comfortable', reducedMotion:false, defaultLandingPage:'/'},
  mfaEnabled: false,
  companyId: 'offline-demo-company',
  active: true,
  company: {
    id: 'offline-demo-company',
    name: 'MotorNorte Refacciones',
    legalName: 'MotorNorte Refacciones Automotrices, S.A. de C.V.',
    currency: 'MXN',
    country: 'MX',
    timezone: 'America/Monterrey',
  },
  roles: [{id: 'offline-admin-role', name: 'Demo Administrator', permissions: ['*']}],
};

export function getOfflineDemoUser() {
  const persisted = getPersisted();
  return clone(persisted['/auth/me']?.user || offlineDemoUser);
}

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
    modules: []
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
    invoices: []
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

const categories = [
  {id:'cat-motor',name:'Motor y afinación'},
  {id:'cat-frenos',name:'Frenos'},
  {id:'cat-suspension',name:'Suspensión y dirección'},
  {id:'cat-electrico',name:'Eléctrico y encendido'},
  {id:'cat-filtros',name:'Filtros y lubricación'},
];

const products = [
  {id:'p1', sku:'BAL-AGM-L42', name:'Batería AGM L42 12V 650 CCA', brand:'LTH', category:categories[3], categoryId:'cat-electrico', unit:'PZA', cost:2260, price:3290, minStock:8, active:true, vehicleFitment:'Nissan Versa / Sentra / Kia Rio'},
  {id:'p2', sku:'BALATA-CER-FRONT', name:'Juego de balatas cerámicas delanteras', brand:'Brembo', category:categories[1], categoryId:'cat-frenos', unit:'JGO', cost:690, price:1190, minStock:12, active:true, vehicleFitment:'Nissan Versa 2020-2026'},
  {id:'p3', sku:'AMORT-GAS-RH', name:'Amortiguador gas delantero derecho', brand:'Monroe', category:categories[2], categoryId:'cat-suspension', unit:'PZA', cost:1240, price:1890, minStock:6, active:true, vehicleFitment:'Chevrolet Aveo 2018-2025'},
  {id:'p4', sku:'FILT-ACE-6607', name:'Filtro de aceite premium 6607', brand:'Fram', category:categories[4], categoryId:'cat-filtros', unit:'PZA', cost:78, price:145, minStock:30, active:true, vehicleFitment:'Nissan / Renault 1.6L'},
  {id:'p5', sku:'BUJ-IRID-IX', name:'Bujía iridium IX', brand:'NGK', category:categories[0], categoryId:'cat-motor', unit:'PZA', cost:118, price:210, minStock:40, active:true, vehicleFitment:'Motores 1.6L / 2.0L'},
  {id:'p6', sku:'ACE-5W30-SYN-5L', name:'Aceite sintético 5W-30 5L', brand:'Mobil 1', category:categories[4], categoryId:'cat-filtros', unit:'GARRAFA', cost:690, price:1090, minStock:18, active:true, vehicleFitment:'Multimarca'},
  {id:'p7', sku:'SENSOR-O2-UNI', name:'Sensor de oxígeno universal 4 cables', brand:'Bosch', category:categories[3], categoryId:'cat-electrico', unit:'PZA', cost:760, price:1240, minStock:10, active:true, vehicleFitment:'Multimarca'},
  {id:'p8', sku:'HORQ-INF-LH', name:'Horquilla inferior izquierda completa', brand:'Moog', category:categories[2], categoryId:'cat-suspension', unit:'PZA', cost:980, price:1540, minStock:5, active:true, vehicleFitment:'Nissan March / Versa'},
];

const departments = [
  {id:'d1',code:'VEN',name:'Ventas y mostrador',description:'Ventas B2B, mostrador y punto de venta',active:true},
  {id:'d2',code:'ALM',name:'Almacén y logística',description:'Inventario, surtido y entregas',active:true},
  {id:'d3',code:'COM',name:'Compras',description:'Abastecimiento y negociación con proveedores',active:true},
  {id:'d4',code:'ADM',name:'Administración y finanzas',description:'Tesorería, cobranza y cuentas por pagar',active:true},
  {id:'d5',code:'RH',name:'Recursos humanos',description:'Capital humano y nómina',active:true},
];

const positions = [
  {id:'pos1',code:'GER-SUC',name:'Gerente de sucursal',departmentId:'d1',department:departments[0],active:true},
  {id:'pos2',code:'ASE-REF',name:'Asesor de refacciones',departmentId:'d1',department:departments[0],active:true},
  {id:'pos3',code:'ALM-ESP',name:'Almacenista especialista',departmentId:'d2',department:departments[1],active:true},
  {id:'pos4',code:'COMP-JR',name:'Comprador de refacciones',departmentId:'d3',department:departments[2],active:true},
  {id:'pos5',code:'COB-ANA',name:'Analista de cobranza',departmentId:'d4',department:departments[3],active:true},
  {id:'pos6',code:'RH-COOR',name:'Coordinación de RH',departmentId:'d5',department:departments[4],active:true},
];

const branches = [
  {id:'b1',code:'MTY-CEN',name:'Sucursal Monterrey Centro',city:'Monterrey',state:'Nuevo León',active:true},
  {id:'b2',code:'MTY-GPE',name:'Sucursal Guadalupe',city:'Guadalupe',state:'Nuevo León',active:true},
  {id:'b3',code:'SLP-CEN',name:'Sucursal San Luis Potosí',city:'San Luis Potosí',state:'San Luis Potosí',active:true},
];

const employees = [
  {id:'e1', employeeNumber:'EMP-001', firstName:'Mariana', lastName:'Garza', email:'mariana.garza@motornorte.demo', departmentId:'d1', positionId:'pos1', branchId:'b1', department:departments[0], position:positions[0], branch:branches[0], hireDate:'2023-02-06', salary:42000, status:'ACTIVE', active:true},
  {id:'e2', employeeNumber:'EMP-014', firstName:'Carlos', lastName:'Mendoza', email:'carlos.mendoza@motornorte.demo', departmentId:'d1', positionId:'pos2', branchId:'b1', department:departments[0], position:positions[1], branch:branches[0], hireDate:'2024-01-15', salary:22500, status:'ACTIVE', active:true},
  {id:'e3', employeeNumber:'EMP-021', firstName:'Diana', lastName:'Sáenz', email:'diana.saenz@motornorte.demo', departmentId:'d2', positionId:'pos3', branchId:'b1', department:departments[1], position:positions[2], branch:branches[0], hireDate:'2024-06-03', salary:19800, status:'ACTIVE', active:true},
  {id:'e4', employeeNumber:'EMP-027', firstName:'Jorge', lastName:'Villarreal', email:'jorge.villarreal@motornorte.demo', departmentId:'d3', positionId:'pos4', branchId:'b1', department:departments[2], position:positions[3], branch:branches[0], hireDate:'2023-10-09', salary:28500, status:'ACTIVE', active:true},
  {id:'e5', employeeNumber:'EMP-031', firstName:'Fernanda', lastName:'Cortés', email:'fernanda.cortes@motornorte.demo', departmentId:'d4', positionId:'pos5', branchId:'b1', department:departments[3], position:positions[4], branch:branches[0], hireDate:'2024-03-18', salary:26000, status:'ACTIVE', active:true},
  {id:'e6', employeeNumber:'EMP-036', firstName:'Paola', lastName:'Treviño', email:'paola.trevino@motornorte.demo', departmentId:'d5', positionId:'pos6', branchId:'b1', department:departments[4], position:positions[5], branch:branches[0], hireDate:'2022-11-07', salary:31000, status:'ACTIVE', active:true},
  {id:'e7', employeeNumber:'EMP-041', firstName:'Miguel', lastName:'Salinas', email:'miguel.salinas@motornorte.demo', departmentId:'d1', positionId:'pos2', branchId:'b2', department:departments[0], position:positions[1], branch:branches[1], hireDate:'2025-01-13', salary:21500, status:'ACTIVE', active:true},
  {id:'e8', employeeNumber:'EMP-044', firstName:'Ricardo', lastName:'Lozano', email:'ricardo.lozano@motornorte.demo', departmentId:'d2', positionId:'pos3', branchId:'b2', department:departments[1], position:positions[2], branch:branches[1], hireDate:'2025-02-10', salary:19000, status:'ACTIVE', active:true},
];

const customers = [
  {id:'cu1', code:'CLI-001', legalName:'Talleres El Pistón, S.A. de C.V.', commercialName:'Taller El Pistón', taxId:'TPI180522A11', contactName:'Roberto Ayala', email:'compras@elpiston.demo', phone:'8183104420', creditDays:30, creditLimit:280000, active:true, segment:'Taller mecánico'},
  {id:'cu2', code:'CLI-002', legalName:'Servicio Automotriz Cumbres, S. de R.L.', commercialName:'Auto Cumbres', taxId:'SAC190811B22', contactName:'Andrea Villarreal', email:'admin@autocumbres.demo', phone:'8183472190', creditDays:15, creditLimit:180000, active:true, segment:'Taller mecánico'},
  {id:'cu3', code:'CLI-003', legalName:'Flotillas del Norte Logística, S.A. de C.V.', commercialName:'Flotillas Norte', taxId:'FNL150203C33', contactName:'Héctor Cantú', email:'mantenimiento@flotillasnorte.demo', phone:'8181229830', creditDays:45, creditLimit:550000, active:true, segment:'Flotilla'},
  {id:'cu4', code:'CLI-004', legalName:'Refaccionaria Avenida, S.A. de C.V.', commercialName:'Refaccionaria Avenida', taxId:'RAV210405D44', contactName:'Melissa Ríos', email:'pedidos@refavenida.demo', phone:'8181644450', creditDays:30, creditLimit:320000, active:true, segment:'Mayoreo'},
  {id:'cu5', code:'CLI-PUBLICO', legalName:'Público general', commercialName:'Público general', taxId:'XAXX010101000', contactName:'Mostrador', email:'', phone:'', creditDays:0, creditLimit:0, active:true, segment:'Mostrador'},
];

const suppliers = [
  {id:'s1', code:'PROV-001', legalName:'Distribuidora LTH Noreste, S.A. de C.V.', commercialName:'LTH Noreste', taxId:'DLN120101AA1', active:true, leadTimeDays:3, category:'Baterías'},
  {id:'s2', code:'PROV-002', legalName:'Frenos y Componentes de México, S.A. de C.V.', commercialName:'Fricomex', taxId:'FCM130202BB2', active:true, leadTimeDays:5, category:'Frenos'},
  {id:'s3', code:'PROV-003', legalName:'Suspensión Profesional del Norte, S.A. de C.V.', commercialName:'Suspensión Pro', taxId:'SPN140303CC3', active:true, leadTimeDays:4, category:'Suspensión'},
  {id:'s4', code:'PROV-004', legalName:'Filtros y Lubricantes Industriales, S.A. de C.V.', commercialName:'Filubri', taxId:'FLI150404DD4', active:true, leadTimeDays:2, category:'Lubricación'},
];

const purchaseRequests = [
  {id:'pr1', folio:'SOL-REF-2026-0148', area:'Almacén Monterrey Centro', requester:'Diana Sáenz', amount:68450, status:'Aprobada', createdAt:'2026-09-08T12:00:00Z', concept:'Reposición baterías y balatas'},
  {id:'pr2', folio:'SOL-REF-2026-0152', area:'Sucursal Guadalupe', requester:'Ricardo Lozano', amount:32980, status:'Pendiente', createdAt:'2026-09-10T16:20:00Z', concept:'Stock filtros y aceite 5W-30'},
  {id:'pr3', folio:'SOL-REF-2026-0155', area:'Compras', requester:'Jorge Villarreal', amount:51760, status:'Aprobada', createdAt:'2026-09-11T09:35:00Z', concept:'Amortiguadores y horquillas'},
];

const warehouses = [
  {id:'w1', code:'MTY-CEN', name:'Almacén Monterrey Centro', active:true, branch:branches[0]},
  {id:'w2', code:'MTY-GPE', name:'Almacén Guadalupe', active:true, branch:branches[1]},
  {id:'w3', code:'SLP-CEN', name:'Almacén San Luis Potosí', active:true, branch:branches[2]},
];

const posSales = [
  {id:'pos-sale-1',folio:'POS-006842',createdAt:'2026-09-11T15:42:00Z',customer:customers[4],seller:employees[1],total:1745,paymentMethod:'CARD',items:[{product:products[1],quantity:1,unitPrice:1190},{product:products[3],quantity:2,unitPrice:145},{product:products[4],quantity:1,unitPrice:210}]},
  {id:'pos-sale-2',folio:'POS-006841',createdAt:'2026-09-11T14:18:00Z',customer:customers[0],seller:employees[1],total:4380,paymentMethod:'TRANSFER',items:[{product:products[0],quantity:1,unitPrice:3290},{product:products[5],quantity:1,unitPrice:1090}]},
  {id:'pos-sale-3',folio:'POS-006840',createdAt:'2026-09-11T12:07:00Z',customer:customers[4],seller:employees[6],total:1030,paymentMethod:'CASH',items:[{product:products[3],quantity:4,unitPrice:145},{product:products[4],quantity:2,unitPrice:210},{product:products[3],quantity:0.2,unitPrice:150}]},
];

const offlineBusiness = createOfflineBusinessData({
  company: offlineDemoUser.company,
  user: offlineDemoUser,
  products,
  categories,
  warehouses,
  employees,
  departments,
  positions,
  branches,
  customers,
  suppliers,
  purchaseRequests,
  posSales,
});

function universalDemoContext() {
  return {
    company: offlineDemoUser.company,
    user: offlineDemoUser,
    products, categories, warehouses, employees, departments, positions, branches,
    customers, suppliers, providers:suppliers,
    purchaseRequests, requests:purchaseRequests,
    sales:posSales, transactions:posSales,
  };
}

const fixtures = {
  '/auth/me': {user: offlineDemoUser, sessionKind:'erp', offlineDemo:true},
  '/company': {...offlineDemoUser.company, commercialName:'MotorNorte Refacciones', taxId:'MRA160812MN1', email:'ventas@motornorte.demo', phone:'81 8355 2400', website:'https://motornorte.demo', address:'Av. Colón 2450, Monterrey, N.L.'},
  '/dashboard': {
    company: offlineDemoUser.company,
    user: offlineDemoUser,
    kpis:{pendingRequests:1,ordersThisMonth:18,purchaseChange:8.7,inventoryValue:1248360,criticalStock:3},
    recentRequests: purchaseRequests,
    monthlyPurchases:[
      {key:'2026-04',year:2026,month:4,date:'2026-04-01',total:82000},
      {key:'2026-05',year:2026,month:5,date:'2026-05-01',total:104000},
      {key:'2026-06',year:2026,month:6,date:'2026-06-01',total:92000},
      {key:'2026-07',year:2026,month:7,date:'2026-07-01',total:225504},
      {key:'2026-08',year:2026,month:8,date:'2026-08-01',total:118000},
      {key:'2026-09',year:2026,month:9,date:'2026-09-01',total:146000},
    ],
    notifications:[{id:'n1',title:'Stock bajo detectado',message:'Amortiguador gas delantero derecho está por debajo del mínimo en Monterrey Centro.',read:false,createdAt:now()}],
    criticalStock:[{product:products[2],warehouse:warehouses[0],quantity:3,minStock:6},{product:products[7],warehouse:warehouses[1],quantity:2,minStock:5},{product:products[0],warehouse:warehouses[2],quantity:5,minStock:8}],
    criticalProducts:[
      {sku:'AMORT-GAS-RH',name:'Amortiguador gas delantero derecho',warehouse:'Almacén Monterrey Centro',stock:3,min:6},
      {sku:'HORQ-INF-LH',name:'Horquilla inferior izquierda completa',warehouse:'Almacén Guadalupe',stock:2,min:5},
      {sku:'BAL-AGM-L42',name:'Batería AGM L42 12V 650 CCA',warehouse:'Almacén San Luis Potosí',stock:5,min:8},
    ],
    upcoming:[{id:'u1',title:'Cobro Taller El Pistón',date:'2026-09-12',type:'Cobro'}],
    agenda:[{id:'u1',title:'Cobro Taller El Pistón',date:'2026-09-12',type:'RECEIVABLE',meta:'Taller El Pistón',amount:1032.4}],
    categorySpend:[
      {label:'Frenos',percent:31},
      {label:'Suspensión y dirección',percent:27},
      {label:'Filtros y lubricación',percent:24},
      {label:'Eléctrico y encendido',percent:18},
    ],
    topSuppliers:[{supplier:suppliers[0],orders:8,total:186400},{supplier:suppliers[1],orders:6,total:142850},{supplier:suppliers[3],orders:9,total:119340}],
    topCustomers:[{customer:customers[2],invoices:7,balance:286400},{customer:customers[0],invoices:5,balance:148600},{customer:customers[3],invoices:4,balance:121300}],
  },
  '/products': {products, categories},
  '/warehouses': {warehouses},
  '/inventory/balances': {balances: products.map((product,index)=>({id:`bal${index}`,product,warehouse:warehouses[index%2],quantity:[14,28,3,46,82,21,9,2][index],available:[12,25,3,42,78,18,8,2][index],minStock:product.minStock}))},
  '/inventory/movements': {movements:[{id:'m1',occurredAt:now(),type:'IN',product:products[1],warehouse:warehouses[0],reference:'REC-REF-0911',quantity:24,balanceAfter:28,createdBy:{firstName:'Admin',lastName:'Demo'}}]},
  '/inventory-operations': {warehouses,products,transfers:[],adjustments:[],recentMovements:[]},
  '/human-resources': {employees,departments,positions,branches,summary:{totalEmployees:employees.length,departments:departments.length,positions:positions.length,monthlyPayroll:210300,activeEmployees:employees.length}},
  '/suppliers': {suppliers},
  '/customers': {customers},
  '/purchase-requests': {requests:purchaseRequests,purchaseRequests},
  '/purchase-orders': {orders:[{id:'po1',folio:'OC-REF-2026-0381',supplier:suppliers[0],status:'APPROVED',total:68450,createdAt:'2026-09-08',items:[{product:products[0],quantity:12,unitCost:2260},{product:products[1],quantity:60,unitCost:690}]}],purchaseOrders:[{id:'po1',folio:'OC-REF-2026-0381',supplier:suppliers[0],status:'APPROVED',total:68450,createdAt:'2026-09-08',items:[{product:products[0],quantity:12,unitCost:2260},{product:products[1],quantity:60,unitCost:690}]}]},
  '/receipts': {receipts:[]},
  '/procurement/dashboard': {summary:{pendingRequests:1,openOrders:3,monthlySpend:448590,pendingReceipts:2},recentRequests:purchaseRequests,purchaseOrders:[{id:'po1',folio:'OC-REF-2026-0381',supplier:suppliers[0],total:68450,status:'APPROVED'},{id:'po2',folio:'OC-REF-2026-0384',supplier:suppliers[1],total:142850,status:'SENT'},{id:'po3',folio:'OC-REF-2026-0389',supplier:suppliers[3],total:119340,status:'PARTIAL'}],topSuppliers:[{supplier:suppliers[0],orders:8,total:186400},{supplier:suppliers[1],orders:6,total:142850},{supplier:suppliers[3],orders:9,total:119340}]},
  '/accounts-payable': {summary:{invoiced:397640,paid:196800,pending:200840,overdue:68450},invoices:[{id:'ap1',folio:'LTH-MTY-94018',supplier:suppliers[0],dueDate:'2026-09-08',total:68450,balance:68450,status:'OVERDUE'},{id:'ap2',folio:'FCM-88291',supplier:suppliers[1],dueDate:'2026-09-20',total:142850,balance:82400,status:'PARTIAL'},{id:'ap3',folio:'FIL-19320',supplier:suppliers[3],dueDate:'2026-09-25',total:119340,balance:49990,status:'PARTIAL'}]},
  '/accounts-receivable': {summary:{invoiced:812300,collected:256000,pending:556300,overdue:62400},invoices:[{id:'ar1',folio:'FAC-MN-10821',customer:customers[2],dueDate:'2026-09-22',total:286400,balance:286400,status:'OPEN'},{id:'ar2',folio:'FAC-MN-10844',customer:customers[0],dueDate:'2026-09-18',total:198600,balance:148600,status:'PARTIAL'},{id:'ar3',folio:'FAC-MN-10867',customer:customers[3],dueDate:'2026-10-01',total:121300,balance:121300,status:'OPEN'}]},
  '/collections': {
    customers,
    receivables:[
      {id:'ar1',customerId:'cu1',customer:customers[0],invoiceNumber:'FAC-MN-10844',dueDate:'2026-09-15',total:120000,paidAmount:80000,status:'PARTIAL'},
      {id:'ar2',customerId:'cu1',customer:customers[0],invoiceNumber:'FAC-MN-10852',dueDate:'2026-09-25',total:180000,paidAmount:0,status:'OPEN'},
      {id:'ar3',customerId:'cu2',customer:customers[1],invoiceNumber:'FAC-MN-10867',dueDate:'2026-09-18',total:145000,paidAmount:0,status:'OPEN'},
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
  '/sales': {summary:{salesThisMonth:684920,openQuotes:4,activeOrders:6,pendingCollections:556300,activeProspects:5},quotes:[{id:'q1',folio:'COT-MN-2026-0911',customer:customers[2],status:'OPEN',total:86400,items:[{product:products[5],quantity:48,unitPrice:1090},{product:products[3],quantity:120,unitPrice:145}]},{id:'q2',folio:'COT-MN-2026-0912',customer:customers[0],status:'SENT',total:32880,items:[{product:products[1],quantity:24,unitPrice:1190}]}],orders:[{id:'so1',folio:'PED-MN-2026-2410',customer:customers[3],status:'PICKING',total:121300,items:[{product:products[3],quantity:180,unitPrice:145},{product:products[4],quantity:220,unitPrice:210}]}],customers,products},
  '/sales-enterprise/dashboard': {summary:{salesThisMonth:684920,openQuotes:4,activeOrders:6,pendingCollections:556300,activeProspects:5},pipeline:[{stage:'PROSPECT',label:'Prospecto',value:418000,count:5},{stage:'QUALIFIED',label:'Calificado',value:286500,count:3},{stage:'WON',label:'Ganado',value:684920,count:8}],activities:[{id:'a1',title:'Prospecto convertido a cliente',description:'Taller El Pistón solicitó cotización de frenos y afinación',createdAt:now(),createdBy:offlineDemoUser}]},
  '/sales-enterprise/prospects': {prospects:[{id:'lead1',name:'Sergio Montemayor',companyName:'Taller RM Performance',email:'sergio@rmperformance.demo',phone:'8181559012',stage:'LEAD',value:240000,estimatedValue:240000,probability:50,source:'Campaña',nextActionAt:'2026-09-14T16:00:00.000Z',createdAt:'2026-09-09T10:00:00.000Z'},{id:'lead2',name:'Claudia Garza',companyName:'Transportes Regios',email:'compras@transportesregios.demo',phone:'8181018230',stage:'QUALIFIED',value:95000,estimatedValue:95000,probability:65,source:'Referido',nextActionAt:'2026-09-16T11:00:00.000Z',createdAt:'2026-09-10T09:30:00.000Z'}]},
  '/marketing/dashboard': {campaigns:[{id:'camp1',name:'Mes del Frenado Seguro',channelName:'Meta Ads',status:'ACTIVE',budget:28000,spend:17450,leads:73,revenue:86400,roas:4.95},{id:'camp2',name:'Flotillas · Mantenimiento preventivo',channelName:'Email + WhatsApp',status:'ACTIVE',budget:9500,spend:6100,leads:31,revenue:142800,roas:23.41}],events:[],channels:[],owners:employees,summary:{activeCampaigns:2,spend:23550,budget:37500,leads:104,cpl:226.44,revenue:229200,conversions:18,roi:873.2,roas:9.73,ctr:5.8}},
  '/projects/dashboard': {projects:[{id:'proj1',code:'PRY-DEMO-002',name:'Apertura sucursal San Luis Potosí',description:'Proyecto de apertura, inventario inicial y puesta en marcha de la nueva sucursal',status:'PLANNING',priority:'HIGH',budget:980000,plannedHours:560,tags:'Expansión,Sucursal,Refacciones',metrics:{taskProgress:42,tasksDone:8,tasksTotal:19,overdueTasks:1,laborHours:196,plannedHours:560,budgetUsed:38,actualCost:372400,revenue:0,margin:0},customer:customers[0],manager:employees[0],tasks:[{id:'t1',title:'Alta de almacén y ubicaciones',status:'DONE'},{id:'t2',title:'Carga de inventario inicial',status:'IN_PROGRESS'},{id:'t3',title:'Instalación POS mostrador',status:'TODO'}],timeEntries:[{id:'te1',hours:8,employee:employees[2]}],members:[employees[0],employees[2],employees[3]],subprojects:[],salesOrders:[],purchaseOrders:[],comments:[],documents:[]}],employees,customers,salesOrders:[],purchaseOrders:[],summary:{total:1,active:1,planning:0,budget:980000,revenue:0,cost:372400,hours:196}},
  '/administration/dashboard': {summary:{suppliers:suppliers.length,customerBalance:556300,employees:employees.length,payroll:210300,criticalStock:3},topSuppliers:[{supplier:'LTH Noreste',orders:8,total:186400},{supplier:'Fricomex',orders:6,total:142850}],customerBalances:[{customer:'Flotillas Norte',invoices:7,balance:286400},{customer:'Taller El Pistón',invoices:5,balance:148600},{customer:'Refaccionaria Avenida',invoices:4,balance:121300}],humanCapital:[{department:'Ventas y mostrador',employees:3,payroll:85000},{department:'Almacén y logística',employees:2,payroll:38800},{department:'Compras',employees:1,payroll:28500},{department:'Administración y finanzas',employees:1,payroll:26000},{department:'Recursos humanos',employees:1,payroll:31000}],criticalStock:[{product:products[2],warehouse:warehouses[0],quantity:3,minStock:6},{product:products[7],warehouse:warehouses[1],quantity:2,minStock:5},{product:products[0],warehouse:warehouses[2],quantity:5,minStock:8}]},
  '/agenda': {events:[{id:'ag1',title:'Seguimiento flotilla preventiva · Flotillas Norte',startAt:'2026-09-12T15:00:00Z',type:'CRM',priority:'HIGH'}]},
  '/agenda/meta': {types:['CRM','FINANCE','HR','PROCUREMENT'],priorities:['LOW','MEDIUM','HIGH']},
  '/activity/notifications': {notifications:[{id:'n1',title:'Demo local activa',message:'Todos los datos se ejecutan en el navegador.',read:false,createdAt:now()}]},
  '/modules/dashboard': {companyModules:[
    'inicio','aprobaciones','ventas','crm','compras','inventario','finanzas','facturacion-fiscal','rrhh','reportes','pos','produccion','proyectos','marketing'
  ].map((key)=>({id:`cm-${key}`,enabled:true,module:{id:key,key,name:key}})),modules:[]},
  '/admin/users': {users:[offlineDemoUser]},
  '/admin/roles': {roles:[{id:'offline-admin-role',name:'Administrador Demo',description:'Acceso total al frontend demo',permissions:['*']}]},
  '/reports/demo-readiness': {score:100,ready:true,checks:[]},
  '/reports/demo': {summary:{revenue:684920,pipeline:704500,inventoryValue:1248360,employees:employees.length},demoStory:[{title:'Inventario',value:'$1.25 M',detail:'8 familias / 3 almacenes'},{title:'Ventas del mes',value:'$684,920',detail:'Mostrador + mayoreo + flotillas'}],modules:[]},
  '/intelligence/dashboard': {summary:{alerts:2,opportunities:3,score:88},insights:[{id:'i1',title:'Inventario crítico',description:'Reabastecer amortiguadores, horquillas y baterías antes del pico de fin de semana.',severity:'warning'}]},
  '/pos/dashboard': {summary:{salesToday:38420,tickets:27,averageTicket:1423,openRegisters:2},products,categories,customers,warehouses,terminals:[{id:'term1',name:'Mostrador MTY 01',branch:branches[0],status:'OPEN'},{id:'term2',name:'Mostrador Guadalupe 01',branch:branches[1],status:'OPEN'}],sessions:[{id:'sess1',terminalId:'term1',cashier:employees[1],openedAt:'2026-09-11T08:02:00Z',openingCash:2500,status:'OPEN'}],transactions:posSales,sales:posSales},
  '/production/dashboard': {summary:{orders:4,inProgress:2,efficiency:94},orders:[{id:'wo1',folio:'KIT-2026-0041',name:'Kit afinación Nissan Versa 1.6',status:'IN_PROGRESS',quantity:12,product:products[4]},{id:'wo2',folio:'KIT-2026-0042',name:'Kit frenos delanteros Versa',status:'PLANNED',quantity:8,product:products[1]}],workCenters:[{id:'wc1',name:'Área de armado de kits',status:'ACTIVE'}],boms:[]},
  '/flow/dashboard': {summary:{active:2,runsToday:6,successRate:100},flows:[]},
  '/flow/catalog': {triggers:[],actions:[]},
  '/data-hub/dashboard': {summary:{imports:3,rows:820,errors:0},jobs:[]},
  '/data-hub/definitions': {definitions:[]},
  '/expenses/dashboard': {summary:{month:86450,pending:2,approved:8},expenses:[{id:'exp1',folio:'GAS-0911',concept:'Flete urgente proveedor suspensión',amount:7850,status:'APPROVED',department:departments[2]},{id:'exp2',folio:'GAS-0912',concept:'Publicidad Mes del Frenado Seguro',amount:17450,status:'APPROVED',department:departments[0]}]},
  '/expenses': {expenses:[{id:'exp1',folio:'GAS-0911',concept:'Flete urgente proveedor suspensión',amount:7850,status:'APPROVED'},{id:'exp2',folio:'GAS-0912',concept:'Publicidad Mes del Frenado Seguro',amount:17450,status:'APPROVED'}]},
  '/fixed-assets/dashboard': {summary:{assets:14,bookValue:1368000,depreciation:248000},assets:[{id:'fa1',code:'MTY-MONT-01',name:'Montacargas eléctrico 2.5T',category:'Equipo de almacén',bookValue:438000,status:'ACTIVE'},{id:'fa2',code:'MTY-VEH-03',name:'Nissan NP300 reparto',category:'Vehículos',bookValue:365000,status:'ACTIVE'}]},
  '/fixed-assets': {assets:[{id:'fa1',code:'MTY-MONT-01',name:'Montacargas eléctrico 2.5T',category:'Equipo de almacén',bookValue:438000,status:'ACTIVE'},{id:'fa2',code:'MTY-VEH-03',name:'Nissan NP300 reparto',category:'Vehículos',bookValue:365000,status:'ACTIVE'}]},
  '/treasury': {summary:{balance:972480,inflows:318600,outflows:204150},accounts:[{id:'ta1',code:'BBVA-001',name:'BBVA Operativa',type:'BANK',currency:'MXN',balance:821300},{id:'ta2',code:'CAJA-MTY',name:'Caja mostrador Monterrey',type:'CASH',currency:'MXN',balance:18650}],movements:[{id:'tm1',date:'2026-09-11',type:'INFLOW',concept:'Cobranza Flotillas Norte',amount:128000},{id:'tm2',date:'2026-09-11',type:'OUTFLOW',concept:'Pago LTH Noreste',amount:68450}]},
  '/bank-reconciliation': {summary:{pending:2,reconciled:18,difference:0},accounts:[],statements:[],transactions:[]},
  '/accounting': {summary:{accounts:42,entries:86,openPeriods:1},accounts:[{id:'acc1',code:'105-01',name:'Inventario de refacciones',type:'ASSET'},{id:'acc2',code:'401-01',name:'Ventas mostrador',type:'REVENUE'},{id:'acc3',code:'501-01',name:'Costo de venta refacciones',type:'EXPENSE'}],periods:[{id:'per1',name:'Septiembre 2026',status:'OPEN'}],entries:[{id:'je1',folio:'POL-2026-0911-01',date:'2026-09-11',description:'Venta mostrador POS-006842',status:'POSTED'}]},
  ...offlineBusiness.fixtures,
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


function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeCashFlowDemo(result) {
  const accounts = Array.isArray(result.accounts) ? result.accounts : [];
  const openingBalance = asNumber(result.summary?.openingBalance, accounts.reduce((sum, item) => sum + asNumber(item.currentBalance ?? item.balance), 0));
  result.scenarios = (Array.isArray(result.scenarios) ? result.scenarios : []).map((scenario) => ({
    status:'DRAFT', ...scenario,
    adjustments:(Array.isArray(scenario?.adjustments) ? scenario.adjustments : []).map((item) => ({
      category:item?.category || 'Operación',
      date:item?.date || new Date().toISOString().slice(0,10), amount:asNumber(item?.amount), type:item?.type || 'INFLOW', ...item,
      concept:item?.concept || item?.name || 'Supuesto financiero', probability:asNumber(item?.probability, 100),
    })),
  }));
  const requestedScenario = result.filters?.scenarioId || result.selectedScenario?.id || '';
  result.selectedScenario = result.scenarios.find((item) => item.id === requestedScenario) || result.selectedScenario || result.scenarios.find((item)=>item.status==='ACTIVE') || null;
  result.filters = {...(result.filters || {}), scenarioId:result.selectedScenario?.id || ''};
  result.recentMovements = (Array.isArray(result.recentMovements) ? result.recentMovements : []).map((item,index) => ({
    folio:`TES-DEMO-${String(index+1).padStart(4,'0')}`,
    concept:item?.concept || item?.description || 'Movimiento de Tesorería',
    category:item?.category || 'Operación', amount:Math.abs(asNumber(item?.amount)),
    type:item?.type === 'INFLOW' ? 'INCOME' : item?.type === 'OUTFLOW' ? 'EXPENSE' : (item?.type || 'INCOME'),
    ...item,
    movementDate:item?.movementDate || item?.occurredAt || item?.date || new Date().toISOString(),
    account:item?.account || item?.treasuryAccount || accounts[0] || {id:'cash-demo',name:'Cuenta demo'},
  }));
  let running = openingBalance;
  result.monthly = (Array.isArray(result.monthly) ? result.monthly : []).map((item,index) => {
    const inflow = asNumber(item?.inflow);
    const outflow = Math.abs(asNumber(item?.outflow));
    running += inflow - outflow;
    return {month:item?.month || item?.label || `Mes ${index+1}`, ...item, inflow, outflow, closingBalance:asNumber(item?.closingBalance, running)};
  });
  result.timeline = (Array.isArray(result.timeline) ? result.timeline : []).map((item,index)=>({id:`cash-line-${index+1}`,date:new Date().toISOString().slice(0,10),type:'INFLOW',category:'Operación',description:'Movimiento proyectado',balance:openingBalance,...item,amount:Math.abs(asNumber(item?.amount))}));
  result.risks = (Array.isArray(result.risks) ? result.risks : []).map((risk)=>({level:'MEDIUM',...risk,amount:asNumber(risk?.amount)}));
  result.summary = {
    openingBalance,totalActualInflow:0,totalActualOutflow:0,totalReceivables:0,totalPayables:0,
    projectedClosingBalance:openingBalance,minimumBalance:openingBalance,netProjection:0,
    ...(result.summary || {}),
  };
  return result;
}

function normalizeBankReconciliationDemo(result) {
  const accounts = Array.isArray(result.accounts) ? result.accounts : [];
  result.accounts = accounts.map((account,index)=>({code:`BAN-${String(index+1).padStart(3,'0')}`,name:'Cuenta bancaria',type:'BANK',currency:'MXN',active:true,...account}));
  result.movements = (Array.isArray(result.movements) ? result.movements : Array.isArray(result.transactions) ? result.transactions : []).map((item,index)=>({
    id:item?.id || `treasury-demo-${index+1}`, folio:item?.folio || `TES-DEMO-${String(index+1).padStart(4,'0')}`,
    concept:item?.concept || item?.description || 'Movimiento de Tesorería', ...item,
    movementDate:item?.movementDate || item?.occurredAt || item?.date || new Date().toISOString(), amount:Math.abs(asNumber(item?.amount)),
  }));
  result.transactions = result.movements;
  result.statements = (Array.isArray(result.statements) ? result.statements : []).map((statement,index) => {
    const treasuryAccount = statement?.treasuryAccount || statement?.account || result.accounts.find((account)=>account.id===(statement?.treasuryAccountId || statement?.accountId)) || result.accounts[0] || {id:'bank-demo',code:'BAN-001',name:'Cuenta demo'};
    const lines = (Array.isArray(statement?.lines) ? statement.lines : []).map((line,lineIndex)=>({
      id:line?.id || `bank-line-${index+1}-${lineIndex+1}`,
      description:line?.description || 'Movimiento bancario', reference:line?.reference || '', type:line?.type || (asNumber(line?.amount)>=0?'CREDIT':'DEBIT'),
      status:line?.status || 'PENDING',
      treasuryMovementId:line?.treasuryMovementId || line?.matchedMovement?.id || null,
      ...line,
      transactionDate:line?.transactionDate || line?.date || statement?.statementDate || new Date().toISOString(),
      amount:Math.abs(asNumber(line?.amount)), treasuryMovement:line?.treasuryMovement || line?.matchedMovement || null,
    }));
    return {
      folio:`EC-DEMO-${String(index+1).padStart(4,'0')}`,status:'IN_PROGRESS',openingBalance:0,closingBalance:0,
      ...statement,
      treasuryAccountId:statement?.treasuryAccountId || statement?.accountId || treasuryAccount.id,
      treasuryAccount,
      statementDate:statement?.statementDate || statement?.endDate || new Date().toISOString(),
      periodStart:statement?.periodStart || statement?.startDate || new Date().toISOString(),
      periodEnd:statement?.periodEnd || statement?.endDate || new Date().toISOString(),
      lines,
    };
  });
  const allLines = result.statements.flatMap((statement)=>statement.lines);
  result.stats = {
    statements:result.statements.length,
    pendingLines:allLines.filter((line)=>line.status==='PENDING').length,
    matchedLines:allLines.filter((line)=>line.status==='MATCHED').length,
    pendingAmount:allLines.filter((line)=>line.status==='PENDING').reduce((sum,line)=>sum+Math.abs(asNumber(line.amount)),0),
    reconciledStatements:result.statements.filter((statement)=>['RECONCILED','CLOSED'].includes(statement.status)).length,
  };
  return result;
}

function normalizePosDemo(result) {
  const stockByProduct = [14,28,9,46,82,21,12,8];
  result.warehouses = (Array.isArray(result.warehouses) ? result.warehouses : warehouses).map((warehouse)=>({...warehouse}));
  result.terminals = (Array.isArray(result.terminals) ? result.terminals : []).map((terminal,index)=>{
    const warehouse = terminal?.warehouse || result.warehouses[index % Math.max(1,result.warehouses.length)] || null;
    return {code:`POS-${index===0?'MTY':'GPE'}-${String(index+1).padStart(2,'0')}`,warehouseId:warehouse?.id || null,...terminal,warehouse,active:terminal?.active ?? terminal?.status!=='CLOSED'};
  });
  if (!result.terminals.length && result.warehouses.length) result.terminals = [{id:'term-demo-1',code:'POS-MTY-01',name:'Mostrador Monterrey 01',active:true,warehouseId:result.warehouses[0].id,warehouse:result.warehouses[0]}];
  result.products = (Array.isArray(result.products) ? result.products : products).map((product,index)=>{
    const inventoryBalances = Array.isArray(product?.inventoryBalances) && product.inventoryBalances.length ? product.inventoryBalances : result.warehouses.slice(0,2).map((warehouse,wIndex)=>({id:`pos-bal-${product.id}-${warehouse.id}`,productId:product.id,warehouseId:warehouse.id,warehouse,quantity:Math.max(0,stockByProduct[index%stockByProduct.length]-wIndex*2),reserved:0}));
    return {...product,salePrice:asNumber(product?.salePrice ?? product?.price),inventoryBalances};
  });
  result.sessions = (Array.isArray(result.sessions) ? result.sessions : []).map((session,index)=>{
    const terminal = session?.terminal || result.terminals.find((item)=>item.id===session?.terminalId) || result.terminals[index%Math.max(1,result.terminals.length)] || null;
    return {openedBy:session?.openedBy || session?.cashier || employees[1] || offlineDemoUser,difference:asNumber(session?.difference),...session,terminalId:session?.terminalId || terminal?.id,terminal,openingAmount:asNumber(session?.openingAmount ?? session?.openingCash),movements:Array.isArray(session?.movements)?session.movements:[],sales:Array.isArray(session?.sales)?session.sales:[]};
  });
  if (!result.sessions.length && result.terminals.length) result.sessions=[{id:'sess-demo-1',terminalId:result.terminals[0].id,terminal:result.terminals[0],openedBy:employees[1]||offlineDemoUser,openedAt:new Date().toISOString(),openingAmount:2500,status:'OPEN',movements:[],sales:[]}];
  const activeSession = result.sessions.find((session)=>session.status==='OPEN') || result.sessions[0] || null;
  result.customers = Array.isArray(result.customers) ? result.customers : customers;
  result.sales = (Array.isArray(result.sales) ? result.sales : []).map((sale,index)=>{
    const saleItems = (Array.isArray(sale?.items)?sale.items:[]).map((item,itemIndex)=>({id:item?.id||`pos-item-${index}-${itemIndex}`,productId:item?.productId||item?.product?.id,product:item?.product||null,sku:item?.sku||item?.product?.sku,description:item?.description||item?.product?.name||'Producto',quantity:asNumber(item?.quantity,1),unitPrice:asNumber(item?.unitPrice),discount:asNumber(item?.discount),taxRate:asNumber(item?.taxRate,16),total:asNumber(item?.total,asNumber(item?.quantity,1)*asNumber(item?.unitPrice)),...item}));
    const subtotal = asNumber(sale?.subtotal, saleItems.reduce((sum,item)=>sum+item.quantity*item.unitPrice,0));
    const total = asNumber(sale?.total, subtotal);
    const payments = Array.isArray(sale?.payments) && sale.payments.length ? sale.payments : [{id:`pos-payment-${index+1}`,method:sale?.paymentMethod||'CASH',amount:total,reference:'DEMO'}];
    $1createdBy:sale?.createdBy||sale?.seller||employees[1]||offlineDemoUser,customer:sale?.customer||result.customers[0]||null,...sale,saleDate:sale?.saleDate||sale?.createdAt||new Date().toISOString(),status:sale?.status||'PAID',subtotal,taxTotal:asNumber(sale?.taxTotal,Math.max(0,total-subtotal)),discountTotal:asNumber(sale?.discountTotal),total,items:saleItems,payments,terminal:sale?.terminal||activeSession?.terminal||result.terminals[0]||null,session:sale?.session||activeSession};
  });
  const paidSales=result.sales.filter((sale)=>sale.status==='PAID');
  const totalToday=paidSales.reduce((sum,sale)=>sum+asNumber(sale.total),0);
  const allPayments=paidSales.flatMap((sale)=>sale.payments||[]);
  result.summary={openSessions:result.sessions.filter((session)=>session.status==='OPEN').length,totalToday,tickets:paidSales.length,avgTicket:paidSales.length?totalToday/paidSales.length:0,cashToday:allPayments.filter((payment)=>payment.method==='CASH').reduce((sum,payment)=>sum+asNumber(payment.amount),0),cardToday:allPayments.filter((payment)=>payment.method==='CARD').reduce((sum,payment)=>sum+asNumber(payment.amount),0)};
  return result;
}

function normalizeProductionDemo(result) {
  result.products = Array.isArray(result.products) && result.products.length ? result.products : products;
  result.warehouses = Array.isArray(result.warehouses) && result.warehouses.length ? result.warehouses : warehouses;
  result.employees = Array.isArray(result.employees) && result.employees.length ? result.employees : employees;
  result.projects = Array.isArray(result.projects) ? result.projects : [];
  result.salesOrders = Array.isArray(result.salesOrders) ? result.salesOrders : [];
  result.workCenters = (Array.isArray(result.workCenters)?result.workCenters:[]).map((center,index)=>({code:`WC-${String(index+1).padStart(2,'0')}`,name:'Centro de trabajo',description:'Operación demo',...center,capacityPerDay:asNumber(center?.capacityPerDay ?? center?.capacity,24),hourlyRate:asNumber(center?.hourlyRate,380),active:center?.active ?? center?.status!=='INACTIVE'}));
  if(!result.workCenters.length) result.workCenters=[{id:'wc-demo-1',code:'ARM-KIT',name:'Área de armado de kits',description:'Preparación y empaque de kits automotrices',capacityPerDay:24,hourlyRate:380,active:true}];
  result.boms=(Array.isArray(result.boms)?result.boms:[]).map((bom,index)=>{
    const finishedProduct=bom?.finishedProduct||bom?.outputProduct||result.products[index%Math.max(1,result.products.length)]||null;
    const items=(Array.isArray(bom?.items)?bom.items:[]).map((item,itemIndex)=>({id:item?.id||`bom-item-${index}-${itemIndex}`,componentId:item?.componentId||item?.component?.id||item?.product?.id,component:item?.component||item?.product||result.products[itemIndex%Math.max(1,result.products.length)],quantity:asNumber(item?.quantity,1),wastePercent:asNumber(item?.wastePercent),sortOrder:item?.sortOrder??itemIndex+1,...item}));
    return {code:`BOM-DEMO-${index+1}`,name:'Lista de materiales demo',version:1,baseQuantity:1,active:true,...bom,finishedProductId:bom?.finishedProductId||finishedProduct?.id,finishedProduct,items};
  });
  result.orders=(Array.isArray(result.orders)?result.orders:[]).map((order,index)=>{
    const plannedQuantity=asNumber(order?.plannedQuantity ?? order?.quantity,1);
    const producedQuantity=asNumber(order?.producedQuantity ?? order?.completedQuantity,0);
    const legacyItems=Array.isArray(order?.items)?order.items:[];
    const materials=(Array.isArray(order?.materials)&&order.materials.length?order.materials:legacyItems.map((item,itemIndex)=>({id:`mat-${order.id||index}-${itemIndex}`,productId:item?.productId||item?.product?.id,product:item?.product||result.products[itemIndex%Math.max(1,result.products.length)],plannedQuantity:asNumber(item?.plannedQuantity??item?.quantity,1),issuedQuantity:order?.status==='IN_PROGRESS'?asNumber(item?.quantity,1)*0.65:0,unitCost:asNumber(item?.unitCost??item?.product?.cost)}))).map((item)=>({...item,plannedQuantity:asNumber(item.plannedQuantity),issuedQuantity:asNumber(item.issuedQuantity),unitCost:asNumber(item.unitCost)}));
    const workCenter=order?.workCenter||result.workCenters[0];
    const operations=(Array.isArray(order?.operations)&&order.operations.length?order.operations:[{id:`op-${order.id||index}-1`,sequence:10,name:'Armado y validación',status:order?.status==='IN_PROGRESS'?'IN_PROGRESS':order?.status==='COMPLETED'?'DONE':'READY',plannedMinutes:90,actualMinutes:order?.status==='IN_PROGRESS'?55:order?.status==='COMPLETED'?88:0,workCenter,employee:result.employees[2]||result.employees[0]||null,laborCost:order?.status==='IN_PROGRESS'?420:0,overheadCost:order?.status==='IN_PROGRESS'?180:0}]).map((op)=>({...op,workCenter:op?.workCenter||workCenter,employee:op?.employee||null,laborCost:asNumber(op?.laborCost),overheadCost:asNumber(op?.overheadCost),actualMinutes:asNumber(op?.actualMinutes),plannedMinutes:asNumber(op?.plannedMinutes)}));
    const consumptions=Array.isArray(order?.consumptions)?order.consumptions:materials.filter(()=>producedQuantity>0).map((item,itemIndex)=>({id:`cons-${order.id||index}-${itemIndex}`,product:item.product,productId:item.productId,quantity:Math.min(item.plannedQuantity,item.issuedQuantity||item.plannedQuantity*0.6),unitCost:item.unitCost,consumedAt:new Date().toISOString()}));
    const outputs=Array.isArray(order?.outputs)?order.outputs:(producedQuantity>0?[{id:`out-${order.id||index}-1`,product:order.product,productId:order.product?.id,quantity:producedQuantity,unitCost:0,completedAt:new Date().toISOString()}]:[]);
    const wasteRecords=Array.isArray(order?.wasteRecords)?order.wasteRecords:[];
    const costs=Array.isArray(order?.costs)?order.costs:[];
    const batches=Array.isArray(order?.batches)?order.batches:(producedQuantity>0?[{id:`batch-${order.id||index}-1`,lotNumber:`LOT-DEMO-${String(index+1).padStart(3,'0')}`,product:order.product,productId:order.product?.id,quantity:producedQuantity,manufacturedAt:new Date().toISOString(),qualityStatus:'APPROVED'}]:[]);
    const materialCost=consumptions.reduce((sum,row)=>sum+asNumber(row.quantity)*asNumber(row.unitCost),0);
    const operationLabor=operations.reduce((sum,row)=>sum+asNumber(row.laborCost),0);
    const operationOverhead=operations.reduce((sum,row)=>sum+asNumber(row.overheadCost),0);
    const additionalCosts=costs.reduce((sum,row)=>sum+asNumber(row.amount),0);
    const wasteCost=wasteRecords.reduce((sum,row)=>sum+asNumber(row.cost),0);
    const totalCost=materialCost+operationLabor+operationOverhead+additionalCosts+wasteCost;
    const completedOps=operations.filter((op)=>op.status==='DONE').length;
    const metrics={...(order?.metrics||{}),materialCost,operationLabor,operationOverhead,additionalCosts,wasteCost,totalCost,progress:plannedQuantity?Math.min(100,(producedQuantity/plannedQuantity)*100):0,unitCost:producedQuantity?totalCost/producedQuantity:0,opProgress:operations.length?(completedOps/operations.length)*100:0,completedOps,operations:operations.length};
    return {priority:'MEDIUM',plannedStartAt:order?.plannedStartAt||order?.plannedStart||null,plannedEndAt:order?.plannedEndAt||order?.dueDate||null,...order,plannedQuantity,producedQuantity,operations,materials,consumptions,outputs,wasteRecords,costs,batches,metrics};
  });
  const active=result.orders.filter((order)=>['PLANNED','RELEASED','IN_PROGRESS','PAUSED'].includes(order.status));
  const totalPlanned=active.reduce((sum,order)=>sum+asNumber(order.plannedQuantity),0);
  const totalProduced=active.reduce((sum,order)=>sum+asNumber(order.producedQuantity),0);
  result.summary={activeOrders:active.length,inProgress:result.orders.filter((order)=>order.status==='IN_PROGRESS').length,completed:result.orders.filter((order)=>order.status==='COMPLETED').length,late:active.filter((order)=>order.plannedEndAt&&new Date(order.plannedEndAt)<new Date()).length,totalPlanned,totalProduced,totalCost:result.orders.reduce((sum,order)=>sum+asNumber(order.metrics?.totalCost),0),wasteCost:result.orders.reduce((sum,order)=>sum+asNumber(order.metrics?.wasteCost),0),efficiency:totalPlanned?(totalProduced/totalPlanned)*100:0};
  return result;
}

function normalizeProjectsDemo(result) {
  result.employees=Array.isArray(result.employees)&&result.employees.length?result.employees:employees;
  result.customers=Array.isArray(result.customers)&&result.customers.length?result.customers:customers;
  result.salesOrders=Array.isArray(result.salesOrders)?result.salesOrders:[];
  result.purchaseOrders=Array.isArray(result.purchaseOrders)?result.purchaseOrders:[];
  result.projects=(Array.isArray(result.projects)?result.projects:[]).map((project,index)=>{
    const status=project?.status==='IN_PROGRESS'?'ACTIVE':(project?.status||'PLANNING');
    const tasks=(Array.isArray(project?.tasks)?project.tasks:[]).map((task,taskIndex)=>({description:'',sortOrder:(taskIndex+1)*10,...task,assigneeId:task?.assigneeId||task?.assignee?.id||null,assignee:task?.assignee||result.employees[taskIndex%Math.max(1,result.employees.length)]||null,priority:task?.priority||'MEDIUM',estimatedHours:asNumber(task?.estimatedHours,8)}));
    const members=(Array.isArray(project?.members)?project.members:[]).map((member,memberIndex)=>member?.employee?{allocationPercent:100,...member}:{id:`project-member-${project.id||index}-${memberIndex}`,employeeId:member?.id,employee:member,role:memberIndex===0?'Líder de proyecto':'Equipo operativo',allocationPercent:memberIndex===0?100:60});
    const timeEntries=(Array.isArray(project?.timeEntries)?project.timeEntries:[]).map((entry,entryIndex)=>({task:null,createdBy:offlineDemoUser,...entry,employee:entry?.employee||result.employees[entryIndex%Math.max(1,result.employees.length)]||offlineDemoUser,hourlyCost:asNumber(entry?.hourlyCost,280)}));
    const purchaseLinks=(Array.isArray(project?.purchaseOrders)?project.purchaseOrders:[]).map((link,linkIndex)=>link?.purchaseOrder?link:{id:`project-po-${project.id||index}-${linkIndex}`,purchaseOrderId:link?.id,purchaseOrder:link});
    const salesLinks=(Array.isArray(project?.salesOrders)?project.salesOrders:[]).map((link,linkIndex)=>link?.salesOrder?link:{id:`project-so-${project.id||index}-${linkIndex}`,salesOrderId:link?.id,salesOrder:link});
    const comments=(Array.isArray(project?.comments)?project.comments:[]).map((comment)=>({createdAt:new Date().toISOString(),...comment,createdBy:comment?.createdBy||offlineDemoUser}));
    const documents=(Array.isArray(project?.documents)?project.documents:[]).map((document)=>({name:'archivo-demo.pdf',createdAt:new Date().toISOString(),...document,fileUrl:document?.fileUrl||document?.url||'#demo-document',uploadedBy:document?.uploadedBy||offlineDemoUser}));
    const productive=tasks.filter((task)=>task.status!=='CANCELLED');
    const done=productive.filter((task)=>task.status==='DONE').length;
    const laborHours=timeEntries.reduce((sum,entry)=>sum+asNumber(entry.hours),0);
    const laborCost=timeEntries.reduce((sum,entry)=>sum+asNumber(entry.hours)*asNumber(entry.hourlyCost),0);
    const purchaseCost=purchaseLinks.reduce((sum,link)=>sum+asNumber(link.purchaseOrder?.total),0);
    const revenue=salesLinks.reduce((sum,link)=>sum+asNumber(link.salesOrder?.total),0);
    const actualCost=laborCost+purchaseCost;
    const budget=asNumber(project?.budget);
    const metrics={...(project?.metrics||{}),taskProgress:productive.length?Math.round(done/productive.length*100):0,tasksTotal:productive.length,tasksDone:done,overdueTasks:tasks.filter((task)=>task.dueDate&&!['DONE','CANCELLED'].includes(task.status)&&new Date(task.dueDate)<new Date()).length,laborHours,laborCost,purchaseCost,actualCost,revenue,margin:revenue-actualCost,budgetUsed:budget?Math.round(actualCost/budget*100):0,plannedHours:asNumber(project?.plannedHours)};
    return {priority:'MEDIUM',startDate:'2026-09-01',dueDate:'2026-10-15',parentProject:null,subprojects:[],...project,status,tasks,members,timeEntries,purchaseOrders:purchaseLinks,salesOrders:salesLinks,comments,documents,metrics};
  });
  const totals=result.projects.reduce((acc,project)=>{acc.budget+=asNumber(project.budget);acc.actualCost+=asNumber(project.metrics?.actualCost);acc.revenue+=asNumber(project.metrics?.revenue);acc.hours+=asNumber(project.metrics?.laborHours);acc.overdueTasks+=asNumber(project.metrics?.overdueTasks);return acc},{budget:0,actualCost:0,revenue:0,hours:0,overdueTasks:0});
  result.summary={total:result.projects.length,active:result.projects.filter((project)=>['PLANNING','ACTIVE','ON_HOLD'].includes(project.status)).length,completed:result.projects.filter((project)=>project.status==='COMPLETED').length,...totals,margin:totals.revenue-totals.actualCost};
  return result;
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
      ...project,
      metrics:{taskProgress:0,tasksDone:0,tasksTotal:Array.isArray(project?.tasks)?project.tasks.length:0,overdueTasks:0,laborHours:0,loggedHours:0,plannedHours:Number(project?.plannedHours||0),budgetUsed:0,actualCost:0,revenue:0,cost:0,margin:0,...(project?.metrics||{})},
    }));
    if (result.project) result.project = {members:[],subprojects:[],salesOrders:[],purchaseOrders:[],comments:[],documents:[],tasks:[],timeEntries:[],...result.project,metrics:{taskProgress:0,tasksDone:0,tasksTotal:Array.isArray(result.project?.tasks)?result.project.tasks.length:0,overdueTasks:0,laborHours:0,loggedHours:0,plannedHours:Number(result.project?.plannedHours||0),budgetUsed:0,actualCost:0,revenue:0,cost:0,margin:0,...(result.project?.metrics||{})}};
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
    result.prospects = (Array.isArray(result.prospects) ? result.prospects : []).map((prospect) => ({probability:Number(prospect?.probability ?? 0), ...prospect, estimatedValue:Number(prospect?.estimatedValue ?? prospect?.value ?? 0)}));
    result.quotes = Array.isArray(result.quotes) ? result.quotes : [];
    result.orders = Array.isArray(result.orders) ? result.orders : [];
    result.receivables = Array.isArray(result.receivables) ? result.receivables : [];
    result.activities = (Array.isArray(result.activities) ? result.activities : []).map((activity) => ({...activity, createdBy: activity?.createdBy || offlineDemoUser}));
    result.summary = {monthSales:0,openQuotes:0,conversionRate:0,activeOrders:0,openReceivables:0,activeProspects:0,...(result.summary || {})};
  }
  if (path === '/sales-enterprise/prospects') {
    result.prospects = (Array.isArray(result.prospects) ? result.prospects : []).map((prospect) => ({probability:Number(prospect?.probability ?? 0), ...prospect, estimatedValue:Number(prospect?.estimatedValue ?? prospect?.value ?? 0)}));
  }
  if (path === '/sales') {
    result.quotes = (Array.isArray(result.quotes) ? result.quotes : []).map((quote) => ({items:[], customer: customers[0], quoteDate: now(), validUntil: now(), total:0, ...quote, createdBy: quote?.createdBy || offlineDemoUser}));
    result.orders = (Array.isArray(result.orders) ? result.orders : []).map((order) => ({items:[], customer: customers[0], orderDate: now(), deliveryDate: now(), total:0, ...order, createdBy: order?.createdBy || offlineDemoUser}));
    result.customers = Array.isArray(result.customers) ? result.customers : [];
    result.products = Array.isArray(result.products) ? result.products : products;
    result.stats = {...(result.stats || {})};
  }
  if (path === '/projects/dashboard') {
    result.projects = (Array.isArray(result.projects) ? result.projects : []).map((project) => ({
      members:[], subprojects:[], salesOrders:[], purchaseOrders:[], comments:[], documents:[], tasks:[], timeEntries:[],
      customer:null, manager:null,
      ...project,
      metrics:{taskProgress:0,tasksDone:0,tasksTotal:Array.isArray(project?.tasks)?project.tasks.length:0,overdueTasks:0,laborHours:0,loggedHours:0,plannedHours:Number(project?.plannedHours||0),budgetUsed:0,actualCost:0,revenue:0,cost:0,margin:0,...(project?.metrics||{})},
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
  if (path === '/cash-flow') normalizeCashFlowDemo(result);
  if (/^\/bank-reconciliation/.test(path)) normalizeBankReconciliationDemo(result);
  if (path === '/pos/dashboard') normalizePosDemo(result);
  if (path === '/production/dashboard') normalizeProductionDemo(result);
  if (path === '/projects/dashboard') normalizeProjectsDemo(result);
  // Normalize nested collections used by detail cards so .length/.map/.reduce never receive undefined in Demo Local.
  deepNormalizeCollections(result);
  return result;
}

function readFixture(path) {
  const persisted = getPersisted();
  const exact = persisted[path] ?? fixtures[path];
  if (exact) return normalizeOfflineShape(path, exact);

  if (/^\/bank-reconciliation\/statements\/[^/]+\/candidates$/.test(path)) {
    const current = getCriticalRouteState('/bank-reconciliation');
    return normalizeOfflineShape(path, {movements: current.movements, transactions: current.movements});
  }

  const businessRoute = offlineBusiness.resolve(path);
  if (businessRoute) return normalizeOfflineShape(path, businessRoute);

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

  return normalizeOfflineShape(path, universalDemoContext());
}


function getCriticalRouteState(route) {
  const persisted = getPersisted();
  const state = clone(persisted[route] ?? fixtures[route] ?? {});
  if (route === '/cash-flow') return normalizeCashFlowDemo(state);
  if (route === '/bank-reconciliation') return normalizeBankReconciliationDemo(state);
  if (route === '/pos/dashboard') return normalizePosDemo(state);
  if (route === '/production/dashboard') return normalizeProductionDemo(state);
  if (route === '/projects/dashboard') return normalizeProjectsDemo(state);
  return state;
}

function saveCriticalRouteState(route, state) {
  const persisted = getPersisted();
  persisted[route] = clone(state);
  setPersisted(persisted);
}

function bodyValues(body) {
  if (!body || typeof body !== 'object') return {};
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return Object.fromEntries([...body.entries()].filter(([,value]) => typeof value === 'string'));
  }
  return body;
}

function handleCashFlowMutation(path, method, body) {
  if (!/^\/cash-flow\//.test(path)) return null;
  const state = getCriticalRouteState('/cash-flow');
  const values = bodyValues(body);
  let response = null;

  if (path === '/cash-flow/scenarios' && method === 'POST') {
    const scenario = {
      id:`cash-scenario-${Date.now()}`,
      name:values.name || 'Escenario Demo',
      description:values.description || null,
      startDate:values.startDate || new Date().toISOString().slice(0,10),
      endDate:values.endDate || new Date(Date.now()+90*86400000).toISOString().slice(0,10),
      status:values.status || 'DRAFT',
      adjustments:[],
      createdAt:now(),
    };
    state.scenarios = [scenario, ...state.scenarios];
    response = {...baseResponse(), scenario};
  }

  const statusMatch = path.match(/^\/cash-flow\/scenarios\/([^/]+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const id = statusMatch[1];
    state.scenarios = state.scenarios.map((item)=>item.id===id?{...item,status:values.status || item.status}:values.status==='ACTIVE'?{...item,status:item.status==='ACTIVE'?'DRAFT':item.status}:item);
    if (values.status === 'ACTIVE') state.scenarios = state.scenarios.map((item)=>item.id===id?item:{...item,status:item.status==='ACTIVE'?'DRAFT':item.status});
    state.selectedScenario = state.scenarios.find((item)=>item.id===id) || state.selectedScenario;
    state.filters = {...state.filters,scenarioId:state.selectedScenario?.id || ''};
    response = {...baseResponse(), scenario:state.selectedScenario};
  }

  const addAdjustment = path.match(/^\/cash-flow\/scenarios\/([^/]+)\/adjustments$/);
  if (addAdjustment && method === 'POST') {
    const scenarioId = addAdjustment[1];
    const adjustment = {
      id:`cash-adjustment-${Date.now()}`,
      type:values.type || 'INFLOW',
      concept:values.concept || values.name || 'Ajuste demo',
      category:values.category || 'Operación',
      date:values.date || new Date().toISOString().slice(0,10),
      amount:asNumber(values.amount),
      probability:asNumber(values.probability,100),
      notes:values.notes || null,
    };
    state.scenarios = state.scenarios.map((item)=>item.id===scenarioId?{...item,adjustments:[adjustment,...(item.adjustments||[])]}:item);
    state.selectedScenario = state.scenarios.find((item)=>item.id===scenarioId) || state.selectedScenario;
    response = {...baseResponse(), adjustment};
  }

  const deleteAdjustment = path.match(/^\/cash-flow\/scenarios\/([^/]+)\/adjustments\/([^/]+)$/);
  if (deleteAdjustment && method === 'DELETE') {
    const [,scenarioId,adjustmentId] = deleteAdjustment;
    state.scenarios = state.scenarios.map((item)=>item.id===scenarioId?{...item,adjustments:(item.adjustments||[]).filter((row)=>row.id!==adjustmentId)}:item);
    state.selectedScenario = state.scenarios.find((item)=>item.id===scenarioId) || state.selectedScenario;
    response = {...baseResponse(), deleted:true};
  }

  if (!response) return null;
  normalizeCashFlowDemo(state);
  saveCriticalRouteState('/cash-flow', state);
  return response;
}

function handleBankMutation(path, method, body) {
  if (!/^\/bank-reconciliation\//.test(path)) return null;
  const state = getCriticalRouteState('/bank-reconciliation');
  const values = bodyValues(body);
  let response = null;

  if (path === '/bank-reconciliation/statements' && method === 'POST') {
    const account = state.accounts.find((item)=>item.id===values.treasuryAccountId) || state.accounts[0] || null;
    const statement = {
      id:`statement-demo-${Date.now()}`,
      folio:`EC-DEMO-${String(state.statements.length+1).padStart(4,'0')}`,
      treasuryAccountId:account?.id || values.treasuryAccountId || null,
      treasuryAccount:account,
      statementDate:values.statementDate || new Date().toISOString().slice(0,10),
      periodStart:values.periodStart || new Date().toISOString().slice(0,10),
      periodEnd:values.periodEnd || new Date().toISOString().slice(0,10),
      openingBalance:asNumber(values.openingBalance),
      closingBalance:asNumber(values.closingBalance),
      notes:values.notes || null,
      status:'IN_PROGRESS',
      lines:[],
    };
    state.statements = [statement,...state.statements];
    response = {...baseResponse(), statement};
  }

  const lineAdd = path.match(/^\/bank-reconciliation\/statements\/([^/]+)\/lines$/);
  if (lineAdd && method === 'POST') {
    const statementId = lineAdd[1];
    const line = {
      id:`bank-line-demo-${Date.now()}`,
      transactionDate:values.transactionDate || new Date().toISOString().slice(0,10),
      description:values.description || 'Movimiento bancario demo',
      reference:values.reference || null,
      type:values.type || 'DEBIT',
      amount:Math.abs(asNumber(values.amount)),
      bankBalance:values.bankBalance == null ? null : asNumber(values.bankBalance),
      notes:values.notes || null,
      status:'PENDING',
      treasuryMovement:null,
      treasuryMovementId:null,
    };
    state.statements = state.statements.map((item)=>item.id===statementId?{...item,lines:[line,...(item.lines||[])]}:item);
    response = {...baseResponse(), line};
  }

  const matchLine = path.match(/^\/bank-reconciliation\/lines\/([^/]+)\/match$/);
  if (matchLine && method === 'POST') {
    const lineId = matchLine[1];
    const movement = state.movements.find((item)=>item.id===values.treasuryMovementId) || null;
    state.statements = state.statements.map((statement)=>({...statement,lines:(statement.lines||[]).map((line)=>line.id===lineId?{...line,status:'MATCHED',treasuryMovementId:movement?.id||values.treasuryMovementId||null,treasuryMovement:movement}:line)}));
    response = {...baseResponse(), matched:true};
  }

  const ignoreLine = path.match(/^\/bank-reconciliation\/lines\/([^/]+)\/ignore$/);
  if (ignoreLine && method === 'PATCH') {
    const lineId = ignoreLine[1];
    state.statements = state.statements.map((statement)=>({...statement,lines:(statement.lines||[]).map((line)=>line.id===lineId?{...line,status:'IGNORED',notes:values.notes||line.notes}:line)}));
    response = {...baseResponse(), ignored:true};
  }

  const closeStatement = path.match(/^\/bank-reconciliation\/statements\/([^/]+)\/close$/);
  if (closeStatement && method === 'PATCH') {
    const statementId = closeStatement[1];
    state.statements = state.statements.map((item)=>item.id===statementId?{...item,status:'CLOSED',closedAt:now()}:item);
    response = {...baseResponse(), statement:state.statements.find((item)=>item.id===statementId)};
  }

  if (!response) return null;
  normalizeBankReconciliationDemo(state);
  saveCriticalRouteState('/bank-reconciliation', state);
  return response;
}

function handlePosMutation(path, method, body) {
  if (!/^\/pos\//.test(path)) return null;
  const state = getCriticalRouteState('/pos/dashboard');
  const values = bodyValues(body);
  let response = null;

  if (path === '/pos/terminals' && method === 'POST') {
    const warehouse = state.warehouses.find((item)=>item.id===values.warehouseId) || null;
    const terminal = {id:`pos-terminal-${Date.now()}`,code:values.code||`POS-${state.terminals.length+1}`,name:values.name||'Terminal demo',warehouseId:warehouse?.id||null,warehouse,active:true,createdAt:now()};
    state.terminals.push(terminal);
    response = {...baseResponse(),terminal};
  }
  if (path === '/pos/sessions/open' && method === 'POST') {
    const terminal = state.terminals.find((item)=>item.id===values.terminalId) || state.terminals[0] || null;
    const session = {id:`pos-session-${Date.now()}`,terminalId:terminal?.id||values.terminalId,terminal,openedBy:offlineDemoUser,openedAt:now(),openingAmount:asNumber(values.openingAmount),status:'OPEN',movements:[],sales:[]};
    state.sessions.unshift(session);
    response = {...baseResponse(),session};
  }
  const close = path.match(/^\/pos\/sessions\/([^/]+)\/close$/);
  if (close && method === 'POST') {
    const id=close[1];
    state.sessions=state.sessions.map((session)=>session.id===id?{...session,status:'CLOSED',closedAt:now(),countedAmount:asNumber(values.countedAmount),difference:asNumber(values.countedAmount)-asNumber(session.openingAmount)}:session);
    response={...baseResponse(),session:state.sessions.find((item)=>item.id===id)};
  }
  const cashMovement=path.match(/^\/pos\/sessions\/([^/]+)\/movements$/);
  if(cashMovement&&method==='POST'){
    const sessionId=cashMovement[1];
    const movement={id:`pos-cash-${Date.now()}`,type:values.type||'IN',concept:values.concept||values.description||'Movimiento de caja',amount:Math.abs(asNumber(values.amount)),notes:values.notes||null,createdAt:now(),createdBy:offlineDemoUser};
    state.sessions=state.sessions.map((session)=>session.id===sessionId?{...session,movements:[movement,...(session.movements||[])]}:session);
    response={...baseResponse(),movement};
  }
  if(path==='/pos/sales'&&method==='POST'){
    const session=state.sessions.find((item)=>item.id===values.sessionId)||state.sessions.find((item)=>item.status==='OPEN')||null;
    const customer=state.customers.find((item)=>item.id===values.customerId)||null;
    const items=(Array.isArray(values.items)?values.items:[]).map((item,index)=>{const product=state.products.find((row)=>row.id===item.productId)||null;const qty=asNumber(item.quantity,1);const unitPrice=asNumber(item.unitPrice);const discount=asNumber(item.discount);const taxRate=asNumber(item.taxRate,16);const base=Math.max(0,qty*unitPrice-discount);return{id:`pos-item-new-${Date.now()}-${index}`,productId:item.productId,product,sku:product?.sku,description:product?.name||'Producto',quantity:qty,unitPrice,discount,taxRate,total:base*(1+taxRate/100)}});
    const subtotal=items.reduce((sum,item)=>sum+item.quantity*item.unitPrice,0);const discountTotal=items.reduce((sum,item)=>sum+item.discount,0)+asNumber(values.discount?.amount);const taxTotal=items.reduce((sum,item)=>sum+Math.max(0,item.quantity*item.unitPrice-item.discount)*(item.taxRate/100),0);const total=Math.max(0,subtotal-discountTotal+taxTotal);
    const sale={id:`pos-sale-new-${Date.now()}`,folio:values.folio||`POS-DEMO-${String(state.sales.length+1).padStart(5,'0')}`,saleDate:now(),status:'PAID',subtotal,discountTotal,taxTotal,total,notes:values.notes||null,terminal:session?.terminal||null,session,customer,createdBy:offlineDemoUser,items,payments:(Array.isArray(values.payments)?values.payments:[]).map((payment,index)=>({id:`pos-pay-new-${Date.now()}-${index}`,...payment,amount:asNumber(payment.amount)}))};
    state.sales.unshift(sale);
    if(session) state.sessions=state.sessions.map((row)=>row.id===session.id?{...row,sales:[sale,...(row.sales||[])]}:row);
    for(const item of items){const product=state.products.find((row)=>row.id===item.productId);if(product&&session?.terminal?.warehouseId){product.inventoryBalances=(product.inventoryBalances||[]).map((balance)=>balance.warehouseId===session.terminal.warehouseId?{...balance,quantity:Math.max(0,asNumber(balance.quantity)-item.quantity)}:balance)}}
    response={...baseResponse(),sale};
  }
  const voidSale=path.match(/^\/pos\/sales\/([^/]+)\/void$/);
  if(voidSale&&method==='POST'){
    const saleId=voidSale[1];state.sales=state.sales.map((sale)=>sale.id===saleId?{...sale,status:'VOID',voidedAt:now()}:sale);response={...baseResponse(),sale:state.sales.find((item)=>item.id===saleId)};
  }
  if(!response)return null;
  normalizePosDemo(state);saveCriticalRouteState('/pos/dashboard',state);return response;
}

function handleProductionMutation(path, method, body) {
  if(!/^\/production\//.test(path)) return null;
  const state=getCriticalRouteState('/production/dashboard');const values=bodyValues(body);let response=null;
  if(path==='/production/work-centers'&&method==='POST'){const center={id:`wc-${Date.now()}`,code:values.code||`WC-${state.workCenters.length+1}`,name:values.name||'Centro demo',description:values.description||'',capacityPerDay:asNumber(values.capacityPerDay),hourlyRate:asNumber(values.hourlyRate),active:true};state.workCenters.push(center);response={...baseResponse(),workCenter:center};}
  if(path==='/production/boms'&&method==='POST'){const product=state.products.find((item)=>item.id===values.finishedProductId)||null;const bom={id:`bom-${Date.now()}`,code:values.code||`BOM-${state.boms.length+1}`,name:values.name||'BOM demo',version:asNumber(values.version,1),baseQuantity:asNumber(values.baseQuantity,1),active:true,finishedProductId:product?.id||values.finishedProductId,finishedProduct:product,items:(values.items||[]).map((item,index)=>({...item,id:`bom-item-new-${Date.now()}-${index}`,component:state.products.find((row)=>row.id===item.componentId)||null,quantity:asNumber(item.quantity),wastePercent:asNumber(item.wastePercent)}))};state.boms.push(bom);response={...baseResponse(),bom};}
  if(path==='/production/orders'&&method==='POST'){const product=state.products.find((item)=>item.id===values.productId)||null;const bom=state.boms.find((item)=>item.id===values.bomId)||null;const order={id:`production-order-${Date.now()}`,folio:values.folio||`OP-DEMO-${String(state.orders.length+1).padStart(4,'0')}`,name:values.name||product?.name||'Orden demo',status:'PLANNED',priority:values.priority||'MEDIUM',productId:product?.id||values.productId,product,bomId:bom?.id||null,bom,plannedQuantity:asNumber(values.plannedQuantity,1),producedQuantity:0,plannedStartAt:values.plannedStartAt||null,plannedEndAt:values.plannedEndAt||null,issueWarehouseId:values.issueWarehouseId||null,receiptWarehouseId:values.receiptWarehouseId||null,salesOrderId:values.salesOrderId||null,projectId:values.projectId||null,materials:(bom?.items||[]).map((item)=>({id:`material-new-${Date.now()}-${item.id}`,productId:item.componentId,product:item.component,plannedQuantity:asNumber(item.quantity)*asNumber(values.plannedQuantity,1),issuedQuantity:0,unitCost:asNumber(item.component?.cost)})),operations:[],consumptions:[],outputs:[],wasteRecords:[],costs:[],batches:[]};state.orders.unshift(order);response={...baseResponse(),order};}
  const status=path.match(/^\/production\/orders\/([^/]+)\/status$/);if(status&&method==='PATCH'){const id=status[1];state.orders=state.orders.map((order)=>order.id===id?{...order,status:values.status||order.status}:order);response={...baseResponse(),order:state.orders.find((item)=>item.id===id)};}
  const opAdd=path.match(/^\/production\/orders\/([^/]+)\/operations$/);if(opAdd&&method==='POST'){const id=opAdd[1];const center=state.workCenters.find((x)=>x.id===values.workCenterId)||null;const employee=state.employees.find((x)=>x.id===values.employeeId)||null;const operation={id:`production-op-${Date.now()}`,sequence:asNumber(values.sequence,10),name:values.name||'Operación demo',status:'READY',workCenterId:center?.id||null,workCenter:center,employeeId:employee?.id||null,employee,plannedMinutes:asNumber(values.plannedMinutes),actualMinutes:0,laborCost:0,overheadCost:0};state.orders=state.orders.map((order)=>order.id===id?{...order,operations:[...(order.operations||[]),operation]}:order);response={...baseResponse(),operation};}
  const opStatus=path.match(/^\/production\/orders\/([^/]+)\/operations\/([^/]+)\/status$/);if(opStatus&&method==='PATCH'){const[,orderId,opId]=opStatus;state.orders=state.orders.map((order)=>order.id===orderId?{...order,operations:(order.operations||[]).map((op)=>op.id===opId?{...op,status:values.status||op.status}:op)}:order);response={...baseResponse(),updated:true};}
  for(const [segment,key] of [['consumptions','consumptions'],['waste','wasteRecords'],['costs','costs']]){const match=path.match(new RegExp(`^/production/orders/([^/]+)/${segment}$`));if(match&&method==='POST'){const orderId=match[1];const product=state.products.find((item)=>item.id===values.productId)||null;const row={id:`production-${segment}-${Date.now()}`,...values,product,quantity:asNumber(values.quantity),unitCost:asNumber(values.unitCost),cost:asNumber(values.cost),amount:asNumber(values.amount),createdAt:now()};state.orders=state.orders.map((order)=>order.id===orderId?{...order,[key]:[row,...(order[key]||[])]}:order);response={...baseResponse(),[segment==='consumptions'?'consumption':segment==='waste'?'waste':'cost']:row};break;}}
  const output=path.match(/^\/production\/orders\/([^/]+)\/outputs$/);if(output&&method==='POST'){const orderId=output[1];const order=state.orders.find((item)=>item.id===orderId);const row={id:`production-output-${Date.now()}`,productId:order?.productId,product:order?.product,quantity:asNumber(values.quantity),unitCost:asNumber(values.unitCost),lotNumber:values.lotNumber||null,expiresAt:values.expiresAt||null,completedAt:now()};state.orders=state.orders.map((item)=>item.id===orderId?{...item,producedQuantity:asNumber(item.producedQuantity)+row.quantity,outputs:[row,...(item.outputs||[])],batches:values.lotNumber?[{id:`batch-${Date.now()}`,lotNumber:values.lotNumber,product:item.product,productId:item.productId,quantity:row.quantity,manufacturedAt:now(),expiresAt:values.expiresAt||null,qualityStatus:'APPROVED'},...(item.batches||[])]:item.batches}:item);response={...baseResponse(),output:row};}
  if(!response)return null;normalizeProductionDemo(state);saveCriticalRouteState('/production/dashboard',state);return response;
}

function handleProjectsMutation(path, method, body) {
  if(!/^\/projects(?:\/|$)/.test(path)) return null;
  const state=getCriticalRouteState('/projects/dashboard');const values=bodyValues(body);let response=null;
  if(path==='/projects'&&method==='POST'){const customer=state.customers.find((item)=>item.id===values.customerId)||null;const manager=state.employees.find((item)=>item.id===values.managerId)||null;const project={id:`project-${Date.now()}`,code:values.code||`PRY-DEMO-${String(state.projects.length+1).padStart(3,'0')}`,name:values.name||'Proyecto demo',description:values.description||'',status:values.status||'PLANNING',priority:values.priority||'MEDIUM',budget:asNumber(values.budget),plannedHours:asNumber(values.plannedHours),startDate:values.startDate||null,dueDate:values.dueDate||null,customerId:customer?.id||null,customer,managerId:manager?.id||null,manager,parentProjectId:values.parentProjectId||null,members:[],tasks:[],timeEntries:[],salesOrders:[],purchaseOrders:[],comments:[],documents:[],subprojects:[]};state.projects.unshift(project);response={...baseResponse(),project};}
  const projectUpdate=path.match(/^\/projects\/([^/]+)$/);if(projectUpdate&&['PUT','PATCH'].includes(method)){const id=projectUpdate[1];const customer=state.customers.find((item)=>item.id===values.customerId)||null;const manager=state.employees.find((item)=>item.id===values.managerId)||null;state.projects=state.projects.map((project)=>project.id===id?{...project,...values,budget:values.budget==null?project.budget:asNumber(values.budget),plannedHours:values.plannedHours==null?project.plannedHours:asNumber(values.plannedHours),customer:values.customerId!==undefined?customer:project.customer,manager:values.managerId!==undefined?manager:project.manager}:project);response={...baseResponse(),project:state.projects.find((item)=>item.id===id)};}
  const taskAdd=path.match(/^\/projects\/([^/]+)\/tasks$/);if(taskAdd&&method==='POST'){const projectId=taskAdd[1];const assignee=state.employees.find((item)=>item.id===values.assigneeId)||null;const task={id:`project-task-${Date.now()}`,title:values.title||'Tarea demo',description:values.description||'',status:values.status||'TODO',priority:values.priority||'MEDIUM',estimatedHours:asNumber(values.estimatedHours),dueDate:values.dueDate||null,assigneeId:assignee?.id||null,assignee};state.projects=state.projects.map((project)=>project.id===projectId?{...project,tasks:[task,...(project.tasks||[])]}:project);response={...baseResponse(),task};}
  const taskUpdate=path.match(/^\/projects\/([^/]+)\/tasks\/([^/]+)$/);if(taskUpdate&&method==='PUT'){const[,projectId,taskId]=taskUpdate;state.projects=state.projects.map((project)=>project.id===projectId?{...project,tasks:(project.tasks||[]).map((task)=>task.id===taskId?{...task,...values,assignee:values.assigneeId!==undefined?(state.employees.find((x)=>x.id===values.assigneeId)||null):task.assignee}:task)}:project);response={...baseResponse(),updated:true};}
  const taskStatus=path.match(/^\/projects\/([^/]+)\/tasks\/([^/]+)\/status$/);if(taskStatus&&method==='PATCH'){const[,projectId,taskId]=taskStatus;state.projects=state.projects.map((project)=>project.id===projectId?{...project,tasks:(project.tasks||[]).map((task)=>task.id===taskId?{...task,status:values.status||task.status}:task)}:project);response={...baseResponse(),updated:true};}
  const timeAdd=path.match(/^\/projects\/([^/]+)\/time-entries$/);if(timeAdd&&method==='POST'){const projectId=timeAdd[1];const employee=state.employees.find((item)=>item.id===values.employeeId)||null;const entry={id:`project-time-${Date.now()}`,employeeId:employee?.id||values.employeeId,employee,taskId:values.taskId||null,date:values.date||new Date().toISOString().slice(0,10),hours:asNumber(values.hours),hourlyCost:asNumber(values.hourlyCost,280),description:values.description||'',createdBy:offlineDemoUser};state.projects=state.projects.map((project)=>project.id===projectId?{...project,timeEntries:[entry,...(project.timeEntries||[])]}:project);response={...baseResponse(),timeEntry:entry};}
  const memberAdd=path.match(/^\/projects\/([^/]+)\/members$/);if(memberAdd&&method==='POST'){const projectId=memberAdd[1];const employee=state.employees.find((item)=>item.id===values.employeeId)||null;const member={id:`project-member-${Date.now()}`,employeeId:employee?.id||values.employeeId,employee,role:values.role||'',allocationPercent:asNumber(values.allocationPercent,100)};state.projects=state.projects.map((project)=>project.id===projectId?{...project,members:[member,...(project.members||[]).filter((x)=>x.employeeId!==member.employeeId)]}:project);response={...baseResponse(),member};}
  const memberDelete=path.match(/^\/projects\/([^/]+)\/members\/([^/]+)$/);if(memberDelete&&method==='DELETE'){const[,projectId,memberId]=memberDelete;state.projects=state.projects.map((project)=>project.id===projectId?{...project,members:(project.members||[]).filter((item)=>item.id!==memberId)}:project);response={...baseResponse(),deleted:true};}
  const commentAdd=path.match(/^\/projects\/([^/]+)\/comments$/);if(commentAdd&&method==='POST'){const projectId=commentAdd[1];const comment={id:`project-comment-${Date.now()}`,content:values.content||values.comment||'',createdAt:now(),createdBy:offlineDemoUser};state.projects=state.projects.map((project)=>project.id===projectId?{...project,comments:[comment,...(project.comments||[])]}:project);response={...baseResponse(),comment};}
  const linkAdd=path.match(/^\/projects\/([^/]+)\/links$/);if(linkAdd&&method==='POST'){const projectId=linkAdd[1];const type=values.type||values.linkType;const isPurchase=['purchase','PURCHASE_ORDER'].includes(type);const source=isPurchase?state.purchaseOrders:state.salesOrders;const sourceId=values.referenceId||values.purchaseOrderId||values.salesOrderId||values.linkId;const target=source.find((item)=>item.id===sourceId)||null;const key=isPurchase?'purchaseOrders':'salesOrders';const link=isPurchase?{id:`project-link-${Date.now()}`,purchaseOrderId:target?.id||sourceId,purchaseOrder:target}:{id:`project-link-${Date.now()}`,salesOrderId:target?.id||sourceId,salesOrder:target};state.projects=state.projects.map((project)=>project.id===projectId?{...project,[key]:[link,...(project[key]||[])]}:project);response={...baseResponse(),link};}
  const linkDelete=path.match(/^\/projects\/([^/]+)\/links\/(sales|purchase)\/([^/]+)$/);if(linkDelete&&method==='DELETE'){const[,projectId,type,linkId]=linkDelete;const key=type==='purchase'?'purchaseOrders':'salesOrders';state.projects=state.projects.map((project)=>project.id===projectId?{...project,[key]:(project[key]||[]).filter((item)=>item.id!==linkId)}:project);response={...baseResponse(),deleted:true};}
  const docAdd=path.match(/^\/projects\/([^/]+)\/documents\/upload$/);if(docAdd&&method==='POST'){const projectId=docAdd[1];const document={id:`project-document-${Date.now()}`,name:values.name||'documento-demo.pdf',fileUrl:'#demo-document',mimeType:'application/pdf',size:184320,createdAt:now(),uploadedBy:offlineDemoUser};state.projects=state.projects.map((project)=>project.id===projectId?{...project,documents:[document,...(project.documents||[])]}:project);response={...baseResponse(),document};}
  const docDelete=path.match(/^\/projects\/([^/]+)\/documents\/([^/]+)$/);if(docDelete&&method==='DELETE'){const[,projectId,documentId]=docDelete;state.projects=state.projects.map((project)=>project.id===projectId?{...project,documents:(project.documents||[]).filter((item)=>item.id!==documentId)}:project);response={...baseResponse(),deleted:true};}
  if(!response)return null;normalizeProjectsDemo(state);saveCriticalRouteState('/projects/dashboard',state);return response;
}

function handleCriticalOfflineMutation(path, method, body) {
  return handleCashFlowMutation(path,method,body)
    || handleBankMutation(path,method,body)
    || handlePosMutation(path,method,body)
    || handleProductionMutation(path,method,body)
    || handleProjectsMutation(path,method,body);
}

function mutationResult(path, body = {}) {
  const response = baseResponse();
  const id = `offline-${Date.now()}`;
  const values = body && typeof body === 'object' && !(typeof FormData !== 'undefined' && body instanceof FormData) ? body : {};
  if (/^\/projects(?:\/[^/]+)?$/.test(path)) response.project = {id,...body};
  if (/^\/customers(?:\/[^/]+)?$/.test(path)) response.customer = {id,...body};
  if (/^\/products(?:\/[^/]+)?$/.test(path)) response.product = {id,...body};
  if (/^\/business-parties(?:\/[^/]+)?$/.test(path)) response.party = {id,...body};
  if (/^\/billing\/change-plan$/.test(path)) response.subscription = {status:'ACTIVE',...body};
  if (path === '/ai/ask') {
    response.answer = 'MotorNorte opera con inventario de refacciones en tres almacenes. La prioridad actual es reabastecer suspensión, cobrar FAC-MN-10844 y recibir la orden OC-REF-2026-0384. Esta respuesta es simulada y usa únicamente los datos locales de la demo.';
    response.provider = 'BuzzBee Demo Local';
    response.sources = [{id:'inventory',name:'Inventario'},{id:'finance',name:'Finanzas'},{id:'procurement',name:'Compras'}];
  }
  if (path === '/intelligence/scan') Object.assign(response, {detected:3,resolved:0});
  if (/^\/intelligence\/insights\//.test(path)) response.insight = {id:path.split('/')[3],status:values.status||'ACKNOWLEDGED'};
  if (path === '/employee-documents/upload') response.file = {id, name:'documento-demo.pdf', url:'#demo-document', size:184320, mimeType:'application/pdf'};
  if (path === '/expenses') response.expense = {id, folio:'GAS-DEMO-0014', status:'DRAFT', currency:'MXN', ...values};
  if (path === '/fixed-assets') response.asset = {id, code:'ACT-DEMO-0015', status:'ACTIVE', bookValue:Number(values.acquisitionCost||0), ...values};
  if (/^\/accounts-payable\/[^/]+\/payments$/.test(path)) {
    const invoiceId = path.split('/')[2];
    const current = readFixture('/accounts-payable').invoices.find((item)=>item.id===invoiceId) || readFixture('/accounts-payable').invoices[0];
    const amount = Number(values.amount||0);
    response.invoice = {...current,paidAmount:Number(current?.paidAmount||0)+amount,balance:Math.max(0,Number(current?.balance||0)-amount),payments:[...(current?.payments||[]),{id,folio:'PAG-DEMO-0201',...values,amount}]};
  }
  if (/^\/accounts-receivable\/[^/]+\/payments$/.test(path)) {
    const invoiceId = path.split('/')[2];
    const current = readFixture('/accounts-receivable').invoices.find((item)=>item.id===invoiceId) || readFixture('/accounts-receivable').invoices[0];
    const amount = Number(values.amount||0);
    response.invoice = {...current,paidAmount:Number(current?.paidAmount||0)+amount,balance:Math.max(0,Number(current?.balance||0)-amount),payments:[...(current?.payments||[]),{id,folio:'COB-DEMO-0003',...values,amount}]};
  }
  if (path === '/business-parties/sync') Object.assign(response, {created:0,updated:9,merged:0});
  if (path === '/business-parties/merge') response.party = {...customers[0],id:'cu1',type:'CUSTOMER'};
  if (/^\/sales-enterprise\/prospects\/[^/]+\/convert$/.test(path)) response.customer = {id,...customers[0],...values};
  if (path === '/flow' || /^\/flow\/[^/]+\/test$/.test(path)) response.run = {id,status:'COMPLETED',startedAt:now(),finishedAt:now(),message:'Ejecución simulada sin servicios externos'};
  if (path === '/data-hub/preview') Object.assign(response, {
    requiresMapping:false,
    job:{id,folio:'IMP-DEMO-0069',fileName:'archivo-demo.xlsx',status:'READY',headers:['sku','nombre','marca','precio'],totalRows:24,summary:{created:8,updated:16,errors:0}},
    diffSummary:{creates:8,updates:16,unchanged:0,errors:0},
    preview:[{sku:'BAL-AGM-L42',nombre:'Batería AGM L42',marca:'LTH',precio:3290}],
  });
  if (/^\/data-hub\/jobs\/[^/]+\/commit$/.test(path)) response.job = {id:path.split('/')[3],status:'COMPLETED',summary:{created:8,updated:16,errors:0}};
  if (/^\/data-hub\/jobs\/[^/]+\/rollback$/.test(path)) response.rollback = {rolledBack:24,errors:0};
  if (path === '/integrations/api-keys') Object.assign(response, {secret:'bb_demo_local_123456789',warning:'Clave simulada; no autoriza servicios reales.'});
  if (path === '/integrations/webhooks' || /^\/integrations\/webhooks\/[^/]+\/rotate-secret$/.test(path)) Object.assign(response, {signingSecret:'whsec_demo_local_123456',warning:'Secreto simulado y local.'});
  if (/^\/integrations\/webhooks\/[^/]+\/test$/.test(path)) response.result = {statusCode:200,durationMs:42};
  if (path === '/integrations/queue/process') response.result = {processed:1,succeeded:1,failed:0};
  if (path === '/production/orders' || path === '/production/work-orders' || path === '/production') response.order = {id,folio:'KIT-DEMO-0043',status:'PLANNED',...values};
  if (path === '/marketing/campaigns' || path === '/marketing') response.campaign = {id,code:'MKT-DEMO-011',status:'DRAFT',...values};
  if (/^\/pos\/sessions/.test(path)) response.session = {id,status:'OPEN',openedAt:now(),...values};
  if (/^\/pos\/sales/.test(path)) response.sale = {id,folio:'POS-DEMO-06843',createdAt:now(),...values};
  return response;
}

export async function offlineDemoRequest(path, options = {}) {
  // Keep async behavior so loading states behave exactly like production without network I/O.
  await new Promise((resolve) => setTimeout(resolve, 60));
  const normalized = normalizePath(path);
  const method = String(options.method || 'GET').toUpperCase();
  // Industry endpoints share the same offline adapter as existing modules.
  if(normalized==='/industries/profiles'&&method==='GET')return {ok:true,profiles:clone(OFFLINE_INDUSTRY_PROFILES)};
  if(normalized==='/industries/company'&&method==='GET'){
    const stored=getPersisted()['/industries/company'];
    return {ok:true,activities:clone(stored?.activities||[{activityKey:'refaccionaria',isPrimary:true}])};
  }
  if(normalized==='/industries/company'&&method==='PUT'){
    const keys=[...new Set(options.body?.activities??options.data?.activities??[])];
    if(!keys.length||keys.some(key=>!OFFLINE_INDUSTRY_PROFILES.some(profile=>profile.slug===key)))throw new Error('Actividades inválidas');
    const activities=keys.map((activityKey,index)=>({activityKey,isPrimary:index===0}));
    const saved=getPersisted();saved['/industries/company']={activities};setPersisted(saved);
    return {ok:true,activities};
  }
  if(normalized==='/industries/recommend'&&method==='POST'){
    const keys=[...new Set(options.body?.activities??options.data?.activities??[])];
    if(!keys.length||keys.some(key=>!OFFLINE_INDUSTRY_PROFILES.some(profile=>profile.slug===key)))throw new Error('Actividades inválidas');
    const selected=keys.map(key=>OFFLINE_INDUSTRY_PROFILES.find(profile=>profile.slug===key));
    return {ok:true,recommendation:{activities:keys,required:[...new Set(selected.flatMap(profile=>profile.required))],optional:[...new Set(selected.flatMap(profile=>profile.optional||[]))],capabilities:[...new Set(selected.flatMap(profile=>profile.capabilities||[]))],suggestedModules:[...new Set(selected.flatMap(profile=>[...profile.required,...(profile.optional||[])]))],unavailableModules:[],state:'RECOMMENDATION_ONLY',activationRequiresApproval:true}};
  }
  if (method === 'GET') return readFixture(normalized);

  const criticalMutation = handleCriticalOfflineMutation(normalized, method, options.body ?? options.data ?? {});
  if (criticalMutation) return criticalMutation;

  const moduleToggleMatch = normalized.match(/^\/modules\/company\/([^/]+)$/);
  if (moduleToggleMatch && method === 'PUT') {
    const body = options.body ?? options.data ?? {};
    const dashboard = readFixture('/modules/dashboard');
    const moduleId = moduleToggleMatch[1];
    const enabled = Boolean(body.enabled);
    const module = (dashboard.modules || []).find((item) => item.id === moduleId);
    const companyModules = [...(dashboard.companyModules || [])];
    const index = companyModules.findIndex((item) => item.moduleId === moduleId);
    const nextRow = index >= 0
      ? {...companyModules[index], enabled}
      : {id:`cm-${module?.key || moduleId}`, moduleId, module:module || null, enabled};
    if (index >= 0) companyModules[index] = nextRow; else companyModules.push(nextRow);
    const modulesAvailable = (dashboard.modules || []).length;
    const modulesEnabled = companyModules.filter((item) => item.enabled).length;
    const next = {...dashboard, companyModules, summary:{...(dashboard.summary || {}), modulesAvailable, modulesEnabled, modulesDisabled:Math.max(0, modulesAvailable-modulesEnabled)}};
    const persisted = getPersisted();
    persisted['/modules/dashboard'] = next;
    setPersisted(persisted);
    return {...baseResponse(), companyModule:clone(nextRow)};
  }

  if (normalized === '/auth/profile' && (method === 'PATCH' || method === 'PUT')) {
    const body = options.body ?? options.data ?? {};
    offlineDemoUser.firstName = String(body.firstName || offlineDemoUser.firstName).trim() || offlineDemoUser.firstName;
    offlineDemoUser.lastName = String(body.lastName || offlineDemoUser.lastName).trim() || offlineDemoUser.lastName;
    offlineDemoUser.fullName = `${offlineDemoUser.firstName} ${offlineDemoUser.lastName}`.trim();
    const persisted = getPersisted();
    persisted['/auth/me'] = {user:clone(offlineDemoUser),sessionKind:'erp',offlineDemo:true};
    const activity = persisted['/activity/activity'] || {logs:[],filters:{entities:[],actions:[]}};
    activity.logs = [{id:`log-profile-${Date.now()}`,entity:'User',action:'PROFILE_UPDATE',description:'Actualizó su perfil personal',createdAt:now(),user:clone(offlineDemoUser)},...(activity.logs || [])];
    activity.filters = {entities:[...new Set([...(activity.filters?.entities || []),'User'])],actions:[...new Set([...(activity.filters?.actions || []),'PROFILE_UPDATE'])]};
    persisted['/activity/activity'] = activity;
    setPersisted(persisted);
    return {...baseResponse(), user:clone(offlineDemoUser)};
  }

  if (normalized === '/auth/preferences' && (method === 'PATCH' || method === 'PUT')) {
    const body = options.body ?? options.data ?? {};
    offlineDemoUser.preferences = {
      theme:['system','light','dark'].includes(body.theme) ? body.theme : 'system',
      density:['comfortable','compact'].includes(body.density) ? body.density : 'comfortable',
      reducedMotion:Boolean(body.reducedMotion),
      defaultLandingPage:['/','/agenda','/ventas','/compras','/inventario/existencias','/finanzas/flujo-efectivo','/pos'].includes(body.defaultLandingPage) ? body.defaultLandingPage : '/',
    };
    const persisted = getPersisted();
    persisted['/auth/me'] = {user:clone(offlineDemoUser),sessionKind:'erp',offlineDemo:true};
    const activity = persisted['/activity/activity'] || {logs:[],filters:{entities:[],actions:[]}};
    activity.logs = [{id:`log-preferences-${Date.now()}`,entity:'User',action:'PREFERENCES_UPDATE',description:'Actualizó sus preferencias personales',createdAt:now(),user:clone(offlineDemoUser)},...(activity.logs || [])];
    activity.filters = {entities:[...new Set([...(activity.filters?.entities || []),'User'])],actions:[...new Set([...(activity.filters?.actions || []),'PREFERENCES_UPDATE'])]};
    persisted['/activity/activity'] = activity;
    setPersisted(persisted);
    return {...baseResponse(), preferences:clone(offlineDemoUser.preferences), user:clone(offlineDemoUser)};
  }

  if (normalized === '/activity/notifications' && method === 'POST') {
    const body = options.body ?? options.data ?? {};
    const current = readFixture('/activity/notifications');
    const notification = {id:`offline-notification-${Date.now()}`,type:body.type || 'INFO',title:body.title || 'Notificación',message:body.message || '',link:body.link || null,userId:body.userId || null,read:false,createdAt:now()};
    const next = {notifications:[notification,...(current.notifications || [])]};
    const persisted = getPersisted(); persisted['/activity/notifications'] = next; setPersisted(persisted);
    return {...baseResponse(), notification};
  }

  if (normalized === '/activity/notifications/read-all' && method === 'PATCH') {
    const current = readFixture('/activity/notifications');
    const next = {notifications:(current.notifications || []).map((item)=>({...item,read:true}))};
    const persisted = getPersisted(); persisted['/activity/notifications'] = next; setPersisted(persisted);
    return {...baseResponse(), updated:next.notifications.length};
  }

  const notificationReadMatch = normalized.match(/^\/activity\/notifications\/([^/]+)\/read$/);
  if (notificationReadMatch && method === 'PATCH') {
    const current = readFixture('/activity/notifications');
    const next = {notifications:(current.notifications || []).map((item)=>item.id===notificationReadMatch[1]?{...item,read:true}:item)};
    const persisted = getPersisted(); persisted['/activity/notifications'] = next; setPersisted(persisted);
    return {...baseResponse(), notification:next.notifications.find((item)=>item.id===notificationReadMatch[1]) || null};
  }

  const notificationDeleteMatch = normalized.match(/^\/activity\/notifications\/([^/]+)$/);
  if (notificationDeleteMatch && method === 'DELETE') {
    const current = readFixture('/activity/notifications');
    const next = {notifications:(current.notifications || []).filter((item)=>item.id!==notificationDeleteMatch[1])};
    const persisted = getPersisted(); persisted['/activity/notifications'] = next; setPersisted(persisted);
    return {...baseResponse(), deleted:true};
  }

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
    const current = readFixture('/company');
    const next = {...current.company, ...(options.body || {}), branches:current.company?.branches || current.branches || []};
    const persisted = getPersisted();
    persisted['/company'] = {company:next,branches:next.branches};
    setPersisted(persisted);
    return {...baseResponse(), company:clone(next), branches:clone(next.branches)};
  }
  return result;
}

export function resetOfflineDemo() {
  try { localStorage.removeItem(OFFLINE_DEMO_STORE); } catch { /* noop */ }
}
