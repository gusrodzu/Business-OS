import {lazy} from 'react';
const AdministrativeCenter=lazy(()=>import('./ui/pages/AdministrativeCenter'));
const AccountsPayable=lazy(()=>import('./ui/pages/AccountsPayable'));
const AccountsReceivable=lazy(()=>import('./ui/pages/AccountsReceivable'));
const Treasury=lazy(()=>import('./ui/pages/Treasury'));
const Budgets=lazy(()=>import('./ui/pages/Budgets'));
const BankReconciliation=lazy(()=>import('./ui/pages/BankReconciliation'));
const CashFlow=lazy(()=>import('./ui/pages/CashFlow'));
const Accounting=lazy(()=>import('./ui/pages/Accounting'));
const Expenses=lazy(()=>import('./ui/pages/Expenses'));
const FixedAssets=lazy(()=>import('./ui/pages/FixedAssets'));
const Fiscal=lazy(()=>import('./ui/pages/Fiscal'));

export const financeRoutes = [
  {id: 'finance:administracion', path: 'administracion', Component: AdministrativeCenter},
  {id: 'finance:finanzas/cuentas-por-pagar', path: 'finanzas/cuentas-por-pagar', Component: AccountsPayable},
  {id: 'finance:finanzas/cuentas-por-cobrar', path: 'finanzas/cuentas-por-cobrar', Component: AccountsReceivable},
  {id: 'finance:finanzas/tesoreria', path: 'finanzas/tesoreria', Component: Treasury},
  {id: 'finance:finanzas/presupuestos', path: 'finanzas/presupuestos', Component: Budgets},
  {id: 'finance:finanzas/conciliacion-bancaria', path: 'finanzas/conciliacion-bancaria', Component: BankReconciliation},
  {id: 'finance:finanzas/flujo-efectivo', path: 'finanzas/flujo-efectivo', Component: CashFlow},
  {id: 'finance:finanzas/contabilidad', path: 'finanzas/contabilidad', Component: Accounting},
  {id: 'finance:gastos', path: 'gastos', Component: Expenses},
  {id: 'finance:activos-fijos', path: 'activos-fijos', Component: FixedAssets},
  {id: 'finance:facturacion-fiscal', path: 'facturacion-fiscal', Component: Fiscal},
];
