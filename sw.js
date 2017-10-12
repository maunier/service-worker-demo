console.log('sw.js is running');

var that = this;
var CACHE_NAME = 'my-site-cache-v5';
var urlsToCache = [
  '/',
  '/index.css',
  '/index.js'
];

function addToCache () {
  var promise = caches
    .open(CACHE_NAME)
    .then(function (cache) {
      return cache.addAll(urlsToCache);
    });
  
  return promise; 
}


function fetchFromCache (req) {
  var promise = caches
    .open(CACHE_NAME)
    .then(function (cache) {
      return cache.match(req)
    });

  return promise;
}

function cacheResponse (req, res) {
  var responseToCache = res.clone();

  caches
    .open(CACHE_NAME)
    .then(function(cache) {
      cache.put(req, responseToCache);
    });
}

function isResponseSucceed (res) {
  return res && res.status === 200 && res.type === 'basic';
}

function fetchAndCacheFromRequest (req) {
  var fetchRequest = req.clone();
  var promise = fetch(fetchRequest);

  promise.then(function (res) {
    if (isResponseSucceed(res)) {
      cacheResponse(req, res);
    }
  });

  return promise;
}

function fetchAndCacheResources (req) {
  var promise = fetchFromCache(req);

  return promise.then(function (response) {
    if (response) {
      return response;
    }

    return fetchAndCacheFromRequest(req);
  });
}

function clearOldCache () {
  var cacheWhitelist = [CACHE_NAME];
  var promise = caches
    .keys()
    .then(function (cacheNames) {
      return Promise.all(cacheNames.map(function (cacheName) {
        if (cacheWhitelist.indexOf(cacheName) < 0) {
          return caches.delete(cacheName);
        }  
      }));
    });

  return promise;
}

this.addEventListener('install', function (event) {
  console.log('sw installed!');
  var promise = addToCache();
  
  event.waitUntil(promise)
  that.skipWaiting(); // 跳过waiting过程，直接激活最新sw
});

this.addEventListener('fetch', function(event) {
  console.log('fetching!');
  var promise = fetchAndCacheResources(event.request);

  event.respondWith(promise);
});

this.addEventListener('activate', function (event) {
  console.log('sw activate!');
  var promise = clearOldCache();

  event.waitUntil(promise);
  that.clients.claim(); // 更新所有打开的客户端中的sw
});



