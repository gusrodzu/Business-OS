// Only sensitive platform control-plane pages require platform context.
// Agent Office is a separate authenticated, read-only public-GitHub monitor.
// This is a navigation guard, not a substitute for server-side authorization.
const PLATFORM_ROUTE_PREFIXES = Object.freeze([
  '/admin-saas',
  '/platform-entry',
]);

export function isPlatformRoute(pathname) {
  if (typeof pathname !== 'string') return false;
  return PLATFORM_ROUTE_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`));
}
