import {lazy} from 'react';
const Approvals=lazy(()=>import('./ui/pages/Approvals'));
const TaskCenter=lazy(()=>import('./ui/pages/TaskCenter'));
const MasterData=lazy(()=>import('./ui/pages/MasterData'));
const DataHub=lazy(()=>import('./ui/pages/DataHub'));
const IntegrationHub=lazy(()=>import('./ui/pages/IntegrationHub'));
const Flow=lazy(()=>import('./ui/pages/Flow'));
const Reports=lazy(()=>import('./ui/pages/Reports'));
const ExecutiveDemo=lazy(()=>import('./ui/pages/ExecutiveDemo'));
const DemoCompany=lazy(()=>import('./ui/pages/DemoCompany'));
const DemoCompanies=lazy(()=>import('./ui/pages/DemoCompanies'));
const DemoCompanyWorkspace=lazy(()=>import('./ui/pages/DemoCompanyWorkspace'));

export const operationsRoutes = [
  {id: 'operations:tareas', path: 'tareas', Component: TaskCenter},
  {id: 'operations:aprobaciones', path: 'aprobaciones', Component: Approvals},
  {id: 'operations:datos-maestros', path: 'datos-maestros', Component: MasterData},
  {id: 'operations:data-hub', path: 'data-hub', Component: DataHub},
  {id: 'operations:integration-hub', path: 'integration-hub', Component: IntegrationHub},
  {id: 'operations:flow', path: 'flow', Component: Flow},
  {id: 'operations:reportes', path: 'reportes', Component: Reports},
  {id: 'operations:reportes/demo', path: 'reportes/demo', Component: ExecutiveDemo},
  {id: 'operations:reportes/demo-company', path: 'reportes/demo-company', Component: DemoCompany},
  {id: 'operations:demo/empresas', path: 'demo/empresas', Component: DemoCompanies},
  {id: 'operations:demo/empresa', path: 'demo/empresas/:companyId', Component: DemoCompanyWorkspace},
];
