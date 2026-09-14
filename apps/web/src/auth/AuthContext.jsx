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
import {OFFLINE_DEMO_EMAIL, OFFLINE_DEMO_PASSWORD, getOfflineDemoUser} from '../offlineDemo';

const AuthContext = createContext(null);
const PLATFORM_IDLE_MS = 15 * 60 * 1000;

export function AuthProvider({children}) {
  const [session, setSession] = useState(() => getStoredSession());
  const [loading, setLoading] = useState(() => Boolean(getStoredSession()?.authenticated && !getStoredSession()?.offlineDemo));

  useEffect(() => {
    if (!session?.authenticated) {
      setLoading(false);
      return;
    }
    if (session?.offlineDemo) {
      setLoading(false);
      return;
    }

    apiRequest('/auth/me')
      .then(({user, sessionKind, demoLive}) => {
        const nextSession = {
          ...session,
          authenticated: true,
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
      authenticated: Boolean(result.authenticated ?? result.user ?? true),
      user: result.user ?? session?.user,
      platform: result.sessionKind === 'platform' || (result.sessionKind == null && session?.platform === true),
      demoLive: Boolean(result.demoLive ?? session?.demoLive),
      offlineDemo: Boolean(result.offlineDemo),
    };
    saveSession(nextSession);
    setSession(nextSession);
    return nextSession.user;
  }

  async function login(credentials) {
    const normalizedEmail = String(credentials?.email || '').trim().toLowerCase();
    if (normalizedEmail === OFFLINE_DEMO_EMAIL && credentials?.password === OFFLINE_DEMO_PASSWORD) {
      const result = {
        ok: true,
        authenticated: true,
        user: getOfflineDemoUser(),
        sessionKind: 'erp',
        offlineDemo: true,
      };
      storeAuthenticatedResult(result);
      return result;
    }
    const result = await apiRequest('/auth/login', {method: 'POST', body: credentials});
    if (result.authenticated) storeAuthenticatedResult(result);
    return result;
  }

  async function confirmMfa({challengeToken, code}) {
    const result = await apiRequest('/auth/mfa/confirm', {method: 'POST', body: {challengeToken, code}, sessionContext: 'platform'});
    storeAuthenticatedResult(result);
    return result;
  }

  async function verifyMfa({challengeToken, code}) {
    const result = await apiRequest('/auth/mfa/verify', {method: 'POST', body: {challengeToken, code}, sessionContext: 'platform'});
    storeAuthenticatedResult(result);
    return result;
  }

  async function reauth({password, code}) {
    const result = await apiRequest('/auth/reauth', {method: 'POST', body: {password, code}, sessionContext: 'platform'});
    storeAuthenticatedResult({...result, authenticated: true, user: session?.user, sessionKind: 'platform'});
    return result;
  }

  async function enterDemoLive() {
    if (!session?.platform) throw new Error('Demo LIVE sólo está disponible para Super Admin');
    const platformSession = {...session, demoLive: false, authenticated: true, platform: true};
    savePlatformReturnSession(platformSession);
    const result = await apiRequest('/platform-admin/demo-live/session', {method: 'POST', sessionContext: 'platform'});
    const nextSession = {
      authenticated: true,
      user: result.user,
      platform: false,
      demoLive: true,
      offlineDemo: false,
    };
    saveSession(nextSession);
    setSession(nextSession);
    return result;
  }

  async function exitDemoLive() {
    let platformSession = getPlatformReturnSession();
    await apiRequest('/platform-admin/demo-live/exit', {method: 'POST', sessionContext: 'platform'});
    if (!platformSession?.authenticated || !platformSession?.platform) {
      const result = await apiRequest('/auth/me', {sessionContext: 'platform'});
      platformSession = {
        authenticated: true,
        user: result.user,
        platform: true,
        demoLive: false,
        offlineDemo: false,
      };
    }
    clearSession();
    saveSession(platformSession);
    clearPlatformReturnSession();
    setSession(platformSession);
    return platformSession;
  }

  async function refreshUser(providedUser = null) {
    let nextUser = providedUser;
    if (!nextUser) {
      const result = await apiRequest('/auth/me', session?.platform ? {sessionContext: 'platform'} : {});
      nextUser = result.user;
    }
    const nextSession = {...session, authenticated: true, user: nextUser};
    saveSession(nextSession);
    setSession(nextSession);
    return nextUser;
  }

  async function logout() {
    try {
      if (!session?.offlineDemo) await apiRequest('/auth/logout', {method: 'POST'});
    } catch {
      // El estado local se limpia incluso si la API ya no está disponible.
    }
    clearSession();
    clearPlatformReturnSession();
    setSession(null);
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      authenticated: Boolean(session?.authenticated),
      platformSession: Boolean(session?.platform),
      demoLive: Boolean(session?.demoLive),
      offlineDemo: Boolean(session?.offlineDemo),
      loading,
      login,
      confirmMfa,
      verifyMfa,
      reauth,
      enterDemoLive,
      exitDemoLive,
      refreshUser,
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
