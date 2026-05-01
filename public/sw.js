const CACHE_NAME = 'katmut-betmut-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/katmut.png',
  '/images/betmut.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
