const CACHE_NAME = 'nutri-app-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/variables.css',
  './css/layout.css',
  './css/components.css',
  './js/app.js',
  './js/state.js',
  './js/nutrition.js',
  './js/data/foods.js',
  './js/data/dishes.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});