const CACHE_NAME = 'nutri-app-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/variables.css?v=4',
  './css/layout.css?v=4',
  './css/components.css?v=4',
  './js/app.js?v=4',
  './js/state.js',
  './js/nutrition.js',
  './js/data/foods.js',
  './js/data/dishes.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});