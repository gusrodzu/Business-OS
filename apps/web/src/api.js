import axios from 'axios';
import {offlineDemoRequest} from './offlineDemo';

const SESSION_KEY = 'erp-session';
const PLATFORM_RETURN_KEY = 'buzzbee-platform-return';

export function getStoredSession() {
  try {
    const platform = sessionStorage.getItem(SESSION_KEY);
    if (platform) return JSON.parse(platform);
    const regular = localStorage.getItem(SESSION_KEY);
    return regular ? JSON.parse(regular) : null;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session) {
  if (session?.platform) {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function savePlatformReturnSession(session) {
  if (!session?.platform || !session?.token) return;
  sessionStorage.setItem(PLATFORM_RETURN_KEY, JSON.stringify(session));
}

export function getPlatformReturnSession() {
  try {
    const raw = sessionStorage.getItem(PLATFORM_RETURN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    sessionStorage.removeItem(PLATFORM_RETURN_KEY);
    return null;
  }
}

export function clearPlatformReturnSession() {
  sessionStorage.removeItem(PLATFORM_RETURN_KEY);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  timeout: 10000,
  headers: {'Content-Type': 'application/json'},
});

api.interceptors.request.use((config) => {
  const token = getStoredSession()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function apiRequest(path, options = {}) {
  const activeSession = getStoredSession();
  if (activeSession?.offlineDemo) return offlineDemoRequest(path, options);
  try {
    const requestData = options.body ?? options.data;
    const headers = {...(options.headers ?? {})};
    if (requestData instanceof FormData) delete headers['Content-Type'];

    const response = await api.request({
      url: path,
      method: options.method ?? 'GET',
      data: requestData,
      params: options.params,
      signal: options.signal,
      headers,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message ?? error.message ?? 'No fue posible conectar con el servidor';
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.code = error.response?.data?.code;
    normalized.data = error.response?.data;
    throw normalized;
  }
}

export default api;
