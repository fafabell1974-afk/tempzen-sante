/* ── TempZen Santé — Service Worker ── */

const CACHE_NAME = 'tempzen-v1';
const OFFLINE_URL = 'index.html';

// Liste des ressources à mettre en cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/db.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// URLs à ne pas mettre en cache (API, etc.)
const EXCLUDED_URLS = [
  'chrome-extension://',
  'http://localhost',
  'https://fonts.googleapis.com'
];

/* ── INSTALLATION ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert, ajout des ressources...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\'installation:', error);
      })
  );
});

/* ── ACTIVATION ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim();
      })
  );
});

/* ── INTERCEPTION DES REQUÊTES ── */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorer les requêtes vers des extensions ou des URLs exclues
  if (EXCLUDED_URLS.some(excluded => url.href.includes(excluded))) {
    return;
  }

  // Stratégie de cache différente selon le type de ressource
  const request = event.request;
  const requestUrl = request.url;

  // Pour les ressources statiques (CSS, JS, images)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Retourner la ressource du cache et la mettre à jour en arrière-plan
            event.waitUntil(
              fetch(request)
                .then((networkResponse) => {
                  if (networkResponse && networkResponse.status === 200) {
                    caches.open(CACHE_NAME)
                      .then((cache) => cache.put(request, networkResponse.clone()));
                  }
                })
                .catch(() => { /* Ignorer les erreurs réseau */ })
            );
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseToCache));
              }
              return networkResponse;
            })
            .catch((error) => {
              console.warn('[SW] Erreur de chargement:', error);
              // En cas d'échec, retourner une page d'erreur
              if (request.destination === 'document') {
                return caches.match(OFFLINE_URL);
              }
              return new Response('Ressource non disponible hors ligne', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }

  // Pour les documents HTML (stratégie Network First)
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache la dernière version
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // En cas d'échec, retourner la version en cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Sinon, retourner la page hors ligne
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Pour les autres requêtes (API, etc.) - stratégie Network Only
  event.respondWith(
    fetch(request)
      .catch((error) => {
        console.warn('[SW] Erreur réseau pour:', request.url, error);
        return new Response(JSON.stringify({ error: 'Hors ligne' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
  );
});

/* ── GESTION DES NOTIFICATIONS PUSH ── */
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.warn('[SW] Push reçu sans données');
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification TempZen',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      },
      actions: [
        {
          action: 'open',
          title: 'Ouvrir'
        },
        {
          action: 'close',
          title: 'Fermer'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'TempZen Santé',
        options
      )
    );
  } catch (error) {
    console.error('[SW] Erreur lors du traitement de la notification:', error);
  }
});

/* ── GESTION DES CLICS SUR NOTIFICATIONS ── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((windowClients) => {
      // Si une fenêtre est déjà ouverte, on la focalise
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, on ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/* ── MESSAGES DEPUIS LA PAGE ── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ── FONCTIONS DE NETTOYAGE (optionnel) ── */
// Nettoyer le cache périodiquement (exécuté lors de l'activation)
function clearOldCaches() {
  // Implémentation de nettoyage supplémentaire si nécessaire
}

console.log('[SW] Service Worker initialisé');
