#!/usr/bin/env node
'use strict';
/*
 * Regression test for the "two stations play at once / pause stops working"
 * bug: @capgo/capacitor-native-audio's stop/unload/preload/play calls don't
 * cancel each other the way the old <audio> element's .src reassignment did,
 * so rapidly switching stations could leave two native players running.
 *
 * The fix in app.js serializes every native-playback call through a queue
 * (queueNative) and re-checks a generation counter (playGen) before each
 * step, so an abandoned attempt bails out - and undoes its own preload -
 * before ever calling play(). This test re-implements that exact pattern
 * (keep it in sync with app.js if that logic changes) against a fake native
 * layer with artificial latency, which is what actually exposes the race:
 * with zero latency the bug can't manifest, same as it wouldn't show up in
 * a desktop browser's instant local playback.
 *
 * Pure Node, no emulator/device needed - run with: node ci/unit/playback-mutex.test.js
 */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeFakeNativeAudio(log) {
  let loaded = null;
  let playing = null;
  return {
    async stop() { log.push(['stop', playing]); playing = null; await delay(5); },
    async unload() { log.push(['unload', loaded]); loaded = null; await delay(5); },
    async preload(assetPath) { await delay(30); loaded = assetPath; log.push(['preload', assetPath]); },
    async play() {
      await delay(10);
      if (playing) throw new Error(`play() called while "${playing}" was already playing - OVERLAP BUG`);
      playing = loaded;
      log.push(['play', playing]);
    },
    getPlaying() { return playing; },
  };
}

// Models a real, confirmed bug in @capgo/capacitor-native-audio's Android
// implementation: unload()'s JS promise resolves as soon as it's posted to
// the UI thread, NOT once the actual player.release() (which runs later,
// whenever that thread gets to it) has finished - see StreamAudioAsset.java
// unload()/NativeAudio.java's unload() plugin method. `wait(120)` in
// app.js after unload() is the defensive mitigation; this fake models the
// gap that mitigation exists for, so removing it should make this scenario
// fail.
function makeFakeNativeAudioWithSlowRelease(log) {
  let loaded = null;
  let playing = null;
  let trulyReleased = true;
  return {
    async stop() { log.push(['stop', playing]); playing = null; await delay(5); },
    unload() {
      log.push(['unload-resolves', loaded]);
      trulyReleased = false;
      const releasing = loaded;
      loaded = null;
      setTimeout(() => { trulyReleased = true; log.push(['unload-actually-finished', releasing]); }, 80);
      return Promise.resolve(); // resolves immediately - that's the real bug
    },
    async preload(assetPath) {
      await delay(10);
      if (!trulyReleased) {
        throw new Error(`preload("${assetPath}") called while the previous asset was still mid-teardown natively - OVERLAP WINDOW BUG`);
      }
      loaded = assetPath;
      log.push(['preload', assetPath]);
    },
    async play() {
      await delay(5);
      if (playing) throw new Error(`play() called while "${playing}" was already playing - OVERLAP BUG`);
      playing = loaded;
      log.push(['play', playing]);
    },
    getPlaying() { return playing; },
  };
}

// Models a real, confirmed bug found by reading the plugin's actual Android
// source (NativeAudio.java's preloadAsset()): it unconditionally rejects if
// its internal registry still has an entry for this assetId -
// `if (audioAssetList.containsKey(audioId)) { call.reject(...); return; }`.
// unload() is supposed to clear that entry, but unload()'s own native call
// (asset.unload(), e.g. posting to a stale/destroyed Activity's
// runOnUiThread) can throw BEFORE the line that removes the registry entry
// ever runs - and our own code swallows that unload() failure silently
// (try{}catch(_){}), so the very next preload() for the same station hits
// this guard and rejects immediately (no 15s timeout, just an instant
// "connection error"). This models exactly that: switching AWAY from an
// already-loaded station has its unload() call throw without clearing the
// registry (the first unload, with nothing loaded yet, has nothing to get
// stuck on - the bug bites on the switch-away/return, not the very first
// play); a bare retry (another unload + preload) is what actually
// recovers, same as a user manually re-tapping the station eventually
// succeeds in the field.
function makeFakeNativeAudioWithStuckRegistryOnUnloadFailure(log, failOnUnloadCall = 2) {
  let loaded = null;
  let playing = null;
  let unloadCalls = 0;
  return {
    async stop() { log.push(['stop', playing]); playing = null; await delay(5); },
    async unload() {
      unloadCalls++;
      await delay(5);
      if (unloadCalls === failOnUnloadCall) {
        log.push(['unload-THREW-NATIVELY (registry entry NOT cleared)', loaded]);
        throw new Error('simulated: asset.unload() threw before audioAssetList.remove() ran');
      }
      log.push(['unload', loaded]);
      loaded = null;
    },
    async preload(assetPath) {
      await delay(10);
      if (loaded) {
        throw new Error(`AUDIO_ASSET_ALREADY_EXISTS - stream (simulated preloadAsset() registry guard, loaded="${loaded}")`);
      }
      loaded = assetPath;
      log.push(['preload', assetPath]);
    },
    async play() {
      await delay(5);
      if (playing) throw new Error(`play() called while "${playing}" was already playing - OVERLAP BUG`);
      playing = loaded;
      log.push(['play', playing]);
    },
    getPlaying() { return playing; },
  };
}

// --- exact copy of the mutex pattern from app.js (playStation's native branch) ---
function makePlayer(NativeAudio) {
  let nativeQueue = Promise.resolve();
  function queueNative(task) {
    const run = () => Promise.resolve().then(task);
    const p = nativeQueue.then(run, run);
    nativeQueue = p.catch(() => {});
    return p;
  }
  let playGen = 0;
  async function playStation(stationId) {
    const gen = ++playGen;
    await queueNative(async () => {
      if (gen !== playGen) return;
      try { await NativeAudio.stop(); } catch (_) {}
      try { await NativeAudio.unload(); } catch (_) {}
      await delay(120); // mirrors the wait(120) defensive delay in app.js
      if (gen !== playGen) return;
      try {
        await NativeAudio.preload(stationId);
      } catch (_) {
        // preload() can reject because its native registry still has a
        // stale entry for this assetId - from unload() above throwing
        // before it ever reached the line that clears that entry, which
        // we just silently swallowed. One forced unload+preload retry is
        // the only place left to recover from that.
        if (gen !== playGen) return;
        try { await NativeAudio.stop(); } catch (_) {}
        try { await NativeAudio.unload(); } catch (_) {}
        await delay(120);
        if (gen !== playGen) return;
        await NativeAudio.preload(stationId);
      }
      if (gen !== playGen) {
        try { await NativeAudio.stop(); } catch (_) {}
        try { await NativeAudio.unload(); } catch (_) {}
        return;
      }
      await NativeAudio.play();
    });
  }
  return { playStation };
}

async function scenarioDoubleTap() {
  const log = [];
  const fake = makeFakeNativeAudio(log);
  const player = makePlayer(fake);

  // Exactly what a fast "next station" double-tap does: a second
  // playStation() call fires before the first one has settled.
  const pA = player.playStation('A.mp3');
  const pB = player.playStation('B.mp3');
  await Promise.all([pA, pB]);
  await delay(100); // let any stray async work surface

  const plays = log.filter((e) => e[0] === 'play');
  const failures = [];
  if (plays.length !== 1) failures.push(`expected exactly 1 play() call, got ${plays.length}: ${JSON.stringify(log)}`);
  if (fake.getPlaying() !== 'B.mp3') failures.push(`expected B.mp3 to end up playing, got ${fake.getPlaying()}`);
  if (plays.length === 1 && plays[0][1] !== 'B.mp3') failures.push(`the one play() call was for "${plays[0][1]}", not B.mp3`);
  return failures;
}

async function scenarioTripleTap() {
  const log = [];
  const fake = makeFakeNativeAudio(log);
  const player = makePlayer(fake);

  await Promise.all([player.playStation('X'), player.playStation('Y'), player.playStation('Z')]);
  await delay(100);

  const plays = log.filter((e) => e[0] === 'play');
  const failures = [];
  if (plays.length !== 1 || plays[0][1] !== 'Z') {
    failures.push(`three-way race: expected exactly 1 play() call for "Z", got ${JSON.stringify(plays)}`);
  }
  return failures;
}

async function scenarioSequentialIsUnaffected() {
  // Sanity check: the fix must not break the normal, non-racing case.
  const log = [];
  const fake = makeFakeNativeAudio(log);
  const player = makePlayer(fake);

  await player.playStation('A');
  await player.playStation('B');
  await delay(50);

  const plays = log.filter((e) => e[0] === 'play');
  const failures = [];
  if (plays.length !== 2) failures.push(`sequential switches should both play, got ${JSON.stringify(plays)}`);
  if (fake.getPlaying() !== 'B') failures.push(`expected B to end up playing, got ${fake.getPlaying()}`);
  return failures;
}

async function scenarioSurvivesSlowNativeRelease() {
  // Sequential (not even racing) station switch, but against the fake that
  // models unload()'s real early-resolve bug - this is what the wait(120)
  // in app.js exists to survive. Without it, preload() would fire while
  // the previous asset is still natively mid-teardown.
  const log = [];
  const fake = makeFakeNativeAudioWithSlowRelease(log);
  const player = makePlayer(fake);

  await player.playStation('A');
  await player.playStation('B');
  await delay(150);

  const plays = log.filter((e) => e[0] === 'play');
  const failures = [];
  if (plays.length !== 2) failures.push(`expected both switches to eventually play cleanly, got ${JSON.stringify(log)}`);
  if (fake.getPlaying() !== 'B') failures.push(`expected B to end up playing, got ${fake.getPlaying()}`);
  return failures;
}

async function scenarioRecoversFromStuckRegistryAfterUnloadFailure() {
  // Reproduces: "returning to a station sometimes errors instantly, a
  // couple of retries later it connects fine." Play A (succeeds, loads
  // normally), switch to B - but THIS switch's unload() (of A) throws
  // without clearing the fake's registry, so B's preload() would reject
  // immediately without a retry.
  const log = [];
  const fake = makeFakeNativeAudioWithStuckRegistryOnUnloadFailure(log, 2);
  const player = makePlayer(fake);

  await player.playStation('A');
  await delay(150);
  await player.playStation('B');
  await delay(150);

  const failures = [];
  const plays = log.filter((e) => e[0] === 'play');
  if (fake.getPlaying() !== 'B') {
    failures.push(`expected B to end up playing despite its switch-in unload() throwing, got ${JSON.stringify(log)}`);
  }
  return failures;
}

async function main() {
  const scenarios = {
    'rapid double-tap never double-plays': scenarioDoubleTap,
    'rapid triple-tap only plays the last station': scenarioTripleTap,
    'normal sequential switches still both play': scenarioSequentialIsUnaffected,
    'survives capacitor-native-audio\'s slow/early-resolving unload()': scenarioSurvivesSlowNativeRelease,
    'recovers when unload() throws and leaves the native registry stuck': scenarioRecoversFromStuckRegistryAfterUnloadFailure,
  };

  let allFailures = [];
  for (const [name, fn] of Object.entries(scenarios)) {
    try {
      const failures = await fn();
      if (failures.length) {
        console.error(`FAIL: ${name}`);
        failures.forEach((f) => console.error('  - ' + f));
        allFailures = allFailures.concat(failures);
      } else {
        console.log(`OK: ${name}`);
      }
    } catch (e) {
      console.error(`FAIL: ${name} (threw) - ${e.message}`);
      allFailures.push(e.message);
    }
  }

  if (allFailures.length) {
    console.error(`\n${allFailures.length} failure(s)`);
    process.exit(1);
  }
  console.log('\nAll playback-mutex scenarios passed.');
}

main();
