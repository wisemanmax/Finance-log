var SW_VERSION = 'financelog-v4';
var CACHE_NAME = SW_VERSION;
var OFFLINE_PAGE = './offline.html';

// Vite build output uses hashed filenames — we cache the app shell and let
// stale-while-revalidate handle the hashed JS/CSS assets on first fetch.
var APP_FILES = ['./', './index.html', './icon.svg', './manifest.json'];
var CDN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days for CDN assets

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(c) { return c.addAll(APP_FILES); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  var url = new URL(req.url);

  if (req.method !== 'GET') return;

  // Network-only for API calls
  if (url.pathname.startsWith('/api/') || url.hostname === 'api.ironlog.space') {
    e.respondWith(
      fetch(req).catch(function() {
        return caches.match(req).then(function(cached) {
          return cached || new Response(JSON.stringify({ error: 'offline' }), {
            status: 503, headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // Cache-first for CDN resources (fonts, etc.)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(req).then(function(cached) {
        if (cached) return cached;
        return fetch(req).then(function(res) {
          if (res.ok) {
            var clone = res.clone();
            caches.open(CACHE_NAME).then(function(c) { c.put(req, clone); });
          }
          return res;
        }).catch(function() { return new Response('', { status: 504 }); });
      })
    );
    return;
  }

  // Stale-while-revalidate for app shell + Vite hashed assets
  e.respondWith(
    caches.match(req).then(function(cached) {
      var fetchPromise = fetch(req).then(function(res) {
        if (res && res.ok) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(req, clone); });
        }
        return res;
      }).catch(function() { return cached; });

      return cached || fetchPromise;
    })
  );
});

// Accept SKIP_WAITING message from the app
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
