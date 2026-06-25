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
              Сформулируй один вопрос — карты ответят раскладом <b>Ситуация · Совет · Итог</b>. Сосредоточься на нём, пока тянешь карты.
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

          {/* толкования по позициям */}
          {reveal >= 3 && (
            <div style={{ animation: 'ta_in .5s ease both' }}>
              {spread.map((entry, i) => {
                const pos = T.POSITIONS[i];
                const m = entry.reversed ? entry.card.rev : entry.card.up;
                return (
                  <div key={i} style={{ marginBottom: 16, paddingLeft: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--ds-serif)', fontSize: 16, fontWeight: 600, color: ink }}>{pos.ru}</span>
                      <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11, color: muted }}>· {pos.hint}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 13, color: th.accent }}>{entry.card.name}</span>
                      <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 8,
                        color: entry.reversed ? '#c2410c' : '#15803d',
                        background: entry.reversed ? 'rgba(234,88,12,0.13)' : 'rgba(34,160,80,0.13)' }}>
                        {entry.reversed ? 'перевёрнута' : 'прямая'}
                      </span>
                    </div>
                    <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 11.5, color: muted, marginBottom: 4, fontStyle: 'italic' }}>{m.kw}</div>
                    <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.55, color: inkSoft, margin: 0, textWrap: 'pretty' }}>
                      <b style={{ color: ink }}>{pos.lead}</b> {m.t}
                    </p>
                  </div>
                );
              })}

              {/* свод */}
              <div style={{ marginTop: 8, padding: '14px 16px', borderRadius: 16,
                background: th.effDark ? 'rgba(212,175,90,0.1)' : 'rgba(212,175,90,0.14)', border: `1px solid ${gold}55` }}>
                <div style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: gold, marginBottom: 6 }}>✦ Свод расклада</div>
                <p style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, lineHeight: 1.55, color: ink, margin: 0, textWrap: 'pretty' }}>{T.synthesize(spread)}</p>
              </div>

              <button onClick={reset} style={{ width: '100%', marginTop: 20, padding: '13px', borderRadius: 14, cursor: 'pointer',
                fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 14, color: ink,
                background: 'transparent', border: `1.5px solid ${th.glassBorder}` }}>
                Новый расклад
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

window.TarotScreen = TarotScreen;
