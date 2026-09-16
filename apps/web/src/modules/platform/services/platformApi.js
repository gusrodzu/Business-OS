import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Platform domain. UI must not import the global API client. */
export function platformRequest(path, options) {
  return apiRequest(path, options);
}

export function platformApiUrl(path) {
  return apiUrl(path);
}

export const platformApi = { request: platformRequest, url: platformApiUrl };
