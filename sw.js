/*
 * Offline copy of the Study section (see docs/offline-study-china-plan.md).
 *
 * Two caches:
 *   study-app-<version>  pages, code and the clip index for one build
 *   study-audio          MP3 clips, shared by every build (file names are content hashes)
 *
 * Nothing is saved on install. The /offline page sends the file list
 * (out/offline-manifest.json) and this worker downloads it in batches,
 * skipping files it already has. A version becomes "active" only after every
 * file has been checked, so an interrupted save or update never replaces a
 * working copy. Until a version is active, requests go to the network.
 */

const SCOPE_PATH = new URL(self.registration.scope).pathname; // "/practice/"
const APP_CACHE_PREFIX = 'study-app-';
const AUDIO_CACHE = 'study-audio';
const MANIFEST_KEY = new URL('__offline-manifest__.json', self.registration.scope).href;
const AUDIO_PATH = `${SCOPE_PATH}audio/study/`;

// Always from the network: the update checks and this file.
const NETWORK_ONLY = new Set([
  `${SCOPE_PATH}offline-manifest.json`,
  `${SCOPE_PATH}build-version.json`,
  `${SCOPE_PATH}sw.js`,
]);

const APP_CONCURRENCY = 4;
const AUDIO_CONCURRENCY = 6;
// One message handles at most this long, then the page asks for the next batch.
// Browsers stop a worker whose single event runs for minutes.
const BATCH_MS = 45000;
const MAX_FAILURES_IN_A_ROW = 12;
const MATCH = { ignoreVary: true };

// ---------- Small IndexedDB record: which version is active ----------

const DB_NAME = 'study-offline';
const DB_STORE = 'state';
const STATE_KEY = 'current';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readState() {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE).objectStore(DB_STORE).get(STATE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function writeState(value) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      if (value) tx.objectStore(DB_STORE).put(value, STATE_KEY);
      else tx.objectStore(DB_STORE).delete(STATE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  statePromise = Promise.resolve(value || null);
}

let statePromise = null;
function getState() {
  if (!statePromise) statePromise = readState().catch(() => null);
  return statePromise;
}

// ---------- Lifecycle ----------

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ---------- Answering requests ----------

/** "/a/[topic]/b.js" -> "/a/%5Btopic%5D/b.js", the form the file list uses. */
function encodedPath(pathname) {
  try {
    return pathname.split('/').map((part) => encodeURIComponent(decodeURIComponent(part))).join('/');
  } catch {
    return pathname;
  }
}

/** Cache key for a page: path only, no ".html", no trailing slash (home keeps "/practice/"). */
function pageKey(pathname) {
  let path = pathname;
  if (path.endsWith('.html')) path = path.slice(0, -5);
  if (path === `${SCOPE_PATH}index`) path = SCOPE_PATH;
  if (path.length > SCOPE_PATH.length && path.endsWith('/')) path = path.slice(0, -1);
  if (`${path}/` === SCOPE_PATH) path = SCOPE_PATH;
  return new URL(path, self.location.origin).href;
}

// Next.js asks for the home page's data at "/practice.txt" (base path + ".txt"), which is
// outside the scope but still comes through here from a controlled page. It is index.txt.
const HOME_DATA_ALIAS = `${SCOPE_PATH.slice(0, -1)}.txt`;

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  let pathname = url.pathname;
  if (pathname === HOME_DATA_ALIAS) pathname = `${SCOPE_PATH}index.txt`;
  else if (!(pathname + '/').startsWith(SCOPE_PATH)) return;
  if (NETWORK_ONLY.has(pathname)) return;
  event.respondWith(respond(request, url, pathname));
});

async function respond(request, url, pathname) {
  // Clips never change, so a saved clip is used even before the save is finished.
  if (url.pathname.startsWith(AUDIO_PATH) && url.pathname.endsWith('.mp3')) {
    const audio = await caches.open(AUDIO_CACHE);
    const hit = await audio.match(url.origin + url.pathname, MATCH);
    return hit || fetch(request);
  }

  const state = await getState();
  if (!state || !state.activeVersion) return fetch(request);
  const app = await caches.open(APP_CACHE_PREFIX + state.activeVersion);

  if (request.mode === 'navigate') {
    const hit =
      (await app.match(pageKey(url.pathname), MATCH)) ||
      (await app.match(pageKey(encodedPath(url.pathname)), MATCH));
    if (hit) return hit;
    try {
      return await fetch(request);
    } catch (error) {
      // Offline and this page was not saved: show the saved home page, not a browser error.
      const home = await app.match(pageKey(SCOPE_PATH), MATCH);
      if (home) return home;
      throw error;
    }
  }

  // Page data (".txt?_rsc=…"), "google-tts.js?v=…" and other files: the query string does not matter.
  const hit =
    (await app.match(url.href, MATCH)) ||
    (await app.match(url.origin + pathname, MATCH)) ||
    (await app.match(url.origin + encodedPath(pathname), MATCH));
  return hit || fetch(request);
}

// ---------- Messages from the page ----------

self.addEventListener('message', (event) => {
  const data = event.data || {};
  const port = event.ports && event.ports[0];
  const reply = (value) => {
    if (port) port.postMessage(value);
  };

  let work;
  if (data.type === 'status') work = getStatus();
  else if (data.type === 'save') work = saveBatch(data.manifest, event.source);
  else if (data.type === 'remove') work = removeAll();
  else return;

  event.waitUntil(
    work.then(
      (value) => reply({ ok: true, ...value }),
      (error) => reply({ ok: false, error: String((error && error.message) || error) })
    )
  );
});

async function appCacheNames() {
  return (await caches.keys()).filter((name) => name.startsWith(APP_CACHE_PREFIX));
}

async function readStoredManifest(cache) {
  const response = await cache.match(MANIFEST_KEY);
  if (!response) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function absolute(path) {
  return new URL(path, self.location.origin).href;
}

/** Keys of every file in a manifest, split by cache. */
function manifestKeys(manifest) {
  return {
    app: manifest.app.map((entry) => absolute(entry[0])),
    audio: manifest.audio.map((entry) => absolute(entry[0])),
  };
}

async function cachedKeySet(cache) {
  return new Set((await cache.keys()).map((request) => request.url));
}

/** Counts which files of a manifest are really in the caches right now. */
async function checkCaches(manifest, appCache) {
  const keys = manifestKeys(manifest);
  const appHave = await cachedKeySet(appCache);
  const audioHave = await cachedKeySet(await caches.open(AUDIO_CACHE));
  let present = 0;
  let bytesPresent = 0;
  manifest.app.forEach((entry, i) => {
    if (appHave.has(keys.app[i])) {
      present += 1;
      bytesPresent += entry[1];
    }
  });
  manifest.audio.forEach((entry, i) => {
    if (audioHave.has(keys.audio[i])) {
      present += 1;
      bytesPresent += entry[1];
    }
  });
  const total = manifest.app.length + manifest.audio.length;
  return { present, total, bytesPresent, bytesTotal: manifest.totalBytes, complete: present === total };
}

let running = null; // { version, progress, promise }

/**
 * What is saved, checked against the caches (the phone can remove files when storage is low).
 *   active:  the version in use offline, with how complete it still is
 *   pending: a save or update that stopped before it finished
 */
async function getStatus() {
  const state = await getState();
  const names = await appCacheNames();
  const result = { active: null, pending: null, saving: null };

  if (state && state.activeVersion && names.includes(APP_CACHE_PREFIX + state.activeVersion)) {
    const cache = await caches.open(APP_CACHE_PREFIX + state.activeVersion);
    const manifest = await readStoredManifest(cache);
    if (manifest) {
      result.active = {
        version: state.activeVersion,
        savedAt: state.savedAt,
        ...(await checkCaches(manifest, cache)),
      };
    }
  }

  const pendingName = names.find((name) => !state || name !== APP_CACHE_PREFIX + state.activeVersion);
  if (pendingName) {
    const cache = await caches.open(pendingName);
    const manifest = await readStoredManifest(cache);
    if (manifest) {
      result.pending = { version: manifest.version, ...(await checkCaches(manifest, cache)) };
    }
  }

  if (running) result.saving = { version: running.version, ...running.progress };
  return result;
}

/** Runs `worker` over `items`, a few at a time, until done or `shouldStop()` says so. */
async function pool(items, limit, shouldStop, worker) {
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length && !shouldStop()) {
      const item = items[next++];
      await worker(item);
    }
  });
  await Promise.all(lanes);
}

async function download(src, cacheMode) {
  const response = await fetch(src, { cache: cacheMode, credentials: 'same-origin' });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${src}`);
  const body = await response.blob();
  if (body.size === 0) throw new Error(`Empty file: ${src}`);
  // Rebuild the response so a redirect (e.g. "/x" -> "/x/") can still answer a page load.
  return new Response(body, { status: 200, statusText: 'OK', headers: response.headers });
}

function postToClient(client, message) {
  try {
    if (client) client.postMessage(message);
  } catch {
    // The page went away; the save stops at the end of this batch.
  }
}

/**
 * Saves one batch of the manifest. Returns { result } where result is:
 *   "ready"     every file is saved and checked; this version is now active
 *   "more"      time is up for this batch; the page sends "save" again
 *   "stopped"   too many downloads failed (usually no internet); "Continue" tries again
 */
async function saveBatch(manifest, client) {
  if (!manifest || !manifest.version || !Array.isArray(manifest.app) || !Array.isArray(manifest.audio)) {
    throw new Error('Bad file list');
  }
  if (running) {
    if (running.version !== manifest.version) throw new Error('Another save is running');
    return running.promise;
  }

  const progress = { done: 0, total: manifest.app.length + manifest.audio.length, bytesDone: 0, bytesTotal: manifest.totalBytes };
  const promise = runSave(manifest, client, progress);
  running = { version: manifest.version, progress, promise };
  try {
    return await promise;
  } finally {
    running = null;
  }
}

async function runSave(manifest, client, progress) {
  const started = Date.now();
  const targetName = APP_CACHE_PREFIX + manifest.version;
  const state = await getState();
  const activeName = state && state.activeVersion ? APP_CACHE_PREFIX + state.activeVersion : null;

  // An older unfinished save is left over from a previous build: it can never finish, so drop it.
  for (const name of await appCacheNames()) {
    if (name !== targetName && name !== activeName) await caches.delete(name);
  }

  const app = await caches.open(targetName);
  const audio = await caches.open(AUDIO_CACHE);
  await app.put(MANIFEST_KEY, new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/json' } }));

  const keys = manifestKeys(manifest);
  const appHave = await cachedKeySet(app);
  const audioHave = await cachedKeySet(audio);

  const todoApp = [];
  manifest.app.forEach((entry, i) => {
    if (appHave.has(keys.app[i])) {
      progress.done += 1;
      progress.bytesDone += entry[1];
    } else {
      todoApp.push({ key: keys.app[i], src: absolute(entry[2] || entry[0]), bytes: entry[1] });
    }
  });
  const todoAudio = [];
  manifest.audio.forEach((entry, i) => {
    if (audioHave.has(keys.audio[i])) {
      progress.done += 1;
      progress.bytesDone += entry[1];
    } else {
      todoAudio.push({ key: keys.audio[i], src: keys.audio[i], bytes: entry[1] });
    }
  });

  let failuresInARow = 0;
  let failed = 0;
  let lastPost = 0;
  const report = (force) => {
    const now = Date.now();
    if (!force && now - lastPost < 300) return;
    lastPost = now;
    postToClient(client, { type: 'offline-progress', version: manifest.version, ...progress });
  };
  report(true);

  const timeUp = () => Date.now() - started > BATCH_MS;
  const stop = () => timeUp() || failuresInARow >= MAX_FAILURES_IN_A_ROW;

  const saveOne = (cache, cacheMode) => async (item) => {
    try {
      const response = await download(item.src, cacheMode);
      await cache.put(item.key, response);
      progress.done += 1;
      progress.bytesDone += item.bytes;
      failuresInARow = 0;
    } catch (error) {
      if (error && error.name === 'QuotaExceededError') {
        failuresInARow = MAX_FAILURES_IN_A_ROW;
        progress.quotaExceeded = true;
      } else {
        failuresInARow += 1;
      }
      failed += 1;
    }
    report(false);
  };

  // Pages and code are checked with the server each time ("no-cache"), so a page
  // from an older build is never saved with this build's code.
  await pool(todoApp, APP_CONCURRENCY, stop, saveOne(app, 'no-cache'));
  await pool(todoAudio, AUDIO_CONCURRENCY, stop, saveOne(audio, 'default'));
  report(true);

  if (failuresInARow >= MAX_FAILURES_IN_A_ROW) {
    return { result: 'stopped', failed, quotaExceeded: !!progress.quotaExceeded, ...progress };
  }

  const check = await checkCaches(manifest, app);
  if (!check.complete) {
    // Time ran out (or a few files failed): the page asks for another batch.
    return { result: failed > 0 && !timeUp() ? 'stopped' : 'more', failed, ...progress };
  }

  // If a new build went live during the save, its pages may not match this file list.
  try {
    const response = await fetch(`${SCOPE_PATH}offline-manifest.json`, { cache: 'no-store' });
    if (response.ok) {
      const live = await response.json();
      if (live && live.version && live.version !== manifest.version) {
        await caches.delete(targetName);
        return { result: 'changed', liveVersion: live.version, ...progress };
      }
    }
  } catch {
    // No internet right at the end: the files are already checked, so keep going.
  }

  // Switch: the new copy is complete, so start using it and remove the old one.
  await writeState({ activeVersion: manifest.version, savedAt: Date.now() });
  for (const name of await appCacheNames()) {
    if (name !== targetName) await caches.delete(name);
  }
  const keep = new Set(keys.audio);
  for (const request of await audio.keys()) {
    if (!keep.has(request.url)) await audio.delete(request);
  }

  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((c) => postToClient(c, { type: 'offline-ready', version: manifest.version }));
  return { result: 'ready', ...progress };
}

async function removeAll() {
  if (running) throw new Error('A save is running');
  await writeState(null);
  for (const name of await appCacheNames()) await caches.delete(name);
  await caches.delete(AUDIO_CACHE);
  return { removed: true };
}
