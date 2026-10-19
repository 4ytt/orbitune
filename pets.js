/* Orbitune friends: little animals that live around the record.
   Uses globals from app.js: state, save, player, deck, disc, discWrap, clamp,
   reduceMotion, greeting, esc, $, OrbApp — and PET_FACTS from facts.js.     */
'use strict';
const Pets = (() => {
  /* ───────── strings ───────── */
  const PS = {
    tr: {
      label: 'Biliyor muydun?', title: 'Dostların',
      sub: 'Ekranda görmek istediklerini seç. Dokununca ilginç bilgiler anlatırlar, tutup plağın üstüne bırakırsan plakla dönerler.',
      on: 'Ekranda', off: 'Ekle', none: 'Hepsini kaldır', hello: 'Merhaba!', bye: 'Görüşürüz!',
      homes: 'Yuvaları göster', homesHint: 'Kedi yatağı, köpek kulübesi, kuş evi ve gölet',
    },
    en: {
      label: 'Did you know?', title: 'Your friends',
      sub: 'Pick who you want on screen. Tap them for a fun fact; drop them on the record and they go for a spin.',
      on: 'On screen', off: 'Add', none: 'Remove all', hello: 'Hello!', bye: 'See you!',
      homes: 'Show their homes', homesHint: 'Cat bed, dog house, birdhouse and pond',
    },
  };
  const pt = (k) => (PS[state.lang] || PS.tr)[k];
  const L = (o) => (o[state.lang] ?? o.tr);
  const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ───────── facts: half about the animal, half about the world, no repeats ───────── */
  const bags = {};
  function nextFact(kind) {
    const pool = Math.random() < 0.45 ? kind : 'world';
    if (!bags[pool] || !bags[pool].length) bags[pool] = PET_FACTS[pool].map((_, i) => i).sort(() => Math.random() - 0.5);
    const f = PET_FACTS[pool][bags[pool].pop()];
    return state.lang === 'en' ? f[1] : f[0];
  }

  /* ───────── drawings ───────── */
  const eyes = (lx, rx, y, rxE = 4.6, ryE = 5.6, ink = '#3A2A20') => `
    <g class="p-eyes-open" style="transform-origin:${(lx + rx) / 2}px ${y}px"><ellipse cx="${lx}" cy="${y}" rx="${rxE}" ry="${ryE}" fill="${ink}"/><ellipse cx="${rx}" cy="${y}" rx="${rxE}" ry="${ryE}" fill="${ink}"/><circle cx="${lx + 1.5}" cy="${y - 1.9}" r="1.6" fill="#fff"/><circle cx="${rx + 1.5}" cy="${y - 1.9}" r="1.6" fill="#fff"/><circle cx="${lx - 1.4}" cy="${y + 2}" r=".8" fill="#fff" opacity=".7"/><circle cx="${rx - 1.4}" cy="${y + 2}" r=".8" fill="#fff" opacity=".7"/></g>
    <g class="p-eyes-closed"><path d="M${lx - 5} ${y} q5 4.5 10 0 M${rx - 5} ${y} q5 4.5 10 0" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" fill="none"/></g>
    <g class="p-eyes-happy"><path d="M${lx - 5} ${y + 2} q5 -6 10 0 M${rx - 5} ${y + 2} q5 -6 10 0" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" fill="none"/></g>`;
  const svg = (vb, body) => `<svg class="pet-svg" viewBox="${vb}" aria-hidden="true">${body}</svg>`;

  // cat palette
  const C = { fur: '#F4A259', dark: '#D9792B', cream: '#FFF1DE', line: '#6B4226', pink: '#F7B3AE', nose: '#E7706F', blush: '#F28C8C' };
  const CAT_SIT = svg('0 0 120 120', `
    <g class="p-tail" style="transform-origin:84px 106px"><path d="M84 106 C 106 108, 114 88, 102 74" fill="none" stroke="${C.line}" stroke-width="11.5" stroke-linecap="round"/><path d="M84 106 C 106 108, 114 88, 102 74" fill="none" stroke="${C.fur}" stroke-width="7" stroke-linecap="round"/><path d="M104.5 80 l-5 -3 M108 90 l-6 -1" stroke="${C.dark}" stroke-width="2.8" stroke-linecap="round"/></g>
    <g class="p-body" style="transform-origin:60px 117px">
      <ellipse cx="60" cy="94" rx="29" ry="23" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5"/>
      <path d="M33 98 a29 23 0 0 0 54 0 a29 14 0 0 1 -54 0z" fill="${C.dark}" opacity=".25"/>
      <ellipse cx="60" cy="97" rx="15" ry="15.5" fill="${C.cream}"/>
      <path d="M53 84 l3 4 l4 -4 l4 4 l3 -4" stroke="${C.fur}" stroke-width="2.4" fill="none" stroke-linejoin="round" opacity=".7"/>
      <path d="M34 90 q5 1 7 5 M86 90 q-5 1 -7 5" stroke="${C.dark}" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <g class="p-paws" style="transform-origin:60px 114px"><ellipse cx="49" cy="114" rx="8.5" ry="5.2" fill="${C.cream}" stroke="${C.line}" stroke-width="2.3"/><ellipse cx="71" cy="114" rx="8.5" ry="5.2" fill="${C.cream}" stroke="${C.line}" stroke-width="2.3"/><path d="M46 113 v2.4 M50 113 v2.4 M68 113 v2.4 M72 113 v2.4" stroke="${C.line}" stroke-width="1.3" stroke-linecap="round" opacity=".5"/></g>
    </g>
    <g class="p-head" style="transform-origin:60px 80px">
      <g class="p-ear-l" style="transform-origin:44px 42px"><path d="M33 47 L36 17 L56 35 Z" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/><path d="M38 40 L39.5 25 L49 34 Z" fill="${C.pink}"/></g>
      <g class="p-ear-r" style="transform-origin:76px 42px"><path d="M87 47 L84 17 L64 35 Z" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/><path d="M82 40 L80.5 25 L71 34 Z" fill="${C.pink}"/></g>
      <ellipse cx="60" cy="55" rx="31" ry="25.5" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5"/>
      <path d="M29.5 58 q2 -6 6 -8 M90.5 58 q-2 -6 -6 -8" stroke="${C.cream}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/>
      <path d="M60 31 v8 M51.5 32.5 l2 7 M68.5 32.5 l-2 7" stroke="${C.dark}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="60" cy="66" rx="13" ry="9" fill="${C.cream}"/>
      ${eyes(47, 73, 55)}
      <ellipse cx="41" cy="64" rx="5" ry="3" fill="${C.blush}" opacity=".5"/><ellipse cx="79" cy="64" rx="5" ry="3" fill="${C.blush}" opacity=".5"/>
      <path d="M57 61.5 h6 l-3 3.2 z" fill="${C.nose}" stroke="${C.nose}" stroke-width="1.4" stroke-linejoin="round"/>
      <path class="p-mouth" d="M54 67 q3 3 6 0 q3 3 6 0" stroke="#3A2A20" stroke-width="2" stroke-linecap="round" fill="none"/>
      <ellipse class="p-yawn" style="transform-origin:60px 69px" cx="60" cy="69.5" rx="4.6" ry="5.6" fill="#8E3B3F" stroke="#3A2A20" stroke-width="1.8"/>
      <path d="M30 60 l-10 -2 M30 65 l-10 2 M90 60 l10 -2 M90 65 l10 2" stroke="${C.line}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>
    </g>`);
  const CAT_LIE = svg('0 0 160 100', `
    <g class="p-tail" style="transform-origin:34px 80px"><path d="M36 80 C 14 84, 6 66, 16 52" fill="none" stroke="${C.line}" stroke-width="11" stroke-linecap="round"/><path d="M36 80 C 14 84, 6 66, 16 52" fill="none" stroke="${C.fur}" stroke-width="6.5" stroke-linecap="round"/><path d="M14 60 l6 -1 M14 70 l6 1" stroke="${C.dark}" stroke-width="2.6" stroke-linecap="round"/></g>
    <g class="p-body" style="transform-origin:80px 97px">
      <ellipse cx="78" cy="75" rx="50" ry="22" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5"/>
      <path d="M48 57 q5 8 3 16 M63 54 q5 9 3 18 M78 53 q5 9 3 18" stroke="${C.dark}" stroke-width="3" stroke-linecap="round" fill="none"/>
      <ellipse cx="86" cy="88" rx="28" ry="7.5" fill="${C.cream}"/>
      <ellipse cx="44" cy="92" rx="12" ry="6" fill="${C.cream}" stroke="${C.line}" stroke-width="2.2"/>
      <ellipse cx="108" cy="94" rx="10.5" ry="5.6" fill="${C.cream}" stroke="${C.line}" stroke-width="2.2"/><ellipse cx="128" cy="94" rx="10.5" ry="5.6" fill="${C.cream}" stroke="${C.line}" stroke-width="2.2"/>
    </g>
    <g class="p-head" style="transform-origin:122px 76px">
      <g class="p-ear-l" style="transform-origin:110px 36px"><path d="M100 40 L103 14 L120 30 Z" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/><path d="M104 34 L105.5 22 L114 30 Z" fill="${C.pink}"/></g>
      <g class="p-ear-r" style="transform-origin:134px 36px"><path d="M144 40 L141 14 L124 30 Z" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/><path d="M140 34 L138.5 22 L130 30 Z" fill="${C.pink}"/></g>
      <ellipse cx="122" cy="50" rx="27" ry="23" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5"/>
      <path d="M122 29 v7 M114.5 30.5 l2 6 M129.5 30.5 l-2 6" stroke="${C.dark}" stroke-width="2.8" stroke-linecap="round"/>
      <ellipse cx="122" cy="60" rx="11.5" ry="8" fill="${C.cream}"/>
      ${eyes(111, 133, 49, 4.2, 5.2)}
      <ellipse cx="105" cy="58" rx="4.4" ry="2.7" fill="${C.blush}" opacity=".5"/><ellipse cx="139" cy="58" rx="4.4" ry="2.7" fill="${C.blush}" opacity=".5"/>
      <path d="M119 55.5 h6 l-3 3 z" fill="${C.nose}" stroke="${C.nose}" stroke-width="1.3" stroke-linejoin="round"/>
      <path class="p-mouth" d="M116 60.5 q3 3 6 0 q3 3 6 0" stroke="#3A2A20" stroke-width="1.9" stroke-linecap="round" fill="none"/>
      <ellipse class="p-yawn" style="transform-origin:122px 63px" cx="122" cy="63.5" rx="4" ry="5" fill="#8E3B3F" stroke="#3A2A20" stroke-width="1.6"/>
      <path d="M96 55 l-9 -2 M96 60 l-9 2 M148 55 l9 -2 M148 60 l9 2" stroke="${C.line}" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>
    </g>`);
  const CAT_CURL = svg('0 0 140 100', `
    <g class="p-body" style="transform-origin:66px 97px">
      <ellipse cx="66" cy="66" rx="52" ry="30" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5"/>
      <path d="M33 48 q6 8 4 16 M49 41 q5 9 3 18 M66 39 q5 9 3 18" stroke="${C.dark}" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>
    <g class="p-tail" style="transform-origin:22px 74px"><path d="M20 70 C 16 96, 66 100, 98 92" fill="none" stroke="${C.line}" stroke-width="12" stroke-linecap="round"/><path d="M20 70 C 16 96, 66 100, 98 92" fill="none" stroke="${C.fur}" stroke-width="7.5" stroke-linecap="round"/><path d="M40 92 l1 5 M56 95 l0 5" stroke="${C.dark}" stroke-width="2.6" stroke-linecap="round"/></g>
    <ellipse cx="78" cy="88" rx="9" ry="5" fill="${C.cream}" stroke="${C.line}" stroke-width="2.2"/>
    <g class="p-head" style="transform-origin:98px 84px">
      <g class="p-ear-l" style="transform-origin:88px 50px"><path d="M80 58 L82 38 L96 52 Z" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/><path d="M84 53 L85 44 L91 51 Z" fill="${C.pink}"/></g>
      <g class="p-ear-r" style="transform-origin:110px 50px"><path d="M118 58 L117 38 L103 52 Z" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/><path d="M114 53 L113 44 L107 51 Z" fill="${C.pink}"/></g>
      <ellipse cx="99" cy="70" rx="23" ry="19" fill="${C.fur}" stroke="${C.line}" stroke-width="2.5"/>
      <ellipse cx="99" cy="78" rx="10" ry="6.5" fill="${C.cream}"/>
      ${eyes(90, 108, 70, 3.8, 4.6)}
      <ellipse cx="84" cy="77" rx="4" ry="2.4" fill="${C.blush}" opacity=".5"/><ellipse cx="114" cy="77" rx="4" ry="2.4" fill="${C.blush}" opacity=".5"/>
      <path d="M96.5 75 h5 l-2.5 2.6 z" fill="${C.nose}"/>
    </g>`);

  // dog palette
  const D = { fur: '#E0A96D', cream: '#FFF4E3', ear: '#8C5A32', patch: '#B9773F', line: '#5A3A22', tongue: '#F27C8A', collar: '#E5484D' };
  const dogFace = (cx, cy) => `
      <ellipse cx="${cx}" cy="${cy}" rx="28" ry="25" fill="${D.fur}" stroke="${D.line}" stroke-width="2.5"/>
      <ellipse cx="${cx + 12.5}" cy="${cy - 5}" rx="9" ry="8" fill="${D.patch}" opacity=".5"/>
      <ellipse cx="${cx}" cy="${cy + 11}" rx="14.5" ry="10.5" fill="${D.cream}"/>
      ${eyes(cx - 12, cx + 12, cy - 2, 4.4, 5.2)}
      <ellipse cx="${cx - 18}" cy="${cy + 8}" rx="4.6" ry="2.8" fill="#F28C8C" opacity=".45"/><ellipse cx="${cx + 18}" cy="${cy + 8}" rx="4.6" ry="2.8" fill="#F28C8C" opacity=".45"/>
      <ellipse cx="${cx}" cy="${cy + 6}" rx="5.6" ry="3.9" fill="#3A2A20"/><ellipse cx="${cx - 1.6}" cy="${cy + 4.9}" rx="1.6" ry="1" fill="#fff" opacity=".75"/>
      <path class="p-mouth" d="M${cx} ${cy + 9.6} v2.6 M${cx - 5.5} ${cy + 12.2} q2.8 3 5.5 0 q2.8 3 5.5 0" stroke="#3A2A20" stroke-width="2" stroke-linecap="round" fill="none"/>
      <path class="d-tongue" style="transform-origin:${cx}px ${cy + 14}px" d="M${cx - 3.7} ${cy + 14} q3.7 11 7.4 0 z" fill="${D.tongue}" stroke="${D.line}" stroke-width="1.5" stroke-linejoin="round"/>
      <g class="p-ear-l" style="transform-origin:${cx - 20}px ${cy - 16}px"><path d="M${cx - 21} ${cy - 21} C ${cx - 38} ${cy - 21}, ${cx - 43} ${cy + 4}, ${cx - 34} ${cy + 17} C ${cx - 28} ${cy + 23}, ${cx - 20} ${cy + 10}, ${cx - 17} ${cy - 8} Z" fill="${D.ear}" stroke="${D.line}" stroke-width="2.5" stroke-linejoin="round"/></g>
      <g class="p-ear-r" style="transform-origin:${cx + 20}px ${cy - 16}px"><path d="M${cx + 21} ${cy - 21} C ${cx + 38} ${cy - 21}, ${cx + 43} ${cy + 4}, ${cx + 34} ${cy + 17} C ${cx + 28} ${cy + 23}, ${cx + 20} ${cy + 10}, ${cx + 17} ${cy - 8} Z" fill="${D.ear}" stroke="${D.line}" stroke-width="2.5" stroke-linejoin="round"/></g>`;
  const DOG_SIT = svg('0 0 120 120', `
    <g class="p-tail" style="transform-origin:82px 104px"><path d="M82 104 C 100 104, 108 92, 104 78" fill="none" stroke="${D.line}" stroke-width="10.5" stroke-linecap="round"/><path d="M82 104 C 100 104, 108 92, 104 78" fill="none" stroke="${D.fur}" stroke-width="6" stroke-linecap="round"/><circle cx="104" cy="78.5" r="3" fill="${D.cream}"/></g>
    <g class="p-body" style="transform-origin:60px 117px">
      <ellipse cx="60" cy="95" rx="27" ry="22" fill="${D.fur}" stroke="${D.line}" stroke-width="2.5"/>
      <path d="M33 98 a27 22 0 0 0 54 0 a27 13 0 0 1 -54 0z" fill="${D.patch}" opacity=".22"/>
      <ellipse cx="60" cy="99" rx="14" ry="14.5" fill="${D.cream}"/>
      <path d="M44 77 q16 9 32 0" stroke="${D.collar}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="60" cy="83.5" r="3.6" fill="#FFD34D" stroke="${D.line}" stroke-width="1.5"/>
      <g class="p-paws" style="transform-origin:60px 114px"><ellipse cx="49" cy="114" rx="8.5" ry="5.2" fill="${D.cream}" stroke="${D.line}" stroke-width="2.3"/><ellipse cx="71" cy="114" rx="8.5" ry="5.2" fill="${D.cream}" stroke="${D.line}" stroke-width="2.3"/></g>
    </g>
    <g class="p-head" style="transform-origin:60px 78px">${dogFace(60, 54)}</g>`);
  const DOG_LIE = svg('0 0 170 100', `
    <g class="p-tail" style="transform-origin:32px 66px"><path d="M32 66 C 16 60, 12 46, 20 38" fill="none" stroke="${D.line}" stroke-width="10" stroke-linecap="round"/><path d="M32 66 C 16 60, 12 46, 20 38" fill="none" stroke="${D.fur}" stroke-width="5.6" stroke-linecap="round"/><circle cx="20" cy="38.5" r="2.8" fill="${D.cream}"/></g>
    <g class="p-body" style="transform-origin:84px 97px">
      <ellipse cx="82" cy="72" rx="54" ry="22" fill="${D.fur}" stroke="${D.line}" stroke-width="2.5"/>
      <ellipse cx="66" cy="60" rx="18" ry="8" fill="${D.patch}" opacity=".45"/>
      <ellipse cx="92" cy="86" rx="32" ry="7.5" fill="${D.cream}"/>
      <ellipse cx="46" cy="90" rx="14" ry="7" fill="${D.cream}" stroke="${D.line}" stroke-width="2.2"/>
      <ellipse cx="124" cy="93" rx="13" ry="6" fill="${D.cream}" stroke="${D.line}" stroke-width="2.2"/><ellipse cx="149" cy="93" rx="13" ry="6" fill="${D.cream}" stroke="${D.line}" stroke-width="2.2"/>
    </g>
    <g class="p-head" style="transform-origin:137px 84px">${dogFace(137, 62)}</g>`);

  // bird palette
  const B = { body: '#FFD34D', belly: '#FFF2B3', wing: '#F2B705', beak: '#F59E2B', line: '#6B4A12' };
  const BIRD_SIT = svg('0 0 120 120', `
    <g class="p-tail" style="transform-origin:60px 98px"><path d="M50 97 L60 118 L70 97 Z" fill="${B.wing}" stroke="${B.line}" stroke-width="2.3" stroke-linejoin="round"/></g>
    <g class="p-body" style="transform-origin:60px 112px">
      <g class="b-wing-l" style="transform-origin:38px 62px"><ellipse cx="32" cy="77" rx="10" ry="19" fill="${B.wing}" stroke="${B.line}" stroke-width="2.3" transform="rotate(14 32 77)"/><path d="M27 82 q4 6 9 6" stroke="${B.line}" stroke-width="1.4" fill="none" opacity=".4"/></g>
      <g class="b-wing-r" style="transform-origin:82px 62px"><ellipse cx="88" cy="77" rx="10" ry="19" fill="${B.wing}" stroke="${B.line}" stroke-width="2.3" transform="rotate(-14 88 77)"/><path d="M93 82 q-4 6 -9 6" stroke="${B.line}" stroke-width="1.4" fill="none" opacity=".4"/></g>
      <ellipse cx="60" cy="70" rx="31" ry="33" fill="${B.body}" stroke="${B.line}" stroke-width="2.5"/>
      <ellipse cx="60" cy="83" rx="19" ry="17" fill="${B.belly}"/>
      <path d="M44 48 q6 -8 14 -9" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>
      <path d="M52 102 v9 m-4.5 0 h9 M68 102 v9 m-4.5 0 h9" stroke="${B.beak}" stroke-width="3" stroke-linecap="round"/>
    </g>
    <g class="p-head" style="transform-origin:60px 72px">
      <path d="M55 40 C 53 31, 58 26, 63 23 C 61 29, 64 32, 68 29 C 69 35, 65 39, 62 41 Z" fill="${B.body}" stroke="${B.line}" stroke-width="2.1" stroke-linejoin="round"/>
      ${eyes(48.5, 71.5, 61, 4, 4.8, '#2E2410')}
      <ellipse cx="42" cy="71" rx="4.4" ry="2.7" fill="#F28C8C" opacity=".5"/><ellipse cx="78" cy="71" rx="4.4" ry="2.7" fill="#F28C8C" opacity=".5"/>
      <path class="b-beak-low" style="transform-origin:60px 74px" d="M56 73.5 L64 73.5 L60 79.5 Z" fill="#E8862A" stroke="${B.line}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M54.5 68.5 L65.5 68.5 L60 75.5 Z" fill="${B.beak}" stroke="${B.line}" stroke-width="1.7" stroke-linejoin="round"/>
    </g>`);

  // turtle palette
  const T = { shell: '#6DBE7A', plate: '#8FD39A', rim: '#3F8F55', skin: '#B8E07A', line: '#2F5B36', ink: '#20321F' };
  const TURTLE = svg('0 0 140 100', `
    <g class="p-tail" style="transform-origin:26px 76px"><path d="M27 71 L11 78 L27 81 Z" fill="${T.skin}" stroke="${T.line}" stroke-width="2.2" stroke-linejoin="round"/></g>
    <g class="t-legs" style="transform-origin:70px 80px">
      <ellipse class="t-leg-a" style="transform-origin:40px 84px" cx="40" cy="86" rx="9" ry="8" fill="${T.skin}" stroke="${T.line}" stroke-width="2.3"/>
      <ellipse class="t-leg-b" style="transform-origin:56px 84px" cx="56" cy="88" rx="9" ry="8" fill="${T.skin}" stroke="${T.line}" stroke-width="2.3"/>
      <ellipse class="t-leg-b" style="transform-origin:86px 84px" cx="86" cy="88" rx="9" ry="8" fill="${T.skin}" stroke="${T.line}" stroke-width="2.3"/>
      <ellipse class="t-leg-a" style="transform-origin:102px 84px" cx="102" cy="86" rx="9" ry="8" fill="${T.skin}" stroke="${T.line}" stroke-width="2.3"/>
    </g>
    <g class="p-head t-head" style="transform-origin:106px 64px">
      <path d="M102 68 C 108 60, 112 54, 117 51" stroke="${T.line}" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M102 68 C 108 60, 112 54, 117 51" stroke="${T.skin}" stroke-width="11" stroke-linecap="round" fill="none"/>
      <circle cx="120" cy="46" r="14" fill="${T.skin}" stroke="${T.line}" stroke-width="2.5"/>
      <g class="p-eyes-open" style="transform-origin:124px 42px"><ellipse cx="124" cy="42" rx="3.4" ry="4.1" fill="${T.ink}"/><circle cx="125.2" cy="40.5" r="1.2" fill="#fff"/></g>
      <g class="p-eyes-closed"><path d="M120.5 42.5 q3.5 3.2 7 0" stroke="${T.ink}" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>
      <g class="p-eyes-happy"><path d="M120.5 44 q3.5 -4.4 7 0" stroke="${T.ink}" stroke-width="2.2" stroke-linecap="round" fill="none"/></g>
      <ellipse cx="115" cy="51" rx="3.8" ry="2.3" fill="#F28C8C" opacity=".55"/>
      <path class="p-mouth" d="M122 51.5 q4 3 8.5 -1" stroke="${T.ink}" stroke-width="1.9" fill="none" stroke-linecap="round"/>
    </g>
    <g class="p-body t-shell" style="transform-origin:70px 80px">
      <path d="M22 76 C 24 40, 46 22, 70 22 C 94 22, 116 40, 118 76 Z" fill="${T.shell}" stroke="${T.line}" stroke-width="2.7" stroke-linejoin="round"/>
      <path d="M58 40 L70 33 L82 40 L82 54 L70 61 L58 54 Z" fill="${T.plate}" stroke="${T.rim}" stroke-width="2.1" stroke-linejoin="round"/>
      <path d="M58 54 L46 62 L35 57 M82 54 L94 62 L105 57 M58 40 L48 33 M82 40 L92 33 M70 61 L70 74 M46 62 L44 74 M94 62 L96 74" stroke="${T.rim}" stroke-width="2.1" fill="none" stroke-linecap="round"/>
      <path d="M38 44 q8 -12 22 -14" stroke="#fff" stroke-width="3.2" opacity=".35" fill="none" stroke-linecap="round"/>
      <rect x="18" y="72" width="104" height="9" rx="4.5" fill="${T.rim}" stroke="${T.line}" stroke-width="2.3"/>
    </g>`);

  /* ───────── homes ───────── */
  const HOME_ART = {
    cat: {
      vb: '0 0 140 64',
      back: `<ellipse cx="70" cy="40" rx="64" ry="22" fill="#9C8AEB" stroke="#4E3F8F" stroke-width="2.4"/><ellipse cx="70" cy="34" rx="50" ry="13" fill="#F1ECFF" stroke="#4E3F8F" stroke-width="2"/><path d="M34 33 q36 9 72 0" stroke="#D9D0FA" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      front: `<path d="M7 38 C 9 63, 131 63, 133 38 C 128 51, 12 51, 7 38 Z" fill="#AE9EF2" stroke="#4E3F8F" stroke-width="2.4" stroke-linejoin="round"/><g fill="#F1ECFF" opacity=".85"><circle cx="40" cy="52" r="2.6"/><circle cx="36" cy="48.5" r="1.3"/><circle cx="40" cy="47.4" r="1.3"/><circle cx="44" cy="48.5" r="1.3"/><circle cx="100" cy="52" r="2.6"/><circle cx="96" cy="48.5" r="1.3"/><circle cx="100" cy="47.4" r="1.3"/><circle cx="104" cy="48.5" r="1.3"/></g>`,
    },
    dog: {
      vb: '0 0 120 112',
      back: `<path d="M18 50 L18 108 L102 108 L102 50 Z" fill="#F2C38A" stroke="#5A3A22" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 66 H102 M18 82 H102 M18 98 H102" stroke="#D9A066" stroke-width="2"/><path d="M41 108 L41 82 A19 19 0 0 1 79 82 L79 108 Z" fill="#5A3A22"/><path d="M45 108 L45 83 A15 15 0 0 1 75 83 L75 108 Z" fill="#3D2716"/><path d="M8 56 L60 12 L112 56 Z" fill="#E5574F" stroke="#7A2A26" stroke-width="2.6" stroke-linejoin="round"/><path d="M28 40 H92 M18 50 H102" stroke="#C9423B" stroke-width="2" stroke-linecap="round"/><rect x="45" y="61" width="30" height="11" rx="4" fill="#FFF4E3" stroke="#5A3A22" stroke-width="1.7"/><path d="M53 66.5 h14" stroke="#C9A27A" stroke-width="3" stroke-linecap="round"/><circle cx="52.5" cy="64.8" r="1.9" fill="#C9A27A"/><circle cx="52.5" cy="68.2" r="1.9" fill="#C9A27A"/><circle cx="67.5" cy="64.8" r="1.9" fill="#C9A27A"/><circle cx="67.5" cy="68.2" r="1.9" fill="#C9A27A"/>`,
    },
    bird: {
      vb: '0 0 64 120',
      back: `<rect x="29" y="56" width="6" height="62" rx="3" fill="#B9773F" stroke="#5A3A22" stroke-width="2"/><path d="M16 119 q4 -9 8 0 q4 -11 8 0 q4 -9 8 0 q4 -11 8 0 z" fill="#8FD39A" stroke="#3F8F55" stroke-width="1.6" stroke-linejoin="round"/><rect x="10" y="24" width="44" height="36" rx="5" fill="#7CC6D9" stroke="#2F5B6B" stroke-width="2.3"/><path d="M14 52 H50" stroke="#5FAFC4" stroke-width="2"/><path d="M4 28 L32 6 L60 28 Z" fill="#F28C3A" stroke="#8A4A16" stroke-width="2.3" stroke-linejoin="round"/><circle cx="32" cy="40" r="7.5" fill="#2E3A40"/><g class="bh-eyes"><circle cx="29.3" cy="40" r="1.7" fill="#FFD34D"/><circle cx="34.7" cy="40" r="1.7" fill="#FFD34D"/></g><path d="M32 50 v6" stroke="#5A3A22" stroke-width="3" stroke-linecap="round"/>`,
    },
    turtle: {
      vb: '0 0 124 62',
      back: `<ellipse cx="62" cy="42" rx="58" ry="18" fill="#A8D88A" stroke="#5E9E4A" stroke-width="2.2"/><path d="M14 36 q2 -9 5 -1 q2 -10 5 0 M98 33 q2 -10 5 -1 q3 -9 5 1 M54 26 q2 -8 4 0" stroke="#5E9E4A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="60" cy="40" rx="42" ry="12.5" fill="#8FD3F0" stroke="#3E8DB0" stroke-width="2.2"/><ellipse cx="56" cy="38" rx="30" ry="7" fill="#B6E5F7"/><path class="pond-ripple" d="M36 41 q8 -3 16 0 M66 36 q7 -3 14 0" stroke="#fff" stroke-width="1.8" opacity=".8" fill="none" stroke-linecap="round"/><path d="M80 44 a9 5 0 1 1 6 3 l-6 -3 z" fill="#6DBE7A" stroke="#2F5B36" stroke-width="1.5"/><circle cx="79" cy="41" r="3" fill="#F7A8C4" stroke="#B5527B" stroke-width="1.1"/><ellipse cx="16" cy="48" rx="7" ry="4.6" fill="#C9C3BA" stroke="#7D776E" stroke-width="1.7"/><ellipse cx="106" cy="50" rx="5.5" ry="3.8" fill="#D8D2C9" stroke="#7D776E" stroke-width="1.7"/>`,
    },
  };
  // where each home stands (foot point, in record-size units) and where its owner rests
  const HOMES = {
    cat: { x: 0.1, y: 1.035, w: 0.36, seat: { x: 0.1, y: 0.975 } },
    dog: { x: 0.93, y: 1.03, w: 0.3, seat: { x: 0.79, y: 1.045 } },
    bird: { x: 0.065, y: 0.42, w: 0.15, seat: { x: 0.065, y: 0.235 } },
    turtle: { x: 0.03, y: 0.75, w: 0.26, seat: { x: 0.12, y: 0.765 } },
  };
  // where they rest when their home is hidden
  const BARE_SEAT = { cat: { x: 0.12, y: 1.0 }, dog: { x: 0.86, y: 1.02 }, bird: { x: 0.955, y: 0.012 }, turtle: { x: 0.03, y: 0.62 } };
  const homeEls = new Map();
  function homeSvg(id, layer) {
    const a = HOME_ART[id];
    return `<svg viewBox="${a.vb}" aria-hidden="true">${a[layer]}</svg>`;
  }
  function syncHomes() {
    for (const id of ORDER) {
      const want = state.petHomes !== false && !!state.pets[id];
      const has = homeEls.has(id);
      if (want && !has) {
        const h = HOMES[id];
        const back = document.createElement('div');
        back.className = `nest nest-${id}`;
        back.innerHTML = homeSvg(id, 'back') + (id === 'bird' ? '<div class="pet-zzz nest-zzz" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></div>' : '');
        const els = [back];
        if (HOME_ART[id].front) {
          const front = document.createElement('div');
          front.className = `nest nest-front nest-${id}`;
          front.innerHTML = homeSvg(id, 'front');
          els.push(front);
        }
        els.forEach((el) => {
          el.style.setProperty('--x', h.x); el.style.setProperty('--y', h.y); el.style.setProperty('--w', h.w);
          discWrap.insertBefore(el, discWrap.querySelector('.tune-bubble'));
        });
        back.addEventListener('pointerdown', (e) => e.stopPropagation());
        back.addEventListener('click', (e) => { e.stopPropagation(); const p = live.get(id); if (p) p.homeTap(); });
        homeEls.set(id, els);
      } else if (!want && has) {
        homeEls.get(id).forEach((el) => { el.classList.add('leaving'); setTimeout(() => el.remove(), 500); });
        homeEls.delete(id);
      }
    }
  }
  const homeOf = (id) => (homeEls.get(id) || [])[0];
  const seatOf = (id) => ({ ...(homeOf(id) ? HOMES[id].seat : BARE_SEAT[id]) });

  /* ───────── species ───────── */
  const GROUND = [{ x: 0.27, y: 1.035 }, { x: 0.7, y: 1.035 }, { x: 0.02, y: 0.6 }, { x: 0.99, y: 0.64 }];
  const PERCH = [{ x: 0.955, y: 0.012 }, { x: 0.065, y: 0.158 }, { x: 0.93, y: 0.782 }, { x: 0.5, y: -0.005 }];
  const SPECIES = {
    cat: {
      poses: { sit: CAT_SIT, lie: CAT_LIE, curl: CAT_CURL }, sleepPose: 'curl', lies: true,
      w: 0.26, minW: 52, maxW: 92, speed: 0.2, hop: 3.5, stepHz: 2.6,
      name: { tr: 'Tarçın', en: 'Cinnamon' }, kind: { tr: 'Kedi', en: 'Cat' },
      desc: { tr: 'Yatağında kıvrılıp uyur, uzanır, gerinir. Plakta dönmeye bayılır.', en: 'Curls up in her bed, lounges, stretches. Loves a spin on the record.' },
      lines: { tr: { ride: 'Viiiii!', dizzy: 'Başım döndü!', bored: 'Sıkıldım…', down: 'Hop!' }, en: { ride: 'Wheeee!', dizzy: 'So dizzy!', bored: 'Bored…', down: 'Hop!' } },
      sleepAfter: 50000, wakeDelay: 3000, walkEvery: [30000, 65000], wakeChance: 0.6,
    },
    dog: {
      poses: { sit: DOG_SIT, lie: DOG_LIE }, sleepPose: 'lie', lies: true,
      w: 0.34, minW: 68, maxW: 122, speed: 0.32, hop: 6, stepHz: 3.2,
      name: { tr: 'Karamel', en: 'Caramel' }, kind: { tr: 'Köpek', en: 'Dog' },
      desc: { tr: 'Kuyruk sallar, dil çıkarır, kulübesinin önünde uzanır, arada dans eder.', en: 'Wags, pants, naps in front of his dog house and dances now and then.' },
      lines: { tr: { ride: 'Dönüyoruuum!', dizzy: 'Kuyruğum nerede?', bored: 'Oyun yok mu?', down: 'Hav!', hi: 'Hav hav!' }, en: { ride: 'Spinniiing!', dizzy: 'Where’s my tail?', bored: 'No games?', down: 'Woof!', hi: 'Woof woof!' } },
      sleepAfter: 75000, wakeDelay: 700, walkEvery: [18000, 40000], wakeChance: 1,
    },
    bird: {
      poses: { sit: BIRD_SIT }, flies: true,
      w: 0.12, minW: 28, maxW: 44, speed: 0.75,
      name: { tr: 'Limon', en: 'Lemon' }, kind: { tr: 'Kanarya', en: 'Canary' },
      desc: { tr: 'Ton kolunda ya da kulübenin çatısında tüner, şarkı söyler, evinde uyur.', en: 'Perches on the tonearm or the dog house roof, sings, sleeps in her birdhouse.' },
      lines: { tr: { ride: 'Atlıkarınca!', dizzy: 'Pır pır!', bored: 'Ben uçtum!', down: 'Cik!' }, en: { ride: 'Merry-go-round!', dizzy: 'Flap flap!', bored: 'I’m off!', down: 'Tweet!' } },
      sleepAfter: 90000, wakeDelay: 900, walkEvery: [16000, 36000], wakeChance: 1,
    },
    turtle: {
      poses: { sit: TURTLE }, side: true,
      w: 0.17, minW: 36, maxW: 62, speed: 0.045, hop: 0.6, stepHz: 1.1,
      name: { tr: 'Fıstık', en: 'Peanut' }, kind: { tr: 'Kaplumbağa', en: 'Turtle' },
      desc: { tr: 'Ağır ağır gezer, göletinin kenarında uyur. Dokununca kabuğuna saklanır.', en: 'Strolls very slowly and naps by his pond. Tap him and he hides in his shell.' },
      lines: { tr: { ride: 'Hiç bu kadar hızlı gitmemiştim!', dizzy: 'Vay be!', bored: 'Ben yavaşça ineyim…', down: 'Oh be!' }, en: { ride: 'I’ve never gone this fast!', dizzy: 'Whoa!', bored: 'I’ll slowly get off…', down: 'Phew!' } },
      sleepAfter: 65000, wakeDelay: 5000, walkEvery: [45000, 90000], wakeChance: 1,
    },
  };
  const ORDER = ['cat', 'dog', 'bird', 'turtle'];

  /* ───────── one friend ───────── */
  const live = new Map();
  class Pet {
    constructor(id, intro) {
      this.id = id; this.sp = SPECIES[id];
      const el = document.createElement('div');
      el.className = `pet pet-${id}`;
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${L(this.sp.kind)} ${L(this.sp.name)}`);
      el.style.setProperty('--w', this.sp.w);
      el.style.minWidth = this.sp.minW + 'px';
      el.style.maxWidth = this.sp.maxW + 'px';
      const poses = Object.entries(this.sp.poses).map(([k, s]) => `<div class="pose pose-${k}">${s}</div>`).join('');
      el.innerHTML = `<div class="pet-say" hidden></div><div class="pet-fx"></div><div class="pet-hop"><div class="pet-face">${poses}</div></div><div class="pet-zzz" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></div>`;
      this.el = el;
      this.sayEl = el.querySelector('.pet-say');
      this.fx = el.querySelector('.pet-fx');
      this.face = el.querySelector('.pet-face');
      this.riding = false; this.rideR = 0; this.rideStart = 0; this.dizzy = false;
      const now = Date.now();
      this.lastPoke = now; this.lastMusic = 0; this.musicOn = false; this.musicSince = 0;
      this.grooveUntil = 0; this.nextGroove = 0;
      this.lastMove = now; this.nextMove = rnd(...this.sp.walkEvery) * 0.5;
      this.lastTrick = now; this.lastPose = now; this.poseUntil = 0;
      this.anim = null; this.press = null; this.dragging = false; this.target = null; this.atHome = false;
      discWrap.appendChild(el);
      if (intro) {
        this.place(this.nearHome());
        this.setPose('sit'); this.setMood('awake');
        setTimeout(() => this.say(pt('hello'), 1300), 380);
      } else {
        this.place(seatOf(id));
        this.settle(true);
      }
      this.bind();
    }
    nearHome() {
      const seat = seatOf(this.id);
      if (this.sp.flies) return { ...PERCH[0] };
      return { x: clamp(seat.x + (seat.x < 0.5 ? 0.12 : -0.12), -0.05, 1.05), y: seat.y };
    }
    get spots() { return this.sp.flies ? PERCH : GROUND; }
    freeSpot() {
      const others = [...live.values()].filter((p) => p !== this && !p.riding).map((p) => p.target || p.pos);
      const free = (s) => others.every((o) => Math.hypot(o.x - s.x, o.y - s.y) > 0.16);
      const opts = this.spots.filter((s) => free(s) && Math.hypot(s.x - this.pos.x, s.y - this.pos.y) > 0.05);
      return { ...(opts.length ? pick(opts) : pick(this.spots)) };
    }
    setMood(m) { this.mood = m; this.el.dataset.state = m; }
    setPose(p) {
      if (!this.sp.poses[p]) p = 'sit';
      if (this.pose === p) return;
      const first = !this.pose;
      this.pose = p; this.el.dataset.pose = p; this.lastPose = Date.now();
      if (!first) this.flash('poseswap', 420);
    }
    flash(cls, ms) { this.el.classList.add(cls); clearTimeout(this['_' + cls]); this['_' + cls] = setTimeout(() => this.el.classList.remove(cls), ms); }
    place(p) { this.pos = p; this.el.style.setProperty('--x', p.x); this.el.style.setProperty('--y', p.y); }
    say(text, ms, fact) {
      const s = this.sayEl;
      if (this.inHouse) return;
      s.classList.toggle('fact', !!fact);
      s.innerHTML = fact ? `<b class="fact-label">${esc(pt('label'))}</b>${esc(text)}` : esc(text);
      s.style.setProperty('--sx', '0px');
      s.style.rotate = '';
      if (this.riding) { this.floatBubble(true); startFollow(); }
      s.hidden = false;
      if (this.riding) this.trackBubble();
      this.el.classList.add('talking');
      if (fact) live.forEach((o) => { if (o !== this && !o.sayEl.hidden) { o.sayEl.hidden = true; o.el.classList.remove('talking'); } });
      if (!this.riding) {
        // keep the bubble on screen; measured without transforms so the pop-in scale can't fool it
        const r = this.el.getBoundingClientRect();
        const half = s.offsetWidth / 2, cx = r.left + r.width / 2;
        let dx = 0;
        if (cx - half < 8) dx = 8 - (cx - half); else if (cx + half > window.innerWidth - 8) dx = window.innerWidth - 8 - (cx + half);
        s.style.setProperty('--sx', dx + 'px');
      }
      const dur = ms || (fact ? clamp(2600 + text.length * 55, 3600, 9000) : 1500);
      clearTimeout(this._say);
      this._say = setTimeout(() => { s.hidden = true; this.el.classList.remove('talking'); }, dur);
    }
    line(k) { return L(this.sp.lines)[k]; }
    floatBubble(on) {
      const s = this.sayEl;
      if (on && s.parentElement !== document.body) { document.body.appendChild(s); s.classList.add('floating'); this.trackBubble(); }
      if (!on && s.parentElement !== this.el) { this.el.prepend(s); s.classList.remove('floating'); s.style.left = s.style.top = ''; }
    }
    trackBubble() {
      const s = this.sayEl;
      if (s.parentElement !== document.body) return;
      if (!s.hidden) {
        const r = this.el.getBoundingClientRect();
        const half = s.offsetWidth / 2;
        s.style.left = clamp(r.left + r.width / 2, half + 8, window.innerWidth - half - 8) + 'px';
        s.style.top = Math.max(r.top - 8, s.offsetHeight + 8) + 'px';
      }
    }
    sparkle(n = 3, cls = 'heart') {
      for (let i = 0; i < n; i++) setTimeout(() => {
        const h = document.createElement('span');
        h.className = cls;
        h.innerHTML = cls === 'heart' ? '<svg><use href="#i-heart-fill"/></svg>' : (Math.random() < 0.5 ? '♪' : '♫');
        h.style.setProperty('--dx', rnd(-24, 24) + 'px');
        this.fx.appendChild(h); setTimeout(() => h.remove(), 1900);
      }, i * 180);
    }

    /* smooth travel: eased path, little steps, optional flight arc */
    moveTo(target, opts = {}) {
      if (this.riding || this.dragging) return;
      cancelAnimationFrame(this.anim);
      this.leaveHouse();
      this.atHome = false;
      const from = { ...this.pos };
      const dist = Math.hypot(target.x - from.x, target.y - from.y);
      if (dist < 0.01) { if (opts.then) opts.then(); return; }
      const flying = !!this.sp.flies;
      const dur = clamp(dist / (opts.speed || this.sp.speed), flying ? 0.7 : 0.8, flying ? 2.4 : 40) * 1000;
      const dir = Math.sign(target.x - from.x) || 1;
      this.target = target;
      if (this.mood === 'sleep') this.setMood('awake');
      this.setPose('sit');
      this.el.classList.add(flying ? 'flying' : 'walking');
      this.el.classList.remove('groove');
      if (this.sp.side) this.face.style.setProperty('--face', dir);
      else this.face.style.setProperty('--lean', dir * (flying ? 8 : 4) + 'deg');
      const t0 = performance.now();
      const arc = flying ? Math.min(0.3, 0.1 + dist * 0.35) : 0;
      const step = (now) => {
        const k = clamp((now - t0) / dur, 0, 1);
        const e = ease(k);
        this.place({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e - arc * Math.sin(Math.PI * k) });
        if (!flying) {
          const lift = -Math.abs(Math.sin(((now - t0) / 1000) * Math.PI * this.sp.stepHz)) * this.sp.hop * (1 - Math.pow(2 * k - 1, 8));
          this.face.style.setProperty('--lift', lift + 'px');
        }
        if (k < 1) { this.anim = requestAnimationFrame(step); return; }
        this.el.classList.remove('walking', 'flying');
        this.face.style.setProperty('--lift', '0px');
        this.face.style.setProperty('--lean', '0deg');
        this.target = null;
        this.lastMove = Date.now();
        if (opts.then) opts.then();
      };
      this.anim = requestAnimationFrame(step);
    }
    wander() { this.moveTo(this.freeSpot()); }

    /* home & sleep */
    goHome(thenSleep = true) {
      this.moveTo(seatOf(this.id), { then: () => { if (thenSleep) this.settle(false); else { this.atHome = true; } } });
    }
    settle(instant) {
      this.atHome = true;
      if (this.id === 'cat' && !instant) { this.flash('yawn', 1000); setTimeout(() => { if (this.atHome) { this.setPose('curl'); this.setMood('sleep'); } }, 900); }
      else { this.setPose(this.sp.sleepPose || 'sit'); this.setMood('sleep'); }
      if (this.id === 'bird') this.enterHouse(instant);
    }
    enterHouse(instant) {
      if (!homeOf('bird')) return;          // no birdhouse: she just naps on the perch
      this.inHouse = true;
      this.el.classList.add('inhouse');
      if (instant) this.el.classList.add('instant');
      homeOf('bird').classList.add('occupied');
      setTimeout(() => this.el.classList.remove('instant'), 50);
    }
    leaveHouse() {
      if (!this.inHouse) return;
      this.inHouse = false;
      this.el.classList.remove('inhouse');
      const h = homeOf('bird'); if (h) h.classList.remove('occupied');
    }
    wake(greet) {
      if (this.mood !== 'sleep') return;
      this.lastPoke = Date.now(); this.lastMove = Date.now(); this.nextMove = rnd(6000, 14000);
      if (this.id === 'cat') {
        this.flash('yawn', 950);
        setTimeout(() => { this.setPose('sit'); this.setMood('awake'); this.flash('stretch', 1000); this.flash('perk', 1500); }, 950);
      } else if (this.id === 'dog') {
        this.setPose('sit'); this.setMood('awake'); this.flash('jump', 600); this.say(this.line('hi'), 1100);
      } else if (this.id === 'turtle') {
        this.setMood('awake'); this.flash('peek', 900);
      } else {
        this.leaveHouse(); this.setMood('awake'); this.flash('flutter', 700);
        setTimeout(() => this.moveTo({ ...PERCH[1] }), 500);
      }
      if (greet) setTimeout(() => this.say(greeting() + '!', 1300), this.id === 'cat' ? 1000 : 250);
    }
    homeTap() {
      if (this.mood === 'sleep') { this.wake(true); return; }
      this.lastPoke = Date.now();
      this.goHome(true);
    }

    /* tap: a little trick, then a fact */
    poke() {
      const now = Date.now();
      const quick = now - this.lastPoke < 700;
      this.lastPoke = now;
      if (this.mood === 'sleep') { this.wake(false); setTimeout(() => this.say(nextFact(this.id), 0, true), this.id === 'bird' ? 1300 : 950); return; }
      if (this.pose !== 'sit') { this.setPose('sit'); setTimeout(() => this.say(nextFact(this.id), 0, true), 450); return; }
      if (!quick) this.trick();
      setTimeout(() => this.say(nextFact(this.id), 0, true), this.id === 'turtle' && !quick ? 1700 : 260);
    }
    trick() {
      const r = Math.random();
      if (this.riding) { this.flash('happy', 1400); this.sparkle(2); return; }
      if (this.id === 'cat') {
        if (r < 0.45) { this.flash('happy', 1800); this.sparkle(3); } else if (r < 0.75) this.flash('jump', 600); else this.flash('stretch', 1000);
      } else if (this.id === 'dog') {
        if (r < 0.35) this.flash('spin', 900); else if (r < 0.7) { this.flash('jump', 600); this.flash('happy', 900); } else this.flash('tilt', 1300);
      } else if (this.id === 'bird') {
        this.flash('flutter', 700); this.flash('sing', 900); this.sparkle(2, 'note');
      } else {
        this.el.classList.add('hide');
        setTimeout(() => { this.el.classList.remove('hide'); this.flash('peek', 900); }, 1300);
      }
    }

    /* drag, drop, ride */
    bind() {
      const el = this.el;
      el.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || this.inHouse) return;
        e.stopPropagation();
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        this.press = { x: e.clientX, y: e.clientY, id: e.pointerId };
      });
      el.addEventListener('pointermove', (e) => {
        if (!this.press) return;
        if (!this.dragging && Math.hypot(e.clientX - this.press.x, e.clientY - this.press.y) > 7) this.startDrag();
        if (this.dragging) { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + this.h * 0.55 + 'px'; }
      });
      const end = (e) => {
        if (!this.press) return;
        this.press = null;
        if (!this.dragging) { this.poke(); return; }
        this.drop(e.clientX, e.clientY);
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('click', (e) => e.stopPropagation());
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); this.poke(); } });
    }
    startDrag() {
      cancelAnimationFrame(this.anim); this.target = null;
      this.setPose('sit');
      this.atHome = false;
      const r = this.el.getBoundingClientRect();
      this.w = r.width; this.h = r.height;
      this.dragging = true; this.riding = false;
      this.el.classList.remove('walking', 'flying', 'groove', 'hide');
      this.sayEl.hidden = true;
      this.floatBubble(false);
      document.body.appendChild(this.el);
      try { this.el.setPointerCapture(this.press.id); } catch (_) {}
      this.el.classList.add('dragging');
      this.el.style.width = this.w + 'px';
      this.el.style.setProperty('--r', '0deg');
      this.face.style.setProperty('--lean', '0deg');
      this.face.style.setProperty('--lift', '0px');
      this.setMood('held');
    }
    drop(px, py) {
      this.dragging = false;
      this.el.classList.remove('dragging');
      this.el.style.left = this.el.style.top = this.el.style.width = '';
      const footX = px, footY = py + this.h * 0.55;
      const size = discWrap.getBoundingClientRect().width;
      const dr = disc.getBoundingClientRect();
      const cx = dr.left + dr.width / 2, cy = dr.top + dr.height / 2;
      if (Math.hypot(px - cx, py - cy) < size * 0.44) { this.mount(footX, footY); return; }
      const wr = discWrap.getBoundingClientRect();
      discWrap.appendChild(this.el);
      this.el.style.setProperty('--r', '0deg');
      this.place({
        x: clamp((footX - wr.left) / size, (this.w / 2 + 4 - wr.left) / size, (window.innerWidth - this.w / 2 - 4 - wr.left) / size),
        y: clamp((footY - wr.top) / size, (this.h + 4 - wr.top) / size, (window.innerHeight - 4 - wr.top) / size),
      });
      this.setMood('awake'); this.flash('jump', 600); this.say(this.line('down'), 900);
      // dropped onto its own home? then settle in
      const seat = seatOf(this.id);
      if (Math.hypot(this.pos.x - seat.x, this.pos.y - seat.y) < 0.12) { this.place(seat); setTimeout(() => this.settle(false), 700); }
      this.lastPoke = Date.now(); this.lastMove = Date.now();
    }
    /* stick to the record in its own rotating frame, so it spins along */
    mount(footX, footY) {
      const size = discWrap.getBoundingClientRect().width;
      const dr = disc.getBoundingClientRect();
      const cx = dr.left + dr.width / 2, cy = dr.top + dr.height / 2;
      const a = -deck.angle * Math.PI / 180;
      const dx = footX - cx, dy = footY - cy;
      disc.appendChild(this.el);
      this.rideR = -deck.angle;
      this.el.style.setProperty('--r', this.rideR + 'deg');
      this.place({ x: 0.5 + (dx * Math.cos(a) - dy * Math.sin(a)) / size, y: 0.5 + (dx * Math.sin(a) + dy * Math.cos(a)) / size });
      this.riding = true; this.rideStart = Date.now(); this.dizzy = false;
      this.setPose('sit'); this.setMood('awake'); this.flash('happy', 2200); this.sparkle(2);
      this.say(this.line('ride'), 1600);
      this.lastPoke = Date.now();
    }
    dismount() {
      if (!this.riding) return;
      const r = this.el.getBoundingClientRect();
      const wr = discWrap.getBoundingClientRect();
      discWrap.appendChild(this.el);
      this.el.style.setProperty('--r', '0deg');
      this.riding = false;
      this.floatBubble(false);
      this.place({ x: (r.left + r.width / 2 - wr.left) / wr.width, y: (r.bottom - wr.top) / wr.width });
      this.lastMove = Date.now();
      setTimeout(() => this.wander(), 500);
    }

    /* little brain, ticked once a second */
    tick(now, music) {
      if (this.dragging) return;
      const sp = this.sp;
      if (music && !this.musicOn) { this.musicSince = now; this.grooveUntil = now + rnd(4000, 7000); this.nextGroove = now + rnd(30000, 60000); }
      this.musicOn = music;
      if (music) this.lastMusic = now;
      if (music && now > this.nextGroove) { this.grooveUntil = now + rnd(3000, 6000); this.nextGroove = now + rnd(35000, 75000); }
      const moving = !!this.target;
      const grooving = music && this.mood === 'awake' && this.pose === 'sit' && !moving && now < this.grooveUntil;
      this.el.classList.toggle('groove', grooving);
      if (reduceMotion) return;
      if (this.mood === 'sleep') {
        if (music && now - this.musicSince > sp.wakeDelay && now - this.musicSince < sp.wakeDelay + 1100) {
          if (Math.random() < sp.wakeChance) { this.wake(false); if (this.id !== 'turtle') this.sparkle(1, 'note'); }
          else this.flash('perk', 1200);            // a cat may just twitch an ear and sleep on
        }
        return;
      }
      if (this.mood !== 'awake') return;
      if (Math.random() < 0.18) this.flash('blink', 150);
      if (grooving && Math.random() < 0.25) this.sparkle(1, 'note');

      if (this.riding) {
        if (music && !this.dizzy && now - this.rideStart > 12000) { this.dizzy = true; this.say(this.line('dizzy'), 1800); }
        const bored = this.id === 'bird' ? now - this.rideStart > 14000 : !music && now - this.lastMusic > 15000 && now - this.rideStart > 15000;
        if (bored && now - this.lastPoke > 8000) { this.say(this.line('bored'), 1400); this.dismount(); }
        return;
      }
      // personality, never while walking
      if (!moving) {
        if (this.id === 'dog') {
          if (Math.random() < 0.05) this.flash('pant', 3000);
          if (Math.random() < 0.03) this.flash('tilt', 1300);
          if (this.pose === 'sit' && now - this.lastTrick > 60000 && Math.random() < 0.05) { this.lastTrick = now; this.flash('spin', 900); setTimeout(() => this.flash('spin', 900), 900); }
        } else if (this.id === 'bird') {
          if (music && Math.random() < 0.12) this.flash('sing', 700);
          if (Math.random() < 0.04) this.flash('flutter', 600);
          if (music && now - this.lastTrick > 30000 && Math.random() < 0.06) {
            this.lastTrick = now;
            const a = rnd(0, Math.PI * 2), rr = rnd(0.2, 0.33);
            this.moveTo({ x: 0.5 + rr * Math.cos(a), y: 0.5 + rr * Math.sin(a) + 0.05 }, { then: () => {
              const wr = discWrap.getBoundingClientRect();
              this.mount(wr.left + this.pos.x * wr.width, wr.top + this.pos.y * wr.width);
            } });
            return;
          }
        } else if (this.id === 'cat') {
          if (this.pose === 'sit' && now - this.lastTrick > 45000 && Math.random() < 0.04) { this.lastTrick = now; this.flash('stretch', 1000); }
        } else if (this.id === 'turtle') {
          if (Math.random() < 0.04) this.flash('look', 2400);
        }
        // now and then lie down for a while, then sit back up
        if (sp.lies) {
          if (this.pose === 'sit' && !grooving && now - this.lastPose > 25000 && Math.random() < 0.03) { this.setPose('lie'); this.poseUntil = now + rnd(15000, 35000); }
          else if (this.pose === 'lie' && now > this.poseUntil) this.setPose('sit');
        }
      }
      // sleepy: go home and nap
      if (!music && now - this.lastMusic > sp.sleepAfter && now - this.lastPoke > sp.sleepAfter && !moving) { this.goHome(true); return; }
      if (!moving && this.pose === 'sit' && now - this.lastMove > this.nextMove && now - this.lastPoke > 6000) {
        this.nextMove = rnd(...sp.walkEvery);
        this.wander();
      }
    }
    remove() {
      cancelAnimationFrame(this.anim);
      this.leaveHouse();
      this.floatBubble(false);
      this.say(pt('bye'), 700);
      this.el.classList.add('leaving');
      setTimeout(() => this.el.remove(), 700);
    }
  }

  /* ───────── roster ───────── */
  function sync(intro) {
    syncHomes();
    $('deck').classList.toggle('has-pets', Object.values(state.pets || {}).some(Boolean));
    for (const id of ORDER) {
      const want = !!(state.pets && state.pets[id]);
      if (want && !live.has(id)) live.set(id, new Pet(id, intro));
      else if (!want && live.has(id)) { live.get(id).remove(); live.delete(id); }
    }
  }
  setInterval(() => {
    const now = Date.now();
    const music = player.status === 'live';
    live.forEach((p) => p.tick(now, music));
  }, 1000);
  // speech bubbles of riders stay level while the record turns
  let following = false;
  function follow() {
    let any = false;
    live.forEach((p) => { if (p.riding) { any = true; p.trackBubble(); } });
    if (any) requestAnimationFrame(follow); else following = false;
  }
  const startFollow = () => { if (!following) { following = true; requestAnimationFrame(follow); } };

  /* ───────── friends sheet ───────── */
  const mini = (id) => `<span class="pet-mini pet-mini-${id}">${SPECIES[id].poses.sit}</span>`;
  function sheetHTML() {
    const homesOn = state.petHomes !== false;
    return `<h3 class="sheet-title">${esc(pt('title'))}</h3>
      <p class="sheet-sub">${esc(pt('sub'))}</p>
      <div class="pet-cards">${ORDER.map((id) => {
        const sp = SPECIES[id]; const on = !!state.pets[id];
        return `<button type="button" class="pet-card${on ? ' on' : ''}" data-pet="${id}" aria-pressed="${on}">
          ${mini(id)}
          <span class="pet-card-text"><b>${esc(L(sp.name))}</b><small>${esc(L(sp.kind))}</small><span class="pet-card-desc">${esc(L(sp.desc))}</span></span>
          <span class="pet-card-state">${on ? `<svg><use href="#i-check"/></svg>${esc(pt('on'))}` : esc(pt('off'))}</span>
        </button>`;
      }).join('')}</div>
      <div class="pet-homes-row"><span class="set-text"><b>${esc(pt('homes'))}</b><small>${esc(pt('homesHint'))}</small></span><label class="switch"><input type="checkbox" id="petHomesSw"${homesOn ? ' checked' : ''}><span></span></label></div>
      <div class="sheet-actions"><button type="button" class="btn" id="petsNone">${esc(pt('none'))}</button></div>`;
  }
  function openSheet() { OrbApp.openSheet(sheetHTML()); }
  $('sheet').addEventListener('click', (e) => {
    const card = e.target.closest('[data-pet]');
    if (card) {
      const id = card.dataset.pet;
      state.pets = { ...state.pets, [id]: !state.pets[id] };
      save(); sync(true);
      $('sheetBody').innerHTML = sheetHTML();
      return;
    }
    if (e.target.closest('#petsNone')) {
      state.pets = { cat: false, dog: false, bird: false, turtle: false };
      save(); sync(false);
      $('sheetBody').innerHTML = sheetHTML();
    }
  });
  $('sheet').addEventListener('change', (e) => {
    if (e.target.id !== 'petHomesSw') return;
    state.petHomes = e.target.checked;
    save();
    syncHomes();
    const bird = live.get('bird');
    if (bird && bird.inHouse && !homeOf('bird')) bird.leaveHouse();
  });
  $('btnPets').addEventListener('click', openSheet);

  sync(false);
  return { openSheet, sync, live };
})();
