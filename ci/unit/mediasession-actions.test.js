#!/usr/bin/env node
'use strict';
/*
 * Reproduces: "paused the radio from Niagara Launcher's now-playing widget,
 * then dismissed that widget - the radio started playing again on its own."
 * Also: a notification swipe-away did NOT restart it, which is why this
 * looked widget-specific rather than something wrong in app.js.
 *
 * Root cause: dismissing a launcher's now-playing widget (or swiping a
 * MediaStyle notification that has a delete intent wired up, or a stray/
 * duplicate hardware media-key event) sends a plain MediaSession "stop"
 * (or "pause") command - a one-directional "make it so", not a toggle.
 * app.js wired ALL three externally-triggered actions (play/pause/stop) to
 * togglePlay(), which is meant for the app's own single toggle button: it
 * inspects the CURRENT status and does the opposite. If "stop" arrives
 * while already paused, togglePlay() sees status isn't live/loading and
 * takes the "resume" branch - starting playback instead of stopping it.
 *
 * Run with: node ci/unit/mediasession-actions.test.js
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

function run() {
  return new Promise((resolve) => {
    const actionHandlers = {};
    const nativeCallLog = [];
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

        window.Capacitor = {
          isNativePlatform: () => true,
          Plugins: {
            NativeAudio: {
              configure: () => Promise.resolve(),
              preload: () => { nativeCallLog.push('preload'); return Promise.resolve(); },
              play: () => { nativeCallLog.push('play'); return Promise.resolve(); },
              pause: () => { nativeCallLog.push('pause'); return Promise.resolve(); },
              stop: () => { nativeCallLog.push('stop'); return Promise.resolve(); },
              unload: () => { nativeCallLog.push('unload'); return Promise.resolve(); },
              loop: () => Promise.resolve(),
              setVolume: () => Promise.resolve(),
              addListener: () => Promise.resolve({ remove: () => {} }),
              isPlaying: () => Promise.resolve({ isPlaying: false }),
            },
            MediaSession: {
              setMetadata: () => Promise.resolve(),
              setPlaybackState: () => Promise.resolve(),
              // Real plugin: RETURN_CALLBACK-style, no Promise. Captures
              // the handler so the test can invoke it directly, exactly
              // like a widget/notification/hardware key dismiss would.
              setActionHandler: (opts, fn) => { actionHandlers[opts.action] = fn; },
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
      player.status = 'paused'; // already paused, e.g. via the widget's own pause tap
      render();
      window.__test.done = true;
    `;
    dom.window.document.body.appendChild(probe);

    const deadline = Date.now() + 3000;
    const poll = () => {
      if (dom.window.__test && dom.window.__test.done) {
        resolve({ dom, actionHandlers, nativeCallLog, getStatus: () => dom.window.eval('player.status') });
      } else if (Date.now() > deadline) {
        resolve({ timedOut: true });
      } else {
        setTimeout(poll, 50);
      }
    };
    poll();
  });
}

async function scenarioStopWhileAlreadyPausedDoesNotResume() {
  const r = await run();
  const failures = [];
  if (r.timedOut) { failures.push('setup timed out'); return failures; }
  if (typeof r.actionHandlers.stop !== 'function') {
    failures.push('no "stop" action handler was registered at all');
    return failures;
  }

  r.nativeCallLog.length = 0;
  r.actionHandlers.stop();
  await new Promise((res) => setTimeout(res, 50));

  const status = r.getStatus();
  console.log(`[widget/notification "stop" while already paused] status after="${status}", native calls=${JSON.stringify(r.nativeCallLog)}`);
  if (r.nativeCallLog.includes('play') || r.nativeCallLog.includes('preload')) {
    failures.push(`"stop" while already paused started playback instead of stopping it - native calls: ${JSON.stringify(r.nativeCallLog)}`);
  }
  if (status === 'live' || status === 'loading') {
    failures.push(`expected status to stay stopped/paused, got "${status}"`);
  }
  try { r.dom.window.close(); } catch (_) {}
  return failures;
}

async function scenarioPauseWhileAlreadyPausedDoesNotResume() {
  const r = await run();
  const failures = [];
  if (r.timedOut) { failures.push('setup timed out'); return failures; }
  if (typeof r.actionHandlers.pause !== 'function') {
    failures.push('no "pause" action handler was registered at all');
    return failures;
  }

  r.nativeCallLog.length = 0;
  r.actionHandlers.pause();
  await new Promise((res) => setTimeout(res, 50));

  const status = r.getStatus();
  console.log(`[stray "pause" while already paused] status after="${status}", native calls=${JSON.stringify(r.nativeCallLog)}`);
  if (r.nativeCallLog.includes('play') || r.nativeCallLog.includes('preload')) {
    failures.push(`"pause" while already paused started playback instead of staying paused - native calls: ${JSON.stringify(r.nativeCallLog)}`);
  }
  try { r.dom.window.close(); } catch (_) {}
  return failures;
}

async function main() {
  const failures = [
    ...(await scenarioStopWhileAlreadyPausedDoesNotResume()),
    ...(await scenarioPauseWhileAlreadyPausedDoesNotResume()),
  ];

  if (failures.length) {
    console.error('\nFAIL:');
    failures.forEach((f) => console.error('  - ' + f));
    process.exit(1);
  }
  console.log('\nOK: MediaSession play/pause/stop action handlers are one-directional, not a toggle.');
  process.exit(0);
}

main();
