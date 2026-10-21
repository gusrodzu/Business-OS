import coreModule from '../modules/core/index.js';
import procurementModule from '../modules/procurement/index.js';
import inventoryModule from '../modules/inventory/index.js';
import financeModule from '../modules/finance/index.js';
import hrModule from '../modules/hr/index.js';
import salesModule from '../modules/sales/index.js';
import crmModule from '../modules/crm/index.js';
import projectsModule from '../modules/projects/index.js';
import productionModule from '../modules/production/index.js';
import posModule from '../modules/pos/index.js';
import intelligenceModule from '../modules/intelligence/index.js';
import platformModule from '../modules/platform/index.js';
import operationsModule from '../modules/operations/index.js';
import industriesModule from '../modules/industries/index.js';

export const apiModules = [
  coreModule,
  procurementModule,
  inventoryModule,
  financeModule,
  hrModule,
  salesModule,
  crmModule,
  projectsModule,
  productionModule,
  posModule,
  intelligenceModule,
  platformModule,
  operationsModule,
  industriesModule,
];

export function registerApiModules(app) {
  const mountedPaths = new Set();
  for (const module of apiModules) {
    for (const route of module.routes ?? []) {
      if (mountedPaths.has(route.path)) {
        throw new Error(`[Modules] API route duplicada: ${route.path}`);
      }
      mountedPaths.add(route.path);
      app.use(route.path, route.router);
    }
  }
  return {modules: apiModules.length, routes: mountedPaths.size};
}
