/**
 * sw.js — Service worker SIN caché.
 * Su única función es sustituir a versiones anteriores que cacheaban archivos
 * (y podían servir CSS/JS antiguos) y permitir instalar la app como PWA.
 */
// Cambiar VERSION fuerza a los navegadores a instalar este SW nuevo.
const VERSION = 'nutri-app-v15';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).catch(() => fetch(e.request)));
});
