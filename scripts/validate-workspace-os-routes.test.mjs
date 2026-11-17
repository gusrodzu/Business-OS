import assert from 'node:assert/strict';
import test from 'node:test';
import {getWorkspaceOSApp} from '../apps/web/src/layout/workspace-os/workspaceOSRoutes.js';

test('Workspace OS uses the shared window for real sales, purchases and inventory routes', () => {
  const cases = [
    ['/ventas', 'sales'],
    ['/ventas/cobranza', 'sales'],
    ['/compras', 'procurement'],
    ['/compras/solicitudes', 'procurement'],
    ['/compras/ordenes/123', 'procurement'],
    ['/inventario/productos', 'inventory'],
    ['/inventario/existencias', 'inventory'],
    ['/inventario/operaciones', 'inventory'],
    ['/almacenes', 'inventory'],
    ['/almacenes/123', 'inventory'],
  ];
  for (const [path, expected] of cases) {
    assert.equal(getWorkspaceOSApp(path)?.key, expected, path);
  }
});

test('Workspace OS does not take over unrelated or ambiguous paths', () => {
  const legacy = ['/', '/crm', '/pos', '/reportes', '/configuracion',
    '/ventas-extra', '/compras-extra', '/inventariomas', '/almacenes-extra', ''];
  for (const path of legacy) assert.equal(getWorkspaceOSApp(path), null, path);
  assert.equal(getWorkspaceOSApp(null), null);
});
