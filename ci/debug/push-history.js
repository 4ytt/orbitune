#!/usr/bin/env node
'use strict';
/*
 * Pushes a browser-history entry into the running app's WebView via the
 * Chrome DevTools Protocol - the exact same side effect app.js's
 * openPanel() has (history.pushState) whenever a panel/sheet (e.g.
 * settings) is open. WebView debugging is on by default in a Capacitor
 * debug build, exposed over a unix socket that check.sh forwards to a
 * local TCP port before calling this script.
 *
 * This lets the back-press lifecycle test actually exercise the real
 * canGoBack()==true branch of MainActivity.onBackPressed() - the one a
 * real user report traced the "app backgrounds/kills instead of just
 * closing the open panel" bug to - instead of only the already-covered
 * root-screen (no history) case.
 *
 * Usage: node push-history.js <port>
 */
const http = require('http');

// Hard safety net: a hung adb forward / unresponsive emulator must never
// hang the whole CI job (it already did once - 20+ minutes stuck with no
// progress, because nothing here had a timeout). No single step below
// should take anywhere near this long; if it does, something's wedged and
// the right move is to fail fast, not wait forever.
const hardTimeout = setTimeout(() => {
  console.error('push-history failed: hard timeout (15s) - something is hung, failing fast instead of blocking the job');
  process.exit(1);
}, 15000);
hardTimeout.unref?.();

function getJson(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(new Error(`GET ${url} timed out after ${timeoutMs}ms`)); });
  });
}

(async () => {
  const port = process.argv[2] || '9333';
  const pages = await getJson(`http://localhost:${port}/json`, 5000);
  const page = pages.find((p) => p.url && /^https?:\/\//.test(p.url)) || pages[0];
  if (!page || !page.webSocketDebuggerUrl) {
    console.error('No inspectable WebView page with a debugger URL found:', JSON.stringify(pages));
    process.exit(1);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('WebSocket open timed out after 5s')), 5000);
    ws.addEventListener('open', () => { clearTimeout(timer); resolve(); });
    ws.addEventListener('error', (e) => { clearTimeout(timer); reject(new Error('WebSocket error: ' + (e.message || e))); });
  });
  const id = 1;
  const result = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Runtime.evaluate timed out after 5s')), 5000);
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === id) { clearTimeout(timer); resolve(msg); }
    });
    ws.send(JSON.stringify({
      id,
      method: 'Runtime.evaluate',
      params: { expression: "history.pushState({ __test_panel: true }, ''); history.length" },
    }));
  });
  ws.close();
  console.log('Runtime.evaluate result:', JSON.stringify(result));
  clearTimeout(hardTimeout);
  if (result.exceptionDetails || result.error) {
    console.error('pushState call failed');
    process.exit(1);
  }
})().catch((e) => { console.error('push-history failed:', e.message); process.exit(1); });
