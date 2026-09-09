import {Navigate} from 'react-router-dom';
import {coreRoutes} from './core/routes';
import {procurementRoutes} from './procurement/routes';
import {inventoryRoutes} from './inventory/routes';
import {financeRoutes} from './finance/routes';
import {hrRoutes} from './hr/routes';
import {salesRoutes} from './sales/routes';
import {crmRoutes} from './crm/routes';
import {projectsRoutes} from './projects/routes';
import {productionRoutes} from './production/routes';
import {posRoutes} from './pos/routes';
import {intelligenceRoutes} from './intelligence/routes';
import {operationsRoutes} from './operations/routes';
import {settingsRoutes} from './settings/routes';

const redirects = [
  {id: 'redirect:rrhh', path: 'rrhh', element: <Navigate to="/recursos-humanos" replace />},
  {id: 'redirect:finanzas', path: 'finanzas', element: <Navigate to="/finanzas/cuentas-por-pagar" replace />},
  {id: 'redirect:admin-ap', path: 'administracion/cuentas-por-pagar', element: <Navigate to="/finanzas/cuentas-por-pagar" replace />},
  {id: 'redirect:admin-ar', path: 'administracion/cuentas-por-cobrar', element: <Navigate to="/finanzas/cuentas-por-cobrar" replace />},
  {id: 'redirect:admin-treasury', path: 'administracion/tesoreria', element: <Navigate to="/finanzas/tesoreria" replace />},
  {id: 'redirect:admin-budgets', path: 'administracion/presupuestos', element: <Navigate to="/finanzas/presupuestos" replace />},
  {id: 'redirect:finance-customers', path: 'finanzas/clientes', element: <Navigate to="/terceros" replace />},
];

export const erpModuleRoutes = [
  ...coreRoutes,
  ...procurementRoutes,
  ...inventoryRoutes,
  ...financeRoutes,
  ...hrRoutes,
  ...salesRoutes,
  ...crmRoutes,
  ...projectsRoutes,
  ...productionRoutes,
  ...posRoutes,
  ...intelligenceRoutes,
  ...operationsRoutes,
  ...settingsRoutes,
  ...redirects,
];

export function assertUniqueModuleRoutes(routes = erpModuleRoutes) {
  const keys = new Set();
  for (const route of routes) {
    const key = route.index ? '__index__' : route.path;
    if (keys.has(key)) throw new Error(`[Modules] Ruta web duplicada: ${key}`);
    keys.add(key);
  }
  return true;
}
