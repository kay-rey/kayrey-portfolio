const CACHE_NAME = "kevin-reyes-portfolio-v2";
const urlsToCache = [
	"/",
	"/index.html",
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

// Install event - cache resources
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Opened cache");
				return cache.addAll(urlsToCache);
			})
			.catch((error) => {
				console.error("Cache installation failed:", error);
			})
	);
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
	// Skip non-GET requests
	if (event.request.method !== "GET") return;

	// Skip chrome-extension and other non-http requests
	if (!event.request.url.startsWith("http")) return;

	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				// Return cached version or fetch from network
				return (
					response ||
					fetch(event.request).then((fetchResponse) => {
						// Cache successful network responses for future offline use
						if (fetchResponse && fetchResponse.status === 200) {
							const responseToCache = fetchResponse.clone();
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(event.request, responseToCache);
							});
						}
						return fetchResponse;
					})
				);
			})
			.catch(() => {
				// If both cache and network fail, show offline page for documents
				if (event.request.destination === "document") {
					return caches.match("/index.html");
				}
				// For other resources, return a basic offline response
				return new Response("Offline content not available", {
					status: 503,
					statusText: "Service Unavailable",
					headers: new Headers({
						"Content-Type": "text/plain",
					}),
				});
			})
	);
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						console.log("Deleting old cache:", cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});
