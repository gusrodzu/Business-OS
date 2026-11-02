import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFileSync(path.join(root,file),'utf8');
const app=read('apps/web/src/layout/AppShell.jsx');
const dashboard=read('apps/web/src/modules/core/ui/pages/Dashboard.jsx');
const mobileHome=read('apps/web/src/modules/core/ui/pages/MobileHomeHero.jsx');
const mobileHomeCss=read('apps/web/src/modules/core/ui/pages/MobileHomeHero.module.css');
const dashboardCss=read('apps/web/src/modules/core/ui/pages/Dashboard.module.css');
const mobileLayoutCss=read('apps/web/src/modules/core/ui/pages/MobileHomeLayout.module.css');
const appShelfComponent=read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.jsx');
const appShelfCss=read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.module.css');
const shell=read('apps/web/src/layout/AppShell.module.css');
const nav=read('apps/web/src/layout/ModuleTabBar.module.css');
const topbar=read('apps/web/src/layout/Topbar.module.css');
const topbarComponent=read('apps/web/src/layout/Topbar.jsx');
const commandPalette=read('apps/web/src/framework/CommandPalette.jsx');
const appShelf=read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.module.css');
const sidebar=read('apps/web/src/layout/Sidebar.module.css');
const ux=read('apps/web/src/ux-foundation/UXFoundation.module.css');
const modules=read('apps/web/src/components/module-system/ModuleSystem.module.css');
const table=read('apps/web/src/design-system/components/DataTable.jsx');
const smart=read('apps/web/src/ux-foundation/UXFoundation.jsx');
const global=read('apps/web/src/design-system/styles/mobile-adaptive-v25.css');
const foundation=read('apps/web/src/design-system/styles/foundation.css');
const pos=read('apps/web/src/modules/pos/ui/pages/Pos.module.css');
const salesWorkspace=read('apps/web/src/modules/sales/ui/pages/SalesEnterprise.jsx');
const salesWorkspaceCss=read('apps/web/src/modules/sales/ui/pages/SalesEnterprise.module.css');
const mobileSales=read('apps/web/src/modules/sales/ui/pages/MobileSalesControl.jsx');
const mobileSalesCss=read('apps/web/src/modules/sales/ui/pages/MobileSalesControl.module.css');
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
assert.ok(commandPalette.includes('role="dialog" aria-modal="true"'),'Command palette must expose modal semantics');
assert.ok(commandPalette.includes("event.key === 'Tab'"),'Command palette must trap Tab/Shift+Tab');
assert.ok(commandPalette.includes('paletteRef.current.contains(document.activeElement)'),'Command palette must detect focus outside the modal');
assert.ok(commandPalette.includes('getClientRects().length'),'Command palette must skip hidden focus targets');
assert.ok(app.includes('onOpenCommand={openCommandPalette}'),'Header must pass its real search opener to the shell');
assert.ok(app.includes('commandTriggerRef.current = {node: event?.currentTarget || document.activeElement, routeKey: location.key}'),'Search must remember the click or Ctrl+K opener and route');
assert.ok(app.includes('wasCommandOpenRef.current && !commandOpen'),'Closing search must restore focus only after it was opened');
assert.ok(app.includes('routeKey === location.key'),'Navigating to a search result must not restore focus to the previous route');
assert.ok(app.includes('target?.focus({preventScroll: true})'),'Dismissed search must return focus to a visible opener without scrolling');
assert.ok(appShelf.includes('@media(max-width:760px)'),'App launcher must have a smartphone-specific layout');
assert.ok(appShelf.includes('.apps{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}'),'Phone app launcher must use two readable columns');
assert.ok(appShelf.includes('width:46px;height:46px'),'App icons must be touch-scale on smartphones');
assert.ok(appShelf.includes('.pin{'),'Favorite pin must remain available in mobile layout');


// Mobile Control Center v1: dark premium styling is phone-scoped and respects user theme.
assert.ok(dashboard.includes("import MobileHomeHero, {MobileHomePriority} from './MobileHomeHero'"),'Phone Home must render separate mobile heading and operational priorities');
assert.ok(dashboard.includes('firstName={data?.user?.firstName || user?.firstName}'),'Home greeting must use authenticated data');
assert.ok(dashboard.includes('pendingRequests={data?.kpis?.pendingRequests}'),'Home pending requests must use real dashboard data');
assert.ok(dashboard.includes('criticalStock={data?.kpis?.criticalStock}'),'Home stock alert must use real dashboard data');
assert.ok(dashboard.includes("dashboardState.scope === dashboardScope"),'Do not display another tenant while switching companies');
assert.ok(dashboard.includes('if (active) setDashboardState('),'Ignore stale dashboard API responses');
assert.ok(dashboard.includes('return () => { active = false; }'),'Cancel stale dashboard responses on tenant change');
assert.ok(dashboard.includes('onCustomize={() => setCustomizerOpen(true)}'),'Mobile Home must preserve customization controls');
assert.ok(dashboard.includes('<KpiCard'),'Existing shared rectangular KPI card must remain');
assert.ok(dashboardCss.length < 30000,'Canonical Dashboard style budget must remain intact');
assert.ok(mobileLayoutCss.includes('.mobileHomeFrame{display:none}'),'Mobile hero must not alter desktop layout');
assert.ok(mobileLayoutCss.includes('.desktopHomeHeader{display:none}'),'Desktop heading must be hidden only on phone');
assert.ok(mobileLayoutCss.includes(".layout > :global([data-workspace-app-shelf='true']){order:1"),'Wireframe Home must prioritize the app category launcher');
assert.ok(mobileLayoutCss.includes(".layout > :global([data-mobile-section='metrics']){order:3"),'KPI cards must remain below apps and priorities on phones');
assert.ok(mobileHome.includes('data-business-os-mobile-home="true"'),'Phone hero must have an identifiable accessible surface');
assert.ok(mobileHome.includes('export function MobileHomePriority'),'Priorities must be renderable separately below app launcher');
assert.ok(dashboard.includes('<MobileHomePriority'),'Home must render functional priorities separately');
assert.ok(mobileLayoutCss.includes('.mobilePriorityFrame{display:none}'),'Priority panel must not duplicate desktop');
assert.ok(mobileLayoutCss.includes('.mobilePriorityFrame{display:block;order:2'),'Priority panel must follow app categories on smartphones');
assert.ok(mobileHomeCss.includes('Screenshot QA v3'),'Screenshot-driven first-fold compaction must be preserved');
assert.ok(mobileHomeCss.includes('.priorityAction{min-height:44px'),'Compact priorities must retain accessible touch targets');
assert.ok(mobileHome.includes('aria-label="Prioridades de la empresa"'),'Priority panel must be accessible');
assert.ok(mobileHome.includes("navigate('/tareas')"),'Priority CTA must be functional');
assert.ok(mobileHome.includes("onClick={onCustomize}"),'Customization CTA must be functional');
assert.ok(mobileHome.includes("navigate('/compras/solicitudes')"),'Request action must preserve its existing destination');
assert.ok(mobileHome.includes('offlineDemo ?'),'Offline demo must remain clearly indicated');
assert.ok(mobileHomeCss.includes('linear-gradient(130deg'),'Priority component must have its premium gradient');
assert.ok(mobileHomeCss.includes(":global(html[data-theme='dark'])"),'Dark mode must respect system/user preference');
assert.ok(mobileHomeCss.includes('@media(max-width:760px)'),'Hero must be smartphone only');
assert.ok(appShelfComponent.includes('id="business-os-mobile-apps"'),'Apps tab must target the real shelf');
assert.ok(dashboard.includes('id="business-os-mobile-metrics"'),'Overview tab must target real KPI section');
assert.ok(appShelfCss.includes('Mobile Control Center dark palette'),'Launcher must share the mobile theme');
assert.ok(app.includes('styles.mobileNavCenter'),'Bottom dock must highlight an existing functional tab');
assert.ok(app.includes('to="/agenda"'),'Agenda shortcut must remain available');
assert.ok(shell.includes(".mobileNavCenter>svg"),'Bottom dock must retain a reachable center control');
assert.ok(shell.includes(':global(html[data-theme=\'dark\']) .mobileNav'),'Bottom dock must respect dark mode');
assert.ok(topbar.includes(':global(html[data-theme=\'dark\']) .topbar'),'Mobile header must use dark-mode chrome');


// Mobile-first commercial workspace: keep real sales KPIs and all operations available.
assert.ok(salesWorkspace.includes("import MobileSalesControl from './MobileSalesControl'"),'Sales must use mobile Control Center');
assert.ok(salesWorkspace.includes('data-sales-view={tab}'),'Phone-only layout must follow active Sales tab');
assert.ok(salesWorkspace.includes("tab === 'overview' ? ("),'Sales Control Center must appear only in overview');
assert.ok(salesWorkspace.includes('summary={data.summary}'),'Sales quick metrics must come from existing API data');
assert.ok(salesWorkspace.includes("onQuotes={() => setTab('operations')}"),'Quotes CTA must open existing operations tab');
assert.ok(salesWorkspace.includes("onPipeline={() => setTab('pipeline')}"),'Pipeline CTA must open existing pipeline tab');
assert.ok(salesWorkspace.includes('onNewProspect={() => setProspectModal(blankProspect())}'),'New prospect action must use existing form');
assert.ok(salesWorkspace.includes('<KpiCard>'),'Shared rectangular KPI cards must remain');
assert.ok(mobileSales.includes('data-mobile-sales-control="true"'),'Mobile control must have a distinct accessible section');
assert.ok(mobileSales.includes('summary?.openQuotes') && mobileSales.includes('summary?.activeOrders'),'Mobile sales panel must use live API-backed values');
assert.ok(mobileSales.includes('aria-label="Acciones comerciales rápidas"'),'Phone quick actions must be accessible');
assert.ok(mobileSalesCss.includes('.control{display:none}'),'Control Center must not change desktop display');
assert.ok(mobileSalesCss.includes('@media(max-width:760px)'),'Control Center must be limited to smartphone width');
assert.ok(mobileSalesCss.includes("html[data-theme='dark']"),'Sales mobile controls must preserve user theme');
assert.ok(salesWorkspaceCss.includes(".page[data-sales-view='overview'] .desktopHeader{display:none}"),'Mobile-only hero must replace redundant header only in overview');
assert.ok(salesWorkspaceCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'Mobile Sales KPI cards must have a responsive two-column layout');
assert.ok(salesWorkspace.includes('className={styles.mobileProspects}'),'Sales pipeline must offer mobile native prospect cards');
assert.ok(salesWorkspace.includes('className={styles.desktopProspectsTable}'),'Desktop Sales pipeline table must remain');
assert.ok(salesWorkspace.includes('onOpen(prospect)'),'Mobile prospect cards must retain existing detail access');
assert.ok(salesWorkspace.includes('toggleOne(prospect.id, event.target.checked)'),'Mobile prospects must retain bulk selection');
assert.ok(salesWorkspace.includes('onStage(prospect, event.target.value)'),'Mobile prospects must retain stage updates');
assert.ok(salesWorkspaceCss.includes('.mobileProspects{display:none}'),'Native prospect cards must not duplicate desktop table');
assert.ok(salesWorkspaceCss.includes('.desktopProspectsTable{display:none}'),'Phone pipeline must not show the wide desktop table');
assert.ok(salesWorkspaceCss.includes('min-height:44px'),'Touch-first Sales controls must be at least 44px high');


/* Screenshot regression: local demo banner may not consume multiple screen rows,
   and Sales view tabs must not create a second stacked topbar on smartphones. */
assert.ok(app.includes("className={styles.demoActionCompact}"),'Demo actions need short smartphone labels');
assert.ok(app.includes("navigate('/demo/empresas')") && app.includes("navigate('/configuracion'"),'Compact demo actions retain both routes');
assert.ok(shell.includes(".workspace[data-offline-demo='true'] .demoLiveBanner"),'Demo banner has dedicated phone layout');
assert.ok(shell.includes('min-height:46px;padding:3px 10px'),'Demo banner should be one compact row');
assert.ok(shell.includes(".workspace[data-offline-demo='true'] .demoBannerActions"),'Demo actions should be aligned on one row');
assert.ok(shell.includes('.demoActionCompact{display:inline}'),'Compact demo labels should be visible on phones');
assert.ok(salesWorkspace.includes('inline={inlineMobileTabs}'),'Sales view tabs must move into the page on phones');
assert.ok(salesWorkspace.includes("window.matchMedia('(max-width: 760px)')"),'Phone tabs must follow viewport without affecting desktop');
assert.ok(salesWorkspace.includes("media.addEventListener('change', sync)"),'Tablet/phone rotation must update tab placement');
assert.ok(salesWorkspaceCss.includes("data-module-local-tabs='true'"),'In-page tabs need separate phone presentation');
assert.ok(salesWorkspace.includes('<ModuleTabs'),'Sales view switching must remain functional');
assert.ok(nav.includes('data-has-primary-tabs'),'Global module section navigation must remain available');


// Real Android screenshot QA: a broad legacy selector hid all demo banner spans.
// The specific compact-label selector must win the CSS cascade at phone widths.
assert.ok(shell.includes(".demoLiveBanner span{display:none}"),'Known legacy phone-wide span hiding rule must be accounted for');
assert.ok(
  shell.includes(".workspace[data-offline-demo='true'] .demoBannerActions .demoActionCompact{"),
  'Demo action labels must use higher CSS specificity than the broad span hiding rule'
);
assert.ok(
  shell.lastIndexOf(".workspace[data-offline-demo='true'] .demoBannerActions .demoActionCompact{")
    > shell.lastIndexOf(".demoLiveBanner span{display:none}"),
  'Mobile demo label visibility override must be later in cascade'
);
assert.ok(salesWorkspace.indexOf('<ModuleTabs') < salesWorkspace.indexOf('<MobileSalesControl'),
  'Commercial view switching must appear above the tall priority panel on mobile');
assert.ok(mobileSalesCss.includes('grid-template-columns:19px minmax(0,1fr)'),
  'Commercial priority mini-cards must use a compact icon/label row on phones');
assert.ok(mobileSalesCss.includes('.primaryAction{') && mobileSalesCss.includes('min-height:44px'),
  'Commercial quick actions must retain 44px minimum touch targets');
assert.ok(mobileSales.includes('onClick={onQuotes}') && mobileSales.includes('onClick={onNewProspect}'),
  'Sales navigation and prospect creation must keep real click handlers');


// Approved mobile wireframe v1: an app-first launcher, not an e-commerce clone.
assert.ok(appShelfCss.includes('Mobile wireframe v1'),'Mobile app launcher must have an isolated wireframe layout');
assert.ok(appShelfCss.includes('.apps{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}'),'Typical phones must show four compact app categories');
assert.ok(appShelfCss.includes('@media(max-width:375px)'),'Small 320/360px phones need three unclipped columns');
assert.ok(appShelfCss.includes('.app{') && appShelfCss.includes('min-height:112px'),'Icon tiles must stay compact while tappable');
assert.ok(appShelfCss.includes('.pin{top:0;right:0;width:44px;height:44px'),'Favorites must keep a 44px tap area');
assert.ok(appShelfCss.includes('.mobileViewAll:focus-visible'),'View all link must retain keyboard focus');
assert.ok(appShelfComponent.includes('className={styles.mobileViewAll}'),'View all action must open the existing launcher');
assert.ok(appShelfComponent.includes('aria-controls="workspace-app-grid"'),'View all action must control the same grid');
assert.ok(appShelfComponent.includes('toggleFavorite(id)'),'Favorite toggle must remain functional');
assert.ok(appShelfComponent.includes('navigate(destination(app))'),'App tiles must preserve the existing router');

console.log('PASS Business OS smartphone: bottom navigation, keyboard, tables, forms, POS, safe areas');
console.log('NOTE Visual verification still required on real Android, iPhone and Huawei devices.');
