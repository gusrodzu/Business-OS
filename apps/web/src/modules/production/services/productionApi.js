import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Production domain. UI must not import the global API client. */
export function productionRequest(path, options) {
  return apiRequest(path, options);
}

export function productionApiUrl(path) {
  return apiUrl(path);
}

export const productionApi = { request: productionRequest, url: productionApiUrl };
