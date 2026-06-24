// horar.jsx — экран хорарного вопроса. Логика суждения — в horar-engine.js.
const { useState: useStateHz, useEffect: useEffectHz } = React;

const HZ_SIGN_RU = ['Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы'];
const HZ_SIGN_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const HZ_ASP = {
  conjunction: { ru: 'соединение', en: 'conjunction', sym: '☌' },
  sextile:     { ru: 'секстиль',   en: 'sextile',     sym: '⚹' },
  square:      { ru: 'квадрат',    en: 'square',      sym: '□' },
  trine:       { ru: 'трин',       en: 'trine',       sym: '△' },
  opposition:  { ru: 'оппозиция',  en: 'opposition',  sym: '☍' },
};
function hzPl(id, en) { return (window.PL_META && window.PL_META[id]) ? window.PL_META[id][en ? 'en' : 'ru'] : id; }
function hzSign(i, en) { return (en ? HZ_SIGN_EN : HZ_SIGN_RU)[i] || ''; }
function hzHouseOrd(h, en) { return en ? `house ${h}` : `${h}-й дом`; }
function hzUnit(kind, en) {
  if (en) return kind === 'days' ? 'days' : kind === 'weeks' ? 'weeks' : 'months';
  return kind === 'days' ? 'дн.' : kind === 'weeks' ? 'нед.' : 'мес.';
}

function HorarScreen({ th, lang, city }) {
  const en = lang === 'en';
  const [voc, setVoc] = useStateHz(null);     // null=loading, {voc, ...}
  const [q, setQ] = useStateHz('');
  const [topic, setTopic] = useStateHz('');
  const [consent, setConsent] = useStateHz(false);
  const [result, setResult] = useStateHz(null);
  const [cool, setCool] = useStateHz(null);   // {nextMs} | null
  const [now, setNow] = useStateHz(Date.now());

  useEffectHz(() => {
    try { setVoc(window.HORAR.moonVoidOfCourse(new Date())); } catch (e) { setVoc({ voc: false, error: true }); }
    try {
      const last = +localStorage.getItem('astro_horar_last') || 0;
      const next = last + 24 * 3600 * 1000;
      if (Date.now() < next) setCool({ nextMs: next });
    } catch (e) {}
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // снять кулдаун, когда время вышло
  useEffectHz(() => { if (cool && now >= cool.nextMs) setCool(null); }, [now, cool]);

  const noCity = !city || city.lat == null || city.lon == null;
  const topicObj = window.HORAR && window.HORAR.TOPICS.find(t => t.id === topic);
  const canAsk = !!q.trim() && !!topicObj && consent && !cool && voc && !voc.voc && !noCity;

  const doAsk = () => {
    if (!canAsk) return;
    try {
      const r = window.HORAR.ask(city, topicObj.house);
      setResult({ ...r, question: q.trim(), topicLabel: en ? topicObj.en : topicObj.ru });
      try { localStorage.setItem('astro_horar_last', String(Date.now())); } catch (e) {}
      setCool({ nextMs: Date.now() + 24 * 3600 * 1000 });
    } catch (e) { setResult({ error: e.message }); }
  };

  const pad = { padding: '8px 18px 30px', position: 'relative', zIndex: 1 };
  const card = { background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: 18, padding: '16px 18px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' };
  const label = { fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase', color: th.muted, marginBottom: 8 };

  // ── РЕЗУЛЬТАТ ──
  if (result) return <HorarResult th={th} lang={lang} r={result} onBack={() => setResult(null)} cool={cool} now={now}/>;

  return (
    <div style={pad}>
      {/* Инструкция */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={label}>{en ? 'How to ask' : 'Как задать вопрос'}</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.6, color: th.inkSoft }}>
          {(en ? [
            'Horary answers ONE concrete question with a chart cast for the moment you sincerely ask it.',
            'Phrase a single clear question — yes/no or "will it…", "should I…". Don\'t merge several.',
            'It must matter and be sincere: you truly want to know and don\'t already know the answer.',
            'Sit with it, let it ripen. Don\'t ask to test the method or re-ask the same thing.',
            'The moment counts — the chart is built for "now" at your city.',
            'Pick a topic — it sets the house of the question.',
          ] : [
            'Хорар отвечает на ОДИН конкретный вопрос картой на момент, когда ты искренне его задаёшь.',
            'Сформулируй один ясный вопрос — да/нет или «случится ли…», «стоит ли…». Не объединяй несколько.',
            'Вопрос должен быть важным и искренним: ты правда хочешь знать ответ и пока его не знаешь.',
            'Подумай, дозрей до вопроса. Не задавай ради проверки и не переспрашивай одно и то же.',
            'Момент важен — карта строится на «сейчас» по твоему городу.',
            'Выбери тему — она задаёт дом вопроса.',
          ]).map((t, i) => <li key={i} style={{ marginBottom: 6, textWrap: 'pretty' }}>{t}</li>)}
        </ul>
      </div>

      {/* Расписание Луны */}
      {voc && !voc.error && (
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={label}>{en ? 'Moon schedule' : 'Расписание Луны'}</div>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.6, color: th.inkSoft, textWrap: 'pretty' }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: th.muted }}>{en ? 'Moon: ' : 'Луна: '}</span>
              <b style={{ color: th.ink }}>{hzSign(voc.moonSign, en)} {Math.floor(voc.moonDeg)}°</b>
            </div>
            {voc.voc ? (
              <div>{en ? 'Void of course now. Enters ' : 'Сейчас без курса. Войдёт в '}<b style={{ color: th.ink }}>{hzSign(voc.nextSign, en)}</b>{en ? ' in ' : ' через '}<b style={{ color: th.ink }}>{fmtHours(voc.hoursToSignEnd, en)}</b>{en ? ' — then you can ask.' : ' — тогда можно задавать.'}</div>
            ) : (
              <React.Fragment>
                {voc.nextAspect && (
                  <div style={{ marginBottom: 4 }}>
                    {en ? 'Next aspect: ' : 'Ближайший аспект: '}
                    <b style={{ color: th.ink }}>{HZ_ASP[voc.nextAspect.aspect].sym} {hzPl(voc.nextAspect.pl, en)}</b>
                    {en ? ' in ' : ' через '}{fmtHours(voc.nextAspect.hours, en)}
                  </div>
                )}
                <div>
                  {en ? 'On course for ' : 'По курсу ещё '}<b style={{ color: th.ink }}>{fmtHours(voc.hoursToVoid, en)}</b>
                  {en ? ', then void until it enters ' : ', затем без курса до входа в '}<b style={{ color: th.ink }}>{hzSign(voc.nextSign, en)}</b>
                  {en ? ' (in ' : ' (через '}{fmtHours(voc.hoursToSignEnd, en)}{')'}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      )}

      {noCity && (
        <div style={{ ...card, marginBottom: 14, borderColor: `${th.gold}55` }}>
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, color: th.inkSoft, lineHeight: 1.5 }}>
            {en ? 'Add your city in the profile — the horary chart needs a location.' : 'Укажи свой город в профиле — хорарной карте нужно место.'}
          </div>
        </div>
      )}

      {/* Статус Луны / VOC */}
      {voc === null ? (
        <div style={{ ...card, marginBottom: 14, textAlign: 'center', color: th.muted, fontFamily: '"Manrope",sans-serif', fontSize: 12.5 }}>
          {en ? 'Checking the Moon…' : 'Проверяю Луну…'}
        </div>
      ) : voc.voc ? (
        <div style={{ ...card, marginBottom: 14, background: 'rgba(242,192,96,0.10)', borderColor: 'rgba(242,192,96,0.32)' }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 15, color: '#F2C060', flexShrink: 0 }}>☽</span>
            <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, lineHeight: 1.55, color: th.inkSoft, textWrap: 'pretty' }}>
              {en
                ? `The Moon is void of course — it makes no more aspects before changing sign. Tradition says "nothing will come of it", so a horary isn't cast now. Try again in about ${Math.max(1, Math.round(voc.hoursToSignEnd))} h, when the Moon enters a new sign.`
                : `Луна без курса — до смены знака она не образует больше аспектов. По традиции в это время «ничего не выйдет», поэтому хорар сейчас не строят. Попробуй примерно через ${Math.max(1, Math.round(voc.hoursToSignEnd))} ч, когда Луна войдёт в новый знак.`}
            </div>
          </div>
        </div>
      ) : (
        <React.Fragment>
          {/* Вопрос */}
          <div style={{ marginBottom: 14 }}>
            <div style={label}>{en ? 'Your question (one)' : 'Твой вопрос (один)'}</div>
            <textarea value={q} onChange={e => setQ(e.target.value.slice(0, 200))} rows={2}
              placeholder={en ? 'e.g. Will I get this job?' : 'напр. Получу ли я эту работу?'}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'none', borderRadius: 14, border: `1px solid ${th.glassBorder}`, background: th.effDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)', color: th.ink, padding: '12px 14px', fontFamily: '"Manrope",sans-serif', fontSize: 14, lineHeight: 1.4, outline: 'none' }}/>
            <div style={{ textAlign: 'right', fontSize: 10.5, color: th.muted, marginTop: 4, fontFamily: '"Manrope",sans-serif' }}>{q.length}/200</div>
          </div>

          {/* Тема */}
          <div style={{ marginBottom: 14 }}>
            <div style={label}>{en ? 'Topic of the question' : 'Тема вопроса'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {window.HORAR.TOPICS.map(t => {
                const on = topic === t.id;
                return (
                  <button key={t.id} onClick={() => setTopic(t.id)} style={{
                    fontFamily: '"Manrope",sans-serif', fontSize: 12, fontWeight: on ? 700 : 600,
                    padding: '8px 12px', borderRadius: 999, cursor: 'pointer',
                    border: `1px solid ${on ? th.accent : th.glassBorder}`,
                    background: on ? `${th.accent}26` : th.chip, color: on ? th.ink : th.inkSoft,
                  }}>{en ? t.en : t.ru}</button>
                );
              })}
            </div>
          </div>

          {/* Кулдаун */}
          {cool && (
            <div style={{ ...card, marginBottom: 12, padding: '12px 16px' }}>
              <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, color: th.muted, lineHeight: 1.5, textWrap: 'pretty' }}>
                {en ? 'You asked recently. Let the sky shift — next question in ' : 'Ты недавно задавал вопрос. Дай небу сдвинуться — следующий через '}
                <b style={{ color: th.inkSoft }}>{fmtLeft(cool.nextMs - now, en)}</b>.
              </div>
            </div>
          )}

          {/* Согласие */}
          <button onClick={() => setConsent(c => !c)} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 2px 14px' }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1, border: `2px solid ${consent ? th.accent : th.muted}`, background: consent ? th.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {consent && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, lineHeight: 1.45, color: th.inkSoft, textWrap: 'pretty' }}>
              {en ? 'I have read the instructions and ask a single, sincere question by the rules.' : 'Я прочитал(а) инструкцию и задаю один искренний вопрос по правилам.'}
            </span>
          </button>

          <button onClick={doAsk} disabled={!canAsk} style={{
            display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: 8, height: 50, borderRadius: 999, border: 'none',
            cursor: canAsk ? 'pointer' : 'default', background: canAsk ? th.accent : th.muted, color: '#fff',
            fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 15, boxShadow: canAsk ? `0 8px 26px ${th.accentGlow}` : 'none',
          }}>
            {en ? 'Ask the chart' : 'Задать вопрос'}
          </button>
        </React.Fragment>
      )}
    </div>
  );
}

function fmtLeft(ms, en) {
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return en ? `${h} h ${m} min` : `${h} ч ${m} мин`;
  return en ? `${m} min` : `${m} мин`;
}

function fmtHours(h, en) {
  if (h >= 24) { const d = Math.floor(h / 24), hh = Math.round(h % 24); return en ? `${d}d ${hh}h` : `${d} д ${hh} ч`; }
  if (h >= 1) return en ? `${Math.round(h)}h` : `${Math.round(h)} ч`;
  return en ? `${Math.round(h * 60)} min` : `${Math.round(h * 60)} мин`;
}

function HorarResult({ th, lang, r, onBack }) {
  const en = lang === 'en';
  if (r.error) return (
    <div style={{ padding: '40px 18px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.muted, marginBottom: 16 }}>{(en ? 'Error: ' : 'Ошибка: ') + r.error}</div>
      <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: 999, border: `1px solid ${th.glassBorder}`, background: th.chip, color: th.ink, cursor: 'pointer', fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 13 }}>{en ? 'Back' : 'Назад'}</button>
    </div>
  );

  const card = { background: th.glass, border: `1px solid ${th.glassBorder}`, borderRadius: 18, padding: '16px 18px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', marginBottom: 14 };
  const label = { fontFamily: '"Manrope",sans-serif', fontWeight: 700, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase', color: th.muted, marginBottom: 10 };

  const verdictMap = {
    yes:      { ru: 'Скорее да', en: 'Likely yes', col: '#3FB07A' },
    yes_hard: { ru: 'Да, но через напряжение', en: 'Yes, but through tension', col: '#D4901A' },
    no:       { ru: 'Скорее нет', en: 'Likely no', col: '#C0506A' },
  };
  const v = verdictMap[r.verdict] || verdictMap.no;

  const sigLine = (who, sig) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '9px 0', borderBottom: `1px solid ${th.glassBorder}` }}>
      <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, color: th.muted }}>{who}</span>
      <span style={{ fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 12.5, color: th.ink, textAlign: 'right' }}>
        {hzPl(sig.planet, en)} · {hzSign(sig.signIdx, en)} {Math.floor(sig.deg)}° · {hzHouseOrd(sig.house, en)}{sig.retro ? ' · R' : ''}
      </span>
    </div>
  );

  const strTexts = {
    asc_early: en ? 'Ascendant in early degrees — it may be too early to judge; the matter isn\'t ripe yet.' : 'Асцендент в первых градусах — возможно, судить рано: дело ещё не созрело.',
    asc_late:  en ? 'Ascendant in late degrees — it may be too late, or the matter is already decided.' : 'Асцендент в последних градусах — возможно, поздно или вопрос уже решён.',
    saturn_7:  en ? 'Saturn in the 7th — beware hasty judgment.' : 'Сатурн в 7 доме — берегись поспешных выводов.',
    saturn_1:  en ? 'Saturn in the 1st — the matter is restricted or delayed.' : 'Сатурн в 1 доме — дело стеснено или затягивается.',
    via_combusta: en ? 'Moon in the Via Combusta (15°♎–15°♏) — circumstances are volatile.' : 'Луна в «опалённом пути» (15°♎–15°♏) — обстановка нестабильна.',
  };

  let aspectLine;
  if (r.perfection) {
    const ap = HZ_ASP[r.perfection.aspect];
    aspectLine = `${hzPl(r.perfection.a, en)} ${ap.sym} ${hzPl(r.perfection.b, en)} — ${en ? 'applying' : 'приближается'} (${r.perfection.orb.toFixed(1)}° ${en ? 'to exact' : 'до точного'})`;
  } else if (r.separating) {
    const ap = HZ_ASP[r.separating.aspect];
    aspectLine = `${hzPl(r.separating.a, en)} ${ap.sym} ${hzPl(r.separating.b, en)} — ${en ? 'separating (already past)' : 'расходится (уже позади)'}`;
  } else if (r.sameRuler) {
    aspectLine = en ? 'Querent and quesited share one ruler — closely linked.' : 'У спрашивающего и вопроса один управитель — тесно связаны.';
  } else {
    aspectLine = en ? 'No aspect between the significators.' : 'Между значимыми нет аспекта.';
  }

  return (
    <div style={{ padding: '8px 18px 30px', position: 'relative', zIndex: 1 }}>
      {/* Вопрос */}
      <div style={{ ...card }}>
        <div style={label}>{en ? 'Question' : 'Вопрос'} · {r.topicLabel}</div>
        <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 600, fontSize: 18, color: th.ink, lineHeight: 1.3 }}>{r.question}</div>
      </div>

      {/* Вердикт */}
      <div style={{ ...card, textAlign: 'center', borderColor: `${v.col}66` }}>
        <div style={{ fontFamily: 'var(--ds-serif)', fontWeight: 700, fontSize: 26, color: v.col, marginBottom: r.timing ? 6 : 0 }}>{en ? v.en : v.ru}</div>
        {r.timing && (
          <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 13, color: th.inkSoft }}>
            {en ? 'Likely in about ' : 'Ориентировочно через '}<b>{r.timing.units} {hzUnit(r.timing.kind, en)}</b>
            <div style={{ fontSize: 11, color: th.muted, marginTop: 3 }}>
              {en ? `by ${hzPl(r.timing.fast, en)} (${r.timing.units}° to exact, ${r.timing.kind})` : `по ${hzPl(r.timing.fast, en)} (${r.timing.units}° до точного, единица — ${hzUnit(r.timing.kind, en)})`}
            </div>
          </div>
        )}
      </div>

      {/* Карта вопроса */}
      {r.wheel && window.NatalChartSVG && (() => {
        const Wheel = window.NatalChartSVG;
        return (
          <div style={{ ...card }}>
            <div style={label}>{en ? 'Chart of the question' : 'Карта вопроса'}</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Wheel th={th} planets={r.wheel.planets} asc={r.wheel.asc} mc={r.wheel.mc} houseCusps={r.wheel.cusps} size={300} showHouses={r.wheel.showHouses}/>
            </div>
          </div>
        );
      })()}

      {/* Значимые */}
      <div style={{ ...card }}>
        <div style={label}>{en ? 'Significators' : 'Значимые планеты'}</div>
        {sigLine(en ? 'You (1st)' : 'Ты (1 дом)', r.querentSig)}
        {sigLine((en ? 'Question (' : 'Вопрос (') + hzHouseOrd(r.quesitedHouse, en) + ')', r.quesitedSig)}
        {sigLine(en ? 'Moon (flow)' : 'Луна (ход дела)', r.moon)}
        <div style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12.5, color: th.inkSoft, lineHeight: 1.55, paddingTop: 12, textWrap: 'pretty' }}>{aspectLine}</div>
      </div>

      {/* Радикальность / оговорки */}
      {r.strictures.length > 0 && (
        <div style={{ ...card, background: `${th.accent}10`, borderColor: `${th.accent}30` }}>
          <div style={label}>{en ? 'Considerations' : 'Оговорки к карте'}</div>
          {r.strictures.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ color: th.glyphClr, flexShrink: 0, fontSize: 12, marginTop: 1 }}>✦</span>
              <span style={{ fontFamily: '"Manrope",sans-serif', fontSize: 12, lineHeight: 1.5, color: th.inkSoft, textWrap: 'pretty' }}>{strTexts[s] || s}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={onBack} style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', height: 46, borderRadius: 999, cursor: 'pointer', background: 'none', border: `1px solid ${th.glassBorder}`, color: th.inkSoft, fontFamily: '"Manrope",sans-serif', fontWeight: 600, fontSize: 13.5 }}>
        {en ? 'New question' : 'Новый вопрос'}
      </button>
    </div>
  );
}

Object.assign(window, { HorarScreen });
