import {lazy} from 'react';
const SalesEnterprise=lazy(()=>import('./ui/pages/SalesEnterprise'));
const OrderToCash=lazy(()=>import('./ui/pages/OrderToCash'));
const SalesFulfillment=lazy(()=>import('./ui/pages/SalesFulfillment'));
const SalesReturns=lazy(()=>import('./ui/pages/SalesReturns'));
const Collections=lazy(()=>import('./ui/pages/Collections'));

export const salesRoutes = [
  {id: 'sales:ventas', path: 'ventas', Component: SalesEnterprise},
  {id: 'sales:ventas/order-to-cash', path: 'ventas/order-to-cash', Component: OrderToCash},
  {id: 'sales:ventas/operacion', path: 'ventas/operacion', Component: SalesFulfillment},
  {id: 'sales:ventas/devoluciones', path: 'ventas/devoluciones', Component: SalesReturns},
  {id: 'sales:ventas/cobranza', path: 'ventas/cobranza', Component: Collections},
];
