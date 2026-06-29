// solar.jsx — Solar Return (соляр) module · real ephemeris via Astronomy Engine.
// Casts a chart for the exact moment the Sun returns to its natal longitude in a
// chosen year, at a chosen location. Reads the year's theme (SR Sun house), tone
// (SR Ascendant), the "second plan" (year-ruler + Moon + stellium + natal overlay),
// SR aspects, slow transits to natal across the year, and solar-arc directions.
// Reuses the natal engine (window.computeRealChart) and its wheel (NatalChartSVG).

const { useState, useEffect, useRef } = React;

// ── borrow engine + constants exported by natal.jsx / birthedit.jsx ──
const SR = {
  PL_META: window.PL_META, PL_IDS: window.PL_IDS,
  SIGN_NOM_RU: window.SIGN_NOM_RU, SIGN_GEN_RU: window.SIGN_GEN_RU, SIGN_GLYPH: window.SIGN_GLYPH,
  SIGN_EN: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
  computeRealChart: window.computeRealChart, computeAspects: window.computeAspects, getPlanetHouse: window.getPlanetHouse,
  resolveBirthForChart: window.resolveBirthForChart,
  fmtBirthDate: window.fmtBirthDate, fmtBirthCity: window.fmtBirthCity, cityZone: window.cityZone,
  NatalChartSVG: window.NatalChartSVG, CitySearch: window.CitySearch,
  ZS: window.ZS, PGlyph: window.PGlyph, PlutoWheelMark: window.PlutoWheelMark,
};

// Traditional rulerships (classical 7 planets) → "управитель года"
const SIGN_RULER = ['mars','venus','mercury','moon','sun','mercury','venus','mars','jupiter','saturn','saturn','jupiter'];
const SR_SIGN_PREP = ['в Овне','в Тельце','в Близнецах','в Раке','во Льве','в Деве','в Весах','в Скорпионе','в Стрельце','в Козероге','в Водолее','в Рыбах'];

// Year-framed house labels (short, for tags / inline)
const SR_HOUSE_RU = {1:'Личность',2:'Деньги',3:'Общение',4:'Дом',5:'Творчество',6:'Работа',7:'Отношения',8:'Трансформация',9:'Горизонты',10:'Карьера',11:'Цели',12:'Уединение'};
const SR_HOUSE_EN = {1:'Self',2:'Money',3:'Comms',4:'Home',5:'Creativity',6:'Work',7:'Partners',8:'Depth',9:'Horizons',10:'Career',11:'Goals',12:'Retreat'};
const SR_HOUSE_THEME_RU = {1:'личность и образ',2:'деньги и ресурсы',3:'общение и учёбу',4:'дом и семью',5:'творчество и любовь',6:'работу и здоровье',7:'отношения',8:'трансформацию',9:'горизонты и учёбу',10:'карьеру и статус',11:'цели и круг общения',12:'уединение и итоги'};
const SR_HOUSE_THEME_EN = {1:'identity and image',2:'money and resources',3:'communication and study',4:'home and family',5:'creativity and love',6:'work and health',7:'relationships',8:'transformation',9:'horizons and study',10:'career and status',11:'goals and community',12:'solitude and closure'};

const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SOLAR_YEAR_MS = 365.2422 * 86400000;

// ═══════════════════════════════════════════════════════
// EPHEMERIS HELPERS
// ═══════════════════════════════════════════════════════
const norm360 = (x) => ((x % 360) + 360) % 360;
const norm180 = (x) => ((x % 360) + 540) % 360 - 180;
// Russian count agreement: plRu(n,'транзит','транзита','транзитов')
const plRu = (n, one, few, many) => { const a = n % 10, b = n % 100; if (a === 1 && b !== 11) return one; if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return few; return many; };

function eclLonAt(bodyStr, date) {
  const t = Astronomy.MakeTime(date);
  return norm360(Astronomy.Ecliptic(Astronomy.GeoVector(bodyStr, t, false)).elon);
}

// UTC offset (hours, incl. historical DST) of an IANA zone at a UTC instant.
function offHoursAt(zone, utcMs) {
  if (!zone) return null;
  try {
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const p = {}; dtf.formatToParts(new Date(utcMs)).forEach((x) => { p[x.type] = x.value; });
    const hh = p.hour === '24' ? 0 : +p.hour;
    return (Date.UTC(+p.year, +p.month - 1, +p.day, hh, +p.minute, +p.second) - utcMs) / 3600000;
  } catch (e) { return null; }
}

// Birth moment as a real UTC Date (mirrors computeRealChart's local→UTC conversion).
function birthToUTC(birth) {
  const i = SR.resolveBirthForChart(birth);
  return new Date(Date.UTC(i.year, i.month - 1, i.day, 0, 0, 0) + (i.localHour * 60 + i.localMin) * 60000 - i.utcOffset * 3600000);
}

// Find the UTC instant in `year` when the Sun returns to `natalLon`.
function findSolarReturnUTC(natalLon, year, birthMonth, birthDay) {
  const start = new Date(Date.UTC(year, birthMonth - 1, birthDay, 0, 0, 0) - 3 * 86400000);
  let prevT = start, prevD = norm180(eclLonAt('Sun', start) - natalLon);
  for (let h = 1; h <= 9 * 24; h++) {
    const t = new Date(start.getTime() + h * 3600000);
    const d = norm180(eclLonAt('Sun', t) - natalLon);
    if (Math.sign(d) !== Math.sign(prevD) && Math.abs(d - prevD) < 10) {
      let a = prevT, b = t, da = prevD;
      for (let k = 0; k < 40; k++) {
        const mid = new Date((a.getTime() + b.getTime()) / 2);
        const dm = norm180(eclLonAt('Sun', mid) - natalLon);
        if (Math.sign(dm) === Math.sign(da)) { a = mid; da = dm; } else b = mid;
      }
      return new Date((a.getTime() + b.getTime()) / 2);
    }
    prevT = t; prevD = d;
  }
  return null;
}

// Cast a full chart (with houses) for a UTC instant at a given city.
function chartFromUTC(utcDate, city) {
  const zone = SR.cityZone ? SR.cityZone(city) : (city && city.zone);
  let off = offHoursAt(zone, utcDate.getTime());
  if (off == null) off = city && city.tz != null ? city.tz : 0;
  const L = new Date(utcDate.getTime() + off * 3600000);
  return SR.computeRealChart({
    year: L.getUTCFullYear(), month: L.getUTCMonth() + 1, day: L.getUTCDate(),
    localHour: L.getUTCHours(), localMin: L.getUTCMinutes(),
    utcOffset: off, lat: (city && city.lat) || 0, lon: (city && city.lon) || 0,
    mode: 'exact', housesValid: true,
  });
}

// ═══════════════════════════════════════════════════════
// ASPECT SETS
// ═══════════════════════════════════════════════════════
const ASPS = [
  { key: 'conjunction', sym: '☌', ru: 'Соединение', en: 'Conjunction', angle: 0,   col: '#D4901A' },
  { key: 'sextile',     sym: '⚹', ru: 'Секстиль',   en: 'Sextile',     angle: 60,  col: '#30A060' },
  { key: 'square',      sym: '□', ru: 'Квадрат',     en: 'Square',      angle: 90,  col: '#C03828' },
  { key: 'trine',       sym: '△', ru: 'Трин',        en: 'Trine',       angle: 120, col: '#2890C0' },
  { key: 'opposition',  sym: '☍', ru: 'Оппозиция',   en: 'Opposition',  angle: 180, col: '#C03828' },
];
const ASP_BY_KEY = Object.fromEntries(ASPS.map((a) => [a.key, a]));

// ── SR-aspect date-range helpers ──
const SR_ASP_MAX_ORB = { conjunction: 8, opposition: 8, trine: 7, square: 7, sextile: 5 };
const ASTRO_BODY = { sun:'Sun', moon:'Moon', mercury:'Mercury', venus:'Venus', mars:'Mars', jupiter:'Jupiter', saturn:'Saturn', uranus:'Uranus', neptune:'Neptune', pluto:'Pluto' };
const PL_ORDER   = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];

function srAspNormKey(p1, p2) {
  return PL_ORDER.indexOf(p1) <= PL_ORDER.indexOf(p2) ? `${p1}-${p2}` : `${p2}-${p1}`;
}

function computeSRaspectRange(p1, p2, aspKey, srUTC) {
  const aspAngle = ASP_BY_KEY[aspKey] ? ASP_BY_KEY[aspKey].angle : null;
  if (aspAngle === null) return null;
  const maxOrb = SR_ASP_MAX_ORB[aspKey] || 6;
  const STEP   = 5 * 86400000;

  const inOrb = (ms) => {
    try {
      const t  = Astronomy.MakeTime(new Date(ms));
      const l1 = norm360(Astronomy.Ecliptic(Astronomy.GeoVector(ASTRO_BODY[p1], t, false)).elon);
      const l2 = norm360(Astronomy.Ecliptic(Astronomy.GeoVector(ASTRO_BODY[p2], t, false)).elon);
      const d  = norm180(l1 - l2);
      const targets = aspAngle === 0 ? [0] : aspAngle === 180 ? [180, -180] : [aspAngle, -aspAngle];
      return targets.some(a => Math.abs(d - a) <= maxOrb);
    } catch(e) { return false; }
  };

  const srMs = srUTC.getTime();
  // from = дата соляра
  const fromMs = srMs;
  // Сканируем весь год — ищем ПОСЛЕДНИЙ момент когда аспект в орбисе
  let lastInOrbMs = srMs;
  for (let t = srMs + STEP; t <= srMs + 365 * 86400000; t += STEP) {
    if (inOrb(t)) lastInOrbMs = t;
  }
  return { from: new Date(fromMs), to: new Date(lastInOrbMs) };
}

function fmtSRRange(range, lang) {
  if (!range) return null;
  const MR = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const ME = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const M  = lang === 'en' ? ME : MR;
  const { from, to } = range;
  const spanDays = (to - from) / 86400000;
  if (spanDays >= 340) return lang === 'en' ? 'all year' : 'весь год';
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear())
    return `${M[from.getMonth()]} ${from.getFullYear()}`;
  if (from.getFullYear() === to.getFullYear())
    return `${M[from.getMonth()]} — ${M[to.getMonth()]} ${to.getFullYear()}`;
  return `${M[from.getMonth()]} ${from.getFullYear()} — ${M[to.getMonth()]} ${to.getFullYear()}`;
}

// SR planet ↔ natal planet aspects — the heart of the "соляр на натал" overlay.
const CROSS_ORBS = { conjunction: 5, opposition: 5, square: 4, trine: 4, sextile: 3 };
function computeCrossAspects(srPlanets, natalPlanets) {
  const out = [];
  for (const a of srPlanets) {
    for (const b of natalPlanets) {
      const diff = Math.abs(norm180(a.ecl - b.ecl));
      for (const asp of ASPS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= (CROSS_ORBS[asp.key] || 3)) { out.push({ sr: a.id, nat: b.id, asp, orb }); break; }
      }
    }
  }
  out.sort((x, y) => x.orb - y.orb);
  return out;
}

// ═══════════════════════════════════════════════════════
// TRANSITS — slow planets crossing exact aspects to natal points across the year
// ═══════════════════════════════════════════════════════
const TRANSIT_PLANETS = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

function computeTransits(natalChart, srUTC) {
  const natalLon = {}; for (const id of SR.PL_IDS) natalLon[id] = natalChart.planets[id].ecl;
  const startMs = srUTC.getTime();
  const days = Math.ceil(SOLAR_YEAR_MS / 86400000) + 1;
  const hits = [];
  let prev = null;
  for (let i = 0; i <= days; i++) {
    const ms = startMs + i * 86400000;
    const d = new Date(ms);
    const tlon = {}; for (const T of TRANSIT_PLANETS) tlon[T] = eclLonAt(SR.PL_META[T].body, d);
    const cur = {};
    for (const T of TRANSIT_PLANETS) {
      for (const N of SR.PL_IDS) {
        const delta = norm180(tlon[T] - natalLon[N]);
        for (const asp of ASPS) {
          const targets = asp.angle === 0 ? [0] : asp.angle === 180 ? [180] : [asp.angle, -asp.angle];
          for (const tg of targets) {
            const k = T + '|' + N + '|' + asp.key + '|' + tg;
            const signed = norm180(delta - tg);
            cur[k] = signed;
            if (prev && prev[k] != null && Math.sign(signed) !== Math.sign(prev[k]) && Math.abs(signed - prev[k]) < 6) {
              const f = prev[k] / (prev[k] - signed);
              hits.push({ T, N, asp, ms: startMs + (i - 1 + f) * 86400000 });
            }
          }
        }
      }
    }
    prev = cur;
  }
  // de-dup near-identical hits (same pair within ~3 days), keep chronological
  hits.sort((a, b) => a.ms - b.ms);
  const out = [];
  for (const h of hits) {
    const dup = out.find((o) => o.T === h.T && o.N === h.N && o.asp.key === h.asp.key && Math.abs(o.ms - h.ms) < 3 * 86400000);
    if (!dup) out.push(h);
  }
  return out;
}

// ═══════════════════════════════════════════════════════
// SOLAR-ARC DIRECTIONS active during the year
// arc = progressed-Sun longitude (age days after birth) − natal Sun.
// directed[P] = natal[P] + arc; find aspects to natal points within orb.
// ═══════════════════════════════════════════════════════
function solarArc(birthUTC, ageYears, natalSun) {
  const progSun = eclLonAt('Sun', new Date(birthUTC.getTime() + ageYears * 86400000));
  return norm180(progSun - natalSun); // ~ ageYears degrees
}

function computeDirections(natalChart, birthUTC, ageYears) {
  const natalSun = natalChart.planets.sun.ecl;
  const arc = solarArc(birthUTC, ageYears, natalSun);
  const arcNext = solarArc(birthUTC, ageYears + 1, natalSun);
  const dArc = arcNext - arc; // ≈ +1°/yr

  // targets to direct ONTO: natal planets (+ angles if houses valid)
  const targets = SR.PL_IDS.map((id) => ({ id, lon: natalChart.planets[id].ecl, kind: 'planet' }));
  if (natalChart.housesValid === true) {
    targets.push({ id: 'asc', lon: natalChart.asc, kind: 'angle' });
    targets.push({ id: 'mc', lon: natalChart.mc, kind: 'angle' });
  }

  const ORB = 1.6;
  const res = [];
  for (const P of SR.PL_IDS) {
    const baseDir = natalChart.planets[P].ecl + arc;
    for (const tgt of targets) {
      if (tgt.kind === 'planet' && tgt.id === P) continue; // skip self-conjunction at age 0
      const delta = norm180(baseDir - tgt.lon);
      for (const asp of ASPS) {
        const angTargets = asp.angle === 0 ? [0] : asp.angle === 180 ? [180] : [asp.angle, -asp.angle];
        for (const at of angTargets) {
          const orbNow = norm180(delta - at);
          if (Math.abs(orbNow) <= ORB) {
            // does it perfect within the year? compare orb at age+1
            const deltaNext = norm180((natalChart.planets[P].ecl + arc + dArc) - tgt.lon);
            const orbNext = norm180(deltaNext - at);
            const perfects = Math.sign(orbNow) !== Math.sign(orbNext);
            let when = null;
            if (perfects) {
              const f = Math.abs(orbNow) / (Math.abs(orbNow) + Math.abs(orbNext)); // fraction of the year
              when = f;
            }
            res.push({ P, tgt, asp, orb: Math.abs(orbNow), perfects, when, applying: Math.abs(orbNext) < Math.abs(orbNow) });
            break;
          }
        }
      }
    }
  }
  res.sort((a, b) => a.orb - b.orb);
  return { arc, list: res.slice(0, 10) };
}

// ═══════════════════════════════════════════════════════
// MAIN COMPUTE
// ═══════════════════════════════════════════════════════
function computeSolar(birth, year, srCity) {
  const natalChart = SR.computeRealChart(SR.resolveBirthForChart(birth));
  const natalSun = natalChart.planets.sun.ecl;
  const srUTC = findSolarReturnUTC(natalSun, year, birth.month, birth.day);
  if (!srUTC) throw new Error('SR moment not found');

  const srChart = chartFromUTC(srUTC, srCity);
  const ageYears = (srUTC.getTime() - birthToUTC(birth).getTime()) / SOLAR_YEAR_MS;

  // SR planets array for the wheel + lists
  const srPlanetsArr = SR.PL_IDS.map((id) => ({
    id, ...srChart.planets[id], ...SR.PL_META[id], sd: srChart.planets[id].signDeg,
  }));
  const srAspectsRaw = SR.computeAspects(Object.fromEntries(SR.PL_IDS.map((id) => [id, srChart.planets[id]])));
  const srAspects = srAspectsRaw.map(asp => ({ ...asp, range: computeSRaspectRange(asp.p1, asp.p2, asp.aspKey, srUTC) }));

  // year theme + tone + ruler
  const sunHouse = srChart.planets.sun.house;
  const moonHouse = srChart.planets.moon.house;
  const ascSignIdx = Math.floor(norm360(srChart.asc) / 30);
  const rulerId = SIGN_RULER[ascSignIdx];
  const rulerHouse = srChart.planets[rulerId].house;

  // stellium — house with ≥3 SR planets
  const houseCount = {};
  for (const id of SR.PL_IDS) { const h = srChart.planets[id].house; houseCount[h] = (houseCount[h] || 0) + 1; }
  let stellium = null;
  for (const h of Object.keys(houseCount)) if (houseCount[h] >= 3 && (!stellium || houseCount[h] > stellium.n)) stellium = { house: +h, n: houseCount[h] };

  // ── KEY ACTIVATIONS ──
  // (a) SR planets conjunct an SR angle  (b) natal planets brought to an SR angle
  const angles = [
    { id: 'asc', lon: srChart.asc, ru: 'Асцендент соляра', en: 'SR Ascendant', ab: 'ASC' },
    { id: 'mc', lon: srChart.mc, ru: 'MC соляра', en: 'SR Midheaven', ab: 'MC' },
    { id: 'dc', lon: srChart.dc, ru: 'Десцендент соляра', en: 'SR Descendant', ab: 'DC' },
    { id: 'ic', lon: srChart.ic, ru: 'IC соляра', en: 'SR Imum Coeli', ab: 'IC' },
  ];
  const activations = [];
  for (const ang of angles) {
    for (const id of SR.PL_IDS) {
      const o = Math.abs(norm180(srChart.planets[id].ecl - ang.lon));
      if (o <= 5) activations.push({ kind: 'sr', planet: id, ang, orb: o });
    }
    for (const id of SR.PL_IDS) {
      const o = Math.abs(norm180(natalChart.planets[id].ecl - ang.lon));
      if (o <= 2.5) activations.push({ kind: 'natal', planet: id, ang, orb: o });
    }
  }
  activations.sort((a, b) => a.orb - b.orb);

  // ── NATAL OVERLAY ("второй план"): where SR Asc falls in natal houses ──
  let ascNatalHouse = null;
  if (natalChart.housesValid === true) ascNatalHouse = SR.getPlanetHouse(srChart.asc, natalChart.cusps);

  // SR Sun dropped into the natal houses — where the year's vitality lands.
  let sunNatalHouse = null;
  if (natalChart.housesValid === true) sunNatalHouse = SR.getPlanetHouse(srChart.planets.sun.ecl, natalChart.cusps);

  // SR Midheaven projected into the natal houses — the year's "goals" axis
  // (the MC is nearly as telling as the Ascendant in solar-return work).
  let mcNatalHouse = null;
  if (natalChart.housesValid === true) mcNatalHouse = SR.getPlanetHouse(srChart.mc, natalChart.cusps);

  // ── BI-WHEEL OVERLAY: natal planets + SR↔natal cross-aspects ──
  const natalPlanetsArr = SR.PL_IDS.map((id) => ({
    id, ...natalChart.planets[id], ...SR.PL_META[id], sd: natalChart.planets[id].signDeg,
  }));
  const crossAspects = computeCrossAspects(srPlanetsArr, natalPlanetsArr);

  // SR planets conjunct natal planets (year activates natal themes)
  const srToNatal = [];
  for (const a of SR.PL_IDS) {
    for (const b of SR.PL_IDS) {
      const o = Math.abs(norm180(srChart.planets[a].ecl - natalChart.planets[b].ecl));
      if (o <= 2) srToNatal.push({ sr: a, nat: b, orb: o });
    }
  }
  srToNatal.sort((x, y) => x.orb - y.orb);

  // ── ACTIVE SPHERES — rank houses by SR emphasis (needs valid houses) ──
  // Sun weighted heaviest; personal planets > social > outer; angular houses
  // amplified, cadent damped; the year-ruler's house gets a small bonus.
  const PLW = { sun: 2.6, moon: 2.4, mercury: 1.8, venus: 1.9, mars: 1.9, jupiter: 1.6, saturn: 1.7, uranus: 1.15, neptune: 1.15, pluto: 1.3 };
  const isAngular = (h) => h === 1 || h === 4 || h === 7 || h === 10;
  const isSucc = (h) => h === 2 || h === 5 || h === 8 || h === 11;
  const sphereScore = {}, spherePlanets = {};
  for (let h = 1; h <= 12; h++) { sphereScore[h] = 0; spherePlanets[h] = []; }
  for (const id of SR.PL_IDS) {
    const h = srChart.planets[id].house;
    const w = isAngular(h) ? 1.45 : isSucc(h) ? 1.0 : 0.82;
    sphereScore[h] += (PLW[id] || 1.2) * w;
    spherePlanets[h].push(id);
  }
  sphereScore[rulerHouse] += 1.4;
  const maxSphere = Math.max(1e-6, ...Object.values(sphereScore));
  let spheres = [];
  for (let h = 1; h <= 12; h++) spheres.push({ house: h, score: sphereScore[h], pct: Math.round((sphereScore[h] / maxSphere) * 100), planets: spherePlanets[h], isSun: h === sunHouse, isRuler: h === rulerHouse });
  spheres = spheres.filter((s) => s.planets.length > 0 || s.isSun);
  spheres.sort((a, b) => b.score - a.score);

  return {
    srUTC, natalChart, srChart, srPlanetsArr, srAspects,
    natalPlanetsArr, crossAspects, sunNatalHouse,
    sunHouse, moonHouse, ascSignIdx, rulerId, rulerHouse, stellium,
    activations, ascNatalHouse, mcNatalHouse, srToNatal: srToNatal.slice(0, 6), spheres,
    age: Math.round(ageYears),
    periodStart: srUTC, periodEnd: new Date(srUTC.getTime() + SOLAR_YEAR_MS),
    exact: birth.timeMode === 'exact',
  };
}

// ═══════════════════════════════════════════════════════
// INTERP LOOKUP
// ═══════════════════════════════════════════════════════
function soInterp(lang) { return (window.SOLAR_INTERP && window.SOLAR_INTERP[lang === 'en' ? 'en' : 'ru']) || null; }

function fmtPeriod(d1, d2, lang) {
  const en = lang === 'en';
  const M = en ? MONTHS_EN : MONTHS_RU;
  const a = en ? `${M[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()}` : `${d1.getDate()} ${M[d1.getMonth()]} ${d1.getFullYear()}`;
  const b = en ? `${M[d2.getMonth()]} ${d2.getDate()}, ${d2.getFullYear()}` : `${d2.getDate()} ${M[d2.getMonth()]} ${d2.getFullYear()}`;
  return `${a} — ${b}`;
}
function fmtDay(ms, lang) {
  const d = new Date(ms); const en = lang === 'en'; const M = en ? MONTHS_EN : MONTHS_RU;
  return en ? `${M[d.getMonth()]} ${d.getDate()}` : `${d.getDate()} ${M[d.getMonth()]}`;
}

// ═══════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════
function SrIco({ name, size = 20, color = 'currentColor', sw = 1.7 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'back':   return (<svg {...c}><path d="M15 5l-7 7 7 7"/></svg>);
    case 'arrow':  return (<svg {...c}><path d="M4 12h15M13 6l6 6-6 6"/></svg>);
    case 'chev':   return (<svg {...c}><path d="M5 8l7 7 7-7"/></svg>);
    case 'chevL':  return (<svg {...c}><path d="M15 5l-7 7 7 7"/></svg>);
    case 'chevR':  return (<svg {...c}><path d="M9 5l7 7-7 7"/></svg>);
    case 'pin':    return (<svg {...c}><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>);
    case 'expand': return (<svg {...c}><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>);
    case 'sun':    return (<svg {...c}><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9 6.6 6.6M17.4 17.4 19.1 19.1M19.1 4.9 17.4 6.6M6.6 17.4 4.9 19.1"/></svg>);
    case 'moon':   return (<svg {...c}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.4 6.4 0 0 0 10.5 10.5Z"/></svg>);
    case 'layers': return (<svg {...c}><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="M3 13l9 5 9-5M3 18l9 5 9-5" opacity="0.55"/></svg>);
    case 'aspects':return (<svg {...c}><circle cx="12" cy="12" r="9"/><path d="M12 5.5 18.2 16H5.8Z"/></svg>);
    case 'spheres':return (<svg {...c}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill={color} stroke="none"/></svg>);
    case 'transit':return (<svg {...c}><circle cx="12" cy="12" r="2.4"/><ellipse cx="12" cy="12" rx="9.2" ry="4" transform="rotate(28 12 12)"/><circle cx="19.4" cy="8.7" r="1.4" fill={color} stroke="none"/></svg>);
    case 'arc':    return (<svg {...c}><path d="M3 19a9 9 0 0 1 17-4"/><path d="M20.4 6.2 20.4 11 15.7 10.4"/></svg>);
    case 'key':    return (<svg {...c}><circle cx="7.5" cy="14.5" r="3.5"/><path d="m10 12 7-7 2 2M14.5 7.5 16.5 9.5"/></svg>);
    case 'close':  return (<svg {...c}><path d="M6 6l12 12M18 6 6 18"/></svg>);
    default: return null;
  }
}

function PlanetGlyph({ id, size = 16 }) {
  return <SR.PGlyph id={id} size={size} color={SR.PL_META[id].col}/>;
}

// ═══════════════════════════════════════════════════════
// BI-WHEEL SVG — natal (inner) + solar return (outer) overlaid on the
// natal houses. Oriented to the natal Ascendant when houses are valid,
// else to 0° Aries. Center web = SR↔natal cross-aspects.
// ═══════════════════════════════════════════════════════
function SolarBiWheelSVG({ th, natal, sr, cross, asc, cusps, size = 300, showHouses = true, showDeg = false }) {
  const s = size / 400, cx = size / 2, cy = size / 2;
  // SR planets ride an OUTER ring beyond the zodiac axis so the interior
  // (houses + natal planets + cross-aspect web) stays uncluttered and readable.
  const R = { bg: 196 * s, srP: 176 * s, zOut: 158 * s, zIn: 132 * s, hOut: 120 * s, hIn: 100 * s, natP: 86 * s, asp: 72 * s, cir: 46 * s };
  const dark = th.effDark;

  const ASC = (showHouses && asc != null) ? asc : 0;
  const toRad = (e) => Math.PI - ((((e - ASC) % 360) + 360) % 360) * Math.PI / 180;
  const px = (e, r) => cx + r * Math.cos(toRad(e));
  const py = (e, r) => cy + r * Math.sin(toRad(e));
  const zodSeg = (e0) => {
    const e1 = e0 + 30;
    return `M${px(e0, R.zOut)} ${py(e0, R.zOut)} A${R.zOut} ${R.zOut} 0 0 0 ${px(e1, R.zOut)} ${py(e1, R.zOut)} L${px(e1, R.zIn)} ${py(e1, R.zIn)} A${R.zIn} ${R.zIn} 0 0 1 ${px(e0, R.zIn)} ${py(e0, R.zIn)}Z`;
  };

  const bgFill = dark ? '#0d0820' : '#f5f0ff';
  const zodF1 = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)';
  const zodF2 = dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.45)';
  const ln = dark ? 'rgba(255,255,255,0.18)' : 'rgba(80,50,130,0.22)';
  const lnB = dark ? 'rgba(255,255,255,0.42)' : 'rgba(80,50,130,0.5)';
  const txt = dark ? 'rgba(246,241,255,0.86)' : 'rgba(30,20,60,0.86)';
  const natClr = dark ? 'rgba(200,192,225,0.78)' : 'rgba(70,55,110,0.7)'; // natal = muted backdrop
  const ringFill = dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)';
  const innerFill = dark ? 'rgba(8,4,24,0.92)' : 'rgba(245,240,255,0.92)';

  // radial de-clustering within one ring
  const offsets = (arr, gap, step) => {
    const sorted = [...arr].sort((a, b) => a.ecl - b.ecl);
    const off = {};
    for (let i = 0; i < sorted.length; i++) {
      let o = 0;
      for (let j = 0; j < i; j++) {
        const diff = Math.min(Math.abs(sorted[i].ecl - sorted[j].ecl), 360 - Math.abs(sorted[i].ecl - sorted[j].ecl));
        if (diff < gap) { o = off[sorted[j].id] === 0 ? step : (off[sorted[j].id] > 0 ? -step : step); break; }
      }
      off[sorted[i].id] = o;
    }
    return off;
  };
  const offN = offsets(natal, 11, 12 * s), offS = offsets(sr, 11, 11 * s);
  const houseCusps = showHouses ? (cusps || []) : [];

  const ring = (arr, baseR, off, useOwnColor) => arr.map((p) => {
    const r = baseR + (off[p.id] || 0);
    const x = px(p.ecl, r), y = py(p.ecl, r);
    const col = useOwnColor ? p.col : natClr;
    return (
      <g key={p.id}>
        {p.id === 'pluto'
          ? SR.PlutoWheelMark({ x, y: showDeg ? y - 4.5 * s : y, fpx: (useOwnColor ? 12 : 10.5) * s, s, color: col })
          : <text x={x} y={showDeg ? y - 4.5 * s : y} textAnchor="middle" dominantBaseline="central" fontSize={(useOwnColor ? 12 : 10.5) * s} fill={col} style={{ fontFamily: 'serif', fontWeight: useOwnColor ? 'bold' : 'normal' }}>{p.g}{p.ret ? <tspan fontSize={7 * s} dx={0.5 * s} style={{ fontFamily: 'sans-serif' }}>R</tspan> : null}</text>}
        {showDeg && <text x={x} y={y + 6.5 * s} textAnchor="middle" dominantBaseline="central" fontSize={7 * s} fill={txt} opacity={0.8} style={{ fontFamily: 'sans-serif' }}>{p.sd}°</text>}
      </g>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      <circle cx={cx} cy={cy} r={R.bg} fill={bgFill}/>
      {SR.ZS.map((z, i) => <path key={z.e} d={zodSeg(z.e)} fill={i % 2 === 0 ? zodF1 : zodF2} stroke={ln} strokeWidth={0.5 * s}/>)}
      {SR.ZS.map((z) => <line key={'d' + z.e} x1={px(z.e, R.zOut)} y1={py(z.e, R.zOut)} x2={px(z.e, R.zIn)} y2={py(z.e, R.zIn)} stroke={lnB} strokeWidth={0.8 * s}/>)}
      <circle cx={cx} cy={cy} r={R.zOut} fill="none" stroke={ln} strokeWidth={0.8 * s}/>
      <circle cx={cx} cy={cy} r={R.zIn} fill="none" stroke={ln} strokeWidth={0.8 * s}/>
      {SR.ZS.map((z) => {
        const m = z.e + 15, r = (R.zOut + R.zIn) / 2;
        return <text key={'g' + z.e} x={px(m, r)} y={py(m, r)} textAnchor="middle" dominantBaseline="central" fontSize={11 * s} fill={txt} style={{ fontFamily: 'serif' }}>{z.g}</text>;
      })}

      {/* natal house band + cusps */}
      {showHouses && <circle cx={cx} cy={cy} r={R.hOut} fill={ringFill} stroke={ln} strokeWidth={0.7 * s}/>}
      {showHouses && <circle cx={cx} cy={cy} r={R.hIn} fill="none" stroke={ln} strokeWidth={0.7 * s}/>}
      {houseCusps.map((e, i) => {
        const main = i % 3 === 0;
        return <line key={'h' + i} x1={px(e, R.zIn)} y1={py(e, R.zIn)} x2={px(e, R.cir)} y2={py(e, R.cir)} stroke={main ? lnB : ln} strokeWidth={(main ? 1.2 : 0.6) * s} strokeDasharray={main ? undefined : `${3 * s} ${3 * s}`}/>;
      })}
      {houseCusps.map((e, i) => {
        const next = houseCusps[(i + 1) % 12], diff = ((next - e) + 360) % 360, mid = e + diff / 2;
        const r = (R.hOut + R.hIn) / 2;
        return <text key={'hn' + i} x={px(mid, r)} y={py(mid, r)} textAnchor="middle" dominantBaseline="central" fontSize={8.5 * s} fill={txt} opacity={0.62} style={{ fontFamily: 'sans-serif' }}>{i + 1}</text>;
      })}

      {/* guide rings */}
      <circle cx={cx} cy={cy} r={R.srP} fill="none" stroke={th.gold} strokeWidth={0.8 * s} opacity={0.32} strokeDasharray={`${1.5 * s} ${3 * s}`}/>
      <circle cx={cx} cy={cy} r={R.natP} fill="none" stroke={natClr} strokeWidth={0.8 * s} opacity={0.35} strokeDasharray={`${1.5 * s} ${3 * s}`}/>
      {/* radial ticks linking each outer SR planet back to its exact zodiac degree */}
      {sr.map((p) => <line key={'srt' + p.id} x1={px(p.ecl, R.zOut)} y1={py(p.ecl, R.zOut)} x2={px(p.ecl, R.srP - 9 * s)} y2={py(p.ecl, R.srP - 9 * s)} stroke={th.gold} strokeWidth={0.7 * s} opacity={0.42}/>)}

      {/* cross-aspect web */}
      {(cross || []).map((c, i) => {
        const a = sr.find((p) => p.id === c.sr), b = natal.find((p) => p.id === c.nat);
        if (!a || !b) return null;
        return <line key={'x' + i} x1={px(a.ecl, R.asp)} y1={py(a.ecl, R.asp)} x2={px(b.ecl, R.asp)} y2={py(b.ecl, R.asp)} stroke={c.asp.col} strokeWidth={(c.asp.key === 'sextile' ? 0.9 : 1.1) * s} opacity={0.6}/>;
      })}

      <circle cx={cx} cy={cy} r={R.cir} fill={innerFill} stroke={ln} strokeWidth={0.8 * s}/>
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={15 * s} fill={th.gold} style={{ fontFamily: 'serif' }} opacity={0.9}>☉</text>

      {ring(sr, R.srP, offS, true)}
      {ring(natal, R.natP, offN, false)}

      {showHouses && asc != null && [
        { lbl: 'AC', e: asc, off: [-14 * s, 0] },
        { lbl: 'DC', e: (asc + 180) % 360, off: [14 * s, 0] },
        { lbl: 'IC', e: cusps && cusps[3] != null ? cusps[3] : 0, off: [0, 14 * s] },
        { lbl: 'MC', e: cusps && cusps[9] != null ? cusps[9] : 0, off: [0, -14 * s] },
      ].map(({ lbl, e, off }) => (
        <text key={lbl} x={px(e, R.bg - 4 * s) + off[0]} y={py(e, R.bg - 4 * s) + off[1]} textAnchor="middle" dominantBaseline="central" fontSize={9 * s} fill={lnB} fontWeight="700" style={{ fontFamily: 'sans-serif' }}>{lbl}</text>
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// INTAKE SCREEN — choose solar year + location
// ═══════════════════════════════════════════════════════
function SolarIntakeScreen({ th, lang, birth, userName, year, onYear, srCity, onCity, onBuild, priceTag }) {
  const en = lang === 'en';
  const [cityOpen, setCityOpen] = useState(false);
  const nowY = new Date().getFullYear();
  const minY = birth.year + 1;
  const maxY = nowY + 6;

  // preview period for the chosen year (cheap: just the SR date is ~birthday)
  const natalSun = useRef(null);
  const [period, setPeriod] = useState(null);
  useEffect(() => {
    try {
      if (natalSun.current == null) {
        const nc = SR.computeRealChart(SR.resolveBirthForChart(birth));
        natalSun.current = nc.planets.sun.ecl;
      }
      const sr = findSolarReturnUTC(natalSun.current, year, birth.month, birth.day);
      if (sr) setPeriod({ a: sr, b: new Date(sr.getTime() + SOLAR_YEAR_MS) });
    } catch (e) { setPeriod(null); }
  }, [year, birth]);

  const age = year - birth.year;
  const isBirthCity = srCity && birth.city && srCity.en === birth.city.en && srCity.reg === birth.city.reg;
  // Only nudge when residence wasn't deliberately set in the profile.
  const residenceUnset = !birth.residence;

  const stepBtn = (dir, disabled) => (
    <button onClick={() => !disabled && onYear(year + dir)} disabled={disabled} style={{
      width: 46, height: 46, borderRadius: 999, border: `1px solid ${th.glassBorder}`,
      background: disabled ? 'transparent' : th.chip, color: disabled ? th.muted : th.ink,
      cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, opacity: disabled ? 0.4 : 1, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
    }}>
      <SrIco name={dir < 0 ? 'chevL' : 'chevR'} size={20} color={disabled ? th.muted : th.ink} sw={2}/>
    </button>
  );

  return (
    <div style={{ padding: '8px 18px 28px', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 21, color: th.ink, marginBottom: 4, lineHeight: 1.2 }}>{en ? 'Your year ahead' : 'Твой год вперёд'}</div>
      <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, color: th.inkSoft, marginBottom: 20, lineHeight: 1.45, textWrap: 'pretty' }}>
        {en ? 'A solar return is cast for the exact moment the Sun comes back to its birth position — your astrological new year, from one birthday to the next.' : 'Соляр строится на точный момент, когда Солнце возвращается в положение при рождении — твой астрологический новый год, от дня рождения до дня рождения.'}
      </div>

      {/* YEAR STEPPER */}
      <div style={{ background: th.glassStrong, border: `1px solid ${th.glassBorder}`, borderRadius: 22, padding: '20px 18px 18px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', marginBottom: 14 }}>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: th.muted, marginBottom: 12, textAlign: 'center' }}>{en ? 'Solar year' : 'Год соляра'}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          {stepBtn(-1, year <= minY)}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 700, fontSize: 44, lineHeight: 1, color: th.ink, letterSpacing: -1 }}>{year}<span style={{ color: th.muted, fontWeight: 500 }}>–{String(year + 1).slice(2)}</span></div>
            <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 11.5, color: th.glyphClr, marginTop: 6 }}>{en ? `turning ${age}` : `тебе исполнится ${age}`}</div>
          </div>
          {stepBtn(1, year >= maxY)}
        </div>
        {period && (
          <div style={{ marginTop: 14, paddingTop: 13, borderTop: `1px solid ${th.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <SrIco name="sun" size={14} color={th.gold} sw={1.6}/>
            <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, color: th.inkSoft, fontWeight: 600 }}>{fmtPeriod(period.a, period.b, lang)}</span>
          </div>
        )}
      </div>

      {/* LOCATION */}
      <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: th.muted, margin: '6px 0 8px 4px' }}>{en ? 'Current place of residence' : 'Текущее место жительства'}</div>
      <button onClick={() => setCityOpen((v) => !v)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer', textAlign: 'left',
        background: th.glass, border: `1px solid ${cityOpen ? th.accent + '70' : th.glassBorder}`, borderRadius: 16,
        padding: '13px 16px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', color: th.ink,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${th.accent}22`, border: `1px solid ${th.accent}40` }}>
          <SrIco name="pin" size={20} color={th.glyphClr}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 17, color: th.ink, lineHeight: 1.1 }}>{srCity ? (en ? srCity.en : srCity.ru) : (en ? 'Select city' : 'Выбери город')}</div>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: th.muted, marginTop: 2 }}>{isBirthCity ? (en ? 'Birthplace' : 'Город рождения') : (en ? 'Place of residence' : 'Место жительства')}</div>
        </div>
        <div style={{ transform: cityOpen ? 'rotate(180deg)' : 'none', transition: 'transform .22s', flexShrink: 0 }}><SrIco name="chev" size={18} color={th.muted}/></div>
      </button>
      {cityOpen && (
        <div className="astro-in-f" style={{ marginTop: 2 }}>
          {!isBirthCity && birth.city && (
            <button onClick={() => { onCity(birth.city); setCityOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '8px 2px', background: 'none', border: 'none', cursor: 'pointer', color: th.glyphClr, fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 12 }}>
              <SrIco name="back" size={13} color={th.glyphClr} sw={1.7}/>{en ? 'Reset to birthplace' : 'Вернуть город рождения'}
            </button>
          )}
          {SR.CitySearch && <SR.CitySearch th={th} lang={lang} value={srCity} onPick={(c) => { onCity(c); setCityOpen(false); }}/>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: `${th.accent}12`, border: `1px solid ${th.accent}30`, margin: '16px 0 0' }}>
        <span style={{ flexShrink: 0, fontSize: 13, color: th.glyphClr, lineHeight: 1.4 }}>✦</span>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, lineHeight: 1.5, color: th.inkSoft, textWrap: 'pretty' }}>
          {birth.timeMode === 'exact'
            ? (en ? 'The chart is cast for the place you actually live this year — the city strongly shifts the Ascendant and houses, and with them the whole theme of the year. A short birthday trip doesn\u2019t count: use your home base.' : 'Соляр строим на место, где ты реально живёшь этот год: город сильно сдвигает Асцендент и дома, а с ними и всю тему года. Короткая поездка на день рождения роли не играет — бери свой основной город.')
            : (en ? 'Your birth time isn\u2019t exact, so the return moment — and the SR Ascendant, houses and Moon — are approximate. Planet signs and aspects stay reliable.' : 'Время рождения неточное, поэтому момент соляра — а с ним Асцендент, дома и Луна — ориентировочны. Знаки планет и аспекты надёжны.')}
        </div>
      </div>

      {isBirthCity && residenceUnset && (
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: 'rgba(212,144,26,0.13)', border: '1px solid rgba(212,144,26,0.38)', margin: '10px 0 0' }}>
          <span style={{ flexShrink: 0, fontSize: 13, color: '#D4901A', lineHeight: 1.4 }}>⚠</span>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, lineHeight: 1.5, color: th.inkSoft, textWrap: 'pretty' }}>
            {en ? 'This is still your birthplace. The year\u2019s theme changes completely with the city — set where you actually live now, or the Ascendant (and the whole reading) will be wrong.' : 'Сейчас стоит город рождения. Тема года полностью зависит от города — укажи, где ты живёшь сейчас, иначе Асцендент (и всё толкование) будут не про тебя.'}
          </div>
        </div>
      )}

      <button disabled={!srCity} onClick={srCity ? onBuild : undefined} style={{
        display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: 8, height: 52, marginTop: 20,
        borderRadius: 999, border: 'none', cursor: srCity ? 'pointer' : 'default',
        background: srCity ? th.accent : (th.effDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'),
        color: srCity ? '#fff' : th.muted, fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 15.5,
        boxShadow: srCity ? `0 8px 26px ${th.accentGlow}` : 'none',
      }}>
        <SrIco name="sun" size={18} color={srCity ? '#fff' : th.muted} sw={1.8}/>{en ? 'Build solar return' : 'Построить соляр'}{srCity ? priceTag : null}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// READING SCREEN
// ═══════════════════════════════════════════════════════
function Chevron({ th, open }) {
  return (<svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke={th.muted} strokeWidth={1.8} strokeLinecap="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .22s' }}><path d="M3 6l5 5 5-5"/></svg>);
}

function SolarChartScreen({ th, lang, birth, year, srCity, onExpand }) {
  const en = lang === 'en';
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [openP, setOpenP] = useState(null);
  const [openA, setOpenA] = useState(null);

  useEffect(() => {
    setData(null); setErr(null);
    const id = setTimeout(() => {
      try { setData(computeSolar(birth, year, srCity)); }
      catch (e) { setErr(e.message); }
    }, 30);
    return () => clearTimeout(id);
  }, [birth, year, srCity]);

  // Отмечаем, что пользователь открыл соляр на этот год (для уведомлений).
  useEffect(() => {
    if (window.AstroAPI) window.AstroAPI.markSolarViewed(year);
  }, [year]);

  if (err) return <div style={{ padding: '40px 18px', textAlign: 'center', position: 'relative', zIndex: 1 }}><div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.muted }}>{en ? 'Calc error: ' : 'Ошибка расчёта: '}{err}</div></div>;
  if (!data) return (
    <div style={{ padding: '70px 18px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ width: 30, height: 30, margin: '0 auto 14px', borderRadius: '50%', border: `2.5px solid ${th.muted}`, borderTopColor: 'transparent', animation: 'astroSpin .7s linear infinite' }}/>
      <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.muted }}>{en ? 'Casting your solar return…' : 'Строю твой соляр…'}</div>
    </div>
  );

  const d = soInterp(lang);
  const HT = en ? SR_HOUSE_THEME_EN : SR_HOUSE_THEME_RU;
  const HL = en ? SR_HOUSE_EN : SR_HOUSE_RU;
  const signName = (idx) => en ? SR.SIGN_EN[idx] : SR.SIGN_NOM_RU[idx];

  const Section = ({ icon, title, children, sub }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: sub ? 3 : 10 }}>
        {icon && <SrIco name={icon} size={15} color={th.glyphClr} sw={1.6}/>}
        <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10.5, letterSpacing: 1.7, textTransform: 'uppercase', color: th.muted }}>{title}</span>
      </div>
      {sub && <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, color: th.muted, marginBottom: 10, paddingLeft: 23 }}>{sub}</div>}
      {children}
    </div>
  );
  const Card = ({ children, style }) => (
    <div style={{ background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: 18, padding: '0 16px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', ...style }}>{children}</div>
  );

  const sunHouseTxt = d && d.sunHouse[data.sunHouse];
  const ascTxt = d && d.ascSign[data.ascSignIdx];
  const ascNatalTxt = d && data.ascNatalHouse && d.ascNatalHouse[data.ascNatalHouse];
  const mainHouse = data.exact ? data.ascNatalHouse : null; // SR Asc → natal house = the year's main sphere

  return (
    <div style={{ padding: '4px 18px 34px', position: 'relative', zIndex: 1 }}>

      {/* ── HERO ── */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, background: th.chip, border: `1px solid ${th.glassBorder}`, marginBottom: 12 }}>
          <SrIco name="sun" size={13} color={th.gold} sw={1.6}/>
          <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 11, color: th.inkSoft }}>{fmtPeriod(data.periodStart, data.periodEnd, lang)}</span>
        </div>
        <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 700, fontSize: 30, lineHeight: 1.05, color: th.ink, letterSpacing: -0.5, marginBottom: 6 }}>
          {mainHouse
            ? (en ? `A year of ${HT[mainHouse]}` : `Год про ${HT[mainHouse]}`)
            : (en ? 'Your solar year' : 'Твой солярный год')}
        </div>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, color: th.muted }}>
          {mainHouse
            ? (en ? `SR Ascendant in ${signName(data.ascSignIdx)} · falls in natal House ${mainHouse}` : `Асцендент соляра ${SR_SIGN_PREP[data.ascSignIdx]} · в ${mainHouse} доме радикса`)
            : (en ? `SR Ascendant in ${signName(data.ascSignIdx)}` : `Асцендент соляра ${SR_SIGN_PREP[data.ascSignIdx]}`)}
        </div>
      </div>

      {/* ── BI-WHEEL: natal (inner) + solar return (outer) ── */}
      <button onClick={() => onExpand({ natal: data.natalPlanetsArr, sr: data.srPlanetsArr, cross: data.crossAspects, asc: data.natalChart.asc, cusps: data.natalChart.cusps, showHouses: data.exact, title: en ? 'Solar return on natal' : 'Соляр на натал' })}
        style={{ display: 'block', width: '100%', padding: 0, margin: '0 0 4px', border: 'none', background: 'none', cursor: 'zoom-in', position: 'relative' }}>
        <SolarBiWheelSVG th={th} natal={data.natalPlanetsArr} sr={data.srPlanetsArr} cross={data.crossAspects} asc={data.natalChart.asc} cusps={data.natalChart.cusps} size={300} showHouses={data.exact}/>
        <span style={{ position: 'absolute', top: 6, right: 6, width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: th.chip, border: `1px solid ${th.glassBorder}`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          <SrIco name="expand" size={15} color={th.ink} sw={1.7}/>
        </span>
      </button>
      {/* legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: '"Manrope",sans-serif', fontSize: 11, fontWeight: 600, color: th.inkSoft }}>
          <span style={{ width: 16, height: 0, borderTop: `2px solid ${th.gold}` }}/>{en ? 'Solar return' : 'Соляр'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: '"Manrope",sans-serif', fontSize: 11, fontWeight: 600, color: th.muted }}>
          <span style={{ width: 16, height: 0, borderTop: `2px dashed ${th.effDark ? 'rgba(200,192,225,0.78)' : 'rgba(70,55,110,0.7)'}` }}/>{en ? 'Natal' : 'Натал'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: th.muted }}>{en ? srCity.en : srCity.ru}</span>
        <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: th.muted }}>{fmtDay(data.srUTC.getTime(), lang)} {data.srUTC.getFullYear()}</span>
      </div>

      {/* ── caveat for non-exact ── */}
      {!data.exact && (
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: 'rgba(242,192,96,0.12)', border: '1px solid rgba(242,192,96,0.3)', marginBottom: 20 }}>
          <span style={{ flexShrink: 0, fontSize: 13, color: '#F2C060', lineHeight: 1.4 }}>☽</span>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, lineHeight: 1.5, color: th.inkSoft, textWrap: 'pretty' }}>
            {en ? 'Without an exact birth time the return moment shifts, so the Ascendant, houses and Moon below are approximate — read them as direction, not precision.' : 'Без точного времени рождения момент соляра смещается, поэтому Асцендент, дома и Луна ниже приблизительны — это направление, а не точность.'}
          </div>
        </div>
      )}

      {/* ── ГЛАВНАЯ ТЕМА ГОДА — проекция Асцендента соляра в дом радикса ── */}
      <Section icon="key" title={en ? 'The heart of the year' : 'Главная тема года'} sub={en ? 'Where the Solar Return Ascendant lands among your natal houses — the sphere the whole year revolves around' : 'Куда Асцендент соляра попадает в дома радикса — сфера, вокруг которой строится весь год'}>
        {mainHouse ? (
          <Card style={{ padding: '16px 16px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${th.gold}22`, border: `1px solid ${th.gold}55`, fontFamily: '"Manrope",sans-serif', fontWeight: 800, fontSize: 11.5, color: th.gold }}>ASC</div>
              <div>
                <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 17, color: th.ink, lineHeight: 1.1 }}>{en ? `SR Ascendant in natal House ${mainHouse}` : `Асцендент соляра в ${mainHouse} доме радикса`}</div>
                <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1, color: th.gold, marginTop: 3 }}>{(en ? SR_HOUSE_EN : SR_HOUSE_RU)[mainHouse].toUpperCase()}</div>
              </div>
            </div>
            <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13.5, lineHeight: 1.6, color: th.inkSoft, margin: '0 0 14px', textWrap: 'pretty' }}>{ascNatalTxt}</p>
          </Card>
        ) : (
          <Card style={{ padding: '14px 16px' }}>
            <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.6, color: th.inkSoft, margin: 0, textWrap: 'pretty' }}>{en ? 'The main sphere of the year is read from where the Solar Return Ascendant falls among your natal houses — and that needs an exact birth time. The tone below and the planetary placements still hold.' : 'Главная сфера года читается по тому, в какой дом радикса попадает Асцендент соляра, — а для этого нужно точное время рождения. Тон года ниже и расстановка планет остаются в силе.'}</p>
          </Card>
        )}
        <div style={{ height: 10 }}/>
        <Card style={{ padding: '14px 16px' }}>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1, color: th.gold, marginBottom: 6 }}>{en ? `TONE · ${signName(data.ascSignIdx).toUpperCase()} RISING` : `ТОН ГОДА · АСЦ ${SR.SIGN_NOM_RU[data.ascSignIdx].toUpperCase()}`}</div>
          <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.6, color: th.inkSoft, margin: 0, textWrap: 'pretty' }}>{ascTxt}</p>
        </Card>
        {mainHouse && data.mcNatalHouse && (
          <React.Fragment>
            <div style={{ height: 10 }}/>
            <Card style={{ padding: '14px 16px' }}>
              <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1, color: th.glyphClr, marginBottom: 6 }}>{en ? `GOALS · MC IN NATAL HOUSE ${data.mcNatalHouse}` : `ЦЕЛИ · MC В ${data.mcNatalHouse} ДОМЕ РАДИКСА`}</div>
              <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.6, color: th.inkSoft, margin: 0, textWrap: 'pretty' }}>{en ? `The SR Midheaven — nearly as telling as the Ascendant — ${d.mcNatalHouse[data.mcNatalHouse]}` : `MC соляра — он не менее важен, чем Асцендент: ${d.mcNatalHouse[data.mcNatalHouse]}`}</p>
            </Card>
          </React.Fragment>
        )}
      </Section>

      {/* ── КУДА ИДЁТ ЭНЕРГИЯ ГОДА — дом солярного Солнца (фон, не главная тема) ── */}
      <Section icon="sun" title={en ? 'Where the year\u2019s energy flows' : 'Куда идёт энергия года'} sub={en ? 'The SR Sun marks where vitality and attention pour — a support to the main theme, not the theme itself' : 'Солнце соляра показывает, куда течёт жизненная сила и внимание — это фон главной темы, а не она сама'}>
        <Card style={{ padding: '16px 16px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${th.accent}24`, border: `1px solid ${th.accent}44` }}>
              <PlanetGlyph id="sun" size={19}/>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 17, color: th.ink, lineHeight: 1.1 }}>{data.exact ? (en ? `Sun in House ${data.sunHouse}` : `Солнце в ${data.sunHouse} доме`) : (en ? `Sun in ${signName(Math.floor(norm360(data.srChart.planets.sun.ecl) / 30))}` : `Солнце ${SR_SIGN_PREP[Math.floor(norm360(data.srChart.planets.sun.ecl) / 30)]}`)}</div>
              {data.exact && <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1, color: th.gold, marginTop: 3 }}>{(en ? SR_HOUSE_EN : SR_HOUSE_RU)[data.sunHouse].toUpperCase()}</div>}
            </div>
          </div>
          <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13.5, lineHeight: 1.6, color: th.inkSoft, margin: '0 0 14px', textWrap: 'pretty' }}>{sunHouseTxt}</p>
          {data.exact && data.sunNatalHouse && (
            <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.55, color: th.muted, margin: '0 0 14px', textWrap: 'pretty' }}>{en ? `In your birth chart the SR Sun lands in House ${data.sunNatalHouse}, pouring the year\u2019s vitality into your ${HT[data.sunNatalHouse]}.` : `В натальной карте Солнце соляра ложится в твой ${data.sunNatalHouse} дом — жизненная сила года идёт в сферу «${HT[data.sunNatalHouse]}».`}</p>
          )}
        </Card>
      </Section>

      {/* ── АКТИВНЫЕ СФЕРЫ ГОДА ── */}
      {data.exact && (
        <Section icon="spheres" title={en ? 'Active spheres of the year' : 'Активные сферы года'} sub={en ? 'Where the year concentrates — strongest life areas first' : 'Где год набирает плотность — сильные сферы сверху'}>
          <Card style={{ padding: '4px 16px' }}>
            {data.spheres.map((s, i, arr) => {
              const tier = s.pct >= 70 ? { t: en ? 'leading area' : 'ведущая сфера', c: th.gold }
                : s.pct >= 42 ? { t: en ? 'strong accent' : 'сильный акцент', c: th.glyphClr }
                : { t: en ? 'background' : 'фон', c: th.muted };
              const lead = s.pct >= 70;
              const showLine = s.pct >= 42;
              return (
                <div key={s.house} style={{ display: 'flex', gap: 12, padding: '13px 0', borderBottom: i < arr.length - 1 ? `1px solid ${th.glassBorder}` : 'none' }}>
                  <div style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: lead ? `${th.gold}22` : `${th.accent}18`, border: `1px solid ${lead ? th.gold + '55' : th.accent + '38'}`, fontFamily: 'var(--ds-serif)', fontWeight: 700, fontSize: 14, color: lead ? th.gold : th.glyphClr }}>{s.house}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 15.5, color: th.ink, lineHeight: 1.1 }}>{(en ? SR_HOUSE_EN : SR_HOUSE_RU)[s.house]}</span>
                      <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 8.5, letterSpacing: 0.8, textTransform: 'uppercase', color: tier.c, flexShrink: 0 }}>{tier.t}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: th.effDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', overflow: 'hidden', margin: '7px 0' }}>
                      <div style={{ height: '100%', width: `${Math.max(8, s.pct)}%`, borderRadius: 999, background: lead ? th.gold : th.accent, transition: 'width .5s cubic-bezier(.2,.7,.3,1)' }}/>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                        {s.planets.map((pid) => <SR.PGlyph key={pid} id={pid} size={13} color={SR.PL_META[pid].col}/>)}
                      </div>
                      {showLine && <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, lineHeight: 1.45, color: th.muted, textWrap: 'pretty' }}>{d.sphereShort[s.house]}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </Section>
      )}

      {/* ── ВТОРОЙ ПЛАН ── */}
      <Section icon="layers" title={en ? 'Second plan' : 'Второй план года'} sub={en ? 'The supporting storyline behind the main theme' : 'Подтекст и фон за главной темой года'}>
        <Card style={{ padding: '4px 16px' }}>
          {/* ruler of the year */}
          <div style={{ padding: '13px 0', borderBottom: `1px solid ${th.glassBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <PlanetGlyph id={data.rulerId} size={16}/>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 12.5, color: th.ink }}>{en ? 'Ruler of the year' : 'Управитель года'} · {SR.PL_META[data.rulerId][en ? 'en' : 'ru']}</span>
            </div>
            <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.55, color: th.inkSoft, textWrap: 'pretty' }}>
              {en
                ? `${SR.PL_META[data.rulerId].en}${data.exact ? ` in House ${data.rulerHouse}` : ''} ${d.rulerHouse[data.rulerHouse]}`
                : `${SR.PL_META[data.rulerId].ru}${data.exact ? ` в ${data.rulerHouse} доме` : ''} ${d.rulerHouse[data.rulerHouse]}`}
            </div>
          </div>
          {/* moon */}
          <div style={{ padding: '13px 0', borderBottom: data.stellium ? `1px solid ${th.glassBorder}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <PlanetGlyph id="moon" size={16}/>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 12.5, color: th.ink }}>{en ? 'Emotional undercurrent' : 'Эмоциональный фон'}</span>
            </div>
            <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.55, color: th.inkSoft, textWrap: 'pretty' }}>
              {en ? 'The Moon — ' : 'Луна — '}{d.moonHouse[data.moonHouse]}
            </div>
          </div>
          {/* stellium */}
          {data.stellium && (
            <div style={{ padding: '13px 0', borderBottom: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <SrIco name="key" size={15} color={th.glyphClr} sw={1.6}/>
                <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 12.5, color: th.ink }}>{en ? `Concentration · ${data.stellium.n} planets` : `Скопление · ${data.stellium.n} ${plRu(data.stellium.n, 'планета', 'планеты', 'планет')}`}</span>
              </div>
              <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.55, color: th.inkSoft, textWrap: 'pretty' }}>
                {en ? `${data.stellium.n} planets gather in House ${data.stellium.house} (${HT[data.stellium.house]}) — a highly charged area where most of the year's action concentrates.` : `${data.stellium.n} ${plRu(data.stellium.n, 'планета', 'планеты', 'планет')} собрались в ${data.stellium.house} доме (${HT[data.stellium.house]}) — самая заряженная зона года, где концентрируется большинство событий.`}
              </div>
            </div>
          )}
        </Card>
      </Section>

      {/* ── KEY ACTIVATIONS ── */}
      {data.activations.length > 0 && (
        <Section icon="key" title={en ? 'Key activations' : 'Ключевые активации'} sub={en ? 'Planets on the angles — the strongest accents of the year' : 'Планеты на углах — самые сильные акценты года'}>
          <Card style={{ padding: '0 16px' }}>
            {data.activations.slice(0, 6).map((a, i, arr) => {
              const open = openA === 'k' + i;
              const src = a.kind === 'natal' ? 'natal' : 'solar';
              const reading = d && d.angleActivation && d.angleActivation[src] && d.angleActivation[src][a.planet] && d.angleActivation[src][a.planet][a.ang.id];
              return (
                <div key={'k' + i} style={{ borderBottom: i < Math.min(arr.length, 6) - 1 ? `1px solid ${th.glassBorder}` : 'none' }}>
                  <button onClick={() => reading && setOpenA(open ? null : 'k' + i)} style={{ width: '100%', textAlign: 'left', cursor: reading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', background: 'none', border: 'none', color: th.ink }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 50, flexShrink: 0 }}>
                      <PlanetGlyph id={a.planet} size={16}/>
                      <span style={{ fontFamily: 'serif', fontSize: 12, color: th.muted }}>☌</span>
                      <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 11, color: th.glyphClr }}>{a.ang.ab}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 12.5, color: th.ink }}>
                        {a.kind === 'natal' ? (en ? 'Natal ' : 'Натальный ') : ''}{SR.PL_META[a.planet][en ? 'en' : 'ru']} {en ? 'on' : 'на'} {en ? a.ang.en : a.ang.ru}
                      </div>
                      <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, color: th.muted, marginTop: 1 }}>
                        {a.kind === 'natal' ? (en ? 'natal theme brought to the fore' : 'натальная тема выходит на первый план') : (en ? 'colours the whole year' : 'окрашивает весь год')} · {en ? 'orb' : 'орб'} {a.orb.toFixed(1)}°
                      </div>
                    </div>
                    {reading && <Chevron th={th} open={open}/>}
                  </button>
                  {open && reading && <div style={{ paddingBottom: 14, paddingRight: 6, fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.6, color: th.inkSoft, textWrap: 'pretty' }}>{reading}</div>}
                </div>
              );
            })}
          </Card>
        </Section>
      )}

      {/* ── СОЛЯР НА НАТАЛ — cross-aspects ── */}
      {data.crossAspects.length > 0 && (
        <Section icon="layers" title={en ? 'Solar return on natal' : 'Соляр на натал'} sub={en ? 'How the year touches your birth chart — the strongest contacts first' : 'Как год задевает твою натальную карту — сильные контакты сверху'}>
          <Card style={{ padding: '0 16px' }}>
            {data.crossAspects.slice(0, 8).map((c, i, arr) => {
              const open = openA === 'x' + i;
              const aspName = en ? c.asp.en : c.asp.ru;
              const py = d && d.planetYear;
              const tone = d && d.aspectTone[c.asp.key];
              return (
                <div key={'x' + i} style={{ borderBottom: i < Math.min(arr.length, 8) - 1 ? `1px solid ${th.glassBorder}` : 'none' }}>
                  <button onClick={() => setOpenA(open ? null : 'x' + i)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0', background: 'none', border: 'none', color: th.ink }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 56, flexShrink: 0 }}>
                      <PlanetGlyph id={c.sr} size={16}/>
                      <span style={{ fontSize: 14, lineHeight: 1, color: c.asp.col, fontFamily: 'serif' }}>{c.asp.sym}</span>
                      <span style={{ display: 'inline-flex', lineHeight: 1 }}><SR.PGlyph id={c.nat} size={15} color={th.effDark ? 'rgba(200,192,225,0.85)' : 'rgba(70,55,110,0.85)'}/></span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 12.5, color: th.ink }}>
                        {en ? `SR ${SR.PL_META[c.sr].en} ${aspName.toLowerCase()} natal ${SR.PL_META[c.nat].en}` : `Соляр. ${SR.PL_META[c.sr].ru} ${aspName.toLowerCase()} натал. ${SR.PL_META[c.nat].ru}`}
                      </div>
                      <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, color: th.muted, marginTop: 1 }}>{aspName} · {en ? 'orb' : 'орб'} {c.orb.toFixed(1)}°</div>
                    </div>
                    <Chevron th={th} open={open}/>
                  </button>
                  {open && (() => {
                    const sna = window.SOLAR_NATAL_ASPECTS;
                    const key = `${c.sr}-${c.nat}`;
                    const interp = sna && sna[en ? 'en' : 'ru']?.[key]?.[c.asp.key];
                    return (
                      <div style={{ paddingBottom: 14, paddingRight: 6, fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.6, color: th.inkSoft, textWrap: 'pretty' }}>
                        {interp || (en ? `This year's ${SR.PL_META[c.sr].en} (${py[c.sr]}) meets your natal ${SR.PL_META[c.nat].en} (${py[c.nat]}) — ${tone}` : `${SR.PL_META[c.sr].ru} этого года (${py[c.sr]}) встречает твой натальный ${SR.PL_META[c.nat].ru} (${py[c.nat]}) — ${tone}`)}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </Card>
        </Section>
      )}

      {/* ── PLANETS IN HOUSES ── */}
      <Section icon="sun" title={data.exact ? (en ? 'Planets in SR houses' : 'Планеты в домах соляра') : (en ? 'Planets in signs' : 'Планеты в знаках')}>
        <Card style={{ padding: '0 16px' }}>
          {data.srPlanetsArr.map((p, i) => {
            const open = openP === p.id;
            const planetYear = d && d.planetYear[p.id];
            const shi = window.SOLAR_HOUSE_INTERP;
            const houseInterp = data.exact && shi && shi[en ? 'en' : 'ru']?.[p.id]?.[String(p.house)];
            const houseTxt = houseInterp || (data.exact
              ? (en ? `${p.en} brings ${planetYear} into your year's ${HT[p.house]} (House ${p.house}).` : `${p.ru} приносит ${planetYear} в сферу «${HT[p.house]}» этого года (${p.house} дом).`)
              : (en ? `${p.en} carries ${planetYear} through the year, coloured by ${signName(p.signIdx)}.` : `${p.ru} несёт ${planetYear} через год, в тоне ${SR.SIGN_GEN_RU[p.signIdx]}.`));
            return (
              <div key={p.id} style={{ borderBottom: i < data.srPlanetsArr.length - 1 ? `1px solid ${th.glassBorder}` : 'none' }}>
                <button onClick={() => setOpenP(open ? null : p.id)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0', background: 'none', border: 'none', color: th.ink }}>
                  <span style={{ minWidth: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><SR.PGlyph id={p.id} size={17} color={p.col} bold/></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 13, color: th.ink, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {p[en ? 'en' : 'ru']} {p.ret && <span style={{ fontSize: 10, fontWeight: 700, color: th.muted }}>R</span>}
                      {data.exact && <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 8.5, letterSpacing: 0.6, color: th.glyphClr, background: `${th.accent}18`, border: `1px solid ${th.accent}38`, borderRadius: 4, padding: '2px 6px' }}>{HL[p.house]}</span>}
                    </div>
                    <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, color: th.muted, marginTop: 2 }}>
                      {p.signDeg}° {signName(p.signIdx)}{data.exact ? ` · ${p.house} ${en ? 'house' : 'дом'}` : ''}
                    </div>
                  </div>
                  <Chevron th={th} open={open}/>
                </button>
                {open && <div style={{ paddingBottom: 14, paddingRight: 6, fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.6, color: th.inkSoft, textWrap: 'pretty' }}>{houseTxt}</div>}
              </div>
            );
          })}
        </Card>
      </Section>

      {/* ── SR ASPECTS ── */}
      <Section icon="aspects" title={en ? 'Aspects of the year' : 'Аспекты года'} sub={en ? 'How the year\u2019s energies talk to each other' : 'Как энергии года взаимодействуют внутри'}>
        <Card style={{ padding: '0 16px' }}>
          {data.srAspects.length === 0 && <div style={{ padding: '14px 0', fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.muted }}>{en ? 'No tight aspects' : 'Нет точных аспектов'}</div>}
          {data.srAspects.map((asp, i) => {
            const open = openA === 'a' + i;
            const tone = d && d.aspectTone[asp.aspKey];
            return (
              <div key={i} style={{ borderBottom: i < data.srAspects.length - 1 ? `1px solid ${th.glassBorder}` : 'none' }}>
                {(() => {
                  const rangeTxt = asp.range ? fmtSRRange(asp.range, lang) : null;
                  const sai = window.SOLAR_ASPECTS_INTERP;
                  const aKey = srAspNormKey(asp.p1, asp.p2);
                  const interp = sai && sai[en ? 'en' : 'ru']?.[aKey]?.[asp.aspKey];
                  return (<React.Fragment>
                    <button onClick={() => setOpenA(open ? null : 'a' + i)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0', background: 'none', border: 'none', color: th.ink }}>
                      <span style={{ fontSize: 16, lineHeight: 1, color: asp.col, fontFamily: 'serif', minWidth: 20, textAlign: 'center' }}>{asp.sym}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 12.5, color: th.ink }}>{SR.PL_META[asp.p1][en ? 'en' : 'ru']} — {SR.PL_META[asp.p2][en ? 'en' : 'ru']}</div>
                        <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: th.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span>{en ? ASP_BY_KEY[asp.aspKey].en : asp.type_ru} · {en ? 'orb' : 'орб'} {asp.orb.toFixed(1)}°</span>
                          {rangeTxt && <span style={{ background: `${th.accent}20`, border: `1px solid ${th.accent}40`, borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700, letterSpacing: 0.4, color: th.glyphClr }}>{rangeTxt}</span>}
                        </div>
                      </div>
                      <Chevron th={th} open={open}/>
                    </button>
                    {open && (
                      <div style={{ paddingBottom: 14, paddingRight: 6, fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.6, color: th.inkSoft, textWrap: 'pretty' }}>
                        {interp || (en ? `${SR.PL_META[asp.p1].en} (${d.planetYear[asp.p1]}) and ${SR.PL_META[asp.p2].en} (${d.planetYear[asp.p2]}) — ${tone}` : `${SR.PL_META[asp.p1].ru} (${d.planetYear[asp.p1]}) и ${SR.PL_META[asp.p2].ru} (${d.planetYear[asp.p2]}) — ${tone}`)}
                      </div>
                    )}
                  </React.Fragment>);
                })()}
              </div>
            );
          })}
        </Card>
      </Section>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: th.gold }}/>
        <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, color: th.muted, textAlign: 'center', textWrap: 'pretty' }}>{en ? 'The solar return maps which life spheres light up this year. For exact dates, see Milestones and Aspects.' : 'Соляр показывает, какие сферы жизни активны в этом году. Точные даты — в разделах «Вехи» и «Аспекты».'}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXPANDED BI-WHEEL OVERLAY (natal + solar return)
// ═══════════════════════════════════════════════════════
function SolarExpandOverlay({ th, lang, data, onClose }) {
  const en = lang === 'en';
  const ref = useRef(null);
  const SIZE = 580;
  const natColor = th.effDark ? 'rgba(200,192,225,0.78)' : 'rgba(70,55,110,0.7)';
  useEffect(() => {
    const el = ref.current;
    if (el) { el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2; el.scrollTop = (el.scrollHeight - el.clientHeight) / 2; }
  }, []);
  return (
    <div className="astro-in-f" style={{ position: 'absolute', inset: 0, zIndex: 78, display: 'flex', flexDirection: 'column', background: th.effDark ? 'rgba(8,5,20,0.97)' : 'rgba(245,242,255,0.98)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div style={{ paddingTop: 54, flexShrink: 0 }}>
        <div style={{ height: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
          <div style={{ flex: 1, fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 15, color: th.ink }}>{data.title || (en ? 'Solar return on natal' : 'Соляр на натал')}</div>
          <button onClick={onClose} style={{ width: 33, height: 33, borderRadius: 999, border: `1px solid ${th.glassBorder}`, background: th.chip, color: th.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
            <SrIco name="close" size={15} color={th.ink} sw={1.8}/>
          </button>
        </div>
      </div>
      <div ref={ref} style={{ flex: 1, overflow: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ width: SIZE + 60, height: SIZE + 60, padding: 30, boxSizing: 'border-box' }}>
          <SolarBiWheelSVG th={th} natal={data.natal} sr={data.sr} cross={data.cross} asc={data.asc} cusps={data.cusps} size={SIZE} showHouses={data.showHouses} showDeg/>
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: '10px 18px 30px', display: 'flex', justifyContent: 'center', gap: 20 }}>
        {[[th.gold, en ? 'Solar return' : 'Соляр'], [natColor, en ? 'Natal' : 'Натал']].map(([col, nm], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 0, borderTop: `2px ${i === 0 ? 'solid' : 'dashed'} ${col}` }}/>
            <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, fontWeight: 600, color: th.inkSoft }}>{nm}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════
Object.assign(window, { SolarIntakeScreen, SolarChartScreen, SolarExpandOverlay, SolarBiWheelSVG });
