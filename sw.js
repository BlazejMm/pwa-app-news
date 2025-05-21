const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const staticAssets = [
  '/',
  '/index.html',
  '/style.css',
  '/backend/backendScript.js',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

// Instalacja cache statycznego
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(staticAssets))
  );
});

// Fetch event: 
self.addEventListener('fetch', event => {
  const requestUrl = event.request.url;

  // Dla API (np. newsdata.io) stosuj network-first
  if (requestUrl.includes('newsdata.io')) {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        return caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => caches.match(event.request))
    );
  } else {
    // Dla pozostałych zasobów cache-first z fallback na offline.html
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).catch(() => {
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html').then(fallbackResponse => {
              return fallbackResponse || new Response('<h1>Offline</h1>', {
                status: 503,
                statusText: 'Offline',
                headers: { 'Content-Type': 'text/html' }
              });
            });
          }
        });
      })
    );
  }
});

