import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const dashboard = read('apps/web/src/modules/core/ui/pages/Dashboard.jsx');
const shelf = read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.jsx');
const metrics = read('apps/web/src/modules/core/ui/pages/DashboardMetricsPanel.jsx');
const preferencesHook = read('apps/web/src/modules/core/hooks/useDashboardPreferences.js');
const styles = read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.module.css');

test('desktop Home and control center are widget-only; app catalog is in the dock', () => {
  const home = read('apps/web/src/modules/core/ui/pages/WorkspaceOSHome.jsx');
  const dock = read('apps/web/src/layout/os/OSDock.jsx');
  assert.ok(!home.includes('WorkspaceAppShelf'));
  assert.ok(!dashboard.includes('<WorkspaceAppShelf />'));
  assert.ok(home.includes('<WorkspaceWidgetBoard'));
  assert.ok(dock.includes('data-os-app-launcher="true"'));
  assert.match(metrics, /<KpiCard\s+key=\{item.id\}/);
  assert.ok(dashboard.includes("visibleWidgets.has('requests')"));
  assert.ok(preferencesHook.includes('dashboardPreferencesKey(user, offlineDemo)'));
});

test('app launcher uses existing routes, company module entitlements and profile visibility', () => {
  assert.ok(shelf.includes("import {isProfileVisible, navigationGroups} from '../../../../data/navigation'"));
  assert.ok(shelf.includes("apiRequest('/modules/dashboard')"));
  assert.ok(shelf.includes('row.module?.key || row.moduleId, row.enabled'));
  assert.ok(shelf.includes('item.defaultVisible !== false : enabled !== false'));
  assert.ok(shelf.includes('!isProfileVisible(item)'));
  assert.ok(shelf.includes('navigate(destination(app))'));
  // Local storage is allowed only for preferences scoped to the active user/company/demo.
  assert.ok(shelf.includes('window.localStorage.getItem(key)'));
  assert.ok(shelf.includes('window.localStorage.setItem(key, JSON.stringify(values))'));
  assert.ok(shelf.includes('dashboardPreferencesKey(user, offlineDemo)'));
  assert.ok(shelf.includes('if (favoriteState.key === favoritesKey)'));
  assert.ok(shelf.includes('saveFavorites(favoritesKey, favoriteState.values)'));
});

test('tenant changes cannot display an earlier company app catalog', () => {
  assert.ok(shelf.includes("user?.companyId || user?.company?.id || 'none'"));
  assert.ok(shelf.includes('moduleState?.companyScope === companyScope ? moduleState : null'));
  assert.ok(shelf.includes('if (!active) return'));
  assert.ok(shelf.includes('return () => { active = false; }'));
});

test('app shelf includes clear loading, error, responsive and keyboard states', () => {
  assert.ok(shelf.includes("const titleId = variant === 'drawer' ? 'workspace-apps-title-drawer' : 'workspace-apps-title'"));
  assert.ok(shelf.includes('aria-labelledby={titleId}'));
  assert.ok(shelf.includes('<h2 id={titleId}'));
  assert.ok(shelf.includes('aria-label="Aplicaciones disponibles"'));
  assert.ok(shelf.includes("const gridId = variant === 'drawer' ? 'workspace-app-grid-drawer' : 'workspace-app-grid'"));
  assert.ok(shelf.includes('aria-controls={gridId}'));
  assert.ok(shelf.includes('nav id={gridId}'));
  assert.ok(shelf.includes('aria-expanded={expanded}'));
  assert.ok(shelf.includes('aria-busy="true"'));
  assert.ok(shelf.includes('setRefreshId((id) => id + 1)'));
  assert.match(styles, /\.app:focus-visible/);
  assert.match(styles, /@container\(min-width:620px\)/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\)/);
  assert.ok(!styles.includes('!important'));
});

test('favorites are scoped per user, company and demo context', () => {
  assert.match(shelf, /dashboardPreferencesKey\(user, offlineDemo\)/);
  assert.match(shelf, /favoritesKey = `business-os\.workspace\.favorites\.v1:/);
  assert.match(shelf, /favoriteState\.key === favoritesKey/);
  assert.match(shelf, /favoriteSet\.has\(appId\(a\)\)/);
  assert.match(shelf, /favoriteSet\.has\(appId\(b\)\)/);
  assert.match(shelf, /item\.moduleKey \|\| destination\(item\)/);
  assert.ok(shelf.includes('if (favoriteState.key === favoritesKey)'));
  assert.ok(shelf.includes('saveFavorites(favoritesKey, favoriteState.values)'));
});

test('launcher icons are free of pin controls; favorite editing remains accessible and scoped', () => {
  assert.doesNotMatch(shelf, /<Pin\b|className=\{\x60\$\{styles\.pin\}/);
  assert.ok(shelf.includes('data-launcher-favorite-edit="true"'));
  assert.ok(shelf.includes('data-launcher-favorite={appId(app)}'));
  assert.ok(shelf.includes('checked={favoriteSet.has(appId(app))}'));
  assert.ok(shelf.includes('onChange={()=>toggleFavorite(appId(app))}'));
  assert.ok(shelf.includes('className={styles.appTile}'));
  assert.ok(shelf.includes('onClick={() => launchApp(app)}'));
  assert.ok(shelf.includes('navigate(destination(app))'));
  assert.ok(shelf.includes('onLaunch?.()'));
  assert.match(styles, /Android-style launcher: the artwork is the icon/);
  assert.ok(shelf.indexOf('if (!isProfileVisible(item)') < shelf.indexOf('.sort((a, b)'));
});

test('workspace categories are derived only from available tenant-scoped apps', () => {
  assert.match(shelf, /new Set\(apps\.map\(\(app\) => app\.category\)\)/);
  assert.match(shelf, /categories\.includes\(selectedCategory\)/);
  assert.match(shelf, /apps\.filter\(\(app\) => app\.category === activeCategory\)/);
  assert.match(shelf, /filteredApps\.slice\(0, INITIAL_VISIBLE\)/);
  assert.ok(shelf.includes('setExpanded(false)'));
  assert.ok(shelf.includes('aria-label="Filtrar aplicaciones por área"'));
  assert.ok(shelf.includes('aria-pressed={activeCategory === category}'));
  assert.match(styles, /\.categories\{[^}]*overflow-x:auto/);
  assert.match(styles, /\.category\{[^}]*min-height:44px/);
  assert.match(styles, /\.category:focus-visible/);
});

test('industry suggestions are read from company-scoped APIs and only order licensed apps', () => {
  assert.ok(shelf.includes("apiRequest('/industries/company')"));
  assert.ok(shelf.includes("apiRequest('/industries/recommend'"));
  assert.ok(shelf.includes("method: 'POST', body: {activities}"));
  assert.ok(shelf.includes('result.recommendation?.suggestedModules'));
  assert.ok(shelf.includes('scope: industryScope'));
  assert.ok(shelf.includes('industryState?.scope === industryScope'));
  assert.ok(shelf.includes('if (offlineDemo)'));
  assert.ok(shelf.includes('if (!active) return'));
  assert.ok(shelf.indexOf('.filter((item) => {') < shelf.indexOf('.sort((a, b) =>'));
  assert.ok(shelf.includes('enabled === undefined ? item.defaultVisible !== false : enabled !== false'));
  assert.ok(shelf.includes('Number(recommended.has(b.moduleKey)) - Number(recommended.has(a.moduleKey))'));
  assert.ok(shelf.includes('Number(favoriteSet.has(appId(b))) - Number(favoriteSet.has(appId(a)))'));
  assert.ok(shelf.includes('filteredApps.slice(0, INITIAL_VISIBLE)'));
  assert.ok(shelf.includes('categories.includes(selectedCategory)'));
  assert.match(styles, /\.industryTag\{/);
});


test('Pocket OS uses the dedicated phone workspace while preserving the existing desktop and control center', () => {
  const pocket = read('apps/web/src/modules/core/ui/pages/WorkspacePocketHome.jsx');
  const pocketCss = read('apps/web/src/modules/core/ui/pages/WorkspacePocketHome.module.css');
  assert.match(dashboard, /useSyncExternalStore\(subscribePocketViewport, getPocketViewport, getPocketViewportServer\)/);
  assert.match(dashboard, /isPocketViewport \? \(/);
  assert.match(dashboard, /<WorkspacePocketHome/);
  assert.match(dashboard, /<WorkspaceOSHome/);
  assert.match(dashboard, /onOpenDashboard=\{\(\) => setOsHomeVisible\(false\)\}/);
  assert.match(pocket, /data-business-os-pocket-home="true"/);
  assert.doesNotMatch(pocket, /WorkspaceAppShelf/);
  assert.match(pocket, /data-pocket-widget-home="true"/);
  const drawer = read('apps/web/src/layout/workspace-os/WorkspaceOSAppDrawer.jsx');
  assert.match(drawer, /<WorkspaceAppShelf variant="drawer" includeSystemApps/);
  assert.match(shelf, /SYSTEM_DOCK_APPS\.map/);
  assert.match(pocket, /data\?\.kpis\?\.pendingRequests/);
  assert.match(pocket, /data\?\.kpis\?\.criticalStock/);
  assert.match(pocket, /onOpenDashboard/);
  assert.match(pocketCss, /@media\(max-width:359px\)/);
});
