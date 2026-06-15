const CACHE = 'tempzen-offline-v1';
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll([
        '/', 
        'index.html', 
        'styles.css', 
        'app.js', 
        'db.js', 
        'icon-192.png', 
        'icon-512.png'
    ])));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
