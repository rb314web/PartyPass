const CACHE_NAME = 'partypass-v1.0.0';
const STATIC_CACHE = 'partypass-static-v1.0.0';
const DYNAMIC_CACHE = 'partypass-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/party-pass-logo.svg'
];

// Resources to cache on demand
const API_ENDPOINTS = [
  '/api/events',
  '/api/contacts',
  '/api/analytics'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (STATIC_ASSETS.includes(url.pathname) ||
      url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2)$/)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            // Don't cache if response is not ok
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          });
        })
    );
    return;
  }

  // Default network-first strategy for everything else
  event.respondWith(
    fetch(request)
      .catch(() => {
        // Fallback to cache for offline support
        return caches.match(request);
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  const options = {
    body: event.data ? event.data.text() : 'Nowe powiadomienie',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Zobacz',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Zamknij',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PartyPass', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync implementation
async function doBackgroundSync() {
  try {
    console.log('Service Worker: Performing background sync');

    // Get pending offline actions from IndexedDB or similar
    // For now, just log the action
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        await syncAction(action);
      } catch (error) {
        console.error('Service Worker: Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// Placeholder functions for offline sync
async function getPendingActions() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

async function syncAction(action) {
  // In a real implementation, this would sync with the server
  console.log('Service Worker: Syncing action:', action);
}

// Periodic cleanup
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP') {
    cleanupOldCaches();
  }
});

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  return Promise.all(
    cacheNames.map(cacheName => {
      if (!validCaches.includes(cacheName)) {
        console.log('Service Worker: Deleting cache:', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}


