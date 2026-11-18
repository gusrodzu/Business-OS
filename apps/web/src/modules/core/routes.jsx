import {lazy} from 'react';
const Dashboard=lazy(()=>import('./ui/pages/Dashboard'));
const Agenda=lazy(()=>import('./ui/pages/Agenda'));
const SystemUtilityApp=lazy(()=>import('./ui/pages/SystemUtilityApp'));
const Messages=()=> <SystemUtilityApp kind="messages"/>;
const Directory=()=> <SystemUtilityApp kind="directory"/>;

export const coreRoutes = [
  {id: 'core:home', index: true, Component: Dashboard},
  {id: 'core:agenda', path: 'agenda', Component: Agenda},
  {id: 'core:messages', path: 'mensajes', Component: Messages},
  {id: 'core:directory', path: 'directorio', Component: Directory},
];
