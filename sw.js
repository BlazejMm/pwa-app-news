const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const staticAssets = [
  '/',
  '/index.html',
  '/style.css',
  '/backend/backendScript.js',
  '/icon/icon-192.png',
  '/icon/icon-512.png',
  '/manifest.json',
  '/favicon.ico'
];
self.addEventListener('fetch', event => {
  if (event.request.url.includes('newsdata.io')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return new Response('<h1>Offline</h1><p>Brak połączenia z internetem.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        }
      });
    })
  );
});
