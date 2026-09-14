import {lazy} from 'react';
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
  {id: 'settings:perfil', path: 'perfil', Component: Profile},
  {id: 'settings:preferencias', path: 'preferencias', Component: Preferences},
  {id: 'settings:configuracion', path: 'configuracion', Component: SettingsHome},
  {id: 'settings:configuracion/actividad', path: 'configuracion/actividad', Component: ActivityCenter},
  {id: 'settings:configuracion/empresa', path: 'configuracion/empresa', Component: CompanySettings},
  {id: 'settings:configuracion/usuarios', path: 'configuracion/usuarios', Component: UsersAccess},
  {id: 'settings:configuracion/modulos', path: 'configuracion/modulos', Component: Modules},
  {id: 'settings:configuracion/facturacion', path: 'configuracion/facturacion', Component: Billing},
  {id: 'settings:configuracion/*', path: 'configuracion/*', Component: ModulePlaceholder},
  {id: 'settings:ayuda', path: 'ayuda', Component: ModulePlaceholder},
];
