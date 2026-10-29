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
const feedback = jsx('FeedbackMessage');
const exportsIndex = read(shared + 'index.js');
check('Shared feedback maps errors to alerts and success to polite status',
  exportsIndex.includes("export {FeedbackMessage} from './FeedbackMessage';")
  && feedback.includes("tone === 'error' || tone === 'danger'")
  && feedback.includes("role={isError ? 'alert' : 'status'}")
  && feedback.includes("aria-live={isError ? 'assertive' : 'polite'}")
  && feedback.includes('aria-atomic="true"')
  && feedback.includes("import styles from './FeedbackMessage.module.css'")
  && feedback.includes('styles.region')
  && css('FeedbackMessage').includes('.region{min-width:0}'));
const moduleFeedback=[
  ['sales/ui/pages/Sales.jsx', 'tone={message[0]}'],
  ['procurement/ui/pages/PurchaseRequests.jsx', 'tone={message.type}'],
  ['finance/ui/pages/CashFlow.jsx', 'tone={message[0]}'],
];
for (const [file, tone] of moduleFeedback) {
  const source=read('apps/web/src/modules/' + file);
  check('ERP operation feedback accessible in ' + file,
    source.includes('<FeedbackMessage ' + tone)
      && source.includes('</FeedbackMessage>')
      && source.includes('styles.message')
      && !source.includes('<div className={`${styles.message}'));
}
const entityDrawer = ux.slice(ux.indexOf('export function EntityDrawer('), ux.indexOf('export function PageSkeleton('));
check('Entity detail drawer keeps focus inside and restores the trigger',
  entityDrawer.includes('const dialogRef = useRef(null)')
  && entityDrawer.includes('const closeRef = useRef(onClose)')
  && entityDrawer.includes('const previousFocus = document.activeElement')
  && entityDrawer.includes('dialog?.focus()')
  && entityDrawer.includes('previousFocus?.isConnected')
  && entityDrawer.includes('previousFocus.focus?.()')
  && entityDrawer.includes("event.key !== 'Tab'")
  && entityDrawer.includes('event.shiftKey')
  && entityDrawer.includes('getClientRects().length > 0')
  && entityDrawer.includes("event.key === 'Escape'")
  && entityDrawer.includes('closeRef.current?.()')
  && entityDrawer.includes('document.removeEventListener'));
check('Entity detail drawer exposes dialog title and selected section',
  entityDrawer.includes('aria-modal="true"')
  && entityDrawer.includes('aria-labelledby={title ? titleId : undefined}')
  && entityDrawer.includes('tabIndex={-1}')
  && entityDrawer.includes('aria-pressed={activeTab === tab.id}')
  && entityDrawer.includes('aria-label="Secciones del detalle"'));

check('Inventory retry errors are announced without stealing focus',
  ux.includes('className={styles.errorState} role="alert"')
  && ux.includes('<button type="button" onClick={onRetry}>Reintentar</button>'));
const purchase=read('apps/web/src/modules/procurement/ui/pages/PurchaseRequests.jsx');
check('Purchase request selection checkbox names identify each folio',
  purchase.includes('aria-label={`Seleccionar solicitud ${r.folio}`}')
  && purchase.includes('aria-label="Seleccionar todos"'));

check('Purchase request detail and form icon actions have specific accessible names',
  purchase.includes('aria-label={`Ver detalle de solicitud ${r.folio}`}')
  && purchase.includes('aria-label="Cerrar formulario de solicitud"')
  && purchase.includes('aria-label={`Quitar partida ${index + 1}`}')
  && purchase.includes('className={styles.detailButton}')
  && purchase.includes('disabled={form.items.length===1}'));

check('SmartTable supports context-specific accessible table region names',
  ux.includes('export function SmartTable({children, selectedCount=0, footer, empty, ariaLabel})')
  && ux.includes('aria-label={ariaLabel || "Tabla de datos; desliza horizontalmente para ver todas las columnas"}')
  && ux.includes('className={styles.tableScroller} tabIndex={0} role="region"')
  && uxStyles.includes('.tableScroller:focus-visible'));
const inventoryBalances=read('apps/web/src/modules/inventory/ui/pages/InventoryBalances.jsx');
check('Inventory balances expose a native keyboard detail action per row',
  inventoryBalances.includes('ariaLabel="Existencias por producto y almacén"')
  && inventoryBalances.includes('<th>Acciones</th>')
  && inventoryBalances.includes('aria-label={`Ver detalle de ${b.product?.name')
  && inventoryBalances.includes('event.stopPropagation();setSelected(b);setDrawerTab(\'summary\')')
  && inventoryBalances.includes('>Ver</Button>')
  && inventoryBalances.includes('<EntityDrawer open={Boolean(selected)}'));
const suppliers=read('apps/web/src/modules/procurement/ui/pages/Suppliers.jsx');
check('Supplier details have a native keyboard action with a specific accessible name',
  suppliers.includes('aria-label={`Ver detalle de proveedor ${item.commercialName||item.legalName}`}')
  && suppliers.includes('<Eye size={17} aria-hidden="true"/>')
  && suppliers.includes('onClick={()=>{setSelected(item);setDrawerTab(\'summary\')}}')
  && suppliers.includes('onClick={e=>e.stopPropagation()}'));

const purchaseOrders=read('apps/web/src/modules/procurement/ui/pages/PurchaseOrders.jsx');
check('Purchase order operation feedback is announced accessibly without changing module styles',
  purchaseOrders.includes('FeedbackMessage, Input}')
  && purchaseOrders.includes('<FeedbackMessage tone={message.type} className={`${styles.message} ${styles[message.type]}`}>')
  && purchaseOrders.includes('</FeedbackMessage>')
  && !purchaseOrders.includes('<div className={`${styles.message}'));

check('Purchase order detail and icon-only form actions have contextual accessible names',
  purchaseOrders.includes('aria-label={`Ver detalle de orden ${o.folio}`}')
  && purchaseOrders.includes('aria-label="Cerrar formulario de orden"')
  && purchaseOrders.includes('aria-label={`Quitar partida ${index + 1}`}')
  && purchaseOrders.includes('aria-label={`Cerrar detalle de orden ${detail.folio}`}')
  && purchaseOrders.includes('type="button" className={styles.detailButton}')
  && purchaseOrders.includes('disabled={form.items.length===1}'));

const receipts=read('apps/web/src/modules/procurement/ui/pages/GoodsReceipts.jsx');
check('Goods receipt detail has a keyboard action identified by receipt folio',
  receipts.includes('<th>Acciones</th>')
  && receipts.includes('aria-label={`Ver detalle de recepción ${r.folio}`}')
  && receipts.includes('onClick={()=>{setSelected(r);setDrawerTab(\'summary\')}}')
  && receipts.includes('onClick={event=>event.stopPropagation()}')
  && receipts.includes('<Button type="button" variant="secondary" size="sm"'));

check('Purchase request SmartTable has an informative region name',
  purchase.includes('ariaLabel="Solicitudes de compra"'));

check('UX Foundation search, filters, actions and tables handle smartphone',
  uxStyles.includes('.filterControls{width:100%}')
  && uxStyles.includes('.tableScroller{max-width:100%'));
check('Original dashboard KPI cards stay intact', read('apps/web/src/modules/core/ui/pages/Dashboard.jsx').includes('data-dashboard-kpi-grid="cards"'));
check('Contextual icon navigation stays intact', read('apps/web/src/layout/TwoLevelSidebar.jsx').includes('focusedModule'));
const appShell = read('apps/web/src/layout/AppShell.jsx');
check('Workspace tools toggles announce open/closed state accessibly',
  appShell.includes("aria-label={toolsOpen ? 'Ocultar aplicaciones y agenda' : 'Mostrar aplicaciones y agenda'} aria-expanded={toolsOpen}")
  && appShell.includes("aria-label={toolsOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'} aria-expanded={toolsOpen}")
  && appShell.includes('{toolsOpen ? <div className={styles.rightColumn}><BuzzBeeRightRail'));
check('Mobile drawer close preserves focus already in a visible field or dialog',
  appShell.includes('const focusAlreadyVisible = active && active !== document.body')
  && appShell.includes('if (!focusAlreadyVisible) {')
  && appShell.includes('target?.focus();')
  && appShell.includes('wasMobileOpenRef.current = mobileOpen;'));

check('Rail arrow keys work from the explorer footer toggle as well as the rail',
  read('apps/web/src/layout/TwoLevelSidebar.jsx').includes("railNavRef.current?.querySelectorAll('button:not(:disabled)')")
  && read('apps/web/src/layout/TwoLevelSidebar.jsx').includes('onKeyDown={handleRailKeyDown} onClick={() => {setRailTip(null); onToggle?.();}}'));


const topbar = read('apps/web/src/layout/Topbar.jsx');
check('Topbar theme action announces the target theme for both modes',
  topbar.includes("aria-label={resolvedTheme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'}")
  && topbar.includes('onClick={toggleTheme}'));
check('Topbar notifications announce unread count and expanded state',
  topbar.includes("aria-label={unread ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}")
  && topbar.includes('aria-expanded={notificationsOpen}')
  && topbar.includes("aria-controls={notificationsOpen ? 'buzzbee-notifications-popover' : undefined}")
  && topbar.includes('id="buzzbee-notifications-popover"'));
check('Topbar profile menu has an accessible name and expanded state',
  topbar.includes("aria-label={`Opciones de perfil de ${user?.fullName || 'Usuario'}`}")
  && topbar.includes('aria-expanded={profileOpen}')
  && topbar.includes("aria-controls={profileOpen ? 'buzzbee-profile-popover' : undefined}")
  && topbar.includes('id="buzzbee-profile-popover"'));

check('Topbar popovers close on Escape, return focus to their triggers and stay mutually exclusive',
  topbar.includes("if (event.key !== 'Escape' || !isOpen) return;")
  && topbar.includes('event.stopPropagation();')
  && topbar.includes('triggerRef.current?.focus();')
  && topbar.includes('ref={notificationsTriggerRef}')
  && topbar.includes('ref={profileTriggerRef}')
  && topbar.includes('handlePopoverEscape(event, notificationsOpen, setNotificationsOpen, notificationsTriggerRef)')
  && topbar.includes('handlePopoverEscape(event, profileOpen, setProfileOpen, profileTriggerRef)')
  && topbar.includes('setProfileOpen(false); setNotificationsOpen((value) => !value);')
  && topbar.includes('setNotificationsOpen(false); setProfileOpen((value) => !value);'));

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

const moduleTabBar = read('apps/web/src/layout/ModuleTabBar.jsx');
const moduleTabBarCss = read('apps/web/src/layout/ModuleTabBar.module.css');
check('Single-route modules hide an empty mobile tab row while retaining local tabs',
  moduleTabBar.includes("data-has-primary-tabs={primaryTabs.length ? 'true' : 'false'}")
  && moduleTabBar.includes('id="module-local-tabs"')
  && moduleTabBarCss.includes('.shell[data-has-primary-tabs="false"]:has(.localTabsSlot:empty){display:none}')
  && moduleTabBarCss.includes('.shell[data-has-primary-tabs="false"] .localTabsSlot:not(:empty){border-top:0}'));

check('Module primary tabs show a visible keyboard focus ring',
  moduleTabBar.includes('<NavLink')
  && moduleTabBarCss.includes('.tab:focus-visible{outline:2px solid var(--md-sys-color-primary);outline-offset:-4px;border-radius:6px}'));

const railMeter = read('apps/web/src/layout/TwoLevelSidebar.jsx');
check('Visible module ratio is a named meter with exact spoken count, including zero modules',
  railMeter.includes('role="meter" aria-label="Módulos visibles"')
  && railMeter.includes('aria-valuemax={Math.max(1, totalModuleCount)}')
  && railMeter.includes('aria-valuenow={modules.length}')
  && railMeter.includes('aria-valuetext={`${modules.length} de ${totalModuleCount} módulos mostrados`}')
  && !railMeter.includes('role="progressbar" aria-label="Módulos visibles"'));

console.log('PASS · UI Foundation 2.0 shared primitives, a11y, responsive and visual contracts');
console.log('NOTE · static audit; the PR also requires build, lint, browser and offline CI checks.');
