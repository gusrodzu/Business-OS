import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Crm domain. UI must not import the global API client. */
export function crmRequest(path, options) {
  return apiRequest(path, options);
}

export function crmApiUrl(path) {
  return apiUrl(path);
}

export const crmApi = { request: crmRequest, url: crmApiUrl };
