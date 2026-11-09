const CACHE = 'careerpath-v3';
const SHELL = ['./careerpath.html', './manifest.json', './icon.svg', './icon-maskable.svg'];
const NEVER_CACHE = ['api.github.com', 'generativelanguage.googleapis.com', 'api.anthropic.com', 'allorigins'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (NEVER_CACHE.some(host => e.request.url.includes(host))) return;

  // Network-first so updates arrive immediately; the cache is only for offline use
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
