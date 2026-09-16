import {apiRequest, apiUrl} from '../../../api';

/** Transport boundary for the Projects domain. UI must not import the global API client. */
export function projectsRequest(path, options) {
  return apiRequest(path, options);
}

export function projectsApiUrl(path) {
  return apiUrl(path);
}

export const projectsApi = { request: projectsRequest, url: projectsApiUrl };
