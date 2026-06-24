// astro.jsx — astro_bot mini app · v4 (tabs + profile)
const { useState, useEffect } = React;

// ════════════════════════════════════════════════════════════
// GLYPHS
// ════════════════════════════════════════════════════════════
function AstroGlyph({ name, size = 24, color = 'currentColor', sw = 1.6, style }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'natal':      return (<svg {...c}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M5.6 5.6 7.7 7.7M16.3 16.3 18.4 18.4M18.4 5.6 16.3 7.7M7.7 16.3 5.6 18.4" opacity="0.45"/></svg>);
    case 'synastry':   return (<svg {...c}><circle cx="8.6" cy="12" r="6.2"/><circle cx="15.4" cy="12" r="6.2"/></svg>);
    case 'solar':      return (<svg {...c}><circle cx="12" cy="12" r="3.1"/><path d="M18.6 8.2A8 8 0 1 0 19.7 13"/><path d="M19.9 7.4 18.9 11.1 15.3 9.9"/></svg>);
    case 'pinpoint':   return (<svg {...c}><circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill={color} stroke="none"/><path d="M12 1.6v3M12 19.4v3M1.6 12h3M19.4 12h3"/></svg>);
    case 'milestones': return (<svg {...c}><circle cx="12" cy="12" r="2.6" fill={color} stroke="none" opacity="0.9"/><path d="M4 4.5 12 12M20 4.5 12 12M12 12v7.5"/><circle cx="4" cy="4.5" r="1.5" fill={color} stroke="none"/><circle cx="20" cy="4.5" r="1.5" fill={color} stroke="none"/><circle cx="12" cy="19.5" r="1.5" fill={color} stroke="none"/></svg>);
    case 'aspects':    return (<svg {...c}><circle cx="12" cy="12" r="9"/><path d="M12 5.5 18.2 16H5.8Z"/></svg>);
    case 'arrow-right':return (<svg {...c}><path d="M4 12h15M13 6l6 6-6 6"/></svg>);
    case 'back':       return (<svg {...c}><path d="M15 5l-7 7 7 7"/></svg>);
    case 'close':      return (<svg {...c}><path d="M6 6l12 12M18 6 6 18"/></svg>);
    case 'more':       return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>);
    case 'spark':      return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}><path d="M12 1.5c.5 4.7 2.3 6.5 7 7-4.7.5-6.5 2.3-7 7-.5-4.7-2.3-6.5-7-7 4.7-.5 6.5-2.3 7-7Z"/></svg>);
    case 'home':       return (<svg {...c}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>);
    case 'user':       return (<svg {...c}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
    case 'edit':       return (<svg {...c}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>);
    case 'doc':        return (<svg {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>);
    default: return null;
  }
}

const ZODIAC = { aries:'♈',taurus:'♉',gemini:'♊',cancer:'♋',leo:'♌',virgo:'♍',libra:'♎',scorpio:'♏',sagittarius:'♐',capricorn:'♑',aquarius:'♒',pisces:'♓' };
const SIGN_KEYS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
function ZodiacGlyph({ sign='leo', size=18, color='currentColor', style }) {
  return <span style={{ fontFamily:'var(--ds-serif)', fontSize:size, lineHeight:1, color, ...style }}>{ZODIAC[sign]||ZODIAC.leo}</span>;
}

function StarField({ tone='rgba(255,255,255,0.88)', density=42 }) {
  let seed=11; const rnd=()=>{seed=(seed*9301+49297)%233280; return seed/233280;};
  const dots=[];
  for(let i=0;i<density;i++){
    const sz=0.9+rnd()*2.2;
    dots.push(<div key={i} style={{position:'absolute',left:rnd()*100+'%',top:rnd()*100+'%',width:sz,height:sz,borderRadius:'50%',background:tone,opacity:0.22+rnd()*0.7}}/>);
  }
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
      {dots}
      <div style={{position:'absolute',left:'79%',top:'13%'}}><AstroGlyph name="spark" size={12} color={tone}/></div>
      <div style={{position:'absolute',left:'13%',top:'39%'}}><AstroGlyph name="spark" size={8} color={tone} style={{opacity:0.65}}/></div>
    </div>
  );
}

function WheelWatermark({ color='#fff', opacity=0.07 }) {
  return (
    <svg viewBox="0 0 100 100" style={{position:'absolute',bottom:'-8%',right:'-8%',width:'58%',height:'58%',pointerEvents:'none',opacity}}>
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="0.7"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke={color} strokeWidth="0.5"/>
      <circle cx="50" cy="50" r="14" fill="none" stroke={color} strokeWidth="0.4"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>{
        const r=Math.PI*a/180, x1=50+32*Math.cos(r), y1=50+32*Math.sin(r), x2=50+46*Math.cos(r), y2=50+46*Math.sin(r);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.5"/>;
      })}
    </svg>
  );
}

function CelestialOrb({ kind, size=110 }) {
  if(kind==='sun') return (
    <div style={{width:size,height:size,borderRadius:'50%',background:'radial-gradient(circle at 36% 32%,#fffaed 0%,#ffd35a 52%,#f09030 100%)',boxShadow:'0 0 54px 14px rgba(255,196,70,0.48),inset -8px -10px 22px rgba(200,100,20,0.32)'}}/>
  );
  return (
    <div style={{position:'relative',width:size,height:size,borderRadius:'50%',background:'radial-gradient(circle at 32% 28%,#fdfbff 0%,#e2d9f5 58%,#b8aee0 100%)',boxShadow:'0 0 54px 10px rgba(190,168,255,0.42),inset -9px -9px 22px rgba(100,84,162,0.36)'}}>
      <div style={{position:'absolute',width:'20%',height:'20%',borderRadius:'50%',top:'22%',left:'54%',background:'rgba(110,94,168,0.25)'}}/>
      <div style={{position:'absolute',width:'12%',height:'12%',borderRadius:'50%',top:'57%',left:'30%',background:'rgba(110,94,168,0.2)'}}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════
const USER = { name:'Алиса', nameEn:'Alisa', sign:'leo', tgId:'@alisa_cosmos' };
const BOT  = 'astro_bot';

function getTimeOfDay(h) {
  const hh=(h==null)?new Date().getHours():h;
  if(hh>=5&&hh<12)  return 'morning';
  if(hh>=12&&hh<17) return 'day';
  if(hh>=17&&hh<22) return 'evening';
  return 'night';
}

const STR = {
  ru:{
    greet:{night:'Доброй ночи',morning:'Доброе утро',day:'Добрый день',evening:'Добрый вечер'},
    signLine:'Солнце во Льве · растущая Луна',
    aspectsTitle:'Аспекты на месяц',
    aspectsSub:'Что приготовила астрология — открой и узнай',
    possibilities:'Возможности',
    miniapp:'мини-приложение',
    begin:'Начать разбор',
    soon:'Раздел в разработке — спроектируем дальше',
    weekdays:['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
    months:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
    navHome:'Главная', navProfile:'Профиль',
    profileTitle:'Профиль',
    birthData:'Данные рождения',
    birthDate:'Дата рождения', birthTime:'Время рождения', birthCity:'Город рождения',
    residenceCity:'Город проживания', sameAsBirth:'Как город рождения',
    settings:'Настройки', language:'Язык интерфейса',
    documents:'Документы', legalDocs:'Правовые документы', comingSoon:'Скоро',
  },
  en:{
    greet:{night:'Good night',morning:'Good morning',day:'Good afternoon',evening:'Good evening'},
    signLine:'Sun in Leo · waxing Moon',
    aspectsTitle:'Aspects this month',
    aspectsSub:'See what astrology has in store for you',
    possibilities:'Explore',
    miniapp:'mini app',
    begin:'Start reading',
    soon:"Section in progress \u2014 we\u2019ll design it next",
    weekdays:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months:['January','February','March','April','May','June','July','August','September','October','November','December'],
    navHome:'Home', navProfile:'Profile',
    profileTitle:'Profile',
    birthData:'Birth data',
    birthDate:'Date of birth', birthTime:'Time of birth', birthCity:'City of birth',
    residenceCity:'City of residence', sameAsBirth:'Same as birthplace',
    settings:'Settings', language:'Language',
    documents:'Documents', legalDocs:'Legal documents', comingSoon:'Soon',
  },
};

function fmtDate(lang, d=new Date()) {
  const s=STR[lang];
  return lang==='ru'
    ? `${s.weekdays[d.getDay()]} · ${d.getDate()} ${s.months[d.getMonth()]}`
    : `${s.weekdays[d.getDay()]} · ${s.months[d.getMonth()]} ${d.getDate()}`;
}

const POSSIBILITIES = [
  {id:'natal',     glyph:'natal',      title:{ru:'Натальная карта',  en:'Natal chart'},        kicker:{ru:'РАСШИФРОВКА',    en:'DECODE'},        desc:{ru:'Полная расшифровка карты рождения',      en:'A full read of your birth chart'},
    help:{ru:'Натальная карта — это «снимок неба» в момент твоего рождения. По положению Солнца, Луны и планет она описывает твой характер, сильные стороны, таланты и жизненные задачи. Это основа всей астрологии — с неё начинается знакомство с собой.', en:'Your natal chart is a snapshot of the sky at the moment you were born. From the positions of the Sun, Moon and planets it describes your character, strengths, talents and life themes — the foundation of everything in astrology.'}},
  {id:'synastry',  glyph:'synastry',   title:{ru:'Синастрия',        en:'Synastry'},            kicker:{ru:'СОВМЕСТИМОСТЬ',  en:'COMPATIBILITY'}, desc:{ru:'Сравни две карты и узнай об отношениях', en:'Compare two charts and read your bond'},
    help:{ru:'Синастрия — это сравнение твоей карты с картой другого человека: партнёра, друга, родителя. Она показывает, где между вами притяжение и тепло, а где — трение и точки роста. Помогает лучше понять ваши отношения.', en:'Synastry compares your chart with another person\'s — a partner, friend or parent. It reveals where there\'s attraction and warmth between you, and where there\'s friction and room to grow.'}},
  {id:'solar',     glyph:'solar',      title:{ru:'Соляр',            en:'Solar return'},        kicker:{ru:'ГОД ВПЕРЁД',     en:'YEAR AHEAD'},    desc:{ru:'Прогноз на твой астрологический год',    en:'A forecast for your astrological year'},
    help:{ru:'Соляр — это карта на твой личный год: от одного дня рождения до следующего. Она подсказывает главные темы и события, которые принесёт ближайший год — в работе, отношениях, внутреннем росте.', en:'A solar return is a chart for your personal year — from one birthday to the next. It highlights the main themes and events the coming year will bring in work, relationships and growth.'}},
  {id:'pinpoint',  glyph:'pinpoint',   title:{ru:'Точечные вопросы', en:'Pinpoint questions'},  kicker:{ru:'ХОРАР',          en:'HORARY'},        desc:{ru:'Точный ответ на один конкретный вопрос', en:'A precise answer to one question'},
    help:{ru:'Хорар отвечает на один конкретный вопрос по карте, построенной на момент, когда ты его задал. Например: «получу ли я эту работу?» или «стоит ли соглашаться?». Точный ответ здесь и сейчас.', en:'Horary answers one specific question using a chart cast for the moment you ask it — like "will I get this job?" A precise answer, here and now.'}},
  {id:'milestones',glyph:'milestones', title:{ru:'Жизненные вехи',   en:'Life Milestones'},     kicker:{ru:'ЦИКЛЫ СУДЬБЫ',   en:'LIFE CYCLES'},   desc:{ru:'Когда ждать переломов в карьере, союзах и судьбе — по планетарным циклам', en:'When to expect turning points in career, partnerships and fate'},
    help:{ru:'Жизненные вехи показывают периоды, когда вероятны крупные перемены — в карьере, отношениях, переездах. Они рассчитываются по циклам медленных планет и помогают подготовиться к важным поворотам судьбы.', en:'Life Milestones reveal the periods when major changes are likely — in career, relationships or relocation — based on the cycles of the slow planets, so you can prepare for the turning points.'}},
];

// ════════════════════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════════════════════
function getTheme(mode, tod, accent) {
  const skies = {
    night:   'linear-gradient(180deg,#0c0a1e 0%,#191338 46%,#2b2150 100%)',
    morning: 'linear-gradient(180deg,#f5d0b5 0%,#eaadc5 50%,#c0a4e0 100%)',
    day:     'linear-gradient(180deg,#b8d8f8 0%,#d4e9fb 46%,#edf4ff 100%)',
    evening: 'linear-gradient(180deg,#180f34 0%,#4a2360 52%,#7e3563 100%)',
  };
  const lum = (tod==='morning'||tod==='day') ? 'light' : 'dark';
  const effDark = mode==='dark' ? true : lum==='dark';
  const gold     = effDark ? '#F2C879' : '#7C4900';
  const glyphClr = effDark ? '#cdbcff' : (accent||'#6040C0');
  return {
    mode, tod, effDark,
    accent: accent||'#7B61FF',
    orb:   (tod==='morning'||tod==='day') ? 'sun' : 'moon',
    sky:    skies[tod]||skies.night,
    scrim:  mode==='dark' ? 'linear-gradient(180deg,rgba(8,6,18,0.55),rgba(8,6,18,0.65))' : 'none',
    stars:  effDark,
    ink:         effDark ? '#F6F1FF'                : '#1E1530',
    inkSoft:     effDark ? 'rgba(246,241,255,0.76)' : 'rgba(30,21,48,0.72)',
    muted:       effDark ? 'rgba(246,241,255,0.50)' : 'rgba(30,21,48,0.52)',
    glass:       effDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.50)',
    glassStrong: effDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.72)',
    glassBorder: effDark ? 'rgba(255,255,255,0.17)' : 'rgba(255,255,255,0.85)',
    chip:        effDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.60)',
    gold, glyphClr,
    accentGlow: (accent||'#7B61FF')+'4D',
  };
}

// В Telegram своя шапка — фейковый статус-бар iPhone не нужен.
const IS_TG = typeof window !== 'undefined' && window.IS_TG;
const STATUS_PAD = IS_TG ? 12 : 54;
const NAV_PAD_BOTTOM = IS_TG ? 12 : 30;

// ════════════════════════════════════════════════════════════
// SHARED UI
// ════════════════════════════════════════════════════════════
function Header({ th, lang, screen, title, onBack, activeTab }) {
  const isProfile = activeTab === 'profile';
  const home      = screen === 'home' && !isProfile;
  const s         = STR[lang];

  const circle = (children, onClick, key) => (
    <button key={key} onClick={onClick} style={{
      width:33,height:33,borderRadius:999,border:`1px solid ${th.glassBorder}`,
      cursor:'pointer',background:th.chip,backdropFilter:'blur(10px)',
      WebkitBackdropFilter:'blur(10px)',color:th.ink,display:'flex',
      alignItems:'center',justifyContent:'center',padding:0,flexShrink:0,
    }}>{children}</button>
  );

  // В Telegram на главной своя шапка не нужна — оставляем лишь маленький отступ,
  // чтобы контент поднялся ближе к шапке Telegram (орб компенсируется в CosmicMain).
  if (home && IS_TG) {
    return <div style={{height:14}}/>;
  }

  return (
    <div style={{position:'sticky',top:0,zIndex:30,paddingTop:STATUS_PAD}}>
      <div style={{height:50,display:'flex',alignItems:'center',gap:10,padding:'0 16px'}}>
        {isProfile ? (
          <React.Fragment>
            <div style={{flex:1,textAlign:'center',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,color:th.ink}}>
              {s.profileTitle}
            </div>
            {!IS_TG && circle(<AstroGlyph name="close" size={15} color={th.ink} sw={1.8}/>,undefined,'x')}
          </React.Fragment>
        ) : home ? (
          // В Telegram своя шапка — псевдо-шапку чата не дублируем (показываем только в браузере-макете).
          IS_TG ? <div style={{flex:1}}/> : (
          <React.Fragment>
            <div style={{width:30,height:30,borderRadius:999,background:'radial-gradient(circle at 35% 30%,#fff,#c8bef0)',boxShadow:`0 0 14px ${th.accentGlow}`,flexShrink:0}}/>
            <div style={{display:'flex',flexDirection:'column',lineHeight:1.1}}>
              <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:14.5,color:th.ink,letterSpacing:0.2}}>{BOT}</span>
              <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:500,fontSize:10.5,color:th.muted}}>{s.miniapp}</span>
            </div>
            <div style={{flex:1}}/>
            {circle(<AstroGlyph name="more" size={18} color={th.ink}/>,undefined,'m')}
            {circle(<AstroGlyph name="close" size={15} color={th.ink} sw={1.8}/>,undefined,'x')}
          </React.Fragment>
          )
        ) : (
          <React.Fragment>
            {circle(<AstroGlyph name="back" size={16} color={th.ink} sw={1.9}/>,onBack,'b')}
            <div style={{flex:1,textAlign:'center',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,color:th.ink,paddingRight:10}}>{title}</div>
            {!IS_TG && circle(<AstroGlyph name="close" size={15} color={th.ink} sw={1.8}/>,undefined,'x')}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function GlassCard({ th, children, style, onClick, strong }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} style={{
      width:'100%',textAlign:'left',cursor:onClick?'pointer':'default',
      background:strong?th.glassStrong:th.glass,
      border:`1px solid ${th.glassBorder}`,
      backdropFilter:'blur(18px) saturate(150%)',WebkitBackdropFilter:'blur(18px) saturate(150%)',
      borderRadius:20,boxSizing:'border-box',color:th.ink,...style,
    }}>{children}</Tag>
  );
}

function Sky({ th }) {
  return (
    <div style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:th.sky}}/>
      {th.scrim!=='none'&&<div style={{position:'absolute',inset:0,background:th.scrim}}/>}
      {th.stars&&<StarField density={44}/>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// BOTTOM NAVIGATION
// ════════════════════════════════════════════════════════════
function BottomNav({ th, lang, activeTab, onTab }) {
  const s    = STR[lang];
  const tabs = [
    { id:'home',    label:s.navHome,    icon:'home' },
    { id:'profile', label:s.navProfile, icon:'user' },
  ];
  return (
    <div style={{
      flexShrink:0, zIndex:40,
      background: th.effDark ? 'rgba(10,6,22,0.90)' : 'rgba(248,245,255,0.90)',
      backdropFilter:'blur(24px) saturate(180%)',
      WebkitBackdropFilter:'blur(24px) saturate(180%)',
      borderTop:`1px solid ${th.glassBorder}`,
      display:'flex',
      paddingBottom:NAV_PAD_BOTTOM,
    }}>
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        const col    = active ? th.accent : th.muted;
        return (
          <button key={tab.id} onClick={()=>onTab(tab.id)} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            gap:4, padding:'11px 0 0',
            background:'none', border:'none', cursor:'pointer',
            WebkitTapHighlightColor:'transparent',
            position:'relative',
          }}>
            {active && (
              <div style={{
                position:'absolute', top:6, width:28, height:3,
                borderRadius:999, background:th.accent,
                opacity:0.6,
              }}/>
            )}
            <AstroGlyph name={tab.icon} size={22} color={col} sw={active?2.1:1.6}/>
            <span style={{
              fontFamily:'"Manrope",sans-serif',
              fontWeight:active?700:500,
              fontSize:10.5, letterSpacing:0.2,
              color:col,
            }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN SCREEN
// ════════════════════════════════════════════════════════════
function CosmicMain({ th, lang, onOpen, sun, userName, onHelp }) {
  const first4    = POSSIBILITIES.slice(0,4);
  const milestone = POSSIBILITIES[4];
  const signLine  = lang==='en' ? `Sun in ${sun.en}` : `Солнце ${sun.prep}`;

  // Маленькая круглая кнопка «?» — открывает объяснение услуги (оверлей рисует AstroPhone)
  const helpBtn = (item, pos) => (
    <button onClick={(e)=>{ e.stopPropagation(); onHelp(item); }} style={{
      position:'absolute', ...pos, width:22, height:22, borderRadius:999, zIndex:3,
      border:`1px solid ${th.glassBorder}`, background:th.chip, color:th.inkSoft,
      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'"Manrope",sans-serif', fontWeight:700, fontSize:12, lineHeight:1, padding:0,
      backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
    }}>?</button>
  );

  return (
    <div style={{position:'relative',zIndex:1,padding:'2px 18px 28px'}}>

      {/* ── HERO ─────────────────────────────────────── */}
      <div style={{position:'relative',marginBottom:20,minHeight:178}}>
        {/* В Telegram контент поднят (нет псевдо-шапки) — орб опускаем на ту же величину,
            чтобы луна/солнце остались на прежнем месте, а текст и плашки поднялись. */}
        <div style={{position:'absolute',top:(IS_TG?38:-10),right:-4,opacity:0.92,filter:'saturate(110%)'}}>
          <CelestialOrb kind={th.orb} size={118}/>
        </div>
        <div style={{
          display:'inline-flex',alignItems:'center',height:28,padding:'0 11px',
          borderRadius:999,background:th.chip,border:`1px solid ${th.glassBorder}`,
          backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',marginBottom:20,
          fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:11,
          letterSpacing:1.5,textTransform:'uppercase',color:th.ink,
        }}>
          {fmtDate(lang)}
        </div>
        <div>
          <div style={{fontFamily:'var(--ds-serif)',fontWeight:400,fontStyle:'italic',fontSize:22,lineHeight:1.1,color:th.inkSoft,marginBottom:4}}>
            {STR[lang].greet[th.tod]},
          </div>
          {(() => {
            const nm = userName || (lang==='ru'?USER.name:USER.nameEn) || '';
            // Уменьшаем шрифт длинных имён, чтобы не заходить под луну/солнце.
            const fs = nm.length <= 10 ? 52 : nm.length <= 13 ? 40 : 32;
            return (
              <div style={{fontFamily:'var(--ds-serif)',fontWeight:700,fontSize:fs,lineHeight:0.96,color:th.ink,letterSpacing:-1,marginBottom:16,maxWidth:'72%',wordBreak:'break-word'}}>
                {nm}
              </div>
            );
          })()}
          <div style={{
            display:'inline-flex',alignItems:'center',gap:7,padding:'5px 11px 5px 9px',
            borderRadius:999,background:th.chip,border:`1px solid ${th.glassBorder}`,
            backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',
          }}>
            <ZodiacGlyph sign={sun.key} size={15} color={th.gold}/>
            <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12,color:th.inkSoft}}>{signLine}</span>
          </div>
        </div>
      </div>

      {/* ── ASPECTS BANNER ───────────────────────────── */}
      <button onClick={()=>onOpen('aspects')} style={{
        display:'flex',alignItems:'center',gap:14,width:'100%',textAlign:'left',cursor:'pointer',
        background:th.glassStrong,border:`1px solid ${th.glassBorder}`,
        backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',
        borderRadius:22,padding:'14px 16px',marginBottom:22,boxSizing:'border-box',
      }}>
        <div style={{width:48,height:48,borderRadius:14,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:`${th.accent}30`,border:`1px solid ${th.accent}50`}}>
          <AstroGlyph name="aspects" size={26} color={th.glyphClr} sw={1.5}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,lineHeight:1.15,color:th.ink,marginBottom:4}}>{STR[lang].aspectsTitle}</div>
          <div style={{fontFamily:'"Manrope",sans-serif',fontSize:12,lineHeight:1.35,color:th.inkSoft}}>{STR[lang].aspectsSub}</div>
        </div>
        <AstroGlyph name="arrow-right" size={18} color={th.ink} sw={1.8} style={{flexShrink:0}}/>
      </button>

      {/* ── POSSIBILITIES GRID ───────────────────────── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:11}}>
        <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10.5,letterSpacing:2,textTransform:'uppercase',color:th.muted}}>
          {STR[lang].possibilities}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5,fontFamily:'"Manrope",sans-serif',fontSize:10.5,color:th.muted}}>
          <span style={{width:15,height:15,borderRadius:999,border:`1px solid ${th.glassBorder}`,background:th.chip,display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:9.5}}>?</span>
          {lang==='en'?'tap to learn':'нажми — объясню'}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        {first4.map(p=>{
          const soon = p.id === 'pinpoint'; // Хорар — скоро
          return (
            <GlassCard key={p.id} th={th} onClick={soon ? undefined : ()=>onOpen(p.id)}
              style={{padding:'14px 13px 13px',display:'flex',flexDirection:'column',gap:0,minHeight:130,
                      opacity:soon?0.62:1,cursor:soon?'default':'pointer',position:'relative',overflow:'hidden'}}>
              {soon && (
                <div style={{position:'absolute',top:9,left:9,background:th.gold,color:th.effDark?'#1a1230':'#fff',
                  fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:8.5,letterSpacing:1,
                  borderRadius:99,padding:'2px 7px'}}>
                  {lang==='en'?'SOON':'СКОРО'}
                </div>
              )}
              {helpBtn(p, {top:9, right:9})}
              <div style={{width:40,height:40,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',background:`${th.accent}28`,border:`1px solid ${th.accent}44`,marginBottom:10,flexShrink:0}}>
                <AstroGlyph name={p.glyph} size={22} color={th.glyphClr} sw={1.4}/>
              </div>
              <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:9,letterSpacing:1.3,color:th.gold,marginBottom:5}}>{p.kicker[lang]}</div>
              <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:17,lineHeight:1.1,color:th.ink,marginBottom:5}}>{p.title[lang]}</div>
              <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11,lineHeight:1.35,color:th.inkSoft}}>{p.desc[lang]}</div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── MILESTONES — скоро ───────────────────────── */}
      <GlassCard th={th} strong style={{padding:'16px 16px 15px',display:'flex',alignItems:'center',gap:14,position:'relative',overflow:'hidden',opacity:0.62,cursor:'default'}}>
        <WheelWatermark color={th.effDark?'#fff':th.ink} opacity={th.effDark?0.09:0.06}/>
        {helpBtn(milestone, {top:9, right:9})}
        <div style={{width:50,height:50,borderRadius:16,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:`${th.accent}25`,border:`1px solid ${th.accent}50`,position:'relative'}}>
          <AstroGlyph name="milestones" size={26} color={th.glyphClr} sw={1.4}/>
        </div>
        <div style={{flex:1,minWidth:0,position:'relative'}}>
          <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:9.5,letterSpacing:1.4,color:th.gold,marginBottom:5}}>{milestone.kicker[lang]}</div>
          <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:20,lineHeight:1.08,color:th.ink,marginBottom:4}}>{milestone.title[lang]}</div>
          <div style={{fontFamily:'"Manrope",sans-serif',fontSize:12,lineHeight:1.35,color:th.inkSoft,textWrap:'pretty'}}>{milestone.desc[lang]}</div>
        </div>
        <div style={{background:th.gold,color:th.effDark?'#1a1230':'#fff',fontFamily:'"Manrope",sans-serif',
          fontWeight:700,fontSize:9,letterSpacing:1,borderRadius:99,padding:'3px 9px',flexShrink:0,marginRight:26}}>
          {lang==='en'?'SOON':'СКОРО'}
        </div>
      </GlassCard>

    </div>
  );
}

// Bottom-sheet с объяснением услуги (рендерится на уровне телефона, над нижним меню)
function ServiceHelpSheet({ th, lang, item, onClose }) {
  return (
    <div onClick={onClose} style={{position:'absolute',inset:0,zIndex:95,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'}}>
      <div onClick={(e)=>e.stopPropagation()} style={{width:'100%',background:th.effDark?'#1a1430':'#fff',borderRadius:'24px 24px 0 0',padding:'26px 22px 36px',boxShadow:'0 -8px 40px rgba(0,0,0,0.3)'}}>
        <div style={{width:40,height:4,borderRadius:99,background:th.glassBorder,margin:'0 auto 20px'}}/>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
          <div style={{width:44,height:44,borderRadius:13,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:`${th.accent}28`,border:`1px solid ${th.accent}44`}}>
            <AstroGlyph name={item.glyph} size={24} color={th.glyphClr} sw={1.4}/>
          </div>
          <div>
            <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:9.5,letterSpacing:1.4,color:th.gold,marginBottom:3}}>{item.kicker[lang]}</div>
            <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:21,color:th.ink,lineHeight:1.05}}>{item.title[lang]}</div>
          </div>
        </div>
        <div style={{fontFamily:'"Manrope",sans-serif',fontSize:13.5,lineHeight:1.55,color:th.inkSoft,textWrap:'pretty',marginBottom:22}}>
          {item.help ? item.help[lang] : item.desc[lang]}
        </div>
        <button onClick={onClose} style={{
          width:'100%',height:50,borderRadius:999,border:'none',cursor:'pointer',
          background:th.accent,color:'#fff',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,
          boxShadow:`0 8px 26px ${th.accentGlow}`,
        }}>
          {lang==='en'?'Got it':'Понятно'}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SUB SCREEN
// ════════════════════════════════════════════════════════════
function SubScreen({ th, lang, item }) {
  return (
    <div style={{position:'relative',zIndex:1,padding:'20px 22px 38px'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:16,marginBottom:24}}>
        <div style={{width:82,height:82,borderRadius:999,display:'flex',alignItems:'center',justifyContent:'center',background:th.glassStrong,border:`1px solid ${th.glassBorder}`,backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',boxShadow:`0 0 28px ${th.accentGlow}`}}>
          <AstroGlyph name={item.glyph} size={38} color={th.glyphClr} sw={1.3}/>
        </div>
        <div>
          <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10,letterSpacing:2.2,color:th.gold,marginBottom:10}}>{item.kicker[lang]}</div>
          <div style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:30,lineHeight:1.08,color:th.ink}}>{item.title[lang]}</div>
        </div>
      </div>
      <p style={{fontFamily:'var(--ds-serif)',fontSize:17.5,lineHeight:1.56,color:th.inkSoft,margin:'0 0 24px',textAlign:'center',textWrap:'pretty'}}>{item.desc[lang]}</p>
      <button style={{display:'flex',width:'100%',justifyContent:'center',alignItems:'center',gap:8,height:50,borderRadius:999,border:'none',cursor:'pointer',background:th.accent,color:'#fff',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,boxShadow:`0 8px 26px ${th.accentGlow}`}}>
        {STR[lang].begin}<AstroGlyph name="arrow-right" size={17} color="#fff" sw={1.9}/>
      </button>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:18}}>
        <span style={{width:5,height:5,borderRadius:999,background:th.gold}}/>
        <span style={{fontFamily:'"Manrope",sans-serif',fontSize:12,color:th.muted}}>{STR[lang].soon}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PROFILE SCREEN — helpers
// ════════════════════════════════════════════════════════════
function ProfSection({ th, label, children }) {
  return (
    <div style={{marginBottom:18}}>
      {label && (
        <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10,letterSpacing:1.8,textTransform:'uppercase',color:th.muted,marginBottom:8,paddingLeft:4}}>
          {label}
        </div>
      )}
      <div style={{background:th.glass,border:`1px solid ${th.glassBorder}`,borderRadius:18,padding:'0 16px',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)'}}>
        {children}
      </div>
    </div>
  );
}

function ProfRow({ th, label, value, last, action }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',borderBottom:last?'none':`1px solid ${th.glassBorder}`,gap:8}}>
      <span style={{fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.muted,flexShrink:0}}>{label}</span>
      <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
        {action || <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13,color:th.ink,textAlign:'right'}}>{value}</span>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PROFILE SCREEN
// ════════════════════════════════════════════════════════════
function ProfileScreen({ th, lang, userName, onUpdateName, onChangeLang, birth, onEditBirth, sunKey }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(userName);
  const s          = STR[lang];
  const activeLang = lang === 'ru' ? 'RU' : 'EN';
  const sun        = sunSignInfo(birth, lang);
  const signLine   = lang==='en' ? `Sun in ${sun.en}` : `Солнце ${sun.prep}`;
  const en         = lang === 'en';

  // Настройки уведомлений
  const [notify, setNotify] = useState({ notify_solar:false, notify_aspects:false, notify_viewed:false });
  useEffect(() => {
    if (window.AstroAPI) {
      window.AstroAPI.getNotifyPrefs().then(p => { if (p) setNotify({ notify_solar:!!p.notify_solar, notify_aspects:!!p.notify_aspects, notify_viewed:!!p.notify_viewed }); });
    }
  }, []);
  const toggleNotify = (key) => {
    setNotify(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (window.AstroAPI) window.AstroAPI.setNotifyPrefs({ [key]: next[key] });
      return next;
    });
  };

  const saveName = () => {
    if (draft.trim()) onUpdateName(draft.trim());
    setEditing(false);
  };
  const cancelEdit = () => { setDraft(userName); setEditing(false); };

  useEffect(() => { setDraft(userName); }, [userName]);

  return (
    <div style={{padding:'8px 18px 24px',position:'relative',zIndex:1}}>

      {/* ── NAME + ZODIAC ─────────────────────────── */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:11,marginBottom:28,paddingTop:18}}>
        {editing ? (
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input
              value={draft}
              onChange={e=>setDraft(e.target.value.slice(0,15))}
              maxLength={15}
              onKeyDown={e=>{if(e.key==='Enter')saveName();if(e.key==='Escape')cancelEdit();}}
              autoFocus
              style={{
                appearance:'none',WebkitAppearance:'none',
                background:th.effDark?'rgba(255,255,255,0.10)':'rgba(255,255,255,0.80)',
                border:`1.5px solid ${th.accent}80`,
                borderRadius:10,padding:'7px 14px',
                color:th.ink,fontFamily:'var(--ds-serif)',
                fontSize:26,fontWeight:600,
                outline:'none',textAlign:'center',width:200,
              }}
            />
            <button onClick={saveName} style={{width:36,height:36,borderRadius:999,border:`1px solid ${th.accent}50`,background:`${th.accent}20`,color:th.accent,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,flexShrink:0}}>✓</button>
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontFamily:'var(--ds-serif)',fontWeight:600,fontSize:34,color:th.ink,lineHeight:1}}>{userName}</span>
            <button onClick={()=>{setDraft(userName);setEditing(true);}} style={{width:30,height:30,borderRadius:999,border:`1px solid ${th.glassBorder}`,background:th.chip,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <AstroGlyph name="edit" size={13} color={th.muted} sw={1.6}/>
            </button>
          </div>
        )}

        {/* Zodiac pill */}
        <div style={{
          display:'inline-flex',alignItems:'center',gap:7,padding:'5px 12px 5px 10px',
          borderRadius:999,background:th.chip,border:`1px solid ${th.glassBorder}`,
          backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',
        }}>
          <ZodiacGlyph sign={sunKey} size={15} color={th.gold}/>
          <span style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12.5,color:th.inkSoft}}>{signLine}</span>
        </div>
      </div>

      {/* ── BIRTH DATA — tap to edit ───────────────── */}
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:10,letterSpacing:1.8,textTransform:'uppercase',color:th.muted,marginBottom:8,paddingLeft:4}}>{s.birthData}</div>
        <button onClick={onEditBirth} style={{
          width:'100%',textAlign:'left',cursor:'pointer',background:th.glass,border:`1px solid ${th.glassBorder}`,
          borderRadius:18,padding:'2px 16px 0',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',color:th.ink,
        }}>
          <ProfRow th={th} label={s.birthDate} value={fmtBirthDate(birth)}/>
          <ProfRow th={th} label={s.birthTime} value={fmtBirthTime(birth, lang)}/>
          <ProfRow th={th} label={s.birthCity} value={fmtBirthCity(birth, lang)}/>
          <ProfRow th={th} label={s.residenceCity} value={birth.residence ? (lang==='en'?birth.residence.en:birth.residence.ru) : s.sameAsBirth}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0'}}>
            <span style={{display:'flex',alignItems:'center',gap:8,fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:12.5,color:th.glyphClr}}>
              <AstroGlyph name="edit" size={14} color={th.glyphClr} sw={1.7}/>
              {lang==='en'?'Edit data':'Редактировать данные'}
            </span>
            <AstroGlyph name="arrow-right" size={16} color={th.glyphClr} sw={1.8}/>
          </div>
        </button>
      </div>

      {/* ── NOTIFICATIONS ────────────────────────── */}
      <ProfSection th={th} label={en ? 'Notifications' : 'Уведомления'}>
        {[
          { key:'notify_solar',   t: en?'New solar year':'Новый солярный год',  d: en?'A week before your birthday — your year-ahead chart is ready':'За неделю до дня рождения — соляр на год вперёд уже ждёт' },
          { key:'notify_aspects', t: en?'Monthly aspects':'Аспекты месяца',      d: en?'At the start of a new month — see what the sky brought':'В начале нового месяца — что приготовило небо' },
        ].map((row, i, arr) => (
          <div key={row.key} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom: i<arr.length-1?`1px solid ${th.glassBorder}`:'none'}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13.5,color:th.ink,marginBottom:2}}>{row.t}</div>
              <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11,color:th.muted,lineHeight:1.35,textWrap:'pretty'}}>{row.d}</div>
            </div>
            <button onClick={()=>toggleNotify(row.key)} style={{
              width:46,height:27,borderRadius:999,flexShrink:0,cursor:'pointer',border:'none',padding:0,position:'relative',
              background: notify[row.key] ? th.accent : (th.effDark?'rgba(255,255,255,0.16)':'rgba(0,0,0,0.16)'),
              transition:'background .18s',
            }}>
              <span style={{position:'absolute',top:3,left: notify[row.key]?22:3,width:21,height:21,borderRadius:'50%',background:'#fff',transition:'left .18s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
            </button>
          </div>
        ))}

        {/* Переключатель «обо всём» */}
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderTop:`1px solid ${th.glassBorder}`}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13.5,color:th.ink,marginBottom:2}}>{en?'Notify about everything':'Уведомлять обо всём'}</div>
            <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11,color:th.muted,lineHeight:1.35,textWrap:'pretty'}}>{en?'Including solar years and months you\'ve already viewed':'Включая уже просмотренные годы и месяцы'}</div>
          </div>
          <button onClick={()=>toggleNotify('notify_viewed')} style={{
            width:46,height:27,borderRadius:999,flexShrink:0,cursor:'pointer',border:'none',padding:0,position:'relative',
            background: notify.notify_viewed ? th.accent : (th.effDark?'rgba(255,255,255,0.16)':'rgba(0,0,0,0.16)'),
            transition:'background .18s',
          }}>
            <span style={{position:'absolute',top:3,left: notify.notify_viewed?22:3,width:21,height:21,borderRadius:'50%',background:'#fff',transition:'left .18s',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
          </button>
        </div>

        {/* Пояснение — под переключателем «обо всём» */}
        <div style={{display:'flex',gap:9,alignItems:'flex-start',padding:'2px 0 4px'}}>
          <span style={{flexShrink:0,fontSize:13,color:th.glyphClr,lineHeight:1.4,marginTop:1}}>✦</span>
          <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11.5,lineHeight:1.5,color:th.muted,textWrap:'pretty'}}>
            {en
              ? 'By default, if you\'ve already opened a solar year or a month\'s aspects, we won\'t notify you about them. Turn this on to get reminders anyway.'
              : 'По умолчанию, если ты уже открывал(а) солярный год или аспекты месяца — об этом не напомним. Включи это, чтобы получать уведомления в любом случае.'}
          </div>
        </div>
      </ProfSection>

      {/* ── SETTINGS ─────────────────────────────── */}
      <ProfSection th={th} label={s.settings}>
        <ProfRow th={th} label={s.language} action={
          <div style={{display:'flex',borderRadius:8,overflow:'hidden',border:`1px solid ${th.glassBorder}`}}>
            {['RU','EN'].map((code, i) => {
              const active = activeLang === code;
              return (
                <button key={code} onClick={()=>onChangeLang(code)} style={{
                  padding:'5px 16px',border:'none',
                  borderLeft: i > 0 ? `1px solid ${th.glassBorder}` : 'none',
                  background: active ? `${th.accent}30` : 'transparent',
                  color: active ? th.ink : th.muted,
                  fontFamily:'"Manrope",sans-serif',fontWeight:active?700:500,fontSize:12,
                  cursor:'pointer',transition:'background .15s',
                }}>{code}</button>
              );
            })}
          </div>
        }/>
        <ProfRow th={th} label="Telegram ID" value={(window.AstroAPI && window.AstroAPI.tgUserId()) || USER.tgId} last/>
      </ProfSection>

      {/* ── LEGAL DOCUMENTS ──────────────────────── */}
      <ProfSection th={th} label={s.documents}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',opacity:0.42}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <AstroGlyph name="doc" size={16} color={th.inkSoft} sw={1.5}/>
            <span style={{fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.inkSoft}}>{s.legalDocs}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <span style={{fontFamily:'"Manrope",sans-serif',fontSize:9.5,letterSpacing:1,color:th.muted,border:`1px solid ${th.muted}44`,borderRadius:4,padding:'2px 6px',textTransform:'uppercase'}}>{s.comingSoon}</span>
            <AstroGlyph name="arrow-right" size={14} color={th.muted} sw={1.8}/>
          </div>
        </div>
      </ProfSection>

      {/* ── ВРЕМЕННО: тест уведомления от бота ── */}
      <button onClick={async () => {
        if (!window.AstroAPI) return;
        const r = await window.AstroAPI.sendTestNotification();
        const msg = r.ok
          ? (en ? 'Sent! Check the chat with the bot.' : 'Отправлено! Загляни в чат с ботом.')
          : (en ? 'Failed: ' : 'Не получилось: ') + (r.error||'');
        try { window.Telegram.WebApp.showAlert(msg); } catch(e){ alert(msg); }
      }} style={{
        width:'100%',marginTop:18,padding:'12px',borderRadius:14,
        border:`1px solid ${th.accent}66`,background:`${th.accent}18`,color:th.ink,
        fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12.5,cursor:'pointer',
      }}>
        🔔 {en?'Send test notification':'Прислать тестовое уведомление'}
      </button>

      {/* ── ВРЕМЕННО: сброс данных для повторного теста онбординга ── */}
      <button onClick={async () => {
        try { if (window.AstroAPI) await window.AstroAPI.resetSelf(); } catch(e){}
        try { localStorage.removeItem('astro_onboarded_v1'); localStorage.removeItem('astro_birth_v2'); } catch(e){}
        location.reload();
      }} style={{
        width:'100%',marginTop:10,padding:'12px',borderRadius:14,
        border:`1px solid ${th.muted}55`,background:'transparent',color:th.muted,
        fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:12.5,cursor:'pointer',
      }}>
        🧪 Сбросить данные (тест онбординга)
      </button>

    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PHONE
// ════════════════════════════════════════════════════════════
const BIRTH_KEY = 'astro_birth_v2';
function loadBirth() {
  try { const r = localStorage.getItem(BIRTH_KEY); if (r) return { ...DEFAULT_BIRTH, ...JSON.parse(r) }; } catch(e) {}
  return DEFAULT_BIRTH;
}
const PARTNERS_KEY = 'astro_partners_v2';
function loadPartners() {
  try {
    const r = localStorage.getItem(PARTNERS_KEY);
    if (r) {
      const parsed = JSON.parse(r);
      if (Array.isArray(parsed)) return parsed;
      // migrate old single-partner format
      return [{ ...DEFAULT_PARTNER, ...parsed }];
    }
    // migrate from legacy single-partner key
    const old = localStorage.getItem('astro_partner_v1');
    if (old) return [{ ...DEFAULT_PARTNER, ...JSON.parse(old) }];
  } catch(e) {}
  return [];
}
// Where the solar return is cast: city of residence if set, else the birthplace.
// (Natal chart always uses the birthplace; only the solar return relocates.)
const residenceCity = (b) => (b && b.residence) || (b && b.city);
function AstroPhone({ th, lang, onChangeLang, embedded = false }) {
  const [history,   setHistory]   = useState(['home']);
  const [anim,      setAnim]      = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [userName,  setUserName]  = useState(USER.name);
  const [birth,     setBirth]     = useState(loadBirth);
  const [partners,  setPartners]  = useState(loadPartners);
  const [selPartnerIdx, setSelPartnerIdx] = useState(null); // index of selected partner
  const [editPartnerIdx, setEditPartnerIdx] = useState(null); // null=closed, -1=add new, >=0=edit existing
  const [editing,   setEditing]   = useState(false);
  const [bigChart,  setBigChart]  = useState(null);
  const [bigSyn,    setBigSyn]    = useState(null);
  const [bigSolar,  setBigSolar]  = useState(null);
  const [solarYear, setSolarYear] = useState(() => Math.max(birth.year + 1, new Date().getFullYear()));
  const [solarCity, setSolarCity] = useState(() => residenceCity(birth));
  const [milestoneTheme, setMilestoneTheme] = useState(null);
  const [helpItem, setHelpItem] = useState(null); // объяснение услуги (bottom-sheet)
  const [onb, setOnb] = useState('loading'); // 'loading' | 'needed' | 'done'
  const [otherBirth, setOtherBirth] = useState(null); // натал для другого человека (НЕ сохраняется в БД)
  const [editingOther, setEditingOther] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);

  useEffect(()=>{ try{ localStorage.setItem(BIRTH_KEY, JSON.stringify(birth)); }catch(e){} }, [birth]);
  useEffect(()=>{ try{ localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners)); }catch(e){} }, [partners]);

  // ── Гейтинг онбординга: есть ли у пользователя профиль ──
  const ONB_KEY = 'astro_onboarded_v1';
  const localDone = () => { try { return !!localStorage.getItem(ONB_KEY); } catch(e){ return false; } };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const api = window.AstroAPI;
      // Вне Telegram или без backend — решаем по локальному флагу.
      if (!api || !api.inTelegram() || !api.isConfigured()) {
        if (!cancelled) setOnb(localDone() ? 'done' : 'needed');
        return;
      }
      try {
        const person = await api.getSelf();
        if (cancelled) return;
        if (person) {
          setBirth(api.personToBirth(person));
          setUserName(person.name);
          try { localStorage.setItem(ONB_KEY, '1'); } catch(e){}
          setOnb('done');
          // Подтягиваем партнёров из БД (источник истины).
          try { const ps = await api.listPartners(); if (ps && !cancelled) setPartners(ps); } catch(e){}
        } else {
          setOnb('needed');
        }
      } catch (e) {
        if (!cancelled) setOnb(localDone() ? 'done' : 'needed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const finishOnboarding = async (b) => {
    setBirth(b);
    if (b.name) setUserName(b.name);
    setSolarCity(residenceCity(b));
    try { localStorage.setItem(ONB_KEY, '1'); } catch(e){}
    setOnb('done');
    // Фоновое сохранение в backend (профиль + согласие)
    const api = window.AstroAPI;
    if (api && api.isConfigured() && api.inTelegram()) {
      try { await api.completeOnboarding(b); }
      catch (e) { console.error('onboarding save failed:', e); }
    }
  };

  const sun  = sunSignInfo(birth, lang);
  sun.key    = SIGN_KEYS[sun.idx];

  // derived selected partner object
  const partner = selPartnerIdx !== null && partners[selPartnerIdx] ? partners[selPartnerIdx] : null;

  const openEdit   = () => setEditing(true);
  const saveBirth  = async (nb) => {
    const dateChanged = nb.day !== birth.day || nb.month !== birth.month || nb.year !== birth.year;
    setEditing(false);
    setSolarCity(residenceCity(nb));
    const api = window.AstroAPI;
    if (api && api.isConfigured() && api.inTelegram()) {
      try {
        const person = await api.updateSelf(nb, dateChanged);
        setBirth(api.personToBirth(person)); // подхватываем актуальную блокировку даты
        return;
      } catch (e) {
        if (e && e.message === 'BIRTH_DATE_LOCKED') {
          try { window.Telegram.WebApp.showAlert('Дату рождения можно изменить только один раз.'); } catch(_){}
          try { const p = await api.getSelf(); if (p) { setBirth(api.personToBirth(p)); return; } } catch(_){}
          return;
        }
        console.error('updateSelf failed:', e);
      }
    }
    // Локальный фолбэк (вне Telegram / без backend): фиксируем блокировку локально.
    setBirth({ ...nb, dateLocked: dateChanged ? true : birth.dateLocked });
  };
  const cancelEdit = () => setEditing(false);

  // Смена имени в профиле — обновляем состояние и сохраняем в БД (без изменения даты).
  const updateName = async (name) => {
    const nm = (name || '').trim();
    if (!nm) return;
    setUserName(nm);
    setBirth((b) => ({ ...b, name: nm }));
    const api = window.AstroAPI;
    if (api && api.isConfigured() && api.inTelegram()) {
      try { await api.updateSelf({ ...birth, name: nm }, false); }
      catch (e) { console.error('name save failed:', e); }
    }
  };

  const openAddPartner  = () => setEditPartnerIdx(-1);
  const openEditPartner = (idx) => setEditPartnerIdx(idx);
  const savePartner = async (np) => {
    const api = window.AstroAPI;
    const online = api && api.isConfigured() && api.inTelegram();
    if (editPartnerIdx === -1) {
      const newIdx = partners.length;
      setPartners(prev => [...prev, np]);   // оптимистично
      setSelPartnerIdx(newIdx);
      setEditPartnerIdx(null);
      // Сохраняем в БД и подменяем на версию с backend id.
      if (online) {
        const saved = await api.createPartner(np);
        if (saved) setPartners(prev => prev.map((p, i) => i === newIdx ? saved : p));
      }
    } else {
      const idx = editPartnerIdx;
      const existing = partners[idx];
      setPartners(prev => prev.map((p, i) => i === idx ? { ...np, id: existing && existing.id } : p));
      setEditPartnerIdx(null);
      if (online && existing && existing.id) {
        const saved = await api.updatePartner(existing.id, np);
        if (saved) setPartners(prev => prev.map((p, i) => i === idx ? saved : p));
      } else if (online && existing && !existing.id) {
        // Партнёр был только локально — создаём в БД.
        const saved = await api.createPartner(np);
        if (saved) setPartners(prev => prev.map((p, i) => i === idx ? saved : p));
      }
    }
  };
  const cancelPartner = () => setEditPartnerIdx(null);

  // ── Натал для другого человека (данные НЕ сохраняем) ──
  const saveOther = (b) => { setOtherBirth(b); setEditingOther(false); go('natal_other_chart'); };
  const shareNatal = async () => {
    if (sharingPdf) return;
    const en = lang === 'en';
    const node = document.getElementById('natal-report');
    if (!node || !window.exportNodeToPdfBase64) {
      try { window.Telegram.WebApp.showAlert(en ? 'PDF tool not ready.' : 'Не удалось подготовить PDF.'); } catch(_){}
      return;
    }
    setSharingPdf(true);
    try {
      const b64 = await window.exportNodeToPdfBase64(node, { background: '#0a0812' });
      const api = window.AstroAPI;
      let r = { ok: false, error: 'no api' };
      if (api && api.isConfigured() && api.inTelegram()) r = await api.shareNatalPdf(b64, otherBirth && otherBirth.name);
      let msg = null;
      if (!r.ok) msg = (en ? 'Failed: ' : 'Не получилось: ') + (r.error || '');
      else if (r.relayed) msg = en ? 'Sent to your chat — forward it to the person.' : 'Отправлено тебе в чат — перешли его нужному человеку.';
      else if (r.shared) msg = en ? 'Sent! ✨' : 'Отправлено! ✨';
      // r.shared === false → пользователь закрыл выбор чата, без алерта
      if (msg) { try { window.Telegram.WebApp.showAlert(msg); } catch(_){ alert(msg); } }
    } catch (e) {
      try { window.Telegram.WebApp.showAlert((en?'PDF error: ':'Ошибка PDF: ') + (e && e.message)); } catch(_){}
    } finally { setSharingPdf(false); }
  };
  const deletePartner = (idx) => {
    const api = window.AstroAPI;
    const target = partners[idx];
    if (api && api.isConfigured() && api.inTelegram() && target && target.id) {
      api.deletePartner(target.id); // фоново
    }
    setPartners(prev => prev.filter((_, i) => i !== idx));
    setSelPartnerIdx(prev => {
      if (prev === null) return null;
      if (prev === idx) return null;          // удалили выбранного — сбрасываем выбор
      if (prev > idx)   return prev - 1;      // индекс сместился
      return prev;
    });
  };

  const screen = history[history.length - 1];

  const go   = (id) => { setHistory(h=>[...h,id]); setAnim('astro-in-f'); };
  const back = ()   => { setHistory(h=>h.length>1?h.slice(0,-1):h); setAnim('astro-in-b'); };

  const handleTabChange = (tab) => {
    if (tab === 'home') {
      setAnim('astro-in-f');
      setActiveTab('home');
      setHistory(['home']);
      return;
    }
    if (tab === activeTab) return;
    setAnim('astro-in-f');
    setActiveTab(tab);
  };

  useEffect(()=>{
    if (!anim) return undefined;
    const id = setTimeout(()=>setAnim(''), 400);
    return ()=>clearTimeout(id);
  }, [screen, activeTab, anim]);

  const aspectsItem = { glyph:'aspects', title:{ru:STR.ru.aspectsTitle,en:STR.en.aspectsTitle}, kicker:{ru:'ТРАНЗИТЫ',en:'TRANSITS'}, desc:{ru:STR.ru.aspectsSub,en:STR.en.aspectsSub} };

  let title = '';
  let mainContent;

  if (activeTab === 'profile') {
    mainContent = <ProfileScreen th={th} lang={lang} userName={userName} onUpdateName={updateName} onChangeLang={onChangeLang} birth={birth} onEditBirth={openEdit} sunKey={sun.key}/>;
  } else if (screen === 'home') {
    mainContent = <CosmicMain th={th} lang={lang} onOpen={go} sun={sun} userName={userName} onHelp={setHelpItem}/>;
  } else if (screen === 'natal') {
    title = lang==='ru' ? 'Натальная карта' : 'Natal chart';
    mainContent = <NatalChoiceScreen th={th} lang={lang} onChooseMe={()=>go('natal_me')} onChooseOther={()=>go('natal_other')}/>;
  } else if (screen === 'natal_other') {
    title = lang==='ru' ? 'Другой человек' : 'Another person';
    mainContent = (
      <div style={{padding:'8px 18px 28px',position:'relative',zIndex:1}}>
        <div style={{display:'flex',gap:10,alignItems:'flex-start',padding:'14px 16px',borderRadius:16,background:`${th.accent}14`,border:`1px solid ${th.accent}33`,marginBottom:16}}>
          <span style={{flexShrink:0,fontSize:15,lineHeight:1.3,color:th.glyphClr}}>✦</span>
          <div style={{fontFamily:'"Manrope",sans-serif',fontSize:12.5,lineHeight:1.5,color:th.inkSoft,textWrap:'pretty'}}>
            {lang==='en'
              ? 'We don\'t store this person\'s data — it lives only in this session. You\'ll build the chart and can send the finished PDF straight to them in Telegram.'
              : 'Данные этого человека мы не храним — они существуют только в этой сессии. Ты построишь карту и сможешь отправить готовый PDF прямо ему в Telegram.'}
          </div>
        </div>
        <button onClick={()=>setEditingOther(true)} style={{display:'flex',width:'100%',justifyContent:'center',alignItems:'center',gap:8,height:50,borderRadius:999,border:'none',cursor:'pointer',background:th.accent,color:'#fff',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:15,boxShadow:`0 8px 26px ${th.accentGlow}`}}>
          {otherBirth ? (lang==='en'?'Change data':'Изменить данные') : (lang==='en'?'Enter birth data':'Ввести данные')}
        </button>
        {otherBirth && (
          <button onClick={()=>go('natal_other_chart')} style={{display:'flex',width:'100%',justifyContent:'center',alignItems:'center',gap:7,height:46,marginTop:10,borderRadius:999,cursor:'pointer',background:'none',border:`1px solid ${th.glassBorder}`,color:th.inkSoft,fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13.5}}>
            {lang==='en'?'Open the chart':'Открыть готовую карту'}
          </button>
        )}
      </div>
    );
  } else if (screen === 'natal_other_chart') {
    title = otherBirth ? (otherBirth.name || (lang==='ru'?'Карта':'Chart')) : (lang==='ru'?'Карта':'Chart');
    mainContent = otherBirth ? (
      <div id="natal-report">
        <NatalChartScreen th={th} lang={lang} birth={otherBirth} onExpand={setBigChart}
          shareSlot={
            <div data-html2canvas-ignore="true" style={{marginBottom:18}}>
              <button onClick={shareNatal} disabled={sharingPdf} style={{display:'flex',width:'100%',justifyContent:'center',alignItems:'center',gap:8,height:48,borderRadius:999,border:'none',cursor:sharingPdf?'default':'pointer',background:sharingPdf?th.muted:th.accent,color:'#fff',fontFamily:'"Manrope",sans-serif',fontWeight:700,fontSize:14.5,boxShadow:`0 8px 26px ${th.accentGlow}`}}>
                {sharingPdf ? (lang==='en'?'Preparing PDF…':'Готовим PDF…') : (lang==='en'?'Share chart (PDF)':'Поделиться картой (PDF)')}
              </button>
              <div style={{fontFamily:'"Manrope",sans-serif',fontSize:11,color:th.muted,textAlign:'center',marginTop:8,lineHeight:1.45}}>
                {lang==='en'?'Data isn\'t saved. The file goes to the recipient in Telegram.':'Данные не сохраняются. Файл уходит получателю в Telegram.'}
              </div>
            </div>
          }/>
      </div>
    ) : (
      <div style={{padding:'50px 24px',textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{fontFamily:'"Manrope",sans-serif',fontSize:13,color:th.muted,marginBottom:16}}>{lang==='en'?'No data yet.':'Данные ещё не введены.'}</div>
        <button onClick={()=>go('natal_other')} style={{padding:'10px 20px',borderRadius:999,border:`1px solid ${th.glassBorder}`,background:th.chip,color:th.ink,cursor:'pointer',fontFamily:'"Manrope",sans-serif',fontWeight:600,fontSize:13}}>{lang==='en'?'Enter data':'Ввести данные'}</button>
      </div>
    );
  } else if (screen === 'natal_me') {
    title = lang==='ru' ? 'Данные рождения' : 'Birth data';
    mainContent = <NatalConfirmScreen th={th} lang={lang} birth={birth} userName={userName} onConfirm={()=>go('natal_chart')} onEdit={openEdit}/>;
  } else if (screen === 'natal_chart') {
    title = lang==='ru' ? 'Натальная карта' : 'Natal chart';
    mainContent = <NatalChartScreen th={th} lang={lang} birth={birth} onExpand={setBigChart}/>;
  } else if (screen === 'synastry') {
    title = lang==='ru' ? 'Синастрия' : 'Synastry';
    mainContent = <SynastryIntakeScreen th={th} lang={lang} you={{...birth, name:userName, nameEn:USER.nameEn}} partners={partners} selectedPartnerIdx={selPartnerIdx} onSelectPartner={setSelPartnerIdx} onAddPartner={openAddPartner} onEditPartner={openEditPartner} onDeletePartner={deletePartner} onEditYou={openEdit} onBuild={()=>go('synastry_chart')}/>;
  } else if (screen === 'synastry_chart') {
    title = lang==='ru' ? 'Синастрия' : 'Synastry';
    mainContent = <SynastryChartScreen th={th} lang={lang} you={{...birth, name:userName, nameEn:USER.nameEn}} partner={partner} onExpand={setBigSyn}/>;
  } else if (screen === 'solar') {
    title = lang==='ru' ? 'Соляр' : 'Solar return';
    mainContent = <SolarIntakeScreen th={th} lang={lang} birth={birth} userName={userName} year={solarYear} onYear={setSolarYear} srCity={solarCity} onCity={setSolarCity} onBuild={()=>go('solar_chart')}/>;
  } else if (screen === 'solar_chart') {
    title = lang==='ru' ? 'Соляр' : 'Solar return';
    mainContent = <SolarChartScreen th={th} lang={lang} birth={birth} year={solarYear} srCity={solarCity} onExpand={setBigSolar}/>;
  } else if (screen === 'milestones') {
    title = lang==='ru' ? 'Жизненные вехи' : 'Life Milestones';
    mainContent = <MilestonesIntakeScreen th={th} lang={lang} birth={birth} userName={userName} onEditBirth={openEdit} onChoose={(id)=>{ setMilestoneTheme(id); go('milestones_result'); }}/>;
  } else if (screen === 'milestones_result') {
    const mt = window.MILESTONES && window.MILESTONES.THEMES.find(t=>t.id===milestoneTheme);
    title = mt ? mt.title[lang] : (lang==='ru' ? 'Жизненные вехи' : 'Life Milestones');
    mainContent = <MilestonesResultScreen th={th} lang={lang} birth={birth} themeId={milestoneTheme}/>;
  } else if (screen === 'aspects') {
    title = lang==='ru' ? 'Аспекты на месяц' : 'Aspects this month';
    mainContent = <AspectsMonthScreen th={th} lang={lang} birth={birth}/>;
  } else {
    const item = screen==='aspects' ? aspectsItem : POSSIBILITIES.find(p=>p.id===screen);
    title = item.title[lang];
    mainContent = <SubScreen th={th} lang={lang} item={item}/>;
  }

  const animKey = activeTab === 'profile' ? 'prof_' + lang : screen + lang;

  return (
    <IOSDevice dark={th.effDark} embedded={embedded}>
      <div style={{position:'relative',height:'100%',color:th.ink,display:'flex',flexDirection:'column'}}>
        <Sky th={th}/>
        {/* ── Scrollable content ── */}
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden',position:'relative',zIndex:1,scrollbarWidth:'none'}}>
          <Header th={th} lang={lang} screen={screen} activeTab={activeTab} title={title} onBack={back}/>
          <div key={animKey} className={anim} style={{position:'relative',zIndex:1}}>
            {mainContent}
          </div>
        </div>
        {/* ── Bottom nav ── */}
        <BottomNav th={th} lang={lang} activeTab={activeTab} onTab={handleTabChange}/>

        {/* ── Объяснение услуги (над нижним меню) ── */}
        {helpItem && <ServiceHelpSheet th={th} lang={lang} item={helpItem} onClose={()=>setHelpItem(null)}/>}

        {/* ── Онбординг: проверка профиля / форма приветствия ── */}
        {onb === 'loading' && (
          <div style={{position:'absolute',inset:0,zIndex:90,display:'flex',alignItems:'center',justifyContent:'center',background:th.effDark?'#0a0812':'#f6f3ff'}}>
            <div style={{width:34,height:34,borderRadius:'50%',border:`3px solid ${th.glassBorder}`,borderTopColor:th.accent,animation:'astroSpin .8s linear infinite'}}/>
          </div>
        )}
        {onb === 'needed' && (
          <div className="astro-in-f" style={{position:'absolute',inset:0,zIndex:90,overflow:'hidden'}}>
            <Sky th={th}/>
            <div style={{position:'relative',zIndex:1,height:'100%'}}>
              <BirthDataEditor th={th} lang={lang}
                initial={{ name:'', day:null, month:1, year:2000, timeMode:null, hour:null, minute:null, approx:null, city:null, residence:null }}
                onSave={finishOnboarding} onCancel={()=>{}} onboarding/>
            </div>
          </div>
        )}

        {/* ── Birth-data editor overlay (returns to wherever it was opened) ── */}
        {editing && (
          <div className="astro-in-f" style={{position:'absolute',inset:0,zIndex:70,overflow:'hidden'}}>
            <Sky th={th}/>
            <div style={{position:'relative',zIndex:1,height:'100%'}}>
              <BirthDataEditor th={th} lang={lang} initial={birth} onSave={saveBirth} onCancel={cancelEdit}/>
            </div>
          </div>
        )}

        {/* ── Natal-for-other editor overlay (данные НЕ сохраняются) ── */}
        {editingOther && (
          <div className="astro-in-f" style={{position:'absolute',inset:0,zIndex:72,overflow:'hidden'}}>
            <Sky th={th}/>
            <div style={{position:'relative',zIndex:1,height:'100%'}}>
              <BirthDataEditor th={th} lang={lang}
                initial={otherBirth || DEFAULT_PARTNER}
                onSave={saveOther} onCancel={()=>setEditingOther(false)}
                showName title={lang==='en'?'Their birth data':'Данные человека'}/>
            </div>
          </div>
        )}

        {/* ── Partner-data editor overlay (add new or edit existing) ── */}
        {editPartnerIdx !== null && (
          <div className="astro-in-f" style={{position:'absolute',inset:0,zIndex:72,overflow:'hidden'}}>
            <Sky th={th}/>
            <div style={{position:'relative',zIndex:1,height:'100%'}}>
              <BirthDataEditor th={th} lang={lang}
                initial={editPartnerIdx === -1 ? DEFAULT_PARTNER : partners[editPartnerIdx]}
                onSave={savePartner} onCancel={cancelPartner}
                showName title={lang==='en'?'Partner\'s data':'Данные партнёра'}/>
            </div>
          </div>
        )}

        {/* ── Expanded chart overlay ── */}
        {bigChart && (
          <ChartExpandOverlay th={th} lang={lang} data={bigChart} onClose={()=>setBigChart(null)}/>
        )}

        {/* ── Expanded synastry bi-wheel overlay ── */}
        {bigSyn && (
          <SynastryExpandOverlay th={th} lang={lang} data={bigSyn} onClose={()=>setBigSyn(null)}/>
        )}

        {/* ── Expanded solar bi-wheel overlay ── */}
        {bigSolar && (
          <SolarExpandOverlay th={th} lang={lang} data={bigSolar} onClose={()=>setBigSolar(null)}/>
        )}
      </div>
    </IOSDevice>
  );
}

// ════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "serif": "Lora",
  "accent": "#7B61FF",
  "dark": false,
  "tod": "Авто",
  "lang": "RU"
}/*EDITMODE-END*/;

const SERIF_MAP = {'Lora':"'Lora',Georgia,serif",'Playfair Display':"'Playfair Display',Georgia,serif",'Cormorant':"'Cormorant Garamond',Georgia,serif",'PT Serif':"'PT Serif',Georgia,serif"};
const TOD_MAP   = {'Авто':'auto','Ночь':'night','Утро':'morning','День':'day','Вечер':'evening'};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(()=>{ document.documentElement.style.setProperty('--ds-serif',SERIF_MAP[t.serif]||SERIF_MAP['Lora']); },[t.serif]);

  const todKey = TOD_MAP[t.tod]||'auto';
  const tod    = todKey==='auto'?getTimeOfDay():todKey;
  const mode   = t.dark?'dark':'light';
  const lang   = t.lang==='EN'?'en':'ru';
  const th     = getTheme(mode,tod,t.accent);

  const handleChangeLang = (code) => setTweak('lang', code); // 'RU' | 'EN'

  const isTg = typeof window !== 'undefined' && window.IS_TG;

  // В Telegram — на весь экран, без рамки телефона и dev-панели.
  if (isTg) {
    return (
      <div style={{position:'fixed',inset:0,background:'#0a0812'}}>
        <AstroPhone th={th} lang={lang} onChangeLang={handleChangeLang} embedded/>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:36,background:'radial-gradient(120% 90% at 50% 0%,#1b1530 0%,#0a0812 70%)'}}>
        <div style={{borderRadius:48,boxShadow:'0 50px 110px rgba(0,0,0,0.65)'}}>
          <AstroPhone th={th} lang={lang} onChangeLang={handleChangeLang}/>
        </div>
      </div>
      <TweaksPanel>
        <TweakSection label="Тема"/>
        <TweakToggle label="Тёмная тема" value={t.dark} onChange={v=>setTweak('dark',v)}/>
        <TweakSelect label="Время суток" value={t.tod} options={['Авто','Ночь','Утро','День','Вечер']} onChange={v=>setTweak('tod',v)}/>
        <TweakSection label="Стиль"/>
        <TweakColor label="Акцент" value={t.accent} options={['#7B61FF','#4E6BFF','#C45BD6','#2FB6A8']} onChange={v=>setTweak('accent',v)}/>
        <TweakSelect label="Шрифт заголовков" value={t.serif} options={['Lora','Playfair Display','Cormorant','PT Serif']} onChange={v=>setTweak('serif',v)}/>
        <TweakSection label="Язык"/>
        <TweakRadio label="Язык интерфейса" value={t.lang} options={['RU','EN']} onChange={v=>setTweak('lang',v)}/>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
