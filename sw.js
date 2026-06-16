const CACHE = 'tempzen-offline-v2'; // CHANGEMENT ICI (v1 -> v2)

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

// Ajout d'une étape pour supprimer l'ancien cache lors de l'activation
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
