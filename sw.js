/*
This file is part of Indkøbs App - Denne app er kun på dansk her lige nu.
Copyright (C) 2025 Rikard Svenningsen

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

const CACHE_NAME = 'shopping-app-cache-v1.1.1';

const urlsToCache = [
'/ItemsAppMultiLang/',
'/ItemsAppMultiLang/about_da.html',
'/ItemsAppMultiLang/about_de.html',
'/ItemsAppMultiLang/about_en.html',
'/ItemsAppMultiLang/about_es.html',
'/ItemsAppMultiLang/about_fi.html',
'/ItemsAppMultiLang/about_fr.html',
'/ItemsAppMultiLang/about_no.html',
'/ItemsAppMultiLang/about_sv.html',
'/ItemsAppMultiLang/categories.html',
'/ItemsAppMultiLang/cat_script.js',
'/ItemsAppMultiLang/cat_style.css',
'/ItemsAppMultiLang/helpadm_da.html',
'/ItemsAppMultiLang/helpadm_de.html',
'/ItemsAppMultiLang/helpadm_en.html',
'/ItemsAppMultiLang/helpadm_es.html',
'/ItemsAppMultiLang/helpadm_fi.html',
'/ItemsAppMultiLang/helpadm_fr.html',
'/ItemsAppMultiLang/helpadm_no.html',
'/ItemsAppMultiLang/helpadm_sv.html',
'/ItemsAppMultiLang/helpind_da.html',
'/ItemsAppMultiLang/helpind_de.html',
'/ItemsAppMultiLang/helpind_en.html',
'/ItemsAppMultiLang/helpind_es.html',
'/ItemsAppMultiLang/helpind_fi.html',
'/ItemsAppMultiLang/helpind_fr.html',
'/ItemsAppMultiLang/helpind_no.html',
'/ItemsAppMultiLang/helpind_sv.html',
'/ItemsAppMultiLang/index.html',
'/ItemsAppMultiLang/lang_cat.js',
'/ItemsAppMultiLang/lang.html',
'/ItemsAppMultiLang/lang.json',
'/ItemsAppMultiLang/lang_shop.js',
'/ItemsAppMultiLang/manifest.json',
'/ItemsAppMultiLang/modal.css',
'/ItemsAppMultiLang/modal.js',
'/ItemsAppMultiLang/offline.html',
'/ItemsAppMultiLang/README.md',
'/ItemsAppMultiLang/release.txt',
'/ItemsAppMultiLang/shopping_trolly_512x512.png',
'/ItemsAppMultiLang/shopscript.js',
'/ItemsAppMultiLang/shopstyle.css',
'/ItemsAppMultiLang/sw.js'];

console.log('[SW] Service Worker loaded');

// Installer service worker
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
});

// Aktivér og ryd gammel cache
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      clients.claim(); // ← tilføj denne linje HER
    })
  );
});

// Intercept fetch og vis cache eller fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  console.log(`[SW] Fetch intercepted: ${event.request.url}`);

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', event.request.url);
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        console.log('[SW] Fetched from network:', event.request.url);
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        console.warn('[SW] Fetch failed; serving offline fallback');
        return caches.match('/ItemsAppMultiLang/offline.html') || caches.match('/ItemsAppMultiLang/index.html');

      });
    })
  );
});
