import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

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
  assert.ok(page.includes('osViewport ? <PurchaseOrdersOS'));
  assert.ok(page.includes('<PurchaseOrdersMobile'));
  assert.ok(page.includes("apiRequest('/purchase-orders')"));
  assert.ok(page.includes("method:'POST'"));
  assert.ok(page.includes('{form?<div'));
  assert.ok(view.includes('onIssue(order.id)'));
  assert.ok(view.includes('onReceive(order)'));
  assert.ok(view.includes('renderDetail={order =>'));
  assert.ok(!view.includes('apiRequest('));
});
