import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {SYSTEM_DOCK_APPS,SYSTEM_DOCK_KEYS} from '../apps/web/src/layout/workspace-os/systemDockApps.js';
import {getWorkspaceOSApp} from '../apps/web/src/layout/workspace-os/workspaceOSRoutes.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Six fixed executive apps have unique routes and independent window keys',()=>{
  assert.equal(SYSTEM_DOCK_APPS.length,6);
  assert.equal(SYSTEM_DOCK_KEYS.size,6);
  assert.deepEqual(SYSTEM_DOCK_APPS.map(app=>app.label),[
    'Calendario','Tareas','Mensajes','Aprobaciones','Directorio','Administración'
  ]);
  for(const app of SYSTEM_DOCK_APPS){
    assert.ok(app.to.startsWith('/'));
    assert.equal(getWorkspaceOSApp(app.to)?.key,app.key,app.label);
  }
});

test('Dock renders pinned and running collections without duplicate ERP icons',()=>{
  const dock=read('apps/web/src/layout/os/OSDock.jsx');
  assert.match(dock,/SYSTEM_DOCK_APPS\.map/);
  assert.match(dock,/!SYSTEM_DOCK_KEYS\.has\(window\.key\)/);
  assert.match(dock,/data-os-running-dot/);
  assert.match(dock,/onContextMenu/);
  assert.match(dock,/onForceCloseWindow/);
  assert.match(dock,/data-os-force-close/);
  assert.match(dock,/aria-label="Dock de Pocket OS"/);
  const shell=read('apps/web/src/layout/AppShell.jsx');
  assert.match(shell,/onForceCloseWindow=\{windowManager\.forceClose\}/);
  assert.match(shell,/onMinimizeWindow=\{windowManager\.minimize\}/);
  const menu=read('apps/web/src/layout/workspace-os/WorkspaceMenuBar.jsx');
  assert.match(menu,/SYSTEM_DOCK_APPS\.map/);
  assert.match(menu,/label:'Aplicaciones'/);
});

test('New utility routes are honest shells, not simulated chat',()=>{
  const core=read('apps/web/src/modules/core/routes.jsx');
  const shell=read('apps/web/src/modules/core/ui/pages/SystemUtilityApp.jsx');
  assert.match(core,/path: 'mensajes'/);
  assert.match(core,/path: 'directorio'/);
  assert.match(shell,/Servicio aún no disponible/);
});
