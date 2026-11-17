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

test('Inventory balances uses OS explorer without removing Pocket UI or inventory API', () => {
  const page = read('apps/web/src/modules/inventory/ui/pages/InventoryBalances.jsx');
  const view = read('apps/web/src/modules/inventory/ui/components/InventoryBalancesOS.jsx');
  assert.ok(page.includes('if(osViewport)'));
  assert.ok(page.includes('<InventoryBalancesOS'));
  assert.ok(page.includes('<EntityDrawer'));
  assert.ok(page.includes("apiRequest('/inventory/balances')"));
  assert.ok(view.includes('records={filtered}'));
  assert.ok(view.includes('onSelect={onSelect}'));
  assert.ok(view.includes("navigate('/compras/solicitudes')"));
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
