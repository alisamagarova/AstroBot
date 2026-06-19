// aspects-engine.js — "Аспекты на месяц" / Aspects of the month
// ─────────────────────────────────────────────────────────────────────────
// Monthly transit forecast. For a chosen calendar month we scan the transiting
// planets (Sun → Pluto, no Moon) and find every major ASPECT they form to the
// natal chart. For each aspect we compute its ACTIVE WINDOW (the span it stays
// inside orb) and its EXACT date(s) — so an aspect that began last month but is
// still in orb this month is shown too (its window overlaps the month).
//   • KEY aspects     = slow planets (Jupiter, Saturn, Uranus, Neptune, Pluto)
//   • SECONDARY        = personal planets (Sun, Mercury, Venus, Mars)
// Recomputed live, so every new calendar month yields a fresh set.
//
// Reuses window.computeRealChart / resolveBirthForChart / PL_META / HOUSE_THEME
// / HOUSE_TAGS / TAG_DEF and the global Astronomy engine.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  const norm360 = (x) => ((x % 360) + 360) % 360;
  const norm180 = (x) => ((x % 360) + 540) % 360 - 180;
  const DAY = 86400000;

  const ASPS = [
    { key: 'conjunction', sym: '☌', ru: 'Соединение', en: 'Conjunction', angle: 0,   bucket: 'conj', col: '#D4901A' },
    { key: 'sextile',     sym: '⚹', ru: 'Секстиль',   en: 'Sextile',     angle: 60,  bucket: 'soft', col: '#30A060' },
    { key: 'square',      sym: '□', ru: 'Квадрат',     en: 'Square',      angle: 90,  bucket: 'hard', col: '#C03828' },
    { key: 'trine',       sym: '△', ru: 'Трин',        en: 'Trine',       angle: 120, bucket: 'soft', col: '#2890C0' },
    { key: 'opposition',  sym: '☍', ru: 'Оппозиция',   en: 'Opposition',  angle: 180, bucket: 'hard', col: '#C03828' },
  ];

  const SLOW = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const PERSONAL = ['sun', 'mercury', 'venus', 'mars'];
  const TRANSITERS = [...PERSONAL, ...SLOW];

  // active orb (deg) per transiting planet — how wide its "in effect" window is
  const ORB = { sun: 1, mercury: 1, venus: 1, mars: 1.2, jupiter: 1.6, saturn: 1.6, uranus: 1.4, neptune: 1.3, pluto: 1.3 };
  const PW = { sun: 0.55, mercury: 0.4, venus: 0.5, mars: 0.62, jupiter: 0.78, saturn: 0.9, uranus: 0.92, neptune: 0.85, pluto: 1.0 };
  const AW = { conjunction: 1.0, opposition: 0.9, square: 0.86, trine: 0.82, sextile: 0.6 };

  // ── house themes ──
  const HOUSE_THEME_EN = {
    1:'identity and self-expression', 2:'personal finances and values', 3:'communication and surroundings',
    4:'home, family and roots', 5:'creativity, love and children', 6:'work and health',
    7:'partners and relationships', 8:'transformation and shared resources', 9:'travel and philosophy',
    10:'career and public status', 11:'friends, goals and community', 12:'the hidden and spiritual',
  };

  // ── interpretation building blocks ──
  const AGENT = {
    sun:     { ru: 'освещает и наполняет энергией', en: 'lights up and energises' },
    mercury: { ru: 'включает мысли, контакты и переговоры', en: 'switches on thinking, contacts and talks' },
    venus:   { ru: 'приносит тепло в отношения, деньги и удовольствия', en: 'brings warmth to love, money and pleasure' },
    mars:    { ru: 'добавляет энергии, напора и желания действовать', en: 'adds drive, push and the urge to act' },
    jupiter: { ru: 'расширяет, открывает возможности и даёт рост', en: 'expands, opens opportunities and grows things' },
    saturn:  { ru: 'проверяет на прочность, структурирует и требует ответственности', en: 'tests, structures and asks for responsibility' },
    uranus:  { ru: 'вносит перемены, свободу и неожиданные повороты', en: 'brings change, freedom and sudden turns' },
    neptune: { ru: 'размывает границы, добавляет мечтательности и чувствительности', en: 'blurs edges, adds dream and sensitivity' },
    pluto:   { ru: 'трансформирует глубоко, до самого основания', en: 'transforms deeply, to the core' },
  };
  const ROLE = {
    sun:     { ru: 'твою личность и волю', en: 'your identity and will' },
    moon:    { ru: 'эмоции, дом и чувство опоры', en: 'emotions, home and security' },
    mercury: { ru: 'ум, речь и повседневные дела', en: 'mind, speech and daily affairs' },
    venus:   { ru: 'любовь, отношения и финансы', en: 'love, relationships and money' },
    mars:    { ru: 'действия, желания и энергию', en: 'action, desire and energy' },
    jupiter: { ru: 'рост, веру и возможности', en: 'growth, belief and opportunity' },
    saturn:  { ru: 'обязанности, структуру и границы', en: 'duties, structure and limits' },
    uranus:  { ru: 'стремление к свободе и переменам', en: 'the drive for freedom and change' },
    neptune: { ru: 'мечты, интуицию и идеалы', en: 'dreams, intuition and ideals' },
    pluto:   { ru: 'глубинные процессы и личную власть', en: 'deep processes and personal power' },
    asc:     { ru: 'образ себя и подход к жизни', en: 'self-image and your approach to life' },
    mc:      { ru: 'карьеру, статус и публичную роль', en: 'career, status and public role' },
  };
  const FLAVOR = {
    conj: { ru: 'Энергии сливаются в один импульс — тема выходит на первый план и требует внимания.', en: 'The energies merge into one impulse — the theme comes to the front and asks for attention.' },
    soft: { ru: 'Поток идёт легко: можно опереться на поддержку обстоятельств и мягко продвинуться.', en: 'The flow is easy: you can lean on supportive circumstances and move forward gently.' },
    hard: { ru: 'Возникает напряжение, которое подталкивает к решению и поиску баланса.', en: 'Tension builds that pushes you toward a decision and toward balance.' },
  };
  const ANGLE_TAGS = { asc: ['self'], mc: ['career', 'status'] };

  function eclLonAt(bodyStr, ms) {
    const t = Astronomy.MakeTime(new Date(ms));
    return norm360(Astronomy.Ecliptic(Astronomy.GeoVector(bodyStr, t, false)).elon);
  }

  function plName(id, lang) { return window.PL_META[id] ? window.PL_META[id][lang === 'en' ? 'en' : 'ru'] : id; }
  function natalLabel(id, lang) {
    if (id === 'asc') return lang === 'en' ? 'Ascendant' : 'Асцендент';
    if (id === 'mc') return lang === 'en' ? 'MC' : 'MC';
    return plName(id, lang);
  }

  // ═══════════════════════════════════════════════════════════════════════
  function scanMonthAspects(birth, year, month /* 1-12 */) {
    const chart = window.computeRealChart(window.resolveBirthForChart(birth));
    const housesOK = chart.housesValid === true || chart.housesValid === 'approx';
    const approxHouses = chart.housesValid === 'approx';

    // natal targets
    const targets = window.PL_IDS.map((id) => ({ id, lon: norm360(chart.planets[id].ecl), house: chart.planets[id].house }));
    if (housesOK) {
      targets.push({ id: 'asc', lon: norm360(chart.asc), house: 1 });
      targets.push({ id: 'mc', lon: norm360(chart.mc), house: 10 });
    }

    const monthStart = Date.UTC(year, month - 1, 1);
    const monthEnd = Date.UTC(year, month, 1) - 1; // last instant of the month
    const scanStart = monthStart - 220 * DAY;
    const scanEnd = monthEnd + 220 * DAY;

    // per-key running state
    const st = {}; // key -> { prevSigned, prevOrb, open:{start,exacts:[]}|null, intervals:[] }
    const meta = {}; // key -> {T,N,asp}

    let prevMs = null;
    for (let ms = scanStart; ms <= scanEnd; ms += DAY) {
      const tlon = {};
      for (const T of TRANSITERS) tlon[T] = eclLonAt(window.PL_META[T].body, ms);
      for (const T of TRANSITERS) {
        const orbT = ORB[T];
        for (const tg of targets) {
          const delta = norm180(tlon[T] - tg.lon);
          for (const asp of ASPS) {
            const angs = asp.angle === 0 ? [0] : asp.angle === 180 ? [180] : [asp.angle, -asp.angle];
            for (const a of angs) {
              const signed = norm180(delta - a);
              const orbAbs = Math.abs(signed);
              if (orbAbs > orbT + 1.2 && (!st[a + T + tg.id + asp.key] || !st[a + T + tg.id + asp.key].open)) {
                // far away and not in an open window — skip bookkeeping for speed,
                // but still record prev so a future approach is caught
              }
              const key = T + '|' + tg.id + '|' + asp.key + '|' + a;
              let s = st[key];
              if (!s) { s = st[key] = { prevSigned: null, prevOrb: null, open: null, intervals: [] }; meta[key] = { T, N: tg.id, asp, house: tg.house }; }
              if (s.prevOrb != null) {
                // exact crossing (sign flip of signed)
                if (Math.sign(signed) !== Math.sign(s.prevSigned) && Math.abs(signed - s.prevSigned) < 6) {
                  const f = s.prevSigned / (s.prevSigned - signed);
                  const exMs = prevMs + f * DAY;
                  if (s.open) s.open.exacts.push(exMs);
                  else s.intervals.push({ start: exMs, end: exMs, exacts: [exMs], pointHit: true });
                }
                // enter orb
                if (s.prevOrb > orbT && orbAbs <= orbT) {
                  const f = (s.prevOrb - orbT) / (s.prevOrb - orbAbs);
                  s.open = { start: prevMs + f * DAY, exacts: [] };
                }
                // exit orb
                if (s.prevOrb <= orbT && orbAbs > orbT && s.open) {
                  const f = (orbT - s.prevOrb) / (orbAbs - s.prevOrb);
                  s.open.end = prevMs + f * DAY;
                  s.intervals.push(s.open);
                  s.open = null;
                }
              }
              s.prevSigned = signed;
              s.prevOrb = orbAbs;
            }
          }
        }
      }
      prevMs = ms;
    }
    // close dangling open intervals
    for (const key of Object.keys(st)) {
      const s = st[key];
      if (s.open) { s.open.end = scanEnd; s.open.openEnd = true; s.intervals.push(s.open); }
    }

    // build events from intervals overlapping the month
    const events = [];
    const nowMs = Date.now();
    for (const key of Object.keys(st)) {
      const m = meta[key];
      for (const iv of st[key].intervals) {
        if (iv.pointHit) continue; // a bare crossing with no real orb window (shouldn't usually happen)
        if (iv.end < monthStart || iv.start > monthEnd) continue; // no overlap
        const exactsInIv = iv.exacts.filter((e) => e >= iv.start - DAY && e <= iv.end + DAY).sort((a, b) => a - b);
        events.push({
          T: m.T, N: m.N, asp: m.asp, house: m.house,
          startMs: iv.start, endMs: iv.end,
          exacts: exactsInIv,
          startsBefore: iv.start < monthStart,
          continuesAfter: iv.end > monthEnd || iv.openEnd,
          activeNow: nowMs >= iv.start && nowMs <= iv.end,
          allMonth: iv.start <= monthStart && iv.end >= monthEnd,
          tier: SLOW.includes(m.T) ? 'key' : 'secondary',
          score: PW[m.T] * AW[m.asp.key],
        });
      }
    }

    // de-dup (same T,N,asp overlapping intervals merged just in case)
    const key2 = (e) => e.T + e.N + e.asp.key;
    const merged = [];
    events.sort((a, b) => a.startMs - b.startMs);
    for (const e of events) {
      const dup = merged.find((o) => key2(o) === key2(e) && e.startMs <= o.endMs + 3 * DAY && e.endMs >= o.startMs - 3 * DAY);
      if (dup) {
        dup.startMs = Math.min(dup.startMs, e.startMs); dup.endMs = Math.max(dup.endMs, e.endMs);
        dup.exacts = [...new Set([...dup.exacts, ...e.exacts])].sort((a, b) => a - b);
        dup.startsBefore = dup.startMs < monthStart; dup.continuesAfter = dup.continuesAfter || e.continuesAfter;
        dup.allMonth = dup.startMs <= monthStart && dup.endMs >= monthEnd;
      } else merged.push(e);
    }

    const key_ = merged.filter((e) => e.tier === 'key').sort((a, b) => a.startMs - b.startMs);
    const sec_ = merged.filter((e) => e.tier === 'secondary')
      .sort((a, b) => (a.exacts[0] || a.startMs) - (b.exacts[0] || b.startMs))
      .slice(0, 12);

    return { year, month, monthStart, monthEnd, key: key_, secondary: sec_, housesOK, approxHouses, count: key_.length + sec_.length };
  }

  // ── description for one aspect event ──
  function describe(e, lang) {
    const en = lang === 'en';
    const tp = plName(e.T, lang);
    const np = natalLabel(e.N, lang);
    const agent = AGENT[e.T] ? AGENT[e.T][en ? 'en' : 'ru'] : '';
    const role = ROLE[e.N] ? ROLE[e.N][en ? 'en' : 'ru'] : np;
    const flavor = (FLAVOR[e.asp.bucket] || FLAVOR.conj)[en ? 'en' : 'ru'];
    let house = '';
    if (e.house != null) {
      const themeRu = window.HOUSE_THEME && window.HOUSE_THEME[e.house];
      const themeEn = HOUSE_THEME_EN[e.house];
      if (en && themeEn) house = ` Life area — ${themeEn}.`;
      else if (!en && themeRu) house = ` Сфера жизни — ${themeRu}.`;
    }
    if (en) {
      return `Transiting ${tp} ${agent} and touches ${role}. ${flavor}`;
    }
    return `Транзитный ${tp} ${agent} и затрагивает ${role}. ${flavor}${house}`;
  }

  function influenceTags(e) {
    let keys = [];
    if (e.N === 'asc' || e.N === 'mc') keys = ANGLE_TAGS[e.N] || [];
    else if (e.house != null && window.HOUSE_TAGS) keys = (window.HOUSE_TAGS[e.house] || []).slice(0, 2);
    return keys;
  }

  function aspMeta(key) { return ASPS.find((a) => a.key === key); }

  function houseLabelEn(h) { return HOUSE_THEME_EN[h] || ''; }

  window.ASPECTS = { scanMonthAspects, describe, influenceTags, aspMeta, plName, natalLabel, houseLabelEn };
})();
