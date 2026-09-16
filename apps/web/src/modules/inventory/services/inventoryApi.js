import {apiRequest} from '../../../api';

/** Transport boundary for the Inventory domain. UI must not import the global API client. */
export function inventoryRequest(path, options) {
  return apiRequest(path, options);
}

export const inventoryApi = {
  products: () => inventoryRequest('/products'),
  warehouses: () => inventoryRequest('/warehouses'),
  balances: () => inventoryRequest('/inventory/balances'),
  movements: () => inventoryRequest('/inventory/movements'),
  operations: () => inventoryRequest('/inventory-operations'),
};
