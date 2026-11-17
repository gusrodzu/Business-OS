/**
 * Portafolio visual de la Demo Local. Ningún registro es un tenant real:
 * el ERP operativo sigue usando MotorNorte y sus propias credenciales.
 * Las cifras de este catálogo son FICTICIAS y se usan sólo para previsualizar.
 */
export const DEMO_PORTFOLIO_STORAGE_KEY = 'buzzbee.offline-company-portfolio.v1';

export const DEMO_INDUSTRIES = {
  refaccionaria: {
    label: 'Refaccionaria', description: 'Ventas de mostrador, existencias y reposición.',
    modules: ['pos', 'inventario', 'compras', 'ventas', 'crm', 'finanzas'],
    metrics: [
      {id: 'ventas', label: 'Ventas del día', value: '$48,250', hint: 'Mostrador y mayoreo'},
      {id: 'tickets', label: 'Tickets', value: '72', hint: 'Operaciones de ejemplo'},
      {id: 'stock', label: 'Refacciones por reponer', value: '14', hint: 'Bajo inventario mínimo'},
      {id: 'pedidos', label: 'Pedidos abiertos', value: '9', hint: 'En preparación'},
      {id: 'proveedores', label: 'Proveedores activos', value: '23', hint: 'Catálogo de muestra'},
    ],
  },
  restaurante: {
    label: 'Restaurante', description: 'Mesas, comandas, insumos y ventas.',
    modules: ['pos', 'inventario', 'compras', 'crm', 'rrhh', 'finanzas'],
    metrics: [
      {id: 'mesas', label: 'Mesas ocupadas', value: '18/28', hint: 'Servicio de ejemplo'},
      {id: 'comandas', label: 'Comandas activas', value: '12', hint: 'Cocina'},
      {id: 'ventas', label: 'Ventas del día', value: '$26,480', hint: 'Consumo ilustrativo'},
      {id: 'ticket', label: 'Ticket promedio', value: '$385', hint: 'Consumo por cuenta'},
      {id: 'insumos', label: 'Insumos críticos', value: '5', hint: 'Por reabastecer'},
    ],
  },
  clinica: {
    label: 'Clínica', description: 'Citas, ocupación, cobros y seguimiento de servicios.',
    modules: ['crm', 'agenda', 'finanzas', 'inventario', 'rrhh'],
    metrics: [
      {id: 'citas', label: 'Citas de hoy', value: '34', hint: 'Agenda de ejemplo'},
      {id: 'consultas', label: 'Consultas completadas', value: '21', hint: 'Atenciones ilustrativas'},
      {id: 'ocupacion', label: 'Consultorios en uso', value: '6/8', hint: 'Disponibilidad de ejemplo'},
      {id: 'cobros', label: 'Cobros pendientes', value: '8', hint: 'Seguimiento administrativo'},
      {id: 'inventario', label: 'Insumos por reponer', value: '4', hint: 'Existencias ilustrativas'},
    ],
  },
  taller: {
    label: 'Taller automotriz', description: 'Órdenes de servicio, técnicos y refacciones.',
    modules: ['ventas', 'inventario', 'compras', 'crm', 'agenda', 'finanzas'],
    metrics: [
      {id: 'ordenes', label: 'Órdenes abiertas', value: '17', hint: 'Servicios de ejemplo'},
      {id: 'entregas', label: 'Entregas de hoy', value: '6', hint: 'Vehículos programados'},
      {id: 'tecnicos', label: 'Técnicos ocupados', value: '7/9', hint: 'Capacidad del equipo'},
      {id: 'refacciones', label: 'Refacciones pendientes', value: '11', hint: 'Solicitudes ilustrativas'},
      {id: 'facturacion', label: 'Facturación mensual', value: '$312,000', hint: 'Importe de muestra'},
    ],
  },
  constructora: {
    label: 'Constructora', description: 'Obras, presupuestos, avances y suministros.',
    modules: ['proyectos', 'compras', 'finanzas', 'rrhh', 'inventario'],
    metrics: [
      {id: 'obras', label: 'Obras activas', value: '7', hint: 'Portafolio ilustrativo'},
      {id: 'avance', label: 'Avance promedio', value: '64%', hint: 'Estimación ficticia'},
      {id: 'compras', label: 'Compras por aprobar', value: '12', hint: 'Requerimientos'},
      {id: 'presupuesto', label: 'Presupuesto ejecutado', value: '58%', hint: 'Consumo ilustrativo'},
      {id: 'equipo', label: 'Colaboradores en obra', value: '48', hint: 'Personal de muestra'},
    ],
  },
  ecommerce: {
    label: 'E-commerce', description: 'Órdenes, conversión, entregas y devoluciones.',
    modules: ['ventas', 'inventario', 'crm', 'marketing', 'compras', 'finanzas'],
    metrics: [
      {id: 'pedidos', label: 'Pedidos de hoy', value: '128', hint: 'Transacciones ficticias'},
      {id: 'conversion', label: 'Conversión', value: '3.2%', hint: 'Indicador ilustrativo'},
      {id: 'ticket', label: 'Ticket promedio', value: '$890', hint: 'Carrito ilustrativo'},
      {id: 'entregas', label: 'Envíos pendientes', value: '29', hint: 'Logística ficticia'},
      {id: 'devoluciones', label: 'Devoluciones abiertas', value: '4', hint: 'Casos de ejemplo'},
    ],
  },
  manufactura: {
    label: 'Manufactura', description: 'Órdenes de producción, calidad e insumos.',
    modules: ['produccion', 'inventario', 'compras', 'ventas', 'rrhh', 'finanzas'],
    metrics: [
      {id: 'produccion', label: 'Órdenes en proceso', value: '24', hint: 'Plan de ejemplo'},
      {id: 'cumplimiento', label: 'Cumplimiento del plan', value: '93%', hint: 'Resultado ilustrativo'},
      {id: 'insumos', label: 'Insumos críticos', value: '6', hint: 'Reposición ficticia'},
      {id: 'calidad', label: 'Calidad a la primera', value: '98%', hint: 'Muestra ficticia'},
      {id: 'turnos', label: 'Turnos activos', value: '3', hint: 'Programación ilustrativa'},
    ],
  },
  escuela: {
    label: 'Escuela', description: 'Alumnos, inscripciones, asistencia y cobranza.',
    modules: ['crm', 'finanzas', 'rrhh', 'agenda', 'proyectos'],
    metrics: [
      {id: 'alumnos', label: 'Alumnos inscritos', value: '840', hint: 'Matrícula ficticia'},
      {id: 'asistencia', label: 'Asistencia hoy', value: '96%', hint: 'Registro de ejemplo'},
      {id: 'inscripciones', label: 'Inscripciones pendientes', value: '38', hint: 'Solicitudes ilustrativas'},
      {id: 'colegiaturas', label: 'Pagos por conciliar', value: '25', hint: 'Finanzas de muestra'},
      {id: 'profesores', label: 'Docentes activos', value: '42', hint: 'Plantilla ilustrativa'},
    ],
  },
  hotel: {
    label: 'Hotel', description: 'Habitaciones, reservaciones y operación.',
    modules: ['ventas', 'crm', 'finanzas', 'agenda', 'rrhh', 'inventario'],
    metrics: [
      {id: 'ocupacion', label: 'Ocupación', value: '78%', hint: 'Habitaciones de muestra'},
      {id: 'entradas', label: 'Llegadas de hoy', value: '18', hint: 'Check-ins ilustrativos'},
      {id: 'salidas', label: 'Salidas de hoy', value: '15', hint: 'Check-outs de ejemplo'},
      {id: 'tarifa', label: 'Tarifa promedio', value: '$1,460', hint: 'Precio ilustrativo'},
      {id: 'limpieza', label: 'Habitaciones pendientes', value: '9', hint: 'Operación ficticia'},
    ],
  },
};

export const DEMO_MODULE_LABELS = {
  agenda:'Agenda', compras:'Compras', crm:'CRM', finanzas:'Finanzas', inventario:'Inventario',
  marketing:'Marketing', pos:'Punto de venta', produccion:'Producción', proyectos:'Proyectos',
  rrhh:'Recursos humanos', ventas:'Ventas',
};

const EXAMPLES = [
  ['ejemplo-refacciones', 'MotorNorte Refacciones', 'refaccionaria'],
  ['ejemplo-restaurante', 'Restaurante de ejemplo', 'restaurante'],
  ['ejemplo-clinica', 'Clínica de ejemplo', 'clinica'],
  ['ejemplo-constructora', 'Constructora de ejemplo', 'constructora'],
  ['ejemplo-taller', 'Taller de ejemplo', 'taller'],
];

const templateSelection = (industry) => ({
  metricIds: DEMO_INDUSTRIES[industry].metrics.slice(0, 4).map((metric) => metric.id),
  modules: DEMO_INDUSTRIES[industry].modules.slice(0, 4),
});

export const DEMO_PORTFOLIO_EXAMPLES = EXAMPLES.map(([id,name,industry]) => ({
  id, name, industry, note:'Plantilla ilustrativa para presentar el sistema',
  stage:'sample', source:'example', ...templateSelection(industry),
}));

export function normalizeDemoCompany(record) {
  if (!record || typeof record !== 'object' || !Object.hasOwn(DEMO_INDUSTRIES,record.industry)) return null;
  const name=typeof record.name === 'string' ? record.name.trim().slice(0,80) : '';
  const id=typeof record.id === 'string' ? record.id.slice(0,80) : '';
  if (!name || !/^[-a-z0-9]+$/.test(id)) return null;
  const industry=record.industry;
  const defaults=templateSelection(industry);
  const validMetrics=DEMO_INDUSTRIES[industry].metrics.map((metric)=>metric.id);
  const validModules=DEMO_INDUSTRIES[industry].modules;
  const metricIds=Array.isArray(record.metricIds) ? [...new Set(record.metricIds.filter(id=>validMetrics.includes(id)))] : defaults.metricIds;
  const modules=Array.isArray(record.modules) ? [...new Set(record.modules.filter(id=>validModules.includes(id)))] : defaults.modules;
  return {
    id,name,industry,
    note:typeof record.note === 'string' ? record.note.trim().slice(0,160) : '',
    stage:record.stage==='configured'?'configured':record.stage==='sample'?'sample':'planning',
    source:record.source==='example' && id.startsWith('ejemplo-')?'example':'local',
    metricIds,modules,
  };
}

export function readDemoCompanies(storage) {
  try {
    const target=storage ?? globalThis.localStorage;
    const stored=target?.getItem(DEMO_PORTFOLIO_STORAGE_KEY);
    if (!stored) return DEMO_PORTFOLIO_EXAMPLES.map((company)=>({...company,metricIds:[...company.metricIds],modules:[...company.modules]}));
    const parsed=JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error('Datos de demo inválidos');
    const ids=new Set();
    const companies=parsed.slice(0,50).map(normalizeDemoCompany).filter((company)=>{
      if (!company || ids.has(company.id)) return false;
      ids.add(company.id);
      return true;
    });
    return companies.length ? companies : DEMO_PORTFOLIO_EXAMPLES.map((company)=>({...company}));
  } catch {
    return DEMO_PORTFOLIO_EXAMPLES.map((company)=>({...company}));
  }
}

export function writeDemoCompanies(companies,storage) {
  try {
    const target=storage ?? globalThis.localStorage;
    if (!Array.isArray(companies) || companies.length > 50) return false;
    const cleaned=companies.map(normalizeDemoCompany);
    if (cleaned.some(company=>!company) || new Set(cleaned.map(company=>company.id)).size !== cleaned.length) return false;
    target?.setItem(DEMO_PORTFOLIO_STORAGE_KEY,JSON.stringify(cleaned));
    return Boolean(target);
  } catch {
    return false;
  }
}

export function createDemoCompany({name,industry,note=''}) {
  if (!Object.hasOwn(DEMO_INDUSTRIES,industry)) return null;
  const cleanedName=String(name||'').trim().slice(0,80);
  if (!cleanedName) return null;
  return normalizeDemoCompany({
    id:'local-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9),
    name:cleanedName,industry,note,stage:'planning',source:'local',...templateSelection(industry),
  });
}
