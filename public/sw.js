var SW_VERSION = 'financelog-v5';
var CACHE_NAME = SW_VERSION;

// Vite build output uses hashed filenames. We pre-cache only static assets that
// never change. The HTML shell is fetched network-first so a new deploy is
// picked up immediately — a cached HTML that points at a hashed JS bundle which
// no longer exists on the server would otherwise cause a blank page.
var APP_FILES = ['./icon.svg', './manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(c) { return Promise.all(APP_FILES.map(function(f) { return c.add(f).catch(function() {}); })); })
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
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503, headers: { 'Content-Type': 'application/json' }
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

  // Network-first for HTML navigations so new deploys are picked up. A stale
  // cached index.html would reference a hashed JS bundle that no longer exists.
  var isNavigation = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').indexOf('text/html') !== -1;
  if (isNavigation) {
    e.respondWith(
      fetch(req).then(function(res) {
        if (res && res.ok) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(req, clone); });
        }
        return res;
      }).catch(function() {
        return caches.match(req).then(function(cached) {
          return cached || caches.match('./index.html') || caches.match('./');
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for hashed JS/CSS and other assets
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
