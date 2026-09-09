import {lazy} from 'react';
const Dashboard=lazy(()=>import('./ui/pages/Dashboard'));
const Agenda=lazy(()=>import('./ui/pages/Agenda'));

export const coreRoutes = [
  {id: 'core:home', index: true, Component: Dashboard},
  {id: 'core:agenda', path: 'agenda', Component: Agenda},
];
