import {Boxes, CalendarDays, CircleHelp, ClipboardList, FileText, Layers3, Settings, Users} from 'lucide-react';
import {adminNavigation, navigationGroups} from '../../data/navigation';

// OS window presentation uses the existing navigation metadata. Routing,
// authorization and tenant entitlements continue to belong to React Router
// and the current module guards; this is never an alternate route registry.
const applications = navigationGroups
  .flatMap((group) => group.children)
  .filter((item) => item.moduleKey !== 'inicio');

const systemApplications = [
  ...adminNavigation,
  {label: 'Agenda', to: '/agenda', icon: CalendarDays},
  {label: 'Ayuda', to: '/ayuda', icon: CircleHelp},
  {label: 'Mi perfil', to: '/perfil', icon: Users},
  {label: 'Preferencias', to: '/preferencias', icon: Settings},
  {label: 'Empresas de demo', to: '/demo/empresas', icon: Layers3},
  {label: 'Centro de tareas', to: '/aprobaciones', icon: ClipboardList},
];

// These routes either begin before their first tab or are aliases for existing
// navigation groups. Their icons and labels still come from the same source.
const rootAliases = [
  {prefix: '/compras', moduleKey: 'compras'},
  {prefix: '/inventario', moduleKey: 'inventario'},
  {prefix: '/ventas', moduleKey: 'ventas'},
  {prefix: '/finanzas', moduleKey: 'finanzas'},
  {prefix: '/recursos-humanos', moduleKey: 'rrhh'},
  {prefix: '/reportes', moduleKey: 'reportes'},
  {prefix: '/crm', moduleKey: 'crm'},
];

function matches(path, to) {
  return Boolean(to) && (path === to || path.startsWith(to + '/'));
}
function labelFromPath(path) {
  const segment = path.split('/').filter(Boolean)[0] || 'aplicacion';
  const names = {
    marketing: 'Marketing', pos: 'Punto de venta', produccion: 'Producción',
    proyectos: 'Proyectos', administracion: 'Centro administrativo',
    'facturacion-fiscal': 'Facturación', configuracion: 'Configuración',
    inteligencia: 'Inteligencia', flow: 'Automatizaciones',
    'data-hub': 'Importar datos', 'datos-maestros': 'Datos maestros',
    'integration-hub': 'Integraciones', terceros: 'Clientes',
    almacenes: 'Inventario', gastos: 'Finanzas',
    'activos-fijos': 'Finanzas', tareas: 'Centro de tareas',
  };
  return names[segment] || segment.replaceAll('-', ' ').replace(/^./, c => c.toUpperCase());
}

export function resolveOSApplication(pathname) {
  if (!pathname || pathname === '/') return null;
  const path = pathname.replace(/\/+$/, '') || '/';
  // Choose the most specific matching route first, retaining the parent module
  // title and icon while showing the selected tab as the secondary window title.
  const candidates = [...applications, ...systemApplications].flatMap((app) => {
    const entries = app.children?.length ? app.children : [{to: app.to, label: app.label}];
    return entries.filter((entry) => matches(path, entry.to))
      .map((entry) => ({app, entry, specificity: entry.to.length}));
  }).sort((a, b) => b.specificity - a.specificity);
  const selected = candidates[0];
  if (selected) {
    return {
      key: selected.app.moduleKey || selected.app.to || path.split('/')[1],
      title: selected.app.label,
      subtitle: selected.entry.label === selected.app.label ? '' : selected.entry.label,
      Icon: selected.app.icon || Boxes,
    };
  }
  const aliased = rootAliases.find(({prefix}) => matches(path, prefix));
  const app = aliased && applications.find((item) => item.moduleKey === aliased.moduleKey);
  if (app) return {key: app.moduleKey, title: app.label, subtitle: '', Icon: app.icon || Boxes};
  return {key: path.split('/')[1], title: labelFromPath(path), subtitle: '', Icon: FileText};
}
