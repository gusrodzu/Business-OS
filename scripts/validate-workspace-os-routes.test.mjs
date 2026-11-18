import assert from 'node:assert/strict';
import test from 'node:test';
import {getWorkspaceOSApp} from '../apps/web/src/layout/workspace-os/workspaceOSRoutes.js';

test('All business families use the universal OS window route contract', () => {
  const cases = [
    ['/ventas', 'sales'], ['/ventas/cobranza', 'sales'],
    ['/compras', 'procurement'], ['/compras/solicitudes', 'procurement'],
    ['/compras/ordenes/123', 'procurement'], ['/compras/proveedores', 'procurement'],
    ['/inventario/productos', 'inventory'], ['/inventario/existencias', 'inventory'],
    ['/inventario/operaciones', 'inventory'], ['/almacenes', 'inventory'],
    ['/finanzas/cuentas-por-pagar', 'finance'], ['/finanzas/tesoreria', 'finance'],
    ['/gastos', 'finance'], ['/activos-fijos', 'finance'],
    ['/facturacion-fiscal', 'billing'], ['/recursos-humanos/prenomina', 'hr'],
    ['/crm', 'crm'], ['/terceros', 'crm'], ['/marketing', 'marketing'],
    ['/pos', 'pos'], ['/proyectos', 'projects'], ['/produccion', 'production'],
    ['/reportes', 'reports'], ['/inteligencia', 'reports'],
    ['/configuracion', 'settings'], ['/configuracion/modulos', 'settings'],
    ['/perfil', 'settings'], ['/preferencias', 'settings'], ['/ayuda', 'settings'],
    ['/administracion', 'administration'], ['/tareas', 'operations'],
    ['/flow', 'operations'], ['/data-hub', 'operations'], ['/integration-hub', 'operations'],
    ['/agenda', 'agenda'], ['/demo/empresas', 'demo'],
  ];
  for (const [path,expected] of cases) {
    const app=getWorkspaceOSApp(path);
    assert.equal(app?.key,expected,path);
    assert.ok(app?.title, 'Window title missing at '+path);
  }
});

test('Module window keys cannot leak between sibling prefixes', () => {
  for(const path of ['/ventas-extra','/compras-extra','/inventariomas','/almacenes-extra']){
    assert.equal(getWorkspaceOSApp(path)?.key,'application',path);
  }
});

test('Desktop home and invalid paths do not open an OS application window', () => {
  for(const path of ['/', '', '//remote', null, undefined]){
    assert.equal(getWorkspaceOSApp(path),null,String(path));
  }
});
