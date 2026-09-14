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
  const safeSession = session ? {...session} : null;
  if (safeSession) delete safeSession.token;
  if (safeSession?.platform) {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeSession));
  } else if (safeSession) {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeSession));
  }
  try {
    window.dispatchEvent(new CustomEvent('buzzbee-session-updated', {detail: safeSession}));
  } catch {
    // La sesión sigue siendo válida aunque el navegador no permita CustomEvent.
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function savePlatformReturnSession(session) {
  if (!session?.platform || !session?.authenticated) return;
  const safe = {...session};
  delete safe.token;
  sessionStorage.setItem(PLATFORM_RETURN_KEY, JSON.stringify(safe));
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
  withCredentials: true,
  headers: {'Content-Type': 'application/json'},
});

api.interceptors.request.use((config) => {
  const session = getStoredSession();
  if (session?.offlineDemo) {
    const error = new Error('Demo Offline: acceso de red bloqueado por contrato');
    error.code = 'OFFLINE_NETWORK_BLOCKED';
    return Promise.reject(error);
  }
  if (!config.headers['X-BuzzBee-Session']) {
    config.headers['X-BuzzBee-Session'] = session?.platform ? 'platform' : 'erp';
  }
  return config;
});

export function apiUrl(path = '') {
  const base = String(api.defaults.baseURL || '').replace(/\/$/, '');
  const suffix = String(path || '').startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function apiRequest(path, options = {}) {
  const activeSession = getStoredSession();
  if (activeSession?.offlineDemo) return offlineDemoRequest(path, options);
  try {
    const requestData = options.body ?? options.data;
    const headers = {...(options.headers ?? {})};
    if (requestData instanceof FormData) delete headers['Content-Type'];
    if (options.sessionContext) headers['X-BuzzBee-Session'] = options.sessionContext;

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
