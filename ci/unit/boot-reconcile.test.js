#!/usr/bin/env node
'use strict';
/*
 * Reproduces: "the app shows 'not playing' right after it (re)starts, but
 * the radio is actually still audible, and tapping shuffle/random then
 * plays a SECOND stream on top of it."
 *
 * boot() restores `player.station` from the persisted `state.lastStation`
 * and unconditionally sets `player.status = 'idle'` - it never asks the
 * native layer whether that station is actually still playing. If the
 * Activity/WebView got recreated for any reason (an OEM killing/
 * recreating it while audio is backgrounded is the leading theory - a
 * report traced one such trigger to backing out of an open panel, though
 * that exact trigger wasn't reproducible on a clean emulator) while the
 * native player kept going, the fresh app.js instance has no idea - the
 * UI shows idle/paused over audio that's genuinely still live. The
 * existing resume-reconcile logic (ci/unit/resume-reconcile.test.js)
 * already solves this exact drift, but only on `visibilitychange` - never
 * on a fresh boot(), which is its own separate code path.
 *
 * Run with: node ci/unit/boot-reconcile.test.js
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

function run(nativeIsPlaying) {
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

        // Persisted state from a previous session: a station was playing
        // when the process/Activity went away.
        const lastStation = { id: 'x1', name: 'Test FM', cc: 'TR', tags: 'pop', url: 'https://example.com/stream' };
        window.localStorage.setItem('orbitune:v3', JSON.stringify({ lastStation, country: 'TR' }));

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
              // The ground truth boot() should be asking about but currently doesn't.
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

    const probe = dom.window.document.createElement('script');
    probe.textContent = `
      window.__test = {};
      setTimeout(() => {
        window.__test.status = player.status;
        window.__test.hasStation = !!player.station;
        window.__test.done = true;
      }, 300);
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

async function scenario(label, nativeIsPlaying, expectedStatus) {
  const r = await run(nativeIsPlaying);
  const failures = [];
  if (r.timedOut) {
    failures.push(`[${label}] test timed out`);
  } else {
    console.log(`[${label}] hasStation=${r.hasStation} status="${r.status}" (native isPlaying=${nativeIsPlaying})`);
    if (!r.hasStation) failures.push(`[${label}] expected the persisted lastStation to be restored into player.station`);
    if (r.status !== expectedStatus) {
      failures.push(`[${label}] expected player.status to become "${expectedStatus}" on boot, got "${r.status}"`);
    }
  }
  return failures;
}

async function main() {
  const failures = [
    ...(await scenario('native still genuinely playing across the restart', true, 'live')),
    ...(await scenario('native genuinely not playing - idle is correct', false, 'idle')),
  ];

  if (failures.length) {
    console.error('\nFAIL:');
    failures.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('\nOK: boot() reconciles player.status to the real native playback state, not just visibilitychange.');
  process.exit(0);
}

main();
