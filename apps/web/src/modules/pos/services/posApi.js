import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Pos domain. UI must not import the global API client. */
export function posRequest(path, options) {
  return apiRequest(path, options);
}

export function posApiUrl(path) {
  return apiUrl(path);
}

export const posApi = { request: posRequest, url: posApiUrl };
