import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Finance domain. UI must not import the global API client. */
export function financeRequest(path, options) {
  return apiRequest(path, options);
}

export function financeApiUrl(path) {
  return apiUrl(path);
}

export const financeApi = { request: financeRequest, url: financeApiUrl };
