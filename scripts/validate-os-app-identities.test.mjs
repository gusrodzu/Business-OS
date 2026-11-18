import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {getOSAppIdentity,getOSAppIdentityForModule,getOSAppSections,getActiveOSAppSection,OS_APP_IDENTITIES}
  from '../apps/web/src/layout/os/workspaceAppIdentity.js';
import {getWorkspaceOSApp} from '../apps/web/src/layout/workspace-os/workspaceOSRoutes.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('All application families have a distinct, scoped visual identity',()=>{
  const routes=[
    '/ventas','/compras/solicitudes','/inventario/existencias','/pos','/crm',
    '/proyectos','/produccion','/marketing','/finanzas/cuentas-por-pagar',
    '/facturacion-fiscal','/recursos-humanos','/reportes','/configuracion',
    '/administracion','/tareas','/agenda','/demo/empresas',
    '/mensajes','/directorio','/aprobaciones','/configuracion/actividad'
  ];
  const keys=routes.map(path=>getWorkspaceOSApp(path)?.key);
  assert.equal(new Set(keys).size,routes.length);
  const colors=new Set();
  for(const key of keys){
    const identity=getOSAppIdentity(key);
    assert.equal(identity.key,key);
    assert.ok(identity.label&&identity.group);
    assert.match(identity.accent,/^#[0-9a-f]{6}$/i);
    assert.match(identity.accentInk,/^#[0-9a-f]{6}$/i);
    assert.match(identity.tint,/^#[0-9a-f]{6}$/i);
    colors.add(identity.accent);
    assert.ok(identity.tint!==identity.accent,'Tint must preserve dark text contrast');
  }
  assert.equal(colors.size,keys.length,'App visual identity accents should be distinct');
  assert.equal(Object.keys(OS_APP_IDENTITIES).length,23);
  assert.equal(getOSAppIdentityForModule('ventas').key,'sales');
  assert.equal(getOSAppIdentityForModule('compras').key,'procurement');
  assert.equal(getOSAppIdentityForModule('inventario').key,'inventory');
  assert.equal(getOSAppIdentityForModule('finanzas').key,'finance');
});

const navigationGroups=[
  {label:'Operaciones',children:[
    {moduleKey:'compras',label:'Compras',children:[
      {label:'Resumen',to:'/compras'},
      {label:'Solicitudes',to:'/compras/solicitudes'},
      {label:'Órdenes de compra',to:'/compras/ordenes'},
      {label:'Proveedores',to:'/compras/proveedores'},
    ]},
    {moduleKey:'inventario',label:'Inventario',children:[
      {label:'Productos',to:'/inventario/productos'},
      {label:'Almacenes',to:'/almacenes'},
    ]},
    {moduleKey:'pos',label:'Punto de venta',to:'/pos'}
  ]}
];

test('An OS app gets sections only from its own existing navigation children',()=>{
  const purchases=getOSAppSections('procurement',navigationGroups);
  assert.deepEqual(purchases.map(x=>x.to),[
    '/compras','/compras/solicitudes','/compras/ordenes','/compras/proveedores'
  ]);
  assert.deepEqual(getOSAppSections('inventory',navigationGroups).map(x=>x.to),
    ['/inventario/productos','/almacenes']);
  assert.deepEqual(getOSAppSections('pos',navigationGroups),[]);
  assert.deepEqual(getOSAppSections('settings',navigationGroups),[]);
});

test('Deep routes select the most specific parent section, never the app root',()=>{
  const sections=getOSAppSections('procurement',navigationGroups);
  assert.equal(getActiveOSAppSection('/compras/ordenes/123',sections)?.label,'Órdenes de compra');
  assert.equal(getActiveOSAppSection('/compras/solicitudes',sections)?.label,'Solicitudes');
  assert.equal(getActiveOSAppSection('/compras',sections)?.label,'Resumen');
  assert.equal(getActiveOSAppSection('/compras-externas',sections),null);
  assert.equal(getActiveOSAppSection('/ventas',sections),null);
});

test('Every desktop app window owns a scoped section hierarchy without replacing CRUD routes',()=>{
  const stage=read('apps/web/src/layout/os/OSWindowStage.jsx');
  const surface=read('apps/web/src/layout/os/OSAppSurface.jsx');
  const styles=read('apps/web/src/layout/os/OSAppSurface.module.css');
  assert.ok(stage.includes('<OSAppSurface appKey={window.key}'));
  assert.ok(stage.includes('<OSWindowRouteContent pathname={window.path}/>'));
  assert.ok(surface.includes('getOSAppSections(appKey,navigationGroups)'));
  assert.ok(surface.includes('aria-current={selected?'));
  assert.ok(surface.includes('data-os-app-surface={identity.key}'));
  assert.ok(surface.includes('data-os-app-page="true"'));
  assert.match(styles,/\.sectionLink:focus-visible/);
  assert.match(styles,/\.body\{/);
});
