import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const nav=read('apps/web/src/layout/TwoLevelSidebar.module.css');
const platform=read('apps/web/src/layout/PlatformShell.module.css');
const dashboard=read('apps/web/src/modules/core/ui/pages/Dashboard.jsx');
const kpi=read('apps/web/src/components/KpiCard.jsx');
const css=read('apps/web/src/modules/core/ui/pages/Dashboard.module.css');

test('the two-level menu stays visually light without changing structure or mobile behavior',()=>{
  assert.match(nav,/--nav-rail:#f1f5f2/);
  assert.match(nav,/--nav-panel:#ffffff/);
  assert.match(nav,/--nav-ink:#25322b/);
  assert.match(nav,/--nav-selected:#e3f0d3/);
  assert.match(nav,/color:var\(--nav-ink\);background:var\(--nav-panel\)/);
  assert.match(nav,/\.railActive,\.railActive:hover\{/);
  assert.match(nav,/\.moduleActive,\.moduleActive:hover\{/);
  assert.match(nav,/\.focusedLink\.current\{/);
  assert.match(nav,/\.root\.mobileOpen\{/);
  assert.match(nav,/visibility:hidden;pointer-events:none/);
  assert.match(nav,/min-height:44px/);
  assert.match(nav,/safe-area-inset-top/);
  assert.match(nav,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(nav,/#(?:101112|252628|343638|1a1b1d)\b/i);
  assert.doesNotMatch(nav,/--nav-panel:#(?:0[0-9a-f]{5}|1[0-9a-f]{5})/i);
});

test('Super Admin uses the same light navigation principle without relaxing guards',()=>{
  assert.match(platform,/\.sidebar\{background:#ffffff;color:#25322b;border-color:#d8e2db\}/);
  assert.match(platform,/\.navItem\.active\{background:#e3f0d3;color:#334e1c/);
  assert.match(platform,/\.sidebar\.mobileOpen\{transform:translateX\(0\)\}/);
  const platformPage=read('apps/web/src/modules/platform/ui/pages/PlatformAdmin.jsx');
  assert.ok(platformPage.includes("user?.permissions?.includes('platform.manage')&&platformSession"));
  assert.ok(platformPage.includes('if(!canAccess)return'));
});

test('dashboard metrics reuse the shared card without changing its values or preference scoping',()=>{
  assert.match(dashboard,/import KpiCard from '\.\.\/\.\.\/\.\.\/\.\.\/components\/KpiCard';/);
  assert.match(dashboard,/<KpiCard\s+key=\{item.id\}/);
  assert.match(dashboard,/data-dashboard-kpi=\{item.id\}/);
  assert.match(dashboard,/<\/KpiCard>/);
  assert.match(dashboard,/data-dashboard-kpi-grid="cards"/);
  assert.ok(dashboard.includes('dashboardPreferencesKey(user, offlineDemo)'));
  assert.ok(dashboard.includes('writeDashboardPreferences(preferencesKey'));
  assert.ok(dashboard.includes('availableMetrics.find(metric => metric.id === id)'));
  assert.ok(dashboard.includes('data?.kpis?.criticalStock'));
  assert.ok(dashboard.includes('visibleWidgets.has'));
  assert.ok(dashboard.includes('styles.widget'));
  assert.ok(!dashboard.includes('<HoneycombKpis'));
  assert.ok(kpi.includes('...props'));
  assert.ok(kpi.includes('data-kpi-card="true"'));
  assert.ok(kpi.includes('data-kpi-clickable'));
  assert.match(css,/\.kpiGrid/);
});

test('CSS Modules remain the styling owners: no new global override or dependency',()=>{
  const foundation=read('apps/web/src/design-system/styles/foundation.css');
  assert.ok(foundation.includes("@import './enterprise-ui-v26.css';"));
  assert.ok(foundation.includes("@import './responsive-ui-sheet-v27.css';"));
  assert.ok(nav.includes('.root a:focus-visible'));
  assert.ok(platform.includes('.navItem'));
});

test('rail tooltip text meets WCAG AA contrast on the approved light navigation',()=>{
  const tooltip=nav.match(/\.railTip\{([^}]+)\}/)?.[1];
  assert.ok(tooltip,'rail tooltip rule must exist');
  assert.match(tooltip,/background:var\(--nav-lime\)/);
  const green=nav.match(/--nav-lime:(#[0-9a-f]{6})/i)?.[1];
  const foreground=tooltip.match(/color:(#[0-9a-f]{6})/i)?.[1];
  assert.ok(green&&foreground,'tooltip colors must be explicit and auditable');
  const luminance=(hex)=>{
    const channels=hex.slice(1).match(/.{2}/g).map(value=>{
      const channel=parseInt(value,16)/255;
      return channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4;
    });
    return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
  };
  const a=luminance(green),b=luminance(foreground);
  const ratio=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
  assert.ok(ratio>=4.5,`Tooltip contrast ${ratio.toFixed(2)}:1 is below WCAG AA 4.5:1`);
});
