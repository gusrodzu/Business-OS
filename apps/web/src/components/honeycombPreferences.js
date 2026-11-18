// UI-only dashboard preferences. No new data request or server permission is
// introduced: every available metric comes from the existing /dashboard API.
export const DEFAULT_METRICS = Object.freeze([
  'pendingRequests','ordersThisMonth','inventoryValue','criticalStock',
]);

export const METRIC_CATALOG = Object.freeze([
  {id:'pendingRequests',label:'Solicitudes pendientes',description:'Solicitudes por atender',group:'Compras'},
  {id:'ordersThisMonth',label:'Órdenes del mes',description:'Órdenes de compra del mes',group:'Compras'},
  {id:'inventoryValue',label:'Valor de inventario',description:'Valor actual del inventario',group:'Inventario'},
  {id:'criticalStock',label:'Stock crítico',description:'Productos debajo del mínimo',group:'Inventario'},
  {id:'annualPurchases',label:'Compras del año',description:'Total de compras mensuales disponibles',group:'Compras'},
  {id:'recentRequests',label:'Solicitudes recientes',description:'Movimientos recientes registrados',group:'Compras'},
  {id:'activeUsers',label:'Usuarios activos',description:'Usuarios activos en la operación',group:'Actividad'},
  {id:'pendingAgenda',label:'Próximos vencimientos',description:'Eventos de la agenda financiera',group:'Finanzas'},
  {id:'notifications',label:'Avisos operativos',description:'Alertas y avisos de la empresa',group:'Actividad'},
  {id:'inventoryCategories',label:'Categorías inventariadas',description:'Categorías con datos de inventario',group:'Inventario'},
]);

const AVAILABLE = new Set(METRIC_CATALOG.map(item => item.id));
const WIDGETS = new Set(['requests','purchaseChart','quickActions','stock','calendar','team','spend']);
const OLD_KEY = 'erp-dashboard-preferences';
const PREFIX = 'erp-dashboard-preferences:v3';

export const defaultDashboardPreferences = () => ({
  compact:false,
  hiddenWidgets:[],
  selectedMetrics:[...DEFAULT_METRICS],
});

export function normalizeDashboardPreferences(raw) {
  const defaults = defaultDashboardPreferences();
  if(!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaults;
  return {
    compact:raw.compact === true,
    hiddenWidgets:Array.isArray(raw.hiddenWidgets)
      ? [...new Set(raw.hiddenWidgets.filter(id => WIDGETS.has(id)))]
      : [],
    selectedMetrics:Array.isArray(raw.selectedMetrics)
      ? [...new Set(raw.selectedMetrics.filter(id => AVAILABLE.has(id)))].slice(0,METRIC_CATALOG.length)
      : [...DEFAULT_METRICS],
  };
}

export function dashboardPreferencesKey(user, offlineDemo = false) {
  const company = user?.companyId ?? user?.tenantId ?? user?.company?.id ?? 'company';
  const person = user?.id ?? user?.email ?? 'anonymous';
  return [PREFIX,offlineDemo ? 'offline' : 'online',
    encodeURIComponent(String(company)),
    encodeURIComponent(String(person))].join(':');
}

export function readDashboardPreferences(key, store = typeof localStorage !== 'undefined' ? localStorage : null) {
  try {
    const scoped = store?.getItem(key);
    if (scoped) return normalizeDashboardPreferences(JSON.parse(scoped));
    // Migrate old global preferences only once for the first active account.
    // A second account must never inherit another user's dashboard layout.
    const migrationKey = PREFIX + ':legacy-migrated';
    if(!store?.getItem(migrationKey)){
      const legacy = store?.getItem(OLD_KEY);
      store?.setItem(migrationKey,key);
      if(legacy) return normalizeDashboardPreferences(JSON.parse(legacy));
    }
    return defaultDashboardPreferences();
  } catch {
    return defaultDashboardPreferences();
  }
}

export function writeDashboardPreferences(key, preferences, store = typeof localStorage !== 'undefined' ? localStorage : null) {
  try {
    store?.setItem(key,JSON.stringify(normalizeDashboardPreferences(preferences)));
    return true;
  } catch {
    // Storage may be blocked/private or full. Keep dashboard functional.
    return false;
  }
}

export function reorderDashboardMetric(items, id, direction) {
  const original = Array.isArray(items) ? [...items] : [...DEFAULT_METRICS];
  const index = original.indexOf(id);
  const target = index + direction;
  if(index < 0 || target < 0 || target >= original.length) return original;
  [original[index],original[target]] = [original[target],original[index]];
  return original;
}
