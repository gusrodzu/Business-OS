import {lazy} from 'react';

const ProcurementCenter = lazy(() => import('./ui/pages/ProcurementCenter'));
const PurchaseRequests = lazy(() => import('./ui/pages/PurchaseRequests'));
const PurchaseOrders = lazy(() => import('./ui/pages/PurchaseOrders'));
const GoodsReceipts = lazy(() => import('./ui/pages/GoodsReceipts'));
const Suppliers = lazy(() => import('./ui/pages/Suppliers'));
const ModulePlaceholder = lazy(() => import('../shared/ui/ModulePlaceholder'));

export const procurementRoutes = [
  {id: 'procurement:compras', path: 'compras', Component: ProcurementCenter},
  {id: 'procurement:compras/solicitudes', path: 'compras/solicitudes', Component: PurchaseRequests},
  {id: 'procurement:compras/ordenes', path: 'compras/ordenes', Component: PurchaseOrders},
  {id: 'procurement:compras/recepciones', path: 'compras/recepciones', Component: GoodsReceipts},
  {id: 'procurement:compras/proveedores', path: 'compras/proveedores', Component: Suppliers},
  {id: 'procurement:compras/*', path: 'compras/*', Component: ModulePlaceholder},
];
