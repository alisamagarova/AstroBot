// horar-engine.js — хорарная астрология (традиция, по У. Лилли).
// Возвращает СТРУКТУРУ суждения; локализацию текста делает horar.jsx.
// Использует глобальные: Astronomy, computeRealChart.
(function () {
  const norm360 = x => ((x % 360) + 360) % 360;
  const norm180 = x => ((x % 360) + 540) % 360 - 180;

  const SEVEN = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const BODY = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn' };
  // Традиционные управители знаков (Овен..Рыбы)
  const SIGN_RULER = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
  // Половины орбисов (moiety) классических планет — для суммарного орба аспекта
  const MOIETY = { sun: 7.5, moon: 6, mercury: 3.5, venus: 3.5, mars: 4, jupiter: 4.5, saturn: 4.5 };
  const ASPECTS = [
    { key: 'conjunction', angle: 0,   harmonious: true  },
    { key: 'sextile',     angle: 60,  harmonious: true  },
    { key: 'square',      angle: 90,  harmonious: false },
    { key: 'trine',       angle: 120, harmonious: true  },
    { key: 'opposition',  angle: 180, harmonious: false },
  ];

  // ── Темы → дом квесит (дом вопроса) ──
  const TOPICS = [
    { id: 'love',     house: 7,                  ru: 'Любовь и отношения',           en: 'Love & relationships' },
    { id: 'marriage', house: 7,                  ru: 'Брак / партнёр',               en: 'Marriage / partner' },
    { id: 'money',    house: 2,                  ru: 'Деньги и имущество',           en: 'Money & possessions' },
    // Работа: основной квезит — 10 дом (работа/должность/работодатель);
    // дополнительно 6 дом (условия труда) и 2 дом (заработок).
    { id: 'work',     house: 10, secondary: [6, 2], ru: 'Работа / карьера',          en: 'Work / career' },
    { id: 'health',   house: 6,                  ru: 'Здоровье / болезнь',           en: 'Health / illness' },
    { id: 'travel',   house: 9,                  ru: 'Дальняя поездка / учёба / суд',en: 'Travel / study / law' },
    { id: 'home',     house: 4,                  ru: 'Дом / недвижимость / семья',   en: 'Home / property / family' },
    { id: 'children', house: 5,                  ru: 'Дети / беременность / роман',  en: 'Children / pregnancy / romance' },
    { id: 'friends',  house: 11,                 ru: 'Друзья / надежды / выигрыш',   en: 'Friends / hopes / gains' },
    { id: 'enemies',  house: 12,                 ru: 'Скрытое / тайные враги',       en: 'Hidden / secret enemies' },
    { id: 'lost',     house: 2,                  ru: 'Потерянная вещь',              en: 'Lost object' },
    { id: 'other',    house: 7,                  ru: 'Другой человек / оппонент',    en: 'Another person / opponent' },
  ];

  const lonAt = (body, jsDate) => norm360(Astronomy.Ecliptic(Astronomy.GeoVector(body, Astronomy.MakeTime(jsDate), false)).elon);
  // Скорость планеты в градусах/сутки (знаковая: <0 = ретро)
  function speedOf(body, jsDate) {
    const h = 6 * 3600 * 1000;
    const a = lonAt(body, new Date(jsDate.getTime() - h));
    const b = lonAt(body, new Date(jsDate.getTime() + h));
    return norm180(b - a) / 0.5; // за полсуток *2
  }

  // Текущее смещение IANA-зоны от UTC (часы)
  function zoneOffsetNow(zone) {
    try {
      const now = Date.now();
      const dtf = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const p = {}; for (const x of dtf.formatToParts(new Date(now))) if (x.type !== 'literal') p[x.type] = x.value;
      let hh = +p.hour; if (hh === 24) hh = 0;
      const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, hh, +p.minute, +p.second);
      return Math.round((asUTC - now) / 60000) / 60;
    } catch (e) { return 0; }
  }

  // Вход для computeRealChart на «сейчас» в координатах города пользователя
  function nowInput(city) {
    const zone = (city && city.zone) || 'UTC';
    const off = zoneOffsetNow(zone);
    const utcMs = Date.now();
    const L = new Date(utcMs + off * 3600000);
    return {
      whenUtc: new Date(utcMs),
      input: { year: L.getUTCFullYear(), month: L.getUTCMonth() + 1, day: L.getUTCDate(), localHour: L.getUTCHours(), localMin: L.getUTCMinutes(), utcOffset: off, lat: city.lat, lon: city.lon, mode: 'exact', housesValid: true },
    };
  }

  // ── Луна без курса (VOC): не делает больше ни одного точного аспекта к 6 планетам
  //    до выхода из текущего знака ──
  function moonVoidOfCourse(whenUtc) {
    const moonLon = lonAt('Moon', whenUtc);
    const moonSpeed = Math.abs(speedOf('Moon', whenUtc)) || 13;
    const degToSignEnd = norm360((Math.floor(moonLon / 30) + 1) * 30 - moonLon);
    const toH = d => (d / moonSpeed) * 24;
    let next = null, last = null;
    for (const pl of SEVEN) {
      if (pl === 'moon') continue;
      const plLon = lonAt(BODY[pl], whenUtc);
      for (const asp of ASPECTS) {
        const angs = asp.angle === 0 ? [0] : asp.angle === 180 ? [180] : [asp.angle, -asp.angle];
        for (const a of angs) {
          const fwd = norm360(norm360(plLon + a) - moonLon); // сколько Луне пройти вперёд
          if (fwd > 0.0001 && fwd <= degToSignEnd) {
            if (!next || fwd < next.deg) next = { pl, aspect: asp.key, deg: fwd, hours: toH(fwd) };
            if (!last || fwd > last.deg) last = { pl, aspect: asp.key, deg: fwd, hours: toH(fwd) };
          }
        }
      }
    }
    const moonSign = Math.floor(moonLon / 30);
    return {
      voc: next === null,
      nextAspect: next, lastAspect: last,
      moonSign, nextSign: (moonSign + 1) % 12, moonDeg: moonLon % 30, moonLon,
      degToSignEnd, hoursToSignEnd: toH(degToSignEnd),
      hoursToVoid: last ? last.hours : 0, // когда Луна станет без курса (после последнего аспекта)
    };
  }

  function angHouse(h) { return [1, 4, 7, 10].includes(h) ? 'angular' : [2, 5, 8, 11].includes(h) ? 'succedent' : 'cadent'; }

  // Аспект между двумя планетами; applying — орб уменьшается
  function aspectBetween(p, q, pos, spd) {
    const sep = Math.abs(norm180(pos[p] - pos[q]));
    let best = null;
    for (const asp of ASPECTS) {
      const orb = Math.abs(sep - asp.angle);
      if (orb <= MOIETY[p] + MOIETY[q]) {
        const dt = 0.02;
        const p2 = norm360(pos[p] + spd[p] * dt), q2 = norm360(pos[q] + spd[q] * dt);
        const orb2 = Math.abs(Math.abs(norm180(p2 - q2)) - asp.angle);
        const applying = orb2 < orb;
        if (!best || orb < best.orb) best = { aspect: asp.key, harmonious: asp.harmonious, orb, applying };
      }
    }
    return best;
  }

  // ── Главная функция: построить и рассудить хорарную карту ──
  // topic: { house: основной дом, secondary?: [доп. дома] } (или просто число — основной дом)
  function ask(city, topic) {
    const primaryHouse = typeof topic === 'number' ? topic : topic.house;
    const secondaryHouses = (typeof topic === 'object' && topic.secondary) ? topic.secondary : [];
    const quesitedHouse = primaryHouse;

    const { whenUtc, input } = nowInput(city);
    const chart = window.computeRealChart(input);
    const pos = {}, spd = {};
    for (const pl of SEVEN) { pos[pl] = chart.planets[pl].ecl; spd[pl] = speedOf(BODY[pl], whenUtc); }

    const ascSign = Math.floor(chart.asc / 30);
    const ascDeg = chart.asc % 30;
    const querentPlanet = SIGN_RULER[ascSign];
    const houseRuler = (h) => SIGN_RULER[Math.floor(chart.cusps[h - 1] / 30)];
    const quesitedPlanet = houseRuler(primaryHouse);

    const meta = (pl) => ({
      planet: pl,
      house: chart.planets[pl].house,
      signIdx: Math.floor(pos[pl] / 30),
      deg: pos[pl] % 30,
      retro: spd[pl] < 0,
    });

    const querentSig = meta(querentPlanet);
    const quesitedSig = meta(quesitedPlanet);
    const moon = { ...meta('moon') };
    const sameRuler = querentPlanet === quesitedPlanet;
    // Дополнительные значимые (управители доп. домов): условия труда, деньги и т.п.
    const additional = secondaryHouses.map(h => ({ topicHouse: h, ...meta(houseRuler(h)) }));

    // Перфекция: аспект от управителя 1 дома ИЛИ Луны к управителю любого
    // из квезит-домов (основной + дополнительные). Приоритет — основной дом.
    const quesitedHouses = [primaryHouse, ...secondaryHouses];
    const candidates = [];
    const seen = new Set();
    for (const h of quesitedHouses) {
      const qp = houseRuler(h);
      const key = qp + '|' + h;
      if (seen.has(qp)) continue; seen.add(qp); // одну планету учитываем один раз
      if (qp !== querentPlanet) {
        const a = aspectBetween(querentPlanet, qp, pos, spd);
        if (a) candidates.push({ ...a, via: 'rulers', a: querentPlanet, b: qp, toHouse: h });
      }
      if (qp !== 'moon') {
        const m = aspectBetween('moon', qp, pos, spd);
        if (m) candidates.push({ ...m, via: 'moon', a: 'moon', b: qp, toHouse: h });
      }
    }
    // Приближающиеся — сначала к основному дому, затем по орбу
    const applyingC = candidates.filter(c => c.applying)
      .sort((x, y) => (x.toHouse === primaryHouse ? 0 : 1) - (y.toHouse === primaryHouse ? 0 : 1) || x.orb - y.orb);
    const perfection = applyingC[0] || null;
    const separating = (!perfection && candidates.length) ? candidates.sort((x, y) => x.orb - y.orb)[0] : null;

    // Тайминг по приближающейся перфекции
    let timing = null;
    if (perfection) {
      const fast = Math.abs(spd[perfection.a]) >= Math.abs(spd[perfection.b]) ? perfection.a : perfection.b;
      const kindByHouse = angHouse(chart.planets[fast].house);
      const kind = kindByHouse === 'angular' ? 'days' : kindByHouse === 'succedent' ? 'weeks' : 'months';
      timing = { units: Math.max(1, Math.round(perfection.orb)), kind, fast };
    }

    // Радикальность / строгости
    const strictures = [];
    if (ascDeg < 3) strictures.push('asc_early');
    if (ascDeg > 27) strictures.push('asc_late');
    if (chart.planets.saturn.house === 7) strictures.push('saturn_7');
    if (chart.planets.saturn.house === 1) strictures.push('saturn_1');
    const ml = pos.moon;
    if (ml >= 195 && ml <= 225) strictures.push('via_combusta'); // 15°♎–15°♏

    // Главная проверка радикальности: ранний/поздний Асцендент делает карту
    // «нерадикальной» — судить рано/поздно, ответ ориентировочный.
    // (Луна без курса отсекается ещё ДО вопроса — форма блокируется.)
    const radical = ascDeg < 3 ? 'early' : ascDeg > 27 ? 'late' : 'ok';

    // Вердикт по перфекции значимых
    const baseVerdict = perfection ? (perfection.harmonious ? 'yes' : 'yes_hard') : (sameRuler ? 'yes' : 'no');
    // Если карта нерадикальна — вердикт ненадёжный (квалифицируем).
    const verdict = radical === 'ok' ? baseVerdict : 'unreliable';

    // Данные колеса карты для отрисовки (NatalChartSVG)
    const ALL = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    const wheelPlanets = ALL.map(id => ({ id, ...chart.planets[id], ...(window.PL_META ? window.PL_META[id] : {}) }));
    const wheel = {
      planets: wheelPlanets, asc: chart.asc, mc: chart.mc, cusps: chart.cusps,
      showHouses: chart.housesValid === true || chart.housesValid === 'approx',
    };

    return {
      whenUtc, asc: chart.asc, ascDeg, ascSign,
      quesitedHouse, querentSig, quesitedSig, additional, moon, sameRuler,
      perfection, separating, timing, strictures, radical, baseVerdict, verdict, wheel,
    };
  }

  window.HORAR = { TOPICS, moonVoidOfCourse, nowInput, ask, SIGN_RULER };
})();
