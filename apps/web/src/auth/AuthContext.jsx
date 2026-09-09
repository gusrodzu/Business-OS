import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {
  apiRequest,
  clearPlatformReturnSession,
  clearSession,
  getPlatformReturnSession,
  getStoredSession,
  savePlatformReturnSession,
  saveSession,
} from '../api';

const AuthContext = createContext(null);
const PLATFORM_IDLE_MS = 15 * 60 * 1000;

export function AuthProvider({children}) {
  const [session, setSession] = useState(() => getStoredSession());
  const [loading, setLoading] = useState(Boolean(getStoredSession()?.token));

  useEffect(() => {
    if (!session?.token) {
      setLoading(false);
      return;
    }

    apiRequest('/auth/me')
      .then(({user, sessionKind, demoLive}) => {
        const nextSession = {
          ...session,
          user,
          platform: sessionKind === 'platform',
          demoLive: Boolean(demoLive ?? session?.demoLive),
        };
        saveSession(nextSession);
        setSession(nextSession);
      })
      .catch(() => {
        clearSession();
        clearPlatformReturnSession();
        setSession(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!session?.platform) return undefined;
    let timer;
    const expire = () => {
      clearSession();
      clearPlatformReturnSession();
      setSession(null);
      window.location.assign('/login?reason=idle');
    };
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(expire, PLATFORM_IDLE_MS);
    };
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, reset, {passive: true}));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [session?.platform]);

  function storeAuthenticatedResult(result) {
    const nextSession = {
      token: result.token,
      user: result.user ?? session?.user,
      platform: result.sessionKind === 'platform' || session?.platform === true,
      demoLive: Boolean(result.demoLive),
    };
    saveSession(nextSession);
    setSession(nextSession);
    return nextSession.user;
  }

  async function login(credentials) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    if (result.token) storeAuthenticatedResult(result);
    return result;
  }

  async function confirmMfa({challengeToken, code}) {
    const result = await apiRequest('/auth/mfa/confirm', {method: 'POST', body: {challengeToken, code}});
    storeAuthenticatedResult(result);
    return result;
  }

  async function verifyMfa({challengeToken, code}) {
    const result = await apiRequest('/auth/mfa/verify', {method: 'POST', body: {challengeToken, code}});
    storeAuthenticatedResult(result);
    return result;
  }

  async function reauth({password, code}) {
    const result = await apiRequest('/auth/reauth', {method: 'POST', body: {password, code}});
    storeAuthenticatedResult({...result, user: session?.user, sessionKind: 'platform'});
    return result;
  }

  async function enterDemoLive() {
    if (!session?.platform) throw new Error('Demo LIVE sólo está disponible para Super Admin');
    const platformSession = {...session, demoLive: false};
    const result = await apiRequest('/platform-admin/demo-live/session', {method: 'POST'});
    savePlatformReturnSession(platformSession);
    const nextSession = {
      token: result.token,
      user: result.user,
      platform: false,
      demoLive: true,
    };
    saveSession(nextSession);
    setSession(nextSession);
    return result;
  }

  async function exitDemoLive() {
    const platformSession = getPlatformReturnSession();
    if (!platformSession?.token || !platformSession?.platform) {
      clearSession();
      clearPlatformReturnSession();
      setSession(null);
      throw new Error('La sesión Super Admin original ya no está disponible. Inicia sesión nuevamente.');
    }
    clearSession();
    saveSession(platformSession);
    clearPlatformReturnSession();
    setSession(platformSession);
    return platformSession;
  }

  async function logout() {
    try {
      await apiRequest('/auth/logout', {method: 'POST'});
    } catch {
      // Siempre eliminamos la sesión local.
    }
    clearSession();
    clearPlatformReturnSession();
    setSession(null);
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      authenticated: Boolean(session?.token),
      platformSession: Boolean(session?.platform),
      demoLive: Boolean(session?.demoLive),
      loading,
      login,
      confirmMfa,
      verifyMfa,
      reauth,
      enterDemoLive,
      exitDemoLive,
      logout,
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
