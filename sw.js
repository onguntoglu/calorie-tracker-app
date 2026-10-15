// The deploy workflow replaces VERSION on every push so phones pick up the new files.
const VERSION = 'v1';
const FONTS = 'fonts'; // survives app updates
const FILES = [ // every file the app loads; test/sw.test.mjs checks none is missing
  './', 'index.html', 'style.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'src/actions.js', 'src/components.js', 'src/lib/diary.js', 'src/main.js', 'src/render.js', 'src/state.js',
  'src/views/settings.js', 'src/views/stats.js', 'src/views/today.js',
];

self.addEventListener('install', e => {
  // cache: 'reload' skips the HTTP cache, so a new version can't be filled with old files
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  // Roboto Flex from Google Fonts: kept after the first load, so the app looks the same offline.
  if (/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(e.request.url)) {
    e.respondWith(caches.open(FONTS).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok || res.type === 'opaque') c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
