const CACHE_PREFIX = "homeserver-index-static-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const ASTRO_ASSET_PREFIX = "/_astro/";
const CACHEABLE_DESTINATIONS = new Set(["style", "script", "font", "image"]);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const oldCaches = (await caches.keys()).filter(
        (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
      );
      await Promise.all(oldCaches.map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // SSR navigations and all non-static paths (including /app and /api) stay
  // on the network; only versioned Astro build assets are eligible for cache.
  if (request.method !== "GET" || request.mode === "navigate") return;

  const url = new URL(request.url);
  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(ASTRO_ASSET_PREFIX) ||
    !CACHEABLE_DESTINATIONS.has(request.destination)
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      let cache;
      try {
        cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
      } catch {
        // Cache Storage failures should not prevent loading an online asset.
      }

      const response = await fetch(request);
      const cacheControl = response.headers.get("cache-control") ?? "";
      if (
        response.ok &&
        response.type === "basic" &&
        !/\b(?:private|no-store)\b/i.test(cacheControl)
      ) {
        try {
          cache ??= await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        } catch {
          // The network response remains usable if writing to Cache Storage fails.
        }
      }

      return response;
    })(),
  );
});
