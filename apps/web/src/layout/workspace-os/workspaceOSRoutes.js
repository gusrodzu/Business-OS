// Route-to-window contract for Workspace OS. The existing React Router routes
// and domain screens remain the source of truth; this is presentation only.
const modules = Object.freeze([
  Object.freeze({key: 'sales', title: 'Ventas', prefixes: ['/ventas']}),
  Object.freeze({key: 'procurement', title: 'Compras', prefixes: ['/compras']}),
  Object.freeze({key: 'inventory', title: 'Inventario', prefixes: ['/inventario', '/almacenes']}),
]);

function matchesPath(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getWorkspaceOSApp(pathname) {
  if (typeof pathname !== 'string') return null;
  return modules.find((module) =>
    module.prefixes.some((prefix) => matchesPath(pathname, prefix)),
  ) || null;
}
