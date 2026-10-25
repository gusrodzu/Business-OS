/* Business OS — cache only public application shell; never cache ERP/API responses. */
const SHELL_CACHE = 'business-os-shell-v1';
const ASSETS_CACHE = 'business-os-assets-v1';
const PREFIX = 'business-os-';
const SHELL_FILES = ['/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys
      .filter((key) => key.startsWith(PREFIX) && ![SHELL_CACHE, ASSETS_CACHE].includes(key))
      .map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', response.clone()));
        }
        return response;
      }).catch(async () => (await caches.match('/index.html')) || Response.error()),
    );
    return;
  }
  // Vite hashes CSS and JS in /assets/. Only those immutable public bundles are cached.
  if (!url.pathname.startsWith('/assets/') || !/\.(?:js|css)$/.test(url.pathname)) return;
  event.respondWith(caches.open(ASSETS_CACHE).then(async (cache) => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
    return response;
  }));
});
