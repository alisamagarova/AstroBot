// natal.jsx — Natal Chart module · real ephemeris via Astronomy Engine

const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════
const SIGN_NOM_RU = ['Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы'];
const SIGN_GEN_RU = ['Овна','Тельца','Близнецов','Рака','Льва','Девы','Весов','Скорпиона','Стрельца','Козерога','Водолея','Рыб'];
const SIGN_GLYPH  = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

// Birth data now lives in app state (see birthedit.jsx · DEFAULT_BIRTH).
// Chart input is produced by resolveBirthForChart(birth).

// Planet metadata
const PL_META = {
  sun:     { ru:'Солнце',   en:'Sun',     g:'☉', col:'#F5A623', body:'Sun'     },
  moon:    { ru:'Луна',     en:'Moon',    g:'☽', col:'#A8C4D4', body:'Moon'    },
  mercury: { ru:'Меркурий', en:'Mercury', g:'☿', col:'#6FC8A8', body:'Mercury' },
  venus:   { ru:'Венера',   en:'Venus',   g:'♀', col:'#E896B8', body:'Venus'   },
  mars:    { ru:'Марс',     en:'Mars',    g:'♂', col:'#E04030', body:'Mars'    },
  jupiter: { ru:'Юпитер',  en:'Jupiter', g:'♃', col:'#D4A840', body:'Jupiter' },
  saturn:  { ru:'Сатурн',  en:'Saturn',  g:'♄', col:'#8898A8', body:'Saturn'  },
  uranus:  { ru:'Уран',    en:'Uranus',  g:'⛢', col:'#48A8C8', body:'Uranus'  },
  neptune: { ru:'Нептун',  en:'Neptune', g:'♆', col:'#6078C8', body:'Neptune' },
  pluto:   { ru:'Плутон',  en:'Pluto',   g:'♇', col:'#9870A8', body:'Pluto'   },
};
const PL_IDS = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];

// Conventional astrological Pluto (orb + cup + cross). The ♇ font glyph is the
// PL monogram, which reads as a squiggle — so Pluto is drawn as a small SVG.
// Inline (HTML) version — slots in wherever a planet glyph <span> is used.
function PGlyph({ id, size = 16, color, bold, style }) {
  const m = PL_META[id];
  const c = color || (m && m.col) || 'currentColor';
  if (id === 'pluto') {
    const sz = Math.round(size * 1.25);
    return (
      <svg width={sz} height={sz} viewBox="-8 -9 16 18" fill="none" stroke={c} strokeWidth={bold ? 1.8 : 1.5} strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',flexShrink:0,...(style||{})}}>
        <path d="M-5 -3 A5 5 0 0 0 5 -3"/>
        <circle cx="0" cy="-5" r="2.3"/>
        <path d="M0 2 V8 M-3 5 H3"/>
      </svg>
    );
  }
  return <span style={{fontFamily:'serif',fontSize:size,lineHeight:1,color:c,fontWeight:bold?'bold':'normal',...(style||{})}}>{m ? m.g : id}</span>;
}
// SVG-wheel version — centered at (x,y); fpx = the glyph's final px font-size.
function PlutoWheelMark({ x, y, fpx, s = 1, color }) {
  const k = fpx / 13;
  const sw = (1.3 * s) / k;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-5 -3 A5 5 0 0 0 5 -3"/>
      <circle cx="0" cy="-5" r="2.3"/>
      <path d="M0 2 V8 M-3 5 H3"/>
    </g>
  );
}

// Zodiac signs for chart ring
const ZS = SIGN_GLYPH.map((g,i)=>({ g, e: i*30 }));

// ═══════════════════════════════════════════════════════
// REAL CHART COMPUTATION (Astronomy Engine)
// ═══════════════════════════════════════════════════════
function computeRealChart({ year, month, day, localHour, localMin, utcOffset, lat, lon, mode = 'exact', housesValid = true }) {
  if (typeof Astronomy === 'undefined') throw new Error('Astronomy Engine not loaded');

  // Convert local time to UTC (ms-based — supports fractional offsets like +5.5 and half-hour midpoints)
  const toUTC = (lh, lm) => new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + (lh * 60 + lm) * 60000 - utcOffset * 3600000);
  const utcDate = toUTC(localHour, localMin);
  const time = Astronomy.MakeTime(utcDate);

  // Moon ecliptic longitude at an arbitrary local hour (for sign-uncertainty checks)
  const moonLonAt = (lh, lm) => {
    const t = Astronomy.MakeTime(toUTC(lh, lm));
    return ((Astronomy.Ecliptic(Astronomy.GeoVector('Moon', t, false)).elon % 360) + 360) % 360;
  };

  // Obliquity of ecliptic (degrees)
  const T = time.tt / 36525;
  const oblDeg = 23.439291111 - 0.013004167 * T;
  const obl = oblDeg * Math.PI / 180;

  // Planet ecliptic longitudes
  const planets = {};
  const retrograde = {};

  for (const id of PL_IDS) {
    const meta = PL_META[id];
    try {
      // Use string body names directly — Astronomy.Body const enum is erased at runtime
      const bodyStr = meta.body; // 'Sun', 'Moon', 'Mercury', etc.
      const vec  = Astronomy.GeoVector(bodyStr, time, false);
      const ecl  = Astronomy.Ecliptic(vec);
      const lon_deg = ((ecl.elon % 360) + 360) % 360;
      planets[id] = { ecl: lon_deg };

      // Retrograde: compare position ±12h using direct date math
      const t1 = Astronomy.MakeTime(new Date(utcDate.getTime() - 12*3600*1000));
      const t2 = Astronomy.MakeTime(new Date(utcDate.getTime() + 12*3600*1000));
      const e1 = Astronomy.Ecliptic(Astronomy.GeoVector(bodyStr, t1, false)).elon;
      const e2 = Astronomy.Ecliptic(Astronomy.GeoVector(bodyStr, t2, false)).elon;
      let dv = e2 - e1;
      if (dv > 180) dv -= 360;
      if (dv < -180) dv += 360;
      retrograde[id] = dv < 0;
    } catch(err) {
      console.warn('Planet calc error:', id, err?.message || err);
      planets[id] = { ecl: 0 };
      retrograde[id] = false;
    }
  }

  // GMST → LST → RAMC
  const gmst = Astronomy.SiderealTime(time);          // hours
  const lst  = ((gmst + lon / 15) % 24 + 24) % 24;   // hours
  const ramc = lst * 15;                               // degrees
  const ramcRad = ramc * Math.PI / 180;
  const latRad  = lat  * Math.PI / 180;

  // MC (Midheaven) ecliptic longitude
  let mcRad = Math.atan(Math.tan(ramcRad) / Math.cos(obl));
  if (ramc >= 90 && ramc < 270) mcRad += Math.PI;
  const mc = ((mcRad * 180 / Math.PI) + 360) % 360;

  // ASC (Ascendant) ecliptic longitude
  const yAsc = Math.cos(ramcRad);
  const xAsc = -(Math.sin(ramcRad) * Math.cos(obl) + Math.tan(latRad) * Math.sin(obl));
  const asc  = ((Math.atan2(yAsc, xAsc) * 180 / Math.PI) + 360) % 360;

  const ic = (mc  + 180) % 360;
  const dc = (asc + 180) % 360;

  // House cusps — Placidus (professional default, matches Astro Karta Pro etc.),
  // with a Porphyry fallback for polar latitudes where Placidus is undefined.
  const arc = (from, to) => ((to - from) + 360) % 360;
  const q1 = arc(asc, ic) / 3,  q2 = arc(ic, dc) / 3;
  const q3 = arc(dc, mc)  / 3,  q4 = arc(mc, asc) / 3;
  const porphCusps = [
    asc,
    (asc + q1)   % 360,
    (asc + 2*q1) % 360,
    ic,
    (ic  + q2)   % 360,
    (ic  + 2*q2) % 360,
    dc,
    (dc  + q3)   % 360,
    (dc  + 2*q3) % 360,
    mc,
    (mc  + q4)   % 360,
    (mc  + 2*q4) % 360,
  ];
  const placCusps = computePlacidusCusps(ramc, lat, oblDeg, asc, mc, ic, dc);
  const cusps = placCusps || porphCusps;
  const houseSystem = placCusps ? 'placidus' : 'porphyry';

  // Add sign + degree + house to each planet
  for (const id of PL_IDS) {
    const e = planets[id].ecl;
    planets[id].signIdx = Math.floor(e / 30);
    planets[id].signDeg = Math.floor(e % 30);
    planets[id].house   = getPlanetHouse(e, cusps);
    planets[id].ret     = retrograde[id] || false;
  }

  // Moon sign uncertainty across the time window (non-exact births)
  let moonUncertain = false;
  if (mode !== 'exact') {
    const lo = mode === 'unknown' ? [0, 0]  : [Math.max(0, localHour - 3), 0];
    const hi = mode === 'unknown' ? [23, 59] : [Math.min(23, localHour + 3), 0];
    const s1 = Math.floor(moonLonAt(lo[0], lo[1]) / 30);
    const s2 = Math.floor(moonLonAt(hi[0], hi[1]) / 30);
    moonUncertain = s1 !== s2;
  }

  return { planets, asc, mc, ic, dc, cusps, houseSystem, housesValid, mode, moonUncertain };
}

// ═══════════════════════════════════════════════════════
// PLACIDUS HOUSE CUSPS
// Solves each intermediate cusp (11,12,2,3) by the semi-arc condition
// via sign-change scan + bisection. Cardinal cusps (1/4/7/10) are exact.
// Returns null when undefined (|tan φ·tan δ| > 1 → beyond the polar circle).
// ═══════════════════════════════════════════════════════
function computePlacidusCusps(ramc, latDeg, oblDeg, asc, mc, ic, dc) {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const e = oblDeg * D2R, latR = latDeg * D2R;
  const arc = (f, t) => ((t - f) + 360) % 360;
  // signed offset (deg, -180..180) of the cusp condition at ecliptic longitude `lam`
  function g(lam, which) {
    const l = lam * D2R;
    const dec = Math.asin(Math.sin(e) * Math.sin(l));
    const ra  = Math.atan2(Math.sin(l) * Math.cos(e), Math.cos(l));
    let ha = ramc - ra * R2D; ha = ((ha + 540) % 360) - 180;
    const x = -Math.tan(latR) * Math.tan(dec);
    if (x < -1 || x > 1) return null;            // circumpolar → undefined
    const sd = Math.acos(x) * R2D, na = 180 - sd;
    let v;
    if      (which === 11) v = ha + sd / 3;
    else if (which === 12) v = ha + 2 * sd / 3;
    else if (which === 2)  v = ha + (sd + na / 3);
    else                   v = ha + (sd + 2 * na / 3);
    return ((v + 540) % 360) - 180;
  }
  function find(which, lo, hi) {
    const N = 720; let prev = null, prevL = null;
    for (let i = 0; i <= N; i++) {
      const lam = ((lo + arc(lo, hi) * i / N) % 360 + 360) % 360;
      const val = g(lam, which);
      if (val == null) { prev = null; prevL = lam; continue; }
      if (prev != null && Math.sign(val) !== Math.sign(prev) && Math.abs(val - prev) < 180) {
        let a = prevL, b = lam, ga = prev;
        for (let j = 0; j < 48; j++) {
          const mid = ((a + arc(a, b) / 2) % 360 + 360) % 360;
          const gm = g(mid, which); if (gm == null) break;
          if (Math.sign(gm) === Math.sign(ga)) { a = mid; ga = gm; } else b = mid;
        }
        return ((a + arc(a, b) / 2) % 360 + 360) % 360;
      }
      prev = val; prevL = lam;
    }
    return null;
  }
  const c11 = find(11, mc, asc), c12 = find(12, mc, asc);
  const c2  = find(2,  asc, ic), c3  = find(3,  asc, ic);
  if (c11 == null || c12 == null || c2 == null || c3 == null) return null;
  return [asc, c2, c3, ic, (c11 + 180) % 360, (c12 + 180) % 360, dc, (c2 + 180) % 360, (c3 + 180) % 360, mc, c11, c12];
}

function getPlanetHouse(ecl, cusps) {
  const e = ((ecl % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const c1 = cusps[i];
    const c2 = cusps[(i + 1) % 12];
    const span = ((c2 - c1) + 360) % 360;
    const dist = ((e  - c1) + 360) % 360;
    if (dist < span) return i + 1;
  }
  return 1;
}

// ═══════════════════════════════════════════════════════
// ASPECT COMPUTATION
// ═══════════════════════════════════════════════════════
const ASP_TYPES = [
  { sym:'☌', name:'Соединение', key:'conjunction', angle:0,   orb:8,  col:'#D4901A' },
  { sym:'⚹', name:'Секстиль',   key:'sextile',     angle:60,  orb:6,  col:'#30A060' },
  { sym:'□', name:'Квадратура', key:'square',       angle:90,  orb:8,  col:'#C03828' },
  { sym:'△', name:'Трин',       key:'trine',        angle:120, orb:8,  col:'#2890C0' },
  { sym:'☍', name:'Оппозиция',  key:'opposition',   angle:180, orb:8,  col:'#C03828' },
];

// Zodiac sign keys (index → key) used to look up human-written interpretations.
const SIGN_KEYS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];

function computeAspects(planets) {
  const results = [];
  for (let i = 0; i < PL_IDS.length; i++) {
    for (let j = i + 1; j < PL_IDS.length; j++) {
      const p1 = PL_IDS[i], p2 = PL_IDS[j];
      const e1 = planets[p1]?.ecl, e2 = planets[p2]?.ecl;
      if (e1 == null || e2 == null) continue;
      let diff = Math.abs(e1 - e2);
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASP_TYPES) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          results.push({ p1, p2, p1i: i, p2i: j, sym: asp.sym, type_ru: asp.name, aspKey: asp.key, orb, col: asp.col });
          break;
        }
      }
    }
  }
  // Select the 14 tightest aspects, then re-order so a planet's aspects stay
  // grouped together (by planet order in PL_IDS), not scattered by orb.
  return results
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 14)
    .sort((a, b) => (a.p1i - b.p1i) || (a.p2i - b.p2i));
}

// ═══════════════════════════════════════════════════════
// DESCRIPTION GENERATORS
// ═══════════════════════════════════════════════════════
const HOUSE_THEME = {
  1:'самовыражение и личность',2:'личные финансы и ценности',3:'общение и ближайшее окружение',
  4:'дом, семья и корни',5:'творчество, любовь и дети',6:'работа и здоровье',
  7:'партнёры и брак',8:'трансформация и общие ресурсы',9:'путешествия и философия',
  10:'карьера и публичный статус',11:'друзья, цели и сообщество',12:'тайное и духовное',
};
const MONEY_HOUSES = [2, 8, 10];

// ── House → life-area tags (several tags may share one house) ──
const HOUSE_TAGS = {
  1:  ['self'],
  2:  ['money'],
  3:  ['comms', 'study'],
  4:  ['home', 'family'],
  5:  ['love', 'creativity', 'children'],
  6:  ['work', 'health', 'duties'],
  7:  ['partners', 'marriage'],
  8:  ['finances', 'transformation'],
  9:  ['travel', 'growth'],
  10: ['career', 'status'],
  11: ['friends', 'goals'],
  12: ['inner', 'spirit'],
};

// cat: material (золото) · bonds (роза) · mind (бирюза) · depth (акцент)
const TAG_DEF = {
  self:           { ru:'ЛИЧНОСТЬ',      en:'SELF',       cat:'depth'    },
  money:          { ru:'ДЕНЬГИ',        en:'MONEY',      cat:'material' },
  comms:          { ru:'ОБЩЕНИЕ',       en:'COMMS',      cat:'mind'     },
  study:          { ru:'УЧЁБА',         en:'STUDY',      cat:'mind'     },
  home:           { ru:'ДОМ',           en:'HOME',       cat:'bonds'    },
  family:         { ru:'СЕМЬЯ',         en:'FAMILY',     cat:'bonds'    },
  love:           { ru:'ЛЮБОВЬ',        en:'LOVE',       cat:'bonds'    },
  creativity:     { ru:'ТВОРЧЕСТВО',    en:'CREATIVITY', cat:'mind'     },
  children:       { ru:'ДЕТИ',          en:'CHILDREN',   cat:'bonds'    },
  work:           { ru:'РАБОТА',        en:'WORK',       cat:'material' },
  health:         { ru:'ЗДОРОВЬЕ',      en:'HEALTH',     cat:'depth'    },
  duties:         { ru:'ОБЯЗАННОСТИ',   en:'DUTIES',     cat:'depth'    },
  partners:       { ru:'ПАРТНЁРЫ',      en:'PARTNERS',   cat:'bonds'    },
  marriage:       { ru:'БРАК',          en:'MARRIAGE',   cat:'bonds'    },
  finances:       { ru:'ФИНАНСЫ',       en:'FINANCES',   cat:'material' },
  transformation: { ru:'ТРАНСФОРМАЦИЯ', en:'TRANSFORM',  cat:'depth'    },
  travel:         { ru:'ПУТЕШЕСТВИЯ',   en:'TRAVEL',     cat:'mind'     },
  growth:         { ru:'РАЗВИТИЕ',      en:'GROWTH',     cat:'mind'     },
  career:         { ru:'КАРЬЕРА',       en:'CAREER',     cat:'material' },
  status:         { ru:'СТАТУС',        en:'STATUS',     cat:'material' },
  friends:        { ru:'ДРУЗЬЯ',        en:'FRIENDS',    cat:'bonds'    },
  goals:          { ru:'ЦЕЛИ',          en:'GOALS',      cat:'depth'    },
  inner:          { ru:'ПОДСОЗНАНИЕ',   en:'INNER',      cat:'depth'    },
  spirit:         { ru:'ДУХОВНОСТЬ',    en:'SPIRIT',     cat:'depth'    },
};

function tagPalette(cat, th) {
  const dark = th.effDark;
  if (cat === 'material') return dark ? { c:'#F2C060', b:'rgba(242,192,96,0.15)',  o:'rgba(242,192,96,0.38)'  } : { c:'#8A5A00', b:'rgba(200,150,40,0.18)',  o:'rgba(138,90,0,0.35)'   };
  if (cat === 'bonds')    return dark ? { c:'#E891B6', b:'rgba(232,145,182,0.15)', o:'rgba(232,145,182,0.40)' } : { c:'#A23A6E', b:'rgba(190,90,140,0.16)',  o:'rgba(162,58,110,0.35)' };
  if (cat === 'mind')     return dark ? { c:'#5FC2A2', b:'rgba(95,194,162,0.15)',  o:'rgba(95,194,162,0.40)'  } : { c:'#1C7355', b:'rgba(55,150,115,0.16)',  o:'rgba(28,115,85,0.35)'  };
  return { c:th.glyphClr, b:`${th.accent}18`, o:`${th.accent}40` }; // depth → accent
}

function genPlanetDesc(id, signIdx, house, ret) {
  const name = PL_META[id]?.ru || id;
  const sign = SIGN_GEN_RU[signIdx] || '?';
  const retStr = ret ? ' (ретроградный)' : '';
  const theme = HOUSE_THEME[house] || `${house} дом`;
  const isMoney   = MONEY_HOUSES.includes(house);
  const isPartner = house === 7;

  const base = {
    sun:     `Ваша жизненная сила, воля и самовыражение сосредоточены в ${sign}. Именно через это знак вы реализуетесь в мире — он окрашивает вашу личность.`,
    moon:    `Эмоциональная опора и инстинкты — в ${sign}. Вам нужно чувствовать себя в безопасности именно в ключе этого знака: разнообразие идей, контакт, интуиция.`,
    mercury: `Ум и способ общения — в ${sign}. Вы думаете, учитесь и говорите через призму этого знака. Коммуникация — ваш главный инструмент.`,
    venus:   `Ваш стиль в любви, красоте и ценностях — это ${sign}. Именно здесь вы ищете гармонию и привлекаете партнёров.`,
    mars:    `Воля, желания и способ действовать — через ${sign}. Вы достигаете целей именно так, и ваша энергия наиболее эффективна в этом ключе.`,
    jupiter: `Источник роста и удачи — в ${sign}. Здесь расширение происходит легко и естественно, открывая новые горизонты.`,
    saturn:  `Уроки, структура и дисциплина — в ${sign}. Здесь придётся потрудиться, но именно через это создаётся долгосрочная опора.`,
    uranus:  `Нестандартность и стремление к свободе — в ${sign}. Вы привносите инновации именно в эту сферу жизни.`,
    neptune: `Интуиция, мечты и растворение — в ${sign}. Ваша тонкая чувствительность окрашена этим знаком.`,
    pluto:   `Трансформация и скрытая власть — в ${sign}. Здесь происходят самые глубокие жизненные изменения.`,
  }[id] || `${name} в ${sign} влияет на сферу ${theme}.`;

  let extra = '';
  if (house != null) {
    extra = `В ${house} доме (${theme}) эта планетарная энергия проявляется через эту конкретную сферу жизни.`;
    if (isMoney)   extra += ' Этот дом напрямую связан с вашим финансовым потенциалом.';
    if (isPartner) extra += ' VII дом описывает ваши отношения и стиль партнёрства.';
  }
  if (ret) extra += (extra ? ' ' : '') + 'Ретроградность означает интернализацию: энергия работает глубже внутри, требуя осмысления.';

  return extra ? `${base} ${extra}` : base;
}

function genAspectDesc(p1, p2, aspType, h1, h2, s1, s2) {
  const n1 = PL_META[p1]?.ru || p1, n2 = PL_META[p2]?.ru || p2;
  const sg1 = SIGN_GEN_RU[s1] || '', sg2 = SIGN_GEN_RU[s2] || '';
  const hasH = h1 != null && h2 != null;
  const t1 = hasH ? (HOUSE_THEME[h1] || `${h1} дом`) : '', t2 = hasH ? (HOUSE_THEME[h2] || `${h2} дом`) : '';
  const isMoney   = hasH && (MONEY_HOUSES.includes(h1) || MONEY_HOUSES.includes(h2));
  const isPartner = hasH && (h1 === 7 || h2 === 7);

  const effect = {
    'Соединение': `усиливают и сливают свои темы — возникает яркая, концентрированная черта характера`,
    'Трин':       `гармонично взаимодействуют — поток между ними лёгкий, природный и укрепляющий`,
    'Секстиль':   `открывают возможности — небольшие усилия дают хороший результат`,
    'Квадратура': `создают продуктивное напряжение — именно через этот конфликт приходит рост`,
    'Оппозиция':  `поляризуют и балансируют — нужно найти золотую середину между двумя полюсами`,
  }[aspType] || 'аспектируют друг друга';

  let text = hasH
    ? `${n1} в ${sg1} (${t1}) и ${n2} в ${sg2} (${t2}) ${effect}.`
    : `${n1} в ${sg1} и ${n2} в ${sg2} ${effect}.`;
  if (isMoney)   text += ' Это затрагивает финансовую сферу — учтите при планировании заработка и вложений.';
  if (isPartner) text += ' VII дом в картине — особое внимание стилю отношений и выбору партнёра.';
  return text;
}

// ═══════════════════════════════════════════════════════
// HUMAN-WRITTEN INTERPRETATIONS (from natal-interpretations.js)
// Looks up curated text; falls back to the generators above if missing.
// ═══════════════════════════════════════════════════════
function interpData(lang) {
  const root = (typeof window !== 'undefined' && window.NATAL_INTERP) || null;
  if (!root) return null;
  return root[lang === 'en' ? 'en' : 'ru'] || null;
}

// Planet reading = "planet in sign" + (when houses are valid) "planet in house".
// Returns an array of paragraphs so the UI can render them with spacing.
function lookupPlanetParas(lang, id, signIdx, house, showHouses, ret) {
  const d = interpData(lang);
  const paras = [];
  if (d) {
    const signTxt = d.planets_in_signs?.[id]?.[SIGN_KEYS[signIdx]];
    if (signTxt) paras.push(signTxt);
    if (showHouses && house != null) {
      const houseTxt = d.planets_in_houses?.[id]?.[String(house)];
      if (houseTxt) paras.push(houseTxt);
    }
  }
  if (paras.length === 0) paras.push(genPlanetDesc(id, signIdx, showHouses ? house : null, ret));
  return paras;
}

// Aspect reading. Handles the order note: the files key aspects as e.g.
// "uranus-neptune"; if the app shows the pair the other way round we still
// find the same text by trying the reversed key.
function lookupAspectText(lang, p1, p2, aspKey, fallback) {
  const d = interpData(lang);
  if (d && d.aspects) {
    const txt = d.aspects[`${p1}-${p2}`]?.[aspKey] || d.aspects[`${p2}-${p1}`]?.[aspKey];
    if (txt) return txt;
  }
  return fallback;
}

// ═══════════════════════════════════════════════════════
// EXPAND ICON
// ═══════════════════════════════════════════════════════
function ExpandGlyph({ size = 16, color = 'currentColor', sw = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// NATAL CHART SVG
// ═══════════════════════════════════════════════════════
function NatalChartSVG({ th, planets, asc, mc, houseCusps, size, showHouses = true }) {
  size = size || 300;
  const s  = size / 400;
  const cx = size / 2, cy = size / 2;
  const R  = { bg:188*s, zOut:180*s, zIn:150*s, pR:133*s, hIn:110*s, aspR:105*s, cir:62*s };
  const dark = th.effDark;

  const ASC_ECL = asc || 0;
  const toRad   = (e) => Math.PI - (((e - ASC_ECL) % 360 + 360) % 360) * Math.PI / 180;
  const ptx     = (e, r) => cx + r * Math.cos(toRad(e));
  const pty     = (e, r) => cy + r * Math.sin(toRad(e));

  const zodSeg = (e0) => {
    const e1 = e0 + 30;
    return `M${ptx(e0,R.zOut)} ${pty(e0,R.zOut)} A${R.zOut} ${R.zOut} 0 0 0 ${ptx(e1,R.zOut)} ${pty(e1,R.zOut)} L${ptx(e1,R.zIn)} ${pty(e1,R.zIn)} A${R.zIn} ${R.zIn} 0 0 1 ${ptx(e0,R.zIn)} ${pty(e0,R.zIn)}Z`;
  };

  // Cluster offset: planets within 20° of each other get shifted radially
  const sorted = [...(planets || [])].sort((a, b) => a.ecl - b.ecl);
  const rOff = {};
  for (let i = 0; i < sorted.length; i++) {
    let off = 0;
    for (let j = 0; j < i; j++) {
      const diff = Math.min(Math.abs(sorted[i].ecl - sorted[j].ecl), 360 - Math.abs(sorted[i].ecl - sorted[j].ecl));
      if (diff < 20) { off = rOff[sorted[j].id] === 0 ? 14*s : (rOff[sorted[j].id] > 0 ? -14*s : 14*s); break; }
    }
    rOff[sorted[i].id] = off;
  }

  const bgFill = dark ? '#0d0820' : '#f5f0ff';
  const zodF1  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)';
  const zodF2  = dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.45)';
  const ln     = dark ? 'rgba(255,255,255,0.18)' : 'rgba(80,50,130,0.22)';
  const lnB    = dark ? 'rgba(255,255,255,0.45)' : 'rgba(80,50,130,0.55)';
  const txt    = dark ? 'rgba(246,241,255,0.88)' : 'rgba(30,20,60,0.88)';
  const ringFill  = dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.45)';
  const innerFill = dark ? 'rgba(8,4,24,0.92)'     : 'rgba(245,240,255,0.92)';

  const aspects = computeAspects(
    Object.fromEntries((planets||[]).map(p=>[p.id,{ecl:p.ecl}]))
  );
  const cusps = showHouses ? (houseCusps || []) : [];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block',margin:'0 auto'}}>
      <circle cx={cx} cy={cy} r={R.bg} fill={bgFill}/>
      {ZS.map((z,i)=>(
        <path key={z.e} d={zodSeg(z.e)} fill={i%2===0?zodF1:zodF2} stroke={ln} strokeWidth={0.5*s}/>
      ))}
      {ZS.map(z=>(
        <line key={'d'+z.e} x1={ptx(z.e,R.zOut)} y1={pty(z.e,R.zOut)} x2={ptx(z.e,R.zIn)} y2={pty(z.e,R.zIn)} stroke={lnB} strokeWidth={0.8*s}/>
      ))}
      <circle cx={cx} cy={cy} r={R.zOut} fill="none" stroke={ln} strokeWidth={0.8*s}/>
      <circle cx={cx} cy={cy} r={R.zIn}  fill="none" stroke={ln} strokeWidth={0.8*s}/>
      {ZS.map(z=>{
        const m=z.e+15, r=(R.zOut+R.zIn)/2;
        return <text key={'g'+z.e} x={ptx(m,r)} y={pty(m,r)} textAnchor="middle" dominantBaseline="central" fontSize={11*s} fill={txt} style={{fontFamily:'serif'}}>{z.g}</text>;
      })}
      <circle cx={cx} cy={cy} r={R.hIn} fill={ringFill} stroke={ln} strokeWidth={0.7*s}/>
      {cusps.map((e,i)=>{
        const main = i%3===0;
        return <line key={'h'+i} x1={ptx(e,R.zIn)} y1={pty(e,R.zIn)} x2={ptx(e,R.cir)} y2={pty(e,R.cir)} stroke={main?lnB:ln} strokeWidth={(main?1.2:0.6)*s} strokeDasharray={main?undefined:`${3*s} ${3*s}`}/>;
      })}
      {cusps.map((e,i)=>{
        const next=cusps[(i+1)%12], diff=((next-e)+360)%360, mid=e+diff/2;
        const r=(R.hIn+R.cir)/2;
        return <text key={'hn'+i} x={ptx(mid,r)} y={pty(mid,r)} textAnchor="middle" dominantBaseline="central" fontSize={8*s} fill={txt} opacity={0.65} style={{fontFamily:'sans-serif'}}>{i+1}</text>;
      })}
      {aspects.map(({p1,p2,col},i)=>{
        const a=planets?.find(p=>p.id===p1), b=planets?.find(p=>p.id===p2);
        if(!a||!b) return null;
        return <line key={'asp'+i} x1={ptx(a.ecl,R.aspR)} y1={pty(a.ecl,R.aspR)} x2={ptx(b.ecl,R.aspR)} y2={pty(b.ecl,R.aspR)} stroke={col} strokeWidth={1*s} opacity={0.65}/>;
      })}
      <circle cx={cx} cy={cy} r={R.cir} fill={innerFill} stroke={ln} strokeWidth={0.8*s}/>
      {(planets||[]).map(p=>{
        const pr = R.pR + (rOff[p.id]||0);
        const x=ptx(p.ecl,pr), y=pty(p.ecl,pr);
        return (
          <g key={p.id}>
            {p.id==='pluto'
              ? (<>{PlutoWheelMark({x,y:y-5*s,fpx:11*s,s,color:p.col})}{p.ret&&<text x={x+8*s} y={y-7.5*s} fontSize={7.5*s} fill={txt} style={{fontFamily:'sans-serif'}}>R</text>}</>)
              : <text x={x} y={y-5*s} textAnchor="middle" dominantBaseline="central" fontSize={11*s} fill={p.col} style={{fontFamily:'serif',fontWeight:'bold'}}>{p.g}{p.ret?<tspan fontSize={7.5*s} dx={0.5*s} style={{fontFamily:'sans-serif'}}>R</tspan>:null}</text>}
            <text x={x} y={y+6*s} textAnchor="middle" dominantBaseline="central" fontSize={7*s} fill={txt} opacity={0.8} style={{fontFamily:'sans-serif'}}>{p.sd}°</text>
          </g>
        );
      })}
      {showHouses && mc != null && [
        {lbl:'AC', e:asc,      off:[-14*s,0]},
        {lbl:'DC', e:(asc+180)%360, off:[14*s,0]},
        {lbl:'IC', e:(mc+180)%360,  off:[0,14*s]},
        {lbl:'MC', e:mc,       off:[0,-14*s]},
      ].map(({lbl,e,off})=>(
        <text key={lbl} x={ptx(e,R.bg-4*s)+off[0]} y={pty(e,R.bg-4*s)+off[1]} textAnchor="middle" dominantBaseline="central" fontSize={9*s} fill={lnB} fontWeight="700" style={{fontFamily:'sans-serif'}}>{lbl}</text>
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════
function NatalChoiceScreen({ th, lang, onChooseMe, onChooseOther }) {
  const l = lang === 'en';
  const card = (title, sub, badge, onClick, dim) => (
    <button onClick={onClick} style={{
      width:'100%',textAlign:'left',cursor:'pointer',
      background:dim?(th.effDark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.35)'):th.glassStrong,
      border:`1px solid ${th.glassBorder}`,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',
      borderRadius:20,padding:'20px 18px',opacity:dim?0.6:1,boxSizing:'border-box',
    }}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
        <div style={{width:46,height:46,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',background:`${th.accent}28`,border:`1px solid ${th.accent}44`,flexShrink:0}}>
          <AstroGlyph name="natal" size={24} color={th.glyphClr} sw={1.4}/>
        </div>
        {badge&&<span style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:9,letterSpacing:1.4,color:th.gold,border:`1px solid ${th.gold}50`,borderRadius:4,padding:'2px 6px'}}>{badge}</span>}
      </div>
      <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:19,lineHeight:1.1,color:th.ink,marginBottom:6}}>{title}</div>
      <div style={{fontFamily:'"Manrope",sans-serif',fontSize:12.5,lineHeight:1.4,color:th.inkSoft}}>{sub}</div>
    </button>
  );
  return (
    <div style={{padding:'8px 18px 28px',display:'flex',flexDirection:'column',gap:12,position:'relative',zIndex:1}}>
      <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:11,color:th.muted,letterSpacing:1.8,textTransform:'uppercase',marginBottom:2,marginTop:4}}>
        {l?'Choose a chart':'Выберите карту'}
      </div>
      {card(l?'My natal chart':'Моя натальная карта',l?'Based on your birth data — full reading':'Анализ на основе ваших данных рождения',l?'READY':'ДАННЫЕ ЕСТЬ',onChooseMe,false)}
      {card(l?'For another person':'Для другого человека',l?"Coming soon — we'll design this next":'Раздел в разработке — спроектируем дальше',null,onChooseOther,true)}
    </div>
  );
}

function NatalConfirmScreen({ th, lang, birth, userName, onConfirm, onEdit }) {
  const l = lang === 'en';
  const row = (label, value, accent) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',borderBottom:`1px solid ${th.glassBorder}`,gap:8}}>
      <span style={{fontFamily:'"Manrope",sans-serif',fontSize:12.5,color:th.muted,flexShrink:0}}>{label}</span>
      <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13.5,color:accent?th.accent:th.ink,textAlign:'right'}}>{value}</span>
    </div>
  );
  const approx   = birth.timeMode === 'approx';
  const unknown  = birth.timeMode === 'unknown';
  return (
    <div style={{padding:'8px 18px 28px',position:'relative',zIndex:1}}>
      <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:20,color:th.ink,marginBottom:4,lineHeight:1.2}}>{l?'Your birth data':'Данные рождения'}</div>
      <div style={{fontFamily:'"Manrope",sans-serif',fontSize:12.5,color:th.inkSoft,marginBottom:18}}>{l?'We\'ll calculate the chart for this data':'Карта будет рассчитана по этим данным'}</div>
      <div style={{background:th.glassStrong,border:`1px solid ${th.glassBorder}`,borderRadius:18,padding:'0 16px',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',marginBottom:14}}>
        {row(l?'Name':'Имя', userName || 'Алиса')}
        {row(l?'Date':'Дата рождения', fmtBirthDate(birth))}
        {row(l?'Time':'Время рождения', fmtBirthTime(birth, lang), approx || unknown)}
        {row(l?'City':'Город', fmtBirthCity(birth, lang))}
      </div>

      {(approx || unknown) && (
        <div style={{display:'flex',gap:9,alignItems:'flex-start',padding:'12px 14px',borderRadius:14,background:`${th.accent}14`,border:`1px solid ${th.accent}33`,marginBottom:18}}>
          <span style={{flexShrink:0,fontSize:14,lineHeight:1.3,color:th.glyphClr}}>✦</span>
          <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,lineHeight:1.5,color:th.inkSoft,textWrap:'pretty'}}>
            {unknown
              ? (l?'Without a birth time we build a noon-based chart: planets in signs and aspects only — no houses or ascendant.':'Без времени рождения строим карту на полдень: только планеты в знаках и аспекты — без домов и асцендента.')
              : (l?'Approximate time — planets and aspects are accurate; houses and ascendant are indicative only.':'Время указано примерно — планеты и аспекты точны; дома и асцендент ориентировочны.')}
          </div>
        </div>
      )}

      <button onClick={onConfirm} style={{display:'flex',width:'100%',justifyContent:'center',alignItems:'center',gap:8,height:50,borderRadius:999,border:'none',cursor:'pointer',background:th.accent,color:'#fff',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,boxShadow:`0 8px 26px ${th.accentGlow}`}}>
        {l?'Build chart':'Построить карту'}
        <AstroGlyph name="arrow-right" size={17} color="#fff" sw={1.9}/>
      </button>
      <button onClick={onEdit} style={{display:'flex',width:'100%',justifyContent:'center',alignItems:'center',gap:7,height:44,marginTop:10,borderRadius:999,cursor:'pointer',background:'none',border:`1px solid ${th.glassBorder}`,color:th.inkSoft,fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13.5}}>
        <AstroGlyph name="edit" size={14} color={th.inkSoft} sw={1.6}/>
        {l?'Edit data':'Редактировать данные'}
      </button>
    </div>
  );
}

// ── Full chart screen ──────────────────────────────────
function NatalChartScreen({ th, lang, birth, onExpand }) {
  const [chartData, setChartData] = useState(null);
  const [error,     setError]     = useState(null);
  const [openP, setOpenP] = useState(null);
  const [openA, setOpenA] = useState(null);

  useEffect(() => {
    try {
      const input = resolveBirthForChart(birth);
      const data  = computeRealChart(input);
      const planetsArr = PL_IDS.map(id => ({
        id,
        ...data.planets[id],
        ...PL_META[id],
        sd: data.planets[id].signDeg,
      }));
      setChartData({ ...data, planetsArr, aspects: computeAspects(Object.fromEntries(PL_IDS.map(id=>[id,data.planets[id]]))) });
    } catch(e) {
      setError(e.message);
    }
  }, [birth]);

  const l = lang === 'en';

  if (error) return (
    <div style={{padding:'24px 18px',position:'relative',zIndex:1,textAlign:'center'}}>
      <div style={{fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.muted}}>Ошибка расчёта: {error}</div>
    </div>
  );

  if (!chartData) return (
    <div style={{padding:'60px 18px',position:'relative',zIndex:1,textAlign:'center'}}>
      <div style={{fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.muted}}>{l?'Calculating chart…':'Вычисляю карту…'}</div>
    </div>
  );

  const { planetsArr, aspects, asc, mc, cusps, housesValid, mode, moonUncertain } = chartData;
  const exact       = mode === 'exact';
  const approx      = mode === 'approx';
  const unknown     = mode === 'unknown';
  const showHouses  = housesValid === true || housesValid === 'approx';
  const approxHouse = housesValid === 'approx';

  const tagEl = (label, color, bg, border, approx, key) => (
    <span key={key} style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:8.5,letterSpacing:0.8,color,background:bg,border:`1px solid ${border}`,borderRadius:4,padding:'2px 6px',whiteSpace:'nowrap'}}>{approx?'≈ ':''}{label}</span>
  );
  const houseTags = (house, approx) => {
    if (house == null) return null;
    return (HOUSE_TAGS[house] || []).map(k => {
      const d = TAG_DEF[k]; const p = tagPalette(d.cat, th);
      return tagEl(l ? d.en : d.ru, p.c, p.b, p.o, approx, k);
    });
  };
  const aspectTags = (h1, h2, approx) => {
    if (h1 == null || h2 == null) return null;
    const keys = [...new Set([...(HOUSE_TAGS[h1]||[]), ...(HOUSE_TAGS[h2]||[])])].slice(0, 3);
    return keys.map(k => {
      const d = TAG_DEF[k]; const p = tagPalette(d.cat, th);
      return tagEl(l ? d.en : d.ru, p.c, p.b, p.o, approx, k);
    });
  };

  const Chevron = ({ open }) => (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke={th.muted} strokeWidth={1.8} strokeLinecap="round" style={{flexShrink:0,transform:open?'rotate(180deg)':'none',transition:'transform .22s'}}>
      <path d="M3 6l5 5 5-5"/>
    </svg>
  );

  const Section = ({ title, children }) => (
    <div style={{marginBottom:22}}>
      <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10.5,letterSpacing:1.8,textTransform:'uppercase',color:th.muted,marginBottom:10}}>{title}</div>
      <div style={{background:th.glass,border:`1px solid ${th.glassBorder}`,borderRadius:18,padding:'0 16px',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)'}}>
        {children}
      </div>
    </div>
  );

  // ── precision caveat banner ──
  const approxWord = APPROX_LBL[birth.approx]?.[l?'en':'ru'] || '';
  const caveat = (approx || unknown || moonUncertain) ? (
    <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
      {(approx || unknown) && (
        <div style={{display:'flex',gap:9,alignItems:'flex-start',padding:'12px 14px',borderRadius:14,background:`${th.accent}14`,border:`1px solid ${th.accent}33`}}>
          <span style={{flexShrink:0,fontSize:13,color:th.glyphClr,lineHeight:1.4}}>✦</span>
          <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,lineHeight:1.5,color:th.inkSoft,textWrap:'pretty'}}>
            {unknown
              ? (l?'Birth time unknown — this is a noon chart. Planets in signs and aspects are reliable; houses, ascendant, MC and IC are not determined without an exact time.':'Время рождения неизвестно — это карта на полдень. Планеты в знаках и аспекты надёжны; дома, асцендент, MC и IC без точного времени не определяются.')
              : (l?`Approximate time (${approxWord}) — planets and aspects are accurate. Houses and the ascendant are indicative: the rising sign changes about every 2 hours.`:`Время указано примерно (${approxWord}) — планеты и аспекты точны. Дома и асцендент ориентировочны: восходящий знак сменяется примерно каждые 2 часа.`)}
          </div>
        </div>
      )}
      {moonUncertain && (
        <div style={{display:'flex',gap:9,alignItems:'flex-start',padding:'12px 14px',borderRadius:14,background:'rgba(242,192,96,0.12)',border:'1px solid rgba(242,192,96,0.3)'}}>
          <span style={{flexShrink:0,fontSize:13,color:'#F2C060',lineHeight:1.4}}>☽</span>
          <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,lineHeight:1.5,color:th.inkSoft,textWrap:'pretty'}}>
            {l?'The Moon changed sign on this day — its sign may differ depending on the exact hour.':'В этот день Луна сменила знак — её знак может отличаться в зависимости от точного часа.'}
          </div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div style={{padding:'4px 18px 32px',position:'relative',zIndex:1}}>
      {/* Chart wheel — tap to expand */}
      <button onClick={()=>onExpand({planetsArr,asc,mc,cusps,showHouses})} style={{display:'block',width:'100%',padding:0,margin:0,border:'none',background:'none',cursor:'zoom-in',position:'relative'}}>
        <NatalChartSVG th={th} planets={planetsArr} asc={asc} mc={mc} houseCusps={cusps} size={300} showHouses={showHouses}/>
        <span style={{position:'absolute',top:6,right:6,width:30,height:30,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',background:th.chip,border:`1px solid ${th.glassBorder}`,backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
          <ExpandGlyph size={15} color={th.ink} sw={1.7}/>
        </span>
      </button>

      {/* Birth line */}
      <div style={{display:'flex',justifyContent:'center',gap:14,marginTop:12,marginBottom:14,flexWrap:'wrap'}}>
        {[fmtBirthDate(birth), fmtBirthTime(birth, lang), fmtBirthCity(birth, lang)].map((v,i)=>(
          <span key={i} style={{fontFamily:'"Manrope",sans-serif',fontSize:11,color:th.muted}}>{v}</span>
        ))}
      </div>

      {/* Expand chart */}
      <button onClick={()=>onExpand({planetsArr,asc,mc,cusps,showHouses})} style={{display:'flex',width:'100%',justifyContent:'center',alignItems:'center',gap:7,height:42,marginBottom:18,borderRadius:999,cursor:'pointer',background:th.chip,border:`1px solid ${th.glassBorder}`,color:th.inkSoft,fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13,backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
        <ExpandGlyph size={15} color={th.inkSoft} sw={1.6}/>
        {l?'Expand chart':'Развернуть карту'}
      </button>

      {caveat}

      {/* Planets */}
      <Section title={showHouses ? (l?'Planets & Houses':'Планеты и дома') : (l?'Planets in Signs':'Планеты в знаках')}>
        {planetsArr.map(p => {
          const open = openP === p.id;
          return (
            <div key={p.id} style={{borderBottom:`1px solid ${th.glassBorder}`}}>
              <button onClick={()=>setOpenP(open?null:p.id)} style={{width:'100%',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',gap:10,padding:'13px 0',background:'none',border:'none',color:th.ink}}>
                <span style={{minWidth:22,display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><PGlyph id={p.id} size={17} color={p.col} bold/></span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13,color:th.ink,display:'flex',alignItems:'center',flexWrap:'wrap',gap:4}}>
                    {p.ru} {p.ret&&<span style={{fontSize:10,fontWeight:700,letterSpacing:0.5,color:th.muted}}>R</span>}
                    {showHouses && houseTags(p.house, approxHouse)}
                  </div>
                  <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,color:th.muted,marginTop:2}}>
                    {p.signDeg}° {SIGN_NOM_RU[p.signIdx]}{showHouses ? ` · ${approxHouse?'≈ ':''}${p.house} дом` : ''}
                  </div>
                </div>
                <Chevron open={open}/>
              </button>
              {open&&<div style={{paddingBottom:14,paddingRight:6,display:'flex',flexDirection:'column',gap:10}}>
                {lookupPlanetParas(lang,p.id,p.signIdx,p.house,showHouses,p.ret).map((para,pi)=>(
                  <div key={pi} style={{fontFamily:'"Manrope",sans-serif',fontSize:13,lineHeight:1.6,color:th.inkSoft,textWrap:'pretty'}}>{para}</div>
                ))}
              </div>}
            </div>
          );
        })}
      </Section>

      {/* Aspects */}
      <Section title={l?'Aspects':'Аспекты'}>
        {aspects.length === 0 && <div style={{padding:'14px 0',fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.muted}}>Нет точных аспектов</div>}
        {aspects.map((asp,i) => {
          const open = openA === i;
          const pl1 = planetsArr.find(p=>p.id===asp.p1);
          const pl2 = planetsArr.find(p=>p.id===asp.p2);
          if(!pl1||!pl2) return null;
          return (
            <div key={i} style={{borderBottom:`1px solid ${th.glassBorder}`}}>
              <button onClick={()=>setOpenA(open?null:i)} style={{width:'100%',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',gap:10,padding:'13px 0',background:'none',border:'none',color:th.ink}}>
                <span style={{fontSize:16,lineHeight:1,color:asp.col,fontFamily:'serif',minWidth:20,textAlign:'center'}}>{asp.sym}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12.5,color:th.ink,display:'flex',alignItems:'center',gap:4,flexWrap:'wrap'}}>
                    {pl1.ru} — {pl2.ru}
                    {showHouses && aspectTags(pl1.house, pl2.house, approxHouse)}
                  </div>
                  <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11,color:th.muted,marginTop:1}}>
                    {asp.type_ru} · орб {asp.orb.toFixed(1)}°{showHouses ? ` · ${approxHouse?'≈ ':''}${pl1.house} и ${pl2.house} дом` : ''}
                  </div>
                </div>
                <Chevron open={open}/>
              </button>
              {open&&<div style={{fontFamily:'"Manrope",sans-serif',fontSize:13,lineHeight:1.6,color:th.inkSoft,paddingBottom:14,paddingRight:6,textWrap:'pretty'}}>
                {lookupAspectText(lang,asp.p1,asp.p2,asp.aspKey,genAspectDesc(asp.p1,asp.p2,asp.type_ru,showHouses?pl1.house:null,showHouses?pl2.house:null,pl1.signIdx,pl2.signIdx))}
              </div>}
            </div>
          );
        })}
      </Section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXPANDED CHART OVERLAY  (full-screen, pannable, readable wheel)
// ═══════════════════════════════════════════════════════
function ChartExpandOverlay({ th, lang, data, onClose }) {
  const l = lang === 'en';
  const ref = useRef(null);
  const SIZE = 580;
  const titleTxt = data.title || (l ? 'Natal chart' : 'Натальная карта');
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.scrollLeft = (el.scrollWidth  - el.clientWidth)  / 2;
      el.scrollTop  = (el.scrollHeight - el.clientHeight) / 2;
    }
  }, []);
  return (
    <div className="astro-in-f" style={{position:'absolute',inset:0,zIndex:78,display:'flex',flexDirection:'column',background: th.effDark ? 'rgba(8,5,20,0.97)' : 'rgba(245,242,255,0.98)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
      <div style={{paddingTop:54,flexShrink:0}}>
        <div style={{height:50,display:'flex',alignItems:'center',gap:10,padding:'0 16px'}}>
          <div style={{flex:1,fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,color:th.ink}}>{titleTxt}</div>
          <button onClick={onClose} style={{width:33,height:33,borderRadius:999,border:`1px solid ${th.glassBorder}`,background:th.chip,color:th.ink,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,flexShrink:0,backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
            <AstroGlyph name="close" size={15} color={th.ink} sw={1.8}/>
          </button>
        </div>
      </div>
      <div ref={ref} style={{flex:1,overflow:'auto',scrollbarWidth:'none'}}>
        <div style={{width:SIZE+60,height:SIZE+60,padding:30,boxSizing:'border-box'}}>
          <NatalChartSVG th={th} planets={data.planetsArr} asc={data.asc} mc={data.mc} houseCusps={data.cusps} size={SIZE} showHouses={data.showHouses}/>
        </div>
      </div>
      <div style={{flexShrink:0,padding:'10px 18px 30px',textAlign:'center'}}>
        <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,color:th.muted}}>{l?'Drag to explore the wheel':'Листайте, чтобы рассмотреть карту'}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════
Object.assign(window, {
  NatalChoiceScreen, NatalConfirmScreen, NatalChartScreen, ChartExpandOverlay,
  NatalChartSVG,
  // engine + constants reused by the synastry / solar modules
  computeRealChart, computeAspects, getPlanetHouse,
  HOUSE_THEME, HOUSE_TAGS, TAG_DEF, tagPalette,
  PL_META, PL_IDS, ZS, PGlyph, PlutoWheelMark,
  SIGN_NOM_RU, SIGN_GEN_RU, SIGN_GLYPH, SIGN_KEYS,
  ASP_TYPES,
});
