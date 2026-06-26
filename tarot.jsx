// tarot.jsx — экран Таро: вопрос → магическая прогрузка → расклад из 3 карт.
// Расклад «Ситуация · Совет · Итог», готовые толкования из window.TAROT.
// Экспортирует window.TarotScreen.

const { useState: useStateTa, useEffect: useEffectTa, useRef: useRefTa } = React;

// ── Глифы мастей / старшего аркана ──────────────────────────────────────────
function TarotGlyph({ arcana, size = 34, color = 'currentColor' }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (arcana) {
    case 'wands': // жезл
      return (<svg {...c}><path d="M7 19 19 7"/><path d="M16 5.5 19 7l-1.5 3"/><circle cx="7" cy="19" r="1.4" fill={color} stroke="none"/></svg>);
    case 'cups': // кубок
      return (<svg {...c}><path d="M7 5h10l-1 5a4 4 0 0 1-8 0L7 5Z"/><path d="M12 14v4M9 20h6"/></svg>);
    case 'swords': // меч
      return (<svg {...c}><path d="M12 3v12"/><path d="M9 15h6l-3 4-3-4Z" fill={color} stroke="none"/><path d="M7 6l5-3 5 3"/></svg>);
    case 'pentacles': // пентакль
      return (<svg {...c}><circle cx="12" cy="12" r="8.2"/><path d="M12 5.2l1.9 5.8h6.1l-4.9 3.6 1.9 5.8-5-3.6-5 3.6 1.9-5.8L4 11h6.1L12 5.2Z" transform="scale(0.66) translate(6.2 6.2)"/></svg>);
    default: // major — лучистая звезда
      return (<svg {...c}><path d="M12 2.5l1.8 5.4 5.7.1-4.6 3.4 1.7 5.5L12 18.9 7.4 20.4l1.7-5.5L4.5 8l5.7-.1L12 2.5Z"/><circle cx="12" cy="12" r="1.1" fill={color} stroke="none"/></svg>);
  }
}

function roman(n) {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = '', x = n;
  for (const [v, r] of map) while (x >= v) { s += r; x -= v; }
  return n === 0 ? '0' : s;
}

// Рубашка карты (декоративная)
function CardBack({ th, w }) {
  const h = Math.round(w * 1.66);
  const gold = th.gold;
  return (
    <div style={{ width: w, height: h, borderRadius: 12, background: th.effDark ? 'linear-gradient(160deg,#2a2050,#160f30)' : 'linear-gradient(160deg,#3a2f6e,#221a4e)', border: `2px solid ${gold}aa`, boxShadow: '0 10px 24px rgba(20,10,40,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 6, borderRadius: 8, border: `1px solid ${gold}66` }}/>
      <TarotGlyph arcana="major" size={Math.round(w * 0.44)} color={gold}/>
    </div>
  );
}

// ── Одна карта (реальный рисунок Райдера-Уэйта) ──────────────────────────────
function TarotCard({ entry, th, faceDown, w = 98 }) {
  const h = Math.round(w * 1.66);
  const gold = th.gold;
  const [err, setErr] = useStateTa(false);

  if (faceDown) return <CardBack th={th} w={w}/>;

  const card = entry.card;
  const rev = entry.reversed;

  return (
    <div style={{ width: w, height: h, borderRadius: 12, position: 'relative', overflow: 'hidden',
      border: `2px solid ${gold}bb`, boxShadow: '0 10px 24px rgba(20,10,40,0.4)',
      background: th.effDark ? '#1a1336' : '#efe7d8' }}>
      {!err ? (
        <img src={`cards/${card.id}.jpg`} alt={card.name} draggable={false}
          onError={() => setErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: rev ? 'rotate(180deg)' : 'none' }}/>
      ) : (
        // запасной вид, если картинка не загрузилась
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, transform: rev ? 'rotate(180deg)' : 'none', padding: 6 }}>
          <TarotGlyph arcana={card.arcana} size={Math.round(w * 0.42)} color={gold}/>
          <div style={{ fontFamily: 'var(--ds-serif)', fontSize: 11, fontWeight: 600, color: th.ink, textAlign: 'center', lineHeight: 1.1 }}>{card.name}</div>
        </div>
      )}
      {/* мягкая золотая виньетка */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 10, boxShadow: `inset 0 0 0 1px ${gold}55`, pointerEvents: 'none' }}/>
      {rev && (
        <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(150,45,15,0.92)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 6, fontFamily: '"Manrope",sans-serif' }}>⤼</div>
      )}
    </div>
  );
}

// ── Экран ───────────────────────────────────────────────────────────────────
function TarotScreen({ th, lang }) {
  const T = window.TAROT;
  const [phase, setPhase] = useStateTa('ask');     // ask | shuffle | result
  const [question, setQuestion] = useStateTa('');
  const [spread, setSpread] = useStateTa(null);
  const [reveal, setReveal] = useStateTa(0);        // сколько карт раскрыто
  const timers = useRefTa([]);

  useEffectTa(() => () => timers.current.forEach(clearTimeout), []);

  const ready = question.trim().length >= 3;

  function castSpread() {
    if (!ready) return;
    const s = T.draw();
    setSpread(s);
    setReveal(0);
    setPhase('shuffle');
    timers.current.push(setTimeout(() => {
      setPhase('result');
      // последовательное раскрытие карт
      [0, 1, 2].forEach((i) => timers.current.push(setTimeout(() => setReveal(i + 1), 420 * i)));
    }, 2200));
  }

  function reset() {
    timers.current.forEach(clearTimeout); timers.current = [];
    setSpread(null); setReveal(0); setPhase('ask');
  }

  const muted = th.muted, ink = th.ink, inkSoft = th.inkSoft, gold = th.gold;

  return (
    <div style={{ padding: '4px 2px 30px' }}>
      <style>{`
        @keyframes ta_float { 0%,100%{ transform:translateY(0) rotate(var(--r)); } 50%{ transform:translateY(-10px) rotate(var(--r)); } }
        @keyframes ta_pulse { 0%,100%{ opacity:.55; } 50%{ opacity:1; } }
        @keyframes ta_sheen { 0%{ background-position:-160% 0; } 100%{ background-position:260% 0; } }
        @keyframes ta_in { from{ opacity:0; transform:translateY(10px) scale(.94);} to{ opacity:1; transform:none;} }
        @keyframes ta_spark { 0%,100%{ opacity:.2; transform:scale(.8);} 50%{ opacity:1; transform:scale(1.15);} }
      `}</style>

      {/* ── ВОПРОС ── */}
      {phase === 'ask' && (
        <div style={{ animation: 'ta_in .4s ease both' }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{ display: 'inline-flex', marginBottom: 10, opacity: 0.9 }}>
              <TarotGlyph arcana="major" size={40} color={gold}/>
            </div>
            <h2 style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 22, color: ink, margin: '0 0 6px' }}>Расклад на вопрос</h2>
            <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.5, color: inkSoft, margin: '0 auto', maxWidth: 300 }}>
              Сформулируй один вопрос — карты ответят раскладом <b>Прошлое · Настоящее · Будущее</b>. Сосредоточься на нём, пока тянешь карты.
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={240}
              placeholder="Например: стоит ли мне менять работу сейчас?"
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'none', borderRadius: 16, padding: '13px 14px',
                fontFamily: '"Manrope",sans-serif', fontSize: 14, lineHeight: 1.45, color: ink,
                background: th.effDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${th.glassBorder}`, outline: 'none' }}/>
            <div style={{ textAlign: 'right', fontFamily: '"Manrope",sans-serif', fontSize: 10.5, color: muted, marginTop: 4 }}>{question.length}/240</div>
          </div>

          <button
            onClick={castSpread}
            disabled={!ready}
            style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: ready ? 'pointer' : 'default',
              fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: 0.3,
              color: ready ? '#fff' : muted,
              background: ready ? `linear-gradient(135deg, ${th.accent} 0%, ${gold} 140%)` : th.glassBorder,
              boxShadow: ready ? '0 10px 26px rgba(60,30,90,0.3)' : 'none', transition: 'opacity .2s' }}>
            ✦ Разложить карты
          </button>

          <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, lineHeight: 1.5, color: muted, textAlign: 'center', margin: '14px auto 0', maxWidth: 290 }}>
            Колода из 78 карт Райдера–Уэйта. Толкование — общее значение карт; относись к нему как к подсказке для размышления, а не предсказанию.
          </p>
        </div>
      )}

      {/* ── ПРОГРУЗКА ── */}
      {phase === 'shuffle' && (
        <div style={{ minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
          <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
            {[-1, 0, 1].map((k, i) => (
              <div key={i} style={{ '--r': `${k * 7}deg`, animation: `ta_float 1.8s ease-in-out ${i * 0.18}s infinite` }}>
                <TarotCard th={th} faceDown w={86}/>
              </div>
            ))}
            {/* искры */}
            {[...Array(6)].map((_, i) => (
              <span key={'s' + i} style={{ position: 'absolute', left: `${10 + i * 16}%`, top: `${i % 2 ? 8 : 78}%`,
                color: gold, fontSize: 12 + (i % 3) * 4, animation: `ta_spark ${1.2 + (i % 3) * 0.4}s ease-in-out ${i * 0.2}s infinite` }}>✦</span>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--ds-serif)', fontSize: 16, color: ink, animation: 'ta_pulse 1.6s ease-in-out infinite', textAlign: 'center' }}>
            Карты слушают твой вопрос…
          </div>
        </div>
      )}

      {/* ── РЕЗУЛЬТАТ ── */}
      {phase === 'result' && spread && (
        <div>
          <div style={{ background: th.effDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.55)', border: `1px solid ${th.glassBorder}`,
            borderRadius: 14, padding: '11px 14px', marginBottom: 18 }}>
            <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: muted, marginBottom: 3 }}>Твой вопрос</div>
            <div style={{ fontFamily: 'var(--ds-serif)', fontSize: 15, color: ink, lineHeight: 1.3 }}>{question.trim()}</div>
          </div>

          {/* три карты в ряд */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 9, marginBottom: 22 }}>
            {spread.map((entry, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, width: 100 }}>
                <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase', color: gold }}>{T.POSITIONS[i].ru}</div>
                <div style={{ animation: reveal > i ? 'ta_in .55s ease both' : 'none' }}>
                  {reveal > i ? <TarotCard entry={entry} th={th} w={98}/> : <CardBack th={th} w={98}/>}
                </div>
                <div style={{ fontFamily: 'var(--ds-serif)', fontSize: 11.5, fontWeight: 600, color: th.ink, textAlign: 'center', lineHeight: 1.15, minHeight: 28,
                  opacity: reveal > i ? 1 : 0, transition: 'opacity .4s' }}>
                  {entry.card.name}{entry.reversed ? <span style={{ display: 'block', fontFamily: '"Manrope",sans-serif', fontSize: 9, fontWeight: 700, color: '#c2410c' }}>перевёрнута</span> : null}
                </div>
              </div>
            ))}
          </div>

          {/* толкования по позициям + ответ */}
          {reveal >= 3 && (() => {
            const reading = T.interpret(spread, question.trim());
            const a = reading.answer;
            const toneClr = { good: '#15803d', neutral: gold, hard: '#c2410c' };
            const clr = toneClr[a.tone];
            return (
            <div style={{ animation: 'ta_in .5s ease both' }}>
              {/* ОТВЕТ на вопрос */}
              <div style={{ marginBottom: 18, padding: '15px 16px', borderRadius: 16,
                background: th.effDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.62)', border: `1.5px solid ${clr}66` }}>
                <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: muted, marginBottom: 5 }}>
                  {reading.yesno ? 'Ответ на вопрос' : 'Склонение расклада'}
                </div>
                <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 23, color: clr, marginBottom: 6, lineHeight: 1.05 }}>{a.label}</div>
                <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.55, color: ink, margin: 0, textWrap: 'pretty' }}>{a.t}</p>
              </div>

              {reading.positions.map((p, i) => (
                <div key={i} style={{ marginBottom: 16, paddingLeft: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--ds-serif)', fontSize: 16, fontWeight: 600, color: ink }}>{p.pos.ru}</span>
                    <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: muted }}>· {p.pos.hint}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 13, color: th.accent }}>{p.card.name}</span>
                    <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 8,
                      color: p.reversed ? '#c2410c' : '#15803d',
                      background: p.reversed ? 'rgba(234,88,12,0.13)' : 'rgba(34,160,80,0.13)' }}>
                      {p.reversed ? 'перевёрнута' : 'прямая'}
                    </span>
                  </div>
                  <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, color: muted, marginBottom: 4, fontStyle: 'italic' }}>{p.kw}</div>
                  <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.55, color: inkSoft, margin: 0, textWrap: 'pretty' }}>
                    <b style={{ color: ink }}>{p.pos.lead}</b> {p.core}
                  </p>
                </div>
              ))}

              {/* свод */}
              <div style={{ marginTop: 8, padding: '14px 16px', borderRadius: 16,
                background: th.effDark ? 'rgba(212,175,90,0.1)' : 'rgba(212,175,90,0.14)', border: `1px solid ${gold}55` }}>
                <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: gold, marginBottom: 6 }}>✦ Свод расклада</div>
                <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.55, color: ink, margin: 0, textWrap: 'pretty' }}>{reading.synth}</p>
              </div>

              <button onClick={reset} style={{ width: '100%', marginTop: 20, padding: '13px', borderRadius: 14, cursor: 'pointer',
                fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 14, color: ink,
                background: 'transparent', border: `1.5px solid ${th.glassBorder}` }}>
                Новый расклад
              </button>
            </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

window.TarotScreen = TarotScreen;

// ── Карта дня (бесплатный ежедневный виджет на главной) ──────────────────────
function tarotDayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function tarotHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// Детерминированная карта на сегодня (одна на день для пользователя).
function tarotDayEntry() {
  const T = window.TAROT;
  const dayKey = tarotDayKey();
  const uid = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe
    && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.id) || 'guest';
  const seed = tarotHash(dayKey + ':' + uid);
  const entry = { card: T.DECK[seed % T.DECK.length], reversed: ((seed >> 9) & 7) < 3 }; // ~37% перевёрнута
  return { entry, dayKey };
}
window.tarotDayEntry = tarotDayEntry;

function tarotDaySeen(dayKey) {
  try { const r = JSON.parse(localStorage.getItem('astro_tarot_day') || '{}'); return r.date === dayKey && r.flipped; } catch (e) { return false; }
}

// Виджет-баннер на главной: рубашка → по тапу открывает мистический оверлей.
function TarotDailyCard({ th, lang, onReveal }) {
  const en = lang === 'en';
  const { entry, dayKey } = tarotDayEntry();
  const m = entry.reversed ? entry.card.rev : entry.card.up;
  const [seen, setSeen] = useStateTa(false);
  useEffectTa(() => { setSeen(tarotDaySeen(dayKey)); }, [dayKey]);

  const gold = th.gold;
  return (
    <button onClick={() => { setSeen(true); onReveal && onReveal(); }} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', cursor: 'pointer',
      background: th.glassStrong, border: `1px solid ${th.glassBorder}`, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderRadius: 22, padding: '13px 16px', marginBottom: 22, boxSizing: 'border-box',
    }}>
      <div style={{ flexShrink: 0 }}>
        {seen ? <TarotCard entry={entry} th={th} w={48}/> : <CardBack th={th} w={48}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1.4, color: gold, marginBottom: 4 }}>
          {en ? 'CARD OF THE DAY' : 'КАРТА ДНЯ'}
        </div>
        {seen ? (
          <React.Fragment>
            <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 16, lineHeight: 1.1, color: th.ink, marginBottom: 3 }}>
              {entry.card.name}{entry.reversed ? <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10, fontWeight: 700, color: '#c2410c' }}>{'  · перевёрнута'}</span> : null}
            </div>
            <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, lineHeight: 1.4, color: th.inkSoft }}>{en ? 'Tap to look again ✦' : 'Нажми, чтобы взглянуть снова ✦'}</div>
          </React.Fragment>
        ) : (
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.35, color: th.inkSoft }}>
            {en ? 'Tap to reveal your card for today ✦' : 'Нажми, чтобы открыть карту на сегодня ✦'}
          </div>
        )}
      </div>
    </button>
  );
}
window.TarotDailyCard = TarotDailyCard;

// ── Мистический оверлей: карта выпадает сверху и переворачивается ─────────────
function TarotDayReveal({ th, lang, onClose }) {
  const en = lang === 'en';
  const { entry, dayKey } = tarotDayEntry();
  const m = entry.reversed ? entry.card.rev : entry.card.up;
  const gold = th.gold;
  const W = 156;

  useEffectTa(() => {
    try { localStorage.setItem('astro_tarot_day', JSON.stringify({ date: dayKey, flipped: true })); } catch (e) {}
  }, [dayKey]);

  const dateStr = (() => { try { return new Date().toLocaleDateString(en ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long' }); } catch (e) { return ''; } })();

  // Специальный текст «карты дня» (с откатом на общее значение карты).
  const DT = (window.TAROT_DAY_TEXT || {})[entry.card.id] || {};
  const dayText = (en ? (entry.reversed ? DT.enRev : DT.en) : (entry.reversed ? DT.ruRev : DT.ru)) || m.t;

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 96, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 24px', overflow: 'hidden',
      background: th.effDark ? 'radial-gradient(120% 80% at 50% 22%, rgba(60,40,110,0.6), rgba(8,6,18,0.93))' : 'radial-gradient(120% 80% at 50% 22%, rgba(150,120,210,0.45), rgba(20,14,40,0.9))',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <style>{`
        @keyframes tdr_drop { 0%{ transform:translateY(-135%) rotate(-16deg) scale(.78); opacity:0; } 60%{ opacity:1; } 100%{ transform:translateY(0) rotate(0) scale(1); opacity:1; } }
        @keyframes tdr_flip { from{ transform:rotateY(180deg); } to{ transform:rotateY(0deg); } }
        @keyframes tdr_glow { 0%,100%{ opacity:.35; transform:scale(.92);} 50%{ opacity:.8; transform:scale(1.08);} }
        @keyframes tdr_text { from{ opacity:0; transform:translateY(14px);} to{ opacity:1; transform:none;} }
        @keyframes tdr_spark { 0%,100%{ opacity:.15; transform:scale(.7);} 50%{ opacity:1; transform:scale(1.2);} }
      `}</style>

      {/* искры по фону */}
      {[...Array(10)].map((_, i) => (
        <span key={i} style={{ position: 'absolute', left: `${8 + (i * 9) % 86}%`, top: `${12 + (i * 37) % 74}%`,
          color: gold, fontSize: 9 + (i % 3) * 5, animation: `tdr_spark ${1.4 + (i % 4) * 0.4}s ease-in-out ${i * 0.18}s infinite`, pointerEvents: 'none' }}>✦</span>
      ))}

      {/* закрыть */}
      <button onClick={onClose} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 14px)', right: 16, width: 34, height: 34, borderRadius: 999,
        border: `1px solid ${th.glassBorder}`, background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 17, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>✕</button>

      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 340 }}>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: gold, marginBottom: 2 }}>
          {en ? 'Card of the day' : 'Карта дня'}
        </div>
        <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 18 }}>{dateStr}</div>

        {/* карта: выпадение + 3D-переворот */}
        <div style={{ perspective: 1000, marginBottom: 16, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -18, borderRadius: '50%', background: `radial-gradient(circle, ${gold}55, transparent 70%)`, animation: 'tdr_glow 2.4s ease-in-out infinite', pointerEvents: 'none' }}/>
          <div style={{ animation: 'tdr_drop .8s cubic-bezier(.18,.8,.26,1.06) both' }}>
            <div style={{ width: W, height: Math.round(W * 1.66), position: 'relative', transformStyle: 'preserve-3d', animation: 'tdr_flip 1.05s ease .5s both' }}>
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                <TarotCard entry={entry} th={th} w={W}/>
              </div>
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <CardBack th={th} w={W}/>
              </div>
            </div>
          </div>
        </div>

        {/* толкование появляется после приземления */}
        <div style={{ animation: 'tdr_text .6s ease 1.5s both', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 22, color: '#fff', marginBottom: 4, lineHeight: 1.1 }}>{entry.card.name}</div>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
              color: entry.reversed ? '#fca5a5' : '#86efac', background: entry.reversed ? 'rgba(220,60,30,0.22)' : 'rgba(40,180,90,0.22)' }}>
              {entry.reversed ? (en ? 'reversed' : 'перевёрнута') : (en ? 'upright' : 'прямая')}
            </span>
          </div>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, fontWeight: 600, fontStyle: 'italic', color: '#ffe1a3', marginBottom: 8, textShadow: '0 1px 8px rgba(15,8,32,0.75)' }}>{m.kw}</div>
          <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.92)', margin: 0, textWrap: 'pretty' }}>{dayText}</p>
        </div>

        <button onClick={onClose} style={{ animation: 'tdr_text .6s ease 1.7s both', marginTop: 22, padding: '11px 26px', borderRadius: 999, cursor: 'pointer',
          fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 13, color: '#fff',
          background: `linear-gradient(135deg, ${th.accent}, ${gold} 150%)`, border: 'none', boxShadow: '0 8px 24px rgba(40,20,70,0.4)' }}>
          {en ? 'Thank you ✦' : 'Принять ✦'}
        </button>
      </div>
    </div>
  );
}
window.TarotDayReveal = TarotDayReveal;
