// Single route classification for the platform workspace.
// This is a navigation guard, not a substitute for server-side authorization.
const PLATFORM_ROUTE_PREFIXES = Object.freeze([
  '/admin-saas',
  '/platform-entry',
  '/agent-office',
]);

export function isPlatformRoute(pathname) {
  if (typeof pathname !== 'string') return false;
  return PLATFORM_ROUTE_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`));
}
