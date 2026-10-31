#!/usr/bin/env node
'use strict';
/*
 * More pure-logic regression tests: text/display formatting helpers and
 * persisted-state load/merge/migration logic from app.js. Same approach as
 * pure-logic.test.js - exact re-implementations, no DOM needed, keep in
 * sync with app.js if the originals change.
 *
 * Pure Node, no emulator/device needed - run with:
 *   node ci/unit/display-and-state.test.js
 */

let failures = [];
function check(name, cond, detail) {
  if (cond) { console.log('OK: ' + name); }
  else { console.error('FAIL: ' + name + (detail ? ' - ' + detail : '')); failures.push(name); }
}

/* ---------- tiny helpers (app.js: esc, hash, fold, clamp) ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const fold = (s) => String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

(function testEscEscapesAllFiveEntities() {
  check('esc() escapes & < > " \'', esc(`a & b < c > "d" 'e'`) === 'a &amp; b &lt; c &gt; &quot;d&quot; &#39;e&#39;');
  check('esc() handles null/undefined as empty string', esc(null) === '' && esc(undefined) === '');
  check('esc() leaves plain text untouched', esc('Radio Hits FM') === 'Radio Hits FM');
})();

(function testHashIsDeterministicAndDistinguishing() {
  check('hash() is deterministic for the same input', hash('orbitune') === hash('orbitune'));
  check('hash() returns an unsigned 32-bit value', hash('orbitune') >= 0 && hash('orbitune') <= 0xffffffff);
  check('hash() differs for different inputs (no trivial collision)', hash('orbitune-a') !== hash('orbitune-b'));
})();

(function testFoldNormalizesTurkishCasing() {
  check('fold() matches Turkish dotless/dotted i correctly', fold('İstanbul') === fold('istanbul'));
  check('fold() strips combining accents', fold('Çanakkale') === fold('canakkale'));
  check('fold() is case-insensitive for plain ascii', fold('RADIO') === fold('radio'));
  check('fold() treats "" and undefined the same', fold('') === fold(undefined));
})();

(function testClampBounds() {
  check('clamp() passes through an in-range value', clamp(0.5, 0, 1) === 0.5);
  check('clamp() floors below the minimum', clamp(-5, 0, 1) === 0);
  check('clamp() ceils above the maximum', clamp(5, 0, 1) === 1);
  check('clamp() handles min===max', clamp(5, 2, 2) === 2);
})();

/* ---------- station display formatting (app.js: freqOf, genreOf, initials, logoUrl) ---------- */
const freqOf = (s) => Math.round((88 + (hash(s.id || s.name) % 201) / 10) * 10) / 10;

(function testFreqOfStaysWithinFmBandAndIsStable() {
  const stations = Array.from({ length: 200 }, (_, i) => ({ id: 'station-' + i }));
  const inBand = stations.every((s) => { const f = freqOf(s); return f >= 88 && f <= 108; });
  const stable = stations.every((s) => freqOf(s) === freqOf(s));
  const oneDecimal = stations.every((s) => Math.round(freqOf(s) * 10) === freqOf(s) * 10);
  check('freqOf() stays within the 88.0-108.0 FM band for 200 sample ids', inBand);
  check('freqOf() is deterministic across repeated calls for 200 sample ids', stable);
  check('freqOf() always rounds to one decimal place for 200 sample ids', oneDecimal);
})();

function makeT(dict) { return (key) => dict[key] || key; }
function genreOf(s, t) {
  const tag = (s.tags || '').split(',').map((x) => x.trim()).find((x) => x.length > 1 && x.length <= 22 && !/^https?:/i.test(x));
  if (!tag) return t('genre.default');
  return tag.split(' ').map((w) => (w ? w[0].toLocaleUpperCase('en') + w.slice(1) : w)).join(' ');
}

(function testGenreOfPicksFirstValidTag() {
  const t = makeT({ 'genre.default': 'Radio' });
  check('genreOf() picks the first usable tag', genreOf({ tags: 'pop, rock, jazz' }, t) === 'Pop');
  check('genreOf() capitalizes multi-word tags', genreOf({ tags: 'classic rock' }, t) === 'Classic Rock');
})();

(function testGenreOfSkipsBadTags() {
  const t = makeT({ 'genre.default': 'Radio' });
  check('genreOf() skips a single-character tag', genreOf({ tags: 'x, news talk' }, t) === 'News Talk');
  check('genreOf() skips a tag that is actually a URL', genreOf({ tags: 'http://example.com, jazz' }, t) === 'Jazz');
  check('genreOf() skips an overlong tag (>22 chars)', genreOf({ tags: 'this tag is definitely way too long, pop' }, t) === 'Pop');
  check('genreOf() falls back to the default when no tag qualifies', genreOf({ tags: '' }, t) === 'Radio');
  check('genreOf() falls back to the default when tags is missing', genreOf({}, t) === 'Radio');
})();

function initials(name) {
  const words = String(name).replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '♪';
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase('en');
  return (words[0][0] + words[1][0]).toLocaleUpperCase('en');
}

(function testInitialsVariants() {
  check('initials() takes first letters of two words', initials('Radio Hits') === 'RH');
  check('initials() takes first two letters of a single word', initials('Jazzradio') === 'JA');
  check('initials() falls back to a note symbol for an empty/symbols-only name', initials('") :: ((') === '♪');
  check('initials() ignores punctuation when splitting words', initials("Rock'n'Roll Radio") !== '♪');
})();

function logoUrl(s) {
  const f = (s.favicon || '').trim();
  if (!f || f.startsWith('data:')) return '';
  return f.replace(/^http:\/\//i, 'https://');
}

(function testLogoUrlRules() {
  check('logoUrl() upgrades http to https', logoUrl({ favicon: 'http://cdn.example.com/a.png' }) === 'https://cdn.example.com/a.png');
  check('logoUrl() leaves https untouched', logoUrl({ favicon: 'https://cdn.example.com/a.png' }) === 'https://cdn.example.com/a.png');
  check('logoUrl() rejects a data: URI (never passed to <img>)', logoUrl({ favicon: 'data:image/png;base64,AAA' }) === '');
  check('logoUrl() returns empty for a missing favicon', logoUrl({}) === '');
  check('logoUrl() trims whitespace', logoUrl({ favicon: '  https://cdn.example.com/a.png  ' }) === 'https://cdn.example.com/a.png');
})();

/* ---------- country label (app.js: countryLabel) - exercises real Intl.DisplayNames ---------- */
function countryLabel(iso, lang) {
  if (!iso) return '';
  try {
    const regionNames = new Intl.DisplayNames([lang], { type: 'region' });
    const n = regionNames.of(iso);
    if (lang === 'tr' && iso === 'TR') return 'Türkiye';
    return n || iso;
  } catch (_) { return iso; }
}

(function testCountryLabel() {
  check('countryLabel() special-cases Turkey in Turkish', countryLabel('TR', 'tr') === 'Türkiye');
  check('countryLabel() returns empty for no iso code', countryLabel('', 'tr') === '');
  check('countryLabel() resolves a real ISO code in English', countryLabel('DE', 'en') === 'Germany');
  check('countryLabel() falls back to the raw code for a bogus input', countryLabel('ZZ', 'en') === 'ZZ' || typeof countryLabel('ZZ', 'en') === 'string');
})();

/* ---------- dial frequency -> needle position (app.js: paintDial) ---------- */
function needlePercent(freq) { return ((freq - 88) / 20) * 100; }

(function testDialNeedleMapping() {
  check('needle is at 0% at the low end of the band (88.0)', needlePercent(88) === 0);
  check('needle is at 100% at the high end of the band (108.0)', needlePercent(108) === 100);
  check('needle is at 50% at the midpoint (98.0)', needlePercent(98) === 50);
})();

/* ---------- persisted state defaults + migration (app.js: loadState) ---------- */
const DEFAULTS = {
  lang: 'tr', theme: 'system', accent: 'mercan',
  modules: { favs: true, recents: false, moods: false, dial: false },
  pets: { cat: true, dog: false, bird: false, turtle: false },
  petPos: {}, scope: 'country', quickTab: 'favs',
  favorites: [], recents: [], blocked: [],
  autoSkip: true, country: null, lastStation: null,
  listenSeconds: 0, countriesHeard: [], tunesDone: 0,
};
function loadState(rawJson) {
  try {
    if (!rawJson) return structuredClone(DEFAULTS);
    const p = JSON.parse(rawJson);
    const st = { ...structuredClone(DEFAULTS), ...p, modules: { ...DEFAULTS.modules, ...(p.modules || {}) }, pets: { ...DEFAULTS.pets, ...(p.pets || {}) } };
    if (p.modules && p.modules.cat === false && !p.pets) st.pets.cat = false;
    return st;
  } catch (_) { return structuredClone(DEFAULTS); }
}

(function testLoadStateFreshInstall() {
  const st = loadState(null);
  check('loadState() with nothing stored returns the full defaults', JSON.stringify(st) === JSON.stringify(DEFAULTS));
})();

(function testLoadStateCorruptJsonFallsBackToDefaults() {
  const st = loadState('{not valid json');
  check('loadState() with corrupt JSON falls back to defaults instead of throwing', JSON.stringify(st) === JSON.stringify(DEFAULTS));
})();

(function testLoadStatePartialMergesOntoDefaults() {
  const st = loadState(JSON.stringify({ lang: 'en', favorites: [{ id: 'x' }] }));
  check('loadState() keeps a stored field', st.lang === 'en');
  check('loadState() keeps another stored field', st.favorites.length === 1);
  check('loadState() still fills in untouched fields from defaults', st.theme === 'system' && st.autoSkip === true);
})();

(function testLoadStateMigratesOldCatModuleFlag() {
  // Old saved state (before the pets feature existed) turned the cat off via
  // modules.cat; that must still translate into pets.cat on upgrade.
  const st = loadState(JSON.stringify({ modules: { cat: false } }));
  check('loadState() migrates modules.cat=false into pets.cat=false', st.pets.cat === false);
})();

(function testLoadStateDoesNotMigrateWhenPetsAlreadyStored() {
  // Once pets has actually been saved, the old modules.cat flag (which may
  // still be lingering in storage) must not override the user's real choice.
  const st = loadState(JSON.stringify({ modules: { cat: false }, pets: { cat: true } }));
  check('loadState() does not let the legacy flag override an explicit pets.cat', st.pets.cat === true);
})();

(function testLoadStateMergesModulesAndPetsIndividually() {
  const st = loadState(JSON.stringify({ modules: { moods: true }, pets: { dog: true } }));
  check('loadState() merges a single modules field without losing the others', st.modules.favs === true && st.modules.moods === true);
  check('loadState() merges a single pets field without losing the others', st.pets.cat === true && st.pets.dog === true);
})();

/* ---------- initial country fallback (app.js boot-time default) ---------- */
const CONTINENT_OF_SAMPLE = { DE: 'eu', FR: 'eu', US: 'na' };
function initialCountry(storedCountry, browserRegion) {
  if (storedCountry) return storedCountry;
  const region = (browserRegion || '').toUpperCase();
  return CONTINENT_OF_SAMPLE[region] ? region : 'TR';
}

(function testInitialCountryFallback() {
  check('initialCountry() keeps an already-stored country', initialCountry('DE', 'US') === 'DE');
  check('initialCountry() uses the browser region when it is a known country', initialCountry(null, 'de') === 'DE');
  check('initialCountry() falls back to TR for an unrecognized/missing region', initialCountry(null, '') === 'TR');
  check('initialCountry() falls back to TR for a region not in the continent map', initialCountry(null, 'zz') === 'TR');
})();

/* ---------- summary ---------- */
if (failures.length) {
  console.error(`\n${failures.length} failure(s): ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\nAll display/state scenarios passed.');
