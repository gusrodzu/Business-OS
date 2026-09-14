const ERP_COOKIE = 'bb_erp_session';
const PLATFORM_COOKIE = 'bb_platform_session';

function boolFromEnv(value, fallback) {
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function sameSiteValue() {
  const raw = String(process.env.COOKIE_SAME_SITE || 'lax').trim().toLowerCase();
  if (raw === 'strict') return 'Strict';
  if (raw === 'none') return 'None';
  return 'Lax';
}

function cookieSettings(maxAgeSeconds) {
  const production = process.env.NODE_ENV === 'production';
  const secure = boolFromEnv(process.env.COOKIE_SECURE, production);
  const sameSite = sameSiteValue();
  if (sameSite === 'None' && !secure) {
    throw new Error('COOKIE_SAME_SITE=None requiere COOKIE_SECURE=true');
  }
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/api',
    domain: String(process.env.COOKIE_DOMAIN || '').trim() || null,
    maxAgeSeconds,
  };
}

function serializeCookie(name, value, settings) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${settings.path}`, `SameSite=${settings.sameSite}`];
  if (settings.httpOnly) parts.push('HttpOnly');
  if (settings.secure) parts.push('Secure');
  if (settings.domain) parts.push(`Domain=${settings.domain}`);
  if (Number.isFinite(settings.maxAgeSeconds)) parts.push(`Max-Age=${Math.max(0, Math.floor(settings.maxAgeSeconds))}`);
  return parts.join('; ');
}

function appendSetCookie(response, cookie) {
  const previous = response.getHeader('Set-Cookie');
  if (!previous) response.setHeader('Set-Cookie', cookie);
  else if (Array.isArray(previous)) response.setHeader('Set-Cookie', [...previous, cookie]);
  else response.setHeader('Set-Cookie', [previous, cookie]);
}

export function parseCookies(request) {
  const header = String(request.headers.cookie || '');
  const result = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) continue;
    try { result[key] = decodeURIComponent(value); } catch { result[key] = value; }
  }
  return result;
}

export function getSessionCookie(request, kind) {
  const cookies = parseCookies(request);
  return cookies[kind === 'platform' ? PLATFORM_COOKIE : ERP_COOKIE] || null;
}

export function hasSessionCookie(request) {
  const cookies = parseCookies(request);
  return Boolean(cookies[ERP_COOKIE] || cookies[PLATFORM_COOKIE]);
}

export function setSessionCookie(response, kind, token, {maxAgeSeconds} = {}) {
  const defaultAge = kind === 'platform' ? 45 * 60 : 8 * 60 * 60;
  const name = kind === 'platform' ? PLATFORM_COOKIE : ERP_COOKIE;
  appendSetCookie(response, serializeCookie(name, token, cookieSettings(maxAgeSeconds ?? defaultAge)));
}

export function clearSessionCookie(response, kind) {
  const name = kind === 'platform' ? PLATFORM_COOKIE : ERP_COOKIE;
  appendSetCookie(response, serializeCookie(name, '', cookieSettings(0)));
}

export function clearAllSessionCookies(response) {
  clearSessionCookie(response, 'erp');
  clearSessionCookie(response, 'platform');
}

export const SESSION_COOKIE_NAMES = Object.freeze({erp: ERP_COOKIE, platform: PLATFORM_COOKIE});
