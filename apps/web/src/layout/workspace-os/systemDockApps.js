// Stable, tenant-agnostic shortcuts for the seven executive utilities.
// Visibility of a launcher never replaces the existing route/API permissions.
export const SYSTEM_DOCK_APPS = Object.freeze([
  {key:'agenda',label:'Calendario',to:'/agenda'},
  {key:'tasks',label:'Tareas',to:'/tareas'},
  {key:'messages',label:'Mensajes',to:'/mensajes'},
  {key:'approvals',label:'Aprobaciones',to:'/aprobaciones'},
  {key:'notifications',label:'Notificaciones',to:'/configuracion/actividad'},
  {key:'directory',label:'Directorio',to:'/directorio'},
  {key:'settings',label:'Administración',to:'/configuracion'},
].map(item=>Object.freeze(item)));

export const SYSTEM_DOCK_KEYS = new Set(SYSTEM_DOCK_APPS.map(item=>item.key));
