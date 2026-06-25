// milestones.jsx — "Жизненные вехи" UI · topic picker + timeline of windows
// Renders on top of the natal/birth engine. Self-contained icons + tone palette.
// Exports MilestonesIntakeScreen + MilestonesResultScreen to window.

const { useState: useStateMs, useEffect: useEffectMs, useRef: useRefMs } = React;

// Метки промиссоров-углов для дирекций (нет в PL_META)
const MS_PROM_LBL = {
  dc: { ru: 'Десцендент', en: 'Descendant' }, mc: { ru: 'MC', en: 'MC' },
  asc: { ru: 'Асцендент', en: 'Ascendant' }, ic: { ru: 'IC', en: 'IC' },
  rulerVII: { ru: 'упр. VII', en: 'ruler VII' }, rulerX: { ru: 'упр. X', en: 'ruler X' },
};

// ═══════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════
function MsIco({ name, size = 24, color = 'currentColor', sw = 1.6, style }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    // theme glyphs
    case 'rings':   return (<svg {...c}><circle cx="9" cy="14" r="5.4"/><circle cx="15" cy="14" r="5.4"/><path d="M9 4.2 12 7l3-2.8"/><path d="M12 7V3.4" opacity="0.7"/></svg>);
    case 'split':   return (<svg {...c}><path d="M12 20S4.5 14.6 4.5 9.2A3.7 3.7 0 0 1 11 6.7"/><path d="M12 20s7.5-5.4 7.5-10.8A3.7 3.7 0 0 0 13 6.7"/><path d="M13 4l-2 4 2.3 2-2.3 3"/></svg>);
    case 'child':   return (<svg {...c}><circle cx="12" cy="6" r="2.4"/><path d="M12 10v5M8.5 12h7M9 20l3-5 3 5"/></svg>);
    case 'rise':    return (<svg {...c}><path d="M4 20h16"/><path d="M7 20v-5M12 20V9M17 20v-8"/><path d="M5.5 9 11 4.5l2.5 2L19 3"/><path d="M19 3v3.4M19 3h-3.3" opacity="0.85"/></svg>);
    case 'swap':    return (<svg {...c}><path d="M5 8h12l-3-3M5 8l3 3"/><path d="M19 16H7l3 3M19 16l-3-3"/></svg>);
    case 'exit':    return (<svg {...c}><path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/><path d="M16 8l4 4-4 4M20 12h-9"/></svg>);
    case 'move':    return (<svg {...c}><path d="M3 11.5 9.5 6l6.5 5.5"/><path d="M5 10.5V18h9v-7.5"/><path d="M14 14h7m0 0-2.6-2.6M21 14l-2.6 2.6"/></svg>);
    case 'key':     return (<svg {...c}><circle cx="8" cy="8" r="4"/><path d="M11 11l8 8M16 16l2-2M18.5 18.5 20.5 16.5"/></svg>);
    case 'travel':  return (<svg {...c}><path d="M21 4 3 11l6 2.2L11 20l3.4-5.6L21 4Z"/><path d="m9 13.2 5.4-4.6" opacity="0.7"/></svg>);
    case 'injury':  return (<svg {...c}><rect x="3.5" y="6" width="17" height="12" rx="3.4"/><path d="M6.5 12h3l1.4-3 2.2 6 1.4-3h3" /></svg>);
    case 'surgery': return (<svg {...c}><circle cx="12" cy="12" r="8.4"/><path d="M12 7.6v8.8M7.6 12h8.8"/></svg>);
    // chrome
    case 'edit':    return (<svg {...c}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>);
    case 'arrowR':  return (<svg {...c}><path d="M4 12h15M13 6l6 6-6 6"/></svg>);
    case 'pin':     return (<svg {...c}><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>);
    case 'cal':     return (<svg {...c}><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>);
    case 'info':    return (<svg {...c}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.01"/></svg>);
    case 'scan':    return (<svg {...c}><path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16"/><path d="M3 12h18" opacity="0.85"/></svg>);
    case 'spark':   return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}><path d="M12 1.5c.5 4.7 2.3 6.5 7 7-4.7.5-6.5 2.3-7 7-.5-4.7-2.3-6.5-7-7 4.7-.5 6.5-2.3 7-7Z"/></svg>);
    default: return null;
  }
}

// ═══════════════════════════════════════════════════════
// TONE PALETTE  (polarity × aspect-bucket → label + colour)
// ═══════════════════════════════════════════════════════
function msTone(polarity, bucket, th, lang) {
  const en = lang === 'en';
  const green = th.effDark ? '#5FC2A2' : '#1C7355';
  const red = th.effDark ? '#E8806F' : '#C03828';
  const gold = th.gold;
  const accent = th.glyphClr;
  const muted = th.muted;
  const T = {
    growth:  { soft: ['Возможность', 'Opportunity', green],   conj: ['Поворот к лучшему', 'Breakthrough', gold],  hard: ['Рост через усилие', 'Growth through effort', accent] },
    change:  { soft: ['Лёгкая перемена', 'Easy shift', green], conj: ['Поворотный момент', 'Turning point', accent], hard: ['Вынужденная перемена', 'Forced shift', red] },
    rupture: { soft: ['Развязка', 'Resolution', muted],        conj: ['Перелом', 'Rupture', accent],                hard: ['Кризис', 'Crisis', red] },
    body:    { soft: ['Восстановление', 'Recovery', green],    conj: ['Уязвимый период', 'Sensitive spell', gold], hard: ['Зона риска', 'Risk zone', red] },
  };
  const row = (T[polarity] || T.growth)[bucket] || T.growth.conj;
  return { label: en ? row[1] : row[0], c: row[2] };
}

// ═══════════════════════════════════════════════════════
// DATE HELPERS
// ═══════════════════════════════════════════════════════
const MS_MON_RU = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MS_MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function msMonthYear(ms, lang) {
  const d = new Date(ms);
  return `${(lang === 'en' ? MS_MON_EN : MS_MON_RU)[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function msBand(startMs, endMs, lang) {
  const a = msMonthYear(startMs, lang), b = msMonthYear(endMs, lang);
  return a === b ? a : `${a} — ${b}`;
}
function msAgeAt(ms, birth) {
  const birthMs = Date.UTC(birth.year, birth.month - 1, birth.day);
  return Math.max(0, Math.floor((ms - birthMs) / (365.2422 * 86400000)));
}
function ageWord(n, lang) {
  if (lang === 'en') return `at ${n}`;
  const a = n % 10, b = n % 100;
  let w = 'лет';
  if (a === 1 && b !== 11) w = 'год';
  else if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) w = 'года';
  return `в ${n} ${w}`;
}
function plWindows(n, lang) {
  if (lang === 'en') return n === 1 ? 'window' : 'windows';
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return 'окно';
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return 'окна';
  return 'окон';
}

// ═══════════════════════════════════════════════════════
// SHARED bits
// ═══════════════════════════════════════════════════════
function PlGlyph({ id, size = 15 }) {
  const m = window.PL_META[id];
  if (window.PGlyph) return window.PGlyph({ id, size, color: m.col, bold: true });
  return <span style={{ fontFamily: 'serif', fontSize: size, lineHeight: 1, color: m.col, fontWeight: 'bold' }}>{m.g}</span>;
}

function MsSection({ th, title, sub, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10.5, letterSpacing: 1.8, textTransform: 'uppercase', color: th.muted, marginBottom: sub ? 3 : 10 }}>{title}</div>
      {sub && <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, color: th.muted, marginBottom: 10, lineHeight: 1.4 }}>{sub}</div>}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// INTAKE — method note + birth chip + topic picker
// ═══════════════════════════════════════════════════════
function MilestonesIntakeScreen({ th, lang, birth, userName, onEditBirth, onChoose }) {
  const en = lang === 'en';
  const M = window.MILESTONES;
  const unknown = birth.timeMode === 'unknown';

  return (
    <div style={{ padding: '6px 18px 28px', position: 'relative', zIndex: 1 }}>

      {/* method explainer */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: th.glassStrong, border: `1px solid ${th.glassBorder}`, borderRadius: 18, padding: '15px 16px', marginBottom: 16, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${th.accent}24`, border: `1px solid ${th.accent}44` }}>
          <MsIco name="scan" size={21} color={th.glyphClr} sw={1.5}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 16, color: th.ink, marginBottom: 4, lineHeight: 1.15 }}>{en ? 'How we find the dates' : 'Как находим даты'}</div>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, lineHeight: 1.5, color: th.inkSoft, textWrap: 'pretty' }}>
            {en
              ? 'Pick a theme — we scan the slow planets (Jupiter → Pluto) for every year they touch its significators by aspect, and lay the windows on a timeline.'
              : 'Выбери тему — мы сканируем медленные планеты (Юпитер → Плутон) и находим по аспектам все периоды, когда они задевают значимые точки твоей карты, и раскладываем их на таймлайне.'}
          </div>
        </div>
      </div>

      {/* birth chip */}
      <button onClick={onEditBirth} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', textAlign: 'left',
        background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: 16, padding: '11px 14px', marginBottom: 18,
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', color: th.ink,
      }}>
        <MsIco name="cal" size={17} color={th.muted} sw={1.6}/>
        <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 12.5, color: th.ink }}>{fmtBirthDate(birth)}</span>
        <span style={{ color: th.muted }}>·</span>
        <MsIco name="pin" size={15} color={th.muted} sw={1.6}/>
        <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 12.5, color: th.ink, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtBirthCity(birth, lang)}</span>
        <MsIco name="edit" size={14} color={th.glyphClr} sw={1.6}/>
      </button>

      {unknown && (
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: 'rgba(242,192,96,0.12)', border: '1px solid rgba(242,192,96,0.3)', marginBottom: 18 }}>
          <span style={{ flexShrink: 0, fontSize: 13, color: '#F2C060', lineHeight: 1.4 }}>☽</span>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, lineHeight: 1.5, color: th.inkSoft, textWrap: 'pretty' }}>
            {en
              ? 'Birth time unknown — themes tied to houses (career, home, relationships) lean on planet significators only and read as direction, not precision. Add a time for sharper windows.'
              : 'Время рождения неизвестно — темы, завязанные на дома (карьера, дом, отношения), считаются только по планетам и дают направление, а не точность. Добавь время для более чётких окон.'}
          </div>
        </div>
      )}

      {/* topic picker grouped by category */}
      {M.CATEGORIES.map((cat) => {
        const themes = M.THEMES.filter((t) => t.cat === cat.id);
        return (
          <div key={cat.id} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: th.gold, marginBottom: 9, paddingLeft: 2 }}>{cat.title[lang]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {themes.map((t) => (
                <button key={t.id} onClick={() => onChoose(t.id)} style={{
                  textAlign: 'left', cursor: 'pointer', background: th.glass, border: `1px solid ${th.glassBorder}`,
                  borderRadius: 16, padding: '13px 13px 12px', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  color: th.ink, display: 'flex', flexDirection: 'column', gap: 0, minHeight: 112,
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${th.accent}22`, border: `1px solid ${th.accent}40`, marginBottom: 9 }}>
                    <MsIco name={t.glyph} size={21} color={th.glyphClr} sw={1.5}/>
                  </div>
                  <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 15.5, lineHeight: 1.05, color: th.ink, marginBottom: 4 }}>{t.title[lang]}</div>
                  <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, lineHeight: 1.32, color: th.inkSoft, textWrap: 'pretty' }}>{t.blurb[lang]}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 6 }}>
        <MsIco name="info" size={14} color={th.muted} sw={1.6} style={{ flexShrink: 0, marginTop: 1 }}/>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, lineHeight: 1.45, color: th.muted, textWrap: 'pretty' }}>
          {en ? 'Astrology marks windows of probability, not fixed fate — read them as timing, not a verdict.' : 'Астрология отмечает окна вероятности, а не предрешённую судьбу — читай их как тайминг, а не приговор.'}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TIMELINE STRIP
// ═══════════════════════════════════════════════════════
function MsTimeline({ th, lang, result, activeIdx, onDot }) {
  const en = lang === 'en';
  const startMs = Date.UTC(result.range.startY, 0, 1);
  const endMs = Date.UTC(result.range.endY, 11, 31);
  const span = endMs - startMs || 1;
  const frac = (ms) => Math.max(0, Math.min(1, (ms - startMs) / span));
  const nowMs = Date.now();
  const nowF = frac(nowMs);

  return (
    <div style={{ background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: 16, padding: '18px 16px 12px', marginBottom: 22, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
      <div style={{ position: 'relative', height: 50 }}>
        {/* axis */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 25, height: 2, borderRadius: 2, background: th.glassBorder }}/>
        {/* now marker */}
        <div style={{ position: 'absolute', top: 6, bottom: 6, left: `${nowF * 100}%`, width: 1.5, background: th.gold, opacity: 0.8 }}/>
        <div style={{ position: 'absolute', top: -4, left: `${nowF * 100}%`, transform: 'translateX(-50%)', fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 8.5, letterSpacing: 0.8, color: th.gold, whiteSpace: 'nowrap' }}>{en ? 'NOW' : 'СЕЙЧАС'}</div>
        {/* window dots */}
        {result.windows.map((w, i) => {
          const tone = msTone(result.theme.polarity, w.bucket, th, lang);
          const x = frac(w.peakMs) * 100;
          const r = 5 + w.intensity * 1.1;
          const sel = i === activeIdx;
          return (
            <button key={i} onClick={() => onDot(i)} title={msMonthYear(w.peakMs, lang)} style={{
              position: 'absolute', top: 25, left: `${x}%`, transform: 'translate(-50%,-50%)',
              width: r * 2, height: r * 2, borderRadius: 999, padding: 0, cursor: 'pointer',
              background: tone.c, border: `2px solid ${sel ? th.ink : (th.effDark ? 'rgba(10,6,22,0.9)' : '#fff')}`,
              opacity: w.past && !w.active ? 0.5 : 1,
              boxShadow: sel ? `0 0 0 4px ${tone.c}40` : 'none',
            }}/>
          );
        })}
      </div>
      {/* year ticks */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10, color: th.muted }}>{result.range.startY}</span>
        <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10, color: th.muted }}>{result.range.endY}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WINDOW CARD
// ═══════════════════════════════════════════════════════
function MsWindowCard({ th, lang, result, w, refEl, highlight }) {
  const en = lang === 'en';
  const tone = msTone(result.theme.polarity, w.bucket, th, lang);
  const M = window.MILESTONES;
  const text = M.interpFor(result.theme.id, w.bucket, lang);

  return (
    <div ref={refEl} style={{
      background: th.glass, border: `1px solid ${highlight ? tone.c + '99' : th.glassBorder}`,
      borderRadius: 18, padding: '15px 16px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      position: 'relative', overflow: 'hidden',
      boxShadow: highlight ? `0 0 0 3px ${tone.c}26` : 'none', transition: 'box-shadow .25s, border-color .25s',
      opacity: w.past && !w.active ? 0.82 : 1,
    }}>
      {/* tone rail */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: tone.c, opacity: 0.85 }}/>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10, paddingLeft: 6 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 17, color: th.ink, lineHeight: 1.12 }}>{msBand(w.startMs, w.endMs, lang)}</div>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, color: th.muted, marginTop: 3 }}>
            {en ? 'peak' : 'пик'} · {msMonthYear(w.peakMs, lang)} · {ageWord(msAgeAt(w.peakMs, result.birth), lang)}
            {w.active ? (en ? ' · active now' : ' · идёт сейчас') : ''}
          </div>
        </div>
        <span style={{ flexShrink: 0, fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 0.6, color: tone.c, background: tone.c + '1F', border: `1px solid ${tone.c}55`, borderRadius: 999, padding: '4px 9px', whiteSpace: 'nowrap' }}>{tone.label}</span>
      </div>

      {/* triggers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 11, paddingLeft: 6 }}>
        {w.triggers.slice(0, 3).map((tr, i) => {
          const asp = M.aspMeta(tr.asp.key);
          const isDir = String(tr.T).indexOf('dir:') === 0;
          const pid = isDir ? tr.T.slice(4) : tr.T;
          const promLbl = MS_PROM_LBL[pid];
          const pmeta = window.PL_META[pid];
          const pname = promLbl ? (en ? promLbl.en : promLbl.ru) : (pmeta ? pmeta[en ? 'en' : 'ru'] : pid);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {pmeta ? <PlGlyph id={pid} size={15}/> : <span style={{ width: 15, textAlign: 'center', color: th.glyphClr, fontSize: 12 }}>✦</span>}
              <span style={{ fontFamily: 'serif', fontSize: 13, color: th.muted, minWidth: 14, textAlign: 'center' }}>{asp.sym}</span>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 11.5, color: i === 0 ? th.ink : th.inkSoft }}>
                {isDir ? (en ? 'dir. ' : 'дир. ') : ''}{pname} {en ? asp.en : asp.ru}
              </span>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: th.muted }}>· {tr.tg.lbl[lang]}</span>
              {tr.passes > 1 && <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 9, fontWeight: 700, color: th.gold, marginLeft: 'auto' }}>×{tr.passes}</span>}
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.55, color: th.inkSoft, margin: '0 0 10px', paddingLeft: 6, textWrap: 'pretty' }}>{text}</p>

      {/* intensity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 6 }}>
        <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', color: th.muted }}>{en ? 'Intensity' : 'Сила'}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} style={{ width: 6, height: 6, borderRadius: 999, background: n <= w.intensity ? tone.c : th.glassBorder }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// RESULT SCREEN
// ═══════════════════════════════════════════════════════
function MilestonesResultScreen({ th, lang, birth, themeId }) {
  const en = lang === 'en';
  const M = window.MILESTONES;
  const [result, setResult] = useStateMs(null);
  const [error, setError] = useStateMs(null);
  const [activeIdx, setActiveIdx] = useStateMs(null);
  const cardRefs = useRefMs({});

  useEffectMs(() => {
    setResult(null); setError(null); setActiveIdx(null);
    const id = setTimeout(() => {
      try {
        const r = M.scanMilestones(birth, themeId);
        r.birth = birth;
        setResult(r);
      } catch (e) { setError(e.message); }
    }, 40);
    return () => clearTimeout(id);
  }, [birth, themeId, lang]);

  const theme = M.THEMES.find((t) => t.id === themeId);

  const jumpTo = (i) => {
    setActiveIdx(i);
    const el = cardRefs.current[i];
    if (el && el.parentElement) {
      const sc = el.closest('[data-ms-scroll]');
      if (sc) sc.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
    }
  };

  if (error) return (
    <div style={{ padding: '40px 18px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.muted }}>{en ? 'Calculation error: ' : 'Ошибка расчёта: '}{error}</div>
    </div>
  );

  if (!result) return (
    <div style={{ padding: '70px 18px', textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <span style={{ width: 30, height: 30, borderRadius: '50%', border: `2.5px solid ${th.muted}`, borderTopColor: 'transparent', display: 'inline-block', animation: 'astroSpin .7s linear infinite' }}/>
      <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.muted }}>{en ? 'Scanning the years…' : 'Сканирую годы…'}</div>
    </div>
  );

  const future = result.windows.filter((w) => !w.past || w.active);
  const past = result.windows.filter((w) => w.past && !w.active);

  return (
    <div data-ms-scroll style={{ padding: '6px 18px 36px', position: 'relative', zIndex: 1 }}>

      {/* hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
        <div style={{ width: 58, height: 58, borderRadius: 17, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: th.glassStrong, border: `1px solid ${th.glassBorder}`, boxShadow: `0 0 22px ${th.accentGlow}` }}>
          <MsIco name={theme.glyph} size={30} color={th.glyphClr} sw={1.4}/>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 26, color: th.ink, lineHeight: 1.04 }}>{theme.title[lang]}</div>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, color: th.inkSoft, marginTop: 3 }}>
            {result.windows.length} {plWindows(result.windows.length, lang)} · {result.range.startY}–{result.range.endY}
          </div>
        </div>
      </div>

      {/* significators / method */}
      <div style={{ background: th.glassStrong, border: `1px solid ${th.glassBorder}`, borderRadius: 16, padding: '13px 15px', marginBottom: 18, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: th.gold, marginBottom: 8 }}>{en ? 'Searched by aspect' : 'Ищем по аспектам'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 9 }}>
          <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: th.muted }}>{en ? 'Transits:' : 'Транзиты:'}</span>
          {theme.transiters.map((id) => (
            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: th.chip, border: `1px solid ${th.glassBorder}` }}>
              <PlGlyph id={id} size={13}/>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 10.5, color: th.inkSoft }}>{window.PL_META[id][en ? 'en' : 'ru']}</span>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: th.muted }}>{en ? 'to points:' : 'к точкам:'}</span>
          <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 11.5, color: th.ink, lineHeight: 1.5 }}>
            {result.significators.map((s) => s[lang]).join(' · ')}
          </span>
        </div>
      </div>

      {result.approxHouses && (
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '11px 14px', borderRadius: 14, background: `${th.accent}14`, border: `1px solid ${th.accent}33`, marginBottom: 18 }}>
          <span style={{ flexShrink: 0, fontSize: 13, color: th.glyphClr, lineHeight: 1.4 }}>✦</span>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, lineHeight: 1.5, color: th.inkSoft, textWrap: 'pretty' }}>
            {en ? 'Approximate birth time — windows tied to angles and houses are indicative.' : 'Время рождения примерное — окна, завязанные на углы и дома, ориентировочны.'}
          </div>
        </div>
      )}
      {result.droppedHouseTargets && (
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '11px 14px', borderRadius: 14, background: 'rgba(242,192,96,0.12)', border: '1px solid rgba(242,192,96,0.3)', marginBottom: 18 }}>
          <span style={{ flexShrink: 0, fontSize: 13, color: '#F2C060', lineHeight: 1.4 }}>☽</span>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, lineHeight: 1.5, color: th.inkSoft, textWrap: 'pretty' }}>
            {en ? 'No birth time — houses and angles are left out, so this theme is timed by planet significators only.' : 'Без времени рождения дома и углы не считаются — тема построена только по планетам-сигнификаторам.'}
          </div>
        </div>
      )}

      {result.windows.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: 16 }}>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, color: th.muted, lineHeight: 1.5 }}>
            {en ? 'No strong activations in this range. The theme stays quiet over these years.' : 'В этом диапазоне нет сильных активаций. Тема остаётся спокойной в эти годы.'}
          </div>
        </div>
      ) : (
        <React.Fragment>
          <MsTimeline th={th} lang={lang} result={result} activeIdx={activeIdx} onDot={jumpTo}/>

          {past.length > 0 && (
            <MsSection th={th} title={en ? 'Behind you' : 'Позади'} sub={en ? 'Past activations — useful to check the method against your life' : 'Прошедшие активации — сверь метод со своей жизнью'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {past.map((w) => {
                  const idx = result.windows.indexOf(w);
                  return <MsWindowCard key={idx} th={th} lang={lang} result={result} w={w} refEl={(el) => { cardRefs.current[idx] = el; }} highlight={activeIdx === idx}/>;
                })}
              </div>
            </MsSection>
          )}

          {future.length > 0 && (
            <MsSection th={th} title={en ? 'Ahead' : 'Впереди'} sub={en ? 'Upcoming windows to watch' : 'Будущие окна, за которыми стоит следить'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {future.map((w) => {
                  const idx = result.windows.indexOf(w);
                  return <MsWindowCard key={idx} th={th} lang={lang} result={result} w={w} refEl={(el) => { cardRefs.current[idx] = el; }} highlight={activeIdx === idx}/>;
                })}
              </div>
            </MsSection>
          )}
        </React.Fragment>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8 }}>
        <MsIco name="info" size={14} color={th.muted} sw={1.6} style={{ flexShrink: 0, marginTop: 1 }}/>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, lineHeight: 1.45, color: th.muted, textWrap: 'pretty' }}>
          {en ? 'Windows show when a theme is most likely to come alive — a prompt to act with awareness, not a guarantee of the event.' : 'Окна показывают, когда тема вероятнее всего оживает — это повод действовать осознанно, а не гарантия события.'}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════
Object.assign(window, { MilestonesIntakeScreen, MilestonesResultScreen });
