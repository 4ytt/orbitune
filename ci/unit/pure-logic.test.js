#!/usr/bin/env node
'use strict';
/*
 * Pure-logic regression tests for core app.js algorithms that have no DOM
 * dependency once their inputs are supplied as plain values. app.js is a
 * single non-module classic script (no exports), so these re-implement the
 * exact logic rather than import it - keep each one in sync with its
 * app.js counterpart if that logic changes.
 *
 * Pure Node, no emulator/device needed - run with:
 *   node ci/unit/pure-logic.test.js
 */

let failures = [];
function check(name, cond, detail) {
  if (cond) { console.log('OK: ' + name); }
  else { console.error('FAIL: ' + name + (detail ? ' - ' + detail : '')); failures.push(name); }
}

/* ---------- station filtering / dedup (app.js: playable, cleanList) ---------- */
function fold(s) { return String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function slim(s) {
  return {
    id: s.stationuuid, name: (s.name || '').trim().replace(/\s+/g, ' '),
    url: s.url_resolved || s.url, favicon: s.favicon || '', cc: (s.countrycode || '').toUpperCase(),
    tags: s.tags || '', bitrate: s.bitrate || 0, codec: s.codec || '', homepage: s.homepage || '',
    hls: !!s.hls, votes: s.votes || 0,
  };
}
function playable(s, canHls) {
  if (!s.id || !s.url || !s.name) return false;
  if (!/^https:\/\//i.test(s.url)) return false;
  if ((s.hls || /\.m3u8(\?|$)/i.test(s.url)) && !canHls) return false;
  return true;
}
function cleanList(raw, canHls) {
  const seen = new Set();
  return raw.map(slim).filter((s) => {
    if (!playable(s, canHls)) return false;
    const key = fold(s.name);
    if (seen.has(s.id) || seen.has(key)) return false;
    seen.add(s.id); seen.add(key);
    return true;
  });
}

(function testPlayableFiltersHttp() {
  const s = slim({ stationuuid: '1', name: 'Radio A', url: 'http://example.com/stream' });
  check('playable() rejects plain http streams', playable(s, true) === false);
})();

(function testPlayableRejectsHlsWithoutCapability() {
  const s = slim({ stationuuid: '1', name: 'Radio A', url: 'https://example.com/live.m3u8' });
  check('playable() rejects HLS when canHls is false', playable(s, false) === false);
  check('playable() accepts HLS when canHls is true', playable(s, true) === true);
})();

(function testPlayableRejectsIncomplete() {
  check('playable() rejects a station with no url', playable(slim({ stationuuid: '1', name: 'A', url: '' }), true) === false);
  check('playable() rejects a station with no name', playable(slim({ stationuuid: '1', name: '', url: 'https://x.com/a' }), true) === false);
});

(function testCleanListDedupesByIdAndFoldedName() {
  const raw = [
    { stationuuid: 'a', name: 'Radyo Türk', url: 'https://x.com/1' },
    { stationuuid: 'a', name: 'Radyo Türk (dup id)', url: 'https://x.com/1-dup' },       // same id
    { stationuuid: 'b', name: 'radyo turk', url: 'https://x.com/2' },                    // same folded name (İ/ı/accents)
    { stationuuid: 'c', name: 'Different Station', url: 'https://x.com/3' },
    { stationuuid: 'd', name: 'Dead Station', url: 'http://x.com/4' },                    // filtered: http
  ];
  const result = cleanList(raw, true);
  check('cleanList keeps exactly the two distinct stations', result.length === 2, `got ${result.length}: ${JSON.stringify(result.map((r) => r.id))}`);
  check('cleanList keeps the first-seen id for a duplicate', result.some((r) => r.id === 'a'));
  check('cleanList keeps the distinct station', result.some((r) => r.id === 'c'));
  check('cleanList drops the http station entirely', !result.some((r) => r.id === 'd'));
})();

/* ---------- next/previous station navigation (app.js: neighbour) ---------- */
function neighbour(queue, currentId, dir, skipping, isBlockedFn) {
  const q = queue;
  if (!q.length) return null;
  const cur = currentId != null ? q.findIndex((x) => x.id === currentId) : -1;
  for (let step = 1; step <= q.length; step++) {
    const cand = q[(cur + dir * step + q.length * 4) % q.length];
    if (cand && !isBlockedFn(cand.id) && (!skipping || cand.id !== currentId)) return cand;
  }
  return null;
}

(function testNeighbourBasicWraparound() {
  const q = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const none = () => false;
  check('neighbour(+1) from a goes to b', neighbour(q, 'a', 1, false, none).id === 'b');
  check('neighbour(+1) wraps from c back to a', neighbour(q, 'c', 1, false, none).id === 'a');
  check('neighbour(-1) wraps from a back to c', neighbour(q, 'a', -1, false, none).id === 'c');
})();

(function testNeighbourEmptyAndSingleQueue() {
  const none = () => false;
  check('neighbour() on an empty queue returns null', neighbour([], 'a', 1, false, none) === null);
  const one = [{ id: 'only' }];
  check('neighbour() on a single-station queue with nothing blocked returns that station (skipping=false)',
    neighbour(one, 'only', 1, false, none).id === 'only');
  check('neighbour() on a single-station queue returns null when skipping its own id',
    neighbour(one, 'only', 1, true, none) === null);
})();

(function testNeighbourSkipsBlockedStations() {
  const q = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const blockedBC = (id) => id === 'b' || id === 'c';
  check('neighbour(+1) skips over consecutive blocked stations', neighbour(q, 'a', 1, false, blockedBC).id === 'd');
})();

(function testNeighbourAllBlockedReturnsNull() {
  const q = [{ id: 'a' }, { id: 'b' }];
  check('neighbour() returns null when every candidate is blocked', neighbour(q, 'a', 1, false, () => true) === null);
})();

/* ---------- random pick with exclusion + blocklist (app.js: randomFrom) ---------- */
function randomFrom(list, exclude, isBlockedFn) {
  const pool = list.filter((s) => !exclude.includes(s.id) && !isBlockedFn(s.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

(function testRandomFromExcludesAndBlocks() {
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  let allB = true;
  for (let i = 0; i < 50; i++) {
    const pick = randomFrom(list, ['a'], (id) => id === 'c');
    if (!pick || pick.id !== 'b') allB = false;
  }
  check('randomFrom() never returns an excluded or blocked station, across 50 draws', allB);
  check('randomFrom() returns null when the whole list is excluded/blocked', randomFrom(list, ['a'], (id) => id === 'b' || id === 'c') === null);
})();

(function testRandomFromCoversWholeEligiblePool() {
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const seen = new Set();
  for (let i = 0; i < 200; i++) seen.add(randomFrom(list, [], () => false).id);
  check('randomFrom() can return every eligible station over many draws', seen.size === 4, `only saw ${[...seen]}`);
})();

/* ---------- recently-played list (app.js: addRecent) ---------- */
function addRecent(recents, countriesHeard, s) {
  const newRecents = [s, ...recents.filter((x) => x.id !== s.id)].slice(0, 20);
  const newHeard = countriesHeard.slice();
  if (!newHeard.includes(s.cc) && s.cc) newHeard.push(s.cc);
  return { recents: newRecents, countriesHeard: newHeard };
}

(function testAddRecentDedupesAndMovesToFront() {
  let r = [];
  r = addRecent(r, [], { id: 'a', cc: 'TR' }).recents;
  r = addRecent(r, [], { id: 'b', cc: 'DE' }).recents;
  r = addRecent(r, [], { id: 'a', cc: 'TR' }).recents; // replayed - should move to front, not duplicate
  check('addRecent dedupes a replayed station instead of listing it twice', r.length === 2, `got ${JSON.stringify(r)}`);
  check('addRecent moves the replayed station to the front', r[0].id === 'a');
})();

(function testAddRecentCapsAtTwenty() {
  let r = [];
  for (let i = 0; i < 25; i++) r = addRecent(r, [], { id: 'station' + i, cc: 'TR' }).recents;
  check('addRecent caps the list at 20 entries', r.length === 20, `got ${r.length}`);
  check('addRecent keeps the most recent station at the front', r[0].id === 'station24');
})();

(function testAddRecentTracksCountriesHeardOnce() {
  let heard = [];
  heard = addRecent([], heard, { id: 'a', cc: 'TR' }).countriesHeard;
  heard = addRecent([], heard, { id: 'b', cc: 'TR' }).countriesHeard;
  heard = addRecent([], heard, { id: 'c', cc: 'DE' }).countriesHeard;
  check('addRecent records each country only once', JSON.stringify(heard) === JSON.stringify(['TR', 'DE']), `got ${JSON.stringify(heard)}`);
})();

/* ---------- sleep-timer volume fade curve (app.js: sleepTick) ---------- */
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function fadeVolume(msLeft, isNative) {
  const v = msLeft < 20000 ? clamp(msLeft / 20000, 0, 1) : 1;
  return isNative ? Math.max(0.1, v) : v;
}

(function testSleepFadeCurve() {
  check('fade volume is full at >=20s remaining', fadeVolume(20000, false) === 1);
  check('fade volume is ~50% at 10s remaining', Math.abs(fadeVolume(10000, false) - 0.5) < 1e-9);
  check('fade volume approaches 0 at 0s remaining on the web path', fadeVolume(0, false) === 0);
  check('fade volume floors at 0.1 on the native path (plugin minimum)', fadeVolume(0, true) === 0.1);
  check('fade volume never exceeds 1', fadeVolume(999999, false) === 1);
})();

/* ---------- summary ---------- */
if (failures.length) {
  console.error(`\n${failures.length} failure(s): ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\nAll pure-logic scenarios passed.');
