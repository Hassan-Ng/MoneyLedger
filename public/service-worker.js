
const CACHE_NAME = 'sparkpair-cache-v1';
const ASSETS = ['/', '/index.html', '/favicon.ico', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});