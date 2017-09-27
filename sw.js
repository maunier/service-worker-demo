console.log('sw.js is running');

var CACHE_NAME = 'my-site-cache-v7';
var urlsToCache = [
  '/',
  '/index.css',
  '/index.js',
  '/sw.js'
];

this.addEventListener('install', function (event) {
  console.log('sw installed!!!');
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
                if(isResponseFailed(response)) {
                  return response;
                }
                
                cacheResponse(event.request, response, CACHE_NAME);
                
                return response;
            });
          })
  );
});

this.addEventListener('activate', function (event) {
  console.log('sw activate!!!');
  var cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.map(function (cacheName) {
      if (cacheWhitelist.indexOf(cacheName) <= 0) {
        return caches.delete(cacheName);
      }  
    }));
  }));
});

function isResponseFailed (response) {
  return !response || response.status !== 200 || response.type !== 'basic';
}

function cacheResponse (request, response, cacheName) {
  var responseToCache = response.clone();

  caches.open(cacheName)
        .then(function(cache) {
          cache.put(request, responseToCache);
        });
}