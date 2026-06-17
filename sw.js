/* ── sw.js corrigé ── */

// 1. Incrémentez la version pour forcer le navigateur à vider l'ancien cache
const CACHE = 'tempzen-offline-v3'; 

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then(c => 
            // 2. Ajoutez 'styles.css' ici
            c.addAll(['/', 'index.html', 'app.js', 'db.js', 'styles.css'])
        )
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null))
        )
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
