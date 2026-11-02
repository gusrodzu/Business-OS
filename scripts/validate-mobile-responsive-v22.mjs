import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFileSync(path.join(root,file),'utf8');
const app=read('apps/web/src/layout/AppShell.jsx');
const shell=read('apps/web/src/layout/AppShell.module.css');
const nav=read('apps/web/src/layout/ModuleTabBar.module.css');
const topbar=read('apps/web/src/layout/Topbar.module.css');
const topbarComponent=read('apps/web/src/layout/Topbar.jsx');
const appShelf=read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.module.css');
const sidebar=read('apps/web/src/layout/Sidebar.module.css');
const ux=read('apps/web/src/ux-foundation/UXFoundation.module.css');
const modules=read('apps/web/src/components/module-system/ModuleSystem.module.css');
const table=read('apps/web/src/design-system/components/DataTable.jsx');
const smart=read('apps/web/src/ux-foundation/UXFoundation.jsx');
const global=read('apps/web/src/design-system/styles/mobile-adaptive-v25.css');
const foundation=read('apps/web/src/design-system/styles/foundation.css');
const pos=read('apps/web/src/modules/pos/ui/pages/Pos.module.css');
const dialog=read('apps/web/src/design-system/components/Dialog.module.css');
const drawer=read('apps/web/src/design-system/components/Drawer.module.css');

for(const item of ['to="/"','to="/tareas"','to="/agenda"','Abrir BuzzBee AI','Abrir módulos'])assert.ok(app.includes(item),`Falta navegación móvil: ${item}`);
assert.ok(app.includes('data-mobile-bottom-nav="true"'),'Bottom navigation not present');
assert.ok(app.includes("setMobileOpen(true)"),'Mobile menu action must be live');
assert.ok(app.includes("setAiOpen(true)"),'AI action must be live');
assert.ok(shell.includes("env(safe-area-inset-bottom"),'Bottom safe area missing');
assert.ok(shell.includes("calc(100px + env(safe-area-inset-bottom"),'Scroll must clear mobile bottom navigation');
assert.ok(shell.includes("data-mobile-menu-open='true'"),'Hide mobile nav behind open drawer');
assert.ok(shell.includes(':has(input:focus,textarea:focus,select:focus)'),'Mobile keyboard avoidance missing');
assert.ok(nav.includes('scroll-snap-type:x proximity'),'Tab swipe navigation missing');
assert.ok(topbar.includes('grid-template-columns:minmax(0,1fr) auto!important'),'Header width constraints missing');
assert.ok(sidebar.includes('height:100dvh'),'Mobile sidebar viewport constraint missing');
assert.ok(ux.includes('.tableScroller{max-width:100%;min-width:0;overflow-x:auto'),'Shared table scroll missing');
assert.ok(modules.includes('.drawer,.modalSmall,.modalLarge{width:100%;'),'Modules modal phone layout missing');
assert.ok(dialog.includes('.dialog,.sm,.lg{width:100%'),'Native dialog layout missing');
assert.ok(drawer.includes('.drawer,.left{inset:0;width:100%'),'Native drawer layout missing');
assert.ok(table.includes('tabIndex={0}'),'Design system table keyboard scrolling missing');
assert.ok(smart.includes('tabIndex={0}'),'SmartTable keyboard scrolling missing');
assert.ok(global.includes("input:not([type='checkbox'])"),'iOS auto-zoom guard missing');
assert.ok(global.includes('overflow-x:auto'),'Wide data must remain horizontally scrollable');
assert.ok(foundation.includes("@import './mobile-adaptive-v25.css';"),'Mobile layer must come through foundation only');
assert.ok(pos.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'POS mobile grid missing');
// Business OS Next: smartphone shell must expose the real command palette and
// keep application tiles compact without changing desktop navigation.
assert.ok(topbarComponent.includes('className={styles.mobileSearch} onClick={onOpenCommand}'),'Mobile global search must open the existing command palette');
assert.ok(topbarComponent.includes('aria-label="Buscar en Business OS"'),'Mobile search must have an accessible name');
assert.ok(topbar.includes('.mobileSearch{display:none}'),'Mobile search must not duplicate desktop search');
assert.ok(topbar.includes('flex:0 0 44px;width:44px;height:44px'),'Mobile search touch target must remain 44px');
assert.ok(topbar.includes('.mobileSearch:focus-visible'),'Mobile command search needs visible keyboard focus');
assert.ok(appShelf.includes('@media(max-width:760px)'),'App launcher must have a smartphone-specific layout');
assert.ok(appShelf.includes('.apps{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}'),'Phone app launcher must use two readable columns');
assert.ok(appShelf.includes('width:46px;height:46px'),'App icons must be touch-scale on smartphones');
assert.ok(appShelf.includes('.pin{'),'Favorite pin must remain available in mobile layout');

console.log('PASS Business OS smartphone: bottom navigation, keyboard, tables, forms, POS, safe areas');
console.log('NOTE Visual verification still required on real Android, iPhone and Huawei devices.');
