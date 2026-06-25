// milestones-engine.js — "Жизненные вехи" / Life Milestones
// ─────────────────────────────────────────────────────────────────────────
// HOW IT WORKS (the astrological method, made transparent to the user):
// Every life theme has *significators* — particular planets, chart angles and
// house rulers. To time an event we take the slow-moving planets (Jupiter →
// Pluto) and scan the years for every moment they form a major ASPECT
// (conjunction · sextile · square · trine · opposition) to those significators.
// Retrograde triple-passes are clustered into windows; windows that pile up in
// the same months are merged into one charged "life window". The result is a
// chronological timeline of when a theme is most likely to come alive.
//
// Reuses the natal ephemeris engine exported by natal.jsx / birthedit.jsx:
//   window.computeRealChart, window.resolveBirthForChart, window.PL_META
// and the global Astronomy engine for transiting positions.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  const norm360 = (x) => ((x % 360) + 360) % 360;
  const norm180 = (x) => ((x % 360) + 540) % 360 - 180;
  const DAY = 86400000;

  // Ступенчатый горизонт прогноза: база 2038, шаг +5 лет.
  // Сдвигается, когда до построенного предела остаётся ≤5 лет.
  // 2026 → 2038; в 2033 → 2043; в 2038 → 2048 …
  // ВАЖНО: должен совпадать с backend (scheduler.ts), иначе год в рассылке разойдётся с UI.
  const MS_HORIZON_BASE = 2038;
  function milestonesHorizon(now) {
    const y = (now || new Date()).getFullYear();
    let h = MS_HORIZON_BASE;
    while (y >= h - 5) h += 5;
    return h;
  }

  // Classical rulerships (so a cusp's ruler is always one of the 10 bodies we have)
  const SIGN_RULER = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  const ASPS = [
    { key: 'conjunction', sym: '☌', ru: 'соединение', en: 'conjunction', angle: 0,   bucket: 'conj' },
    { key: 'sextile',     sym: '⚹', ru: 'секстиль',   en: 'sextile',     angle: 60,  bucket: 'soft' },
    { key: 'square',      sym: '□', ru: 'квадрат',     en: 'square',      angle: 90,  bucket: 'hard' },
    { key: 'trine',       sym: '△', ru: 'трин',        en: 'trine',       angle: 120, bucket: 'soft' },
    { key: 'opposition',  sym: '☍', ru: 'оппозиция',   en: 'opposition',  angle: 180, bucket: 'hard' },
  ];

  // Transiting-planet weight (how event-defining a hit from it tends to be)
  const PW = { jupiter: 0.72, saturn: 0.86, uranus: 0.94, neptune: 0.80, pluto: 1.0 };
  // Aspect weight
  const AW = { conjunction: 1.0, opposition: 0.92, square: 0.86, trine: 0.82, sextile: 0.62 };
  // Half-width of the felt window (days) by transiting planet — slower = longer
  const HALF = { jupiter: 55, saturn: 75, uranus: 150, neptune: 230, pluto: 270 };

  // Дирекции (solar arc): вес попадания и ширина окна; вес промиссора.
  const DIR_W = 0.95;       // базовый вес дирекционного попадания
  const DIR_HALF = 200;     // дн., ощущаемая полуширина окна дирекции
  const PROM_W = { venus: 1, sun: 0.85, moon: 0.85, dc: 1, mc: 0.85, ic: 0.95, asc: 0.9, mars: 0.75, jupiter: 0.7, saturn: 0.7, rulerVII: 0.95, rulerX: 0.9 };

  // ═══════════════════════════════════════════════════════════════════════
  // THEMES — significators + which slow planets activate them
  //   targets: {planet|angle|cusp|rulerOf, lbl:{ru,en}, w, needsHouses?}
  //   polarity: growth | change | rupture | body  → drives tone colour/label
  // ═══════════════════════════════════════════════════════════════════════
  const THEMES = [
    {
      id: 'marriage', cat: 'union', glyph: 'rings', polarity: 'growth',
      title: { ru: 'Брак', en: 'Marriage' },
      blurb: { ru: 'Помолвка, свадьба, новый виток союза', en: 'Engagement, wedding, a new level of union' },
      transiters: ['jupiter', 'saturn', 'uranus', 'neptune'],
      targets: [
        { planet: 'venus', lbl: { ru: 'Венера', en: 'Venus' }, w: 1 },
        { angle: 'dc', lbl: { ru: 'Десцендент · VII', en: 'Descendant · 7th' }, w: 1, needsHouses: true },
        { rulerOf: 7, lbl: { ru: 'управитель VII', en: 'ruler of 7th' }, w: 0.9, needsHouses: true },
        { angle: 'mc', lbl: { ru: 'MC · X дом', en: 'MC · 10th' }, w: 0.75, needsHouses: true },
        { planet: 'sun', lbl: { ru: 'Солнце (супруг)', en: 'Sun (spouse)' }, w: 0.6 },
        { planet: 'moon', lbl: { ru: 'Луна (супруг)', en: 'Moon (spouse)' }, w: 0.5 },
      ],
      // Дирекции (solar arc) задают период; селективный отбор — окна редкие.
      directions: { promissors: ['venus', 'sun', 'moon', 'dc', 'mc', 'rulerVII'] },
      selective: true,
      coreTargets: ['p_venus', 'a_dc', 'r_7'], // окно засчитывается только если задействована ось отношений/Венера
    },
    {
      id: 'divorce', cat: 'union', glyph: 'split', polarity: 'rupture',
      title: { ru: 'Развод', en: 'Divorce' },
      blurb: { ru: 'Разрыв, расставание, конец союза', en: 'Break-up, separation, end of a union' },
      transiters: ['saturn', 'uranus', 'pluto'],
      targets: [
        { angle: 'dc', lbl: { ru: 'Десцендент · VII', en: 'Descendant · 7th' }, w: 1, needsHouses: true },
        { rulerOf: 7, lbl: { ru: 'управитель VII', en: 'ruler of 7th' }, w: 0.9, needsHouses: true },
        { planet: 'venus', lbl: { ru: 'Венера', en: 'Venus' }, w: 0.8 },
        { planet: 'mars', lbl: { ru: 'Марс', en: 'Mars' }, w: 0.65 },
        { angle: 'asc', lbl: { ru: 'Асцендент · I', en: 'Ascendant · 1st' }, w: 0.6, needsHouses: true },
      ],
      // Только напряжённые контакты (соед/квадрат/оппозиция) + дирекции + ось VII.
      hardOnly: true,
      directions: { promissors: ['mars', 'saturn', 'uranus', 'venus', 'dc', 'rulerVII'] },
      selective: true,
      coreTargets: ['p_venus', 'a_dc', 'r_7'],
    },
    {
      id: 'children', cat: 'union', glyph: 'child', polarity: 'growth',
      title: { ru: 'Дети', en: 'Children' },
      blurb: { ru: 'Зачатие, рождение, родительство', en: 'Conception, birth, parenthood' },
      transiters: ['jupiter', 'saturn', 'uranus', 'neptune'],
      targets: [
        { cusp: 5, lbl: { ru: 'куспид V', en: '5th cusp' }, w: 1, needsHouses: true },
        { rulerOf: 5, lbl: { ru: 'управитель V', en: 'ruler of 5th' }, w: 0.9, needsHouses: true },
        { planet: 'jupiter', lbl: { ru: 'Юпитер · дети', en: 'Jupiter · children' }, w: 0.85 },
        { planet: 'moon', lbl: { ru: 'Луна · мать', en: 'Moon · mother' }, w: 0.75 },
        { planet: 'venus', lbl: { ru: 'Венера', en: 'Venus' }, w: 0.55 },
      ],
      directions: { promissors: ['jupiter', 'moon', 'venus', 'sun', 'mars', 'mc', 'asc'] },
      selective: true,
      coreTargets: ['c_5', 'r_5', 'p_jupiter'],
      maxWindows: 4,
    },
    {
      id: 'promotion', cat: 'career', glyph: 'rise', polarity: 'growth',
      title: { ru: 'Повышение', en: 'Promotion' },
      blurb: { ru: 'Рост статуса, признание, новая роль', en: 'Status rise, recognition, a new role' },
      transiters: ['jupiter', 'saturn', 'pluto'],
      targets: [
        { angle: 'mc', lbl: { ru: 'MC · X дом', en: 'MC · 10th' }, w: 1, needsHouses: true },
        { rulerOf: 10, lbl: { ru: 'управитель X', en: 'ruler of 10th' }, w: 0.9, needsHouses: true },
        { planet: 'sun', lbl: { ru: 'Солнце', en: 'Sun' }, w: 0.8 },
        { planet: 'jupiter', lbl: { ru: 'Юпитер', en: 'Jupiter' }, w: 0.65 },
        { planet: 'saturn', lbl: { ru: 'Сатурн', en: 'Saturn' }, w: 0.5 },
      ],
      directions: { promissors: ['sun', 'mc', 'jupiter', 'rulerX', 'asc'] },
      selective: true,
      coreTargets: ['a_mc', 'r_10'],
    },
    {
      id: 'jobchange', cat: 'career', glyph: 'swap', polarity: 'change',
      title: { ru: 'Смена работы', en: 'Job change' },
      blurb: { ru: 'Новое место, сфера или формат', en: 'New job, field or format of work' },
      transiters: ['uranus', 'saturn', 'jupiter', 'pluto'],
      targets: [
        { angle: 'mc', lbl: { ru: 'MC · X дом', en: 'MC · 10th' }, w: 1, needsHouses: true },
        { rulerOf: 10, lbl: { ru: 'управитель X', en: 'ruler of 10th' }, w: 0.9, needsHouses: true },
        { planet: 'jupiter', lbl: { ru: 'Юпитер', en: 'Jupiter' }, w: 0.7 },
        { cusp: 6, lbl: { ru: 'куспид VI', en: '6th cusp' }, w: 0.6, needsHouses: true },
        { planet: 'sun', lbl: { ru: 'Солнце', en: 'Sun' }, w: 0.6 },
        { planet: 'saturn', lbl: { ru: 'Сатурн', en: 'Saturn' }, w: 0.55 },
      ],
      directions: { promissors: ['sun', 'mc', 'rulerX', 'mars', 'jupiter', 'asc'] },
      selective: true,
      coreTargets: ['a_mc', 'r_10', 'p_jupiter'],
    },
    {
      id: 'dismissal', cat: 'career', glyph: 'exit', polarity: 'rupture',
      title: { ru: 'Увольнение', en: 'Dismissal' },
      blurb: { ru: 'Потеря должности, конец проекта', en: 'Losing a post, end of a project' },
      transiters: ['saturn', 'uranus', 'pluto', 'neptune'],
      targets: [
        { angle: 'mc', lbl: { ru: 'MC · X дом', en: 'MC · 10th' }, w: 1, needsHouses: true },
        { rulerOf: 10, lbl: { ru: 'управитель X', en: 'ruler of 10th' }, w: 0.9, needsHouses: true },
        { cusp: 6, lbl: { ru: 'куспид VI', en: '6th cusp' }, w: 0.7, needsHouses: true },
        { planet: 'saturn', lbl: { ru: 'Сатурн', en: 'Saturn' }, w: 0.6 },
        { planet: 'jupiter', lbl: { ru: 'Юпитер', en: 'Jupiter' }, w: 0.5 },
      ],
      directions: { promissors: ['sun', 'mc', 'rulerX', 'mars', 'saturn', 'asc'] },
      selective: true,
      coreTargets: ['a_mc', 'r_10', 'p_saturn'],
    },
    {
      id: 'relocation', cat: 'place', glyph: 'move', polarity: 'change',
      title: { ru: 'Переезд', en: 'Relocation' },
      blurb: { ru: 'Смена места жительства', en: 'Change of where you live' },
      transiters: ['uranus', 'jupiter', 'saturn', 'pluto', 'neptune'],
      targets: [
        { angle: 'ic', lbl: { ru: 'IC · IV дом', en: 'IC · 4th' }, w: 1, needsHouses: true },
        { rulerOf: 4, lbl: { ru: 'управитель IV', en: 'ruler of 4th' }, w: 0.9, needsHouses: true },
        { planet: 'moon', lbl: { ru: 'Луна · дом', en: 'Moon · home' }, w: 0.8 },
        { planet: 'jupiter', lbl: { ru: 'Юпитер', en: 'Jupiter' }, w: 0.5 },
      ],
      directions: { promissors: ['moon', 'sun', 'mars', 'ic', 'asc', 'mc'] },
      selective: true,
      coreTargets: ['a_ic', 'r_4', 'p_moon'],
    },
    {
      id: 'property', cat: 'place', glyph: 'key', polarity: 'growth',
      title: { ru: 'Недвижимость', en: 'Property' },
      blurb: { ru: 'Покупка или продажа жилья', en: 'Buying or selling property' },
      transiters: ['jupiter', 'saturn', 'uranus', 'pluto', 'neptune'],
      targets: [
        { cusp: 4, lbl: { ru: 'куспид IV · дом', en: '4th cusp · home' }, w: 1, needsHouses: true },
        { rulerOf: 4, lbl: { ru: 'управитель IV', en: 'ruler of 4th' }, w: 0.9, needsHouses: true },
        { planet: 'venus', lbl: { ru: 'Венера · ценность', en: 'Venus · value' }, w: 0.7 },
        { cusp: 2, lbl: { ru: 'куспид II · ресурсы', en: '2nd cusp · resources' }, w: 0.6, needsHouses: true },
        { planet: 'moon', lbl: { ru: 'Луна · дом', en: 'Moon · home' }, w: 0.6 },
        { planet: 'jupiter', lbl: { ru: 'Юпитер', en: 'Jupiter' }, w: 0.55 },
      ],
      directions: { promissors: ['moon', 'venus', 'mc', 'ic', 'sun', 'jupiter'] },
      selective: true,
      coreTargets: ['c_4', 'r_4'],
    },
    {
      id: 'travel', cat: 'place', glyph: 'travel', polarity: 'growth',
      title: { ru: 'Путешествия', en: 'Travel' },
      blurb: { ru: 'Крупные поездки, жизнь за границей', en: 'Major journeys, life abroad' },
      transiters: ['jupiter', 'uranus', 'saturn', 'pluto'],
      targets: [
        { cusp: 9, lbl: { ru: 'куспид IX', en: '9th cusp' }, w: 1, needsHouses: true },
        { rulerOf: 9, lbl: { ru: 'управитель IX', en: 'ruler of 9th' }, w: 0.9, needsHouses: true },
        { planet: 'jupiter', lbl: { ru: 'Юпитер', en: 'Jupiter' }, w: 0.8 },
      ],
      // Только крупные/значимые поездки (медленные планеты по IX оси), не отпуска.
      directions: { promissors: ['jupiter', 'sun', 'mc', 'asc'] },
      selective: true,
      coreTargets: ['c_9', 'r_9'],
    },
    {
      id: 'injury', cat: 'body', glyph: 'injury', polarity: 'body',
      title: { ru: 'Травмы', en: 'Injuries' },
      blurb: { ru: 'Физический риск, перегрузки', en: 'Physical risk, strain' },
      transiters: ['saturn', 'uranus', 'pluto'],
      targets: [
        { planet: 'mars', lbl: { ru: 'Марс', en: 'Mars' }, w: 1 },
        { angle: 'asc', lbl: { ru: 'Асцендент · I', en: 'Ascendant · 1st' }, w: 0.9, needsHouses: true },
        { rulerOf: 1, lbl: { ru: 'управитель I', en: 'ruler of 1st' }, w: 0.8, needsHouses: true },
        { planet: 'saturn', lbl: { ru: 'Сатурн', en: 'Saturn' }, w: 0.6 },
      ],
    },
    {
      id: 'surgery', cat: 'body', glyph: 'surgery', polarity: 'body',
      title: { ru: 'Операции', en: 'Surgery' },
      blurb: { ru: 'Вмешательства, медицинские решения', en: 'Procedures, medical decisions' },
      transiters: ['saturn', 'pluto', 'uranus'],
      targets: [
        { cusp: 8, lbl: { ru: 'куспид VIII', en: '8th cusp' }, w: 1, needsHouses: true },
        { cusp: 6, lbl: { ru: 'куспид VI', en: '6th cusp' }, w: 0.85, needsHouses: true },
        { planet: 'mars', lbl: { ru: 'Марс', en: 'Mars' }, w: 0.8 },
        { planet: 'saturn', lbl: { ru: 'Сатурн', en: 'Saturn' }, w: 0.55 },
      ],
    },
  ];

  const CATEGORIES = [
    { id: 'union',  title: { ru: 'Любовь и союзы', en: 'Love & unions' } },
    { id: 'career', title: { ru: 'Карьера и статус', en: 'Career & status' } },
    { id: 'place',  title: { ru: 'Дом и территория', en: 'Home & territory' } },
    { id: 'body',   title: { ru: 'Тело и здоровье', en: 'Body & health' } },
  ];

  // ═══════════════════════════════════════════════════════════════════════
  // INTERPRETATIONS — [themeId][bucket]  (bucket: soft | conj | hard)
  // ═══════════════════════════════════════════════════════════════════════
  const TEXT = {
    marriage: {
      ru: {
        soft: 'Гармоничное окно для союза: отношения развиваются легко и естественно. Время знакомств, помолвки, свадьбы или выхода уже существующей связи на новый, более прочный уровень.',
        conj: 'Сильный поворот в теме партнёрства. Именно на таких транзитах часто случаются судьбоносные встречи, предложение руки и сердца или официальное оформление отношений.',
        hard: 'Тема брака активируется через напряжение: отношения проходят проверку, требуют решений и зрелости. Союз возможен — но через выбор и преодоление.',
      },
      en: {
        soft: 'A flowing window for union: relationships grow easily. A time for meeting someone, an engagement, a wedding, or an existing bond reaching a firmer level.',
        conj: 'A strong turning point in partnership. Fateful meetings, proposals or making things official often land on transits like this.',
        hard: 'Marriage is activated through tension: the bond is tested and asks for decisions and maturity. Union is possible — but through choice and effort.',
      },
    },
    divorce: {
      ru: {
        soft: 'Мягкая развязка: если союз исчерпал себя, расставание проходит спокойно и по обоюдному согласию. Хорошее время честно пересмотреть партнёрство.',
        conj: 'Переломный момент в браке: отношения резко меняют форму. Возможен разрыв, развод или коренной пересмотр совместной жизни.',
        hard: 'Высокое напряжение в партнёрстве: накопленные противоречия выходят наружу. Один из самых вероятных периодов для кризиса, разрыва или развода.',
      },
      en: {
        soft: 'A soft unwinding: if a union has run its course, the parting is calm and mutual. A good time to honestly review the partnership.',
        conj: 'A turning point in the marriage: the relationship sharply changes shape. A break-up, divorce or deep reset of shared life is possible.',
        hard: 'High tension in partnership: stored conflicts surface. One of the most likely windows for a crisis, break-up or divorce.',
      },
    },
    children: {
      ru: {
        soft: 'Благоприятное окно для темы детей: зачатие, рождение или новый этап в отношениях с детьми проходят на лёгкой, поддерживающей ноте.',
        conj: 'Яркая активация V дома: рождение ребёнка, беременность или резкое усиление родительской темы в жизни.',
        hard: 'Тема детей через ответственность: возможны хлопоты, повышенная нагрузка или важные решения, связанные с потомством.',
      },
      en: {
        soft: 'A supportive window for the theme of children: conception, birth or a new stage with kids unfolds on an easy note.',
        conj: 'A vivid 5th-house activation: the birth of a child, pregnancy, or a sharp rise of the parenting theme.',
        hard: 'Children through responsibility: extra load, demands or weighty decisions around offspring are possible.',
      },
    },
    promotion: {
      ru: {
        soft: 'Карьера идёт в гору естественно: заслуги замечают, открываются возможности для роста, повышения и признания статуса.',
        conj: 'Мощный старт в карьере: назначение, повышение, выход на новую публичную роль или резкий подъём статуса.',
        hard: 'Рост через нагрузку: повышение возможно, но потребует выдержать давление, ответственность и проверку на прочность.',
      },
      en: {
        soft: 'Career rises naturally: your work is noticed and doors to growth, promotion and recognition open.',
        conj: 'A powerful career launch: an appointment, promotion, a new public role or a sharp rise in status.',
        hard: 'Growth under load: promotion is possible but demands withstanding pressure and proving yourself.',
      },
    },
    jobchange: {
      ru: {
        soft: 'Удачное время сменить работу: переход проходит плавно, новое место находится почти само и приносит улучшение.',
        conj: 'Поворотный момент в профессии: смена работы, сферы или формата занятости. Старое уступает место новому.',
        hard: 'Перемены в работе через обстоятельства: возможна резкая или некомфортная смена занятости, толкающая к новому.',
      },
      en: {
        soft: 'A good time to switch jobs: the move is smooth, a new place almost finds you and improves things.',
        conj: 'A turning point in profession: a change of job, field or format of work. The old gives way to the new.',
        hard: 'Work changes through circumstance: an abrupt or uncomfortable shift may push you toward something new.',
      },
    },
    dismissal: {
      ru: {
        soft: 'Спокойное завершение рабочего этапа: уход с должности проходит мягко, часто по собственному решению и к лучшему.',
        conj: 'Резкий перелом в карьере: возможно увольнение, закрытие проекта или внезапный уход с позиции.',
        hard: 'Зона риска для статуса и должности: давление сверху, конфликты или сокращение. Один из вероятных периодов потери работы.',
      },
      en: {
        soft: 'A calm close to a work chapter: leaving a post happens softly — often by your own choice, and for the better.',
        conj: 'A sharp career break: dismissal, a project closing or a sudden exit from a position is possible.',
        hard: 'A risk zone for status and post: pressure from above, conflict or cutbacks. A likely window for losing a job.',
      },
    },
    relocation: {
      ru: {
        soft: 'Лёгкое время для переезда: смена места жительства проходит комфортно и улучшает условия жизни.',
        conj: 'Сильная активация темы дома: переезд, смена обстановки или важная перемена в месте жительства.',
        hard: 'Переезд через обстоятельства: смена места может быть вынужденной или беспокойной, но открывает новую главу.',
      },
      en: {
        soft: 'An easy time to move: changing where you live is comfortable and improves your conditions.',
        conj: 'A strong home activation: a move, a change of surroundings or a major shift in where you live.',
        hard: 'Relocation through circumstance: the move may be forced or unsettled, yet it opens a new chapter.',
      },
    },
    property: {
      ru: {
        soft: 'Благоприятное окно для недвижимости: удачная покупка, продажа или улучшение жилищных условий без лишних потерь.',
        conj: 'Крупное событие с недвижимостью: приобретение, продажа или серьёзное вложение в жильё и имущество.',
        hard: 'Сделки с недвижимостью через усилия: возможны хлопоты, расходы или непростые решения вокруг жилья.',
      },
      en: {
        soft: 'A favourable property window: a good purchase, sale or upgrade of your living conditions without losses.',
        conj: 'A major property event: acquiring, selling or a serious investment in a home or assets.',
        hard: 'Property deals through effort: hassle, costs or tough decisions around housing are possible.',
      },
    },
    travel: {
      ru: {
        soft: 'Открытые горизонты: удачное время для путешествий, дальних поездок, учёбы за рубежом или расширения географии жизни.',
        conj: 'Яркое расширение пространства: значимая поездка, переезд за границу или событие, раздвигающее горизонты.',
        hard: 'Дорога через препятствия: путешествия возможны, но с накладками — либо продиктованы необходимостью.',
      },
      en: {
        soft: 'Open horizons: a great time for travel, long trips, study abroad or widening the geography of your life.',
        conj: 'A vivid expansion of space: a significant journey, a move abroad or an horizon-widening event.',
        hard: 'The road through obstacles: travel is possible but with snags — or driven by necessity.',
      },
    },
    injury: {
      ru: {
        soft: 'Тело справляется и восстанавливается: даже при нагрузке период проходит без серьёзных последствий — хорошее время заняться здоровьем.',
        conj: 'Повышенная активность и уязвимость: возрастает роль физической энергии — стоит быть внимательнее к телу и рискам.',
        hard: 'Зона повышенного риска для тела: вероятность травм, перегрузок или резких физических ситуаций. Время для осторожности.',
      },
      en: {
        soft: 'The body copes and recovers: even under load the period passes without serious fallout — a good time to invest in health.',
        conj: 'Heightened activity and vulnerability: physical energy rises — be more mindful of the body and of risk.',
        hard: 'A higher-risk zone for the body: a likelihood of injury, strain or sharp physical situations. A time for caution.',
      },
    },
    surgery: {
      ru: {
        soft: 'Благоприятное окно для плановых процедур: если вмешательство нужно, восстановление проходит мягко.',
        conj: 'Активация темы тела и кризиса: возможна операция, серьёзная медицинская процедура или резкое внимание к здоровью.',
        hard: 'Период, требующий внимания к здоровью: возрастает вероятность вмешательств, обострений или вынужденных медицинских решений.',
      },
      en: {
        soft: 'A favourable window for planned procedures: if an intervention is needed, recovery goes gently.',
        conj: 'A body-and-crisis activation: surgery, a serious medical procedure or sharp focus on health is possible.',
        hard: 'A period that asks for attention to health: a higher chance of interventions, flare-ups or forced medical decisions.',
      },
    },
  };

  // ═══════════════════════════════════════════════════════════════════════
  // EPHEMERIS
  // ═══════════════════════════════════════════════════════════════════════
  function eclLonAt(bodyStr, ms) {
    const t = Astronomy.MakeTime(new Date(ms));
    return norm360(Astronomy.Ecliptic(Astronomy.GeoVector(bodyStr, t, false)).elon);
  }

  // Resolve a theme's symbolic targets to concrete natal longitudes.
  function resolveTargets(theme, chart, housesOK) {
    const out = [];
    for (const t of theme.targets) {
      if (t.needsHouses && !housesOK) continue;
      let lon = null;
      let key = '';
      if (t.planet) { lon = chart.planets[t.planet].ecl; key = 'p_' + t.planet; }
      else if (t.angle) {
        lon = t.angle === 'asc' ? chart.asc : t.angle === 'dc' ? chart.dc : t.angle === 'mc' ? chart.mc : chart.ic;
        key = 'a_' + t.angle;
      } else if (t.cusp != null) { lon = chart.cusps[t.cusp - 1]; key = 'c_' + t.cusp; }
      else if (t.rulerOf != null) {
        const cuspLon = chart.cusps[t.rulerOf - 1];
        const rid = SIGN_RULER[Math.floor(norm360(cuspLon) / 30)];
        lon = chart.planets[rid].ecl;
        key = 'r_' + t.rulerOf + '_' + rid;
      }
      if (lon != null) out.push({ key, lon: norm360(lon), lbl: t.lbl, w: t.w });
    }
    return out;
  }

  // ── Solar arc directions ───────────────────────────────────────────────────
  // Долгота натальной точки-промиссора (планета / угол / управитель дома).
  function symbolLon(sym, chart) {
    if (sym === 'dc') return chart.dc;
    if (sym === 'mc') return chart.mc;
    if (sym === 'asc') return chart.asc;
    if (sym === 'ic') return chart.ic;
    if (sym === 'rulerVII') { const rid = SIGN_RULER[Math.floor(norm360(chart.cusps[6]) / 30)]; return chart.planets[rid].ecl; }
    if (sym === 'rulerX')   { const rid = SIGN_RULER[Math.floor(norm360(chart.cusps[9]) / 30)]; return chart.planets[rid].ecl; }
    return chart.planets[sym] ? chart.planets[sym].ecl : null;
  }
  // Дуга solar arc на момент ms (истинная: движение прогрессивного Солнца).
  function solarArcAt(ms, natalMs, natalSunLon) {
    const ageYears = (ms - natalMs) / (365.2422 * DAY);
    const progMs = natalMs + ageYears * DAY; // 1 день прогрессии = 1 год жизни
    return norm360(eclLonAt('Sun', progMs) - natalSunLon);
  }
  // Точные дирекционные аспекты: дир. промиссор (натал + дуга) → натальные цели.
  function scanDirections(chart, promissors, targets, natalMs, natalSunLon, startMs, endMs, aspList) {
    const asps = aspList || ASPS;
    const promLon = {};
    for (const P of promissors) { const l = symbolLon(P, chart); if (l != null) promLon[P] = norm360(l); }
    const stepMs = 30 * DAY;
    const hits = [];
    let prev = null;
    for (let ms = startMs; ms <= endMs; ms += stepMs) {
      const arc = solarArcAt(ms, natalMs, natalSunLon);
      const cur = {};
      for (const P of Object.keys(promLon)) {
        const dl = norm360(promLon[P] + arc);
        for (const tg of targets) {
          const delta = norm180(dl - tg.lon);
          for (const asp of asps) {
            const angs = asp.angle === 0 ? [0] : asp.angle === 180 ? [180] : [asp.angle, -asp.angle];
            for (const a of angs) {
              const k = P + '|' + tg.key + '|' + asp.key + '|' + a;
              const signed = norm180(delta - a);
              cur[k] = signed;
              if (prev && prev[k] != null && Math.sign(signed) !== Math.sign(prev[k]) && Math.abs(signed - prev[k]) < 4) {
                const f = prev[k] / (prev[k] - signed);
                hits.push({ P, tg, asp, ms: ms - stepMs + f * stepMs });
              }
            }
          }
        }
      }
      prev = cur;
    }
    return hits;
  }

  // Raw exact-aspect crossings of transiters → targets over [startMs, endMs].
  function scanCrossings(targets, transiters, startMs, endMs, stepDays, aspList) {
    const asps = aspList || ASPS;
    const stepMs = stepDays * DAY;
    const hits = [];
    let prev = null;
    for (let ms = startMs; ms <= endMs; ms += stepMs) {
      const tlon = {};
      for (const T of transiters) tlon[T] = eclLonAt(window.PL_META[T].body, ms);
      const cur = {};
      for (const T of transiters) {
        for (const tg of targets) {
          const delta = norm180(tlon[T] - tg.lon);
          for (const asp of asps) {
            const angs = asp.angle === 0 ? [0] : asp.angle === 180 ? [180] : [asp.angle, -asp.angle];
            for (const a of angs) {
              const k = T + '|' + tg.key + '|' + asp.key + '|' + a;
              const signed = norm180(delta - a);
              cur[k] = signed;
              if (prev && prev[k] != null && Math.sign(signed) !== Math.sign(prev[k]) && Math.abs(signed - prev[k]) < 6) {
                const f = prev[k] / (prev[k] - signed);
                hits.push({ T, tg, asp, ms: ms - stepMs + f * stepMs });
              }
            }
          }
        }
      }
      prev = cur;
    }
    return hits;
  }

  // Cluster retrograde triple-passes of the SAME (T, target, aspect) into one event.
  function clusterEvents(hits) {
    const groups = {};
    for (const h of hits) {
      const g = h.T + '|' + h.tg.key + '|' + h.asp.key;
      (groups[g] = groups[g] || []).push(h);
    }
    const events = [];
    for (const g of Object.keys(groups)) {
      const arr = groups[g].sort((a, b) => a.ms - b.ms);
      let cluster = [arr[0]];
      const flush = () => {
        const first = cluster[0], last = cluster[cluster.length - 1];
        const peak = cluster[Math.floor((cluster.length - 1) / 2)]; // central pass ≈ exact
        const half = HALF[first.T] * DAY;
        events.push({
          T: first.T, tg: first.tg, asp: first.asp, passes: cluster.length,
          peakMs: peak.ms,
          startMs: Math.min(first.ms - half, first.ms),
          endMs: Math.max(last.ms + half, last.ms),
          score: PW[first.T] * AW[first.asp.key] * first.tg.w * (1 + 0.12 * (cluster.length - 1)),
        });
      };
      for (let i = 1; i < arr.length; i++) {
        if (arr[i].ms - cluster[cluster.length - 1].ms < 430 * DAY) cluster.push(arr[i]);
        else { flush(); cluster = [arr[i]]; }
      }
      flush();
    }
    return events;
  }

  // Merge events whose peaks pile up within ~120 days into one charged window.
  function mergeWindows(events) {
    events.sort((a, b) => a.peakMs - b.peakMs);
    const windows = [];
    for (const e of events) {
      const w = windows[windows.length - 1];
      if (w && e.peakMs - w.peakMs < 120 * DAY) {
        w.triggers.push(e);
        w.startMs = Math.min(w.startMs, e.startMs);
        w.endMs = Math.max(w.endMs, e.endMs);
        w.score += e.score * 0.35;
        if (e.score > w.primary.score) { w.primary = e; w.peakMs = e.peakMs; }
      } else {
        windows.push({ primary: e, triggers: [e], startMs: e.startMs, endMs: e.endMs, peakMs: e.peakMs, score: e.score });
      }
    }
    return windows;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC: scan one theme → timeline of windows
  // ═══════════════════════════════════════════════════════════════════════
  function scanMilestones(birth, themeId) {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) throw new Error('Unknown theme ' + themeId);

    const input = window.resolveBirthForChart(birth);
    const chart = window.computeRealChart(input);
    const housesOK = chart.housesValid === true || chart.housesValid === 'approx';
    const approxHouses = chart.housesValid === 'approx';

    const targets = resolveTargets(theme, chart, housesOK);

    let startY = birth.year + 16;
    let endY = milestonesHorizon();
    if (endY - startY > 60) startY = endY - 60;
    if (startY >= endY) startY = endY - 20;
    const startMs = Date.UTC(startY, birth.month - 1, birth.day);
    const endMs = Date.UTC(endY, birth.month - 1, birth.day);

    // Жёсткие аспекты (соединение/квадрат/оппозиция) — для тем с hardOnly (развод и т.п.)
    const aspList = theme.hardOnly
      ? ASPS.filter((a) => a.key === 'conjunction' || a.key === 'square' || a.key === 'opposition')
      : ASPS;

    // Транзитные события
    let events = clusterEvents(scanCrossings(targets, theme.transiters, startMs, endMs, 4, aspList))
      .map((e) => ({ ...e, source: 'transit' }));

    // Дирекционные события (solar arc) — только если есть тема directions и дома
    if (theme.directions && housesOK) {
      const natalMs = Date.UTC(input.year, input.month - 1, input.day)
        + (input.localHour * 60 + input.localMin) * 60000 - input.utcOffset * 3600000;
      const dirHits = scanDirections(chart, theme.directions.promissors, targets, natalMs, chart.planets.sun.ecl, startMs, endMs, aspList);
      for (const h of dirHits) {
        events.push({
          source: 'dir', T: 'dir:' + h.P, tg: h.tg, asp: h.asp, passes: 1,
          peakMs: h.ms, startMs: h.ms - DIR_HALF * DAY, endMs: h.ms + DIR_HALF * DAY,
          score: DIR_W * AW[h.asp.key] * h.tg.w * (PROM_W[h.P] || 0.7),
        });
      }
    }

    let windows = mergeWindows(events);

    // Связка транзит+дирекция в одном окне = сильное, редкое событие → буст
    windows.forEach((w) => {
      const hasT = w.triggers.some((t) => t.source === 'transit');
      const hasD = w.triggers.some((t) => t.source === 'dir');
      w.confluence = hasT && hasD;
      if (w.confluence) w.score *= 1.6;
    });

    if (theme.selective) {
      // окно засчитывается только если задействована ось отношений/ядро темы
      const core = theme.coreTargets || [];
      windows = windows.filter((w) => w.triggers.some((t) => core.some((ck) => t.tg.key.indexOf(ck) === 0)));
      windows.sort((a, b) => b.score - a.score);
      const mx = windows.length ? windows[0].score : 1;
      // только заметно сильные окна (≥ половины пика) + жёсткий лимит — это редкие события
      const cap = theme.maxWindows || 5;
      windows = windows.filter((w) => w.score >= 0.5 * mx).slice(0, cap).sort((a, b) => a.peakMs - b.peakMs);
    } else {
      windows.sort((a, b) => b.score - a.score);
      windows = windows.slice(0, 14).sort((a, b) => a.peakMs - b.peakMs);
    }

    const maxScore = windows.reduce((m, w) => Math.max(m, w.score), 0.0001);
    const nowMs = Date.now();
    windows.forEach((w) => {
      w.triggers.sort((x, y) => y.score - x.score);
      w.intensity = Math.max(1, Math.min(5, Math.round((w.score / maxScore) * 5)));
      w.bucket = w.primary.asp.bucket;
      w.past = w.peakMs < nowMs;
      w.active = nowMs >= w.startMs && nowMs <= w.endMs;
    });

    return {
      theme,
      windows,
      significators: targets.map((t) => t.lbl),
      housesOK, approxHouses,
      range: { startY, endY },
      droppedHouseTargets: theme.targets.filter((t) => t.needsHouses).length > 0 && !housesOK,
    };
  }

  // ── small helpers for the UI ──
  function interpFor(themeId, bucket, lang) {
    const t = TEXT[themeId];
    if (!t) return '';
    return (t[lang === 'en' ? 'en' : 'ru'] || t.ru)[bucket] || '';
  }
  function aspMeta(key) { return ASPS.find((a) => a.key === key); }

  window.MILESTONES = {
    THEMES, CATEGORIES, ROMAN,
    scanMilestones, interpFor, aspMeta, milestonesHorizon,
  };
})();
