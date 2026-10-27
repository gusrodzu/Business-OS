import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');
const shared = 'apps/web/src/design-system/components/';
const css = (component) => read(shared + component + '.module.css');
const jsx = (component) => read(shared + component + '.jsx');
const check = (name, condition) => {
  assert.ok(condition, name);
  console.log('PASS · ' + name);
};

const tokens = read('apps/web/src/design-system/styles/enterprise-ui-v26.css');
const foundation = read('apps/web/src/design-system/styles/foundation.css');
check('Existing foundation entrypoint unchanged', foundation.trimEnd().endsWith("@import './responsive-ui-sheet-v27.css';"));
for (const token of ['--bb26-brand-charcoal', '--bb26-action', '--bb26-space-sm', '--bb26-help-text-size', '--bb26-control-label-size']) {
  check('Shared design token ' + token, tokens.includes(token + ':'));
}
check('Light/dark token pairing', tokens.includes(":root[data-theme='dark']"));
for (const component of ['Button', 'Input', 'Select', 'Card', 'DataTable']) {
  check(component + ' respects enterprise tokens', css(component).includes('--bb26-'));
}
check('Button busy state and control semantics', jsx('Button').includes('aria-busy') && css('Button').includes('prefers-reduced-motion'));
for (const component of ['Input', 'Select']) {
  check(component + ' accessible validation and help', jsx(component).includes('useId')
    && jsx(component).includes('aria-describedby')
    && jsx(component).includes('aria-invalid')
    && jsx(component).includes('role="alert"'));
  check(component + ' mobile and error focus', css(component).includes('min-height:44px')
    && css(component).includes('.hasError:focus-within'));
}
check('Checkbox always has stable generated ID', jsx('Checkbox').includes('useId()')
  && jsx('Checkbox').includes('id || generatedId'));
check('Unique Dialog title IDs, current actions and focus restoration', jsx('Dialog').includes('useId()')
  && jsx('Dialog').includes('aria-labelledby={titleId}')
  && jsx('Dialog').includes("event.key !== 'Tab'")
  && jsx('Dialog').includes('getFocusable(dialog)')
  && jsx('Dialog').includes('previousFocus.focus'));
check('Drawer keyboard trap and return focus', jsx('Drawer').includes("event.key !== 'Tab'")
  && jsx('Drawer').includes('drawer?.focus()')
  && jsx('Drawer').includes('previousFocus.focus'));
check('Wide tables remain keyboard scrollable', jsx('DataTable').includes('tabIndex={0}')
  && css('DataTable').includes('.scroller:focus-visible'));
check('Headings do not overflow narrow screens', css('PageHeader').includes('max-width:360px')
  && css('PageHeader').includes('overflow-wrap:anywhere'));
const ux = read('apps/web/src/ux-foundation/UXFoundation.jsx');
const uxStyles = read('apps/web/src/ux-foundation/UXFoundation.module.css');
check('Search and removable filters expose accessible names', ux.includes('aria-label="Buscar en los resultados"')
  && ux.includes('aria-label={`Quitar filtro: ${chip.label}`}'));
check('Favorites announce pressed state and tolerate unavailable storage',
  ux.includes('aria-pressed={isFavorite}') && ux.includes('try { localStorage.setItem'));
check('UX Foundation search, filters, actions and tables handle smartphone',
  uxStyles.includes('.filterControls{width:100%}')
  && uxStyles.includes('.tableScroller{max-width:100%'));
check('Original dashboard KPI cards stay intact', read('apps/web/src/modules/core/ui/pages/Dashboard.jsx').includes('data-dashboard-kpi-grid="cards"'));
check('Contextual icon navigation stays intact', read('apps/web/src/layout/TwoLevelSidebar.jsx').includes('focusedModule'));

const shellStyles = read('apps/web/src/layout/AppShell.module.css');
check('Desktop module/rail breathing room uses a shared gap',
  shellStyles.includes('--bb-workspace-rail-gap:clamp(16px,1.35vw,22px)')
    && shellStyles.includes('column-gap:var(--bb-workspace-rail-gap)'));
check('Module and right rail are independently rounded',
  shellStyles.includes('border-radius:20px;')
    && shellStyles.includes('border-radius:18px;')
    && shellStyles.includes('border:1px solid var(--bb26-border,#dde4e0)'));
check('Rail spacing is desktop-only, preserving mobile canvas',
  shellStyles.includes('@media(min-width:1181px)')
    && shellStyles.includes("@media(max-width:760px)")
    && shellStyles.includes("scrollbar-gutter:stable"));

console.log('PASS · UI Foundation 2.0 shared primitives, a11y, responsive and visual contracts');
console.log('NOTE · static audit; the PR also requires build, lint, browser and offline CI checks.');
