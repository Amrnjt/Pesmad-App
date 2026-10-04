const CACHE_NAME = 'pesmad-app-shell-v1';
const OFFLINE_URL = '/offline.html';
const PROTECTED_PATHS = ['/api/auth/', '/api/dashboard', '/api/admin/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isProtectedApi(pathname) {
  return PROTECTED_PATHS.some((path) =>
    path.endsWith('/') ? pathname.startsWith(path) : pathname === path,
  );
}

async function networkOnly(request) {
  return fetch(request, { cache: 'no-store' });
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && request.method === 'GET') {
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNavigation(request) {
  try {
    return await fetch(request, { cache: 'no-store' });
  } catch {
    const fallback = await caches.match(OFFLINE_URL);
    return fallback || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  if (isProtectedApi(url.pathname)) {
    event.respondWith(networkOnly(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    url.pathname.startsWith('/_next/static/') ||
    ['script', 'style', 'font', 'image'].includes(request.destination)
  ) {
    event.respondWith(cacheFirst(request));
  }
});
