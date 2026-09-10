/**
 * BuzzBee v17.4.0 — contrato explícito de capacidades para Demo Offline.
 *
 * Regla: una sesión con offlineDemo=true jamás debe depender de red, API,
 * PostgreSQL, workers o servicios de terceros. Las funciones que conceptualmente
 * requieren infraestructura externa se simulan o se bloquean de forma explícita.
 */
export const OFFLINE_CAPABILITY_STATUS = Object.freeze({
  LOCAL: 'local',
  SIMULATED: 'simulated',
  BLOCKED: 'blocked',
});

export const OFFLINE_MODULES = Object.freeze({
  core: {label: 'Inicio y Agenda', status: 'local'},
  procurement: {label: 'Compras', status: 'local'},
  inventory: {label: 'Inventario y Almacenes', status: 'local'},
  finance: {label: 'Administración y Finanzas', status: 'local'},
  hr: {label: 'Recursos Humanos', status: 'local'},
  sales: {label: 'Ventas y Cobranza', status: 'local'},
  crm: {label: 'CRM, Marketing y Terceros', status: 'local'},
  projects: {label: 'Proyectos', status: 'local'},
  production: {label: 'Producción', status: 'local'},
  pos: {label: 'POS', status: 'local'},
  intelligence: {label: 'Intelligence', status: 'simulated'},
  operations: {label: 'Aprobaciones, Datos, Integraciones, Flow y Reportes', status: 'local'},
  settings: {label: 'Configuración', status: 'local'},
});

export const OFFLINE_FEATURES = Object.freeze({
  auth: {status: 'local', note: 'admin@erp.local se autentica en el navegador.'},
  erpRoutes: {status: 'local', note: 'Todas las rutas ERP pasan por offlineDemoRequest.'},
  companySettings: {status: 'local', persistence: 'localStorage'},
  localSession: {status: 'local', persistence: 'localStorage'},
  crudMutations: {status: 'simulated', note: 'POST/PUT/PATCH/DELETE no escriben en PostgreSQL.'},
  fileUploads: {status: 'simulated', note: 'FormData no sale del navegador; no existe almacenamiento remoto.'},
  smartImport: {status: 'simulated', note: 'Puede mostrar flujo/preview, sin importación real al servidor.'},
  artificialIntelligence: {status: 'simulated', note: 'Sin llamadas a proveedor de IA.'},
  fiscalStamping: {status: 'simulated', note: 'Sin timbrado real ni PAC.'},
  payments: {status: 'simulated', note: 'Sin cobros ni conciliaciones reales.'},
  billing: {status: 'simulated', note: 'Plan y facturación son datos demo.'},
  integrations: {status: 'simulated', note: 'Conectores, webhooks y API keys son demostrativos.'},
  email: {status: 'blocked', note: 'No se envían correos.'},
  whatsapp: {status: 'blocked', note: 'No se envían mensajes.'},
  webSockets: {status: 'blocked', note: 'No hay WebSocket/SSE en Demo Offline.'},
  backgroundWorkers: {status: 'blocked', note: 'No hay workers, jobs ni cron reales.'},
  postgres: {status: 'blocked', note: 'La Demo Offline no requiere base de datos.'},
  backendApi: {status: 'blocked', note: 'La sesión offline no puede realizar requests HTTP al API.'},
  platformAdmin: {status: 'blocked', note: 'Super Admin SaaS nunca está disponible para admin@erp.local.'},
});

export function isOfflineFeatureAvailable(feature) {
  return OFFLINE_FEATURES[feature]?.status !== OFFLINE_CAPABILITY_STATUS.BLOCKED;
}

export function getOfflineCapability(feature) {
  return OFFLINE_FEATURES[feature] ?? {status: OFFLINE_CAPABILITY_STATUS.BLOCKED, note: 'Capacidad no declarada.'};
}
