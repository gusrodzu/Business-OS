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
  assert.match(dock,/dockApps\.map/);
  assert.match(dock,/!dockKeys\.has\(window\.key\)/);
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

test('Desktop dock artwork stays larger than internal navigation without shrinking',()=>{
  const dock=read('apps/web/src/layout/os/OSDock.jsx');
  const css=read('apps/web/src/layout/os/OSDock.module.css');
  assert.equal((dock.match(/size=\{36\} fallback=\{Icon\}/g)||[]).length,2);
  assert.match(css,/--dock-art-size:36px/);
  assert.match(css,/--dock-art-size:30px/);
  assert.match(css,/\.dock \.item>svg\{flex:none;width:var\(--dock-art-size\)!important;height:var\(--dock-art-size\)!important/);
  assert.match(css,/overflow-x:auto/);
  assert.match(read('apps/web/src/design-system/styles/workspace-hybrid-global.css'),/--ws-desktop-dock-clearance:120px/);
});


test('Pocket dock uses matte system artwork for all five existing actions',()=>{
 const dock=read('apps/web/src/layout/os/OSDock.jsx').split('aria-label="Dock de Pocket OS"')[1];
 const artwork=read('apps/web/src/layout/os/OSSystemAppIcon.jsx');
 const css=read('apps/web/src/layout/os/OSDock.module.css');
 const actions=['home','search','apps','assistant','profile'];
 assert.deepEqual([...dock.matchAll(/data-pocket-dock-action="([^"]+)"/g)].map(m=>m[1]),actions);
 assert.deepEqual([...dock.matchAll(/<OSSystemAppIcon appKey="([^"]+)"/g)].map(m=>m[1]),actions);
 const utilityArt=artwork.split('const UTILITY_ART={')[1].split('const UTILITY_COLORS=')[0];
 const utilityColors=artwork.split('const UTILITY_COLORS={')[1].split('const ART=')[0];
 assert.deepEqual([...utilityArt.matchAll(/^\s{1}([a-z]+):/gm)].map(m=>m[1]),actions);
 assert.deepEqual([...utilityColors.matchAll(/([a-z]+):\['#[0-9A-Fa-f]{6}','#[0-9A-Fa-f]{6}'\]/g)].map(m=>m[1]),actions);
 assert.match(css,/\.mobileDock\{height:62px\}/);
 assert.match(css,/svg\[data-haibu-app-icon\]\{flex:none;width:28px!important;height:28px!important/);
});

test('Desktop docks reuse the Pocket OS shortcut artwork at the shared desktop scale',()=>{
 const dock=read('apps/web/src/layout/os/OSDock.jsx').split('aria-label="Dock de Pocket OS"')[0];
 const alternate=read('apps/web/src/layout/workspace-os/WorkspaceOSDock.jsx');
 assert.deepEqual([...dock.matchAll(/<OSSystemAppIcon appKey="([^"]+)" size=\{36\}/g)].map(m=>m[1]),['apps','home']);
 assert.deepEqual([...alternate.matchAll(/<OSSystemAppIcon appKey="([^"]+)" size=\{36\}/g)].map(m=>m[1]),['apps','home','search']);
 const css=read('apps/web/src/layout/os/OSDock.module.css');
 assert.doesNotMatch(css,/\.dock>\.item>svg\{width:28px/);
 assert.match(css,/--dock-art-size:36px/);
});
