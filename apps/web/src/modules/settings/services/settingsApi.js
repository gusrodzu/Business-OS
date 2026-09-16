import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Settings domain. UI must not import the global API client. */
export function settingsRequest(path, options) {
  return apiRequest(path, options);
}

export function settingsApiUrl(path) {
  return apiUrl(path);
}

export const settingsApi = { request: settingsRequest, url: settingsApiUrl };
