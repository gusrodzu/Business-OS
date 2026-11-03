// Navigation presentation only. Authorization remains enforced by the router and API.
export function getDashboardRoleActions(roleName = 'Colaborador') {
  const roleKey = roleName.toLowerCase();
  return roleKey.includes('venta')
    ? [{label:'Nueva venta',to:'/ventas'},{label:'Clientes',to:'/terceros'},{label:'Cobranza',to:'/ventas/cobranza'}]
    : roleKey.includes('finanz') || roleKey.includes('contab')
      ? [{label:'Tesorería',to:'/finanzas/tesoreria'},{label:'Cuentas por cobrar',to:'/finanzas/cuentas-por-cobrar'},{label:'Flujo de efectivo',to:'/finanzas/flujo-efectivo'}]
      : roleKey.includes('recursos') || roleKey.includes('rrhh')
        ? [{label:'Empleados',to:'/recursos-humanos'},{label:'Incidencias',to:'/recursos-humanos/operacion'},{label:'Prenómina',to:'/recursos-humanos/prenomina'}]
        : [{label:'Centro de tareas',to:'/tareas'},{label:'Compras',to:'/compras'},{label:'Reportes',to:'/reportes'}];
}
