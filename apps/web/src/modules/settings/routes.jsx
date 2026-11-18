import {lazy} from 'react';
import {Navigate} from 'react-router-dom';
const ActivityCenter=lazy(()=>import('./ui/pages/ActivityCenter'));
const CompanySettings=lazy(()=>import('./ui/pages/CompanySettings'));
const UsersAccess=lazy(()=>import('./ui/pages/UsersAccess'));
const Modules=lazy(()=>import('./ui/pages/Modules'));
const Billing=lazy(()=>import('./ui/pages/Billing'));
const SettingsHome=lazy(()=>import('./ui/pages/SettingsHome'));
const Profile=lazy(()=>import('./ui/pages/Profile'));
const Preferences=lazy(()=>import('./ui/pages/Preferences'));
const ModulePlaceholder=lazy(()=>import('../shared/ui/ModulePlaceholder'));

export const settingsRoutes = [
  {id: 'settings:perfil', path: 'perfil', Component: () => <Navigate to="/configuracion/perfil" replace/>},
  {id: 'settings:configuracion/perfil', path: 'configuracion/perfil', Component: SettingsHome},
  {id: 'settings:preferencias', path: 'preferencias', Component: () => <Navigate to="/configuracion/preferencias" replace/>},
  {id: 'settings:configuracion/preferencias', path: 'configuracion/preferencias', Component: SettingsHome},
  {id: 'settings:configuracion', path: 'configuracion', Component: SettingsHome},
  {id: 'settings:configuracion/actividad', path: 'configuracion/actividad', Component: SettingsHome},
  {id: 'settings:configuracion/empresa', path: 'configuracion/empresa', Component: SettingsHome},
  {id: 'settings:configuracion/usuarios', path: 'configuracion/usuarios', Component: SettingsHome},
  {id: 'settings:configuracion/modulos', path: 'configuracion/modulos', Component: SettingsHome},
  {id: 'settings:configuracion/facturacion', path: 'configuracion/facturacion', Component: SettingsHome},
  {id: 'settings:configuracion/*', path: 'configuracion/*', Component: ModulePlaceholder},
  {id: 'settings:ayuda', path: 'ayuda', Component: ModulePlaceholder},
];
