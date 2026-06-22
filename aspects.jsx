// aspects.jsx — "Аспекты на месяц" UI · month nav + key / secondary aspect cards
// Self-contained icons + formatting. Exports AspectsMonthScreen to window.

const { useState: useStateAs, useEffect: useEffectAs } = React;

function AsIco({ name, size = 20, color = 'currentColor', sw = 1.7, style }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'cal':    return (<svg {...c}><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>);
    case 'chevL':  return (<svg {...c}><path d="M15 5l-7 7 7 7"/></svg>);
    case 'chevR':  return (<svg {...c}><path d="M9 5l7 7-7 7"/></svg>);
    case 'chevD':  return (<svg {...c}><path d="M5 8l7 7 7-7"/></svg>);
    case 'info':   return (<svg {...c}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.01"/></svg>);
    case 'dot':    return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}><circle cx="12" cy="12" r="4"/></svg>);
    case 'bolt':   return (<svg {...c}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>);
    default: return null;
  }
}

const AS_MON_NOM_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const AS_MON_NOM_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const AS_MON_SHORT_RU = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const AS_MON_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function asDay(ms, lang) {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${(lang === 'en' ? AS_MON_SHORT_EN : AS_MON_SHORT_RU)[d.getUTCMonth()]}`;
}

// tone of an aspect bucket
function asBucketTone(bucket, th, lang) {
  const en = lang === 'en';
  const green = th.effDark ? '#5FC2A2' : '#1C7355';
  const red = th.effDark ? '#E8806F' : '#C03828';
  if (bucket === 'soft') return { label: en ? 'Support' : 'Поддержка', c: green };
  if (bucket === 'hard') return { label: en ? 'Tension' : 'Напряжение', c: red };
  return { label: en ? 'Fusion' : 'Слияние', c: th.gold };
}

function AsPlGlyph({ id, size = 16 }) {
  const m = window.PL_META[id];
  if (!m) return <span style={{ fontFamily: 'serif', fontSize: size, fontWeight: 700 }}>{id === 'asc' ? 'Asc' : id === 'mc' ? 'MC' : '?'}</span>;
  if (window.PGlyph) return window.PGlyph({ id, size, color: m.col, bold: true });
  return <span style={{ fontFamily: 'serif', fontSize: size, lineHeight: 1, color: m.col, fontWeight: 'bold' }}>{m.g}</span>;
}
// natal-point glyph (planets have a glyph; angles render as a label)
function AsNatalGlyph({ id, size = 16, th }) {
  if (id === 'asc' || id === 'mc') {
    return <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: size * 0.62, fontWeight: 800, letterSpacing: 0.4, color: th.glyphClr }}>{id.toUpperCase()}</span>;
  }
  return <AsPlGlyph id={id} size={size}/>;
}

// status chips for a period
function asStatusChips(e, th, lang) {
  const en = lang === 'en';
  const chips = [];
  if (e.activeNow) chips.push({ t: en ? 'active now' : 'идёт сейчас', c: th.gold, fill: true });
  if (e.allMonth) chips.push({ t: en ? 'all month' : 'весь месяц', c: th.muted });
  else {
    if (e.startsBefore) chips.push({ t: en ? 'began earlier' : 'началось раньше', c: th.muted });
    if (e.continuesAfter) chips.push({ t: en ? 'continues' : 'продлится', c: th.muted });
  }
  return chips.slice(0, 2);
}

// ═══════════════════════════════════════════════════════
// ASPECT CARD
// ═══════════════════════════════════════════════════════
function AsAspectCard({ th, lang, e, compact }) {
  const en = lang === 'en';
  const A = window.ASPECTS;
  const [open, setOpen] = useStateAs(!compact);
  const asp = e.asp;
  const tone = asBucketTone(asp.bucket, th, lang);
  const tags = A.influenceTags(e);
  const chips = asStatusChips(e, th, lang);

  const exactStr = e.exacts.length
    ? e.exacts.map((ms) => asDay(ms, lang)).join(', ')
    : (en ? 'in orb, no exact hit this span' : 'в орбисе, без точного пика');

  const trio = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <AsPlGlyph id={e.T} size={compact ? 15 : 17}/>
      <span style={{ fontFamily: 'serif', fontSize: compact ? 13 : 15, color: asp.col, minWidth: 14, textAlign: 'center' }}>{asp.sym}</span>
      <AsNatalGlyph id={e.N} size={compact ? 15 : 17} th={th}/>
    </div>
  );

  const titleLine = `${A.plName(e.T, lang)} ${en ? asp.en.toLowerCase() : asp.ru.toLowerCase()} ${en ? '' : ''}${A.natalLabel(e.N, lang)}`;

  return (
    <div style={{
      background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: compact ? 14 : 18,
      padding: compact ? '11px 14px' : '14px 16px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      position: 'relative', overflow: 'hidden', opacity: e.activeNow ? 1 : 0.96,
    }}>
      {!compact && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: asp.col, opacity: 0.8 }}/>}

      {/* head */}
      <button onClick={() => compact && setOpen((o) => !o)} style={{
        width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: compact ? 'pointer' : 'default',
        color: th.ink, padding: 0, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: compact ? 0 : 6,
      }}>
        {trio}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: compact ? 14.5 : 16.5, color: th.ink, lineHeight: 1.12 }}>
            {A.plName(e.T, lang)} <span style={{ color: asp.col }}>{en ? asp.en : asp.ru}</span> {en ? '' : ''}
            <span style={{ color: th.inkSoft }}>{en ? '' : 'натал. '}{A.natalLabel(e.N, lang)}</span>
          </div>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, color: th.muted, marginTop: 2 }}>
            {asDay(e.startMs, lang)} — {asDay(e.endMs, lang)}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
          <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 0.5, color: tone.c, background: tone.c + '1F', border: `1px solid ${tone.c}55`, borderRadius: 999, padding: '3px 9px' }}>{tone.label}</span>
          {compact && e.house != null && !open && (
            <span style={{ fontFamily:'"Manrope",sans-serif', fontWeight:700, fontSize:9.5, color:th.glyphClr, background:`${th.accent}18`, border:`1px solid ${th.accent}3A`, borderRadius:999, padding:'3px 8px' }}>{en?'H':'Д'}{e.house}</span>
          )}
          {compact && <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .22s', flexShrink: 0 }}><AsIco name="chevD" size={15} color={th.muted}/></span>}
        </div>
      </button>

      {open && (
        <div style={{ paddingLeft: compact ? 0 : 6, marginTop: 11 }}>
          {/* period + exact */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: '"Manrope",sans-serif', fontSize: 11, color: th.inkSoft, background: th.chip, border: `1px solid ${th.glassBorder}`, borderRadius: 8, padding: '4px 9px' }}>
              <AsIco name="cal" size={13} color={th.muted} sw={1.6}/>{asDay(e.startMs, lang)} — {asDay(e.endMs, lang)}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 11, color: th.glyphClr, background: `${th.accent}18`, border: `1px solid ${th.accent}3A`, borderRadius: 8, padding: '4px 9px' }}>
              <AsIco name="bolt" size={12} color={th.glyphClr} sw={1.6}/>{en ? 'exact' : 'точно'} · {exactStr}{e.exacts.length > 1 ? ' ℞' : ''}
            </span>
          </div>

          {/* status chips */}
          {chips.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {chips.map((c, i) => (
                <span key={i} style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap', color: c.fill ? (th.effDark ? '#1a1206' : '#fff') : c.c, background: c.fill ? c.c : 'transparent', border: `1px solid ${c.c}${c.fill ? '' : '66'}`, borderRadius: 999, padding: '3px 8px' }}>{c.t}</span>
              ))}
            </div>
          )}

          {/* house badge — always shown when expanded */}
          {e.house != null && (()=>{
            const themeRu = window.HOUSE_THEME && window.HOUSE_THEME[e.house];
            const themeEn = window.ASPECTS && window.ASPECTS.houseLabelEn && window.ASPECTS.houseLabelEn(e.house);
            const theme = en ? (themeEn || '') : (themeRu || '');
            return (
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:10,
                fontFamily:'"Manrope",sans-serif', fontSize:11, fontWeight:600,
                color:th.glyphClr, background:`${th.accent}18`, border:`1px solid ${th.accent}3A`,
                borderRadius:8, padding:'4px 10px' }}>
                <span style={{ fontFamily:'var(--ds-serif)', fontWeight:700, fontSize:13 }}>{e.house}</span>
                <span style={{ opacity:0.55 }}>·</span>
                <span style={{ fontWeight:500, color:th.inkSoft }}>{en ? 'House' : 'Дом'} · {theme}</span>
              </div>
            );
          })()}

          {/* description */}
          <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.55, color: th.inkSoft, margin: '0 0 ' + (tags.length ? '10px' : '0'), textWrap: 'pretty' }}>{A.describe(e, lang)}</p>


        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MONTH SCREEN
// ═══════════════════════════════════════════════════════
function AspectsMonthScreen({ th, lang, birth }) {
  const en = lang === 'en';
  const A = window.ASPECTS;
  const now = new Date();
  const [ym, setYm] = useStateAs({ y: now.getFullYear(), m: now.getMonth() + 1 });
  const [data, setData] = useStateAs(null);
  const [error, setError] = useStateAs(null);

  useEffectAs(() => {
    setData(null); setError(null);
    const id = setTimeout(() => {
      try { setData(A.scanMonthAspects(birth, ym.y, ym.m)); }
      catch (e) { setError(e.message); }
    }, 40);
    return () => clearTimeout(id);
  }, [birth, ym.y, ym.m, lang]);

  // Отмечаем просмотр этого месяца аспектов (для уведомлений).
  useEffectAs(() => {
    if (window.AstroAPI) window.AstroAPI.markAspectViewed(ym.y, ym.m);
  }, [ym.y, ym.m]);

  const step = (d) => {
    let m = ym.m + d, y = ym.y;
    if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
    setYm({ y, m });
  };
  const isCurrent = ym.y === now.getFullYear() && ym.m === now.getMonth() + 1;

  const monName = (en ? AS_MON_NOM_EN : AS_MON_NOM_RU)[ym.m - 1];

  const navBtn = (icon, onClick) => (
    <button onClick={onClick} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${th.glassBorder}`, background: th.chip, color: th.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>{icon}</button>
  );

  return (
    <div style={{ padding: '6px 18px 34px', position: 'relative', zIndex: 1 }}>

      {/* month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {navBtn(<AsIco name="chevL" size={17} color={th.ink}/>, () => step(-1))}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 22, color: th.ink, lineHeight: 1 }}>{monName}</div>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 11, color: th.muted, marginTop: 2 }}>{ym.y}{isCurrent ? (en ? ' · this month' : ' · текущий месяц') : ''}</div>
        </div>
        {navBtn(<AsIco name="chevR" size={17} color={th.ink}/>, () => step(1))}
      </div>

      {/* intro */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 18 }}>
        <AsIco name="info" size={14} color={th.muted} sw={1.6} style={{ flexShrink: 0, marginTop: 1 }}/>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, lineHeight: 1.45, color: th.muted, textWrap: 'pretty' }}>
          {en
            ? 'Transits to your natal chart whose window touches this month — including those that began earlier and are still in orb. Key = slow planets, secondary = personal planets.'
            : 'Транзиты к твоей натальной карте, чьё окно действия задевает этот месяц — включая начавшиеся раньше и ещё активные. Ключевые — медленные планеты, вторичные — личные.'}
        </div>
      </div>

      {error && <div style={{ padding: '30px 0', textAlign: 'center', fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.muted }}>{en ? 'Error: ' : 'Ошибка: '}{error}</div>}

      {!data && !error && (
        <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', border: `2.5px solid ${th.muted}`, borderTopColor: 'transparent', display: 'inline-block', animation: 'astroSpin .7s linear infinite' }}/>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.muted }}>{en ? 'Reading the sky…' : 'Читаю небо…'}</div>
        </div>
      )}

      {data && (
        <React.Fragment>
          {/* KEY */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
              <AsIco name="dot" size={9} color={th.gold}/>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10.5, letterSpacing: 1.8, textTransform: 'uppercase', color: th.ink }}>{en ? 'Key aspects' : 'Ключевые аспекты'}</span>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10.5, color: th.muted }}>{data.key.length}</span>
            </div>
            {data.key.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: 16, fontFamily: '"Manrope",sans-serif', fontSize: 12, color: th.muted, lineHeight: 1.5 }}>
                {en ? 'No slow-planet aspects active this month — a calm stretch.' : 'В этом месяце нет активных аспектов медленных планет — спокойный период.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {data.key.map((e, i) => <AsAspectCard key={i} th={th} lang={lang} e={e}/>)}
              </div>
            )}
          </div>

          {/* SECONDARY */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
              <AsIco name="dot" size={7} color={th.muted}/>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10.5, letterSpacing: 1.8, textTransform: 'uppercase', color: th.inkSoft }}>{en ? 'Secondary aspects' : 'Вторичные аспекты'}</span>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10.5, color: th.muted }}>{data.secondary.length}</span>
            </div>
            {data.secondary.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: 16, fontFamily: '"Manrope",sans-serif', fontSize: 12, color: th.muted }}>
                {en ? 'No notable personal-planet aspects.' : 'Заметных аспектов личных планет нет.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.secondary.map((e, i) => <AsAspectCard key={i} th={th} lang={lang} e={e} compact/>)}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8 }}>
            <AsIco name="info" size={13} color={th.muted} sw={1.6} style={{ flexShrink: 0, marginTop: 1 }}/>
            <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, lineHeight: 1.45, color: th.muted, textWrap: 'pretty' }}>
              {en ? 'Tap a secondary aspect to read its meaning. Personal-planet aspects are short; slow-planet windows can span weeks.' : 'Нажми на вторичный аспект, чтобы раскрыть смысл. Аспекты личных планет короткие, окна медленных длятся неделями.'}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

Object.assign(window, { AspectsMonthScreen });
