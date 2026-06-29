// birthedit.jsx — editable birth data: calendar date · time precision · city search
// Self-contained: depends only on React + props (th, lang). Shares via window.

const { useState, useEffect, useRef, useMemo } = React;

// ═══════════════════════════════════════════════════════
// CITY DIRECTORY  (ru, en, region, lat, lon, tz = standard UTC offset)
// ═══════════════════════════════════════════════════════
const CITIES = [
  { ru:'Москва', en:'Moscow', reg:'Россия', lat:55.7558, lon:37.6173, tz:3, zone:'Europe/Moscow' },
  { ru:'Санкт-Петербург', en:'Saint Petersburg', reg:'Россия', lat:59.9343, lon:30.3351, tz:3, zone:'Europe/Moscow' },
  { ru:'Новосибирск', en:'Novosibirsk', reg:'Россия', lat:55.0084, lon:82.9357, tz:7, zone:'Asia/Novosibirsk' },
  { ru:'Екатеринбург', en:'Yekaterinburg', reg:'Россия', lat:56.8389, lon:60.6057, tz:5, zone:'Asia/Yekaterinburg' },
  { ru:'Казань', en:'Kazan', reg:'Россия', lat:55.7963, lon:49.1088, tz:3, zone:'Europe/Moscow' },
  { ru:'Нижний Новгород', en:'Nizhny Novgorod', reg:'Россия', lat:56.2965, lon:43.9361, tz:3, zone:'Europe/Moscow' },
  { ru:'Челябинск', en:'Chelyabinsk', reg:'Россия', lat:55.1644, lon:61.4368, tz:5, zone:'Asia/Yekaterinburg' },
  { ru:'Самара', en:'Samara', reg:'Россия', lat:53.1959, lon:50.1002, tz:4, zone:'Europe/Samara' },
  { ru:'Омск', en:'Omsk', reg:'Россия', lat:54.9885, lon:73.3242, tz:6, zone:'Asia/Omsk' },
  { ru:'Ростов-на-Дону', en:'Rostov-on-Don', reg:'Россия', lat:47.2357, lon:39.7015, tz:3, zone:'Europe/Moscow' },
  { ru:'Уфа', en:'Ufa', reg:'Россия', lat:54.7388, lon:55.9721, tz:5, zone:'Asia/Yekaterinburg' },
  { ru:'Красноярск', en:'Krasnoyarsk', reg:'Россия', lat:56.0153, lon:92.8932, tz:7, zone:'Asia/Krasnoyarsk' },
  { ru:'Воронеж', en:'Voronezh', reg:'Россия', lat:51.6720, lon:39.1843, tz:3, zone:'Europe/Moscow' },
  { ru:'Пермь', en:'Perm', reg:'Россия', lat:58.0105, lon:56.2502, tz:5, zone:'Asia/Yekaterinburg' },
  { ru:'Волгоград', en:'Volgograd', reg:'Россия', lat:48.7080, lon:44.5133, tz:3, zone:'Europe/Volgograd' },
  { ru:'Краснодар', en:'Krasnodar', reg:'Россия', lat:45.0355, lon:38.9753, tz:3, zone:'Europe/Moscow' },
  { ru:'Саратов', en:'Saratov', reg:'Россия', lat:51.5331, lon:46.0342, tz:4, zone:'Europe/Saratov' },
  { ru:'Тюмень', en:'Tyumen', reg:'Россия', lat:57.1530, lon:65.5343, tz:5, zone:'Asia/Yekaterinburg' },
  { ru:'Ижевск', en:'Izhevsk', reg:'Россия', lat:56.8526, lon:53.2045, tz:4, zone:'Europe/Samara' },
  { ru:'Барнаул', en:'Barnaul', reg:'Россия', lat:53.3548, lon:83.7698, tz:7, zone:'Asia/Barnaul' },
  { ru:'Иркутск', en:'Irkutsk', reg:'Россия', lat:52.2870, lon:104.3050, tz:8, zone:'Asia/Irkutsk' },
  { ru:'Ангарск', en:'Angarsk', reg:'Иркутская обл.', lat:52.5440, lon:103.8880, tz:8, zone:'Asia/Irkutsk' },
  { ru:'Хабаровск', en:'Khabarovsk', reg:'Россия', lat:48.4827, lon:135.0838, tz:10, zone:'Asia/Vladivostok' },
  { ru:'Владивосток', en:'Vladivostok', reg:'Россия', lat:43.1198, lon:131.8869, tz:10, zone:'Asia/Vladivostok' },
  { ru:'Ярославль', en:'Yaroslavl', reg:'Россия', lat:57.6261, lon:39.8845, tz:3, zone:'Europe/Moscow' },
  { ru:'Кострома', en:'Kostroma', reg:'Россия', lat:57.7665, lon:40.9269, tz:3, zone:'Europe/Moscow' },
  { ru:'Томск', en:'Tomsk', reg:'Россия', lat:56.4847, lon:84.9482, tz:7, zone:'Asia/Tomsk' },
  { ru:'Оренбург', en:'Orenburg', reg:'Россия', lat:51.7682, lon:55.0969, tz:5, zone:'Asia/Yekaterinburg' },
  { ru:'Кемерово', en:'Kemerovo', reg:'Россия', lat:55.3547, lon:86.0873, tz:7, zone:'Asia/Novokuznetsk' },
  { ru:'Рязань', en:'Ryazan', reg:'Россия', lat:54.6269, lon:39.6916, tz:3, zone:'Europe/Moscow' },
  { ru:'Астрахань', en:'Astrakhan', reg:'Россия', lat:46.3479, lon:48.0336, tz:4, zone:'Europe/Astrakhan' },
  { ru:'Калининград', en:'Kaliningrad', reg:'Россия', lat:54.7104, lon:20.4522, tz:2, zone:'Europe/Kaliningrad' },
  { ru:'Сочи', en:'Sochi', reg:'Россия', lat:43.5855, lon:39.7231, tz:3, zone:'Europe/Moscow' },
  { ru:'Мурманск', en:'Murmansk', reg:'Россия', lat:68.9585, lon:33.0827, tz:3, zone:'Europe/Moscow' },
  { ru:'Якутск', en:'Yakutsk', reg:'Россия', lat:62.0355, lon:129.6755, tz:9, zone:'Asia/Yakutsk' },
  { ru:'Минск', en:'Minsk', reg:'Беларусь', lat:53.9006, lon:27.5590, tz:3, zone:'Europe/Minsk' },
  { ru:'Киев', en:'Kyiv', reg:'Украина', lat:50.4501, lon:30.5234, tz:2, zone:'Europe/Kiev' },
  { ru:'Алматы', en:'Almaty', reg:'Казахстан', lat:43.2220, lon:76.8512, tz:6, zone:'Asia/Almaty' },
  { ru:'Астана', en:'Astana', reg:'Казахстан', lat:51.1694, lon:71.4491, tz:6, zone:'Asia/Almaty' },
  { ru:'Ташкент', en:'Tashkent', reg:'Узбекистан', lat:41.2995, lon:69.2401, tz:5, zone:'Asia/Tashkent' },
  { ru:'Баку', en:'Baku', reg:'Азербайджан', lat:40.4093, lon:49.8671, tz:4, zone:'Asia/Baku' },
  { ru:'Ереван', en:'Yerevan', reg:'Армения', lat:40.1792, lon:44.4991, tz:4, zone:'Asia/Yerevan' },
  { ru:'Тбилиси', en:'Tbilisi', reg:'Грузия', lat:41.7151, lon:44.8271, tz:4, zone:'Asia/Tbilisi' },
  { ru:'Бишкек', en:'Bishkek', reg:'Кыргызстан', lat:42.8746, lon:74.5698, tz:6, zone:'Asia/Bishkek' },
  { ru:'Кишинёв', en:'Chisinau', reg:'Молдова', lat:47.0105, lon:28.8638, tz:2, zone:'Europe/Chisinau' },
  { ru:'Душанбе', en:'Dushanbe', reg:'Таджикистан', lat:38.5598, lon:68.7870, tz:5, zone:'Asia/Dushanbe' },
  { ru:'Лондон', en:'London', reg:'Великобритания', lat:51.5074, lon:-0.1278, tz:0, zone:'Europe/London' },
  { ru:'Париж', en:'Paris', reg:'Франция', lat:48.8566, lon:2.3522, tz:1, zone:'Europe/Paris' },
  { ru:'Берлин', en:'Berlin', reg:'Германия', lat:52.5200, lon:13.4050, tz:1, zone:'Europe/Berlin' },
  { ru:'Рим', en:'Rome', reg:'Италия', lat:41.9028, lon:12.4964, tz:1, zone:'Europe/Rome' },
  { ru:'Мадрид', en:'Madrid', reg:'Испания', lat:40.4168, lon:-3.7038, tz:1, zone:'Europe/Madrid' },
  { ru:'Прага', en:'Prague', reg:'Чехия', lat:50.0755, lon:14.4378, tz:1, zone:'Europe/Prague' },
  { ru:'Нью-Йорк', en:'New York', reg:'США', lat:40.7128, lon:-74.0060, tz:-5, zone:'America/New_York' },
  { ru:'Лос-Анджелес', en:'Los Angeles', reg:'США', lat:34.0522, lon:-118.2437, tz:-8, zone:'America/Los_Angeles' },
  { ru:'Чикаго', en:'Chicago', reg:'США', lat:41.8781, lon:-87.6298, tz:-6, zone:'America/Chicago' },
  { ru:'Торонто', en:'Toronto', reg:'Канада', lat:43.6532, lon:-79.3832, tz:-5, zone:'America/Toronto' },
  { ru:'Дубай', en:'Dubai', reg:'ОАЭ', lat:25.2048, lon:55.2708, tz:4, zone:'Asia/Dubai' },
  { ru:'Стамбул', en:'Istanbul', reg:'Турция', lat:41.0082, lon:28.9784, tz:3, zone:'Europe/Istanbul' },
  { ru:'Тель-Авив', en:'Tel Aviv', reg:'Израиль', lat:32.0853, lon:34.7818, tz:2, zone:'Asia/Jerusalem' },
  { ru:'Каир', en:'Cairo', reg:'Египет', lat:30.0444, lon:31.2357, tz:2, zone:'Africa/Cairo' },
  { ru:'Токио', en:'Tokyo', reg:'Япония', lat:35.6762, lon:139.6503, tz:9, zone:'Asia/Tokyo' },
  { ru:'Пекин', en:'Beijing', reg:'Китай', lat:39.9042, lon:116.4074, tz:8, zone:'Asia/Shanghai' },
  { ru:'Дели', en:'Delhi', reg:'Индия', lat:28.7041, lon:77.1025, tz:5.5, zone:'Asia/Kolkata' },
  { ru:'Бангкок', en:'Bangkok', reg:'Таиланд', lat:13.7563, lon:100.5018, tz:7, zone:'Asia/Bangkok' },
  { ru:'Сеул', en:'Seoul', reg:'Южная Корея', lat:37.5665, lon:126.9780, tz:9, zone:'Asia/Seoul' },
  { ru:'Сидней', en:'Sydney', reg:'Австралия', lat:-33.8688, lon:151.2093, tz:10, zone:'Australia/Sydney' },
];

// ═══════════════════════════════════════════════════════
// DEFAULT BIRTH  (replaces old hardcoded BIRTH)
// ═══════════════════════════════════════════════════════
const DEFAULT_BIRTH = {
  day: 3, month: 8, year: 2002,
  timeMode: 'exact',          // 'exact' | 'approx' | 'unknown'
  hour: 7, minute: 21,        // exact
  approx: 'morning',          // 'morning' | 'day' | 'evening' | 'night'
  city: { ru:'Ангарск', en:'Angarsk', reg:'Иркутская обл.', lat:52.5440, lon:103.8880, tz:8, zone:'Asia/Irkutsk' },
  residence: null,           // city of residence NOW; null = same as birthplace. Drives the solar return.
};

// ═══════════════════════════════════════════════════════
// ZODIAC (sun-sign from date) + label helpers
// ═══════════════════════════════════════════════════════
const BE_SIGN_NOM = ['Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы'];
const BE_SIGN_PREP = ['в Овне','в Тельце','в Близнецах','в Раке','во Льве','в Деве','в Весах','в Скорпионе','в Стрельце','в Козероге','в Водолее','в Рыбах'];
const BE_SIGN_EN  = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const BE_SIGN_GLYPH = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

function sunSignIdxFromDate(day, month) {
  // month 1-12. Standard tropical sun-sign date ranges.
  const cut = [19,18,20,19,20,20,22,22,22,22,21,21];   // last day of the EARLIER sign in this month
  const start = [10,11,0,1,2,3,4,5,6,7,8,9];           // sign that STARTS later in this month
  const s = start[month-1];
  return day <= cut[month-1] ? (s + 11) % 12 : s;      // still previous sign if on/before cut
}
function sunSignInfo(birth, lang) {
  const idx = sunSignIdxFromDate(birth.day, birth.month);
  return { idx, glyph: BE_SIGN_GLYPH[idx], nom: lang==='en'?BE_SIGN_EN[idx]:BE_SIGN_NOM[idx], prep: BE_SIGN_PREP[idx], en: BE_SIGN_EN[idx] };
}

// ═══════════════════════════════════════════════════════
// FORMAT HELPERS
// ═══════════════════════════════════════════════════════
const pad2 = (n) => String(n).padStart(2,'0');
function fmtBirthDate(b) { return `${pad2(b.day)}.${pad2(b.month)}.${b.year}`; }

const APPROX_LBL = {
  morning: { ru:'Утро', en:'Morning', range:'06:00–12:00' },
  day:     { ru:'День', en:'Day',     range:'12:00–17:00' },
  evening: { ru:'Вечер', en:'Evening', range:'17:00–22:00' },
  night:   { ru:'Ночь', en:'Night',   range:'22:00–06:00' },
};
function fmtBirthTime(b, lang) {
  if (b.timeMode === 'exact')  return `${pad2(b.hour)}:${pad2(b.minute)}`;
  if (b.timeMode === 'approx') return (lang==='en'?'≈ ':'≈ ') + (APPROX_LBL[b.approx]?.[lang==='en'?'en':'ru'] || '');
  return lang==='en' ? 'Unknown' : 'Не указано';
}
function fmtBirthCity(b, lang) {
  if (!b.city) return '—';
  return lang==='en' ? b.city.en : b.city.ru;
}

// resolved chart input — converts time mode → a concrete local hour for ephemeris
const APPROX_MID = { morning:[9,0], day:[14,30], evening:[19,30], night:[2,0] };

// Historical UTC offset (including DST) for an IANA zone at a given wall-clock time.
// Russia ran summer time until 2011, so e.g. Irkutsk was UTC+9 (not +8) in Aug 2002.
function tzOffsetMinutes(zone, ms) {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: zone, hour12:false, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' });
    const p = {}; dtf.formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; });
    const hh = p.hour === '24' ? 0 : +p.hour;
    return (Date.UTC(+p.year, +p.month - 1, +p.day, hh, +p.minute, +p.second) - ms) / 60000;
  } catch (e) { return null; }
}
function zoneOffsetHours(zone, y, mo, d, h, mi) {
  if (!zone) return null;
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let off = tzOffsetMinutes(zone, guess);
  if (off == null) return null;
  off = tzOffsetMinutes(zone, guess - off * 60000); // refine across DST boundaries
  return off == null ? null : off / 60;
}
// Resolve a city's IANA zone, back-filling from the directory for older saved
// cities that predate the `zone` field.
function cityZone(city) {
  if (!city) return null;
  if (city.zone) return city.zone;
  const m = CITIES.find(c => c.en === city.en || (c.ru === city.ru && Math.abs(c.lat - (city.lat || 0)) < 0.05));
  return m ? m.zone : null;
}

function resolveBirthForChart(b) {
  let localHour = 12, localMin = 0, housesValid = false;
  if (b.timeMode === 'exact')  { localHour = b.hour; localMin = b.minute; housesValid = true; }
  else if (b.timeMode === 'approx') { const m = APPROX_MID[b.approx]||[12,0]; localHour = m[0]; localMin = m[1]; housesValid = 'approx'; }
  else { localHour = 12; localMin = 0; housesValid = false; }
  // Prefer the real IANA zone (correct historical offset incl. DST); fall back to
  // the city's fixed standard offset if no zone is known or Intl fails.
  const zoneOff = zoneOffsetHours(cityZone(b.city), b.year, b.month, b.day, localHour, localMin);
  const utcOffset = zoneOff != null ? zoneOff : (b.city?.tz ?? 0);
  return {
    year: b.year, month: b.month, day: b.day,
    localHour, localMin, utcOffset,
    lat: b.city?.lat ?? 0, lon: b.city?.lon ?? 0,
    mode: b.timeMode, housesValid,
  };
}

// ═══════════════════════════════════════════════════════
// SMALL ICONS
// ═══════════════════════════════════════════════════════
function BeIco({ name, size=20, color='currentColor', sw=1.7 }) {
  const c = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:sw, strokeLinecap:'round', strokeLinejoin:'round' };
  switch(name){
    case 'back':    return (<svg {...c}><path d="M15 5l-7 7 7 7"/></svg>);
    case 'cal':     return (<svg {...c}><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>);
    case 'clock':   return (<svg {...c}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>);
    case 'pin':     return (<svg {...c}><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>);
    case 'search':  return (<svg {...c}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>);
    case 'chevL':   return (<svg {...c}><path d="M15 5l-7 7 7 7"/></svg>);
    case 'chevR':   return (<svg {...c}><path d="M9 5l7 7-7 7"/></svg>);
    case 'check':   return (<svg {...c}><path d="M4 12.5l5 5 11-11"/></svg>);
    case 'chevD':   return (<svg {...c}><path d="M5 8l7 7 7-7"/></svg>);
    case 'x':       return (<svg {...c}><path d="M6 6l12 12M18 6 6 18"/></svg>);
    case 'user':    return (<svg {...c}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
    case 'home':    return (<svg {...c}><path d="M4 11.5 12 4l8 7.5"/><path d="M5.5 10.2V20h13v-9.8"/><path d="M10 20v-5h4v5"/></svg>);
    case 'lock':    return (<svg {...c}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>);
    default: return null;
  }
}

// time-of-day mini glyphs for the "approx" choices
function ApproxGlyph({ kind, size=26, color='currentColor' }) {
  const c = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:1.6, strokeLinecap:'round', strokeLinejoin:'round' };
  if (kind==='morning') return (<svg {...c}><path d="M3 18h18M6 18a6 6 0 0 1 12 0"/><path d="M12 3v3M5 8 6.5 9.5M19 8 17.5 9.5"/></svg>);
  if (kind==='day')     return (<svg {...c}><circle cx="12" cy="12" r="4.4"/><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9 6.7 6.7M17.3 17.3 19.1 19.1M19.1 4.9 17.3 6.7M6.7 17.3 4.9 19.1"/></svg>);
  if (kind==='evening') return (<svg {...c}><path d="M3 18h18M6 18a6 6 0 0 1 12 0"/><path d="M12 11V3M9 5.5 12 3l3 2.5"/></svg>);
  return (<svg {...c}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.4 6.4 0 0 0 10.5 10.5Z"/></svg>); // night moon
}

// ═══════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════
const CAL_MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const CAL_MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAL_WEEK_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const CAL_WEEK_EN = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function Calendar({ th, lang, day, month, year, onPick }) {
  const en = lang === 'en';
  const [vY, setVY] = useState(year);
  const [vM, setVM] = useState(month - 1); // 0-11
  const [mode, setMode] = useState('days'); // days | months | years
  const nowY = new Date().getFullYear();

  const months = en ? CAL_MONTHS_EN : CAL_MONTHS_RU;
  const week   = en ? CAL_WEEK_EN : CAL_WEEK_RU;

  const stepMonth = (d) => {
    let m = vM + d, y = vY;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setVM(m); setVY(y);
  };

  const daysIn = new Date(vY, vM + 1, 0).getDate();
  const firstW = (new Date(vY, vM, 1).getDay() + 6) % 7; // Mon=0
  const cells = [];
  for (let i = 0; i < firstW; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  const accent = th.accent;
  const _now = new Date();
  const _nowY = _now.getFullYear(), _nowM = _now.getMonth(), _nowD = _now.getDate();
  const isFuture = (d) => vY > _nowY || (vY === _nowY && vM > _nowM) || (vY === _nowY && vM === _nowM && d > _nowD);
  const cellBtn = (d) => {
    if (d == null) return <div key={Math.random()} />;
    const sel = d === day && vM === month - 1 && vY === year;
    const future = isFuture(d);
    return (
      <button key={d} disabled={future} onClick={future ? undefined : () => onPick(d, vM + 1, vY)} style={{
        height:36, borderRadius:10, border:'none', cursor: future ? 'default' : 'pointer',
        background: sel ? accent : 'transparent',
        color: sel ? '#fff' : th.ink,
        opacity: future ? 0.25 : 1,
        fontFamily:'"Manrope",sans-serif', fontWeight: sel ? 700 : 500, fontSize:13.5,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: sel ? `0 4px 14px ${th.accentGlow}` : 'none',
      }}>{d}</button>
    );
  };

  const headBtn = (children, onClick, key) => (
    <button key={key} onClick={onClick} style={{
      width:34, height:34, borderRadius:999, border:`1px solid ${th.glassBorder}`,
      background:th.chip, color:th.ink, cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center', padding:0, flexShrink:0,
    }}>{children}</button>
  );

  return (
    <div style={{
      background:th.glass, border:`1px solid ${th.glassBorder}`, borderRadius:18,
      padding:'14px 14px 10px', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', marginTop:10,
    }}>
      {/* header */}
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
        {mode === 'days' && headBtn(<BeIco name="chevL" size={16} color={th.ink}/>, () => stepMonth(-1), 'l')}
        <button onClick={() => setMode(mode === 'years' ? 'days' : (mode === 'months' ? 'years' : 'months'))} style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          background:'none', border:'none', cursor:'pointer', color:th.ink,
          fontFamily:'var(--ds-serif)', fontWeight:600, fontSize:17,
        }}>
          {mode === 'days'   && `${months[vM]} ${vY}`}
          {mode === 'months' && vY}
          {mode === 'years'  && (en ? 'Year' : 'Год')}
          <BeIco name="chevD" size={15} color={th.muted}/>
        </button>
        {mode === 'days' && headBtn(<BeIco name="chevR" size={16} color={th.ink}/>, () => stepMonth(1), 'r')}
      </div>

      {mode === 'days' && (
        <React.Fragment>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4}}>
            {week.map((w,i) => (
              <div key={w} style={{textAlign:'center', fontFamily:'"Manrope",sans-serif', fontWeight:700, fontSize:10, letterSpacing:0.5, color: i>4 ? th.gold : th.muted, padding:'2px 0'}}>{w}</div>
            ))}
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2}}>
            {cells.map((d,i) => <React.Fragment key={i}>{cellBtn(d)}</React.Fragment>)}
          </div>
        </React.Fragment>
      )}

      {mode === 'months' && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6}}>
          {months.map((m,i) => {
            const sel = i === vM;
            const futureM = vY === _nowY && i > _nowM;
            return (
              <button key={m} disabled={futureM} onClick={futureM ? undefined : () => { setVM(i); setMode('days'); }} style={{
                height:46, borderRadius:12, cursor: futureM ? 'default' : 'pointer', opacity: futureM ? 0.3 : 1,
                border:`1px solid ${sel?accent+'80':th.glassBorder}`,
                background: sel ? `${accent}26` : 'transparent', color:th.ink,
                fontFamily:'"Manrope",sans-serif', fontWeight: sel?700:500, fontSize:12.5,
              }}>{en ? m.slice(0,3) : m.slice(0,3)}</button>
            );
          })}
        </div>
      )}

      {mode === 'years' && (
        <div style={{maxHeight:208, overflowY:'auto', scrollbarWidth:'none'}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6}}>
            {Array.from({length: nowY - 1920 + 1}, (_, k) => nowY - k).map((y) => {
              const sel = y === vY;
              return (
                <button key={y} onClick={() => { setVY(y); setMode('months'); }} style={{
                  height:42, borderRadius:11, cursor:'pointer',
                  border:`1px solid ${sel?accent+'80':th.glassBorder}`,
                  background: sel ? `${accent}26` : 'transparent', color:th.ink,
                  fontFamily:'"Manrope",sans-serif', fontWeight: sel?700:500, fontSize:13,
                }}>{y}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXACT TIME INPUT  (HH : MM)
// ═══════════════════════════════════════════════════════
function TimeInput({ th, hour, minute, onChange, max, onError }) {
  // Local string state so the user can fully clear a field and type fresh.
  // The displayed value is NOT re-derived from the parent on every keystroke
  // (that's what made clearing snap back to "00"). Empty → stored as 0,
  // so saving with an empty field naturally yields 00:00.
  const [h, setH] = useState(hour);
  const [m, setM] = useState(minute);

  const inputStyle = {
    width:64, height:58, textAlign:'center',
    appearance:'none', WebkitAppearance:'none',
    background: th.effDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
    border:`1.5px solid ${th.glassBorder}`, borderRadius:14,
    color:th.ink, fontFamily:'var(--ds-serif)', fontWeight:600, fontSize:26, outline:'none',
  };

  // Если задан max (дата = сегодня) и время позже — ставим максимально наступившее.
  const overMax = (hh, mm) => max && (hh * 60 + mm) > (max.h * 60 + max.m);
  const clampToMax = () => {
    const ph = pad2(max.h), pm = pad2(max.m);
    setH(ph); setM(pm); onChange(ph, pm);
    if (onError) onError(true);
  };

  const clean = (s) => s.replace(/[^0-9]/g, '').slice(0, 2);
  const onH = (e) => { const v = clean(e.target.value); setH(v); onChange(v, m); };
  const onM = (e) => { const v = clean(e.target.value); setM(v); onChange(h, v); };
  // On blur: keep an empty field empty; clamp 0-23/0-59; затем — к max, если сегодня.
  const blurH = () => {
    if (h === '') { onChange('', m); return; }
    const p = Math.max(0, Math.min(23, parseInt(h, 10) || 0));
    const mm = m === '' ? 0 : (parseInt(m, 10) || 0);
    if (overMax(p, mm)) { clampToMax(); return; }
    const ph = pad2(p); setH(ph); onChange(ph, m); if (onError) onError(false);
  };
  const blurM = () => {
    if (m === '') { onChange(h, ''); return; }
    const p = Math.max(0, Math.min(59, parseInt(m, 10) || 0));
    const hh = h === '' ? 0 : (parseInt(h, 10) || 0);
    if (overMax(hh, p)) { clampToMax(); return; }
    const pm = pad2(p); setM(pm); onChange(h, pm); if (onError) onError(false);
  };

  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'4px 0 2px'}}>
      <input value={h} inputMode="numeric" maxLength={2} placeholder="чч" onChange={onH} onBlur={blurH} style={inputStyle}/>
      <span style={{fontFamily:'var(--ds-serif)', fontSize:28, fontWeight:600, color:th.muted}}>:</span>
      <input value={m} inputMode="numeric" maxLength={2} placeholder="мм" onChange={onM} onBlur={blurM} style={inputStyle}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CITY SEARCH  ·  worldwide live geocoding (Open-Meteo, keyless)
// Local CITIES give instant/offline results; the API covers every
// other place on Earth, returning coordinates + the IANA timezone
// (so the chart still gets the correct historical UTC offset).
// ═══════════════════════════════════════════════════════
const cityNorm = (s) => (s || '').toLowerCase().replace(/ё/g, 'е').trim();

// Map one Open-Meteo geocoding result → our city object shape.
function geoToCity(r) {
  const name = r.name;
  const reg = [r.admin1, r.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
  const zone = r.timezone || null;
  const now = new Date();
  let tz = zone ? zoneOffsetHours(zone, now.getFullYear(), now.getMonth() + 1, now.getDate(), 12, 0) : null;
  if (tz == null) tz = 0;
  return { ru: name, en: name, reg: reg || (r.country || ''), lat: r.latitude, lon: r.longitude, tz, zone };
}

function CitySearch({ th, lang, value, onPick }) {
  const en = lang === 'en';
  const [q, setQ] = useState('');
  const [apiList, setApiList] = useState([]);
  const [loading, setLoading] = useState(false);

  // local matches (instant)
  const localList = useMemo(() => {
    const qq = cityNorm(q);
    const arr = qq ? CITIES.filter(c => cityNorm(c.ru).includes(qq) || cityNorm(c.en).includes(qq)) : CITIES;
    return arr.slice(0, 40);
  }, [q]);

  // live worldwide search (debounced, abortable)
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setApiList([]); setLoading(false); return undefined; }
    const ctrl = new AbortController();
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=20&language=${en ? 'en' : 'ru'}&format=json`;
        const res = await fetch(url, { signal: ctrl.signal });
        const data = await res.json();
        const cities = (data && data.results ? data.results : []).map(geoToCity);
        setApiList(cities);
      } catch (e) {
        if (e.name !== 'AbortError') setApiList([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q, en]);

  // merge local + API, de-duplicated by name + rough coordinates
  const list = useMemo(() => {
    const out = [];
    const seen = new Set();
    const add = (c, local) => {
      const k = cityNorm(en ? c.en : c.ru) + '|' + Math.round(c.lat * 2) + '|' + Math.round(c.lon * 2);
      if (seen.has(k)) return;
      seen.add(k);
      out.push({ ...c, _local: local });
    };
    localList.forEach(c => add(c, true));
    apiList.forEach(c => add(c, false));
    return out.slice(0, 60);
  }, [localList, apiList, en]);

  const empty = !loading && list.length === 0;

  return (
    <div style={{marginTop:10}}>
      {/* search field */}
      <div style={{
        display:'flex', alignItems:'center', gap:10, height:46, padding:'0 14px',
        background: th.effDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
        border:`1.5px solid ${th.glassBorder}`, borderRadius:14,
      }}>
        <BeIco name="search" size={18} color={th.muted}/>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          placeholder={en ? 'Search any city…' : 'Поиск любого города…'}
          style={{flex:1, appearance:'none', background:'none', border:'none', outline:'none', color:th.ink, fontFamily:'"Manrope",sans-serif', fontSize:14}}
        />
        {loading && <span style={{width:15,height:15,borderRadius:'50%',border:`2px solid ${th.muted}`,borderTopColor:'transparent',display:'inline-block',animation:'astroSpin .7s linear infinite',flexShrink:0}}/>}
        {q && !loading && <button onClick={() => setQ('')} style={{background:'none',border:'none',cursor:'pointer',padding:4,display:'flex'}}><BeIco name="x" size={15} color={th.muted}/></button>}
      </div>

      {/* results */}
      <div style={{marginTop:8, maxHeight:236, overflowY:'auto', scrollbarWidth:'none', background:th.glass, border:`1px solid ${th.glassBorder}`, borderRadius:14, backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)'}}>
        {empty && (
          <div style={{padding:'18px 14px', textAlign:'center', fontFamily:'"Manrope",sans-serif', fontSize:13, color:th.muted}}>{en ? 'Nothing found' : 'Ничего не найдено'}</div>
        )}
        {list.length === 0 && loading && (
          <div style={{padding:'18px 14px', textAlign:'center', fontFamily:'"Manrope",sans-serif', fontSize:13, color:th.muted}}>{en ? 'Searching…' : 'Ищем…'}</div>
        )}
        {list.map((c, i) => {
          const sel = value && (en ? value.en : value.ru) === (en ? c.en : c.ru) && value.reg === c.reg;
          return (
            <button key={(en?c.en:c.ru) + c.reg + i} onClick={() => onPick(c)} style={{
              width:'100%', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:11,
              padding:'11px 14px', background: sel ? `${th.accent}1F` : 'transparent', border:'none',
              borderBottom: i < list.length - 1 ? `1px solid ${th.glassBorder}` : 'none', color:th.ink,
            }}>
              <BeIco name="pin" size={16} color={sel ? th.accent : th.muted}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontFamily:'"Manrope",sans-serif', fontWeight:600, fontSize:13.5, color:th.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{en ? c.en : c.ru}</div>
                <div style={{fontFamily:'"Manrope",sans-serif', fontSize:11, color:th.muted, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.reg} · UTC{c.tz>=0?'+':''}{c.tz}</div>
              </div>
              {sel && <BeIco name="check" size={17} color={th.accent}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// FIELD WRAPPER (label + tappable summary that expands)
// ═══════════════════════════════════════════════════════
function EditField({ th, icon, label, value, open, onToggle, children, locked = false, lockedNote }) {
  return (
    <div style={{marginBottom:14}}>
      <button onClick={locked ? undefined : onToggle} disabled={locked} style={{
        width:'100%', display:'flex', alignItems:'center', gap:13, cursor: locked ? 'default' : 'pointer', textAlign:'left',
        background:th.glassStrong, border:`1px solid ${open ? th.accent+'70' : th.glassBorder}`,
        borderRadius:16, padding:'14px 16px', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', color:th.ink,
        opacity: locked ? 0.6 : 1,
      }}>
        <div style={{width:40, height:40, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:`${th.accent}22`, border:`1px solid ${th.accent}40`}}>
          <BeIco name={icon} size={20} color={th.glyphClr}/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontFamily:'"Manrope",sans-serif', fontWeight:700, fontSize:10, letterSpacing:1.4, textTransform:'uppercase', color:th.muted, marginBottom:3}}>{label}</div>
          <div style={{fontFamily:'var(--ds-serif)', fontWeight:600, fontSize:17, color:th.ink, lineHeight:1.1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{value}</div>
        </div>
        <div style={{flexShrink:0}}>
          {locked
            ? <BeIco name="lock" size={16} color={th.muted}/>
            : <div style={{transform: open ? 'rotate(180deg)' : 'none', transition:'transform .22s'}}><BeIco name="chevD" size={18} color={th.muted}/></div>}
        </div>
      </button>
      {locked && lockedNote && (
        <div style={{fontFamily:'"Manrope",sans-serif', fontSize:11, color:th.muted, margin:'6px 4px 0', lineHeight:1.4}}>{lockedNote}</div>
      )}
      {open && !locked && <div className="astro-in-f">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN EDITOR  (full overlay content: header + form + save)
// ═══════════════════════════════════════════════════════
function BirthDataEditor({ th, lang, initial, onSave, onCancel, showName = false, title, onboarding = false }) {
  const en = lang === 'en';
  const [b, setB] = useState(() => JSON.parse(JSON.stringify(initial)));
  const [open, setOpen] = useState(null); // 'date' | 'time' | 'city' | null
  const [dateWarn, setDateWarn] = useState(false); // предупреждение о смене даты
  const [consent, setConsent] = useState(false);   // галочка согласия (онбординг)
  const [timeErr, setTimeErr] = useState(false);   // время в будущем (сегодня)

  // В онбординге показываем поле имени (как для партнёра) и не спрашиваем город проживания.
  const nameVisible = showName || onboarding;

  // Дата рождения для своего профиля меняется только 1 раз — после блокируется.
  const dateLocked = !nameVisible && !!initial.dateLocked;

  // Если дата рождения = сегодня, время не может быть позже текущего момента.
  const _now = new Date();
  const isBirthToday = b.day === _now.getDate() && b.month === (_now.getMonth() + 1) && b.year === _now.getFullYear();
  const nowMax = { h: _now.getHours(), m: _now.getMinutes() };
  // Период «ещё не наступил сегодня», если его начало позже текущего часа.
  // Ночь (22:00–06:00) переходит через полночь: наступившей считаем, если сейчас ≥22 или <6.
  const isApproxFuture = (id) => {
    if (!isBirthToday) return false;
    const h = _now.getHours();
    if (id === 'night') return h >= 6 && h < 22;
    const start = { morning: 6, day: 12, evening: 17 }[id];
    return start > h;
  };

  const T = {
    title:   title || (onboarding ? (en ? 'The stars are waiting ✨' : 'Звёзды уже ждут ✨')
                                   : (en ? 'Birth data' : 'Данные рождения')),
    sub:     onboarding
               ? (en ? 'A couple of steps — and I\'ll tell you what the sky promises. Let\'s start with you.'
                     : 'Пара шагов — и я расскажу, что обещает тебе небо. Начнём с тебя.')
               : showName
               ? (en ? 'Enter your partner\'s details to compare charts' : 'Введите данные партнёра, чтобы сравнить карты')
               : (en ? 'These details power your natal chart' : 'По этим данным строится натальная карта'),
    name:    en ? 'Name' : 'Имя',
    namePh:  onboarding ? (en ? 'Your name' : 'Твоё имя') : (en ? 'Partner\'s name' : 'Имя партнёра'),
    date:    en ? 'Date of birth' : 'Дата рождения',
    time:    en ? 'Time of birth' : 'Время рождения',
    city:    en ? 'City of birth' : 'Город рождения',
    residence: en ? 'City of residence' : 'Город проживания',
    sameAsBirth: en ? 'Same as birthplace' : 'Как город рождения',
    otherCity: en ? 'Another city' : 'Другой город',
    residenceHint: en ? 'Where you actually live now. Used for the solar return — the year\'s theme depends on it. Your natal chart always stays on your birthplace.' : 'Где ты живёшь сейчас. Используется для соляра — от него зависит тема года. Натальная карта всегда остаётся на городе рождения.',
    save:    en ? 'Save' : 'Сохранить',
    pick:    en ? 'Select a city' : 'Выберите город',
    exact:   en ? 'Exact' : 'Точное',
    approx:  en ? 'Approximate' : 'Примерно',
    unknown: en ? "Don't know" : 'Не знаю',
    exactHint: en ? 'Enter the time in HH:MM' : 'Введите время в формате чч:мм',
    unknownHint: en
      ? "That's fine — we'll build a noon-based chart and focus on planets in signs and their aspects, leaving out the houses and ascendant."
      : 'Это нормально — построим карту на полдень и сделаем акцент на планетах в знаках и их аспектах, без домов и асцендента.',
    approxHint: en ? 'Pick the part of the day' : 'Выберите часть суток',
  };

  const time = fmtBirthTime(b, lang);
  const cityVal = b.city ? `${fmtBirthCity(b, lang)}` : T.pick;

  // ── header circle button
  const circle = (children, onClick) => (
    <button onClick={onClick} style={{
      width:33, height:33, borderRadius:999, border:`1px solid ${th.glassBorder}`,
      background:th.chip, color:th.ink, cursor:'pointer', display:'flex',
      alignItems:'center', justifyContent:'center', padding:0, flexShrink:0,
      backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
    }}>{children}</button>
  );

  // segmented time-mode control
  const modeBtn = (id, label) => {
    const active = b.timeMode === id;
    return (
      <button key={id} onClick={() => setB({ ...b, timeMode: id })} style={{
        flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
        background: active ? th.accent : 'transparent',
        color: active ? '#fff' : th.inkSoft,
        fontFamily:'"Manrope",sans-serif', fontWeight: active ? 700 : 600, fontSize:12.5,
        borderRadius:11, transition:'background .15s',
      }}>{label}</button>
    );
  };

  const approxBtn = (id) => {
    const active = b.approx === id;
    const L = APPROX_LBL[id];
    // Если дата = сегодня, период, который ещё не начался, выбрать нельзя.
    const future = isApproxFuture(id);
    return (
      <button key={id} disabled={future} onClick={future ? undefined : () => setB({ ...b, approx: id })} style={{
        display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor: future ? 'default' : 'pointer',
        padding:'14px 8px', borderRadius:14, opacity: future ? 0.35 : 1,
        border:`1.5px solid ${active ? th.accent+'90' : th.glassBorder}`,
        background: active ? `${th.accent}1F` : (th.effDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.5)'),
        color:th.ink,
      }}>
        <ApproxGlyph kind={id} size={26} color={active ? th.glyphClr : th.inkSoft}/>
        <span style={{fontFamily:'"Manrope",sans-serif', fontWeight: active?700:600, fontSize:13, color:th.ink}}>{en ? L.en : L.ru}</span>
        <span style={{fontFamily:'"Manrope",sans-serif', fontWeight:500, fontSize:10, color:th.muted}}>{L.range}</span>
      </button>
    );
  };

  return (
    <div style={{position:'relative', height:'100%', display:'flex', flexDirection:'column'}}>
      {/* ── Header ── */}
      <div style={{paddingTop: (typeof window!=='undefined' && window.IS_TG) ? 12 : 54, flexShrink:0}}>
        <div style={{height:50, display:'flex', alignItems:'center', gap:10, padding:'0 16px'}}>
          {onboarding
            ? <div style={{width:33, flexShrink:0}}/>  /* без «назад»: онбординг нельзя пропустить */
            : circle(<BeIco name="back" size={16} color={th.ink} sw={1.9}/>, onCancel)}
          <div style={{flex:1, textAlign:'center', fontFamily:'"Manrope",sans-serif', fontWeight:700, fontSize:15, color:th.ink, paddingRight:43}}>{T.title}</div>
        </div>
      </div>

      {/* ── Scrollable form ── */}
      <div style={{flex:1, overflowY:'auto', scrollbarWidth:'none', padding:'8px 18px 20px'}}>
        <div style={{fontFamily:'"Manrope",sans-serif', fontSize:12.5, color:th.inkSoft, marginBottom:18, lineHeight:1.4}}>{T.sub}</div>

        {/* NAME (partner flow + onboarding) */}
        {nameVisible && (
          <div style={{marginBottom:14}}>
            <div style={{display:'flex', alignItems:'center', gap:13, background:th.glassStrong, border:`1px solid ${th.glassBorder}`, borderRadius:16, padding:'10px 16px', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)'}}>
              <div style={{width:40, height:40, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:`${th.accent}22`, border:`1px solid ${th.accent}40`}}>
                <BeIco name="user" size={20} color={th.glyphClr}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontFamily:'"Manrope",sans-serif', fontWeight:700, fontSize:10, letterSpacing:1.4, textTransform:'uppercase', color:th.muted, marginBottom:3}}>{T.name}</div>
                <input
                  value={b.name || ''}
                  onChange={(e) => setB({ ...b, name: e.target.value.slice(0, 15) })}
                  maxLength={15}
                  placeholder={T.namePh}
                  style={{width:'100%', appearance:'none', background:'none', border:'none', outline:'none', color:th.ink, fontFamily:'var(--ds-serif)', fontWeight:600, fontSize:17, padding:0}}
                />
              </div>
            </div>
          </div>
        )}

        {/* DATE */}
        <EditField th={th} icon="cal" label={T.date} value={b.day ? fmtBirthDate(b) : (en?'Pick a date':'Выберите дату')}
          open={open==='date'} onToggle={() => setOpen(open==='date'?null:'date')}
          locked={dateLocked}
          lockedNote={en ? 'Date of birth has already been changed once and is now locked.' : 'Дата рождения уже была изменена и теперь заблокирована.'}>
          <Calendar th={th} lang={lang} day={b.day} month={b.month} year={b.year}
            onPick={(d,m,y) => { setB({ ...b, day:d, month:m, year:y }); setOpen(null); }}/>
        </EditField>

        {/* TIME */}
        <EditField th={th} icon="clock" label={T.time} value={b.timeMode ? time : (en?'Set the time':'Укажите время')} open={open==='time'} onToggle={() => setOpen(open==='time'?null:'time')}>
          <div style={{marginTop:10, background:th.glass, border:`1px solid ${th.glassBorder}`, borderRadius:18, padding:14, backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)'}}>
            <div style={{display:'flex', gap:5, background: th.effDark?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.55)', borderRadius:13, padding:4, marginBottom:14}}>
              {modeBtn('exact', T.exact)}
              {modeBtn('approx', T.approx)}
              {modeBtn('unknown', T.unknown)}
            </div>

            {b.timeMode === 'exact' && (
              <div>
                <TimeInput th={th} hour={b.hour==null?'':pad2(b.hour)} minute={b.minute==null?'':pad2(b.minute)}
                  max={isBirthToday ? nowMax : null}
                  onError={setTimeErr}
                  onChange={(h,m) => setB({ ...b, hour: parseInt(h||'0',10)||0, minute: parseInt(m||'0',10)||0 })}/>
                {timeErr
                  ? <div style={{textAlign:'center', fontFamily:'"Manrope",sans-serif', fontSize:11.5, color:'#E0664A', marginTop:10, lineHeight:1.4}}>{en?'This time hasn\'t come yet today — set to the current time.':'Это время сегодня ещё не наступило — поставили текущее.'}</div>
                  : <div style={{textAlign:'center', fontFamily:'"Manrope",sans-serif', fontSize:11.5, color:th.muted, marginTop:10}}>{T.exactHint}</div>}
              </div>
            )}

            {b.timeMode === 'approx' && (
              <div>
                <div style={{fontFamily:'"Manrope",sans-serif', fontSize:11.5, color:th.muted, marginBottom:10, textAlign:'center'}}>{T.approxHint}</div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                  {approxBtn('morning')} {approxBtn('day')} {approxBtn('evening')} {approxBtn('night')}
                </div>
              </div>
            )}

            {b.timeMode === 'unknown' && (
              <div style={{display:'flex', gap:11, alignItems:'flex-start', padding:'4px 4px 2px'}}>
                <div style={{flexShrink:0, marginTop:1}}><ApproxGlyph kind="night" size={24} color={th.glyphClr}/></div>
                <div style={{fontFamily:'"Manrope",sans-serif', fontSize:12.5, lineHeight:1.5, color:th.inkSoft, textWrap:'pretty'}}>{T.unknownHint}</div>
              </div>
            )}
          </div>
        </EditField>

        {/* CITY */}
        <EditField th={th} icon="pin" label={T.city} value={cityVal} open={open==='city'} onToggle={() => setOpen(open==='city'?null:'city')}>
          <CitySearch th={th} lang={lang} value={b.city} onPick={(c) => { setB({ ...b, city: c }); setOpen(null); }}/>
        </EditField>

        {/* RESIDENCE (свой профиль + онбординг, но не партнёр) — нужен для соляра */}
        {(!showName || onboarding) && (
          <EditField th={th} icon="home" label={T.residence}
            value={b.residence ? (en ? b.residence.en : b.residence.ru) : T.sameAsBirth}
            open={open==='res'} onToggle={() => setOpen(open==='res'?null:'res')}>
            <div style={{marginTop:10}}>
              <div style={{display:'flex', gap:5, background: th.effDark?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.55)', borderRadius:13, padding:4, marginBottom: b.residence ? 12 : 4}}>
                <button onClick={() => setB({ ...b, residence: null })} style={{flex:1, padding:'9px 4px', border:'none', cursor:'pointer', background: !b.residence ? th.accent : 'transparent', color: !b.residence ? '#fff' : th.inkSoft, fontFamily:'"Manrope",sans-serif', fontWeight: !b.residence ? 700 : 600, fontSize:12.5, borderRadius:11, transition:'background .15s'}}>{T.sameAsBirth}</button>
                <button onClick={() => setB({ ...b, residence: b.residence || b.city })} style={{flex:1, padding:'9px 4px', border:'none', cursor:'pointer', background: b.residence ? th.accent : 'transparent', color: b.residence ? '#fff' : th.inkSoft, fontFamily:'"Manrope",sans-serif', fontWeight: b.residence ? 700 : 600, fontSize:12.5, borderRadius:11, transition:'background .15s'}}>{T.otherCity}</button>
              </div>
              {b.residence && <CitySearch th={th} lang={lang} value={b.residence} onPick={(c) => { setB({ ...b, residence: c }); setOpen(null); }}/>}
              <div style={{display:'flex', gap:9, alignItems:'flex-start', padding:'10px 2px 2px'}}>
                <div style={{flexShrink:0, marginTop:1}}><BeIco name="home" size={15} color={th.glyphClr} sw={1.6}/></div>
                <div style={{fontFamily:'"Manrope",sans-serif', fontSize:11.5, lineHeight:1.5, color:th.muted, textWrap:'pretty'}}>{T.residenceHint}</div>
              </div>
            </div>
          </EditField>
        )}

        {/* Согласие (только онбординг) — в самом низу формы, видно при прокрутке вниз,
            чтобы не мешало заполнять поля выше. */}
        {onboarding && (
          <button onClick={() => setConsent(c => !c)} style={{
            display:'flex', alignItems:'flex-start', gap:11, width:'100%', textAlign:'left',
            background: th.glass, border:`1px solid ${consent ? th.accent+'70' : th.glassBorder}`,
            borderRadius:16, cursor:'pointer', padding:'14px 16px', marginTop:4,
            backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
          }}>
            <div style={{
              width:22, height:22, borderRadius:7, flexShrink:0, marginTop:1,
              border:`2px solid ${consent ? th.accent : th.muted}`,
              background: consent ? th.accent : 'transparent',
              display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s',
            }}>
              {consent && <BeIco name="check" size={13} color="#fff" sw={2.6}/>}
            </div>
            <span style={{fontFamily:'"Manrope",sans-serif', fontSize:12, lineHeight:1.45, color:th.inkSoft, textWrap:'pretty'}}>
              {en
                ? 'I have read and accept the Privacy Policy and Terms of Service'
                : 'Я ознакомлен(а) и согласен(на) с политикой конфиденциальности и пользовательским соглашением'}
            </span>
          </button>
        )}
      </div>

      {/* ── Save footer ── */}
      <div style={{flexShrink:0, padding:'12px 18px', paddingBottom:30, background: th.effDark ? 'rgba(10,6,22,0.72)' : 'rgba(248,245,255,0.72)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderTop:`1px solid ${th.glassBorder}`}}>

        {(() => {
          const nameOk = !nameVisible || (b.name && b.name.trim().length > 0);
          const cityOk = !!b.city;
          const dateOk = !!(b.day && b.month && b.year);
          const timeOk = !!b.timeMode && (b.timeMode !== 'approx' || !!b.approx);
          // Ограничение 18+ — только для своего профиля (не партнёр / не чужая карта).
          const isSelf = !showName;
          let age = null;
          if (b.day && b.month && b.year) {
            const t = new Date();
            age = t.getFullYear() - b.year;
            const m = t.getMonth() + 1, d = t.getDate();
            if (m < b.month || (m === b.month && d < b.day)) age--;
          }
          const underage = isSelf && age != null && age < 18;
          const canSubmit = (onboarding ? (nameOk && cityOk && dateOk && timeOk && consent) : true) && !underage;
          return (
            <React.Fragment>
            {underage && (
              <div style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:12,padding:'11px 13px',borderRadius:12,background:'rgba(220,75,42,0.12)',border:'1px solid rgba(220,75,42,0.32)'}}>
                <span style={{flexShrink:0,fontSize:14,lineHeight:1.3}}>🔞</span>
                <span style={{fontFamily:'"Manrope",sans-serif',fontSize:12,lineHeight:1.45,color:th.ink,textWrap:'pretty'}}>
                  {en ? 'You must be 18 or older to use the app. Please enter a valid date of birth.'
                      : 'Приложением могут пользоваться только лица старше 18 лет. Укажи корректную дату рождения.'}
                </span>
              </div>
            )}
            <button disabled={!canSubmit} onClick={() => {
              if (!canSubmit) return;
              // Для своего профиля (не партнёр, не онбординг) — предупреждение при смене даты
              const dateChanged = !nameVisible && (
                b.day !== initial.day || b.month !== initial.month || b.year !== initial.year
              );
              if (dateChanged) { setDateWarn(true); } else { onSave(b); }
            }} style={{
              display:'flex', width:'100%', justifyContent:'center', alignItems:'center', gap:8, height:52,
              borderRadius:999, border:'none', cursor: canSubmit ? 'pointer' : 'default',
              background: canSubmit ? th.accent : (th.effDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'),
              color: canSubmit ? '#fff' : th.muted, opacity: canSubmit ? 1 : 0.7,
              fontFamily:'"Manrope",sans-serif', fontWeight:700, fontSize:15.5,
              boxShadow: canSubmit ? `0 8px 26px ${th.accentGlow}` : 'none',
            }}>
              <BeIco name="check" size={18} color={canSubmit ? '#fff' : th.muted} sw={2}/>
              {onboarding ? (en ? 'Continue' : 'Продолжить') : T.save}
            </button>
            </React.Fragment>
          );
        })()}
      </div>

      {/* ── Предупреждение: дату можно менять только 1 раз ── */}
      {dateWarn && (
        <div style={{position:'absolute',inset:0,zIndex:50,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'}}>
          <div style={{width:'100%',background:th.effDark?'#1a1430':'#fff',borderRadius:'24px 24px 0 0',padding:'28px 22px 36px',boxShadow:'0 -8px 40px rgba(0,0,0,0.3)'}}>
            <div style={{width:40,height:4,borderRadius:99,background:th.glassBorder,margin:'0 auto 20px'}}/>
            <div style={{fontSize:28,textAlign:'center',marginBottom:12}}>⚠️</div>
            <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:20,color:th.ink,textAlign:'center',marginBottom:10,lineHeight:1.2}}>
              {en ? 'Date of birth can be changed only once' : 'Дату рождения можно изменить только один раз'}
            </div>
            <div style={{fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.inkSoft,textAlign:'center',lineHeight:1.5,marginBottom:24,textWrap:'pretty'}}>
              {en
                ? 'This protects your natal chart from being reused for other people. After saving, the date will be locked forever.'
                : 'Это защита от переиспользования натальной карты для других людей. После сохранения дата будет заблокирована навсегда.'}
            </div>
            <button onClick={() => { setDateWarn(false); onSave(b); }} style={{
              width:'100%',height:52,borderRadius:999,border:'none',cursor:'pointer',
              background:th.accent,color:'#fff',fontFamily:'"Manrope",sans-serif',
              fontWeight:700,fontSize:15,marginBottom:10,
              boxShadow:`0 8px 26px ${th.accentGlow}`,
            }}>
              {en ? 'Confirm change' : 'Подтвердить изменение'}
            </button>
            <button onClick={() => setDateWarn(false)} style={{
              width:'100%',height:46,borderRadius:999,border:`1px solid ${th.glassBorder}`,
              cursor:'pointer',background:'transparent',color:th.inkSoft,
              fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:14,
            }}>
              {en ? 'Cancel' : 'Отмена'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════
Object.assign(window, {
  BirthDataEditor, DEFAULT_BIRTH, CITIES, CitySearch,
  fmtBirthDate, fmtBirthTime, fmtBirthCity,
  resolveBirthForChart, sunSignInfo, sunSignIdxFromDate,
  cityZone, zoneOffsetHours,
  APPROX_LBL,
});
