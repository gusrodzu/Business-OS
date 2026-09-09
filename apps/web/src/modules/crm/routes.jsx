import {lazy} from 'react';
const Crm=lazy(()=>import('./ui/pages/Crm'));
const Marketing=lazy(()=>import('./ui/pages/Marketing'));
const BusinessParties=lazy(()=>import('./ui/pages/BusinessParties'));

export const crmRoutes = [
  {id: 'crm:crm', path: 'crm', Component: Crm},
  {id: 'crm:marketing', path: 'marketing', Component: Marketing},
  {id: 'crm:terceros', path: 'terceros', Component: BusinessParties},
];
