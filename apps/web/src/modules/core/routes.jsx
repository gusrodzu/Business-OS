import {lazy} from 'react';
const Dashboard=lazy(()=>import('./ui/pages/Dashboard'));
const Agenda=lazy(()=>import('./ui/pages/Agenda'));
const Notifications=lazy(()=>import('./ui/pages/Notifications'));
const SystemUtilityApp=lazy(()=>import('./ui/pages/SystemUtilityApp'));
const Messages=()=> <SystemUtilityApp kind="messages"/>;
const Directory=()=> <SystemUtilityApp kind="directory"/>;

export const coreRoutes = [
  {id: 'core:home', index: true, Component: Dashboard},
  {id: 'core:agenda', path: 'agenda', Component: Agenda},
  {id: 'core:notifications', path: 'notificaciones', Component: Notifications},
  {id: 'core:messages', path: 'mensajes', Component: Messages},
  {id: 'core:directory', path: 'directorio', Component: Directory},
];
