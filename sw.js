// Version numbers are automatically updated by the build script
// NOTE: HTML content uses network-first strategy, so it's always fresh.
const CACHE_NAME = "kevin-reyes-portfolio-v11083128";
const STATIC_CACHE_NAME = "kevin-reyes-portfolio-static-v11083128";

const urlsToCache = [
	"/dist/output.css",
	"/assets/headshot.webp",
	"/assets/koalalogo.webp",
	"/assets/catchimal.webp",
	"/assets/clarifymed.webp",
	"/assets/jsdrayage.webp",
	"/assets/portfolioscreenshot.webp",
	"/assets/KevinReyes-Resume.pdf",
	"/assets/favicons/favicon-16x16.png",
	"/assets/favicons/favicon-32x32.png",
	"/assets/favicons/android-chrome-192x192.png",
	"/assets/favicons/android-chrome-512x512.png",
	"/assets/favicons/apple-touch-icon.png",
	"/assets/favicons/favicon.ico",
	"/site.webmanifest",
];

// Install event - cache static resources only
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE_NAME)
			.then((cache) => {
				console.log("Opened static cache");
				return cache.addAll(urlsToCache);
			})
			.catch((error) => {
				console.error("Cache installation failed:", error);
			})
	);
	// Force the waiting service worker to become the active service worker
	self.skipWaiting();
});

// Fetch event - network-first for HTML, cache-first for static assets
self.addEventListener("fetch", (event) => {
	// Skip non-GET requests
	if (event.request.method !== "GET") return;

	// Skip chrome-extension and other non-http requests
	if (!event.request.url.startsWith("http")) return;

	const url = new URL(event.request.url);
	const isHTML = event.request.destination === "document" || 
	               url.pathname === "/" || 
	               url.pathname.endsWith(".html");

	if (isHTML) {
		// Network-first strategy for HTML files - always check network first
		event.respondWith(
			fetch(event.request)
				.then((networkResponse) => {
					// If network request succeeds, update cache and return response
					if (networkResponse && networkResponse.status === 200) {
						const responseToCache = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseToCache);
						});
					}
					return networkResponse;
				})
				.catch(() => {
					// If network fails, try cache, then fallback
					return caches.match(event.request).then((cachedResponse) => {
						if (cachedResponse) {
							return cachedResponse;
						}
						// Fallback to index.html if available
						return caches.match("/index.html");
					});
				})
		);
	} else {
		// Cache-first strategy for static assets (images, CSS, etc.)
		event.respondWith(
			caches
				.match(event.request)
				.then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}
					// If not in cache, fetch from network
					return fetch(event.request).then((fetchResponse) => {
						// Cache successful network responses
						if (fetchResponse && fetchResponse.status === 200) {
							const responseToCache = fetchResponse.clone();
							caches.open(STATIC_CACHE_NAME).then((cache) => {
								cache.put(event.request, responseToCache);
							});
						}
						return fetchResponse;
					});
				})
				.catch(() => {
					// If both cache and network fail, return offline response
					return new Response("Offline content not available", {
						status: 503,
						statusText: "Service Unavailable",
						headers: new Headers({
							"Content-Type": "text/plain",
						}),
					});
				})
		);
	}
});

// Activate event - clean up old caches and claim clients
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					// Delete any cache that doesn't match current version
					if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
						console.log("Deleting old cache:", cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
	// Take control of all pages immediately
	return self.clients.claim();
});
