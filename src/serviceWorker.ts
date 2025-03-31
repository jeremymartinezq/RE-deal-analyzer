const CACHE_NAME = 'real-estate-cache-v1';
const API_CACHE_NAME = 'api-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

interface SyncQueueItem {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers: Record<string, string>;
  timestamp: number;
}

let syncQueue: SyncQueueItem[] = [];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});

async function handleAPIRequest(request: Request): Promise<Response> {
  try {
    // Try network first
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful responses
      const responseToCache = response.clone();
      const cache = await caches.open(API_CACHE_NAME);
      await cache.put(request, responseToCache);
      return response;
    }
    throw new Error('Network response was not ok');
  } catch (error) {
    // If offline, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cache, queue for sync
    if (request.method !== 'GET') {
      await queueForSync(request);
      return new Response(JSON.stringify({ 
        status: 'queued',
        message: 'Request queued for background sync'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return error response
    return new Response(JSON.stringify({ 
      error: 'Network error and no cached response available'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function queueForSync(request: Request): Promise<void> {
  const id = crypto.randomUUID();
  const queueItem: SyncQueueItem = {
    id,
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: Date.now()
  };

  if (request.method !== 'GET') {
    queueItem.body = await request.clone().json();
  }

  syncQueue.push(queueItem);
  await self.registration.sync.register('sync-queue');
}

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue(): Promise<void> {
  const items = [...syncQueue];
  syncQueue = [];

  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body ? JSON.stringify(item.body) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Background sync failed:', error);
      syncQueue.push(item);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const options: NotificationOptions = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.url,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event: NotificationClickEvent) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
}); 