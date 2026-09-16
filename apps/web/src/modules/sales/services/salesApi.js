import {apiRequest} from '../../../api';

/**
 * Transport boundary for the Sales domain.
 * UI components must use this adapter instead of importing the global API client.
 * This keeps LIVE/OFFLINE transport changes outside the presentation layer.
 */
export function salesRequest(path, options) {
  return apiRequest(path, options);
}

export const salesApi = {
  dashboard: () => salesRequest('/sales-enterprise/dashboard'),
  sales: () => salesRequest('/sales'),
  returns: () => salesRequest('/sales-returns'),
  collections: () => salesRequest('/collections'),
};
