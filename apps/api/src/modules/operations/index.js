import reportsRouter from './api/reports.js';
import approvalsRouter from './api/approvals.js';
import masterDataRouter from './api/masterData.js';
import flowRouter from './api/flow.js';
import administrativeCenterRouter from './api/administrativeCenter.js';
import operationsRouter from './api/operations.js';
import dataHubRouter from './api/dataHub.js';

export default {
  id: 'operations',
  routes: [
    {path: '/api/reports', router: reportsRouter},
    {path: '/api/approvals', router: approvalsRouter},
    {path: '/api/master-data', router: masterDataRouter},
    {path: '/api/flow', router: flowRouter},
    {path: '/api/administration', router: administrativeCenterRouter},
    {path: '/api/operations', router: operationsRouter},
    {path: '/api/data-hub', router: dataHubRouter},
  ],
};
