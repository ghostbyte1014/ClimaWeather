const CACHE_NAME = "climaweather-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
];

// Install Service Worker & cache app shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker & clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Intercept — Safe Stale-While-Revalidate strategy
self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests or external API calls in SW fetch handler
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith("http") ||
    event.request.url.includes("open-meteo.com") ||
    event.request.url.includes("geojs.io") ||
    event.request.url.includes("openstreetmap.org") ||
    event.request.url.includes("rainviewer.com") ||
    event.request.url.includes("cartocdn.com") ||
    event.request.url.includes("arcgisonline.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return (
        cachedResponse ||
        fetchPromise.then((res) => res || new Response("Offline resource unavailable", { status: 503 }))
      );
    })
  );
});
