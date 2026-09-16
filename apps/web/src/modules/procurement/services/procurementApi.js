import {apiRequest} from '../../../api';

/** Transport boundary for the Procurement domain. UI must not import the global API client. */
export function procurementRequest(path, options) {
  return apiRequest(path, options);
}

export const procurementApi = {
  center: () => procurementRequest('/procurement/center'),
  requests: () => procurementRequest('/purchase-requests'),
  orders: () => procurementRequest('/purchase-orders'),
  receipts: () => procurementRequest('/receipts'),
  suppliers: () => procurementRequest('/suppliers'),
};
