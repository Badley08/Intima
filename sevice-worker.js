const CACHE_NAME = 'intima-v2.0.1';
const OFFLINE_CACHE = 'intima-offline-v2.0.1';
const urlsToCache = [
  '/Intima/',
  '/Intima/index.html',
  '/Intima/styles.css',
  '/Intima/app.js',
  '/Intima/manifest.json',
  '/Intima/assets/icons/icon-72x72.png',
  '/Intima/assets/icons/icon-96x96.png',
  '/Intima/assets/icons/icon-128x128.png',
  '/Intima/assets/icons/icon-144x144.png',
  '/Intima/assets/icons/icon-152x152.png',
  '/Intima/assets/icons/icon-192x192.png',
  '/Intima/assets/icons/icon-384x384.png',
  '/Intima/assets/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js'
];

// Page de secours hors ligne
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intima - Hors ligne</title>
  <style>
    body {
      font-family: 'Quicksand', system-ui, sans-serif;
      background: linear-gradient(135deg, #fec6d8, #f8a5c2);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 2rem;
      text-align: center;
    }
    .offline-container {
      background: white;
      padding: 3rem 2rem;
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      max-width: 400px;
    }
    .offline-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      color: #d6307e;
      margin-bottom: 1rem;
    }
    p {
      color: #5a2d57;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    button {
      background: #d6307e;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 25px;
      font-size: 1.1rem;
      cursor: pointer;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📡</div>
    <h1>Mode hors ligne</h1>
    <p>Tu n'es pas connectée à internet, mais pas de panique ! Intima fonctionne parfaitement hors ligne. 💖</p>
    <p>Toutes tes données sont sauvegardées localement et sécurisées.</p>
    <button onclick="window.location.reload()">Réessayer</button>
  </div>
</body>
</html>
`;

// Installation du Service Worker avec mode offline amélioré
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation (Mode offline activé)...');
  event.waitUntil(
    Promise.all([
      // Cache principal
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('[Service Worker] Mise en cache des fichiers principaux');
          return cache.addAll(urlsToCache);
        }),
      // Cache offline
      caches.open(OFFLINE_CACHE)
        .then(cache => {
          console.log('[Service Worker] Création de la page offline');
          return cache.put('/Intima/offline.html', new Response(OFFLINE_PAGE, {
            headers: { 'Content-Type': 'text/html' }
          }));
        })
    ])
    .then(() => {
      console.log('[Service Worker] ✅ Installation complète - Mode offline prêt');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('[Service Worker] ❌ Erreur lors de l\'installation:', error);
    })
  );
});

// Activation du Service Worker avec nettoyage
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            console.log('[Service Worker] 🗑️ Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] ✅ Activation terminée');
      return self.clients.claim();
    })
  );
});

// Stratégie Cache First avec Fallback Offline améliorée
self.addEventListener('fetch', event => {
  // Ne pas gérer les requêtes non-GET
  if (event.request.method !== 'GET') return;
  
  // Ne pas gérer les requêtes chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('[Service Worker] 📦 Cache hit:', event.request.url);
          return response;
        }

        console.log('[Service Worker] 🌐 Fetch:', event.request.url);
        return fetch(event.request).then(response => {
          // Ne pas cacher les réponses invalides
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cacher seulement les ressources de notre app
          if (event.request.url.includes('/Intima/') || 
              event.request.url.includes('cdnjs.cloudflare.com')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        }).catch(error => {
          console.error('[Service Worker] ❌ Fetch error:', error);
          
          // Retourner la page offline pour les documents HTML
          if (event.request.destination === 'document') {
            return caches.match('/Intima/offline.html')
              .then(offlineResponse => {
                return offlineResponse || caches.match('/Intima/index.html');
              });
          }
          
          // Pour les autres ressources, retourner undefined
          return undefined;
        });
      })
  );
});

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[Service Worker] Cache vidé');
      })
    );
  }
});

// Synchronisation en arrière-plan (optionnel, pour futures fonctionnalités)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-entries') {
    console.log('[Service Worker] Synchronisation des entrées...');
    // Logique de synchronisation future
  }
});

// Notifications push (optionnel, pour rappels d'écriture)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Intima';
  const options = {
    body: data.body || 'N\'oublie pas d\'écrire dans ton journal aujourd\'hui ! 💖',
    icon: '/Intima/assets/icons/icon-192x192.png',
    badge: '/Intima/assets/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'intima-reminder',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/Intima/')
  );
});

console.log('[Service Worker] Script chargé');