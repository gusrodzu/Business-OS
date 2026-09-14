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

  // API keys / explicit service-to-service Bearer credentials are not browser-cookie sessions.
  const authorization = String(request.headers.authorization || '');
  if (authorization.startsWith('Bearer bb_live_') || request.headers['x-api-key']) return next();

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
