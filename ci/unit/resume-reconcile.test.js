#!/usr/bin/env node
'use strict';
/*
 * Reproduces: "I reopened the app and it looked like nothing was playing
 * (play button showing, not pause) even though audio was still going."
 *
 * Whatever caused the JS-side player.status to drift from the real native
 * playback state (an OEM killing/restarting the process is the leading
 * theory, but the exact trigger doesn't matter here), app.js has no code
 * at all that re-checks the real native state when the page becomes
 * visible again - so once it drifts, the UI just stays wrong until the
 * user manually hits play/pause. This test sets up exactly that drifted
 * state, fires `visibilitychange`, and asserts the UI gets reconciled to
 * what the native layer actually reports.
 *
 * Run with: node ci/unit/resume-reconcile.test.js
 * (needs ci/unit/node_modules - run `npm ci` in ci/unit first)
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
html = html
  .replace(/<script src="[^"]+"><\/script>/g, '')
  .replace(/<link rel="stylesheet"[^>]*>/g, '');

function run(nativeIsPlaying, startStatus) {
  return new Promise((resolve) => {
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
        window.fetch = () => Promise.reject(new Error('network disabled in test'));

        // Mock native layer: the real plugin, actually playing.
        window.Capacitor = {
          isNativePlatform: () => true,
          Plugins: {
            NativeAudio: {
              configure: () => Promise.resolve(),
              preload: () => Promise.resolve(),
              play: () => Promise.resolve(),
              pause: () => Promise.resolve(),
              stop: () => Promise.resolve(),
              unload: () => Promise.resolve(),
              loop: () => Promise.resolve(),
              setVolume: () => Promise.resolve(),
              addListener: () => Promise.resolve({ remove: () => {} }),
              // The ground truth this test is about.
              isPlaying: () => Promise.resolve({ isPlaying: nativeIsPlaying }),
            },
            MediaSession: {
              setMetadata: () => Promise.resolve(),
              setPlaybackState: () => Promise.resolve(),
              setActionHandler: () => undefined,
            },
          },
        };
      },
    });

    for (const file of ['app.js']) {
      const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
      const script = dom.window.document.createElement('script');
      script.textContent = code;
      dom.window.document.body.appendChild(script);
    }

    // Probe script: shares top-level scope with app.js (real sequential
    // <script> tags), so it can reach `player`/`render`/`updateMediaSession`
    // directly - these aren't exposed on `window`.
    const probe = dom.window.document.createElement('script');
    probe.textContent = `
      window.__test = {};
      // Simulate the drifted state: there IS a station, but the JS side
      // thinks it's idle/not-playing - exactly what a fresh boot() after
      // an unexpected process restart would produce, while the native
      // layer (mocked above) says it's actually still playing.
      player.station = { id: 'x1', name: 'Test FM', cc: 'TR', tags: 'pop', url: 'https://example.com/stream' };
      player.status = '${startStatus}';
      render();
      window.__test.statusBeforeResume = player.status;
      window.__test.playButtonTextBefore = document.getElementById('nowStatusText').textContent;

      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      setTimeout(() => {
        window.__test.statusAfterResume = player.status;
        window.__test.playButtonTextAfter = document.getElementById('nowStatusText').textContent;
        window.__test.done = true;
      }, 200);
    `;
    dom.window.document.body.appendChild(probe);

    const deadline = Date.now() + 3000;
    const poll = () => {
      if (dom.window.__test && dom.window.__test.done) {
        const result = dom.window.__test;
        try { dom.window.close(); } catch (_) {}
        resolve(result);
      } else if (Date.now() > deadline) {
        try { dom.window.close(); } catch (_) {}
        resolve({ timedOut: true });
      } else {
        setTimeout(poll, 50);
      }
    };
    poll();
  });
}

function runRaceScenario() {
  return new Promise((resolve) => {
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
        window.fetch = () => Promise.reject(new Error('network disabled in test'));
        window.__nativeCallLog = [];
        const listeners = {};
        window.Capacitor = {
          isNativePlatform: () => true,
          Plugins: {
            NativeAudio: {
              configure: () => Promise.resolve(),
              preload: () => { window.__nativeCallLog.push('preload'); return Promise.resolve(); },
              play: () => {
                window.__nativeCallLog.push('play');
                // Simulate the real native layer's behaviour: a
                // 'currentTime' tick shortly after play() is what actually
                // flips app.js's status from "loading" to "live".
                setTimeout(() => { (listeners.currentTime || []).forEach((cb) => cb()); }, 10);
                return Promise.resolve();
              },
              pause: () => { window.__nativeCallLog.push('pause'); return Promise.resolve(); },
              stop: () => Promise.resolve(),
              unload: () => Promise.resolve(),
              loop: () => Promise.resolve(),
              setVolume: () => Promise.resolve(),
              addListener: (eventName, cb) => {
                (listeners[eventName] = listeners[eventName] || []).push(cb);
                return Promise.resolve({ remove: () => {} });
              },
              // Deliberately slow + stale: by the time this resolves (still
              // reporting the pre-resume state), the user will already have
              // tapped play themselves - exactly the real-world race.
              isPlaying: () => new Promise((res) => setTimeout(() => res({ isPlaying: false }), 150)),
            },
            MediaSession: {
              setMetadata: () => Promise.resolve(),
              setPlaybackState: () => Promise.resolve(),
              setActionHandler: () => undefined,
            },
          },
        };
      },
    });

    for (const file of ['app.js']) {
      const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
      const script = dom.window.document.createElement('script');
      script.textContent = code;
      dom.window.document.body.appendChild(script);
    }

    const probe = dom.window.document.createElement('script');
    probe.textContent = `
      window.__test = {};
      player.station = { id: 'x1', name: 'Test FM', cc: 'TR', tags: 'pop', url: 'https://example.com/stream' };
      player.status = 'paused'; // user had paused it before backgrounding

      // App becomes visible again - fires the slow/stale reconciliation query.
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      // The user, seeing "paused" right away (the query hasn't resolved
      // yet), taps play immediately - well before the 150ms stale query
      // resolves.
      setTimeout(() => { togglePlay(); }, 20);

      setTimeout(() => {
        window.__test.finalStatus = player.status;
        window.__test.callLog = window.__nativeCallLog.slice();
        window.__test.done = true;
      }, 400);
    `;
    dom.window.document.body.appendChild(probe);

    const deadline = Date.now() + 3000;
    const poll = () => {
      if (dom.window.__test && dom.window.__test.done) {
        const result = dom.window.__test;
        try { dom.window.close(); } catch (_) {}
        resolve(result);
      } else if (Date.now() > deadline) {
        try { dom.window.close(); } catch (_) {}
        resolve({ timedOut: true });
      } else {
        setTimeout(poll, 50);
      }
    };
    poll();
  });
}

async function scenario(label, nativeIsPlaying, startStatus, expectedStatus) {
  const r = await run(nativeIsPlaying, startStatus);
  const failures = [];
  if (r.timedOut) {
    failures.push('test timed out waiting for the resume-reconcile probe to finish');
  } else {
    console.log(`[${label}] before="${r.statusBeforeResume}" ("${r.playButtonTextBefore}")  after="${r.statusAfterResume}" ("${r.playButtonTextAfter}")`);
    if (r.statusAfterResume !== expectedStatus) {
      failures.push(`[${label}] expected player.status to become "${expectedStatus}", got "${r.statusAfterResume}"`);
    }
  }
  return failures;
}

async function raceScenario() {
  const r = await runRaceScenario();
  const failures = [];
  if (r.timedOut) {
    failures.push('race scenario timed out');
    return failures;
  }
  console.log(`[race: stale reconcile vs fresh user tap] final status="${r.finalStatus}", native calls=${JSON.stringify(r.callLog)}`);
  if (r.finalStatus !== 'live') {
    failures.push(`expected the fresh play tap to win and end up "live", but the stale reconcile stomped it to "${r.finalStatus}"`);
  }
  const pauseAfterPlay = r.callLog.lastIndexOf('pause') > r.callLog.indexOf('play');
  if (pauseAfterPlay) {
    failures.push(`a pause() call reached the native layer AFTER play() - the stale reconcile tried to pause what the user just started playing: ${JSON.stringify(r.callLog)}`);
  }
  return failures;
}

async function main() {
  const failures = [
    ...(await scenario('native says playing, UI was stuck idle', true, 'idle', 'live')),
    ...(await scenario('native says NOT playing, UI was stuck live', false, 'live', 'paused')),
    ...(await raceScenario()),
  ];

  if (failures.length) {
    console.error('\nFAIL:');
    failures.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('\nOK: app.js reconciles player.status/UI to the real native playback state on resume, in both directions.');
  process.exit(0);
}

main();
