//This is the "Offline page" service worker

//Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener('notificationclick', function(e) {
  const notification = e.notification;
  const action = e.action;

  if (action === 'close') {
    notification.close();
  } else {
    clients.openWindow(`/?nick=${notification.data.nick}&room=${notification.data.room}`);
    notification.close();
  }
});

self.addEventListener('install', function(event) {
  self.skipWaiting();
  const offlinePage = new Request('/');
  event.waitUntil(
    fetch(offlinePage).then(function(response) {
      return caches.open('chat-offline').then(function(cache) {
        console.log('Open-Chat Cached offline page during Install'+ response.url);
        return cache.put(offlinePage, response);
      });
  }));
});

//If any fetch fails, it will show the offline page.
//Maybe this should be limited to HTML documents?
self.addEventListener('fetch', function(event) {
	if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
	  return;
	}
  event.respondWith(
    fetch(event.request).catch(function(error) {
      return caches.open('chat-offline').then(function(cache) {
        return cache.match('/');
      });
    }
  ));
});

//This is a event that can be fired from your page to tell the SW to update the offline page
self.addEventListener('refreshOffline', function(response) {
  return caches.open('chat-offline').then(function(cache) {
    return cache.put(offlinePage, response);
  });
});