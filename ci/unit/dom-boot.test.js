#!/usr/bin/env node
'use strict';
/*
 * Loads the REAL index.html + app.js + facts.js + pets.js together in a
 * simulated browser (jsdom) and asserts zero uncaught exceptions during
 * initial script execution - once as a plain web/PWA page, and once with
 * a mocked window.Capacitor (the native Android shell's code path).
 *
 * This is the fast (sub-second, no emulator) line of defense against
 * exactly the bug that broke every button in production: a synchronous
 * throw partway through app.js (calling `.catch()` on
 * MediaSessionNative.setActionHandler(...), a callback-style native
 * plugin method that does NOT return a promise - the mock below is
 * faithful to that real quirk) aborted the rest of the script before it
 * ever reached `const discWrap = $('discWrap')`, which in turn made
 * pets.js throw too (discWrap is not defined). One root cause, two
 * cascading ReferenceErrors, and every click handler defined after the
 * crash point never got wired up. The first version of this test only
 * ran the plain-web pass and would NOT have caught that bug, since the
 * broken code only runs when window.Capacitor exists.
 *
 * The Android emulator lifecycle test (ci/debug/check.sh) also checks
 * this, on a real device/process, but takes minutes to boot; this catches
 * the same class of bug in under a second, for both code paths.
 *
 * Network calls are stubbed out - this only cares about synchronous
 * top-level script execution, the same as a user simply opening the page
 * would trigger before touching anything.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
// Scripts/styles are injected manually below as real <script> elements
// (preserving global const/let visibility across them, the way sequential
// <script> tags on one real page behave); strip the original tags so
// jsdom doesn't also try to fetch them over the network and fail.
html = html
  .replace(/<script src="[^"]+"><\/script>/g, '')
  .replace(/<link rel="stylesheet"[^>]*>/g, '');

const scriptFiles = ['app.js', 'facts.js', 'pets.js'];

// A faithful-enough mock of the real Capacitor plugin proxy: every method
// returns a Promise EXCEPT setActionHandler, which really is a
// RETURN_CALLBACK-style native method with no promise return value at all -
// that mismatch is exactly what caused the original crash.
function makeMockCapacitor() {
  const ok = () => Promise.resolve();
  return {
    isNativePlatform: () => true,
    Plugins: {
      NativeAudio: {
        configure: ok, preload: ok, play: ok, pause: ok, resume: ok,
        stop: ok, unload: ok, loop: ok, setVolume: ok,
        addListener: () => Promise.resolve({ remove: () => {} }),
      },
      MediaSession: {
        setMetadata: ok,
        setPlaybackState: ok,
        setActionHandler: () => undefined, // not a promise - see note above
      },
    },
  };
}

function runPass(label, setupWindow) {
  return new Promise((resolve) => {
    const errors = [];
    const dom = new JSDOM(html, {
      url: 'https://localhost/',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      beforeParse(window) {
        window.matchMedia = () => ({
          matches: false,
          addListener() {}, removeListener() {},
          addEventListener() {}, removeEventListener() {},
        });
        window.structuredClone = global.structuredClone;
        window.fetch = () => Promise.reject(new Error('network disabled in dom-boot test'));
        window.addEventListener('error', (e) => {
          errors.push((e.error && e.error.stack) || e.message || String(e));
        });
        if (setupWindow) setupWindow(window);
      },
    });

    for (const file of scriptFiles) {
      const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
      // No try/catch wrapper: that would make every top-level const/let in
      // it block-scoped instead of global, breaking the exact cross-script
      // visibility (app.js's `$`, `discWrap`, ... visible to facts.js/
      // pets.js) this test exists to verify. An uncaught exception in a
      // real classic script fires a window 'error' event and aborts the
      // rest of that script, which the listener above already captures -
      // this mirrors that precisely.
      const script = dom.window.document.createElement('script');
      script.textContent = code;
      dom.window.document.body.appendChild(script);
    }

    setTimeout(() => {
      const uniqueErrors = [...new Set(errors)];
      const problems = [];

      if (uniqueErrors.length) {
        problems.push(`${uniqueErrors.length} uncaught exception(s):`);
        uniqueErrors.forEach((e) => problems.push('  - ' + e));
      }

      // app.js's very last statement assigns window.OrbApp, right before
      // boot(). If anything earlier threw, execution never reaches it - a
      // far more reliable completion signal than any particular const/let,
      // since those don't attach to `window` and can't be read back.
      if (!dom.window.OrbApp || typeof dom.window.OrbApp.openSheet !== 'function') {
        problems.push('window.OrbApp was never set - app.js aborted before its last line, so every click handler after the crash point was never wired up');
      }

      if (!dom.window.document.getElementById('btnPlay')) {
        problems.push('#btnPlay is missing from the DOM entirely');
      }

      // app.js leaves a requestAnimationFrame loop (disc spin) and a
      // setInterval (listening-time stats) running forever, same as a
      // real page left open - stop them so this dom instance can be GC'd
      // and the process can exit.
      try { dom.window.close(); } catch (_) {}

      resolve({ label, ok: problems.length === 0, problems });
    }, 300);
  });
}

async function main() {
  const results = [
    await runPass('plain web/PWA (no window.Capacitor)', null),
    await runPass('native shell (mocked window.Capacitor)', (window) => { window.Capacitor = makeMockCapacitor(); }),
  ];

  let anyFail = false;
  for (const r of results) {
    if (r.ok) {
      console.log(`OK: ${r.label} - booted with zero uncaught exceptions, window.OrbApp set, #btnPlay present`);
    } else {
      anyFail = true;
      console.error(`FAIL: ${r.label}`);
      r.problems.forEach((p) => console.error('  ' + p));
    }
  }

  if (anyFail) process.exit(1);
  console.log('\nAll dom-boot scenarios passed for both the web and native code paths.');
  process.exit(0);
}

main();
