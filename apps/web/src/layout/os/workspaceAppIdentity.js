/**
 * Workspace OS design identity contract.
 *
 * App-specific styles belong here, not in route pages or a second router.
 * All accents are used on light surfaces with dark text; never to recolor
 * semantic success/warning/error badges or operational data.
 */
const identities={
  sales:{label:'Ventas',navKey:'ventas',group:'Operaciones',accent:'#285de5',tint:'#eef4ff',accentInk:'#1745ba'},
  procurement:{label:'Compras',navKey:'compras',group:'Operaciones',accent:'#b76b18',tint:'#fff6e8',accentInk:'#88470d'},
  inventory:{label:'Inventario',navKey:'inventario',group:'Operaciones',accent:'#13867b',tint:'#e8f8f4',accentInk:'#086b61'},
  pos:{label:'Punto de venta',navKey:'pos',group:'Operaciones',accent:'#344357',tint:'#eff2f7',accentInk:'#273549'},
  crm:{label:'CRM',navKey:'crm',group:'Operaciones',accent:'#8c4bad',tint:'#f7effd',accentInk:'#74349c'},
  projects:{label:'Proyectos',navKey:'proyectos',group:'Operaciones',accent:'#8b5d32',tint:'#f8f3ed',accentInk:'#714520'},
  production:{label:'Producción',navKey:'produccion',group:'Operaciones',accent:'#b35434',tint:'#fff1eb',accentInk:'#8f3d22'},
  marketing:{label:'Marketing',navKey:'marketing',group:'Operaciones',accent:'#b03f81',tint:'#fdf0f7',accentInk:'#912e69'},
  finance:{label:'Finanzas',navKey:'finanzas',group:'Administración',accent:'#4c57aa',tint:'#f0f1ff',accentInk:'#374192'},
  billing:{label:'Facturación',navKey:'facturacion-fiscal',group:'Administración',accent:'#1575aa',tint:'#ecf8ff',accentInk:'#075c88'},
  hr:{label:'Recursos Humanos',navKey:'rrhh',group:'Administración',accent:'#9b4d71',tint:'#fff0f6',accentInk:'#7e3155'},
  reports:{label:'Reportes',navKey:'reportes',group:'Administración',accent:'#586c8c',tint:'#f1f5fa',accentInk:'#364f73'},
  settings:{label:'Configuración',navKey:null,group:'Sistema',accent:'#536172',tint:'#f3f5f8',accentInk:'#384656'},
  administration:{label:'Administración',navKey:null,group:'Sistema',accent:'#586384',tint:'#f0f3fa',accentInk:'#3c4d71'},
  operations:{label:'Operaciones',navKey:'aprobaciones',group:'Sistema',accent:'#6a6f38',tint:'#f7f8ee',accentInk:'#565d23'},
  agenda:{label:'Agenda',navKey:null,group:'Productividad',accent:'#247d9c',tint:'#edf9fc',accentInk:'#175e77'},
  demo:{label:'Demo',navKey:null,group:'Sistema',accent:'#66717c',tint:'#f3f5f7',accentInk:'#46515c'},
  application:{label:'Aplicación',navKey:null,group:'Workspace',accent:'#53647c',tint:'#f2f5fa',accentInk:'#374b69'},
};

export const OS_APP_IDENTITIES=Object.freeze(
  Object.fromEntries(Object.entries(identities).map(([key,value])=>[key,Object.freeze({key,...value})])),
);

export function getOSAppIdentity(key){
  return OS_APP_IDENTITIES[key]||OS_APP_IDENTITIES.application;
}

// The app launcher uses the existing navigation moduleKey, not the window key.
export function getOSAppIdentityForModule(moduleKey){
  return Object.values(OS_APP_IDENTITIES).find(item=>item.navKey===moduleKey)
    ||OS_APP_IDENTITIES.application;
}

/** Read only the current app's own existing module children (never a global
 * unlicensed catalogue); real route guards still authorize every destination.
 */
export function getOSAppSections(key,navigationGroups){
  const navKey=getOSAppIdentity(key).navKey;
  if(!navKey)return [];
  const module=navigationGroups.flatMap(group=>group.children||[])
    .find(item=>item.moduleKey===navKey);
  return (module?.children||[])
    .filter(child=>typeof child.to==='string'&&child.to.startsWith('/')&&!child.to.startsWith('//'))
    .map(({label,to})=>({label,to}));
}

function matchRoute(path,route){
  return path===route||path.startsWith(route+'/');
}
export function getActiveOSAppSection(pathname,sections){
  return [...sections].filter(section=>matchRoute(pathname,section.to))
    .sort((a,b)=>b.to.length-a.to.length)[0]||null;
}
