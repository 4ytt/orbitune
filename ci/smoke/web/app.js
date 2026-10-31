/* Minimal harness: exercises the exact same NativeAudio + MediaSession calls
   app.js uses for real stations, against a bundled local test tone instead of
   a live stream, so the CI assertion doesn't depend on any external service. */
(function () {
  'use strict';
  var statusEl = document.getElementById('status');
  function log(msg) {
    if (statusEl) statusEl.textContent = msg;
    console.log('[smoke] ' + msg);
  }

  function boot() {
    var Cap = window.Capacitor;
    if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) { log('not-native'); return; }
    var NativeAudio = Cap.Plugins && Cap.Plugins.NativeAudio;
    var MediaSession = Cap.Plugins && Cap.Plugins.MediaSession;
    if (!NativeAudio || !MediaSession) { log('plugins-missing'); return; }

    // Registered so the smoke test can prove a real transport-control event
    // (hardware/notification media button) actually reaches our JS code, not
    // just that the notification/session exists and reports the right state.
    try {
      MediaSession.setActionHandler({ action: 'pause' }, function () { console.log('SMOKE_ACTION_FIRED:pause'); });
      MediaSession.setActionHandler({ action: 'play' }, function () { console.log('SMOKE_ACTION_FIRED:play'); });
    } catch (e) { console.log('SMOKE: setActionHandler threw: ' + (e && e.message)); }

    NativeAudio.configure({ focus: true, background: true, backgroundPlayback: true, showNotification: false })
      .then(function () {
        return NativeAudio.preload({ assetId: 'smoke', assetPath: 'assets/sounds/test.mp3', isUrl: false, volume: 1 });
      })
      .then(function () { return NativeAudio.loop({ assetId: 'smoke' }); })
      .then(function () { return MediaSession.setMetadata({ title: 'Smoke Test', artist: 'CI', album: 'Orbitune' }); })
      .then(function () { return MediaSession.setPlaybackState({ playbackState: 'playing' }); })
      .then(function () { log('playing'); })
      .catch(function (e) { log('error: ' + (e && e.message ? e.message : e)); });
  }

  // Ground-truth overlap stress test: hammer the exact same
  // stop->unload->wait(120)->preload->play mutex sequence app.js uses,
  // alternating between two AUDIBLY DISTINCT tones on the SAME assetId,
  // as fast as a user mashing next/prev would. If two native players ever
  // end up genuinely active at once, dumpsys audio (sampled by check.sh
  // while this runs) will show 2+ AudioPlaybackConfiguration entries for
  // this app's uid - actual evidence, not theory.
  function stressSwitchTest(NativeAudio) {
    // Deliberately the SAME assetId boot() already preloaded/looped above -
    // the real app only ever has one NATIVE_ASSET_ID ('stream'). Using a
    // different id here would let boot()'s own tone keep playing
    // independently alongside this test's tones, which would show up in
    // dumpsys audio as "2 concurrent started" for a reason that has
    // nothing to do with the switching race this test exists to catch.
    const ASSET_ID = 'smoke';
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    let nativeQueue = Promise.resolve();
    function queueNative(task) {
      const run = () => Promise.resolve().then(task);
      const p = nativeQueue.then(run, run);
      nativeQueue = p.catch(() => {});
      return p;
    }
    let gen = 0;
    async function switchTo(path) {
      const myGen = ++gen;
      await queueNative(async () => {
        if (myGen !== gen) return;
        try { await NativeAudio.stop({ assetId: ASSET_ID }); } catch (_) {}
        try { await NativeAudio.unload({ assetId: ASSET_ID }); } catch (_) {}
        await wait(120);
        if (myGen !== gen) return;
        await NativeAudio.preload({ assetId: ASSET_ID, assetPath: path, isUrl: false, volume: 1 });
        if (myGen !== gen) {
          try { await NativeAudio.stop({ assetId: ASSET_ID }); } catch (_) {}
          try { await NativeAudio.unload({ assetId: ASSET_ID }); } catch (_) {}
          return;
        }
        await NativeAudio.play({ assetId: ASSET_ID });
      });
    }
    (async () => {
      const tones = ['assets/sounds/toneA.mp3', 'assets/sounds/toneB.mp3'];
      for (let i = 0; i < 12; i++) {
        switchTo(tones[i % 2]); // deliberately NOT awaited - this is the mash
        await wait(90);
      }
      await wait(500);
      console.log('SMOKE_STRESS_DONE');
    })();
  }

  document.addEventListener('deviceready', boot);
  setTimeout(boot, 1000); // fallback in case deviceready already fired or never fires
  setTimeout(() => {
    const Cap = window.Capacitor;
    const NativeAudio = Cap && Cap.Plugins && Cap.Plugins.NativeAudio;
    if (NativeAudio) stressSwitchTest(NativeAudio);
  }, 2000);
})();
