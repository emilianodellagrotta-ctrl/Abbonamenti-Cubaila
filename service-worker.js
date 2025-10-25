const CACHE_NAME = "cubaila-v1";
const FILES_TO_CACHE = [
  "./Abbonamenti2025_offline.html",
  "./manifest.json",
  "./icon192.png",
  "./icon512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) return response;
      return fetch(e.request).then(fetchRes => {
        // Optionally cache new requests (only for same-origin)
        try {
          if (e.request.method === 'GET' && new URL(e.request.url).origin === location.origin) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, fetchRes.clone()));
          }
        } catch (err) {}
        return fetchRes;
      }).catch(() => {
        // fallback to cached index.html for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('./Abbonamenti2025_offline.html');
        }
      });
    })
  );
});
