#!/usr/bin/env bash
# Real-app regression gate: installs the actual app on the emulator and
# asserts (not just prints) the two things that have already broken in
# production once each - a clean crash-free launch, and the back button
# at the root screen not destroying the Activity (which orphans the
# native audio player - see the "two stations play at once" incident).
set -euo pipefail
cd "$GITHUB_WORKSPACE"

APK=$(find android/app/build/outputs/apk/debug -name '*.apk' | head -n1)
echo "Installing $APK"
adb install -r "$APK"

adb logcat -c
adb shell am start -n com.orbitune.app/.MainActivity
echo "Waiting for the app to load and run its initial JS..."
sleep 8

adb logcat -d > full_logcat.txt
echo "--- filtered console/JS/exception lines ---"
grep -iE "chromium|console|orbitune|exception|JS |Uncaught|TypeError|ReferenceError|at file://|capacitor" full_logcat.txt > filtered_logcat.txt || true
cat filtered_logcat.txt

fail=0

if grep -q "Uncaught" full_logcat.txt; then
  echo "::error::Uncaught JS exception on initial launch - every click handler defined after it never gets wired up"
  grep "Uncaught" full_logcat.txt
  fail=1
else
  echo "OK: no uncaught JS exception on initial launch"
fi

echo "--- back-press-at-root lifecycle check ---"
adb logcat -c
adb shell input keyevent KEYCODE_BACK
sleep 2

TASK_COUNT=$(adb shell dumpsys activity activities | grep -c "com.orbitune.app" || true)
if [ "$TASK_COUNT" -eq 0 ]; then
  echo "::error::Activity task disappeared after back press at the root screen - back is finishing the Activity again, which orphans the native audio player"
  fail=1
else
  echo "OK: task still present after back press ($TASK_COUNT references)"
fi

if adb shell pidof com.orbitune.app > /dev/null 2>&1; then
  echo "OK: process still alive after back press"
else
  echo "::error::Process is gone after back press"
  fail=1
fi

echo "Re-opening via launcher intent (should resume the same instance, not reload app.js, if the fix works)..."
adb shell am start -n com.orbitune.app/.MainActivity
sleep 4
adb logcat -d > after_reopen_logcat.txt
RELOAD_COUNT=$(grep -c "Handling local request: https://localhost/app.js" after_reopen_logcat.txt || true)
echo "app.js load events since back press: $RELOAD_COUNT"
if [ "$RELOAD_COUNT" -gt 0 ]; then
  echo "::error::app.js reloaded after reopening - the Activity (and all its JS/plugin state, including the native audio tracking) was recreated from scratch instead of being resumed"
  fail=1
else
  echo "OK: existing instance was resumed, app.js was not reloaded"
fi

echo "--- fresh-process relaunch must also be crash-free (only POST_NOTIFICATIONS is requested - no battery/OEM dialogs, by design, to match Spotify's permission footprint) ---"
adb shell am force-stop com.orbitune.app
adb logcat -c
adb shell am start -n com.orbitune.app/.MainActivity
sleep 6
adb logcat -d > second_launch_logcat.txt
if grep -q "Uncaught" second_launch_logcat.txt; then
  echo "::error::Uncaught JS exception on the second (fresh-process) launch"
  grep "Uncaught" second_launch_logcat.txt
  fail=1
else
  echo "OK: no uncaught JS exception on the second launch"
fi

echo "--- back-press WITH in-app history (e.g. a panel like settings open) must ALSO not destroy the Activity ---"
# A real report: backing out while the settings panel was open still
# backgrounded/killed the app instead of just closing the panel, and the
# native audio player was found orphaned afterwards. The root-screen check
# above only covers canGoBack()==false; this pushes a history entry the
# same way app.js's openPanel() does (history.pushState), so the app is
# genuinely in the canGoBack()==true branch of onBackPressed() when BACK
# is pressed - the one that case wasn't exercising at all.
adb shell pidof com.orbitune.app > /dev/null 2>&1 || adb shell am start -n com.orbitune.app/.MainActivity
sleep 2
PID=$(adb shell pidof com.orbitune.app | tr -d '\r\n')
SOCK="webview_devtools_remote_${PID}"
if adb shell cat /proc/net/unix 2>/dev/null | grep -q "$SOCK"; then
  adb forward tcp:9333 localabstract:"$SOCK"
  sleep 1
  if timeout 20 node ci/debug/push-history.js 9333; then
    echo "OK: pushed an in-app history entry via CDP (simulating a panel being open)"
    adb forward --remove tcp:9333 || true

    adb logcat -c
    adb shell input keyevent KEYCODE_BACK
    sleep 2

    TASK_COUNT=$(adb shell dumpsys activity activities | grep -c "com.orbitune.app" || true)
    if [ "$TASK_COUNT" -eq 0 ]; then
      echo "::error::Activity task disappeared after back press WITH in-app history (panel open) - the canGoBack()==true branch is destroying the Activity instead of just navigating back, orphaning the native audio player"
      fail=1
    else
      echo "OK: task still present after back press with history open ($TASK_COUNT references)"
    fi

    if adb shell pidof com.orbitune.app > /dev/null 2>&1; then
      echo "OK: process still alive after back press with history open"
    else
      echo "::error::Process is gone after back press with history open"
      fail=1
    fi

    # The task/process checks above can both look fine even if the Activity
    # was actually destroyed and silently recreated (same task, same
    # process, brand new Activity+WebView+JS instance) - which is exactly
    # the failure mode that matters here (a fresh app.js has no idea the
    # old native audio player exists). Re-launching and checking whether
    # app.js reloads is the real, decisive signal - it's what actually
    # caught the original root-screen version of this bug.
    adb shell am start -n com.orbitune.app/.MainActivity
    sleep 4
    adb logcat -d > after_panel_back_logcat.txt
    PANEL_RELOAD_COUNT=$(grep -c "Handling local request: https://localhost/app.js" after_panel_back_logcat.txt || true)
    echo "app.js load events since the panel-open back press: $PANEL_RELOAD_COUNT"
    if [ "$PANEL_RELOAD_COUNT" -gt 0 ]; then
      echo "::error::app.js reloaded after a back press WITH in-app history (panel open) - the Activity was recreated from scratch, orphaning the native audio player, even though the task/process both looked fine"
      fail=1
    else
      echo "OK: app.js was not reloaded after the panel-open back press - the same instance was resumed"
    fi
  else
    adb forward --remove tcp:9333 || true
    echo "::warning::Could not push history via CDP - skipping the panel-open back-press scenario"
  fi
else
  echo "::warning::WebView devtools socket not found ($SOCK) - skipping the panel-open back-press scenario"
fi

echo "--- full logcat saved as artifact regardless ---"
exit $fail
