import {hasSessionCookie} from '../lib/sessionCookies.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function allowedOrigins() {
  return new Set(
    String(process.env.CLIENT_URL ?? 'http://localhost:5173')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export function cookieCsrfOriginGuard(request, response, next) {
  if (SAFE_METHODS.has(request.method) || !hasSessionCookie(request)) return next();

  // When a session cookie is present, every state-changing request needs a
  // trusted Origin. An unverified Authorization / x-api-key header must never
  // suppress CSRF checks for a cookie-authenticated session.
  // Cookie-free service-to-service requests are handled by the early return.

  const origin = String(request.headers.origin || '').trim();
  if (!origin || !allowedOrigins().has(origin)) {
    return response.status(403).json({
      ok: false,
      code: 'CSRF_ORIGIN_DENIED',
      message: 'Origen no permitido para una operación autenticada.',
      requestId: request.id || null,
    });
  }
  return next();
}
