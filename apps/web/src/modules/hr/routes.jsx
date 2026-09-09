import {lazy} from 'react';
const HumanResources=lazy(()=>import('./ui/pages/HumanResources'));
const HrOperations=lazy(()=>import('./ui/pages/HrOperations'));
const EmployeeDocuments=lazy(()=>import('./ui/pages/EmployeeDocuments'));
const Payroll=lazy(()=>import('./ui/pages/Payroll'));

export const hrRoutes = [
  {id: 'hr:recursos-humanos', path: 'recursos-humanos', Component: HumanResources},
  {id: 'hr:recursos-humanos/operacion', path: 'recursos-humanos/operacion', Component: HrOperations},
  {id: 'hr:recursos-humanos/expedientes', path: 'recursos-humanos/expedientes', Component: EmployeeDocuments},
  {id: 'hr:recursos-humanos/prenomina', path: 'recursos-humanos/prenomina', Component: Payroll},
];
