import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Hr domain. UI must not import the global API client. */
export function hrRequest(path, options) {
  return apiRequest(path, options);
}

export function hrApiUrl(path) {
  return apiUrl(path);
}

export const hrApi = { request: hrRequest, url: hrApiUrl };
