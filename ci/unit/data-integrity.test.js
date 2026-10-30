#!/usr/bin/env node
'use strict';
/*
 * Pure-logic regression tests for data-integrity-sensitive paths: the
 * favorites/blocklist backup+restore round-trip (users lose their library
 * forever if this silently corrupts unicode), the restore merge/dedupe
 * logic, the "reset app" field-preservation list, search URL param
 * building, and the stream-failure auto-skip decision branching. Same
 * approach as the other ci/unit/ files - exact re-implementations, no DOM,
 * keep in sync with app.js if the originals change.
 *
 * Pure Node, no emulator/device needed - run with:
 *   node ci/unit/data-integrity.test.js
 */

let failures = [];
function check(name, cond, detail) {
  if (cond) { console.log('OK: ' + name); }
  else { console.error('FAIL: ' + name + (detail ? ' - ' + detail : '')); failures.push(name); }
}

/* ---------- backup/restore encode-decode round trip (app.js: encodeBackup / doRestore) ---------- */
// Identical to app.js's encodeBackup()/doRestore() decode line - Node has
// real btoa/atob/escape/unescape globally, so this isn't a reimplementation.
function encodeBackup(favorites, blocked) {
  const data = { v: 1, f: favorites, b: blocked };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}
function decodeBackup(code) {
  return JSON.parse(decodeURIComponent(escape(atob(code))));
}

(function testBackupRoundTripAscii() {
  const favs = [{ id: 'a1', url: 'https://x.com/a', name: 'Radio Hits' }];
  const blocked = [{ id: 'b1', url: 'https://x.com/b', name: 'Dead Station' }];
  const decoded = decodeBackup(encodeBackup(favs, blocked));
  check('backup round-trip preserves plain-ASCII favorites exactly', JSON.stringify(decoded.f) === JSON.stringify(favs));
  check('backup round-trip preserves blocked list exactly', JSON.stringify(decoded.b) === JSON.stringify(blocked));
  check('backup round-trip preserves the version marker', decoded.v === 1);
})();

(function testBackupRoundTripUnicode() {
  // This is the whole point of the encode via encodeURIComponent/unescape
  // dance instead of a plain btoa(JSON.stringify(...)) - btoa alone throws
  // on any non-Latin1 character, and this app's station names are full of
  // Turkish, Arabic, Cyrillic, and emoji.
  const favs = [
    { id: 'tr1', url: 'https://x.com/tr', name: 'Türkçe Radyo İzmir' },
    { id: 'ar1', url: 'https://x.com/ar', name: 'راديو العربية' },
    { id: 'emoji1', url: 'https://x.com/e', name: '🎵 Chill FM 🌙' },
  ];
  const decoded = decodeBackup(encodeBackup(favs, []));
  check('backup round-trip preserves Turkish/Arabic/emoji names exactly', JSON.stringify(decoded.f) === JSON.stringify(favs), JSON.stringify(decoded.f));
})();

(function testBackupRoundTripEmptyLists() {
  const decoded = decodeBackup(encodeBackup([], []));
  check('backup round-trip handles empty favorites/blocked lists', Array.isArray(decoded.f) && decoded.f.length === 0 && Array.isArray(decoded.b) && decoded.b.length === 0);
})();

/* ---------- restore validation + merge/dedupe (app.js: doRestore handler) ---------- */
const restoreEntryOk = (x) => x && typeof x.id === 'string' && typeof x.url === 'string' && typeof x.name === 'string';
function applyRestore(currentFavorites, currentBlocked, importedData) {
  if (!importedData || !Array.isArray(importedData.f)) throw new Error('bad');
  const fav = importedData.f.filter(restoreEntryOk);
  const ids = new Set(currentFavorites.map((x) => x.id));
  const newFavorites = [...currentFavorites, ...fav.filter((x) => !ids.has(x.id))];
  let newBlocked = currentBlocked;
  if (Array.isArray(importedData.b)) {
    const bid = new Set(currentBlocked.map((x) => x.id));
    newBlocked = [...currentBlocked, ...importedData.b.filter(restoreEntryOk).filter((x) => !bid.has(x.id))];
  }
  return { favorites: newFavorites, blocked: newBlocked, importedCount: fav.length };
}

(function testRestoreRejectsMalformedPayload() {
  check('restore rejects a payload with no f array', (() => { try { applyRestore([], [], { v: 1 }); return false; } catch (_) { return true; } })());
  check('restore rejects a payload that is not an object', (() => { try { applyRestore([], [], null); return false; } catch (_) { return true; } })());
  check('restore rejects f being a non-array', (() => { try { applyRestore([], [], { f: 'not-an-array' }); return false; } catch (_) { return true; } })());
})();

(function testRestoreFiltersInvalidEntries() {
  const result = applyRestore([], [], { f: [
    { id: 'ok1', url: 'https://x.com/1', name: 'Valid' },
    { id: 'ok2' },                              // missing url/name
    { name: 'no id', url: 'https://x.com/2' },  // missing id
    null,
    'just a string',
  ] });
  check('restore keeps only fully-valid entries', result.importedCount === 1, `got ${result.importedCount}`);
  check('restore keeps the valid entry itself', result.favorites[0].id === 'ok1');
})();

(function testRestoreDedupesAgainstExistingFavorites() {
  const current = [{ id: 'already-have', url: 'https://x.com/a', name: 'Existing' }];
  const result = applyRestore(current, [], { f: [
    { id: 'already-have', url: 'https://x.com/a-dup', name: 'Existing (duplicate id)' },
    { id: 'new-one', url: 'https://x.com/b', name: 'New' },
  ] });
  check('restore does not duplicate a favorite that is already saved', result.favorites.length === 2, `got ${result.favorites.length}`);
  check('restore keeps the ORIGINAL entry, not the imported duplicate', result.favorites.find((x) => x.id === 'already-have').name === 'Existing');
  check('restore still imports the genuinely new favorite', result.favorites.some((x) => x.id === 'new-one'));
  check('restore reports the raw imported count (including the deduped one) for the toast', result.importedCount === 2);
})();

(function testRestoreMergesBlockedListTooAndToleratesMissingB() {
  const withB = applyRestore([], [], { f: [], b: [{ id: 'blk1', url: 'https://x.com/b', name: 'Blocked' }] });
  check('restore imports the blocked list when present', withB.blocked.length === 1);
  const withoutB = applyRestore([], [{ id: 'existing-block', url: 'https://x.com/c', name: 'X' }], { f: [] });
  check('restore leaves the existing blocked list untouched when the payload has no b field', withoutB.blocked.length === 1 && withoutB.blocked[0].id === 'existing-block');
})();

/* ---------- reset preserves personalization, wipes everything else (app.js: doReset handler) ---------- */
const DEFAULTS = {
  lang: 'tr', theme: 'system', accent: 'mercan',
  modules: { favs: true, recents: false, moods: false, dial: false },
  pets: { cat: true, dog: false, bird: false, turtle: false },
  petPos: {}, scope: 'country', quickTab: 'favs',
  favorites: [], recents: [], blocked: [],
  autoSkip: true, country: null, lastStation: null,
  listenSeconds: 0, countriesHeard: [], tunesDone: 0,
};
function applyReset(state) {
  const keep = { lang: state.lang, theme: state.theme, accent: state.accent, modules: state.modules, country: state.country, autoSkip: state.autoSkip, pets: state.pets, petHomes: state.petHomes };
  return Object.assign({}, structuredClone(DEFAULTS), keep);
}

(function testResetPreservesPersonalizationFields() {
  const state = Object.assign(structuredClone(DEFAULTS), {
    lang: 'en', theme: 'dark', accent: 'ocean', country: 'DE', autoSkip: false,
    pets: { cat: false, dog: true, bird: false, turtle: true }, petHomes: true,
    favorites: [{ id: 'a' }], recents: [{ id: 'b' }], blocked: [{ id: 'c' }],
    listenSeconds: 9999, tunesDone: 42,
  });
  const reset = applyReset(state);
  check('reset keeps language', reset.lang === 'en');
  check('reset keeps theme', reset.theme === 'dark');
  check('reset keeps accent', reset.accent === 'ocean');
  check('reset keeps selected country', reset.country === 'DE');
  check('reset keeps autoSkip', reset.autoSkip === false);
  check('reset keeps pets configuration', JSON.stringify(reset.pets) === JSON.stringify({ cat: false, dog: true, bird: false, turtle: true }));
  check('reset keeps petHomes', reset.petHomes === true);
  check('reset WIPES favorites', reset.favorites.length === 0);
  check('reset WIPES recents', reset.recents.length === 0);
  check('reset WIPES blocked', reset.blocked.length === 0);
  check('reset WIPES listening stats', reset.listenSeconds === 0 && reset.tunesDone === 0);
})();

/* ---------- sharing URL (app.js: stationUrl) ---------- */
function stationUrl(origin, pathname, s) {
  return `${origin}${pathname}?s=${encodeURIComponent(s.id)}`;
}
(function testStationUrlEncoding() {
  check('stationUrl() builds the expected query string', stationUrl('https://orbitune.app', '/', { id: 'abc-123' }) === 'https://orbitune.app/?s=abc-123');
  check('stationUrl() percent-encodes special characters in the id', stationUrl('https://orbitune.app', '/', { id: 'a b&c' }).includes('a%20b%26c'));
})();

/* ---------- search query param building (app.js: searchStations) ---------- */
function buildSearchParams({ name, tag, iso, limit = 80 }) {
  const p = new URLSearchParams({ hidebroken: 'true', is_https: 'true', order: 'clickcount', reverse: 'true', limit: String(limit) });
  if (name) p.set('name', name);
  if (tag) p.set('tag', tag);
  if (iso) p.set('countrycode', iso);
  return p;
}
(function testSearchParamsDefaults() {
  const p = buildSearchParams({});
  check('search params default to limit 80', p.get('limit') === '80');
  check('search params always request https-only, non-broken stations', p.get('is_https') === 'true' && p.get('hidebroken') === 'true');
  check('search params omit name/tag/countrycode entirely when not given', !p.has('name') && !p.has('tag') && !p.has('countrycode'));
})();
(function testSearchParamsWithValues() {
  const p = buildSearchParams({ name: 'jazz fm', tag: 'jazz', iso: 'TR', limit: 40 });
  check('search params include a given name', p.get('name') === 'jazz fm');
  check('search params include a given tag', p.get('tag') === 'jazz');
  check('search params include a given country code', p.get('countrycode') === 'TR');
  check('search params respect a custom limit', p.get('limit') === '40');
})();
(function testSearchParamsEmptyStringTreatedAsAbsent() {
  // A subtle one: these are truthy-checked (`if (name)`), so an explicit ''
  // (e.g. "search whole world" with iso='') must NOT add the param.
  const p = buildSearchParams({ iso: '', name: '', limit: 80 });
  check('search params treat an explicit empty-string iso as "not given"', !p.has('countrycode'));
  check('search params treat an explicit empty-string name as "not given"', !p.has('name'));
})();

/* ---------- stream-failure auto-skip decision branching (app.js: onStreamFail) ---------- */
function decideStreamFailAction(autoSkipEnabled, skipCount, queueKind, hasStation) {
  if (!(autoSkipEnabled && skipCount < 3 && hasStation)) return 'giveUp';
  return queueKind === 'scope' ? 'shuffleScope' : 'tryNeighbourOrRandom';
}
(function testStreamFailGivesUpWhenAutoSkipDisabled() {
  check('gives up immediately when autoSkip is off', decideStreamFailAction(false, 0, 'list', true) === 'giveUp');
})();
(function testStreamFailGivesUpWithNoStation() {
  check('gives up when there is no current station', decideStreamFailAction(true, 0, 'list', false) === 'giveUp');
})();
(function testStreamFailRetryBoundary() {
  check('retries on skip attempt 1 (skipCount=0)', decideStreamFailAction(true, 0, 'list', true) !== 'giveUp');
  check('retries on skip attempt 2 (skipCount=1)', decideStreamFailAction(true, 1, 'list', true) !== 'giveUp');
  check('retries on skip attempt 3 (skipCount=2)', decideStreamFailAction(true, 2, 'list', true) !== 'giveUp');
  check('gives up after 3 failed attempts (skipCount=3)', decideStreamFailAction(true, 3, 'list', true) === 'giveUp');
  check('stays given up beyond 3 (skipCount=4)', decideStreamFailAction(true, 4, 'list', true) === 'giveUp');
})();
(function testStreamFailScopeVsListBranching() {
  check('a "scope" queue reshuffles the scope instead of walking the queue', decideStreamFailAction(true, 0, 'scope', true) === 'shuffleScope');
  check('a plain list queue tries a neighbour/random station', decideStreamFailAction(true, 0, 'list', true) === 'tryNeighbourOrRandom');
})();

/* ---------- summary ---------- */
if (failures.length) {
  console.error(`\n${failures.length} failure(s): ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\nAll data-integrity scenarios passed.');
