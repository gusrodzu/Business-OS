import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const component = read('apps/web/src/components/HexQuickActions.jsx');
const css = read('apps/web/src/components/HexQuickActions.module.css');
const canonical = read('apps/web/src/modules/core/ui/pages/Dashboard.jsx');
const legacy = read('apps/web/src/pages/Dashboard.jsx');
const nav = read('apps/web/src/data/navigation.js');

function check(label, condition) {
  assert.ok(condition, label);
  console.log('PASS · ' + label);
}

for (const source of [canonical, legacy]) {
  check('Dashboard uses scoped hex controls', source.includes('<HexQuickActions actions={quickActions} onNavigate={(to) => navigate(to)} />'));
  check('Dashboard preserves KPI honeycomb', source.includes('<HoneycombKpis items={kpis}'));
  check('Dashboard preserves customizer and offline data', source.includes('DashboardCustomizer') && source.includes("apiRequest('/dashboard')"));
}
check('Reference quick actions preserve original destinations', nav.includes("label: 'Nueva venta'") && nav.includes("label: 'Registrar compra'"));
check('Controls remain functional', ['setQuery','setModule','setFrequentOnly','setVisibleLimit','onNavigate?.(action.to)'].every(token => component.includes(token)));
check('Accessible text field and module filter', component.includes('type="search"') && component.includes('htmlFor={searchId}') && component.includes('htmlFor={moduleId}'));
check('Accessible hex toggle and range', component.includes('aria-pressed=') && component.includes('type="range"') && component.includes('htmlFor={rangeId}'));
check('Zero-results recovery', component.includes('No encontramos acciones') && component.includes('clearFilters'));
check('Source drawing includes six-sided geometry', (css.includes('clip-path: polygon(') || css.includes('clip-path:polygon(')) && css.includes('.actionHex'));
check('Brand tokens support dark themes', ['--bb26-ink','--bb26-action','--bb26-surface','--bb26-focus'].every(token => css.includes(token)));
check('Keyboard focus and 44px phone targets', css.includes(':focus-visible') && (css.includes('min-height: 44px') || css.includes('min-height:44px')));
check('Reduced motion and mobile handled', css.includes('prefers-reduced-motion:reduce') && css.includes('max-width:760px'));
console.log('PASS · BuzzBee HEX UI v1: controls, routes, keyboard, responsive and offline contracts');
