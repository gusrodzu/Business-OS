import {lazy} from 'react';
const Production=lazy(()=>import('./ui/pages/Production'));

export const productionRoutes = [
  {id: 'production:produccion', path: 'produccion', Component: Production},
];
