import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const home=read('apps/web/src/modules/core/ui/pages/WorkspaceOSHome.jsx');
const homeCss=read('apps/web/src/modules/core/ui/pages/WorkspaceOSHome.module.css');
const dashboard=read('apps/web/src/modules/core/ui/pages/Dashboard.jsx');
const dock=read('apps/web/src/layout/os/OSDock.jsx');
const shell=read('apps/web/src/layout/AppShell.jsx');
const topbar=read('apps/web/src/layout/Topbar.jsx');
const menu=read('apps/web/src/layout/workspace-os/WorkspaceMenuBar.jsx');
const shelf=read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.jsx');

test('desktop home and control center show operational widgets rather than app cards',()=>{
  assert.doesNotMatch(home,/WorkspaceAppShelf/);
  assert.doesNotMatch(dashboard,/<WorkspaceAppShelf\s*\/>/);
  assert.match(home,/<WorkspaceWidgetBoard/);
  assert.match(home,/storageKey=\{storageKey\}/);
  assert.match(homeCss,/grid-template-areas:"welcome" "widgetBoard"/);
});

test('Windows-style Apps launcher is the first desktop dock control',()=>{
  const launcher=dock.indexOf('data-os-app-launcher="true"');
  const desktopHome=dock.indexOf('aria-label="Escritorio"');
  const firstShelf=dock.indexOf('className={styles.pinnedShelf}');
  assert.ok(launcher>0 && launcher<desktopHome && desktopHome<firstShelf);
  assert.match(dock,/aria-expanded=\{appsOpen\}/);
  assert.match(dock,/aria-haspopup="dialog"/);
  assert.match(shell,/<WorkspaceAppShelf variant="drawer" onLaunch=/);
  assert.match(shell,/id="business-os-app-launcher"/);
  assert.match(shell,/setAppsOpen\(\(value\)=>!value\)/);
});

test('application flyout retains tenant-scoped module filters and keyboard dialog semantics',()=>{
  assert.match(shelf,/apiRequest\('\/modules\/dashboard'\)/);
  assert.match(shelf,/!isProfileVisible\(item\)/);
  assert.match(shelf,/currentState\.enabled\.get\(item\.moduleKey\)/);
  assert.match(shell,/role="dialog" aria-modal="true"/);
  assert.match(shell,/if \(event\.key === 'Escape'\)/);
  assert.match(shell,/if \(event\.key !== 'Tab'/);
});

test('macOS-style menus reflect foreground window and real module navigation',()=>{
  assert.match(shell,/windowManager\.activeKey/);
  assert.match(shell,/!windowManager\.showDesktop/);
  assert.match(shell,/activeOSApp=\{activeOSApp\}/);
  assert.match(topbar,/activeApp=\{activeOSApp\}/);
  assert.match(menu,/menuModule\(foreground\)/);
  assert.match(menu,/label:'Archivo'/);
  assert.match(menu,/label:'Ir'/);
  assert.match(menu,/label:'Vista'/);
  assert.match(menu,/label:'Ventana'/);
  assert.match(menu,/Secciones de /);
  assert.match(menu,/aria-haspopup="menu"/);
  assert.match(menu,/onMinimizeWindow\?\.\(foreground\.windowKey\)/);
  assert.match(menu,/onMaximizeWindow\?\.\(foreground\.windowKey\)/);
  assert.match(menu,/onCloseWindow\?\.\(foreground\.windowKey\)/);
});

test('base desktop Home grid remains widget-first without shell data attributes',()=>{
  const base=homeCss.match(/\.home\s*\{([^}]*)\}/)?.[1];
  assert.ok(base,'base Home CSS rule exists');
  assert.match(base,/grid-template-columns:minmax\(0,1fr\)/);
  assert.match(base,/grid-template-areas:"welcome" "widgetBoard"/);
  assert.doesNotMatch(base,/\bapps\b|\bcontrol\b|\bwallpaper\b/);
});


test('final Home grid override remains widget-only across responsive rules',()=>{
  const finalOverride=homeCss.lastIndexOf('/* Widget-first desktop.');
  assert.ok(finalOverride>=0,'widget-first final override must exist');
  const tail=homeCss.slice(finalOverride);
  assert.match(tail,/grid-template-areas:\s*"welcome"\s*"widgetBoard"/);
  assert.match(tail,/grid-column:\s*1\s*\/\s*-1/);
  assert.match(tail,/@media\s*\(max-width:\s*760px\)/);
  assert.doesNotMatch(tail,/grid-template-areas\s*:[^;]*(?:apps|control|wallpaper|bentoLeft|bentoRight)/);
});

test('nested application menu opens with ArrowRight or ArrowDown and supports ArrowLeft return',()=>{
  assert.match(menu,/event\.key==='ArrowRight'\|\|event\.key==='ArrowDown'/);
  assert.match(menu,/setSubmenu\(item\.label\)/);
  assert.match(menu,/\[data-os-submenu="true"\] \[role="menuitem"\]/);
  assert.match(menu,/event\.key==='ArrowLeft'/);
  assert.match(menu,/setSubmenu\(null\);event\.currentTarget\.parentElement\?\.querySelector/);
});


test('topbar triggers open with ArrowDown or ArrowUp and focus first or last menu item',()=>{
  assert.match(menu,/event\.key==='ArrowDown'\|\|event\.key==='ArrowUp'/);
  assert.match(menu,/event\.key==='ArrowUp'\?items\.at\(-1\):items\[0\]/);
});
