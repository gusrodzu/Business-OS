import humanResourcesRouter from './api/humanResources.js';
import hrOperationsRouter from './api/hrOperations.js';
import employeeDocumentsRouter from './api/employeeDocuments.js';
import payrollRouter from './api/payroll.js';
import hrClientRouter from './api/hrClient.js';

export default {
  id: 'hr',
  routes: [
    {path: '/api/human-resources', router: humanResourcesRouter},
    {path: '/api/hr-operations', router: hrOperationsRouter},
    {path: '/api/employee-documents', router: employeeDocumentsRouter},
    {path: '/api/payroll', router: payrollRouter},
    {path: '/api/hr-client', router: hrClientRouter},
  ],
};
