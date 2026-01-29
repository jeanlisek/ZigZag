// Service Worker pour ZigZag PWA
const CACHE_NAME = 'zigzag-v1';
const RUNTIME_CACHE = 'zigzag-runtime-v1';

// Fichiers à mettre en cache au moment de l'installation
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/chatbot.css',
  '/chatbot.js',
  '/attached_assets/image_1763569221576.png',
  '/attached_assets/PERSO-09.png',
  '/attached_assets/PERSO-11.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Pré-cache des fichiers');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Service Worker: Erreur lors du pré-cache', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Stratégie de cache : Network First, puis Cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes avec des schémas non supportés (chrome-extension, moz-extension, etc.)
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer les requêtes vers des APIs externes (Supabase, etc.)
  if (event.request.url.includes('supabase.co') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com') ||
      event.request.url.includes('jsdelivr.net')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cloner la réponse pour la mettre en cache
        const responseToCache = response.clone();

        // Vérifier que la requête peut être mise en cache (évite les erreurs avec chrome-extension, etc.)
        const requestUrl = new URL(event.request.url);
        if (requestUrl.protocol.startsWith('http')) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache).catch((error) => {
              // Ignorer silencieusement les erreurs de cache (ex: schémas non supportés)
              console.debug('Service Worker: Impossible de mettre en cache', event.request.url, error);
            });
          });
        }

        return response;
      })
      .catch(() => {
        // Si le réseau échoue, chercher dans le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si c'est une navigation et qu'on n'a pas de cache, retourner index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          return new Response('Hors ligne', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// Gestion des messages depuis le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});






