// synastry.jsx — Synastry (compatibility) module.
// Compares two natal charts via cross-aspects between Person A's and Person B's
// planets — the primary tool of synastry — weighted by personal planets and orb
// tightness. Reuses the natal ephemeris engine (window.computeRealChart) so it
// honours the same exact / approximate / unknown birth-time handling.

const { useState, useEffect, useRef } = React;

// ── borrow engine + constants exported by natal.jsx / birthedit.jsx ──
const SY = {
  PL_META: window.PL_META, PL_IDS: window.PL_IDS, ZS: window.ZS,
  PGlyph: window.PGlyph, PlutoWheelMark: window.PlutoWheelMark,
  SIGN_NOM_RU: window.SIGN_NOM_RU, SIGN_GLYPH: window.SIGN_GLYPH, SIGN_KEYS: window.SIGN_KEYS,
  SIGN_EN: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
  computeRealChart: window.computeRealChart,
  resolveBirthForChart: window.resolveBirthForChart,
  fmtBirthDate: window.fmtBirthDate, fmtBirthTime: window.fmtBirthTime, fmtBirthCity: window.fmtBirthCity,
};

// ═══════════════════════════════════════════════════════
// DEFAULT PARTNER (a believable example — fully editable)
// ═══════════════════════════════════════════════════════
const DEFAULT_PARTNER = {
  name: 'Марк', nameEn: 'Mark',
  day: 14, month: 2, year: 1999,
  timeMode: 'exact', hour: 18, minute: 40,
  approx: 'evening',
  city: { ru:'Москва', en:'Moscow', reg:'Россия', lat:55.7558, lon:37.6173, tz:3, zone:'Europe/Moscow' },
};

// ═══════════════════════════════════════════════════════
// SYNASTRY ASPECTS
// ═══════════════════════════════════════════════════════
const SYN_ASPECTS = [
  { key:'conjunction', sym:'☌', ru:'Соединение', en:'Conjunction', angle:0,   orb:8, col:'#D4901A', tone:'fuse'  },
  { key:'opposition',  sym:'☍', ru:'Оппозиция',  en:'Opposition',  angle:180, orb:7, col:'#C0504A', tone:'tense' },
  { key:'trine',       sym:'△', ru:'Трин',        en:'Trine',       angle:120, orb:6, col:'#2C8FC0', tone:'soft'  },
  { key:'square',      sym:'□', ru:'Квадрат',     en:'Square',      angle:90,  orb:6, col:'#C0504A', tone:'tense' },
  { key:'sextile',     sym:'⚹', ru:'Секстиль',    en:'Sextile',     angle:60,  orb:4, col:'#3AA46A', tone:'soft'  },
];

// importance weight per planet (personal planets dominate)
const PW = { sun:1.0, moon:1.0, venus:0.92, mars:0.86, mercury:0.72, jupiter:0.55, saturn:0.72, uranus:0.46, neptune:0.46, pluto:0.56 };

// dimension affinity per planet: [attraction, emotion, communication, stability]
const AFF = {
  sun:    [0.5,0.4,0.3,0.5], moon:[0.3,1.0,0.3,0.4], mercury:[0.2,0.3,1.0,0.3],
  venus:  [0.9,0.6,0.4,0.4], mars:[0.9,0.3,0.2,0.3], jupiter:[0.4,0.4,0.4,0.7],
  saturn: [0.2,0.3,0.3,0.9], uranus:[0.6,0.2,0.4,0.2], neptune:[0.5,0.6,0.3,0.2],
  pluto:  [0.8,0.5,0.2,0.4],
};

function pairKey(pa, pb) {
  const i = SY.PL_IDS.indexOf(pa), j = SY.PL_IDS.indexOf(pb);
  return i <= j ? `${pa}-${pb}` : `${pb}-${pa}`;
}

// domain (group) of a contact — drives the section it lands in
function domainOf(pa, pb) {
  const has = (x) => pa === x || pb === x;
  if (has('venus') || has('mars')) return 'love';
  if (has('moon')) return 'emotion';
  if (has('mercury')) return 'mind';
  if (has('saturn') || has('jupiter')) return 'stability';
  return 'depth';
}

const DOMAINS = {
  love:      { ru:'Притяжение и любовь', en:'Attraction & love',     glyph:'heart', order:0 },
  emotion:   { ru:'Эмоции и близость',   en:'Emotion & closeness',   glyph:'moon',  order:1 },
  mind:      { ru:'Ум и общение',        en:'Mind & communication',  glyph:'chat',  order:2 },
  stability: { ru:'Опора и обязательства',en:'Stability & commitment',glyph:'pillar',order:3 },
  depth:     { ru:'Глубина и рост',      en:'Depth & growth',        glyph:'spark', order:4 },
};

// ── compute both charts + all cross-aspects + dimension scores ──
function computeSynastry(youBirth, partnerBirth) {
  const A = SY.computeRealChart(SY.resolveBirthForChart(youBirth));
  const B = SY.computeRealChart(SY.resolveBirthForChart(partnerBirth));

  const cross = [];
  for (const pa of SY.PL_IDS) {
    for (const pb of SY.PL_IDS) {
      const e1 = A.planets[pa].ecl, e2 = B.planets[pb].ecl;
      let diff = Math.abs(e1 - e2); if (diff > 180) diff = 360 - diff;
      const lum = pa === 'sun' || pa === 'moon' || pb === 'sun' || pb === 'moon';
      for (const asp of SYN_ASPECTS) {
        const orb = Math.abs(diff - asp.angle);
        const lim = lum ? asp.orb : Math.max(2.5, asp.orb - 1.5);
        if (orb <= lim) {
          const imp = PW[pa] * PW[pb];
          const strength = imp * (0.45 + 0.55 * (1 - orb / lim));
          cross.push({ pa, pb, asp, orb, imp, strength, orbStr: 1 - orb / lim, domain: domainOf(pa, pb) });
          break;
        }
      }
    }
  }
  cross.sort((x, y) => y.strength - x.strength);

  // ── dimension scoring ──
  const sums = [0, 0, 0, 0];
  for (const c of cross) {
    const a1 = AFF[c.pa], a2 = AFF[c.pb];
    for (let d = 0; d < 4; d++) {
      const w = (a1[d] + a2[d]) / 2;
      let v;
      if (d === 0) v = c.asp.tone === 'soft' ? 1 : c.asp.tone === 'fuse' ? 0.9 : 0.5; // attraction: tension still sparks
      else        v = c.asp.tone === 'soft' ? 1 : c.asp.tone === 'fuse' ? 0.7 : -0.7;
      sums[d] += w * v * (0.5 + 0.5 * c.orbStr);
    }
  }
  const dims = sums.map((s) => Math.max(12, Math.min(97, Math.round(53 + 8.5 * s))));
  const overall = Math.round(0.30 * dims[0] + 0.28 * dims[1] + 0.18 * dims[2] + 0.24 * dims[3]);

  return { A, B, cross, dims, overall };
}

function overallLabel(score, en) {
  if (score >= 80) return en ? 'A stellar match' : 'Звёздная пара';
  if (score >= 68) return en ? 'A strong bond'  : 'Сильная связь';
  if (score >= 55) return en ? 'Real attraction': 'Притяжение есть';
  if (score >= 42) return en ? 'Worth working on': 'Есть над чем поработать';
  return en ? 'Different orbits' : 'Разные орбиты';
}

// ── build the reading text for one contact ──
function readContact(pa, pb, aspKey, lang) {
  const lng = lang === 'en' ? 'en' : 'ru';

  // 1. Try full directional lookup from synastry-interp-full.js
  const full = window.SYN_INTERP_FULL && window.SYN_INTERP_FULL[lng];
  if (full) {
    const directKey = `${pa}-${pb}`;
    const entry = full.aspects[directKey];
    if (entry && entry[aspKey]) return entry[aspKey];
  }

  // 2. Fallback to legacy pair+tone approach
  const d = (window.SYN_INTERP && window.SYN_INTERP[lng]) || null;
  if (!d) return '';
  const base = d.pairs[pairKey(pa, pb)]
    || d.fallback.replace('{a}', d.roles[pa] || pa).replace('{b}', d.roles[pb] || pb);
  const tone = d.tones[aspKey] || '';
  return `${base} ${tone}`.trim();
}

// ═══════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════
function SynIco({ name, size = 20, color = 'currentColor', sw = 1.7 }) {
  const c = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:sw, strokeLinecap:'round', strokeLinejoin:'round' };
  switch (name) {
    case 'back':  return (<svg {...c}><path d="M15 5l-7 7 7 7"/></svg>);
    case 'arrow': return (<svg {...c}><path d="M4 12h15M13 6l6 6-6 6"/></svg>);
    case 'edit':  return (<svg {...c}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>);
    case 'plus':  return (<svg {...c}><path d="M12 5v14M5 12h14"/></svg>);
    case 'close': return (<svg {...c}><path d="M6 6l12 12M18 6 6 18"/></svg>);
    case 'expand':return (<svg {...c}><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>);
    case 'heart': return (<svg {...c}><path d="M12 20s-7-4.6-9.2-9C1.4 8.2 2.7 5 6 5c2 0 3.2 1.2 4 2.4C10.8 6.2 12 5 14 5c3.3 0 4.6 3.2 3.2 6-2.2 4.4-9.2 9-9.2 9Z"/></svg>);
    case 'moon':  return (<svg {...c}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.4 6.4 0 0 0 10.5 10.5Z"/></svg>);
    case 'chat':  return (<svg {...c}><path d="M21 11.5a8.4 8.4 0 0 1-11.9 7.6L3 21l1.9-6A8.4 8.4 0 1 1 21 11.5Z"/></svg>);
    case 'pillar':return (<svg {...c}><path d="M4 8l8-4 8 4M5 8v10M19 8v10M9.5 8v10M14.5 8v10M3 21h18"/></svg>);
    case 'spark': return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 1.5c.5 4.7 2.3 6.5 7 7-4.7.5-6.5 2.3-7 7-.5-4.7-2.3-6.5-7-7 4.7-.5 6.5-2.3 7-7Z"/></svg>);
    case 'chev':  return (<svg {...c}><path d="M5 8l7 7 7-7"/></svg>);
    case 'link':  return (<svg {...c}><circle cx="8.5" cy="12" r="5.5"/><circle cx="15.5" cy="12" r="5.5"/></svg>);
    default: return null;
  }
}

// person colour pair (You vs Partner)
function personColors(th) {
  return th.effDark
    ? { you:'#9C8BFF', youSoft:'rgba(156,139,255,0.16)', par:'#F0A57E', parSoft:'rgba(240,165,126,0.16)' }
    : { you:'#6A4DD0', youSoft:'rgba(106,77,208,0.12)',  par:'#C9663A', parSoft:'rgba(201,102,58,0.12)' };
}

// ═══════════════════════════════════════════════════════
// BI-WHEEL SVG  (inner ring = You · outer ring = Partner)
// Fixed zodiac (0° Aries at left) so it works without birth times.
// ═══════════════════════════════════════════════════════
function SynastryWheelSVG({ th, A, B, pc, cross, size = 300, showDeg = false }) {
  const s = size / 400, cx = size / 2, cy = size / 2;
  const R = { bg:188*s, zOut:180*s, zIn:150*s, par:132*s, you:104*s, asp:88*s, cir:56*s };
  const dark = th.effDark;

  const toRad = (e) => Math.PI - (((e % 360) + 360) % 360) * Math.PI / 180;
  const px = (e, r) => cx + r * Math.cos(toRad(e));
  const py = (e, r) => cy + r * Math.sin(toRad(e));

  const zodSeg = (e0) => {
    const e1 = e0 + 30;
    return `M${px(e0,R.zOut)} ${py(e0,R.zOut)} A${R.zOut} ${R.zOut} 0 0 0 ${px(e1,R.zOut)} ${py(e1,R.zOut)} L${px(e1,R.zIn)} ${py(e1,R.zIn)} A${R.zIn} ${R.zIn} 0 0 1 ${px(e0,R.zIn)} ${py(e0,R.zIn)}Z`;
  };

  const bgFill = dark ? '#0d0820' : '#f5f0ff';
  const zodF1  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)';
  const zodF2  = dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.45)';
  const ln     = dark ? 'rgba(255,255,255,0.18)' : 'rgba(80,50,130,0.22)';
  const lnB    = dark ? 'rgba(255,255,255,0.42)' : 'rgba(80,50,130,0.5)';
  const txt    = dark ? 'rgba(246,241,255,0.86)' : 'rgba(30,20,60,0.86)';
  const innerFill = dark ? 'rgba(8,4,24,0.92)' : 'rgba(245,240,255,0.92)';

  // radial de-clustering within one person's ring
  const offsets = (arr) => {
    const sorted = [...arr].sort((a, b) => a.ecl - b.ecl);
    const off = {};
    for (let i = 0; i < sorted.length; i++) {
      let o = 0;
      for (let j = 0; j < i; j++) {
        const diff = Math.min(Math.abs(sorted[i].ecl - sorted[j].ecl), 360 - Math.abs(sorted[i].ecl - sorted[j].ecl));
        if (diff < 12) { o = off[sorted[j].id] === 0 ? 13*s : (off[sorted[j].id] > 0 ? -13*s : 13*s); break; }
      }
      off[sorted[i].id] = o;
    }
    return off;
  };
  const offA = offsets(A), offB = offsets(B);

  const ring = (arr, baseR, off, color) => arr.map((p) => {
    const r = baseR + (off[p.id] || 0);
    const x = px(p.ecl, r), y = py(p.ecl, r);
    return (
      <g key={p.id}>
        {p.id === 'pluto'
          ? SY.PlutoWheelMark({ x, y: showDeg ? y - 4 * s : y, fpx: 11.5 * s, s, color })
          : <text x={x} y={showDeg ? y-4*s : y} textAnchor="middle" dominantBaseline="central" fontSize={11.5*s} fill={color} style={{fontFamily:'serif',fontWeight:'bold'}}>{p.g}</text>}
        {showDeg && <text x={x} y={y+6.5*s} textAnchor="middle" dominantBaseline="central" fontSize={7*s} fill={txt} opacity={0.8} style={{fontFamily:'sans-serif'}}>{p.sd}°</text>}
      </g>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:'block',margin:'0 auto'}}>
      <circle cx={cx} cy={cy} r={R.bg} fill={bgFill}/>
      {SY.ZS.map((z,i) => <path key={z.e} d={zodSeg(z.e)} fill={i%2===0?zodF1:zodF2} stroke={ln} strokeWidth={0.5*s}/>)}
      {SY.ZS.map((z) => <line key={'d'+z.e} x1={px(z.e,R.zOut)} y1={py(z.e,R.zOut)} x2={px(z.e,R.zIn)} y2={py(z.e,R.zIn)} stroke={lnB} strokeWidth={0.8*s}/>)}
      <circle cx={cx} cy={cy} r={R.zOut} fill="none" stroke={ln} strokeWidth={0.8*s}/>
      <circle cx={cx} cy={cy} r={R.zIn}  fill="none" stroke={ln} strokeWidth={0.8*s}/>
      {SY.ZS.map((z) => {
        const m = z.e + 15, r = (R.zOut + R.zIn) / 2;
        return <text key={'g'+z.e} x={px(m,r)} y={py(m,r)} textAnchor="middle" dominantBaseline="central" fontSize={11*s} fill={txt} style={{fontFamily:'serif'}}>{z.g}</text>;
      })}
      {/* person guide rings */}
      <circle cx={cx} cy={cy} r={R.par} fill="none" stroke={pc.par} strokeWidth={0.8*s} opacity={0.5} strokeDasharray={`${1.5*s} ${3*s}`}/>
      <circle cx={cx} cy={cy} r={R.you} fill="none" stroke={pc.you} strokeWidth={0.8*s} opacity={0.5} strokeDasharray={`${1.5*s} ${3*s}`}/>
      {/* cross-aspect lines */}
      {cross.map((c,i) => {
        const a = A.find(p => p.id === c.pa), b = B.find(p => p.id === c.pb);
        if (!a || !b) return null;
        return <line key={'l'+i} x1={px(a.ecl,R.asp)} y1={py(a.ecl,R.asp)} x2={px(b.ecl,R.asp)} y2={py(b.ecl,R.asp)} stroke={c.asp.col} strokeWidth={(c.asp.tone==='soft'?0.9:1.1)*s} opacity={0.6}/>;
      })}
      <circle cx={cx} cy={cy} r={R.cir} fill={innerFill} stroke={ln} strokeWidth={0.8*s}/>
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={15*s} fill={pc.par} style={{fontFamily:'serif'}}>♥</text>
      {ring(B, R.par, offB, pc.par)}
      {ring(A, R.you, offA, pc.you)}
    </svg>
  );
}

// planets array (with glyphs) from a computed chart
function planetsArr(chart) {
  return SY.PL_IDS.map((id) => ({ id, ecl: chart.planets[id].ecl, g: SY.PL_META[id].g, sd: chart.planets[id].signDeg }));
}

// ═══════════════════════════════════════════════════════
// PERSON CARD (intake)
// ═══════════════════════════════════════════════════════
function PersonCard({ th, lang, color, soft, tag, person, onEdit }) {
  const en = lang === 'en';
  const name = (en && person.nameEn) ? person.nameEn : (person.name || (en ? 'Name' : 'Имя'));
  const signIdx = window.sunSignIdxFromDate ? window.sunSignIdxFromDate(person.day, person.month) : 0;
  const signGlyph = SY.SIGN_GLYPH[signIdx];
  const signName = en ? SY.SIGN_EN[signIdx] : SY.SIGN_NOM_RU[signIdx];
  return (
    <button onClick={onEdit} style={{
      width:'100%',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',gap:13,
      background:th.glassStrong,border:`1px solid ${th.glassBorder}`,borderRadius:20,padding:'15px 16px',
      backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',color:th.ink,boxSizing:'border-box',
    }}>
      <div style={{position:'relative',width:50,height:50,flexShrink:0}}>
        <div style={{width:50,height:50,borderRadius:'50%',background:`radial-gradient(circle at 35% 30%, ${color}, ${color}55)`,border:`1.5px solid ${color}70`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 20px ${color}40`}}>
          <span style={{fontFamily:'var(--ds-serif)',fontSize:22,fontWeight:600,color:'#fff',lineHeight:1}}>{(name||'?')[0]}</span>
        </div>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
          <span style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:19,color:th.ink,lineHeight:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</span>
          <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:8.5,letterSpacing:1.2,color,background:soft,border:`1px solid ${color}55`,borderRadius:4,padding:'2px 6px',flexShrink:0}}>{tag}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
          <span style={{fontFamily:'var(--ds-serif)',fontSize:13,color}}>{signGlyph}</span>
          <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:11.5,color:th.inkSoft}}>{signName}</span>
        </div>
        <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11,color:th.muted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
          {SY.fmtBirthDate(person)} · {SY.fmtBirthTime(person, lang)} · {SY.fmtBirthCity(person, lang)}
        </div>
      </div>
      <div style={{width:30,height:30,borderRadius:999,border:`1px solid ${th.glassBorder}`,background:th.chip,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <SynIco name="edit" size={13} color={th.muted} sw={1.7}/>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// INTAKE SCREEN
// ═══════════════════════════════════════════════════════
function SynastryIntakeScreen({ th, lang, you, partner, onEditYou, onEditPartner, onBuild }) {
  const en = lang === 'en';
  const pc = personColors(th);
  const ready = !!(partner && partner.city);
  const nonExact = you.timeMode !== 'exact' || (ready && partner.timeMode !== 'exact');

  return (
    <div style={{padding:'8px 18px 28px',position:'relative',zIndex:1}}>
      <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:21,color:th.ink,marginBottom:4,lineHeight:1.2}}>{en?'Compare two charts':'Сравните две карты'}</div>
      <div style={{fontFamily:'"Manrope",sans-serif',fontSize:12.5,color:th.inkSoft,marginBottom:20,lineHeight:1.45,textWrap:'pretty'}}>
        {en?'Synastry overlays your chart with another person\u2019s and reads the contacts between you — attraction, warmth, friction and growth.':'Синастрия совмещает вашу карту с картой другого человека и читает контакты между вами — притяжение, тепло, трение и рост.'}
      </div>

      {/* You */}
      <PersonCard th={th} lang={lang} color={pc.you} soft={pc.youSoft} tag={en?'YOU':'ВЫ'} person={you} onEdit={onEditYou}/>

      {/* connector */}
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:34,position:'relative'}}>
        <div style={{position:'absolute',top:0,bottom:0,width:1.5,background:th.glassBorder}}/>
        <div style={{position:'relative',width:30,height:30,borderRadius:999,background:th.glassStrong,border:`1px solid ${th.glassBorder}`,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
          <SynIco name="link" size={15} color={th.glyphClr} sw={1.6}/>
        </div>
      </div>

      {/* Partner */}
      {ready ? (
        <PersonCard th={th} lang={lang} color={pc.par} soft={pc.parSoft} tag={en?'PARTNER':'ПАРТНЁР'} person={partner} onEdit={onEditPartner}/>
      ) : (
        <button onClick={onEditPartner} style={{
          width:'100%',cursor:'pointer',display:'flex',alignItems:'center',gap:13,
          background:th.effDark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.4)',
          border:`1.5px dashed ${pc.par}80`,borderRadius:20,padding:'18px 16px',color:th.ink,boxSizing:'border-box',
        }}>
          <div style={{width:50,height:50,borderRadius:'50%',border:`1.5px dashed ${pc.par}90`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <SynIco name="plus" size={22} color={pc.par} sw={1.8}/>
          </div>
          <div style={{flex:1,minWidth:0,textAlign:'left'}}>
            <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:17,color:th.ink,marginBottom:3}}>{en?'Add partner':'Добавить партнёра'}</div>
            <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,color:th.inkSoft}}>{en?'Name, date and city of birth':'Имя, дата и город рождения'}</div>
          </div>
        </button>
      )}

      {/* caveat */}
      {nonExact && (
        <div style={{display:'flex',gap:9,alignItems:'flex-start',padding:'12px 14px',borderRadius:14,background:`${th.accent}12`,border:`1px solid ${th.accent}30`,marginTop:18}}>
          <span style={{flexShrink:0,fontSize:13,color:th.glyphClr,lineHeight:1.4}}>✦</span>
          <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,lineHeight:1.5,color:th.inkSoft,textWrap:'pretty'}}>
            {en?'Without an exact birth time the Moon and rising sign may shift — planet-to-planet contacts stay reliable.':'Без точного времени рождения Луна и асцендент могут смещаться — контакты между планетами остаются надёжными.'}
          </div>
        </div>
      )}

      <button disabled={!ready} onClick={ready?onBuild:undefined} style={{
        display:'flex',width:'100%',justifyContent:'center',alignItems:'center',gap:8,height:52,marginTop:20,
        borderRadius:999,border:'none',cursor:ready?'pointer':'default',
        background:ready?th.accent:(th.effDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.08)'),
        color:ready?'#fff':th.muted,fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15.5,
        boxShadow:ready?`0 8px 26px ${th.accentGlow}`:'none',opacity:ready?1:0.7,
      }}>
        <SynIco name="heart" size={17} color={ready?'#fff':th.muted} sw={1.8}/>
        {en?'Build synastry':'Построить синастрию'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CHART SCREEN
// ═══════════════════════════════════════════════════════
function SynastryChartScreen({ th, lang, you, partner, onExpand }) {
  const en = lang === 'en';
  const pc = personColors(th);
  const [syn, setSyn] = useState(null);
  const [err, setErr] = useState(null);
  const [openA, setOpenA] = useState(null);

  useEffect(() => {
    try { setSyn(computeSynastry(you, partner)); }
    catch (e) { setErr(e.message); }
  }, [you, partner]);

  if (err) return <div style={{padding:'24px 18px',textAlign:'center',position:'relative',zIndex:1}}><div style={{fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.muted}}>{en?'Calc error: ':'Ошибка расчёта: '}{err}</div></div>;
  if (!syn) return <div style={{padding:'60px 18px',textAlign:'center',position:'relative',zIndex:1}}><div style={{fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.muted}}>{en?'Comparing charts…':'Сравниваю карты…'}</div></div>;

  const youName = (en && you.nameEn) ? you.nameEn : (you.name || (en?'You':'Вы'));
  const parName = (en && partner.nameEn) ? partner.nameEn : (partner.name || (en?'Partner':'Партнёр'));
  const A = planetsArr(syn.A), B = planetsArr(syn.B);
  const shown = syn.cross.slice(0, 18);

  const dimLabels = en ? ['Attraction','Emotion','Communication','Stability'] : ['Притяжение','Эмоции','Общение','Устойчивость'];

  // who's who rows
  const corePlanets = ['sun','moon','venus','mars'];
  const bothHouses = (syn.A.housesValid && syn.B.housesValid);
  const signOf = (chart, id) => {
    const idx = chart.planets[id].signIdx;
    return { glyph: SY.SIGN_GLYPH[idx], name: en ? SY.SIGN_EN[idx] : SY.SIGN_NOM_RU[idx] };
  };
  const ascSign = (chart) => {
    if (!chart.housesValid) return null;
    const idx = Math.floor((((chart.asc % 360) + 360) % 360) / 30);
    return { glyph: SY.SIGN_GLYPH[idx], name: en ? SY.SIGN_EN[idx] : SY.SIGN_NOM_RU[idx] };
  };

  // group aspects by domain
  const byDomain = {};
  for (const c of shown) (byDomain[c.domain] = byDomain[c.domain] || []).push(c);
  const domainOrder = Object.keys(DOMAINS).sort((a, b) => DOMAINS[a].order - DOMAINS[b].order).filter((k) => byDomain[k]);

  const Chevron = ({ open }) => (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke={th.muted} strokeWidth={1.8} strokeLinecap="round" style={{flexShrink:0,transform:open?'rotate(180deg)':'none',transition:'transform .22s'}}><path d="M3 6l5 5 5-5"/></svg>
  );

  return (
    <div style={{padding:'4px 18px 32px',position:'relative',zIndex:1}}>

      {/* ── HERO: two avatars + overall score ── */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:14}}>
          <div style={{width:54,height:54,borderRadius:'50%',background:`radial-gradient(circle at 35% 30%, ${pc.you}, ${pc.you}55)`,border:`2px solid ${th.effDark?'#15102a':'#f5f0ff'}`,display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>
            <span style={{fontFamily:'var(--ds-serif)',fontSize:23,fontWeight:600,color:'#fff'}}>{youName[0]}</span>
          </div>
          <div style={{width:30,height:30,borderRadius:999,background:th.glassStrong,border:`1px solid ${th.glassBorder}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 -8px',zIndex:3,backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
            <SynIco name="heart" size={14} color={pc.par} sw={1.6}/>
          </div>
          <div style={{width:54,height:54,borderRadius:'50%',background:`radial-gradient(circle at 35% 30%, ${pc.par}, ${pc.par}55)`,border:`2px solid ${th.effDark?'#15102a':'#f5f0ff'}`,display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
            <span style={{fontFamily:'var(--ds-serif)',fontSize:23,fontWeight:600,color:'#fff'}}>{parName[0]}</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'baseline',gap:4}}>
          <span style={{fontFamily:'var(--ds-serif)',fontWeight:700,fontSize:54,lineHeight:0.9,color:th.ink,letterSpacing:-1}}>{syn.overall}</span>
          <span style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:22,color:th.muted}}>%</span>
        </div>
        <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:13,letterSpacing:0.5,color:th.glyphClr,marginTop:2}}>{overallLabel(syn.overall, en)}</div>
        <div style={{fontFamily:'"Manrope",sans-serif',fontSize:12,color:th.muted,marginTop:4}}>{youName} · {parName}</div>
      </div>

      {/* ── BI-WHEEL ── */}
      <button onClick={()=>onExpand({A,B,pc,cross:shown})} style={{display:'block',width:'100%',padding:0,margin:'6px 0 0',border:'none',background:'none',cursor:'zoom-in',position:'relative'}}>
        <SynastryWheelSVG th={th} A={A} B={B} pc={pc} cross={shown} size={300}/>
        <span style={{position:'absolute',top:6,right:6,width:30,height:30,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',background:th.chip,border:`1px solid ${th.glassBorder}`,backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
          <SynIco name="expand" size={15} color={th.ink} sw={1.7}/>
        </span>
      </button>
      {/* legend */}
      <div style={{display:'flex',justifyContent:'center',gap:18,marginTop:4,marginBottom:18}}>
        {[[pc.you,youName],[pc.par,parName]].map(([col,nm],i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:9,height:9,borderRadius:999,background:col}}/>
            <span style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,fontWeight:600,color:th.inkSoft}}>{nm}</span>
          </div>
        ))}
      </div>

      {/* ── DIMENSION METER ── */}
      <div style={{background:th.glass,border:`1px solid ${th.glassBorder}`,borderRadius:18,padding:'16px 16px 6px',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',marginBottom:22}}>
        {syn.dims.map((v,i)=>(
          <div key={i} style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12.5,color:th.ink}}>{dimLabels[i]}</span>
              <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:12.5,color:th.glyphClr}}>{v}</span>
            </div>
            <div style={{height:7,borderRadius:999,background:th.effDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)',overflow:'hidden'}}>
              <div style={{height:'100%',width:`${v}%`,borderRadius:999,background:`linear-gradient(90deg, ${pc.you}, ${pc.par})`}}/>
            </div>
          </div>
        ))}
      </div>

      {/* ── WHO'S WHO ── */}
      <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10.5,letterSpacing:1.8,textTransform:'uppercase',color:th.muted,marginBottom:10}}>{en?'Core placements':'Ключевые точки'}</div>
      <div style={{background:th.glass,border:`1px solid ${th.glassBorder}`,borderRadius:18,padding:'4px 16px',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',marginBottom:22}}>
        <div style={{display:'flex',padding:'9px 0 7px',borderBottom:`1px solid ${th.glassBorder}`}}>
          <div style={{flex:1}}/>
          <div style={{width:96,textAlign:'center',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10,color:pc.you}}>{youName}</div>
          <div style={{width:96,textAlign:'center',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10,color:pc.par}}>{parName}</div>
        </div>
        {corePlanets.map((id,i)=>{
          const a = signOf(syn.A,id), b = signOf(syn.B,id);
          return (
            <div key={id} style={{display:'flex',alignItems:'center',padding:'11px 0',borderBottom:`1px solid ${th.glassBorder}`}}>
              <div style={{flex:1,display:'flex',alignItems:'center',gap:8}}>
                <span style={{minWidth:18,display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><SY.PGlyph id={id} size={16} color={SY.PL_META[id].col}/></span>
                <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12.5,color:th.inkSoft}}>{SY.PL_META[id][en?'en':'ru']}</span>
              </div>
              <div style={{width:96,textAlign:'center'}}><span style={{fontFamily:'serif',fontSize:14,color:th.ink}}>{a.glyph}</span> <span style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,color:th.ink}}>{a.name}</span></div>
              <div style={{width:96,textAlign:'center'}}><span style={{fontFamily:'serif',fontSize:14,color:th.ink}}>{b.glyph}</span> <span style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,color:th.ink}}>{b.name}</span></div>
            </div>
          );
        })}
        {bothHouses && (()=>{ const a=ascSign(syn.A), b=ascSign(syn.B); if(!a||!b) return null; return (
          <div style={{display:'flex',alignItems:'center',padding:'11px 0'}}>
            <div style={{flex:1,display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:13,color:th.glyphClr,minWidth:18,textAlign:'center'}}>AC</span>
              <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12.5,color:th.inkSoft}}>{en?'Rising':'Асцендент'}</span>
            </div>
            <div style={{width:96,textAlign:'center'}}><span style={{fontFamily:'serif',fontSize:14,color:th.ink}}>{a.glyph}</span> <span style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,color:th.ink}}>{a.name}</span></div>
            <div style={{width:96,textAlign:'center'}}><span style={{fontFamily:'serif',fontSize:14,color:th.ink}}>{b.glyph}</span> <span style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,color:th.ink}}>{b.name}</span></div>
          </div>
        ); })()}
      </div>

      {/* ── ASPECT GROUPS ── */}
      {domainOrder.map((dk)=>{
        const dom = DOMAINS[dk];
        return (
          <div key={dk} style={{marginBottom:22}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <SynIco name={dom.glyph} size={15} color={th.glyphClr} sw={1.6}/>
              <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10.5,letterSpacing:1.6,textTransform:'uppercase',color:th.muted}}>{en?dom.en:dom.ru}</span>
            </div>
            <div style={{background:th.glass,border:`1px solid ${th.glassBorder}`,borderRadius:18,padding:'0 16px',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)'}}>
              {byDomain[dk].map((c,idx)=>{
                const key = dk+'-'+idx;
                const open = openA === key;
                const last = idx === byDomain[dk].length-1;
                return (
                  <div key={key} style={{borderBottom:last?'none':`1px solid ${th.glassBorder}`}}>
                    <button onClick={()=>setOpenA(open?null:key)} style={{width:'100%',textAlign:'left',cursor:'pointer',display:'flex',alignItems:'center',gap:10,padding:'13px 0',background:'none',border:'none',color:th.ink}}>
                      <div style={{display:'flex',alignItems:'center',gap:3,minWidth:58,flexShrink:0}}>
                        <SY.PGlyph id={c.pa} size={16} color={pc.you}/>
                        <span style={{fontFamily:'serif',fontSize:13,color:c.asp.col}}>{c.asp.sym}</span>
                        <SY.PGlyph id={c.pb} size={16} color={pc.par}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12.5,color:th.ink}}>
                          {SY.PL_META[c.pa][en?'en':'ru']} <span style={{color:th.muted,fontWeight:500}}>{en?'×':'×'}</span> {SY.PL_META[c.pb][en?'en':'ru']}
                        </div>
                        <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11,color:th.muted,marginTop:1}}>
                          {en?c.asp.en:c.asp.ru} · {en?'orb':'орб'} {c.orb.toFixed(1)}°
                        </div>
                      </div>
                      <Chevron open={open}/>
                    </button>
                    {open && (
                      <div style={{paddingBottom:14,paddingRight:4}}>
                        <div style={{display:'flex',gap:8,marginBottom:9,fontFamily:'"Manrope",sans-serif',fontSize:10.5,color:th.muted}}>
                          <span style={{color:pc.you,fontWeight:700}}>{youName}:</span> {SY.PL_META[c.pa][en?'en':'ru']}
                          <span style={{opacity:0.5}}>·</span>
                          <span style={{color:pc.par,fontWeight:700}}>{parName}:</span> {SY.PL_META[c.pb][en?'en':'ru']}
                        </div>
                        <div style={{fontFamily:'"Manrope",sans-serif',fontSize:13,lineHeight:1.6,color:th.inkSoft,textWrap:'pretty'}}>
                          {readContact(c.pa, c.pb, c.asp.key, lang)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:6}}>
        <span style={{width:5,height:5,borderRadius:999,background:th.gold}}/>
        <span style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,color:th.muted,textAlign:'center',textWrap:'pretty'}}>{en?'Synastry shows energy dynamics, not a verdict — one aspect is never the whole story.':'Синастрия показывает динамику, а не приговор — один аспект никогда не решает всё.'}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXPANDED BI-WHEEL OVERLAY
// ═══════════════════════════════════════════════════════
function SynastryExpandOverlay({ th, lang, data, onClose }) {
  const en = lang === 'en';
  const ref = useRef(null);
  const SIZE = 580;
  useEffect(() => {
    const el = ref.current;
    if (el) { el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2; el.scrollTop = (el.scrollHeight - el.clientHeight) / 2; }
  }, []);
  return (
    <div className="astro-in-f" style={{position:'absolute',inset:0,zIndex:78,display:'flex',flexDirection:'column',background:th.effDark?'rgba(8,5,20,0.97)':'rgba(245,242,255,0.98)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
      <div style={{paddingTop:54,flexShrink:0}}>
        <div style={{height:50,display:'flex',alignItems:'center',gap:10,padding:'0 16px'}}>
          <div style={{flex:1,fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,color:th.ink}}>{en?'Synastry bi-wheel':'Карта синастрии'}</div>
          <button onClick={onClose} style={{width:33,height:33,borderRadius:999,border:`1px solid ${th.glassBorder}`,background:th.chip,color:th.ink,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,flexShrink:0,backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
            <SynIco name="close" size={15} color={th.ink} sw={1.8}/>
          </button>
        </div>
      </div>
      <div ref={ref} style={{flex:1,overflow:'auto',scrollbarWidth:'none'}}>
        <div style={{width:SIZE+60,height:SIZE+60,padding:30,boxSizing:'border-box'}}>
          <SynastryWheelSVG th={th} A={data.A} B={data.B} pc={data.pc} cross={data.cross} size={SIZE} showDeg/>
        </div>
      </div>
      <div style={{flexShrink:0,padding:'10px 18px 30px',display:'flex',justifyContent:'center',gap:20}}>
        {[[data.pc.you,en?'You':'Вы'],[data.pc.par,en?'Partner':'Партнёр']].map(([col,nm],i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:9,height:9,borderRadius:999,background:col}}/>
            <span style={{fontFamily:'"Manrope",sans-serif',fontSize:12,fontWeight:600,color:th.inkSoft}}>{nm}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════
Object.assign(window, { SynastryIntakeScreen, SynastryChartScreen, SynastryExpandOverlay, DEFAULT_PARTNER });
