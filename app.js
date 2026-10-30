/* Orbitune — world radio on a record.
   Plain JS, no build step. Data: Radio Browser (radio-browser.info).      */
'use strict';

/* ───────────────────────── strings ───────────────────────── */
const STR = {
  tr: {
    'a11y.search': 'Ara', 'a11y.library': 'Kitaplığım', 'a11y.settings': 'Ayarlar',
    'a11y.disc': 'Plak: dokun rastgele çal, çevir istasyon değiştir', 'a11y.favorite': 'Favorilere ekle',
    'a11y.prev': 'Önceki istasyon', 'a11y.next': 'Sonraki istasyon', 'a11y.play': 'Çal / duraklat',
    'a11y.more': 'Diğer', 'a11y.close': 'Kapat', 'a11y.stations': 'İstasyon listesi', 'a11y.cat': 'Kedi Tarçın',
    'scope.all': 'Dünya', 'hint.region': 'Dokun: {abl} rastgele ülke ve istasyon · Çevir: {country} içinde gez',
    'abl.all': 'dünyanın her yerinden', 'abl.eu': 'Avrupa’dan', 'abl.as': 'Asya’dan', 'abl.af': 'Afrika’dan',
    'abl.na': 'Kuzey Amerika’dan', 'abl.sa': 'Güney Amerika’dan', 'abl.oc': 'Okyanusya’dan',
    'toast.scope': 'Rastgele mod açık: plağa her dokunuşta {abl} yeni bir istasyon',
    'countries.scopeOn': 'Şu an açık · plağa her dokunuş yeni bir ülke getirir',
    'greet.morning': 'Günaydın', 'greet.day': 'İyi günler', 'greet.evening': 'İyi akşamlar', 'greet.night': 'İyi geceler',
    'a11y.pets': 'Dostlar', 'pets.title': 'Dostlar', 'pets.setHint': 'Ekrandaki sevimli hayvanları seç',
    'cat.meow': 'Miyav!', 'cat.purr': 'Mırrr…', 'cat.wee': 'Viiiii!', 'cat.hi': 'Günaydııın', 'cat.dizzy': 'Başım döndü!',
    'cat.bored': 'Sıkıldım…', 'cat.yay': 'Yaşasın!', 'cat.down': 'Hop!',
    offline: 'İnternet bağlantısı yok. Bağlanınca kaldığın yerden devam edebilirsin.',
    'dial.label': 'Frekans',
    'hint.default': 'Dokun: {country} içinden rastgele · Çevir: istasyonları gez',
    'hint.loading': '{country} istasyonları yükleniyor…',
    'hint.empty': '{country} için çalınabilir istasyon bulunamadı. Başka bir ülke seç.',
    'hint.error': 'İstasyon listesi alınamadı. İnternetini kontrol edip tekrar dene.',
    'status.idle': 'Hazır', 'status.ready': 'Çalmaya hazır', 'status.loading': 'Bağlanıyor',
    'status.live': 'Canlı', 'status.paused': 'Duraklatıldı', 'status.error': 'Çalınamadı',
    'now.welcome': 'Bir istasyon seç',
    'now.welcomeMeta': 'Plağa dokun, dünyadan bir radyo çalsın',
    'error.stream': 'Bu yayın şu an açılmıyor.', 'error.network': 'Bağlantı koptu.',
    'action.tryAnother': 'Başka istasyon dene', 'action.seeAll': 'Tümü', 'action.more': 'Daha fazla göster',
    'action.retry': 'Tekrar dene', 'action.undo': 'Geri al', 'action.cancel': 'Vazgeç', 'action.close': 'Kapat',
    'mod.moods': 'Ruh hâli', 'mod.favorites': 'Favoriler', 'mod.recents': 'Son dinlenenler',
    'stations.link': '{country} · {n} istasyonun hepsi', 'stations.linkLoading': '{country} istasyonları',
    'stations.title': '{country}', 'stations.search': 'İstasyon ara', 'stations.all': 'Tümü',
    'stations.none': 'Bu aramayla eşleşen istasyon yok.', 'stations.hidden': '{n} istasyonu engellediğin için gizli.',
    'countries.title': 'Ülke seç', 'countries.search': 'Ülke ara', 'countries.stations': '{n} istasyon',
    'countries.shuffle': '{region} içinden rastgele çal', 'countries.shuffleWorld': 'Dünyadan rastgele çal',
    'countries.shuffleSub': 'Rastgele bir ülke, rastgele bir istasyon',
    'countries.none': 'Bu isimde bir ülke bulunamadı.', 'countries.error': 'Ülke listesi alınamadı.',
    'continent.all': 'Tümü', 'continent.eu': 'Avrupa', 'continent.as': 'Asya', 'continent.af': 'Afrika',
    'continent.na': 'Kuzey Amerika', 'continent.sa': 'Güney Amerika', 'continent.oc': 'Okyanusya',
    'search.title': 'Ara', 'search.placeholder': 'İstasyon adı veya tür yaz', 'search.world': 'Tüm dünya',
    'search.inCountry': 'Sadece {country}', 'search.browse': 'Türlere göz at', 'search.results': '{n} sonuç',
    'search.none': 'Sonuç yok. Başka bir kelime dene.', 'search.error': 'Arama yapılamadı. Bağlantını kontrol et.',
    'library.title': 'Kitaplığım', 'library.favorites': 'Favoriler', 'library.recents': 'Son', 'library.blocked': 'Engelli',
    'library.emptyFav': 'Henüz favorin yok', 'library.emptyFavSub': 'Beğendiğin istasyonda kalbe dokun, burada birikir.',
    'library.emptyRec': 'Henüz bir şey dinlemedin', 'library.emptyRecSub': 'Dinlediğin son istasyonlar burada görünür.',
    'library.emptyBlk': 'Engellediğin istasyon yok', 'library.emptyBlkSub': 'Engellediğin istasyonlar rastgele çalmada bir daha çıkmaz.',
    'library.clearRecents': 'Geçmişi temizle', 'library.unblock': 'Engeli kaldır',
    'toast.favAdded': 'Favorilere eklendi', 'toast.favRemoved': 'Favorilerden çıkarıldı',
    'toast.blocked': '“{name}” engellendi', 'toast.unblocked': 'Engel kaldırıldı',
    'toast.copied': 'Bağlantı kopyalandı', 'toast.copyFail': 'Kopyalanamadı, metni elle seç',
    'toast.skipped': '“{name}” açılmadı, sıradakine geçildi',
    'toast.shared': 'Paylaşılan istasyon hazır. Çalmak için ▶ tuşuna bas.',
    'toast.sleepSet': 'Radyo {n} dakika sonra kapanacak', 'toast.sleepOff': 'Uyku zamanlayıcısı kapandı',
    'toast.sleepDone': 'İyi uykular. Radyo kapatıldı.', 'toast.noMood': '{mood} için istasyon bulunamadı',
    'toast.reset': 'Tüm veriler silindi', 'toast.imported': '{n} favori yüklendi', 'toast.importFail': 'Bu kod okunamadı',
    'toast.noStations': 'Bu ülkede çalınabilir istasyon yok',
    'more.share': 'Arkadaşına gönder', 'more.block': 'Engelle, bir daha çıkmasın', 'more.sleep': 'Uyku zamanlayıcısı',
    'more.site': 'İstasyonun web sitesi', 'more.list': '{country} istasyonları',
    'sleep.title': 'Uyku zamanlayıcısı', 'sleep.sub': 'Süre dolunca ses yavaşça kısılır ve radyo kapanır.',
    'sleep.min': '{n} dk', 'sleep.off': 'Kapat', 'sleep.left': '{t} kaldı',
    'settings.title': 'Ayarlar',
    'set.look': 'Görünüm', 'set.theme': 'Tema', 'theme.system': 'Sistem', 'theme.light': 'Açık', 'theme.dark': 'Koyu',
    'set.color': 'Renk',
    'set.home': 'Ana ekran', 'set.homeSub': 'Ana ekranı ister sade, ister dolu kullan.',
    'preset.simple': 'Sade', 'preset.full': 'Dolu',
    'mod.favsHint': 'Favorilerine tek dokunuşla ulaş', 'mod.recentsHint': 'Son dinlediğin istasyonlar',
    'mod.moodsHint': 'Caz, pop, haber… tek dokunuşla rastgele çal', 'mod.dial': 'FM skalası', 'mod.dialHint': 'Plağı çevirirken ibre de kayar',
    'set.listen': 'Dinleme', 'set.autoSkip': 'Açılmayan yayını atla', 'set.autoSkipHint': 'İstasyon açılmazsa otomatik olarak sıradakine geçer',
    'set.sleep': 'Uyku zamanlayıcısı', 'set.sleepOff': 'Kapalı',
    'set.lang': 'Dil',
    'set.app': 'Uygulama', 'set.install': 'Ana ekrana ekle', 'set.installHint': 'Orbitune telefonunda uygulama gibi açılır',
    'set.installIos': 'iPhone’da: Safari’de Paylaş tuşuna, sonra “Ana Ekrana Ekle”ye dokun.',
    'set.installAndroid': 'Android’de: Chrome menüsünden (⋮) “Ana ekrana ekle”yi seç.',
    'set.installed': 'Orbitune zaten uygulama olarak açık.',
    'set.shareApp': 'Orbitune’u arkadaşlarına gönder', 'set.shareAppHint': 'Bağlantıyı paylaş, onlar da hemen dinlesin',
    'set.data': 'Verilerim', 'set.backup': 'Favorileri yedekle', 'set.backupHint': 'Başka bir telefona taşımak için kod oluştur',
    'set.restore': 'Yedekten geri yükle', 'set.restoreHint': 'Kodu yapıştır, favorilerin gelsin',
    'set.reset': 'Tüm verileri sil', 'set.resetHint': 'Favoriler, geçmiş, engeller ve istatistikler silinir',
    'stat.hours': 'saat dinleme', 'stat.countries': 'ülke gezildi', 'stat.favorites': 'favori',
    'backup.title': 'Yedek kodun', 'backup.sub': 'Bu kodu kopyala ve diğer cihazda “Yedekten geri yükle”ye yapıştır.',
    'backup.copy': 'Kodu kopyala', 'restore.title': 'Yedekten geri yükle', 'restore.sub': 'Yedek kodunu aşağıya yapıştır.',
    'restore.go': 'Yükle',
    'reset.title': 'Tüm veriler silinsin mi?', 'reset.sub': 'Favorilerin, geçmişin, engellediğin istasyonlar ve dinleme istatistiklerin bu cihazdan silinir. Bu işlem geri alınamaz.',
    'reset.go': 'Evet, sil',
    'about': 'İstasyon rehberi: <a href="https://www.radio-browser.info" target="_blank" rel="noopener">Radio Browser</a>, gönüllülerin hazırladığı açık bir dizin. Orbitune hesap istemez, hiçbir veri toplamaz; favorilerin ve geçmişin sadece bu cihazda durur.',
    'share.text': '{name} — Orbitune’da dinle',
    'share.appText': 'Dünyanın radyoları tek plakta: Orbitune',
    'meta.kbps': '{n} kbps',
    'genre.default': 'Radyo',
    'mood.pop': 'Pop', 'mood.rock': 'Rock', 'mood.jazz': 'Caz', 'mood.classical': 'Klasik', 'mood.news': 'Haber',
    'mood.folk': 'Halk / Türkü', 'mood.lofi': 'Lo-fi', 'mood.chill': 'Sakin', 'mood.dance': 'Dans', 'mood.hiphop': 'Hip-hop',
    'mood.oldies': 'Eskiler', 'mood.arabesk': 'Arabesk', 'mood.ambient': 'Ambient', 'mood.sport': 'Spor',
  },
  en: {
    'a11y.search': 'Search', 'a11y.library': 'My library', 'a11y.settings': 'Settings',
    'a11y.disc': 'Record: tap for a random station, turn to tune', 'a11y.favorite': 'Add to favourites',
    'a11y.prev': 'Previous station', 'a11y.next': 'Next station', 'a11y.play': 'Play / pause',
    'a11y.more': 'More', 'a11y.close': 'Close', 'a11y.stations': 'Station list', 'a11y.cat': 'Cinnamon the cat',
    'scope.all': 'World', 'hint.region': 'Tap: random country and station from {abl} · Turn: browse {country}',
    'abl.all': 'the whole world', 'abl.eu': 'Europe', 'abl.as': 'Asia', 'abl.af': 'Africa',
    'abl.na': 'North America', 'abl.sa': 'South America', 'abl.oc': 'Oceania',
    'toast.scope': 'Shuffle is on: every tap on the record brings a new station from {abl}',
    'countries.scopeOn': 'On now · every tap on the record picks a new country',
    'greet.morning': 'Good morning', 'greet.day': 'Good afternoon', 'greet.evening': 'Good evening', 'greet.night': 'Good night',
    'a11y.pets': 'Friends', 'pets.title': 'Friends', 'pets.setHint': 'Pick the little animals on your screen',
    'cat.meow': 'Meow!', 'cat.purr': 'Purrr…', 'cat.wee': 'Wheeee!', 'cat.hi': 'Mornin’', 'cat.dizzy': 'So dizzy!',
    'cat.bored': 'Bored…', 'cat.yay': 'Yay!', 'cat.down': 'Hop!',
    offline: 'You are offline. Pick up where you left off once you reconnect.',
    'dial.label': 'Frequency',
    'hint.default': 'Tap: random from {country} · Turn: browse stations',
    'hint.loading': 'Loading stations in {country}…',
    'hint.empty': 'No playable stations found for {country}. Pick another country.',
    'hint.error': 'Could not load the station list. Check your connection and try again.',
    'status.idle': 'Ready', 'status.ready': 'Ready to play', 'status.loading': 'Connecting',
    'status.live': 'Live', 'status.paused': 'Paused', 'status.error': 'Not playing',
    'now.welcome': 'Pick a station',
    'now.welcomeMeta': 'Tap the record and a radio from the world plays',
    'error.stream': 'This stream will not open right now.', 'error.network': 'The connection dropped.',
    'action.tryAnother': 'Try another station', 'action.seeAll': 'All', 'action.more': 'Show more',
    'action.retry': 'Try again', 'action.undo': 'Undo', 'action.cancel': 'Cancel', 'action.close': 'Close',
    'mod.moods': 'Mood', 'mod.favorites': 'Favourites', 'mod.recents': 'Recently played',
    'stations.link': 'All {n} stations in {country}', 'stations.linkLoading': 'Stations in {country}',
    'stations.title': '{country}', 'stations.search': 'Search stations', 'stations.all': 'All',
    'stations.none': 'No stations match this search.', 'stations.hidden': '{n} hidden because you blocked them.',
    'countries.title': 'Choose a country', 'countries.search': 'Search countries', 'countries.stations': '{n} stations',
    'countries.shuffle': 'Play something random from {region}', 'countries.shuffleWorld': 'Play something random from the world',
    'countries.shuffleSub': 'A random country, a random station',
    'countries.none': 'No country by that name.', 'countries.error': 'Could not load the country list.',
    'continent.all': 'All', 'continent.eu': 'Europe', 'continent.as': 'Asia', 'continent.af': 'Africa',
    'continent.na': 'North America', 'continent.sa': 'South America', 'continent.oc': 'Oceania',
    'search.title': 'Search', 'search.placeholder': 'Station name or genre', 'search.world': 'Whole world',
    'search.inCountry': 'Only {country}', 'search.browse': 'Browse genres', 'search.results': '{n} results',
    'search.none': 'Nothing found. Try another word.', 'search.error': 'Search failed. Check your connection.',
    'library.title': 'My library', 'library.favorites': 'Favourites', 'library.recents': 'Recent', 'library.blocked': 'Blocked',
    'library.emptyFav': 'No favourites yet', 'library.emptyFavSub': 'Tap the heart on a station you like and it lands here.',
    'library.emptyRec': 'Nothing played yet', 'library.emptyRecSub': 'Your recent stations show up here.',
    'library.emptyBlk': 'No blocked stations', 'library.emptyBlkSub': 'Blocked stations never come up in shuffle again.',
    'library.clearRecents': 'Clear history', 'library.unblock': 'Unblock',
    'toast.favAdded': 'Added to favourites', 'toast.favRemoved': 'Removed from favourites',
    'toast.blocked': '“{name}” blocked', 'toast.unblocked': 'Unblocked',
    'toast.copied': 'Link copied', 'toast.copyFail': 'Could not copy, select the text by hand',
    'toast.skipped': '“{name}” did not open, skipped to the next one',
    'toast.shared': 'The shared station is ready. Press ▶ to play.',
    'toast.sleepSet': 'The radio turns off in {n} minutes', 'toast.sleepOff': 'Sleep timer off',
    'toast.sleepDone': 'Good night. The radio is off.', 'toast.noMood': 'No stations found for {mood}',
    'toast.reset': 'All data deleted', 'toast.imported': '{n} favourites loaded', 'toast.importFail': 'That code could not be read',
    'toast.noStations': 'No playable stations in this country',
    'more.share': 'Send to a friend', 'more.block': 'Block, never show again', 'more.sleep': 'Sleep timer',
    'more.site': 'Station website', 'more.list': 'Stations in {country}',
    'sleep.title': 'Sleep timer', 'sleep.sub': 'When time is up the sound fades out and the radio stops.',
    'sleep.min': '{n} min', 'sleep.off': 'Turn off', 'sleep.left': '{t} left',
    'settings.title': 'Settings',
    'set.look': 'Appearance', 'set.theme': 'Theme', 'theme.system': 'System', 'theme.light': 'Light', 'theme.dark': 'Dark',
    'set.color': 'Colour',
    'set.home': 'Home screen', 'set.homeSub': 'Keep the home screen simple, or fill it up.',
    'preset.simple': 'Simple', 'preset.full': 'Full',
    'mod.favsHint': 'Your favourites, one tap away', 'mod.recentsHint': 'Stations you played lately',
    'mod.moodsHint': 'Jazz, pop, news… play one at random', 'mod.dial': 'FM dial', 'mod.dialHint': 'The needle moves as you turn the record',
    'set.listen': 'Listening', 'set.autoSkip': 'Skip streams that fail', 'set.autoSkipHint': 'If a station will not open, move on to the next one',
    'set.sleep': 'Sleep timer', 'set.sleepOff': 'Off',
    'set.lang': 'Language',
    'set.app': 'App', 'set.install': 'Add to home screen', 'set.installHint': 'Orbitune opens like an app on your phone',
    'set.installIos': 'On iPhone: in Safari tap Share, then “Add to Home Screen”.',
    'set.installAndroid': 'On Android: open the Chrome menu (⋮) and choose “Add to Home screen”.',
    'set.installed': 'Orbitune is already running as an app.',
    'set.shareApp': 'Send Orbitune to friends', 'set.shareAppHint': 'Share the link so they can listen too',
    'set.data': 'My data', 'set.backup': 'Back up favourites', 'set.backupHint': 'Make a code to move them to another phone',
    'set.restore': 'Restore from backup', 'set.restoreHint': 'Paste a code to bring your favourites back',
    'set.reset': 'Delete all data', 'set.resetHint': 'Favourites, history, blocks and stats are removed',
    'stat.hours': 'hours listened', 'stat.countries': 'countries visited', 'stat.favorites': 'favourites',
    'backup.title': 'Your backup code', 'backup.sub': 'Copy this code and paste it into “Restore from backup” on the other device.',
    'backup.copy': 'Copy code', 'restore.title': 'Restore from backup', 'restore.sub': 'Paste your backup code below.',
    'restore.go': 'Load',
    'reset.title': 'Delete all data?', 'reset.sub': 'Your favourites, history, blocked stations and listening stats are removed from this device. This cannot be undone.',
    'reset.go': 'Yes, delete',
    'about': 'Station directory: <a href="https://www.radio-browser.info" target="_blank" rel="noopener">Radio Browser</a>, an open directory run by volunteers. Orbitune needs no account and collects nothing; your favourites and history stay on this device.',
    'share.text': '{name} — listen on Orbitune',
    'share.appText': 'The world’s radio on one record: Orbitune',
    'meta.kbps': '{n} kbps',
    'genre.default': 'Radio',
    'mood.pop': 'Pop', 'mood.rock': 'Rock', 'mood.jazz': 'Jazz', 'mood.classical': 'Classical', 'mood.news': 'News',
    'mood.folk': 'Folk', 'mood.lofi': 'Lo-fi', 'mood.chill': 'Chill', 'mood.dance': 'Dance', 'mood.hiphop': 'Hip-hop',
    'mood.oldies': 'Oldies', 'mood.arabesk': 'Arabesque', 'mood.ambient': 'Ambient', 'mood.sport': 'Sports',
  },
};

const MOODS = [
  { id: 'pop', tag: 'pop' }, { id: 'jazz', tag: 'jazz' }, { id: 'news', tag: 'news' },
  { id: 'rock', tag: 'rock' }, { id: 'classical', tag: 'classical' }, { id: 'folk', tag: 'folk' },
  { id: 'chill', tag: 'chillout' }, { id: 'lofi', tag: 'lofi' }, { id: 'dance', tag: 'dance' },
  { id: 'hiphop', tag: 'hip hop' }, { id: 'oldies', tag: 'oldies' }, { id: 'arabesk', tag: 'arabesk' },
  { id: 'ambient', tag: 'ambient' }, { id: 'sport', tag: 'sport' },
];

const ACCENTS = [
  { id: 'mercan', hex: '#E5553E' }, { id: 'pembe', hex: '#DA4581' }, { id: 'lavanta', hex: '#7262E8' },
  { id: 'okyanus', hex: '#2A7FDB' }, { id: 'nane', hex: '#11876F' }, { id: 'bal', hex: '#E3960B' },
];

const CONTINENT_OF = (() => {
  const m = {};
  const add = (c, list) => list.split(' ').forEach((k) => { m[k] = c; });
  add('eu', 'AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM TR UA VA XK');
  add('as', 'AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TW UZ VN YE');
  add('af', 'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW');
  add('na', 'AG AI AW BB BL BM BQ BS BZ CA CR CU CW DM DO GD GL GP GT HN HT JM KN KY LC MF MQ MS MX NI PA PM PR SV SX TC TT US VC VG VI');
  add('sa', 'AR BO BR CL CO EC FK GF GY PE PY SR UY VE');
  add('oc', 'AS AU CK FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV UM VU WF WS');
  return m;
})();
const CONTINENTS = ['all', 'eu', 'as', 'af', 'na', 'sa', 'oc'];

/* ───────────────────────── tiny helpers ───────────────────────── */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const fold = (s) => String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');
const isWindows = /Windows/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };

function t(key, vars) {
  let s = (STR[state.lang] && STR[state.lang][key]) ?? STR.tr[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}

/* ───────────────────────── persisted state ───────────────────────── */
const STORE_KEY = 'orbitune:v3';
const DEFAULTS = {
  lang: (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en',
  theme: 'system',
  accent: 'mercan',
  modules: { favs: true, recents: false, moods: false, dial: false },
  pets: { cat: true, dog: false, bird: false, turtle: false },
  petPos: {},
  scope: 'country',
  quickTab: 'favs',
  favorites: [], recents: [], blocked: [],
  autoSkip: true,
  country: null,
  lastStation: null,
  listenSeconds: 0,
  countriesHeard: [],
  tunesDone: 0,
};
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const p = JSON.parse(raw);
    const st = { ...structuredClone(DEFAULTS), ...p, modules: { ...DEFAULTS.modules, ...(p.modules || {}) }, pets: { ...DEFAULTS.pets, ...(p.pets || {}) } };
    if (p.modules && p.modules.cat === false && !p.pets) st.pets.cat = false;
    return st;
  } catch (_) { return structuredClone(DEFAULTS); }
}
const state = loadState();
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) {} }, 150);
}

if (!state.country) {
  const region = ((navigator.language || '').split('-')[1] || '').toUpperCase();
  state.country = CONTINENT_OF[region] ? region : 'TR';
}

/* ───────────────────────── Radio Browser ───────────────────────── */
const MIRRORS = ['de1', 'de2', 'fi1', 'nl1', 'at1'].map((m) => `https://${m}.api.radio-browser.info`);
let goodMirror = null;
try { goodMirror = sessionStorage.getItem('orbitune:mirror'); } catch (_) {}

async function api(path) {
  const order = goodMirror ? [goodMirror, ...MIRRORS.filter((m) => m !== goodMirror)] : [...MIRRORS].sort(() => Math.random() - 0.5);
  let lastErr;
  for (const base of order) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const res = await fetch(base + path, { signal: ctl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      goodMirror = base;
      try { sessionStorage.setItem('orbitune:mirror', base); } catch (_) {}
      return json;
    } catch (e) { clearTimeout(timer); lastErr = e; }
  }
  throw lastErr || new Error('Radio Browser unavailable');
}

const canHls = (() => { try { return !!document.createElement('audio').canPlayType('application/vnd.apple.mpegurl'); } catch (_) { return false; } })();

function slim(s) {
  return {
    id: s.stationuuid, name: (s.name || '').trim().replace(/\s+/g, ' '),
    url: s.url_resolved || s.url, favicon: s.favicon || '', cc: (s.countrycode || '').toUpperCase(),
    tags: s.tags || '', bitrate: s.bitrate || 0, codec: s.codec || '', homepage: s.homepage || '',
    hls: !!s.hls, votes: s.votes || 0,
  };
}
function playable(s) {
  if (!s.id || !s.url || !s.name) return false;
  if (!/^https:\/\//i.test(s.url)) return false;          // phones block http audio on https pages
  if ((s.hls || /\.m3u8(\?|$)/i.test(s.url)) && !canHls) return false;
  return true;
}
function cleanList(raw) {
  const seen = new Set();
  return raw.map(slim).filter((s) => {
    if (!playable(s)) return false;
    const key = fold(s.name);
    if (seen.has(s.id) || seen.has(key)) return false;
    seen.add(s.id); seen.add(key);
    return true;
  });
}
const Q = 'hidebroken=true&is_https=true';

let countriesCache = null;
async function getCountries() {
  if (countriesCache) return countriesCache;
  try {
    const c = JSON.parse(localStorage.getItem('orbitune:countries') || 'null');
    if (c && Date.now() - c.at < 86400000) return (countriesCache = c.list);
  } catch (_) {}
  const raw = await api('/json/countries');
  const map = new Map();
  for (const c of raw) {
    const iso = (c.iso_3166_1 || '').toUpperCase();
    if (!/^[A-Z]{2}$/.test(iso) || !c.stationcount) continue;
    map.set(iso, (map.get(iso) || 0) + c.stationcount);
  }
  const list = [...map].map(([iso, n]) => ({ iso, n }));
  countriesCache = list;
  try { localStorage.setItem('orbitune:countries', JSON.stringify({ at: Date.now(), list })); } catch (_) {}
  return list;
}

const stationCache = new Map();
async function getCountryStations(iso) {
  const c = stationCache.get(iso);
  if (c && Date.now() - c.at < 10 * 60000) return c.list;
  const raw = await api(`/json/stations/search?countrycode=${iso}&${Q}&order=clickcount&reverse=true&limit=400`);
  const list = cleanList(raw);
  stationCache.set(iso, { at: Date.now(), list });
  return list;
}
async function searchStations({ name, tag, iso, limit = 80 }) {
  const p = new URLSearchParams({ hidebroken: 'true', is_https: 'true', order: 'clickcount', reverse: 'true', limit: String(limit) });
  if (name) p.set('name', name);
  if (tag) p.set('tag', tag);
  if (iso) p.set('countrycode', iso);
  return cleanList(await api('/json/stations/search?' + p));
}
function registerClick(id) { api('/json/url/' + id).catch(() => {}); }

/* ───────────────────────── station display ───────────────────────── */
let regionNames = null;
function countryLabel(iso) {
  if (!iso) return '';
  try {
    if (!regionNames || regionNames.lang !== state.lang) {
      regionNames = new Intl.DisplayNames([state.lang], { type: 'region' });
      regionNames.lang = state.lang;
    }
    const n = regionNames.of(iso);
    if (state.lang === 'tr' && iso === 'TR') return 'Türkiye';
    return n || iso;
  } catch (_) { return iso; }
}
function flagHTML(iso) {
  if (!iso) return '<span class="flag code">··</span>';
  if (isWindows) return `<span class="flag code">${esc(iso)}</span>`;
  const f = String.fromCodePoint(...[...iso].map((c) => 0x1F1E6 + c.charCodeAt(0) - 65));
  return `<span class="flag">${f}</span>`;
}
function genreOf(s) {
  const tag = (s.tags || '').split(',').map((x) => x.trim()).find((x) => x.length > 1 && x.length <= 22 && !/^https?:/i.test(x));
  if (!tag) return t('genre.default');
  return tag.split(' ').map((w) => (w ? w[0].toLocaleUpperCase(state.lang) + w.slice(1) : w)).join(' ');
}
function metaLine(s, withCountry = true) {
  const parts = [genreOf(s)];
  if (withCountry) parts.push(countryLabel(s.cc));
  if (s.bitrate) parts.push(t('meta.kbps', { n: s.bitrate }));
  return parts.join(' · ');
}
const freqOf = (s) => Math.round((88 + (hash(s.id || s.name) % 201) / 10) * 10) / 10;
function initials(name) {
  const words = String(name).replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '♪';
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase(state.lang);
  return (words[0][0] + words[1][0]).toLocaleUpperCase(state.lang);
}
function logoUrl(s) {
  const f = (s.favicon || '').trim();
  if (!f || f.startsWith('data:')) return '';
  return f.replace(/^http:\/\//i, 'https://');
}
// Radio Browser's own `favicon` field is empty/broken for a lot of
// stations. Rather than fetch+parse each homepage's og:image (CORS would
// block that from the plain-web build, and it'd need a request per
// station), use a public favicon-by-domain service derived from the
// station's `homepage` field - images aren't subject to CORS the way
// fetch() is, so this works in both the native and plain-web builds with
// no API key and no scraping: it's just another <img> that loads (or
// fails) on its own. Not cached locally (deliberately, for now) - every
// render asks fresh.
//
// Only google's s2/favicons is used here, NOT duckduckgo's icons.duckduckgo
// service - tried that too, but it has the exact same "returns a generic
// placeholder with HTTP 404 instead of actually failing" problem as google
// (confirmed: byte-identical response for two different made-up domains),
// and unlike google's always-16x16 generic (reliably rejected below by
// size), duckduckgo's generic comes back at 48x48 - indistinguishable in
// size from a real favicon, and CORS blocks reading its actual pixels or
// HTTP status to tell them apart client-side. No reliable way to filter
// it out, so better to not risk showing it at all.
function homepageFaviconCandidates(s) {
  try {
    const host = new URL(s.homepage).hostname;
    return host ? [`https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(host)}`] : [];
  } catch (_) { return []; }
}
function artHTML(s, cls = '') {
  const src = logoUrl(s);
  const candidates = homepageFaviconCandidates(s);
  const h = hash(s.id || s.name) % 360;
  let img = '';
  if (src) {
    img = `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fallback${candidates.length ? ` data-fallback-queue='${esc(JSON.stringify(candidates))}'` : ''}>`;
  } else if (candidates.length) {
    const [first, ...rest] = candidates;
    img = `<img src="${esc(first)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fallback${rest.length ? ` data-fallback-queue='${esc(JSON.stringify(rest))}'` : ''}>`;
  }
  return `<span class="art ${cls}" style="--h:${h}">${esc(initials(s.name))}${img}</span>`;
}
// Google's favicon-by-domain service returns HTTP 404 but WITH a valid,
// decodable 16x16 generic globe image body instead of actually failing the
// request - the <img> load succeeds (no error event) with a useless
// placeholder image rather than revealing the initials (or trying the
// next candidate) underneath. Real favicons from that service always come
// back bigger than 16x16 (checked against several real domains), so
// that's the only reliable way to tell a genuine icon apart from the
// generic one once it's loaded. Scoped to that one service by URL, since
// a real favicon from a DIFFERENT source legitimately can be 16x16.
function isUselessFallback(el) {
  return el.naturalWidth <= 16 && el.naturalHeight <= 16 && /google\.com\/s2\/favicons/.test(el.src);
}
function advanceArtFallback(el) {
  let queue = [];
  try { queue = JSON.parse(el.dataset.fallbackQueue || '[]'); } catch (_) {}
  if (!queue.length) { el.remove(); return; }
  const next = queue.shift();
  if (queue.length) el.dataset.fallbackQueue = JSON.stringify(queue); else delete el.dataset.fallbackQueue;
  el.src = next;
}
document.addEventListener('error', (e) => {
  const el = e.target;
  if (!el || el.tagName !== 'IMG' || !el.hasAttribute('data-fallback')) return;
  advanceArtFallback(el);
}, true);
document.addEventListener('load', (e) => {
  const el = e.target;
  if (!el || el.tagName !== 'IMG' || !el.hasAttribute('data-fallback')) return;
  if (isUselessFallback(el)) advanceArtFallback(el);
}, true);

/* ───────────────────────── library ───────────────────────── */
const isFav = (id) => state.favorites.some((s) => s.id === id);
const isBlocked = (id) => state.blocked.some((s) => s.id === id);
function toggleFav(s) {
  if (!s) return;
  if (isFav(s.id)) {
    const idx = state.favorites.findIndex((x) => x.id === s.id);
    const removed = state.favorites.splice(idx, 1)[0];
    toast(t('toast.favRemoved'), { label: t('action.undo'), fn: () => { state.favorites.splice(idx, 0, removed); save(); renderAll(); } });
  } else {
    state.favorites.unshift(s);
    vibrate(12);
    heartBurst(lastFavBtn);
    toast(t('toast.favAdded'));
  }
  save(); renderAll();
}
let lastFavBtn = null;
function heartBurst(btn) {
  const el = btn && document.body.contains(btn) && btn.offsetParent ? btn : $('btnFav');
  const r = el.getBoundingClientRect();
  if (!r.width || reduceMotion) return;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    const d = 26 + Math.random() * 12;
    const h = document.createElement('span');
    h.className = 'burst';
    h.innerHTML = '<svg><use href="#i-heart-fill"/></svg>';
    h.style.left = r.left + r.width / 2 + 'px';
    h.style.top = r.top + r.height / 2 + 'px';
    h.style.setProperty('--dx', Math.cos(a) * d + 'px');
    h.style.setProperty('--dy', Math.sin(a) * d + 'px');
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 900);
  }
}
function addRecent(s) {
  state.recents = [s, ...state.recents.filter((x) => x.id !== s.id)].slice(0, 20);
  if (!state.countriesHeard.includes(s.cc) && s.cc) state.countriesHeard.push(s.cc);
  save();
}
function blockStation(s) {
  if (!s || isBlocked(s.id)) return;
  state.blocked.unshift(s);
  state.favorites = state.favorites.filter((x) => x.id !== s.id);
  save();
  toast(t('toast.blocked', { name: s.name }), { label: t('action.undo'), fn: () => { state.blocked = state.blocked.filter((x) => x.id !== s.id); save(); refreshTunable(); renderAll(); } });
  refreshTunable();
  if (player.station && player.station.id === s.id) {
    const next = randomFrom(tunable, [s.id]);
    if (next) playStation(next, { queue: tunable }); else player.stop();
  }
  renderAll();
}

/* ───────────────────────── player ─────────────────────────
   Two engines share the same `player` state and the same callers
   (playStation/togglePlay/playNeighbour/sleep timer/stats):
   - Native shell (Capacitor): @capgo/capacitor-native-audio for
     playback that survives backgrounding, @capgo/capacitor-media-session
     for the lock-screen/notification UI (play/pause/prev/next).
   - Plain browser/PWA: the original <audio> element + Web MediaSession API.
   Neither engine fires a DOM-style `error`/`waiting` event, so failure
   detection on the native side is a watchdog on the `currentTime` ticks
   instead (no tick within the window ⇒ treat like the old stall/timeout). */
const Cap = window.Capacitor;
const isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const NativeAudio = isNative && Cap.Plugins ? Cap.Plugins.NativeAudio : null;
const MediaSessionNative = isNative && Cap.Plugins ? Cap.Plugins.MediaSession : null;
const NATIVE_ASSET_ID = 'stream';
const audio = NativeAudio ? null : $('audio');

// The Android 13+ POST_NOTIFICATIONS prompt (needed for the lock-screen/
// notification media controls to be allowed to show) is requested natively
// in MainActivity.onCreate() - not via @capacitor/local-notifications, which
// would also pull in RECEIVE_BOOT_COMPLETED and SCHEDULE_EXACT_ALARM for
// scheduling features this app never uses.

let nativeReady = null;
function ensureNative() {
  if (!NativeAudio) return Promise.resolve();
  if (!nativeReady) {
    nativeReady = NativeAudio.configure({
      focus: true, background: true, backgroundPlayback: true, showNotification: false,
    }).catch(() => {});
  }
  return nativeReady;
}

let watchdogTimer = null;
function clearWatchdog() { clearTimeout(watchdogTimer); watchdogTimer = null; }
function armWatchdog(ms, onTimeout) { clearWatchdog(); watchdogTimer = setTimeout(onTimeout, ms); }

function setAudioVolume(v) {
  if (NativeAudio) NativeAudio.setVolume({ assetId: NATIVE_ASSET_ID, volume: Math.max(0.1, v) }).catch(() => {});
  else audio.volume = v;
}

// Unlike the <audio> element, the native plugin's stop/unload/preload/play
// calls don't implicitly cancel each other - issuing a second preload+play
// before the first one's stop+unload has actually finished can leave two
// independent native players running at once (two stations audible
// together, and pause/stop only ever reaching one of them). Every call that
// mutates native playback goes through this queue so they always run one at
// a time, in order.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let nativeQueue = Promise.resolve();
function queueNative(task) {
  const run = () => Promise.resolve().then(task);
  const p = nativeQueue.then(run, run);
  nativeQueue = p.catch(() => {});
  return p;
}
let playGen = 0;

const player = {
  station: null, queue: [], queueKind: 'list', history: [], status: 'idle', error: '', skipCount: 0, loadTimer: null,
  get playing() { return this.status === 'live' || this.status === 'loading'; },
  stop() {
    clearTimeout(this.loadTimer);
    clearWatchdog();
    playGen++; // invalidate any in-flight playStation() attempt
    if (NativeAudio) {
      queueNative(async () => {
        try { await NativeAudio.stop({ assetId: NATIVE_ASSET_ID }); } catch (_) {}
        try { await NativeAudio.unload({ assetId: NATIVE_ASSET_ID }); } catch (_) {}
        await wait(120); // see the long comment in playStation() below
      });
    } else { audio.pause(); audio.removeAttribute('src'); audio.load(); }
    this.status = 'idle';
    render();
  },
};

function setCurrent(s, queue) {
  player.station = s;
  if (queue) player.queue = queue;
  state.lastStation = s;
  save();
}

async function playStation(s, opts = {}) {
  if (!s) return;
  const gen = ++playGen;
  if (!opts.isSkip) player.skipCount = 0;
  if (!opts.fromHistory && player.station && player.station.id !== s.id) {
    player.history.push(player.station);
    if (player.history.length > 40) player.history.shift();
  }
  player.queueKind = opts.queueKind || (opts.fromHistory ? player.queueKind : 'list');
  setCurrent(s, opts.queue || (player.queue.some((x) => x.id === s.id) ? player.queue : tunable.some((x) => x.id === s.id) ? tunable : [s]));
  player.status = 'loading';
  player.error = '';
  clearTimeout(player.loadTimer);
  clearWatchdog();
  player.loadTimer = setTimeout(() => onStreamFail('timeout'), 15000);
  if (s.cc && s.cc !== state.country && opts.adoptCountry !== false) selectCountry(s.cc, { quiet: true });
  render();
  player.switching = true;
  try {
    if (NativeAudio) {
      await ensureNative();
      await queueNative(async () => {
        if (gen !== playGen) return;    // superseded while waiting in the native queue
        try { await NativeAudio.stop({ assetId: NATIVE_ASSET_ID }); } catch (_) {}
        try { await NativeAudio.unload({ assetId: NATIVE_ASSET_ID }); } catch (_) {}
        // @capgo/capacitor-native-audio's unload() resolves its JS promise
        // before the actual native teardown (player.release(), posted via
        // runOnUiThread in StreamAudioAsset.unload()) has necessarily run -
        // confirmed by reading the plugin's Android source. If the UI
        // thread is busy (an Activity pause/resume is a classic time for
        // that), the old ExoPlayer can still be mid-teardown when we ask
        // for a new one on the same assetId, which is exactly the kind of
        // window that produces "a radio is still playing in the
        // background" after switching/backgrounding. Give it a moment.
        await wait(120);
        if (gen !== playGen) return;
        try {
          await NativeAudio.preload({ assetId: NATIVE_ASSET_ID, assetPath: s.url, isUrl: true, volume: 1 });
        } catch (_) {
          // NativeAudio.java's preloadAsset() unconditionally rejects if its
          // internal registry still has an entry for this assetId - which
          // happens when unload() above threw natively (e.g. posting to a
          // stale Activity reference) before it ever reached the line that
          // clears that entry. We silently swallowed that failure above, so
          // this is the only place left to recover: force another
          // unload+preload before giving up. Matches the real-world "errors
          // instantly, a couple of retries later connects fine" report -
          // this makes the retry automatic instead of needing a user tap.
          if (gen !== playGen) return;
          try { await NativeAudio.stop({ assetId: NATIVE_ASSET_ID }); } catch (_) {}
          try { await NativeAudio.unload({ assetId: NATIVE_ASSET_ID }); } catch (_) {}
          await wait(120);
          if (gen !== playGen) return;
          await NativeAudio.preload({ assetId: NATIVE_ASSET_ID, assetPath: s.url, isUrl: true, volume: 1 });
        }
        if (gen !== playGen) {          // superseded while preloading - undo, don't play it
          try { await NativeAudio.stop({ assetId: NATIVE_ASSET_ID }); } catch (_) {}
          try { await NativeAudio.unload({ assetId: NATIVE_ASSET_ID }); } catch (_) {}
          return;
        }
        await NativeAudio.play({ assetId: NATIVE_ASSET_ID });
      });
    } else {
      audio.volume = 1;
      audio.src = s.url;
      await audio.play();
    }
    if (gen !== playGen) return;    // a newer playStation() call already took over
    player.switching = false;
  } catch (e) {
    if (gen !== playGen) return;    // ditto - don't let an abandoned attempt fail the new one
    player.switching = false;
    if (e && e.name === 'AbortError') return;          // superseded by a newer play
    if (e && e.name === 'NotAllowedError') { clearTimeout(player.loadTimer); player.status = 'ready'; render(); return; }
    onStreamFail('play');
    return;
  }
  addRecent(s);
  registerClick(s.id);
  updateMediaSession();
}

function onStreamFail() {
  clearTimeout(player.loadTimer);
  clearWatchdog();
  if (player.status !== 'loading' && player.status !== 'live') return;
  const failed = player.station;
  if (state.autoSkip && player.skipCount < 3 && failed) {
    player.skipCount++;
    if (player.queueKind === 'scope') { toast(t('toast.skipped', { name: failed.name })); shuffleScope({ isSkip: true }); return; }
    const next = neighbour(1, true) || randomFrom(tunable, [failed.id]);
    if (next && next.id !== failed.id) {
      toast(t('toast.skipped', { name: failed.name }));
      playStation(next, { isSkip: true, adoptCountry: false });
      return;
    }
  }
  if (NativeAudio) {
    const gen = playGen;
    queueNative(() => { if (gen !== playGen) return; return NativeAudio.pause({ assetId: NATIVE_ASSET_ID }).catch(() => {}); });
  } else audio.pause();
  player.status = 'error';
  player.error = navigator.onLine === false ? t('error.network') : t('error.stream');
  render();
}

if (NativeAudio) {
  NativeAudio.addListener('currentTime', () => {
    if (player.status !== 'loading' && player.status !== 'live') return;
    clearTimeout(player.loadTimer);
    if (player.status !== 'live') { player.status = 'live'; player.skipCount = 0; render(); updateMediaSession(); }
    armWatchdog(20000, () => onStreamFail('stall'));
  });
  NativeAudio.addListener('complete', () => { if (player.status === 'live' || player.status === 'loading') onStreamFail('error'); });

  // If the JS-side state ever drifts from what's actually playing natively
  // (an OEM killing/restarting the process in the background is the usual
  // trigger - the user sees "not playing" on reopen while the native layer
  // kept going, or vice versa), re-sync on every resume instead of leaving
  // a stale UI until the next explicit play/pause tap.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !player.station) return;
    const genAtQueryTime = playGen; // see below
    NativeAudio.isPlaying({ assetId: NATIVE_ASSET_ID }).then((res) => {
      // This query can take a moment; if the user tapped play/pause (or a
      // new station loaded) while it was in flight, playGen has already
      // moved on and this result is stale - discard it instead of
      // stomping on whatever that newer, authoritative action just set.
      // (Confirmed via ci/unit/resume-reconcile.test.js's race scenario:
      // without this check, a stale "not playing" reconcile could flip a
      // station the user just started playing back to "paused".)
      if (genAtQueryTime !== playGen) return;
      const reallyPlaying = !!(res && (res.isPlaying ?? res.value));
      if (reallyPlaying && player.status !== 'live' && player.status !== 'loading') {
        clearTimeout(player.loadTimer);
        player.status = 'live';
        render();
        updateMediaSession();
      } else if (!reallyPlaying && (player.status === 'live' || player.status === 'loading')) {
        clearTimeout(player.loadTimer);
        clearWatchdog();
        player.status = 'paused';
        render();
        updateMediaSession();
      }
    }).catch(() => {});
  });
} else {
  audio.addEventListener('playing', () => { clearTimeout(player.loadTimer); player.status = 'live'; player.skipCount = 0; render(); updateMediaSession(); });
  audio.addEventListener('waiting', () => { if (player.status === 'live') { player.status = 'loading'; render(); clearTimeout(player.loadTimer); player.loadTimer = setTimeout(() => onStreamFail('stall'), 20000); } });
  audio.addEventListener('error', () => { if (audio.getAttribute('src')) onStreamFail('error'); });
  audio.addEventListener('pause', () => { if (player.switching) return; if (player.status === 'live' || player.status === 'loading') { clearTimeout(player.loadTimer); player.status = 'paused'; render(); updateMediaSession(); } });
}

// ensurePlaying/ensurePaused/ensureStopped are one-directional "make it so"
// commands - unlike togglePlay() (for the app's own single toggle button),
// they never inspect-then-do-the-opposite. Needed for anything triggered
// EXTERNALLY (notification/lock-screen buttons, hardware media keys,
// launcher "now playing" widgets like Niagara): those send a plain
// play/pause/stop command, not a toggle, and a late/redundant/dismiss-
// triggered one arriving while already in that state must be a no-op, not
// flip to the opposite state. Confirmed real-world trigger: dismissing
// Niagara Launcher's now-playing widget after pausing from it sends a
// "stop" command, which - when wired to togglePlay() - saw a non-live
// status and restarted playback instead of stopping it.
function ensurePlaying() {
  if (!player.station || player.status === 'live' || player.status === 'loading') return;
  playStation(player.station, { queue: player.queue, adoptCountry: false });
}
function ensurePaused() {
  if (!player.station || !(player.status === 'live' || player.status === 'loading')) return;
  if (NativeAudio) {
    playGen++; // invalidate any in-flight playStation() attempt so it can't resurrect a 2nd stream
    const gen = playGen;
    queueNative(() => { if (gen !== playGen) return; return NativeAudio.pause({ assetId: NATIVE_ASSET_ID }).catch(() => {}); });
    clearTimeout(player.loadTimer);
    clearWatchdog();
    player.status = 'paused';
    render();
    updateMediaSession();
  } else audio.pause();
}
function ensureStopped() {
  if (!player.station) return;
  player.stop();
  updateMediaSession();
}
function togglePlay() {
  if (!player.station) { shuffleCountry(); return; }
  if (player.status === 'live' || player.status === 'loading') { ensurePaused(); return; }
  // Live radio: rejoin the live edge instead of resuming a stale buffer.
  ensurePlaying();
}

function neighbour(dir, skipping) {
  const q = player.queue.length > 1 ? player.queue : tunable;
  if (!q.length) return null;
  const cur = player.station ? q.findIndex((x) => x.id === player.station.id) : -1;
  for (let step = 1; step <= q.length; step++) {
    const cand = q[(cur + dir * step + q.length * 4) % q.length];
    if (cand && !isBlocked(cand.id) && (!skipping || cand.id !== player.station?.id)) return cand;
  }
  return null;
}
function playNeighbour(dir) {
  if (player.queueKind === 'scope') {
    if (dir > 0) { vibrate(8); spinKick(400); shuffleScope(); return; }
    const prev = player.history.pop();
    if (prev) { vibrate(8); playStation(prev, { fromHistory: true, queueKind: 'scope' }); }
    return;
  }
  const s = neighbour(dir);
  if (s) { vibrate(8); playStation(s, { queue: player.queue.length > 1 ? player.queue : tunable, adoptCountry: false }); }
}

function randomFrom(list, exclude = []) {
  const pool = list.filter((s) => !exclude.includes(s.id) && !isBlocked(s.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
function shuffleCountry() {
  if (state.scope !== 'country') { vibrate(14); spinKick(540); state.tunesDone++; shuffleScope(); return; }
  if (countryLoad.status !== 'ok') return;
  const s = randomFrom(tunable, player.station ? [player.station.id] : []);
  if (!s) { toast(t('toast.noStations')); return; }
  vibrate(14);
  spinKick(540);
  state.tunesDone++;
  playStation(s, { queue: tunable });
}

/* Media Session: lock screen + notification controls, including next/prev. */
let msKey = '';
function updateMediaSession() {
  if (!player.station) return;
  if (!NativeAudio && !('mediaSession' in navigator)) return;
  const s = player.station;
  const key = s.id + '|' + player.status + '|' + state.lang;
  if (key === msKey) return;
  msKey = key;
  const art = logoUrl(s) || homepageFaviconCandidates(s)[0] || '';
  const artwork = art
    ? [{ src: art, sizes: '256x256', type: 'image/png' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }]
    : [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }];
  const title = s.name;
  const artist = [countryLabel(s.cc), genreOf(s)].filter(Boolean).join(' · ');
  const album = 'Orbitune';
  const playbackState = player.status === 'live' || player.status === 'loading' ? 'playing' : 'paused';
  if (MediaSessionNative) {
    MediaSessionNative.setMetadata({ title, artist, album, artwork }).catch(() => {});
    MediaSessionNative.setPlaybackState({ playbackState }).catch(() => {});
  } else {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title, artist, album, artwork });
      navigator.mediaSession.playbackState = playbackState;
    } catch (_) {}
  }
}
if (MediaSessionNative) {
  const set = (action, fn) => { try { MediaSessionNative.setActionHandler({ action }, () => fn()); } catch (_) {} };
  set('play', () => ensurePlaying());
  set('pause', () => ensurePaused());
  set('stop', () => ensureStopped());
  set('nexttrack', () => playNeighbour(1));
  set('previoustrack', () => playNeighbour(-1));
} else if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  const set = (a, fn) => { try { ms.setActionHandler(a, fn); } catch (_) {} };
  set('play', () => ensurePlaying());
  set('pause', () => ensurePaused());
  set('stop', () => ensureStopped());
  set('nexttrack', () => playNeighbour(1));
  set('previoustrack', () => playNeighbour(-1));
}

/* listening stats */
let statTick = 0;
setInterval(() => {
  if (player.status === 'live' && (NativeAudio || !audio.paused)) {
    state.listenSeconds++;
    if (++statTick % 15 === 0) save();
  }
}, 1000);

/* ───────────────────────── sleep timer ───────────────────────── */
const sleep = { endAt: 0, minutes: 0, timer: null };
function setSleep(min) {
  clearInterval(sleep.timer);
  setAudioVolume(1);
  sleep.minutes = min;
  sleep.endAt = min ? Date.now() + min * 60000 : 0;
  if (min) {
    sleep.timer = setInterval(sleepTick, 500);
    toast(t('toast.sleepSet', { n: min }));
  } else toast(t('toast.sleepOff'));
  sleepTick();
}
function sleepTick() {
  const chip = $('sleepChip');
  if (!sleep.endAt) { chip.hidden = true; return; }
  const left = Math.max(0, sleep.endAt - Date.now());
  chip.hidden = false;
  const sec = Math.ceil(left / 1000);
  $('sleepChipText').textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  if (left < 20000) setAudioVolume(clamp(left / 20000, 0, 1));
  if (left <= 0) {
    clearInterval(sleep.timer);
    sleep.endAt = 0; sleep.minutes = 0;
    if (NativeAudio) {
      playGen++; // invalidate any in-flight playStation() attempt so it can't resurrect a 2nd stream
      const gen = playGen;
      queueNative(() => { if (gen !== playGen) return; return NativeAudio.pause({ assetId: NATIVE_ASSET_ID }).catch(() => {}); });
      clearTimeout(player.loadTimer);
      clearWatchdog();
      if (player.status === 'live' || player.status === 'loading') { player.status = 'paused'; render(); updateMediaSession(); }
    } else audio.pause();
    setAudioVolume(1);
    chip.hidden = true;
    toast(t('toast.sleepDone'));
  }
}

/* ───────────────────────── country + tuning list ───────────────────────── */
let countryAll = [];          // every playable station in the selected country
let tunable = [];             // the same minus blocked, ordered by dial position
const countryLoad = { status: 'idle', iso: null };

function refreshTunable() {
  tunable = countryAll.filter((s) => !isBlocked(s.id)).sort((a, b) => freqOf(a) - freqOf(b));
}
async function selectCountry(iso, opts = {}) {
  if (!iso) return;
  const changed = iso !== state.country || countryLoad.iso !== iso;
  state.country = iso;
  save();
  if (!changed && countryLoad.status === 'ok') { render(); return; }
  countryLoad.status = 'loading';
  countryLoad.iso = iso;
  countryAll = []; tunable = [];
  render();
  try {
    const list = await getCountryStations(iso);
    if (countryLoad.iso !== iso) return;
    countryAll = list;
    refreshTunable();
    countryLoad.status = 'ok';
  } catch (_) {
    if (countryLoad.iso !== iso) return;
    countryLoad.status = 'error';
  }
  render();
  if (!opts.quiet && panelStack.includes('panelStations')) renderStations();
}

/* ───────────────────────── record (disc) ───────────────────────── */
const disc = $('disc');
const discWrap = $('discWrap');
const STEP = 28;                       // degrees of turning per station
const SPIN = 72;                       // deg/s while playing (a lazy 12 rpm)
const deck = { angle: 0, vel: 0, dragging: false, lastA: 0, lastT: 0, accum: 0, moved: 0, startT: 0, tuneIdx: -1, tuning: false, commit: null, sx: 0, sy: 0 };
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function spinKick(deg) { if (!reduceMotion) deck.vel = Math.max(deck.vel, deg); wakeDeck(); }
let lastFrame = performance.now();
let deckRunning = false;
function wakeDeck() { if (deckRunning) return; deckRunning = true; lastFrame = performance.now(); requestAnimationFrame(frame); }
function frame(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!deck.dragging) {
    const target = player.status === 'live' && !reduceMotion ? SPIN : 0;
    deck.vel += (target - deck.vel) * (1 - Math.exp(-dt * (target ? 1.6 : 2.4)));
    if (Math.abs(deck.vel) < 0.3 && !target) deck.vel = 0;
    deck.angle = (deck.angle + deck.vel * dt) % 360;
  }
  disc.style.transform = `rotate(${deck.angle}deg)`;
  // rest when the record is still (saves battery); wakeDeck() restarts it
  if (!deck.dragging && deck.vel === 0 && player.status !== 'live') { deckRunning = false; return; }
  requestAnimationFrame(frame);
}
wakeDeck();

function pointerAngle(e) {
  const r = discWrap.getBoundingClientRect();
  return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
}
disc.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  disc.setPointerCapture(e.pointerId);
  deck.dragging = true;
  deck.lastA = pointerAngle(e);
  deck.lastT = performance.now();
  deck.startT = deck.lastT;
  deck.accum = 0; deck.moved = 0; deck.sx = e.clientX; deck.sy = e.clientY;
  deck.vel = 0;
  clearTimeout(deck.commit);
  wakeDeck();
});
disc.addEventListener('pointermove', (e) => {
  if (!deck.dragging) return;
  const a = pointerAngle(e);
  let d = a - deck.lastA;
  if (d > 180) d -= 360; if (d < -180) d += 360;
  const now = performance.now();
  deck.vel = d / Math.max(0.008, (now - deck.lastT) / 1000) * 0.6 + deck.vel * 0.4;
  deck.lastA = a; deck.lastT = now;
  deck.angle += d;
  deck.moved = Math.max(deck.moved, Math.hypot(e.clientX - deck.sx, e.clientY - deck.sy));
  if (deck.moved < 8) return;
  deck.accum += d;
  while (Math.abs(deck.accum) >= STEP) {
    const dir = Math.sign(deck.accum);
    deck.accum -= dir * STEP;
    tuneStep(dir);
  }
});
function endDrag(e) {
  if (!deck.dragging) return;
  deck.dragging = false;
  const quick = performance.now() - deck.startT < 450;
  if (deck.moved < 8 && quick) { deck.vel = 0; shuffleCountry(); return; }
  deck.vel = clamp(deck.vel, -900, 900);
  if (deck.tuning) scheduleCommit();
}
disc.addEventListener('pointerup', endDrag);
disc.addEventListener('pointercancel', endDrag);
disc.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); shuffleCountry(); }
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); deck.angle += STEP; tuneStep(1); scheduleCommit(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); deck.angle -= STEP; tuneStep(-1); scheduleCommit(); }
});

function tuneStep(dir) {
  if (!tunable.length) return;
  if (!deck.tuning) {
    const cur = player.station ? tunable.findIndex((s) => s.id === player.station.id) : -1;
    deck.tuneIdx = cur;
    deck.tuning = true;
  }
  deck.tuneIdx = ((deck.tuneIdx + dir) % tunable.length + tunable.length) % tunable.length;
  wakeDeck();
  vibrate(6);
  const s = tunable[deck.tuneIdx];
  $('tuneBubble').hidden = false;
  $('tuneCount').textContent = `${deck.tuneIdx + 1} / ${tunable.length} · ${freqOf(s).toFixed(1)}`;
  $('tuneName').textContent = s.name;
  paintLabel(s);
  paintDial(s);
}
function scheduleCommit() {
  clearTimeout(deck.commit);
  deck.commit = setTimeout(() => {
    const s = tunable[deck.tuneIdx];
    deck.tuning = false;
    $('tuneBubble').hidden = true;
    state.tunesDone++;
    if (s && s.id !== player.station?.id) playStation(s, { queue: tunable });
    else render();
  }, 420);
}

/* ───────────────────────── rendering: home ───────────────────────── */
let labelFor = null;
function paintLabel(s) {
  const key = s ? s.id : '';
  if (labelFor === key) return;
  labelFor = key;
  const img = $('discLogo');
  const src = s ? logoUrl(s) : '';
  const queue = s ? homepageFaviconCandidates(s) : [];
  img.hidden = true;
  const tryNext = () => {
    if (!queue.length) { img.hidden = true; return; }
    img.src = queue.shift();
  };
  img.onload = () => {
    if (labelFor !== key) return;
    if (isUselessFallback(img)) { tryNext(); return; }
    img.hidden = false;
  };
  img.onerror = () => tryNext();
  if (src) img.src = src;
  else if (queue.length) img.src = queue.shift();
  else img.removeAttribute('src');
}
function paintDial(s) {
  if (!state.modules.dial) return;
  const f = s ? freqOf(s) : null;
  $('dialFreq').textContent = f ? `${f.toFixed(1)} FM` : '—';
  $('dialNeedle').style.left = f ? `${((f - 88) / 20) * 100}%` : '50%';
}

function render() {
  const s = player.station;
  const cname = countryLabel(state.country);
  const scoped = state.scope !== 'country';
  $('countryFlag').outerHTML = (scoped ? '<span class="flag globe"><svg><use href="#i-globe"/></svg></span>' : flagHTML(state.country)).replace('class="flag', 'id="countryFlag" class="flag');
  $('countryName').textContent = scoped ? (state.scope === 'all' ? t('scope.all') : t('continent.' + state.scope)) : cname;
  $('scopeBadge').hidden = !scoped;
  $('stationsCount').textContent = countryLoad.status === 'ok' ? String(tunable.length) : '…';
  $('btnStations').title = `${t('a11y.stations')} · ${cname}`;

  if (!deck.tuning) { paintLabel(s); paintDial(s); }
  $('tonearm').classList.toggle('on', player.status === 'live' || player.status === 'loading');
  wakeDeck();
  $('deck').classList.toggle('has-pets', !!state.pets && Object.values(state.pets).some(Boolean));

  // hint under the record
  let hint = '';
  if (countryLoad.status === 'loading') hint = t('hint.loading', { country: cname });
  else if (countryLoad.status === 'error') hint = t('hint.error');
  else if (countryLoad.status === 'ok' && !tunable.length) hint = t('hint.empty', { country: cname });
  else if (scoped) hint = t('hint.region', { abl: t('abl.' + state.scope), country: cname });
  else if (state.tunesDone < 6) hint = t('hint.default', { country: cname });
  $('discHint').textContent = hint;

  // now playing
  const statusEl = $('nowStatus');
  const st = s ? player.status : 'none';
  statusEl.classList.toggle('live', st === 'live');
  $('nowStatusText').textContent = {
    none: t('status.idle'), idle: t('status.ready'), ready: t('status.ready'), loading: t('status.loading'),
    live: t('status.live'), paused: t('status.paused'), error: t('status.error'),
  }[st];
  $('nowName').textContent = s ? s.name : greeting();
  $('nowMeta').textContent = s ? metaLine(s) : t('now.welcomeMeta');
  $('nowError').hidden = st !== 'error';
  $('nowErrorText').textContent = player.error;

  const ctl = document.querySelector('.controls');
  ctl.classList.toggle('is-playing', player.status === 'live' || player.status === 'loading');
  $('btnPlay').classList.toggle('is-loading', player.status === 'loading');
  const fav = s && isFav(s.id);
  $('btnFav').classList.toggle('on', !!fav);
  $('btnFav').querySelector('use').setAttribute('href', fav ? '#i-heart-fill' : '#i-heart');
  $('btnFav').disabled = !s;
  $('btnMore').disabled = !s;
  const navOk = (player.queue.length > 1 || tunable.length > 1);
  $('btnPrev').disabled = !navOk;
  $('btnNext').disabled = !navOk;

  // modules
  $('modDial').hidden = !state.modules.dial;
  renderQuick();

  // mini player (visible over panels)
  const mini = $('mini');
  mini.hidden = !s || panelStack.length === 0;
  if (s) {
    $('miniArt').innerHTML = artHTML(s);
    $('miniArt').classList.toggle('spinning', player.status === 'live' && !reduceMotion);
    $('miniName').textContent = s.name;
    $('miniMeta').textContent = metaLine(s);
    mini.classList.toggle('is-playing', player.status === 'live' || player.status === 'loading');
  }
  document.querySelectorAll('[data-sid]').forEach((el) => el.classList.toggle('current', !!s && el.dataset.sid === s.id));
  document.title = s && player.status === 'live' ? `${s.name} · Orbitune` : 'Orbitune';
  updateMediaSession();
  scheduleFit();
}
function greeting() {
  const h = new Date().getHours();
  return t(h >= 5 && h < 11 ? 'greet.morning' : h < 17 ? 'greet.day' : h < 22 ? 'greet.evening' : 'greet.night');
}
function bubbleHTML(s, src) {
  const cur = player.station && player.station.id === s.id ? ' current' : '';
  return `<button type="button" class="bubble${cur}" data-play="${esc(s.id)}" data-src="${src}" data-sid="${esc(s.id)}">${artHTML(s)}<span>${esc(s.name)}</span></button>`;
}
/* quick module: favourites / recents / moods in one compact block */
function quickTabs() {
  const tabs = [];
  if (state.modules.favs && state.favorites.length) tabs.push('favs');
  if (state.modules.recents && state.recents.length) tabs.push('recents');
  if (state.modules.moods) tabs.push('moods');
  return tabs;
}
function renderQuick() {
  const mod = $('modQuick');
  const tabs = quickTabs();
  mod.hidden = !tabs.length;
  if (!tabs.length) return;
  if (!tabs.includes(state.quickTab)) state.quickTab = tabs[0];
  const label = { favs: t('mod.favorites'), recents: t('mod.recents'), moods: t('mod.moods') };
  const tabsEl = $('quickTabs');
  tabsEl.classList.toggle('single', tabs.length === 1);
  tabsEl.innerHTML = tabs.map((k) => `<button type="button" role="tab" data-qtab="${k}" aria-selected="${k === state.quickTab}">${esc(label[k])}</button>`).join('');
  const body = $('quickBody');
  if (state.quickTab === 'moods') {
    body.innerHTML = `<div class="chips scroll-x">${MOODS.map((m) => `<button type="button" class="chip" data-mood="${m.id}">${esc(t('mood.' + m.id))}</button>`).join('')}</div>`;
    $('quickAll').textContent = t('a11y.search');
    return;
  }
  $('quickAll').textContent = t('action.seeAll');
  const list = state.quickTab === 'favs' ? state.favorites : state.recents;
  const w = mod.clientWidth || Math.min(window.innerWidth - 36, 404);
  const n = clamp(Math.floor((w + 6) / 66), 4, 7);
  let items = list.slice(0, n).map((x) => bubbleHTML(x, state.quickTab === 'favs' ? 'fav' : 'rec'));
  if (list.length > n) {
    items = items.slice(0, n - 1);
    items.push(`<button type="button" class="bubble" data-qmore="1"><span class="art more">+${list.length - (n - 1)}</span><span>${esc(t('action.seeAll'))}</span></button>`);
  }
  body.innerHTML = `<div class="quick-grid" style="--n:${n}">${items.join('')}</div>`;
}

/* the record takes whatever height the other blocks leave over */
let fitQueued = false;
function scheduleFit() { if (fitQueued) return; fitQueued = true; requestAnimationFrame(() => { fitQueued = false; fitLayout(); }); }
function fitLayout() {
  const home = $('home');
  const busy = !$('modDial').hidden || !$('modQuick').hidden;
  home.classList.toggle('compact', busy || window.innerHeight < 700);
  const cs = getComputedStyle(home);
  const gap = parseFloat(cs.rowGap) || 0;
  const kids = [...home.children].filter((el) => !el.hidden && el.offsetParent !== null);
  let others = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + gap * (kids.length - 1);
  for (const el of kids) {
    if (el.id === 'deck') { const hint = $('discHint'); others += hint.offsetHeight + parseFloat(getComputedStyle(hint).marginTop || 0) + parseFloat(getComputedStyle(el).rowGap || 0) + 4; }
    else others += el.offsetHeight;
  }
  const width = home.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const size = Math.round(clamp(window.innerHeight - others - 6, 150, Math.min(width * 0.84, 340)));
  discWrap.style.setProperty('--disc', size + 'px');
}
window.addEventListener('resize', () => { renderQuick(); scheduleFit(); });

function renderAll() {
  render();
  if (panelStack.includes('panelLibrary')) renderLibrary();
  if (panelStack.includes('panelStations')) renderStations();
  if (panelStack.includes('panelSettings')) renderSettings();
  if (panelStack.includes('panelSearch')) renderSearchResults();
}

/* ───────────────────────── rows ───────────────────────── */
function rowHTML(s, src, opts = {}) {
  const cur = player.station && player.station.id === s.id ? ' current' : '';
  const fav = isFav(s.id);
  const end = opts.unblock
    ? `<button type="button" class="btn" data-unblock="${esc(s.id)}">${esc(t('library.unblock'))}</button>`
    : `<button type="button" class="row-act${fav ? ' on' : ''}" data-fav="${esc(s.id)}" data-src="${src}" aria-label="${esc(t('a11y.favorite'))}"><svg><use href="#${fav ? 'i-heart-fill' : 'i-heart'}"/></svg></button>`;
  return `<div class="row${cur}" data-sid="${esc(s.id)}">
    <button type="button" class="row-main" ${opts.unblock ? '' : `data-play="${esc(s.id)}" data-src="${src}"`}>
      ${artHTML(s)}<span class="row-text"><b>${esc(s.name)}</b><small>${esc(metaLine(s, opts.country !== false))}</small></span>
    </button>${end}</div>`;
}
function emptyHTML(icon, title, sub, btn) {
  return `<div class="empty"><span class="empty-ico"><svg><use href="#${icon}"/></svg></span><b>${esc(title)}</b><span>${esc(sub || '')}</span>${btn || ''}</div>`;
}
const skeletons = (n = 6) => Array.from({ length: n }, () => '<div class="skeleton"></div>').join('');

/* lists the delegated play handler can resolve ids against */
const sources = { fav: () => (panelStack.includes('panelLibrary') && libTab === 'favorites' && libCountry !== 'all' ? libView : state.favorites), rec: () => state.recents, country: () => stationView, search: () => searchView, blk: () => state.blocked };

/* ───────────────────────── panels ───────────────────────── */
const panelStack = [];
const scrim = $('scrim');
let selfBack = 0;            // history.back() calls we made ourselves
function openPanel(id) {
  const el = $(id);
  if (panelStack.includes(id)) return;
  panelStack.push(id);
  el.hidden = false;
  scrim.hidden = false;
  requestAnimationFrame(() => { el.classList.add('show'); scrim.classList.add('show'); });
  history.pushState({ panel: id }, '');
  render();
}
function closeTopPanel(fromPop) {
  const id = panelStack.pop();
  if (!id) return;
  const el = $(id);
  el.classList.remove('show');
  if (!panelStack.length) scrim.classList.remove('show');
  setTimeout(() => { if (!panelStack.includes(id)) el.hidden = true; if (!panelStack.length && !sheetOpen) scrim.hidden = true; }, 380);
  if (!fromPop) { selfBack++; history.back(); }
  render();
}
window.addEventListener('popstate', () => {
  if (selfBack > 0) { selfBack--; return; }
  if (sheetOpen) { closeSheet(true); return; }
  if (panelStack.length) closeTopPanel(true);
});
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeTopPanel()));
scrim.addEventListener('click', () => { if (sheetOpen) closeSheet(); else closeTopPanel(); });

/* countries */
let continent = 'all';
async function openCountries() {
  openPanel('panelCountries');
  continent = state.scope !== 'country' ? state.scope : (CONTINENT_OF[state.country] || 'all');
  $('countrySearch').value = '';
  renderContinents();
  $('countryList').innerHTML = skeletons(8);
  try { await getCountries(); renderCountries(); }
  catch (_) { $('countryList').innerHTML = emptyHTML('i-globe', t('countries.error'), '', `<button type="button" class="btn" id="retryCountries">${esc(t('action.retry'))}</button>`); }
}
function renderContinents() {
  $('continentChips').innerHTML = CONTINENTS.map((c) => `<button type="button" class="chip${c === continent ? ' on' : ''}" data-continent="${c}">${esc(t('continent.' + c))}</button>`).join('');
  $('shuffleRegionTitle').textContent = continent === 'all' ? t('countries.shuffleWorld') : t('countries.shuffle', { region: t('continent.' + continent) });
  const on = state.scope === continent;
  $('btnShuffleRegion').classList.toggle('on', on);
  $('btnShuffleRegion').querySelector('small').textContent = on ? t('countries.scopeOn') : t('countries.shuffleSub');
}
function renderCountries() {
  if (!countriesCache) return;
  const q = fold($('countrySearch').value.trim());
  let list = countriesCache.map((c) => ({ ...c, label: countryLabel(c.iso) }));
  if (continent !== 'all' && !q) list = list.filter((c) => CONTINENT_OF[c.iso] === continent);
  if (q) list = list.filter((c) => fold(c.label).includes(q) || c.iso.toLowerCase() === q);
  list.sort((a, b) => a.label.localeCompare(b.label, state.lang));
  const cur = state.scope === 'country' ? list.findIndex((c) => c.iso === state.country) : -1;
  if (cur > 0 && !q) list.unshift(list.splice(cur, 1)[0]);
  $('countryList').innerHTML = list.length
    ? `<div class="rows">${list.map((c) => `<div class="row${c.iso === state.country && state.scope === 'country' ? ' current' : ''}">
        <button type="button" class="row-main" data-country="${c.iso}">${flagHTML(c.iso)}<span class="row-text"><b>${esc(c.label)}</b><small>${esc(t('countries.stations', { n: c.n.toLocaleString(state.lang) }))}</small></span></button>
        ${c.iso === state.country && state.scope === 'country' ? '<span class="row-act on"><svg><use href="#i-check"/></svg></span>' : ''}</div>`).join('')}</div>`
    : emptyHTML('i-globe', t('countries.none'));
}
function shuffleRegion() {
  state.scope = continent;            // 'all' or a continent id; stays on until a country is picked
  save();
  toast(t('toast.scope', { abl: t('abl.' + continent) }));
  closeTopPanel();
  spinKick(720);
  shuffleScope();
}
let scopeBusy = false;
async function shuffleScope(opts = {}) {
  if (scopeBusy) return;
  scopeBusy = true;
  const scope = state.scope;
  try {
    const list = await getCountries();
    const pool = list.filter((c) => (scope === 'all' || CONTINENT_OF[c.iso] === scope) && c.n >= 3);
    const total = pool.reduce((a, c) => a + Math.sqrt(c.n), 0);
    const exclude = player.station ? [player.station.id] : [];
    for (let i = 0; i < 6 && pool.length; i++) {
      // bigger countries a little more likely, small ones still turn up
      let r = Math.random() * total, c = pool[0];
      for (const x of pool) { r -= Math.sqrt(x.n); if (r <= 0) { c = x; break; } }
      if (i === 0 && player.station && c.iso === player.station.cc && pool.length > 1) continue;
      try {
        const st = (await getCountryStations(c.iso)).filter((x) => !isBlocked(x.id) && !exclude.includes(x.id));
        if (!st.length) continue;
        const pick = st[Math.floor(Math.random() * st.length)];
        playStation(pick, { queueKind: 'scope', queue: [pick], isSkip: opts.isSkip });
        return;
      } catch (_) {}
    }
    toast(t('toast.noStations'));
  } catch (_) { toast(t('countries.error')); }
  finally { scopeBusy = false; }
}

/* stations in country */
let stationView = [];
let stationGenre = 'all';
let stationLimit = 80;
function openStations() {
  stationGenre = 'all'; stationLimit = 80;
  $('stationSearch').value = '';
  openPanel('panelStations');
  renderStations();
}
function renderStations() {
  $('stationsTitle').textContent = t('stations.title', { country: countryLabel(state.country) });
  if (countryLoad.status === 'loading') { $('genreChips').innerHTML = ''; $('stationList').innerHTML = skeletons(8); return; }
  if (countryLoad.status === 'error') { $('stationList').innerHTML = emptyHTML('i-list', t('hint.error'), '', `<button type="button" class="btn" id="retryStations">${esc(t('action.retry'))}</button>`); return; }
  const counts = new Map();
  tunable.forEach((s) => { const g = genreOf(s); counts.set(g, (counts.get(g) || 0) + 1); });
  const top = [...counts].filter(([g]) => g !== t('genre.default')).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([g]) => g);
  $('genreChips').innerHTML = ['all', ...top].map((g) => `<button type="button" class="chip${g === stationGenre ? ' on' : ''}" data-genre="${esc(g)}">${esc(g === 'all' ? t('stations.all') : g)}</button>`).join('');
  const q = fold($('stationSearch').value.trim());
  // popular first for browsing; the dial order is only for turning
  stationView = [...tunable].sort((a, b) => b.votes - a.votes)
    .filter((s) => (stationGenre === 'all' || genreOf(s) === stationGenre) && (!q || fold(s.name).includes(q) || fold(s.tags).includes(q)));
  const hidden = countryAll.length - tunable.length;
  let html = stationView.length
    ? `<div class="rows">${stationView.slice(0, stationLimit).map((s) => rowHTML(s, 'country', { country: false })).join('')}</div>`
    : emptyHTML('i-search', t('stations.none'));
  if (stationView.length > stationLimit) html += `<div class="more-row"><button type="button" class="btn" id="moreStations">${esc(t('action.more'))}</button></div>`;
  if (hidden > 0) html += `<p class="about">${esc(t('stations.hidden', { n: hidden }))}</p>`;
  $('stationList').innerHTML = html;
}

/* search */
let searchView = [];
let searchScope = 'world';
let searchState = { status: 'idle', label: '' };
let searchSeq = 0;
function openSearch(prefillMood) {
  openPanel('panelSearch');
  $('scopeCountryBtn').textContent = t('search.inCountry', { country: countryLabel(state.country) });
  renderScope();
  if (prefillMood) runSearch({ tag: prefillMood.tag, label: t('mood.' + prefillMood.id) });
  else { renderSearchResults(); setTimeout(() => $('globalSearch').focus(), 350); }
}
function renderScope() {
  document.querySelectorAll('#searchScope button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.scope === searchScope)));
}
async function runSearch({ name, tag, label }) {
  const seq = ++searchSeq;
  searchState = { status: 'loading', label: label || name || tag, name, tag };
  renderSearchResults();
  try {
    const res = await searchStations({ name, tag, iso: searchScope === 'country' ? state.country : '' });
    if (seq !== searchSeq) return;
    searchView = res.filter((s) => !isBlocked(s.id));
    searchState.status = 'ok';
  } catch (_) {
    if (seq !== searchSeq) return;
    searchState.status = 'error';
  }
  renderSearchResults();
}
function renderSearchResults() {
  const body = $('searchBody');
  if (searchState.status === 'idle') {
    body.innerHTML = `<div class="group-label">${esc(t('search.browse'))}</div><div class="chips" style="flex-wrap:wrap">${MOODS.map((m) => `<button type="button" class="chip" data-search-mood="${m.id}">${esc(t('mood.' + m.id))}</button>`).join('')}</div>`
      + (state.recents.length ? `<div class="group-label">${esc(t('mod.recents'))}</div><div class="rows">${state.recents.slice(0, 6).map((s) => rowHTML(s, 'rec')).join('')}</div>` : '');
    return;
  }
  if (searchState.status === 'loading') { body.innerHTML = skeletons(7); return; }
  if (searchState.status === 'error') { body.innerHTML = emptyHTML('i-search', t('search.error')); return; }
  body.innerHTML = `<div class="group-label">${esc(searchState.label)} · ${esc(t('search.results', { n: searchView.length }))}</div>`
    + (searchView.length ? `<div class="rows">${searchView.map((s) => rowHTML(s, 'search')).join('')}</div>` : emptyHTML('i-search', t('search.none')));
}
let searchDebounce = null;
$('globalSearch').addEventListener('input', (e) => {
  clearTimeout(searchDebounce);
  const q = e.target.value.trim();
  if (q.length < 2) { searchSeq++; searchState = { status: 'idle' }; renderSearchResults(); return; }
  searchDebounce = setTimeout(() => runSearch({ name: q }), 380);
});
$('globalSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.target.blur(); } });
$('searchScope').addEventListener('click', (e) => {
  const b = e.target.closest('[data-scope]'); if (!b) return;
  searchScope = b.dataset.scope; renderScope();
  if (searchState.status !== 'idle') runSearch(searchState);
});

/* library */
let libTab = 'favorites';
let libCountry = 'all';
function openLibrary(tab) {
  if (tab) libTab = tab;
  openPanel('panelLibrary');
  renderLibrary();
}
function renderLibrary() {
  document.querySelectorAll('#libTabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === libTab)));
  $('cntFav').textContent = state.favorites.length || '';
  $('cntRec').textContent = state.recents.length || '';
  $('cntBlk').textContent = state.blocked.length || '';
  const el = $('libraryList');
  if (libTab === 'favorites') {
    const byCc = new Map();
    state.favorites.forEach((s) => byCc.set(s.cc, (byCc.get(s.cc) || 0) + 1));
    if (libCountry !== 'all' && !byCc.has(libCountry)) libCountry = 'all';
    const ccs = [...byCc].sort((a, b) => b[1] - a[1] || countryLabel(a[0]).localeCompare(countryLabel(b[0]), state.lang));
    const chips = ccs.length > 1
      ? `<div class="chips scroll-x fav-countries"><button type="button" class="chip${libCountry === 'all' ? ' on' : ''}" data-libcc="all">${esc(t('stations.all'))} <em>${state.favorites.length}</em></button>${ccs.map(([cc, n]) => `<button type="button" class="chip${libCountry === cc ? ' on' : ''}" data-libcc="${esc(cc)}">${flagHTML(cc)}${esc(countryLabel(cc))} <em>${n}</em></button>`).join('')}</div>`
      : '';
    const list = libCountry === 'all' ? state.favorites : state.favorites.filter((s) => s.cc === libCountry);
    libView = list;
    el.innerHTML = state.favorites.length ? `${chips}<div class="rows">${list.map((s) => rowHTML(s, 'fav')).join('')}</div>` : emptyHTML('i-heart', t('library.emptyFav'), t('library.emptyFavSub'));
  } else if (libTab === 'recents') {
    el.innerHTML = state.recents.length
      ? `<div class="rows">${state.recents.map((s) => rowHTML(s, 'rec')).join('')}</div><div class="more-row"><button type="button" class="btn" id="clearRecents"><svg><use href="#i-trash"/></svg>${esc(t('library.clearRecents'))}</button></div>`
      : emptyHTML('i-list', t('library.emptyRec'), t('library.emptyRecSub'));
  } else {
    el.innerHTML = state.blocked.length ? `<div class="rows">${state.blocked.map((s) => rowHTML(s, 'blk', { unblock: true })).join('')}</div>` : emptyHTML('i-ban', t('library.emptyBlk'), t('library.emptyBlkSub'));
  }
}
let libView = [];
$('libraryList').addEventListener('click', (e) => { const b = e.target.closest('[data-libcc]'); if (b) { libCountry = b.dataset.libcc; renderLibrary(); } });
$('libTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { libTab = b.dataset.tab; renderLibrary(); } });

/* settings */
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (panelStack.includes('panelSettings')) renderSettings(); });
function sw(id, on) { return `<label class="switch"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><span></span></label>`; }
function seg(id, value, opts) { return `<div class="seg" id="${id}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-selected="${v === value}">${esc(l)}</button>`).join('')}</div>`; }
function renderSettings() {
  const hours = state.listenSeconds / 3600;
  const hoursText = hours < 10 ? hours.toFixed(1).replace('.', state.lang === 'tr' ? ',' : '.') : Math.round(hours);
  const installText = isStandalone() ? t('set.installed') : installEvt ? t('set.installHint') : isIOS ? t('set.installIos') : t('set.installAndroid');
  $('settingsBody').innerHTML = `
    <div class="stats">
      <div class="stat"><b>${hoursText}</b><small>${esc(t('stat.hours'))}</small></div>
      <div class="stat"><b>${state.countriesHeard.length}</b><small>${esc(t('stat.countries'))}</small></div>
      <div class="stat"><b>${state.favorites.length}</b><small>${esc(t('stat.favorites'))}</small></div>
    </div>

    <div class="group-label">${esc(t('set.look'))}</div>
    <div class="rows">
      <div class="set"><span class="set-text"><b>${esc(t('set.theme'))}</b></span>${seg('segTheme', state.theme, [['system', t('theme.system')], ['light', t('theme.light')], ['dark', t('theme.dark')]])}</div>
      <div class="set stack"><span class="set-text"><b>${esc(t('set.color'))}</b></span>
        <div class="swatches">${ACCENTS.map((a) => `<button type="button" class="swatch${a.id === state.accent ? ' on' : ''}" style="background:${a.hex}" data-accent="${a.id}" aria-label="${a.id}"><svg><use href="#i-check"/></svg></button>`).join('')}</div></div>
    </div>

    <div class="group-label">${esc(t('set.home'))}</div>
    <div class="rows">
      <div class="set stack"><span class="set-text"><small>${esc(t('set.homeSub'))}</small></span>
        <div class="preset-row"><button type="button" class="btn" id="presetSimple">${esc(t('preset.simple'))}</button><button type="button" class="btn" id="presetFull">${esc(t('preset.full'))}</button></div></div>
      <div class="set"><span class="set-text"><b>${esc(t('mod.favorites'))}</b><small>${esc(t('mod.favsHint'))}</small></span>${sw('modFavsSw', state.modules.favs)}</div>
      <div class="set"><span class="set-text"><b>${esc(t('mod.recents'))}</b><small>${esc(t('mod.recentsHint'))}</small></span>${sw('modRecentsSw', state.modules.recents)}</div>
      <div class="set"><span class="set-text"><b>${esc(t('mod.moods'))}</b><small>${esc(t('mod.moodsHint'))}</small></span>${sw('modMoodsSw', state.modules.moods)}</div>
      <div class="set"><span class="set-text"><b>${esc(t('mod.dial'))}</b><small>${esc(t('mod.dialHint'))}</small></span>${sw('modDialSw', state.modules.dial)}</div>
      <button type="button" class="set" id="setPets" style="width:100%;text-align:left"><span class="set-text"><b>${esc(t('pets.title'))}</b><small>${esc(t('pets.setHint'))}</small></span><span class="row-end">${Object.values(state.pets).filter(Boolean).length}</span><svg style="color:var(--ink-3)"><use href="#i-chevron"/></svg></button>
    </div>

    <div class="group-label">${esc(t('set.listen'))}</div>
    <div class="rows">
      <div class="set"><span class="set-text"><b>${esc(t('set.autoSkip'))}</b><small>${esc(t('set.autoSkipHint'))}</small></span>${sw('autoSkipSw', state.autoSkip)}</div>
      <button type="button" class="set" id="setSleep" style="width:100%;text-align:left"><span class="set-text"><b>${esc(t('set.sleep'))}</b></span><span class="row-end">${sleep.endAt ? esc(t('sleep.left', { t: $('sleepChipText').textContent })) : esc(t('set.sleepOff'))}</span><svg style="color:var(--ink-3)"><use href="#i-chevron"/></svg></button>
      <div class="set"><span class="set-text"><b>${esc(t('set.lang'))}</b></span>${seg('segLang', state.lang, [['tr', 'Türkçe'], ['en', 'English']])}</div>
    </div>

    <div class="group-label">${esc(t('set.app'))}</div>
    <div class="rows">
      <div class="set"><span class="set-text"><b>${esc(t('set.install'))}</b><small>${esc(installText)}</small></span>${installEvt && !isStandalone() ? `<button type="button" class="btn primary" id="installBtn">${esc(t('set.install'))}</button>` : ''}</div>
      <button type="button" class="set" id="shareApp" style="width:100%;text-align:left"><span class="set-text"><b>${esc(t('set.shareApp'))}</b><small>${esc(t('set.shareAppHint'))}</small></span><svg style="color:var(--ink-3)"><use href="#i-share"/></svg></button>
    </div>

    <div class="group-label">${esc(t('set.data'))}</div>
    <div class="rows">
      <button type="button" class="set" id="backupBtn" style="width:100%;text-align:left"><span class="set-text"><b>${esc(t('set.backup'))}</b><small>${esc(t('set.backupHint'))}</small></span><svg style="color:var(--ink-3)"><use href="#i-chevron"/></svg></button>
      <button type="button" class="set" id="restoreBtn" style="width:100%;text-align:left"><span class="set-text"><b>${esc(t('set.restore'))}</b><small>${esc(t('set.restoreHint'))}</small></span><svg style="color:var(--ink-3)"><use href="#i-chevron"/></svg></button>
      <button type="button" class="set" id="resetBtn" style="width:100%;text-align:left"><span class="set-text"><b style="color:var(--danger)">${esc(t('set.reset'))}</b><small>${esc(t('set.resetHint'))}</small></span></button>
    </div>
    <p class="about">${t('about')}<br>Orbitune 1.0</p>`;
}
$('settingsBody').addEventListener('change', (e) => {
  const id = e.target.id;
  const map = { modFavsSw: 'favs', modRecentsSw: 'recents', modMoodsSw: 'moods', modDialSw: 'dial' };
  if (map[id]) { state.modules[map[id]] = e.target.checked; save(); render(); }
  if (id === 'autoSkipSw') { state.autoSkip = e.target.checked; save(); }
});
$('settingsBody').addEventListener('click', async (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.closest('#segTheme')) { state.theme = b.dataset.v; applyTheme(); save(); renderSettings(); }
  else if (b.closest('#segLang')) { state.lang = b.dataset.v; save(); applyLang(); renderSettings(); }
  else if (b.dataset.accent) { state.accent = b.dataset.accent; applyTheme(); save(); renderSettings(); }
  else if (b.id === 'presetSimple') { state.modules = { ...state.modules, favs: true, recents: false, moods: false, dial: false }; save(); render(); renderSettings(); }
  else if (b.id === 'presetFull') { state.modules = { ...state.modules, favs: true, recents: true, moods: true, dial: true }; save(); render(); renderSettings(); }
  else if (b.id === 'setSleep') openSleepSheet();
  else if (b.id === 'setPets') Pets.openSheet();
  else if (b.id === 'installBtn' && installEvt) { installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = null; renderSettings(); }
  else if (b.id === 'shareApp') shareLink(appUrl(), t('share.appText'));
  else if (b.id === 'backupBtn') openBackupSheet();
  else if (b.id === 'restoreBtn') openRestoreSheet();
  else if (b.id === 'resetBtn') openResetSheet();
});

/* ───────────────────────── bottom sheet ───────────────────────── */
let sheetOpen = false;
function openSheet(html) {
  $('sheetBody').innerHTML = html;
  const el = $('sheet');
  el.hidden = false; scrim.hidden = false;
  requestAnimationFrame(() => { el.classList.add('show'); scrim.classList.add('show'); });
  if (!sheetOpen) history.pushState({ sheet: 1 }, '');
  sheetOpen = true;
}
function closeSheet(fromPop) {
  if (!sheetOpen) return;
  sheetOpen = false;
  const el = $('sheet');
  el.classList.remove('show');
  if (!panelStack.length) scrim.classList.remove('show');
  setTimeout(() => { if (!sheetOpen) { el.hidden = true; if (!panelStack.length) scrim.hidden = true; } }, 340);
  if (!fromPop) { selfBack++; history.back(); }
}
function openMoreSheet() {
  const s = player.station; if (!s) return;
  const sleepNote = sleep.endAt ? `<small>${esc($('sleepChipText').textContent)}</small>` : '';
  openSheet(`
    <div class="sheet-head">${artHTML(s)}<span class="row-text"><b>${esc(s.name)}</b><small>${esc(metaLine(s))}</small></span></div>
    <button type="button" class="action" data-act="share"><svg><use href="#i-share"/></svg>${esc(t('more.share'))}</button>
    <button type="button" class="action" data-act="sleep"><svg><use href="#i-moon"/></svg>${esc(t('more.sleep'))}${sleepNote}</button>
    <button type="button" class="action" data-act="list"><svg><use href="#i-list"/></svg>${esc(t('more.list', { country: countryLabel(state.country) }))}</button>
    ${s.homepage && /^https?:\/\//i.test(s.homepage) ? `<a class="action" href="${esc(s.homepage)}" target="_blank" rel="noopener"><svg><use href="#i-link"/></svg>${esc(t('more.site'))}</a>` : ''}
    <button type="button" class="action danger" data-act="block"><svg><use href="#i-ban"/></svg>${esc(t('more.block'))}</button>`);
}
function openSleepSheet() {
  const opts = [15, 30, 45, 60, 90, 120];
  openSheet(`
    <h3 class="sheet-title">${esc(t('sleep.title'))}</h3>
    <p class="sheet-sub">${esc(t('sleep.sub'))}</p>
    <div class="sleep-grid">${opts.map((m) => `<button type="button" class="btn${sleep.minutes === m && sleep.endAt ? ' on' : ''}" data-sleep="${m}">${esc(t('sleep.min', { n: m }))}</button>`).join('')}</div>
    ${sleep.endAt ? `<div class="sheet-actions"><button type="button" class="btn" data-sleep="0">${esc(t('sleep.off'))}</button></div>` : ''}`);
}
function encodeBackup() {
  const data = { v: 1, f: state.favorites, b: state.blocked };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}
function openBackupSheet() {
  openSheet(`
    <h3 class="sheet-title">${esc(t('backup.title'))}</h3>
    <p class="sheet-sub">${esc(t('backup.sub'))}</p>
    <textarea class="code-box" id="backupCode" readonly>${esc(encodeBackup())}</textarea>
    <div class="sheet-actions" style="margin-top:12px"><button type="button" class="btn primary" id="copyBackup">${esc(t('backup.copy'))}</button></div>`);
}
function openRestoreSheet() {
  openSheet(`
    <h3 class="sheet-title">${esc(t('restore.title'))}</h3>
    <p class="sheet-sub">${esc(t('restore.sub'))}</p>
    <textarea class="code-box" id="restoreCode" spellcheck="false"></textarea>
    <div class="sheet-actions" style="margin-top:12px"><button type="button" class="btn" data-dismiss>${esc(t('action.cancel'))}</button><button type="button" class="btn primary" id="doRestore">${esc(t('restore.go'))}</button></div>`);
}
function openResetSheet() {
  openSheet(`
    <h3 class="sheet-title">${esc(t('reset.title'))}</h3>
    <p class="sheet-sub">${esc(t('reset.sub'))}</p>
    <div class="sheet-actions"><button type="button" class="btn" data-dismiss>${esc(t('action.cancel'))}</button><button type="button" class="btn danger" id="doReset">${esc(t('reset.go'))}</button></div>`);
}
$('sheet').addEventListener('click', async (e) => {
  const b = e.target.closest('button, a'); if (!b) return;
  if (b.dataset.pet || b.id === 'petsNone') return;      // handled in pets.js
  if (b.hasAttribute('data-dismiss')) { closeSheet(); return; }
  if (b.dataset.sleep !== undefined) { setSleep(Number(b.dataset.sleep)); closeSheet(); if (panelStack.includes('panelSettings')) renderSettings(); return; }
  const act = b.dataset.act;
  const s = player.station;
  if (act === 'share' && s) { closeSheet(); shareLink(stationUrl(s), t('share.text', { name: s.name })); }
  else if (act === 'sleep') openSleepSheet();
  else if (act === 'list') { closeSheet(); setTimeout(openStations, 260); }
  else if (act === 'block' && s) { closeSheet(); blockStation(s); }
  else if (b.tagName === 'A') closeSheet();
  else if (b.id === 'copyBackup') copyText($('backupCode').value, $('backupCode'));
  else if (b.id === 'doRestore') {
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob($('restoreCode').value.trim()))));
      if (!data || !Array.isArray(data.f)) throw new Error('bad');
      const ok = (x) => x && typeof x.id === 'string' && typeof x.url === 'string' && typeof x.name === 'string';
      const fav = data.f.filter(ok);
      const ids = new Set(state.favorites.map((x) => x.id));
      state.favorites = [...state.favorites, ...fav.filter((x) => !ids.has(x.id))];
      if (Array.isArray(data.b)) { const bid = new Set(state.blocked.map((x) => x.id)); state.blocked = [...state.blocked, ...data.b.filter(ok).filter((x) => !bid.has(x.id))]; }
      save(); closeSheet(); refreshTunable(); renderAll();
      toast(t('toast.imported', { n: fav.length }));
    } catch (_) { toast(t('toast.importFail')); }
  } else if (b.id === 'doReset') {
    const keep = { lang: state.lang, theme: state.theme, accent: state.accent, modules: state.modules, country: state.country, autoSkip: state.autoSkip, pets: state.pets, petHomes: state.petHomes };
    Object.assign(state, structuredClone(DEFAULTS), keep);
    save(); closeSheet(); refreshTunable(); renderAll();
    toast(t('toast.reset'));
  }
});

/* ───────────────────────── sharing ───────────────────────── */
const appUrl = () => location.origin + location.pathname;
const stationUrl = (s) => `${appUrl()}?s=${encodeURIComponent(s.id)}`;
async function shareLink(url, text) {
  if (navigator.share && location.protocol === 'https:') {
    try { await navigator.share({ title: 'Orbitune', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  copyText(url);
}
async function copyText(text, selectEl) {
  try { await navigator.clipboard.writeText(text); toast(t('toast.copied')); }
  catch (_) { if (selectEl) { selectEl.focus(); selectEl.select(); } toast(t('toast.copyFail')); }
}

/* ───────────────────────── toast ───────────────────────── */
let toastTimer = null;
function toast(msg, action) {
  const el = $('toast');
  el.innerHTML = esc(msg) + (action ? ` <button type="button" class="link-btn" id="toastAct" style="color:inherit;text-decoration:underline;margin-left:6px">${esc(action.label)}</button>` : '');
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  if (action) $('toastAct').onclick = () => { action.fn(); hideToast(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, action ? 4500 : 2600);
}
function hideToast() { const el = $('toast'); el.classList.remove('show'); setTimeout(() => { if (!el.classList.contains('show')) el.hidden = true; }, 320); }

/* ───────────────────────── global clicks ───────────────────────── */
function findStation(id, src) {
  const lists = src && sources[src] ? [sources[src]()] : Object.values(sources).map((f) => f());
  for (const l of lists) { const s = l.find((x) => x.id === id); if (s) return { s, list: l }; }
  return null;
}
document.addEventListener('click', (e) => {
  const playBtn = e.target.closest('[data-play]');
  if (playBtn) {
    const hit = findStation(playBtn.dataset.play, playBtn.dataset.src);
    if (hit) {
      if (player.station && player.station.id === hit.s.id && player.status === 'live') return;
      spinKick(360);
      playStation(hit.s, { queue: hit.list });
    }
    return;
  }
  const favBtn = e.target.closest('[data-fav]');
  if (favBtn) { lastFavBtn = favBtn; const hit = findStation(favBtn.dataset.fav, favBtn.dataset.src); if (hit) toggleFav(hit.s); return; }
  const unb = e.target.closest('[data-unblock]');
  if (unb) { state.blocked = state.blocked.filter((x) => x.id !== unb.dataset.unblock); save(); refreshTunable(); renderAll(); toast(t('toast.unblocked')); return; }
  const ctry = e.target.closest('[data-country]');
  if (ctry) { closeTopPanel(); state.scope = 'country'; save(); selectCountry(ctry.dataset.country); render(); return; }
  const cont = e.target.closest('[data-continent]');
  if (cont) { continent = cont.dataset.continent; $('countrySearch').value = ''; renderContinents(); renderCountries(); $('countryList').scrollTop = 0; return; }
  const gen = e.target.closest('[data-genre]');
  if (gen) { stationGenre = gen.dataset.genre; stationLimit = 80; renderStations(); $('stationList').scrollTop = 0; return; }
  const mood = e.target.closest('[data-mood]');
  if (mood) { playMood(MOODS.find((m) => m.id === mood.dataset.mood)); return; }
  const smood = e.target.closest('[data-search-mood]');
  if (smood) { const m = MOODS.find((x) => x.id === smood.dataset.searchMood); $('globalSearch').value = ''; runSearch({ tag: m.tag, label: t('mood.' + m.id) }); return; }
  if (e.target.closest('[data-qmore]')) { openLibrary(state.quickTab === 'favs' ? 'favorites' : 'recents'); return; }
  if (e.target.closest('#moreStations')) { stationLimit += 80; renderStations(); return; }
  if (e.target.closest('#retryStations')) { stationCache.delete(state.country); countryLoad.iso = null; selectCountry(state.country); return; }
  if (e.target.closest('#retryCountries')) { closeTopPanel(); setTimeout(openCountries, 400); return; }
  if (e.target.closest('#clearRecents')) { state.recents = []; save(); renderAll(); return; }
});

async function playMood(m) {
  if (!m) return;
  const chip = document.querySelector(`[data-mood="${m.id}"]`);
  chip && chip.classList.add('on');
  try {
    let list = (await searchStations({ tag: m.tag, iso: state.country, limit: 60 })).filter((s) => !isBlocked(s.id));
    if (list.length < 3) list = (await searchStations({ tag: m.tag, limit: 100 })).filter((s) => !isBlocked(s.id));
    const pick = randomFrom(list, player.station ? [player.station.id] : []);
    if (!pick) { toast(t('toast.noMood', { mood: t('mood.' + m.id) })); return; }
    spinKick(540);
    playStation(pick, { queue: list, adoptCountry: false });
  } catch (_) { toast(t('search.error')); }
  finally { setTimeout(() => chip && chip.classList.remove('on'), 500); }
}

$('btnPlay').addEventListener('click', togglePlay);
$('miniPlay').addEventListener('click', togglePlay);
$('miniInfo').addEventListener('click', () => { while (panelStack.length) closeTopPanel(); });
$('btnNext').addEventListener('click', () => playNeighbour(1));
$('btnPrev').addEventListener('click', () => playNeighbour(-1));
$('btnFav').addEventListener('click', () => { lastFavBtn = $('btnFav'); toggleFav(player.station); });
$('btnMore').addEventListener('click', openMoreSheet);
$('btnTryOther').addEventListener('click', () => { const s = neighbour(1, true) || randomFrom(tunable); if (s) playStation(s, { queue: player.queue.length > 1 ? player.queue : tunable, adoptCountry: false }); });
$('btnCountry').addEventListener('click', openCountries);
$('btnStations').addEventListener('click', openStations);
$('quickTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-qtab]'); if (b) { state.quickTab = b.dataset.qtab; save(); renderQuick(); } });
$('quickAll').addEventListener('click', () => { if (state.quickTab === 'moods') openSearch(); else openLibrary(state.quickTab === 'favs' ? 'favorites' : 'recents'); });
$('btnSearch').addEventListener('click', () => openSearch());
$('btnLibrary').addEventListener('click', () => openLibrary());
$('btnSettings').addEventListener('click', () => { openPanel('panelSettings'); renderSettings(); });
$('sleepChip').addEventListener('click', openSleepSheet);
$('btnShuffleRegion').addEventListener('click', shuffleRegion);
$('countrySearch').addEventListener('input', renderCountries);
$('stationSearch').addEventListener('input', () => { stationLimit = 80; renderStations(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (sheetOpen) closeSheet(); else if (panelStack.length) closeTopPanel(); return; }
  if (e.target.closest('input, textarea')) return;
  if (panelStack.length || sheetOpen) return;
  if (e.key === ' ' && e.target === document.body) { e.preventDefault(); togglePlay(); }
  else if (e.key === 'ArrowRight') playNeighbour(1);
  else if (e.key === 'ArrowLeft') playNeighbour(-1);
  else if (e.key.toLowerCase() === 'r') shuffleCountry();
});

/* mouse users: drag or wheel any horizontal row */
(() => {
  let sc = null, sx = 0, sl = 0, dragged = false;
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    sc = e.target.closest('.scroll-x');
    if (!sc || sc.scrollWidth <= sc.clientWidth) { sc = null; return; }
    sx = e.clientX; sl = sc.scrollLeft; dragged = false;
  });
  document.addEventListener('pointermove', (e) => {
    if (!sc) return;
    const dx = e.clientX - sx;
    if (!dragged && Math.abs(dx) > 5) { dragged = true; sc.classList.add('dragging'); }
    if (dragged) sc.scrollLeft = sl - dx;
  });
  const end = () => {
    if (!sc) return;
    if (dragged) {
      sc.classList.remove('dragging');
      const block = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      window.addEventListener('click', block, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', block, { capture: true }), 50);
    }
    sc = null;
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
  document.addEventListener('wheel', (e) => {
    const row = e.target.closest('.scroll-x');
    if (!row || row.scrollWidth <= row.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    row.scrollLeft += e.deltaY;
    e.preventDefault();
  }, { passive: false });
})();

/* online / offline */
function netState() { $('offline').hidden = navigator.onLine !== false; }
window.addEventListener('online', () => { netState(); if (countryLoad.status === 'error') { countryLoad.iso = null; selectCountry(state.country); } });
window.addEventListener('offline', netState);

/* ───────────────────────── theme + language ───────────────────────── */
function applyTheme() {
  const root = document.documentElement;
  if (state.theme === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', state.theme);
  root.setAttribute('data-accent', state.accent);
  const dark = state.theme === 'dark' || (state.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#121117' : '#F5F4F8'));
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
function applyLang() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); el.title = t(el.dataset.i18nLabel); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  renderAll();
}

/* ───────────────────────── boot ───────────────────────── */
async function boot() {
  applyTheme();
  applyLang();
  netState();
  history.replaceState({ root: 1 }, '');
  if (state.lastStation && playable(state.lastStation)) {
    player.station = state.lastStation;
    player.status = 'idle';
    // If the Activity/WebView got recreated while the native player was
    // still actually going (an OEM killing/recreating it in the
    // background is the leading theory), this fresh boot() has no idea -
    // without this check the UI would show idle/not-playing over audio
    // that's genuinely still live, and a later playStation() call (e.g.
    // from shuffle) would start a SECOND stream on top of it instead of
    // taking over the existing one. Same reconciliation the
    // visibilitychange handler does below, just also needed here since a
    // fresh boot is a separate code path from a resume.
    if (NativeAudio) {
      const genAtBoot = playGen;
      NativeAudio.isPlaying({ assetId: NATIVE_ASSET_ID }).then((res) => {
        if (genAtBoot !== playGen) return;
        const reallyPlaying = !!(res && (res.isPlaying ?? res.value));
        if (reallyPlaying) { player.status = 'live'; render(); updateMediaSession(); }
      }).catch(() => {});
    }
  }
  const shared = new URLSearchParams(location.search).get('s');
  if (shared) history.replaceState({ root: 1 }, '', location.pathname);
  const iso = player.station && player.station.cc ? player.station.cc : state.country;
  await selectCountry(iso);
  if (player.station) player.queue = tunable.some((x) => x.id === player.station.id) ? tunable : [player.station];
  render();
  if (shared) {
    try {
      const res = cleanList(await api('/json/stations/byuuid/' + encodeURIComponent(shared)));
      if (res[0]) {
        setCurrent(res[0], [res[0]]);
        player.status = 'ready';
        if (res[0].cc) await selectCountry(res[0].cc, { quiet: true });
        render();
        toast(t('toast.shared'));
      }
    } catch (_) {}
  }
  if (!isNative && 'serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
window.OrbApp = { openSheet, closeSheet, get sheetOpen() { return sheetOpen; } };
boot();
