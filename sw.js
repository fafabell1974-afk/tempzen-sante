/* ── Configuration du Service Worker TempZen ── */

const CACHE_NAME = 'tempzen-offline-v4'; // Incrémentez le numéro si vous modifiez des fichiers
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/db.js',
    '/icon-192.png',
    '/icon-512.png'
];

// Installation : Mise en cache des fichiers
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch : Interception des requêtes pour servir le cache hors ligne
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
