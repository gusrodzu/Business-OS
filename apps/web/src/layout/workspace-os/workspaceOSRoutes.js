// Presentation-only routing contract for Workspace OS. Authorization,
// licensed-module visibility and actual page components remain owned by
// React Router and the existing tenant-scoped module guards.
const modules = Object.freeze([
  {key:'sales',title:'Ventas',prefixes:['/ventas']},
  {key:'procurement',title:'Compras',prefixes:['/compras']},
  {key:'inventory',title:'Inventario',prefixes:['/inventario','/almacenes']},
  {key:'finance',title:'Finanzas',prefixes:['/finanzas','/gastos','/activos-fijos']},
  {key:'billing',title:'Facturación',prefixes:['/facturacion-fiscal']},
  {key:'hr',title:'Recursos Humanos',prefixes:['/recursos-humanos']},
  {key:'crm',title:'CRM',prefixes:['/crm','/terceros']},
  {key:'marketing',title:'Marketing',prefixes:['/marketing']},
  {key:'pos',title:'Punto de venta',prefixes:['/pos']},
  {key:'projects',title:'Proyectos',prefixes:['/proyectos']},
  {key:'production',title:'Producción',prefixes:['/produccion']},
  {key:'reports',title:'Reportes',prefixes:['/reportes','/inteligencia']},
  {key:'notifications',title:'Notificaciones',prefixes:['/notificaciones']},
  {key:'messages',title:'Mensajes',prefixes:['/mensajes']},
  {key:'directory',title:'Directorio',prefixes:['/directorio']},
  {key:'tasks',title:'Tareas',prefixes:['/tareas']},
  {key:'approvals',title:'Aprobaciones',prefixes:['/aprobaciones']},
  {key:'settings',title:'Configuración',prefixes:['/configuracion','/perfil','/preferencias','/ayuda']},
  {key:'administration',title:'Administración',prefixes:['/administracion']},
  {key:'operations',title:'Operaciones',prefixes:['/datos-maestros','/data-hub','/integration-hub','/flow']},
  {key:'agenda',title:'Agenda',prefixes:['/agenda']},
  {key:'demo',title:'Demo',prefixes:['/demo']},
].map(item=>Object.freeze({...item,prefixes:Object.freeze(item.prefixes)})));
const fallback = Object.freeze({key:'application',title:'Aplicación',prefixes:Object.freeze([])});

function matchesPath(pathname,prefix){
  return pathname===prefix || pathname.startsWith(prefix+'/');
}

export function getWorkspaceOSApp(pathname){
  if(typeof pathname!=='string'||!pathname.startsWith('/')||pathname==='/'||pathname.startsWith('//'))return null;
  const path=pathname.replace(/\/+$/,'')||'/';
  return modules.find(module=>module.prefixes.some(prefix=>matchesPath(path,prefix)))||fallback;
}
