import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const dashboard = read('apps/web/src/modules/core/ui/pages/Dashboard.jsx');
const shelf = read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.jsx');
const styles = read('apps/web/src/modules/core/ui/pages/WorkspaceAppShelf.module.css');

test('Home exposes applications ahead of alerts and KPI cards without replacing operational widgets', () => {
  assert.match(dashboard, /import WorkspaceAppShelf from '\.\/WorkspaceAppShelf'/);
  assert.ok(dashboard.indexOf('<WorkspaceAppShelf />') < dashboard.indexOf('className={styles.insightBanner}'));
  assert.ok(dashboard.indexOf('<WorkspaceAppShelf />') < dashboard.indexOf('data-dashboard-kpi-grid="cards"'));
  assert.match(dashboard, /<KpiCard\s+key=\{item.id\}/);
  assert.ok(dashboard.includes("visibleWidgets.has('requests')"));
  assert.ok(dashboard.includes('dashboardPreferencesKey(user, offlineDemo)'));
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
  assert.ok(shelf.includes('if (favoriteState.key === favoritesKey) saveFavorites'));
});

test('tenant changes cannot display an earlier company app catalog', () => {
  assert.ok(shelf.includes("user?.companyId || user?.company?.id || 'none'"));
  assert.ok(shelf.includes('moduleState?.companyScope === companyScope ? moduleState : null'));
  assert.ok(shelf.includes('if (!active) return'));
  assert.ok(shelf.includes('return () => { active = false; }'));
});

test('app shelf includes clear loading, error, responsive and keyboard states', () => {
  assert.ok(shelf.includes('aria-labelledby="workspace-apps-title"'));
  assert.ok(shelf.includes('aria-label="Aplicaciones disponibles"'));
  assert.ok(shelf.includes('aria-controls="workspace-app-grid"'));
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
  assert.ok(shelf.includes('if (favoriteState.key === favoritesKey) saveFavorites'));
});

test('pin controls are distinct, accessible and do not bypass navigation permissions', () => {
  assert.match(shelf, /aria-pressed=\{pinned\}/);
  assert.match(shelf, /onClick=\{\(\) => toggleFavorite\(id\)\}/);
  assert.match(shelf, /className=\{styles\.appTile\}/);
  assert.match(shelf, /onClick=\{\(\) => navigate\(destination\(app\)\)\}/);
  assert.match(styles, /\.pin:focus-visible/);
  assert.match(styles, /\.pin\{[^}]*width:44px;height:44px/);
  assert.ok(shelf.indexOf('if (!isProfileVisible(item)') < shelf.indexOf('.sort((a, b)'));
});

test('industry suggestions are read from company-scoped APIs and never activate modules', () => {
  assert.ok(shelf.includes("apiRequest('/industries/company')"));
  assert.ok(shelf.includes("apiRequest('/industries/recommend'"));
  assert.ok(shelf.includes("method: 'POST', body: {activities}"));
  assert.ok(shelf.includes('result.recommendation?.suggestedModules'));
  assert.ok(shelf.includes('scope: industryScope'));
  assert.ok(shelf.includes('industryState?.scope === industryScope'));
  assert.ok(shelf.includes('if (offlineDemo)'));
  assert.ok(shelf.includes("if (!active) return"));
  assert.ok(shelf.indexOf('.filter((item) => {') < shelf.indexOf('.sort((a, b) =>'));
  assert.ok(shelf.includes('enabled === undefined ? item.defaultVisible !== false : enabled !== false'));
  assert.ok(shelf.includes('Number(recommended.has(b.moduleKey)) - Number(recommended.has(a.moduleKey))'));
  assert.ok(shelf.includes('Number(favoriteSet.has(appId(b))) - Number(favoriteSet.has(appId(a)))'));
  assert.ok(!shelf.includes("apiRequest('/industries/company',{method:'PUT'"));
  assert.match(styles, /\.industryTag\{/);
});
