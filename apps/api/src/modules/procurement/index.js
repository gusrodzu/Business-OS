import warehousesRouter from './api/warehouses.router.js';
import suppliersRouter from './api/suppliers.router.js';
import purchaseRequestsRouter from './api/purchaseRequests.router.js';
import procurementRouter from './api/procurement.router.js';
import purchaseOrdersRouter from './api/purchaseOrders.router.js';
import receiptsRouter from './api/receipts.router.js';
import {PROCUREMENT_MODULE_ID, procurementApiPaths} from './domain/contracts.js';

export default {
  id: PROCUREMENT_MODULE_ID,
  routes: [
    {path: procurementApiPaths.warehouses, router: warehousesRouter},
    {path: procurementApiPaths.suppliers, router: suppliersRouter},
    {path: procurementApiPaths.requests, router: purchaseRequestsRouter},
    {path: procurementApiPaths.dashboard, router: procurementRouter},
    {path: procurementApiPaths.orders, router: purchaseOrdersRouter},
    {path: procurementApiPaths.receipts, router: receiptsRouter},
  ],
};
