# Changelog

Bu branch, mevcut PWA'nın etrafına Capacitor ile gerçek bir Android APK
sarmalayıcısı ekliyor: arka planda güvenilir ses çalma, kilit ekranı/bildirim
medya kontrolleri, ve eksiksiz bir CI/CD pipeline'ı (otomatik testler +
imzalı/yayın derlemeleri). Web uygulamasının kendisi (`index.html`,
`styles.css`, `facts.js`, `pets.js`) değişmedi; sadece `app.js`'e native'e
özel kod yolları ve hata düzeltmeleri eklendi, hepsi `isNative`/`NativeAudio`
kontrolleriyle korunuyor, yani düz web/PWA davranışı aynen duruyor.

## Eklenenler

### Android uygulama sarmalayıcısı
- `capacitor.config.json`, `package.json` / `package-lock.json`: Capacitor
  proje yapılandırması ve bağımlılıklar (`@capacitor/core`,
  `@capacitor/android`, `@capgo/capacitor-native-audio`,
  `@capgo/capacitor-media-session`).
- `patches/`: [patch-package](https://github.com/ds300/patch-package) ile
  `@capgo/capacitor-media-session`'ın Android kaynak kodunda bulunan iki
  gerçek hatayı düzelten patch (aşağıdaki "Düzeltilenler" bölümüne bakın) —
  her `npm install`'da `postinstall` script'i ile otomatik uygulanıyor.

### CI/CD (`.github/workflows/`)
- **`android-apk.yml`** — release APK'sını derleyip GitHub Releases'e
  yayınlıyor. `v*` formatında bir tag push'landığında (gerçek release) veya
  manuel (`workflow_dispatch`, `dev-N` ön-sürüm derlemesi üretir)
  tetikleniyor. Tam kullanım kılavuzu için aşağıdaki "Pipeline'ı kullanma"
  bölümüne bakın.
- **`debug-logcat.yml`** — "Real App Crash & Lifecycle Test": gerçek
  uygulamayı bir emulator'a kurup, kök ekranda geri tuşuna basıldığında *ve*
  bir panel açıkken (örn. ayarlar) Activity/process'in hayatta kaldığını,
  `app.js`'in sessizce yeniden yüklenmediğini (bu native ses çalarını öksüz
  bırakır) ve hem devam ettirilen hem de taze/force-stop sonrası açılışın
  çökme içermediğini doğruluyor. Uygulamanın JS/HTML/CI dosyalarını
  etkileyen her push'ta veya manuel çalışıyor.
- **`native-audio-smoketest.yml`** — iki iş:
  - `pure-logic-unit-tests`: `ci/unit/`'teki 7 Node test dosyası (emulator
    yok, saniyeler içinde biter).
  - `smoke-test`: minimal bir harness uygulaması derleyip bir emulator
    açıyor, arka planda çalmanın + kilit ekranı/bildirim kontrollerinin
    gerçekten çalıştığını doğruluyor, bunun içinde bir **ground-truth
    eşzamanlılık kontrolü** var: ~1 saniye boyunca istasyon değiştirmeyi
    hızlıca tekrarlarken `dumpsys audio`'nun canlı
    `AudioPlaybackConfiguration` listesinden örnekleme yapıyor, uygulamanın
    uid'si için aynı anda birden fazla gerçekten `state:started` görülürse
    derlemeyi başarısız yapıyor (bu, "aynı anda iki istasyon çalıyor"
    hatasını yakalayıp düzeltmeyi kanıtlayan test — bkz. "Düzeltilenler").

### Testler (`ci/unit/`, `ci/debug/`, `ci/smoke/`)
`app.js`'e eklenen native'e özel mantık için saf Node testleri (emulator
gerektirmiyor), her biri düzeltmeden önce önce başarısız olan bir repro'ya
karşı yazıldı (TDD):
- `playback-mutex.test.js` — native-audio geçiş/çakışma mutex'i, iki gerçek
  doğrulanmış plugin hatasını modelleyen sahte (fake) implementasyonlara
  karşı (erken resolve olan `unload()`, ve eski bir registry kaydı yüzünden
  reddeden `preload()`).
- `resume-reconcile.test.js` — `visibilitychange` olayında UI durumunun
  gerçek native çalma durumuna yeniden senkronize olması, bir yarış durumu
  senaryosu dahil.
- `boot-reconcile.test.js` — aynı senkronizasyon, ama taze bir `boot()`
  üzerinde (resume'den ayrı bir kod yolu).
- `mediasession-actions.test.js` — dışarıdan tetiklenen play/pause/stop
  MediaSession eylemlerinin tek yönlü (idempotent) olduğunu, uygulamanın
  kendi toggle butonu gibi davranmadığını doğruluyor.
- `dom-boot.test.js` — gerçek `index.html` + `app.js` + `facts.js` +
  `pets.js`'i jsdom içinde hem düz-web hem native-mock'lanmış kod yolu için
  açıp, sıfır yakalanmamış exception olduğunu doğruluyor ("her buton
  sessizce çalışmayı kesti" hata sınıfı için saniyenin altında süren bir
  regresyon koruması).
- `pure-logic.test.js`, `display-and-state.test.js`, `data-integrity.test.js`
  — proaktif olarak eklenen daha geniş kapsam (fade ses eğrileri, ülke
  fallback mantığı, skip/autoskip davranışı, queue tipine bağlı komşu
  seçimi vb.), belirli bir olaya bağlı değil.
- `ci/debug/check.sh` + `push-history.js` — emulator tabanlı lifecycle
  doğrulamaları (bkz. yukarıdaki `debug-logcat.yml`); `push-history.js`,
  gerçek UI dokunuşuna gerek kalmadan "bir panel açık" durumunu simüle
  etmek için uygulamanın WebView'ini Chrome DevTools Protocol üzerinden
  (debug derlemelerinde varsayılan olarak açık) yönlendiriyor.
- `ci/smoke/` — smoke-test işinin kullandığı minimal harness uygulaması +
  kendi `app.js`'i, ground-truth çakışma ölçümü için kullanılan hızlı geçiş
  stres dizisi dahil.

## Değişenler (`app.js`)

Hepsi sadece native'e özel; düz web/PWA kod yolları değişmedi.

- Native ses çalma artık bir WebView `<audio>` elementi yerine
  `@capgo/capacitor-native-audio` (ExoPlayer tabanlı, arka planda hayatta
  kalıyor) üzerinden yapılıyor - Android, `<audio>` elementini arka planda
  herhangi bir anda askıya alabiliyordu.
- Native kilit ekranı/bildirim medya kontrolleri (çal/duraklat/sonraki/
  önceki), `@capgo/capacitor-media-session` ile, mevcut Web MediaSession
  API kod yolunu yansıtıyor.
- Native ses durumunu değiştiren her çağrı (`stop`/`unload`/`preload`/
  `play`), bir `playGen` jenerasyon sayacıyla birlikte `queueNative`
  mutex'i üzerinden sıralanıyor, böylece hızlı istasyon değiştirme asla iki
  çakışan akış bırakamıyor veya eski bir async sonucun daha yeni bir eylemi
  ezmesine yol açamıyor.
- `boot()` ve `visibilitychange` handler'ı artık `player.status`'u, UI'nin
  son bilinen durumunu doğru kabul etmek yerine, native katmanın
  gerçekte ne rapor ettiğine (`isPlaying`) göre senkronize ediyor - bir
  OEM'in Activity'yi arka planda öldürüp yeniden oluşturması (veya başka
  bir Activity-yeniden-oluşturma tetikleyicisi), UI'nin gerçekte hâlâ canlı
  olan ses üzerinde "çalmıyor" göstermesine yol açabiliyordu.
- İstasyon görseli fallback'i: Radio Browser'ın kendi `favicon` alanı boş/
  kırıksa, istasyonun `homepage` alanından türetilen bir domain-bazlı
  favicon araması ikinci bir `<img>` kaynağı olarak deneniyor, "ikon
  bulunamadı" jenerik placeholder'ı (görsel boyutuna bakılarak) tespit
  edilip gösterilmeden reddediliyor.
- İzin kapsamı kasıtlı olarak Spotify ile aynı seviyede tutuldu: sadece
  standart `POST_NOTIFICATIONS` runtime izni (kilit ekranı/bildirim UI'nin
  Android 13+'ta gösterilebilmesi için gerekli) - otomatik pil optimizasyonu
  istisnası isteği yok, OEM "otomatik başlatma" ekranları yok.

## Düzeltilenler

Gerçek bir cihazda (Xiaomi Redmi Note 8 Pro, Android 11, MIUI) kullanıcı
tarafından bildirilen ve plugin'lerin kendi Android kaynak kodunda bulunan
gerçek hatalar, her biri düzeltmeden önce eklenen başarısız bir testle:

1. **İlk açılışta her buton sessizce çalışmıyordu.** Kök sebep:
   `MediaSession.setActionHandler()` bir Promise döndürmüyor (RETURN_CALLBACK
   tarzı bir plugin metodu) - sonucuna `.catch()` çağırmak `TypeError`
   fırlatıyordu, bu da `app.js`'in üst-seviye script'inin devamının, altındaki
   hiçbir click handler bağlanmadan kesilmesine yol açıyordu. `try`/`catch`
   ile sarmalayarak düzeltildi.
2. **Geri tuşu native ses çalarını öksüz bırakıyordu.** Capacitor'ın
   varsayılan geri-tuşu davranışı, geri gidilecek bir şey olmasa da
   Activity'yi finish() edebiliyor; `MainActivity.onBackPressed()` artık
   in-app geçmiş varsa (bir panel/sheet kapatma) `webView.goBack()`,
   yoksa (Home tuşunu yansıtan) `moveTaskToBack(true)` çağırıyor - asla
   `super.onBackPressed()` değil, çünkü onun bir `BridgeActivity` üzerindeki
   davranışı sadece WebView geçmişinde gitmeyi garanti etmiyor.
3. **Aynı anda iki istasyon çalması / duraklat'ın sessizce çalışmayı
   kesmesi.** `@capgo/capacitor-native-audio`'nun `unload()`'u, gerçek
   native temizlik (`player.release()`, UI thread'e postalanıyor) henüz
   çalışmadan JS promise'ini resolve ediyor - plugin'in Android kaynak kodu
   okunarak doğrulandı. Hızlı bir istasyon değişimi, önceki akış hâlâ
   native tarafta temizlenirken yeni bir `preload()`+`play()` tetikleyip
   gerçekten iki ExoPlayer örneğinin aynı anda aktif olmasına yol
   açabiliyordu. `unload()` sonrası kısa bir savunma amaçlı gecikme ile ve
   yukarıda açıklanan `queueNative`/`playGen` mutex'iyle düzeltildi;
   `native-audio-smoketest.yml`'deki `dumpsys audio` ground-truth stres
   testiyle ampirik olarak doğrulandı (12 hızlı geçişlik bir dizi boyunca,
   uygulamanın uid'si için eşzamanlı `state:started` kaydı sayısı en fazla:
   **1**).
4. **Arka plandan yeniden başlatma sonrası, ses hâlâ gerçekten çalıyorken
   UI "çalmıyor" gösteriyordu** (ve tersi de olabiliyordu). Ne `boot()` ne
   de resume yolu native katmana gerçekte ne olduğunu soruyordu; ikisi de
   artık `NativeAudio.isPlaying()`'e göre senkronize oluyor.
5. **Bildirim/kilit ekranı çal ve duraklat butonları dokunulduğunda hiçbir
   şey yapmıyordu** (sonraki/önceki/durdur sorunsuz çalışıyordu). Kök
   sebep, `@capgo/capacitor-media-session`'ın gerçek Android kaynak kodu
   okunarak bulundu: çal/duraklat bildirim butonları,
   `PendingIntent`'lerini `MediaButtonReceiver.buildMediaButtonPendingIntent
   (context, action)` ile oluşturuyor, buna iki farklı
   `PlaybackStateCompat.ACTION_*` sabitinin bit-bazında OR'unu veriyordu
   (örn. `ACTION_PLAY_PAUSE | ACTION_PAUSE`) - ama bu yardımcı fonksiyonun
   iç `toKeyCode(long)`'u sadece tek, kesin bir sabiti eşleştiriyor, yani
   birleşik değer hiçbir şeyle eşleşmiyor ve sessizce `KEYCODE_UNKNOWN`'a
   düşüyordu. Doğru tek bayrağı geçen bir `patch-package` patch'iyle
   düzeltildi.
6. **Uygulamayı çalışan uygulamalardan (recents) kaydırıp kapatmak çalmayı
   durdurmuyordu.** `@capgo/capacitor-native-audio`'nun kendi hiçbir
   Service'i yok - process'i (ve dolayısıyla native ses çalarını) arka
   planda canlı tutan tek şey `@capgo/capacitor-media-session`'ın
   `MediaSessionService`'i, bir foreground service ki her foreground
   service gibi, açıkça ele alınmadığı sürece task kaldırılmasından sağ
   çıkıyor. İkinci bir `patch-package` patch'iyle `Service.onTaskRemoved()`
   eklenerek düzeltildi (foreground service'i durduruyor, ardından process'i
   doğrudan kill ediyor, çünkü bu noktada Activity/WebView - ve player'a JS
   bridge üzerinden ulaşmanın herhangi bir yolu - zaten gitmiş oluyor).
7. **Bir istasyona bağlanmak bazen anında başarısız oluyordu, birkaç
   manuel deneme sonrası çalışıyordu** - özellikle az önce değiştirilen bir
   istasyona geri dönülürken fark ediliyordu. Kök sebep,
   `@capgo/capacitor-native-audio`'nun gerçek kaynak kodu okunarak bulundu:
   `preloadAsset()`, iç registry'sinde bu assetId için hâlâ bir kayıt varsa
   koşulsuz olarak reddediyor; `unload()`'un bu kaydı temizlemesi
   gerekiyor, ama kendi native çağrısı, kaydı kaldıran satıra ulaşmadan
   önce hata fırlatabiliyor (JS tarafında sessizce yutuluyor), bu yüzden
   aynı istasyon için bir sonraki `preload()` anında reddediliyor - 15s
   timeout yok, anında bir hata. Sınırlı, tek seferlik bir retry (zorla
   bir `unload()` + `preload()` daha) bunu manuel tekrar dokunmaya gerek
   kalmadan otomatik olarak kurtarıyor.
8. **Bir launcher'ın now-playing widget'ından (örn. Niagara Launcher)
   duraklattıktan sonra widget'ı dismiss etmek, radyoyu kendiliğinden
   yeniden başlatıyordu.** Kök sebep: dışarıdan tetiklenen play/pause/stop
   MediaSession eylemleri, uygulamanın kendi tek çal/duraklat butonu için
   olan aynı toggle fonksiyonuna bağlıydı - zaten duraklatılmışken gelen
   bir "stop" (ya da yinelenen bir "pause"), mevcut durumu kontrol edip
   tersini yapan bu fonksiyonu, "canlı değil" görüp "devam ettir" dalına
   soktuğu için çalmayı yeniden başlatıyordu. `ensurePlaying()`/
   `ensurePaused()`/`ensureStopped()` gibi tek yönlü, durumdan bağımsız
   fonksiyonlara bölünerek düzeltildi - gerçek cihazda doğrulandı.

## Pipeline'ı kullanma

`.github/workflows/` içinde üç workflow var. İki test workflow'u otomatik
çalışıyor; release workflow'u kasıtlı olarak her push'ta **otomatik değil**
- sadece tag'ler ve manuel çalıştırmalar, böylece her gerçek GitHub Release
bilinçli bir eylem oluyor.

### Testleri çalıştırma
- **`native-audio-smoketest.yml`** ve **`debug-logcat.yml`**, `app.js`,
  `index.html`, `facts.js`, `pets.js`, veya workflow/`ci/*` dosyalarının
  kendisini etkileyen `main` veya `feature/**`'e her push'ta otomatik
  çalışıyor - hiçbir işlem gerekmiyor, sadece bir PR açmak veya commit
  push'lamak yeterli.
- İkisini de uygun bir push olmadan talep üzerine çalıştırmak için: GitHub
  → **Actions** → workflow'u seç → **Run workflow** (bu `workflow_dispatch`,
  üç workflow'da da mevcut).
- İkisi de emulator tabanlı (`pure-logic-unit-tests` hariç, o saf Node ve
  saniyeler sürüyor) ve bazen kodla ilgisiz CI-runner/emulator arızalarıyla
  başarısız olabiliyor (`adb: device offline`, GPU/texture hataları, geçici
  Maven/ağ kesintileri) - bunlar için normal çözüm job'u tekrar çalıştırmak;
  bir retry'den sonra da *tutarlı* şekilde başarısız olması araştırılmaya
  değer olan durum.

### Release çıkarma
1. **Dev/ön-sürüm derlemesi** (tag'lemeden önce gerçek cihazda test için):
   GitHub → **Actions** → **Android APK Release** → `main` üzerinde
   **Run workflow**. Bu, APK'sı eklenmiş, `dev-N` (artan bir sayaç) olarak
   tag'lenmiş bir ön-sürüm üretir - bir değişikliği bir versiyon numarasına
   bağlanmadan önce gerçek cihazda doğrulamak için kullanılır.
2. **Gerçek versiyon release'i**: bir derleme doğrulandıktan sonra, tam o
   commit'i tag'leyip push'la:
   ```sh
   git tag -a vX.Y.Z -m "Orbitune vX.Y.Z

   <bu versiyon için changelog>"
   git push origin vX.Y.Z
   ```
   `v*` ile eşleşen bir tag push'lamak aynı workflow'u tetikliyor, ama bu
   sefer "Orbitune vX.Y.Z" başlıklı gerçek (prerelease olmayan) bir GitHub
   Release'i, `Orbitune-vX.Y.Z.apk` eklenmiş şekilde yayınlıyor.
3. Workflow'un kendisi: bağımlılıkları kuruyor (patch-package patch'lerini
   uygulayarak), web asset'lerini taze bir Capacitor Android projesine
   kopyalıyor, arka plan ses izinlerini ve `MainActivity.java`'yı
   patch'liyor, bir debug APK derliyor (imzalama keystore'u gerekmiyor - bu
   sideload edilebilir bir debug derlemesi, Play Store release'i değil),
   birleştirilmiş manifest'in gerçekten 4 gerekli izni/bileşeni içerdiğini
   ve tam izin setinin sessizce büyümediğini **doğruluyor** (bir plugin
   güncellemesinin beklenmeyen bir izin eklemesi derlemeyi bilerek
   başarısız yapıyor, bilinçli bir incelemeyi zorunlu kılıyor), APK'yı
   versiyonla eşleşecek şekilde yeniden adlandırıyor, ve bir GitHub Release
   olarak yayınlıyor.

### Bir plugin güncellenirse
`npm install`, `postinstall` script'i üzerinden `patches/`'teki iki patch'i
otomatik olarak yeniden uyguluyor - başka bir şey yapmaya gerek yok, *tabii*
yeni plugin versiyonu patch'lerin dokunduğu tam satırları değiştirmediyse;
değiştirdiyse `patch-package` kurulum sırasında (sessizce atlamadan) yüksek
sesle başarısız olacak ve patch'in yeni versiyona karşı yeniden üretilmesi
gerekecek (`npx patch-package <pkg> --append` veya `node_modules/`'i
doğrudan düzenleyip `npx patch-package <pkg>`'ı tekrar çalıştırmak).
