export const PROCUREMENT_MODULE_ID = 'procurement';

export const procurementPermissions = Object.freeze({
  dashboard: 'purchases.read',
  supplierRead: 'suppliers.read',
  supplierManage: 'suppliers.manage',
  requestRead: 'purchase_requests.read',
  requestCreate: 'purchase_requests.create',
  requestApprove: 'purchase_requests.approve',
  orderRead: 'purchase_orders.read',
  orderCreate: 'purchase_orders.create',
  orderApprove: 'purchase_orders.approve',
  receiptRead: 'receipts.read',
  receiptCreate: 'receipts.create',
  warehouseRead: 'warehouses.read',
  warehouseManage: 'warehouses.manage',
});

export const procurementApiPaths = Object.freeze({
  warehouses: '/api/warehouses',
  suppliers: '/api/suppliers',
  requests: '/api/purchase-requests',
  dashboard: '/api/procurement',
  orders: '/api/purchase-orders',
  receipts: '/api/receipts',
});
