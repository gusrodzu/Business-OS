import platformAdminRouter from './api/platformAdmin.js';
import modulesRouter from './api/modules.js';
import billingRouter from './api/billing.js';
import integrationsRouter from './api/integrations.js';
import publicApiRouter from './api/publicApi.js';

export default {
  id: 'platform',
  routes: [
    {path: '/api/platform-admin', router: platformAdminRouter},
    {path: '/api/modules', router: modulesRouter},
    {path: '/api/billing', router: billingRouter},
    {path: '/api/integrations', router: integrationsRouter},
    {path: '/api/public/v1', router: publicApiRouter},
  ],
};
