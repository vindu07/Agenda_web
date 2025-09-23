const CACHE_NAME = "agenda-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
];

// installazione → cache dei file base
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// attivazione → elimina cache vecchie
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// fetch → serve i file dalla cache se disponibili
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
