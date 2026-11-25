import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getWorkspaceOSApp} from '../apps/web/src/layout/workspace-os/workspaceOSRoutes.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('operational Workspace OS explorer has accessible list and selected detail regions', () => {
  const jsx = read('apps/web/src/layout/workspace-os/WorkspaceOSRecordExplorer.jsx');
  const css = read('apps/web/src/layout/workspace-os/WorkspaceOSRecordExplorer.module.css');
  for (const token of ['aria-label={title}', 'aria-current=', 'onSelect(record)', 'renderDetail(selectedRecord)', 'type="search"']) {
    assert.ok(jsx.includes(token), `Missing shared explorer contract: ${token}`);
  }
  assert.match(css, /min-height:44px/);
  assert.match(css, /grid-template-columns:minmax\(260px,39%\)/);
});

test('Inventory balances mounts tenant-scoped OS split view without losing classic drawer or API', () => {
  const page = read('apps/web/src/modules/inventory/ui/pages/InventoryBalances.jsx');
  const view = read('apps/web/src/modules/inventory/ui/components/InventoryOSWorkspace.jsx');
  assert.ok(page.includes("const osMode=useLocation().pathname === '/inventario/existencias'"));
  assert.ok(page.includes('if(osMode)return'));
  assert.ok(page.includes('<InventoryOSWorkspace'));
  assert.ok(page.includes('<EntityDrawer'));
  assert.ok(page.includes("apiRequest('/inventory/balances')"));
  assert.ok(page.includes('records={filtered}'));
  assert.ok(page.includes('onQueryChange={setQuery}'));
  assert.ok(page.includes("onPurchaseRequest={()=>navigate('/compras/solicitudes')}"));
  assert.ok(view.includes('<OSWorkspaceSplit mobileDetail={showMobileDetail}>'));
  assert.ok(view.includes('onClick={onPurchaseRequest}'));
  assert.ok(view.includes('setShowMobileDetail(false)'));
  assert.ok(!view.includes('apiRequest('));
});

test('Purchase Orders retains its existing form and server-backed issue/receive handlers', () => {
  const page = read('apps/web/src/modules/procurement/ui/pages/PurchaseOrders.jsx');
  const view = read('apps/web/src/modules/procurement/ui/components/PurchaseOrdersOS.jsx');
  assert.ok(page.includes("const osView=useLocation().pathname==='/compras/ordenes'"));
  assert.ok(page.includes('osView ? <PurchaseOrdersOS'));
  assert.ok(page.includes("data-os-purchase-orders={osView ? 'true' : 'false'}"));
  assert.ok(page.includes('<PurchaseOrdersMobile'));
  assert.ok(page.includes("apiRequest('/purchase-orders')"));
  assert.ok(page.includes("method:'POST'"));
  assert.ok(page.includes('{form?<div'));
  assert.ok(view.includes('onIssue(order.id)'));
  assert.ok(view.includes('onReceive(order)'));
  assert.ok(view.includes('renderDetail={order =>'));
  const shell = read('apps/web/src/layout/AppShell.jsx');
  const explorer = read('apps/web/src/layout/workspace-os/WorkspaceOSRecordExplorer.jsx');
  const explorerCss = read('apps/web/src/layout/workspace-os/WorkspaceOSRecordExplorer.module.css');
  for (const route of ['/compras/solicitudes', '/compras/ordenes', '/compras/proveedores']) {
    assert.equal(getWorkspaceOSApp(route)?.key, 'procurement', `Workspace OS window missing ${route}`);
  }
  assert.ok(shell.includes('const osRoute = getWorkspaceOSApp(location.pathname)'));
  assert.ok(shell.includes('const osWindow = osRoute ? resolveOSApplication(location.pathname) : null'));
  assert.ok(shell.includes('<OSAppWindow title={osWindow.title}'));
  assert.ok(explorer.includes("data-mobile-detail={mobileDetail ? 'true' : 'false'}"));
  assert.ok(explorer.includes('onClick={() => setMobileDetail(false)}'));
  assert.ok(explorer.includes('onClick={() => selectRecord(record)}'));
  assert.match(explorerCss, /\.explorer\[data-mobile-detail='true'\] \.list\{display:none\}/);
  assert.match(explorerCss, /\.explorer\[data-mobile-detail='true'\] \.detail\{display:flex\}/);
  assert.doesNotMatch(explorerCss, /@media\(max-width:760px\)\{\.explorer\{display:none\}\}/);
  assert.ok(!view.includes('apiRequest('));
});

test('Suppliers OS mounts shared explorer and retains tenant scoped CRUD and existing detail drawers', () => {
  const page = read('apps/web/src/modules/procurement/ui/pages/Suppliers.jsx');
  const view = read('apps/web/src/modules/procurement/ui/components/SuppliersOS.jsx');
  const css = read('apps/web/src/modules/procurement/ui/components/SuppliersOS.module.css');
  const shell = read('apps/web/src/layout/AppShell.jsx');
  assert.ok(page.includes("const osView=useLocation().pathname==='/compras/proveedores'"));
  assert.ok(page.includes('<SuppliersOS'));
  assert.ok(page.includes('<SuppliersMobile'));
  assert.ok(page.includes('data-os-suppliers={osView'));
  assert.ok(page.includes("apiRequest('/suppliers')"));
  assert.ok(page.includes("method:editing?'PUT':'POST'"));
  assert.ok(page.includes("method:'PATCH'"));
  assert.ok(page.includes("method:'DELETE'"));
  assert.ok(page.includes('await confirmAction('));
  assert.ok(page.includes('confirm:confirmAction}=useNotify()'));
  assert.ok(!page.includes('window.confirm('));
  assert.ok(page.includes('open={Boolean(selected)}'));
  assert.ok(page.includes('open={Boolean(form)}'));
  assert.ok(page.includes('id="supplier-drawer-form"'));
  assert.ok(view.includes('<WorkspaceOSRecordExplorer'));
  assert.ok(view.includes('onViewFull(supplier)'));
  assert.ok(view.includes('onEdit(supplier)'));
  assert.ok(view.includes('onToggle(supplier)'));
  assert.ok(view.includes('onRemove(supplier)'));
  assert.ok(view.includes('onOpenOrders'));
  assert.ok(view.includes('onResetFilters'));
  assert.ok(page.includes("onResetFilters={()=>{setQuery('');setOsStatus('all')}}"));
  assert.ok(view.includes('data-os-suppliers-workspace="true"'));
  assert.ok(!view.includes('apiRequest('));
  assert.match(css, /@media\(max-width:760px\)/);
  assert.equal(getWorkspaceOSApp('/compras/proveedores')?.key, 'procurement');
});
