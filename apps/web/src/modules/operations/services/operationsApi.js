import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Operations domain. UI must not import the global API client. */
export function operationsRequest(path, options) {
  return apiRequest(path, options);
}

export function operationsApiUrl(path) {
  return apiUrl(path);
}

export const operationsApi = { request: operationsRequest, url: operationsApiUrl };
