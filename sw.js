console.log('sw.js is running');

var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/index.css',
  '/index.js',
  '/sw.js'
];

this.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
          .then(function (cache) {
            return cache.addAll(urlsToCache);
          })
  );
});

this.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
          .then(function(response) {
            if (response) {
              return response;
            }

            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(function(response) {
                var isValidResponse = !response || response.status !== 200 || response.type !== 'basic';

                if(isValidResponse) {
                  return response;
                }

                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.
                var responseToCache = response.clone();

                caches.open(CACHE_NAME)
                      .then(function(cache) {
                        cache.put(event.request, responseToCache);
                      });

                return response;
            });
          })
  );
});