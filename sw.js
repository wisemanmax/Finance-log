const CACHE_NAME = 'financelog-v3';
const STATIC_CACHE = 'financelog-static-v3';
const CDN_CACHE = 'financelog-cdn-v3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json'
];

const CDN_URLS = [
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.0/babel.min.js'
];

// Install: precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(CDN_CACHE).then((cache) =>
        Promise.allSettled(CDN_URLS.map(url =>
          cache.add(url).catch(() => console.warn('Failed to cache:', url))
        ))
      )
    ]).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_NAME, STATIC_CACHE, CDN_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !validCaches.includes(k)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Network-only for API calls (financial data must be fresh)
  if (url.pathname.startsWith('/api/') || url.hostname === 'api.ironlog.space') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET API responses for offline fallback
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback for API requests
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ error: 'offline', message: 'You are offline. Data shown may be outdated.' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Cache-first for CDN resources (versioned, immutable)
  if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('unpkg.com') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CDN_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Network failed and no cache — let the script onerror handler fire
          return new Response('', { status: 504, statusText: 'CDN unavailable' });
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for app shell
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Handle background sync for offline transactions
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
