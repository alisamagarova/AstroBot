// synastry-interp-full.js
// Full directional per-aspect synastry interpretations from JSON.
// Key format: "p1-p2" where p1 = Person A's planet, p2 = Person B's planet.
// Direction matters: "venus-mars" ≠ "mars-venus".
// Exposes window.SYN_INTERP_FULL = { en: { aspects: {...} }, ru: { aspects: {...} } }
window.SYN_INTERP_FULL = {
  en: {
  "aspects": {
    "sun-sun": {
      "conjunction": "Sun meets Sun — both partners were born in the same sign and see life in a similar way. Goals, style, and self-expression share common ground. Strength: genuine mutual understanding and support; the risk, rivalry and a shortage of the complementary difference that sparks growth.",
      "sextile": "The Suns are in sextile: aims and life styles gently resonate, making it easy to find common ground. Strength: pleasant, effortless understanding; the risk, keeping things at the surface.",
      "square": "The Suns are in square: wills and self-expression styles clash — each pulls in a different direction, and a struggle for leadership emerges. Strength: growth through difference and challenge; the risk, stubbornness and constant rivalry.",
      "trine": "The Suns are in trine: the partners' energies are naturally in tune. Easy to support and inspire one another. Strength: warm mutual understanding and a shared flow; the risk, taking harmony for granted.",
      "opposition": "The Suns are in opposition — partners born in opposite signs. Attraction through difference; each sees in the other what they themselves lack. Strength: vivid chemistry and genuine complementarity; the risk, stubbornness and clashing worldviews."
    },
    "sun-moon": {
      "conjunction": "One partner's Sun meets the other's Moon — one of the best combinations for closeness. The first partner's personality and will naturally warm and nourish the second's emotional world. Strength: deep mutual understanding and a feeling of 'home' together; the risk, emotional dependence and merging.",
      "sextile": "Sun and Moon are in sextile: warmth and mutual support flow without tension. Strength: comfort, understanding, and tenderness; the risk, leaving the connection at a pleasant but shallow level.",
      "square": "Sun and Moon are in square: one partner's self-expression clashes with the other's emotional needs. Strength: growth through the friction of adjustment; the risk, friction in daily life and moods, a sense of not being understood.",
      "trine": "Sun and Moon are in trine: one partner's will naturally supports the other's feelings. Easy to create warmth and mutual care. Strength: gentleness, harmony, and mutual support; the risk, slackness and passivity.",
      "opposition": "Sun and Moon are in opposition: a strong pull through contrast — one brings the rational and active, the other the emotional and receptive. Strength: polar but powerful connection; the risk, misreading each other and swings between closeness and distance."
    },
    "sun-mercury": {
      "conjunction": "One partner's Sun and the other's Mercury are in conjunction: conversation is lively and personal, ideas flow naturally into shared plans. Strength: easy dialogue and genuine mutual interest; the risk, one partner dominating the conversation.",
      "sextile": "Sun and Mercury are in sextile: it's easy to understand and support each other's ideas. Strength: pleasant, productive exchange; the risk, staying on the surface.",
      "square": "Sun and Mercury are in square: one partner's will and the other's thinking clash. Arguments and a sense of not being heard arise. Strength: a sharp, stimulating dialogue; the risk, verbal conflict and stubbornness.",
      "trine": "Sun and Mercury are in trine: thoughts and plans are easily aligned. Conversation flows naturally. Strength: clear, supportive dialogue; the risk, taking ease for granted.",
      "opposition": "Sun and Mercury are in opposition: outlooks and thinking styles diverge, but this sparks discussion. Strength: broadening each other's perspective; the risk, arguments and mutual misunderstanding."
    },
    "sun-venus": {
      "conjunction": "One partner's Sun and the other's Venus are in conjunction: a warm, magnetic combination. One partner admires the other and is drawn to them immediately. Strength: affection, warmth, and natural attraction; the risk, idealization and indulgence.",
      "sextile": "Sun and Venus are in sextile: a soft mutual attraction and genuine liking. Easy to be pleasant with each other. Strength: warmth and harmony; the risk, not deepening the bond.",
      "square": "Sun and Venus are in square: friction between one partner's self-expression and the other's love style. Tastes and values diverge, creating tension. Strength: growth through difference; the risk, mutual criticism and mismatched expectations.",
      "trine": "Sun and Venus are in trine: easy to like each other and create beauty together. The bond is warm and pleasant. Strength: harmony, mutual admiration, and joy; the risk, comfortable slackness.",
      "opposition": "Sun and Venus are in opposition: attraction through contrast — one brings confidence and initiative, the other tenderness and taste. Strength: genuine complementarity; the risk, mismatched expectations from the relationship."
    },
    "sun-mars": {
      "conjunction": "One partner's Sun and the other's Mars are in conjunction: a powerful, energetic bond. One ignites, the other acts — together there's a lot of drive and passion. Strength: dynamism, initiative, and attraction; the risk, rivalry and flare-ups.",
      "sextile": "Sun and Mars are in sextile: the partners' energies gently support each other. They work well together. Strength: a productive team and mutual motivation; the risk, leaving the charge unused.",
      "square": "Sun and Mars are in square: strong attraction mixed with irritation. One partner's will clashes with the other's drive. Strength: passion and energy; the risk, quarrels, aggression, and rivalry.",
      "trine": "Sun and Mars are in trine: the partners' energies naturally support each other. They act together with enthusiasm and mutual respect. Strength: drive, passion, and effective cooperation; the risk, taking the synergy for granted.",
      "opposition": "Sun and Mars are in opposition: one partner's will and the other's drive on opposite poles — passion bordering on struggle. Strength: powerful energy and sexual magnetism; the risk, conflict, rivalry, and provocations."
    },
    "sun-jupiter": {
      "conjunction": "One partner's Sun and the other's Jupiter are in conjunction: one expands the other's horizons, believes in them, and brings luck. Strength: optimism, generosity, and mutual growth; the risk, indulgence, overconfidence, and excess.",
      "sextile": "Sun and Jupiter are in sextile: one gently supports and encourages the other. The bond is light and beneficial. Strength: optimism and mutual advantage; the risk, laziness and counting on things to work out.",
      "square": "Sun and Jupiter are in square: one partner overestimates or over-praises the other. Excess and clashing views on scale are possible. Strength: a generous, expanding dynamic; the risk, overconfidence and empty promises.",
      "trine": "Sun and Jupiter are in trine: one naturally inspires the other and brings luck and self-belief. Strength: growth, optimism, and mutual generosity; the risk, slackness and a taste for excess.",
      "opposition": "Sun and Jupiter are in opposition: one partner's scope and the other's will on opposite poles — mutual growth with a risk of overreach. Strength: generosity and development; the risk, extravagance and imposing beliefs."
    },
    "sun-saturn": {
      "conjunction": "One partner's Sun and the other's Saturn are in conjunction: one gives the other's life structure and seriousness — a solid, 'karmic' bond. Strength: stability, responsibility, and durability; the risk, one partner feeling oppressed, cold, or judged.",
      "sextile": "Sun and Saturn are in sextile: one gives the other stability and support without suffocation. Strength: reliability, mature support, and discipline; the risk, leaving this foundation underused.",
      "square": "Sun and Saturn are in square: one partner limits, controls, or criticizes the other's self-expression. Tension of duty and weight. Strength: growth through discipline and the test of time; the risk, coldness, suppression, and resentment.",
      "trine": "Sun and Saturn are in trine: one gives the other reliable support, wisdom, and stability without pressure. The bond is mature and lasting. Strength: support, responsibility, and solidity; the risk, a certain dryness and lack of lightness.",
      "opposition": "Sun and Saturn are in opposition: one partner's limits and the other's will on opposite poles. One is seen as an authority or 'brake.' Strength: growing up through challenge; the risk, suppression, criticism, and feeling trapped."
    },
    "sun-uranus": {
      "conjunction": "One partner's Sun and the other's Uranus are in conjunction: one brings freshness, freedom, and the unexpected into the other's life, awakening them. Strength: vividness, originality, and attraction of novelty; the risk, instability and a shortage of grounding.",
      "sextile": "Sun and Uranus are in sextile: one gently inspires the other toward the new and unconventional. Strength: a creative impulse and mutual freedom; the risk, leaving the spark undeveloped.",
      "square": "Sun and Uranus are in square: one partner's drive for freedom unsettles the other's stability. Sudden disruptions and unpredictability are possible. Strength: awakening and dynamism; the risk, instability and sharp reversals.",
      "trine": "Sun and Uranus are in trine: one easily brings novelty and freedom into the other's life without wrecking it. Strength: originality, lightness, and mutual space; the risk, mistaking freedom for indifference.",
      "opposition": "Sun and Uranus are in opposition: one partner's pull toward freedom opposed the other's need for stability. The attraction is exciting but seesawing. Strength: awakening through difference; the risk, instability and growing distance."
    },
    "sun-neptune": {
      "conjunction": "One partner's Sun and the other's Neptune are in conjunction: one sees an ideal in the other, wrapping them in romance and inspiration. The bond is subtle and spiritual. Strength: tenderness, creativity, and attraction; the risk, illusions and disappointment when the fog clears.",
      "sextile": "Sun and Neptune are in sextile: one gently inspires and spiritualizes the other. Strength: compassion, creativity, and sensitivity; the risk, vagueness without grounding.",
      "square": "Sun and Neptune are in square: one partner's view of the other is blurred by illusions. Misunderstanding and disappointment are possible. Strength: creative and spiritual inspiration; the risk, fog, idealization, and lost clarity.",
      "trine": "Sun and Neptune are in trine: one naturally inspires the other, bringing tenderness, dreaming, and spiritual closeness. Strength: compassion, creativity, and a fine soul connection; the risk, idealization and drifting from reality.",
      "opposition": "Sun and Neptune are in opposition: one partner's ideals and the other's personality on opposite poles. Strong romantic-spiritual attraction with a risk of fog. Strength: inspiration and compassion; the risk, illusions and blurred boundaries."
    },
    "sun-pluto": {
      "conjunction": "One partner's Sun and the other's Pluto are in conjunction: a deep, transforming influence on the other's identity — attraction that is powerful, almost magnetic. Strength: depth, passion, and mutual transformation; the risk, power struggles and obsession.",
      "sextile": "Sun and Pluto are in sextile: one helps the other grow and change through depth. The influence is gentle. Strength: transformation, willpower, and support of change; the risk, leaving the potential untapped.",
      "square": "Sun and Pluto are in square: one partner seeks to influence and control the other. Strong attraction and tense clash of wills. Strength: deep transformation through crisis; the risk, manipulation and power games.",
      "trine": "Sun and Pluto are in trine: one powerfully but organically transforms the other, strengthening them through change. Strength: depth, regeneration, and mutual empowerment; the risk, underrating the bond's intensity.",
      "opposition": "Sun and Pluto are in opposition: one partner's force and the other's will on opposite poles — powerful attraction and a fight for control. Strength: deep transformation through another; the risk, control, manipulation, and obsessive intensity."
    },
    "moon-moon": {
      "conjunction": "Moon meets Moon — both partners are emotionally tuned alike. They quickly sense each other's needs and create comfort and safety together. Strength: deep emotional kinship and care; the risk, excessive dependence and amplified mood swings.",
      "sextile": "The Moons are in sextile: the partners' emotional worlds gently resonate. Easy to support and understand each other's feelings. Strength: warm emotional harmony; the risk, keeping the connection shallow.",
      "square": "The Moons are in square: emotional needs and habits diverge. Frequent misunderstandings about daily life and moods. Strength: growth in emotional maturity through difference; the risk, hurt feelings and mutual insensitivity.",
      "trine": "The Moons are in trine: the partners' feelings are naturally in tune. Easy to feel at home beside each other and to care without effort. Strength: emotional comfort and mutual support; the risk, taking harmony for granted.",
      "opposition": "The Moons are in opposition: emotional styles are opposites — one responds where the other holds back. Attraction through contrast. Strength: genuine complementarity; the risk, emotional clashes and misread needs."
    },
    "moon-mercury": {
      "conjunction": "One partner's Moon and the other's Mercury are in conjunction: feelings and words intertwine — heart-to-heart conversation, intuitive understanding. Strength: warm, attuned communication; the risk, subjectivity and mixing facts with feelings.",
      "sextile": "Moon and Mercury are in sextile: one senses the other's feelings, the other finds words for them. Strength: a soulful, understanding dialogue; the risk, leaving it at pleasant but shallow.",
      "square": "Moon and Mercury are in square: one partner's logic stings the other's feelings. Words hurt; emotions cloud thinking. Strength: learning to join head and heart; the risk, misunderstanding and hurt feelings.",
      "trine": "Moon and Mercury are in trine: one easily voices what the other feels. Communication is warm and clear. Strength: mutual understanding and a subtle dialogue; the risk, taking ease for granted.",
      "opposition": "Moon and Mercury are in opposition: one partner's feelings and the other's logic on opposite poles. Stimulating but prone to misunderstanding. Strength: balancing mind and heart; the risk, arguments and a sense of not being understood."
    },
    "moon-venus": {
      "conjunction": "One partner's Moon and the other's Venus are in conjunction: a warm, tender, loving combination. One surrounds the other with care and gentleness. Strength: emotional warmth, closeness, and mutual care; the risk, indulgence and reluctance to face what's hard.",
      "sextile": "Moon and Venus are in sextile: a soft warmth and tenderness flows between the partners. Easy to care for and please each other. Strength: comfort and emotional harmony; the risk, keeping it pleasant without depth.",
      "square": "Moon and Venus are in square: one partner's need for care clashes with the other's desires. Hurt feelings and moodiness are possible. Strength: growth through friction; the risk, emotional disappointment and discord.",
      "trine": "Moon and Venus are in trine: tenderness and care flow easily and naturally. The bond is warm and nourishing. Strength: emotional and romantic harmony; the risk, laziness and a habit of comfort.",
      "opposition": "Moon and Venus are in opposition: one partner's needs and the other's desires on opposite poles. Attraction through contrast. Strength: complementing warmth and beauty; the risk, mismatched expectations of closeness."
    },
    "moon-mars": {
      "conjunction": "One partner's Moon and the other's Mars are in conjunction: passionate but explosive. The second partner's drive stirs the first's feelings — strong attraction, but also easily bruised emotions. Strength: passion, protecting loved ones, and liveliness; the risk, flare-ups and emotional conflict.",
      "sextile": "Moon and Mars are in sextile: one partner's energy invigorates the other's feelings. A lively warmth flows between them. Strength: passionate but gentle dynamism; the risk, leaving the charge unused.",
      "square": "Moon and Mars are in square: one partner's drive wounds the other's sensitivity. Frequent quarrels and emotional explosions. Strength: passion and energy; the risk, conflict and hurt feelings.",
      "trine": "Moon and Mars are in trine: one partner's energy naturally protects and supports the other. Passion blends with warmth. Strength: passionate care and a lively, warm dynamic; the risk, taking harmony for granted.",
      "opposition": "Moon and Mars are in opposition: one partner's drive and the other's feelings on opposite poles — passion bordering on conflict. Strength: strong attraction and energy; the risk, quarrels and emotional provocations."
    },
    "moon-jupiter": {
      "conjunction": "One partner's Moon and the other's Jupiter are in conjunction: a generous, warm combination. One surrounds the other's feelings with optimism, care, and abundance. Strength: emotional generosity, growth, and a feeling of safety; the risk, indulgence and over-caretaking.",
      "sextile": "Moon and Jupiter are in sextile: one gently encourages and lifts the other emotionally. Strength: optimism, warmth, and mutual care; the risk, laziness and counting on things to work out.",
      "square": "Moon and Jupiter are in square: one partner overdoes care or optimism, misreading the other's real needs. Strength: generosity and warmth; the risk, excess and hollow reassurance.",
      "trine": "Moon and Jupiter are in trine: one naturally warms and supports the other, giving a feeling of protection and growth. Strength: emotional generosity, optimism, and comfort; the risk, indulgence and slackness.",
      "opposition": "Moon and Jupiter are in opposition: one partner's generosity and the other's needs on opposite poles. Strength: care and optimism; the risk, over-caretaking and mismatched senses of scale."
    },
    "moon-saturn": {
      "conjunction": "One partner's Moon and the other's Saturn are in conjunction: a serious, 'karmic' combination. One gives the other's feelings support and structure, but may also cool them. Strength: reliability and lasting bonds; the risk, emotional coldness and a sense that love must be earned.",
      "sextile": "Moon and Saturn are in sextile: one gives the other's feelings mature support without pressure. Strength: reliability and emotional maturity; the risk, leaving this foundation underused.",
      "square": "Moon and Saturn are in square: one partner restrains or chills the other's feelings. A shortage of warmth and approval. Strength: growth through responsibility; the risk, coldness and the feeling that love must be earned.",
      "trine": "Moon and Saturn are in trine: one gives the other emotional reliability, stability, and mature care without pressure. Strength: support, loyalty, and enduring feeling; the risk, a certain restraint and dryness.",
      "opposition": "Moon and Saturn are in opposition: one partner's warmth and the other's reserve on opposite poles. Strength: emotional maturing through challenge; the risk, coldness, distance, and feeling undervalued."
    },
    "moon-uranus": {
      "conjunction": "One partner's Moon and the other's Uranus are in conjunction: one shakes up the other's feelings, bringing novelty and unpredictability. Strength: liveliness, freshness, and excitement; the risk, instability and a shortage of reliability.",
      "sextile": "Moon and Uranus are in sextile: one gently refreshes the other's feelings. A lightness and freedom flows between them. Strength: a lively, never-boring warmth; the risk, leaving the spark without depth.",
      "square": "Moon and Uranus are in square: one partner's drive for freedom unsettles the other's need for stability. Strength: an awakening of feeling; the risk, unpredictability and emotional instability.",
      "trine": "Moon and Uranus are in trine: one easily brings freshness and freedom into the other's feelings without destroying closeness. Strength: liveliness, ease, and mutual space; the risk, mistaking freedom for coolness.",
      "opposition": "Moon and Uranus are in opposition: one partner's pull toward freedom and the other's need for closeness on opposite poles. Exciting but seesawing attraction. Strength: awakening through difference; the risk, instability and growing distance."
    },
    "moon-neptune": {
      "conjunction": "One partner's Moon and the other's Neptune are in conjunction: a subtle, dreamy emotional bond. One feels the other almost telepathically, enveloping them in compassion and romance. Strength: empathy, tenderness, and spiritual unity; the risk, illusions, blurred boundaries, and codependence.",
      "sextile": "Moon and Neptune are in sextile: one gently attunes to and spiritualizes the other's feelings. Strength: sensitivity, compassion, and creative closeness; the risk, vagueness without grounding.",
      "square": "Moon and Neptune are in square: one partner's illusions and the other's feelings get confused. Misunderstanding and disappointment are possible. Strength: deep empathy; the risk, fog and lost emotional boundaries.",
      "trine": "Moon and Neptune are in trine: one naturally empathizes with the other, creating a tender, subtle soul connection. Strength: empathy, romance, and spiritual closeness; the risk, drifting into dreams and unclear boundaries.",
      "opposition": "Moon and Neptune are in opposition: one partner's ideals and the other's feelings on opposite poles. Strength: compassion and a soul connection; the risk, illusions and codependence."
    },
    "moon-pluto": {
      "conjunction": "One partner's Moon and the other's Pluto are in conjunction: a deep, all-encompassing emotional bond. One powerfully influences the other's feelings, awakening passion and transformation. Strength: depth, intensity, and emotional transformation; the risk, jealousy, control, and obsession.",
      "sextile": "Moon and Pluto are in sextile: one helps the other live through and renew deep feelings. Strength: emotional depth and support of change; the risk, leaving the potential untapped.",
      "square": "Moon and Pluto are in square: one partner seeks to control or intensely influence the other's feelings. Strength: transformation through crisis; the risk, manipulation, jealousy, and obsessiveness.",
      "trine": "Moon and Pluto are in trine: one deeply but organically transforms the other's feelings. Strength: emotional depth and regeneration; the risk, underrating the power of the attachment.",
      "opposition": "Moon and Pluto are in opposition: one partner's deep force and the other's feelings on opposite poles. Strength: transformation through deep bonds; the risk, jealousy and emotional extremes."
    },
    "mercury-sun": {
      "conjunction": "One partner's Mercury and the other's Sun are in conjunction: the first partner's mind works in service of the second's goals — conversation is lively and ideas are picked up instantly. Strength: an energetic, personal dialogue and genuine mutual interest; the risk, one partner dominating the talk.",
      "sextile": "Mercury and Sun are in sextile: one partner's thinking gently supports the other's initiatives. Strength: easy, productive exchange; the risk, staying at the surface.",
      "square": "Mercury and Sun are in square: one partner's thinking and the other's will clash. Arguments and a sense of being misheard arise. Strength: a sharp, stimulating dialogue; the risk, verbal conflict and stubbornness.",
      "trine": "Mercury and Sun are in trine: one partner's thoughts naturally align with the other's aims. Conversation flows effortlessly. Strength: clear, supportive dialogue; the risk, taking ease for granted.",
      "opposition": "Mercury and Sun are in opposition: one partner's thinking style diverges from the other's will, but this sparks discussion. Strength: broadening each other's perspective; the risk, arguments and mutual misunderstanding."
    },
    "mercury-moon": {
      "conjunction": "One partner's Mercury and the other's Moon are in conjunction: words touch feelings — heart-to-heart conversation and intuitive understanding. Strength: warm, sensitive communication; the risk, words easily sting and subjectivity clouds clarity.",
      "sextile": "Mercury and Moon are in sextile: one partner finds words for what the other feels. Strength: a soulful, understanding dialogue; the risk, keeping things pleasantly shallow.",
      "square": "Mercury and Moon are in square: one partner's logic stings the other's feelings. Words hurt; emotions cloud thinking. Strength: learning to join head and heart; the risk, misunderstanding and hurt feelings.",
      "trine": "Mercury and Moon are in trine: one easily voices what the other is feeling. Communication is warm and clear. Strength: mutual understanding and a subtle, attuned dialogue; the risk, taking ease for granted.",
      "opposition": "Mercury and Moon are in opposition: one partner's logic and the other's feelings on opposite poles. Stimulating, but prone to misunderstanding. Strength: balancing mind and heart; the risk, a sense of not being understood."
    },
    "mercury-mercury": {
      "conjunction": "Mercury meets Mercury — both partners think and communicate in a similar way, easily understanding each other and talking about the same things. Strength: quick, lively dialogue and genuine mutual understanding; the risk, circling the same ideas without fresh perspective.",
      "sextile": "The Mercuries are in sextile: thinking styles gently resonate. Conversation is pleasant and productive. Strength: easy, interesting exchange; the risk, superficiality.",
      "square": "The Mercuries are in square: thinking and communication styles clash — arguments, misunderstanding, different 'truths.' Strength: a stimulating, growth-producing dialogue; the risk, verbal conflict and stubbornness.",
      "trine": "The Mercuries are in trine: the partners' thinking is naturally in tune. Easy to talk, learn from each other, and make plans together. Strength: clear, harmonious dialogue; the risk, taking ease for granted.",
      "opposition": "The Mercuries are in opposition: thinking styles are opposite — one concrete, one broad; one emotional, one logical. Strength: genuine complementarity and expanded perspective; the risk, arguments and misunderstanding."
    },
    "mercury-venus": {
      "conjunction": "One partner's Mercury and the other's Venus are in conjunction: communication is warm, charming, and pleasant. One finds exactly the words the other enjoys hearing. Strength: tact, diplomacy, and mutual affection in conversation; the risk, saying the pleasant rather than the honest.",
      "sextile": "Mercury and Venus are in sextile: one partner easily says what pleases the other. Contacts are warm. Strength: charm in communication and easy accord; the risk, superficiality.",
      "square": "Mercury and Venus are in square: one partner's words chafe against the other's values. Friction over tastes, money, or affection. Strength: clarity about what matters; the risk, things left unsaid and mutual criticism.",
      "trine": "Mercury and Venus are in trine: communication is warm, charming, and agreeable. Easy to find accord and speak kindly. Strength: tact and diplomacy; the risk, avoiding uncomfortable truths.",
      "opposition": "Mercury and Venus are in opposition: one partner's words and the other's feelings on opposite poles. Stimulating, but prone to misunderstanding. Strength: balancing mind and tenderness; the risk, indecision and disagreement over values."
    },
    "mercury-mars": {
      "conjunction": "One partner's Mercury and the other's Mars are in conjunction: talk is sharp, passionate, and decisive. One thinks and speaks while the other acts immediately. Strength: an energetic, direct dialogue and quick movement from words to action; the risk, sharpness, arguments, and hasty speech.",
      "sextile": "Mercury and Mars are in sextile: one partner's thought easily becomes the other's action. A good working team. Strength: decisiveness and efficiency; the risk, leaving the charge unused.",
      "square": "Mercury and Mars are in square: one partner's words provoke the other's drive. Verbal clashes and bluntness. Strength: a sharp, growth-producing dialogue; the risk, quarrels and hasty words.",
      "trine": "Mercury and Mars are in trine: one partner's ideas flow smoothly into action through the other. Strength: a decisive, effective team; the risk, taking ease for granted.",
      "opposition": "Mercury and Mars are in opposition: one partner's thinking and the other's drive on opposite poles. Heated debate. Strength: dynamic exchange; the risk, verbal battles and provocation."
    },
    "mercury-jupiter": {
      "conjunction": "One partner's Mercury and the other's Jupiter are in conjunction: one broadens the other's thinking, adding optimism and scope. The second partner grounds the first's ideas. Strength: an inspiring exchange and mutual growth; the risk, exaggeration and overlooking details.",
      "sextile": "Mercury and Jupiter are in sextile: one gently broadens the other's horizons. Conversations are uplifting. Strength: an optimistic, enriching exchange; the risk, superficiality.",
      "square": "Mercury and Jupiter are in square: one partner thinks at too grand a scale for the other's concrete thinking. Clashes of scope and detail. Strength: growth through debate; the risk, exaggeration and dismissing the facts.",
      "trine": "Mercury and Jupiter are in trine: one naturally inspires the other's thinking, bringing breadth and optimism. Strength: an enriching, encouraging dialogue; the risk, carelessness about the details.",
      "opposition": "Mercury and Jupiter are in opposition: one partner's broad view and the other's detail-minded thinking on opposite poles. Strength: joining scale and concreteness; the risk, exaggeration and clashing versions of the truth."
    },
    "mercury-saturn": {
      "conjunction": "One partner's Mercury and the other's Saturn are in conjunction: one gives the other's thinking structure and seriousness. Conversation is measured and considered. Strength: depth and reliability in communication; the risk, criticism and tightness in speech.",
      "sextile": "Mercury and Saturn are in sextile: one gives the other's ideas structure and realism without pressure. Strength: a practical, reliable dialogue; the risk, a certain dryness.",
      "square": "Mercury and Saturn are in square: one partner criticizes or restricts the other's thinking. Insecurity and a feeling of not being understood. Strength: disciplined thinking through challenge; the risk, criticism and tightness in communication.",
      "trine": "Mercury and Saturn are in trine: one gives the other's thinking maturity and structure without pressure. Strength: a considered, reliable dialogue; the risk, a certain dryness.",
      "opposition": "Mercury and Saturn are in opposition: one partner's flexible thinking and the other's strictness on opposite poles. Strength: balancing discipline and freedom of thought; the risk, criticism and feeling misunderstood."
    },
    "mercury-uranus": {
      "conjunction": "One partner's Mercury and the other's Uranus are in conjunction: one jolts the other's mind with unexpected ideas. Conversation crackles with insight. Strength: originality and intellectual excitement; the risk, nervousness and unpredictability.",
      "sextile": "Mercury and Uranus are in sextile: one tosses fresh ideas to the other. Conversations are lively and never boring. Strength: inventiveness and openness to the new; the risk, leaving sparks without follow-through.",
      "square": "Mercury and Uranus are in square: one partner's unconventionality unsettles the other's thinking. Arguments and sharpness. Strength: originality through friction; the risk, nervousness and intellectual rebellion.",
      "trine": "Mercury and Uranus are in trine: one easily inspires the other's mind toward the new without confusion. Strength: insight, flexibility, and a never-boring dialogue; the risk, taking ease for granted.",
      "opposition": "Mercury and Uranus are in opposition: one partner's originality and the other's orderly thinking on opposite poles. Strength: mutual awakening; the risk, arguments and inconsistency."
    },
    "mercury-neptune": {
      "conjunction": "One partner's Mercury and the other's Neptune are in conjunction: one wraps the other's thinking in imagination and poetry. Conversation is vivid but hazy. Strength: a creative, imaginative exchange; the risk, misunderstanding and deceptive expectations.",
      "sextile": "Mercury and Neptune are in sextile: one gently adds intuition and imagery to the other's thinking. Strength: creative, sensitive communication; the risk, vagueness.",
      "square": "Mercury and Neptune are in square: one partner's illusions and the other's logic get confused. Misunderstanding and things left unsaid. Strength: creative inspiration; the risk, fog and distorted perception of each other's words.",
      "trine": "Mercury and Neptune are in trine: one naturally adds subtlety and intuition to the other's thinking. Strength: an imaginative, attuned, creative dialogue; the risk, drifting into fantasy.",
      "opposition": "Mercury and Neptune are in opposition: one partner's logic and the other's imagination on opposite poles. Strength: joining intuition and reason; the risk, misunderstanding and illusions."
    },
    "mercury-pluto": {
      "conjunction": "One partner's Mercury and the other's Pluto are in conjunction: one gives the other's thinking depth and intensity — conversations cut to the core. Strength: penetrating, transforming exchange; the risk, pressure and attempts to control the other's thinking.",
      "sextile": "Mercury and Pluto are in sextile: one helps the other's mind dig deeper and see what's hidden. Strength: insight and the power to persuade; the risk, leaving the depth untapped.",
      "square": "Mercury and Pluto are in square: one partner pressures the other's thinking, pushing views or manipulating with words. Strength: deep transformation of thought through challenge; the risk, manipulation, suspicion, and power-charged arguments.",
      "trine": "Mercury and Pluto are in trine: one organically deepens the other's thinking, helping them see to the essence. Strength: insight, concentration, and influence; the risk, underrating the intensity of conversations.",
      "opposition": "Mercury and Pluto are in opposition: one partner's sharp mind and the other's deep force on opposite poles. Strength: a transforming exchange; the risk, verbal power games and suspicion."
    },
    "venus-venus": {
      "conjunction": "Venus meets Venus — both partners share similar tastes, values, and ways of loving. Easy to please each other and enjoy things together. Strength: harmony in love, beauty, and values; the risk, indulgence and a shortage of the stimulating difference that spurs growth.",
      "sextile": "The Venuses are in sextile: tastes and ways of loving gently resonate. Easy to enjoy things together. Strength: pleasant harmony; the risk, keeping the bond at a comfortable but shallow level.",
      "square": "The Venuses are in square: tastes, values, and ways of expressing love diverge. Friction over how to give and receive tenderness. Strength: growth through difference; the risk, mutual criticism of each other's style and a shortage of understanding.",
      "trine": "The Venuses are in trine: each partner easily understands what the other needs in love. Harmony in values and pleasures. Strength: mutual attraction and comfort; the risk, comfortable slackness.",
      "opposition": "The Venuses are in opposition: ways of loving and values are opposites. Attraction through contrast. Strength: genuine complementarity; the risk, mismatched expectations from the relationship."
    },
    "venus-sun": {
      "conjunction": "One partner's Venus and the other's Sun are in conjunction: tenderness and attraction from the first illuminate the second's identity — a natural affection and warmth. Strength: warmth, mutual admiration, and easy attraction; the risk, idealization and indulgence.",
      "sextile": "Venus and Sun are in sextile: one partner's tenderness gently supports the other. A pleasant affection flows between them. Strength: warmth and harmony; the risk, not deepening the bond.",
      "square": "Venus and Sun are in square: one partner's tenderness and the other's self-expression chafe. Tastes and values diverge. Strength: growth through difference; the risk, mutual criticism and mismatched expectations.",
      "trine": "Venus and Sun are in trine: one partner's tenderness easily harmonizes with the other's will. The bond is warm and pleasant. Strength: mutual admiration, harmony, and joy; the risk, comfortable slackness.",
      "opposition": "Venus and Sun are in opposition: one partner's tenderness and the other's will on opposite poles — attraction through contrast. Strength: genuine complementarity; the risk, mismatched expectations from the relationship."
    },
    "venus-moon": {
      "conjunction": "One partner's Venus and the other's Moon are in conjunction: tenderness and care merge — a warm, nourishing, and affectionate combination. Strength: emotional warmth, closeness, and mutual tenderness; the risk, indulgence and reluctance to face difficulties.",
      "sextile": "Venus and Moon are in sextile: one partner's tenderness gently supports the other's feelings. Strength: comfort and emotional harmony; the risk, keeping things pleasant without depth.",
      "square": "Venus and Moon are in square: one partner's desires clash with the other's emotional needs. Hurt feelings and moodiness are possible. Strength: growth through friction; the risk, emotional discord.",
      "trine": "Venus and Moon are in trine: tenderness and feelings flow easily and naturally. The bond is warm and nourishing. Strength: emotional and romantic harmony; the risk, laziness and a habit of comfort.",
      "opposition": "Venus and Moon are in opposition: one partner's desires and the other's needs on opposite poles. Attraction through contrast. Strength: complementing warmth and sensitivity; the risk, mismatched expectations of closeness."
    },
    "venus-mercury": {
      "conjunction": "One partner's Venus and the other's Mercury are in conjunction: tenderness from one finds words in the other — charming, pleasant communication. Strength: tact, diplomacy, and mutual affection in conversation; the risk, saying the pleasant rather than the honest.",
      "sextile": "Venus and Mercury are in sextile: one partner's tenderness and the other's words align easily. Contacts are warm. Strength: charm in communication and easy accord; the risk, superficiality.",
      "square": "Venus and Mercury are in square: one partner's values chafe against the other's words. Friction in conversation about tastes and affection. Strength: clarity about what matters; the risk, things left unsaid and mutual criticism.",
      "trine": "Venus and Mercury are in trine: tenderness and words flow easily and agreeably together. Communication is pleasant and warm. Strength: tact and diplomacy; the risk, avoiding uncomfortable truths.",
      "opposition": "Venus and Mercury are in opposition: one partner's tenderness and the other's logic on opposite poles. Stimulating, but prone to misunderstanding. Strength: balancing feeling and mind; the risk, indecision."
    },
    "venus-mars": {
      "conjunction": "One partner's Venus and the other's Mars are in conjunction: the classic combination of attraction. Tenderness meets passion — strong romantic and sexual pull. Strength: chemistry, passion, and mutual desire; the risk, impulsiveness in love, jealousy, and high-pitched tension.",
      "sextile": "Venus and Mars are in sextile: tenderness and drive align easily — pleasant attraction and lively passion. Strength: healthy attraction, charm, and romance; the risk, leaving the spark unused.",
      "square": "Venus and Mars are in square: one partner's tenderness and the other's drive clash — passionate but stormy. Strength: powerful attraction; the risk, conflict in love, jealousy, and impulsiveness.",
      "trine": "Venus and Mars are in trine: tenderness and passion flow in harmony — natural, warm, and passionate attraction. Strength: magnetism, easy romance, and desire; the risk, taking the chemistry for granted.",
      "opposition": "Venus and Mars are in opposition: tenderness and drive on opposite poles — powerful 'yin and yang' pull. Strength: passionate, dynamic connection; the risk, swings of attraction, friction, and jealousy."
    },
    "venus-jupiter": {
      "conjunction": "One partner's Venus and the other's Jupiter are in conjunction: one expands the other's love and pleasures, bringing generosity and optimism. A warm and lucky combination. Strength: warmth, luck in love, and enjoyment together; the risk, indulgence, extravagance, and idealization.",
      "sextile": "Venus and Jupiter are in sextile: one gently adds generosity and optimism to the other's love. Strength: warmth, joy, and goodwill; the risk, overdoing the pleasures.",
      "square": "Venus and Jupiter are in square: one partner goes overboard with generosity or idealizes the relationship. Excess and unrealistic expectations are possible. Strength: a warm, generous dynamic; the risk, extravagance and overrating feelings.",
      "trine": "Venus and Jupiter are in trine: one naturally multiplies the other's love and joys, bringing luck and generosity. Strength: warmth, good fortune, and a big heart; the risk, indulgence and excess.",
      "opposition": "Venus and Jupiter are in opposition: one partner's generosity and the other's love on opposite poles. Strength: generosity and joy; the risk, extravagance and unrealistic expectations."
    },
    "venus-saturn": {
      "conjunction": "One partner's Venus and the other's Saturn are in conjunction: one brings seriousness, loyalty, and lasting quality to the other's love, but may also cool it. Strength: devotion, commitment, and solidity; the risk, coldness and a sense that love is conditional.",
      "sextile": "Venus and Saturn are in sextile: one gives the other's feelings reliability and maturity without pressure. Strength: loyalty and stability; the risk, leaving this foundation underused.",
      "square": "Venus and Saturn are in square: one partner restrains or undervalues the other's tenderness. Coldness, distance, and fear of rejection. Strength: loyalty through testing; the risk, emotional coldness and a feeling that love is in short supply.",
      "trine": "Venus and Saturn are in trine: one gives the other's love a solid, mature foundation without pressure. Strength: devotion, reliability, and lasting feeling; the risk, a certain restraint and dryness.",
      "opposition": "Venus and Saturn are in opposition: one partner's tenderness and the other's reserve on opposite poles. Strength: mature, tested love; the risk, coldness, distance, and feeling unloved."
    },
    "venus-uranus": {
      "conjunction": "One partner's Venus and the other's Uranus are in conjunction: one brings excitement, novelty, and freedom into the other's love life. The attraction is vivid and sudden. Strength: a spark, originality, and a passion for the new; the risk, instability and fear of commitment.",
      "sextile": "Venus and Uranus are in sextile: one gently refreshes the other's feelings, adding lightness and freedom. Strength: a lively, never-boring tenderness; the risk, leaving the spark without depth.",
      "square": "Venus and Uranus are in square: one partner's drive for freedom unsettles the other's need for closeness. Sudden attractions and coolings. Strength: excitement and novelty; the risk, inconstancy and breakups.",
      "trine": "Venus and Uranus are in trine: one easily brings freshness and freedom into the other's love without destroying closeness. Strength: originality, lightness, and attraction; the risk, valuing freedom over depth.",
      "opposition": "Venus and Uranus are in opposition: one partner's drive for freedom and the other's tenderness on opposite poles. Exciting but seesawing attraction. Strength: a vivid, awakening bond; the risk, inconstancy."
    },
    "venus-neptune": {
      "conjunction": "One partner's Venus and the other's Neptune are in conjunction: an elevated, romantic bond. One wraps the other's love in dream, compassion, and ideal — like kindred souls. Strength: tenderness, creativity, and spiritual romance; the risk, illusions and disappointment.",
      "sextile": "Venus and Neptune are in sextile: one gently spiritualizes the other's love, adding tenderness and imagination. Strength: compassion, romance, and creativity; the risk, vagueness without grounding.",
      "square": "Venus and Neptune are in square: one partner's illusions and the other's love get confused. Idealization, things left unsaid, disappointments. Strength: a tender, compassionate bond; the risk, deception, illusions, and rescuing.",
      "trine": "Venus and Neptune are in trine: one naturally spiritualizes the other's love, bringing romance and a fine soul connection. Strength: tenderness, creativity, and spiritual closeness; the risk, idealization.",
      "opposition": "Venus and Neptune are in opposition: one partner's ideals and the other's love on opposite poles. Strength: compassion and romance; the risk, illusions, idealization, and codependence."
    },
    "venus-pluto": {
      "conjunction": "One partner's Venus and the other's Pluto are in conjunction: a deep, all-consuming attraction. One influences the other's love with enormous force — passion transforms. Strength: magnetism, depth, and passionate closeness; the risk, jealousy, possessiveness, and control.",
      "sextile": "Venus and Pluto are in sextile: one helps the other's love deepen and renew through honesty. Strength: magnetism and emotional depth; the risk, leaving the intensity untapped.",
      "square": "Venus and Pluto are in square: one partner seeks to possess and control the other's feelings. Obsessive attraction and jealousy. Strength: deep, transforming passion; the risk, control, manipulation, and possessiveness.",
      "trine": "Venus and Pluto are in trine: one deeply but organically transforms the other's love, bringing passion and depth. Strength: magnetism, passion, and transforming closeness; the risk, underrating the power of the attachment.",
      "opposition": "Venus and Pluto are in opposition: one partner's love and the other's force on opposite poles. Powerful attraction and a fight for control. Strength: a deep, transforming bond; the risk, jealousy, possessiveness, and extremes."
    },
    "mars-sun": {
      "conjunction": "One partner's Mars and the other's Sun are in conjunction: a powerful, energetic bond. One ignites, the other acts — together there's plenty of drive and passion. Strength: dynamism, initiative, and sexual attraction; the risk, rivalry, flare-ups, and a fight for the lead.",
      "sextile": "Mars and Sun are in sextile: the partners' energies gently support each other. They work well together. Strength: a productive team, passion, and mutual motivation; the risk, leaving the charge unused.",
      "square": "Mars and Sun are in square: one partner's drive clashes with the other's will. Strong attraction mixed with irritation and a fight for the lead. Strength: passion and energy; the risk, quarrels, aggression, and rivalry.",
      "trine": "Mars and Sun are in trine: the partners' energies naturally support each other. They act together with enthusiasm and mutual respect. Strength: drive, passion, and effective cooperation; the risk, taking the easy synergy for granted.",
      "opposition": "Mars and Sun are in opposition: one partner's drive and the other's will on opposite poles — passion bordering on struggle. Strength: powerful energy and sexual magnetism; the risk, conflict, rivalry, and provocations."
    },
    "mars-moon": {
      "conjunction": "One partner's Mars and the other's Moon are in conjunction: passionate but explosive. One partner's drive stirs the other's feelings — strong attraction but also easily bruised emotions. Strength: passion, protecting loved ones, and liveliness; the risk, flare-ups and emotional conflict.",
      "sextile": "Mars and Moon are in sextile: one partner's energy invigorates the other's feelings. A lively warmth flows between them. Strength: passionate but gentle dynamism; the risk, leaving the charge unused.",
      "square": "Mars and Moon are in square: one partner's drive wounds the other's sensitivity. Frequent quarrels and emotional explosions. Strength: passion and energy; the risk, conflict, hurt feelings, and sharp reactions.",
      "trine": "Mars and Moon are in trine: one partner's energy naturally protects and supports the other. Passion blends with warmth. Strength: passionate care and a lively, warm dynamic; the risk, taking harmony for granted.",
      "opposition": "Mars and Moon are in opposition: one partner's drive and the other's feelings on opposite poles — passion bordering on conflict. Strength: strong attraction and energy; the risk, quarrels and emotional provocations."
    },
    "mars-mercury": {
      "conjunction": "One partner's Mars and the other's Mercury are in conjunction: one partner's drive charges the other's thinking — conversations are lively and decisive. Strength: a sharp, energetic dialogue and quick initiative; the risk, arguments, bluntness, and verbal clashes.",
      "sextile": "Mars and Mercury are in sextile: one partner's energy invigorates the other's mind. They discuss and act together well. Strength: productive exchange and decisiveness; the risk, leaving the charge unused.",
      "square": "Mars and Mercury are in square: one partner's drive clashes with the other's thinking. Arguments and sharp words. Strength: a sharpened mind under pressure; the risk, quarrels, rudeness, and intellectual rivalry.",
      "trine": "Mars and Mercury are in trine: one partner's energy naturally spurs the other's mind; ideas easily move into action. Strength: a decisive, effective dialogue; the risk, taking ease for granted.",
      "opposition": "Mars and Mercury are in opposition: one partner's drive and the other's thinking on opposite poles. Good for heated debate. Strength: dynamic exchange; the risk, verbal battles and provocation."
    },
    "mars-venus": {
      "conjunction": "One partner's Mars and the other's Venus are in conjunction: the classic combination of attraction. Passion meets tenderness — strong romantic and sexual pull. Strength: chemistry, passion, and mutual desire; the risk, impulsiveness, jealousy, and high-pitched tension.",
      "sextile": "Mars and Venus are in sextile: drive and tenderness align easily — pleasant attraction and lively passion. Strength: healthy attraction, charm, and romance; the risk, leaving the spark unused.",
      "square": "Mars and Venus are in square: one partner's drive and the other's tenderness clash — passionate but stormy. Strength: powerful attraction; the risk, conflict in love, jealousy, and impulsiveness.",
      "trine": "Mars and Venus are in trine: passion and love flow in harmony — natural, warm, and passionate attraction. Strength: magnetism, easy romance, and desire; the risk, taking the chemistry for granted.",
      "opposition": "Mars and Venus are in opposition: drive and tenderness on opposite poles — a powerful 'yang and yin' pull. Strength: passionate, dynamic connection; the risk, swings of attraction, friction, and jealousy."
    },
    "mars-mars": {
      "conjunction": "Mars meets Mars — both partners share a lot of energy, passion, and initiative. They act and want things in similar ways. Strength: drive, joint activity, and sexual compatibility; the risk, rivalry and a clash of two strong wills.",
      "sextile": "The Marses are in sextile: the partners' energies align easily. They work well together. Strength: a productive team and mutual motivation; the risk, leaving the shared charge unused.",
      "square": "The Marses are in square: action styles and desires clash — a fight for leadership and frequent conflict. Strength: powerful dynamism; the risk, quarrels, aggression, and a power struggle.",
      "trine": "The Marses are in trine: the partners' energies are naturally in tune. They act together smoothly and passionately. Strength: shared drive, initiative, and sexual harmony; the risk, taking the synergy for granted.",
      "opposition": "The Marses are in opposition: the partners' drives point in opposite directions — passion and rivalry at once. Strength: dynamic attraction and energy; the risk, conflict and a fight for the lead."
    },
    "mars-jupiter": {
      "conjunction": "One partner's Mars and the other's Jupiter are in conjunction: one uplifts and expands the other's actions, adding courage and optimism. Together there's a lot of energy and enthusiasm. Strength: drive, enterprise, and luck in new ventures; the risk, overrating abilities, recklessness, and overdoing it.",
      "sextile": "Mars and Jupiter are in sextile: one gently supports the other's initiative, adding optimism. Strength: an energetic, fortunate team; the risk, leaving the charge unused.",
      "square": "Mars and Jupiter are in square: one partner inflates the other's actions to excess. Risky ventures and overconfidence. Strength: bold, ambitious dynamism; the risk, rashness and wasted energy.",
      "trine": "Mars and Jupiter are in trine: one naturally inspires and supports the other's ventures, adding luck and scope. Strength: enthusiasm, courage, and productivity; the risk, overdoing it.",
      "opposition": "Mars and Jupiter are in opposition: one partner's drive and the other's scope on opposite poles — they stimulate each other but risk overreach. Strength: enterprising energy; the risk, reckless ventures and different senses of measure."
    },
    "mars-saturn": {
      "conjunction": "One partner's Mars and the other's Saturn are in conjunction: one restrains and disciplines the other's energy — actions become more measured but sometimes feel blocked. Strength: endurance, control, and strategic effort; the risk, frustration, blocked energy, and a feeling of being 'braked.'",
      "sextile": "Mars and Saturn are in sextile: one gives the other's energy discipline and steadiness without suffocation. Strength: an enduring, persistent team; the risk, leaving this focus unused.",
      "square": "Mars and Saturn are in square: one partner's drive clashes with the other's limits. Irritation and blocked action. Strength: tempered, disciplined achievement through resistance; the risk, frustration and power struggles.",
      "trine": "Mars and Saturn are in trine: one gives the other's actions steadiness, endurance, and strategy without pressure. Strength: resilience, discipline, and a reliable result; the risk, caution that holds back boldness.",
      "opposition": "Mars and Saturn are in opposition: one partner's drive and the other's restraint on opposite poles — energy against control. Strength: disciplined force through challenge; the risk, frustration, conflict, and clashing paces."
    },
    "mars-uranus": {
      "conjunction": "One partner's Mars and the other's Uranus are in conjunction: one gives the other's actions sudden daring and freedom — energy crackles. Strength: courage, originality, and an electrifying drive; the risk, impulsiveness, recklessness, and destructive urges.",
      "sextile": "Mars and Uranus are in sextile: one gently adds inventiveness and drive to the other's actions. Strength: bold, original initiative; the risk, needing a trigger to activate the charge.",
      "square": "Mars and Uranus are in square: one partner's drive for freedom makes the other's energy impulsive and rebellious. Sudden outbursts and resistance to limits. Strength: daring originality; the risk, recklessness and destructive urges.",
      "trine": "Mars and Uranus are in trine: one easily adds courage, speed, and originality to the other's actions. Strength: bravery, innovation, and quick response; the risk, taking boldness for granted.",
      "opposition": "Mars and Uranus are in opposition: one partner's drive and the other's freedom on opposite poles — dynamic but explosive. Strength: an awakening, electrifying energy; the risk, clashes and sudden breaks."
    },
    "mars-neptune": {
      "conjunction": "One partner's Mars and the other's Neptune are in conjunction: one blurs and spiritualizes the other's actions — energy flows by inspiration rather than force. Strength: creative, attuned, inspired action; the risk, a dip in motivation, unclear goals, and deceptive expectations.",
      "sextile": "Mars and Neptune are in sextile: one gently inspires the other's actions, adding intuition and creativity. Strength: inspired, purposeful activity; the risk, letting energy dissolve.",
      "square": "Mars and Neptune are in square: one partner's drive and the other's illusions get confused. Unclear goals and wasted action. Strength: inspired action when grounded; the risk, weak motivation and disappointments.",
      "trine": "Mars and Neptune are in trine: one naturally inspires the other's actions, giving them creativity and intuition. Strength: artistic, purposeful, attuned activity; the risk, drifting from concrete goals.",
      "opposition": "Mars and Neptune are in opposition: one partner's drive and the other's ideals on opposite poles — inspiration against action. Strength: inspired, compassionate energy; the risk, confusion and action going nowhere."
    },
    "mars-pluto": {
      "conjunction": "One partner's Mars and the other's Pluto are in conjunction: one gives the other's actions enormous force, intensity, and will. The bond is powerful and transforming. Strength: iron will, endurance, and passion; the risk, power struggles, ruthlessness, and destructive intensity.",
      "sextile": "Mars and Pluto are in sextile: one helps the other's actions gain depth and transforming power. Strength: intense, effective willpower; the risk, leaving this force untapped.",
      "square": "Mars and Pluto are in square: one partner's drive and the other's power clash. Power struggles and obsessive intensity. Strength: the deepest willpower through crisis; the risk, ruthlessness, domination, and self-destructive intensity.",
      "trine": "Mars and Pluto are in trine: one organically deepens and amplifies the other's actions, bringing endurance and will. Strength: powerful will, regeneration, and resilience; the risk, underrating the bond's intensity.",
      "opposition": "Mars and Pluto are in opposition: one partner's drive and the other's power on opposite poles. Powerful attraction and a fight for control. Strength: transforming willpower through confrontation; the risk, power games, ruthlessness, and extremes."
    },
    "jupiter-sun": {
      "conjunction": "One partner's Jupiter and the other's Sun are in conjunction: one expands the other's horizons, believes in them, and brings luck. The second inspires the first's scope. Strength: optimism, generosity, and mutual growth; the risk, indulgence, overconfidence, and excess.",
      "sextile": "Jupiter and Sun are in sextile: one gently supports and encourages the other. The bond is light and beneficial. Strength: optimism and mutual advantage; the risk, laziness and counting on things to sort themselves out.",
      "square": "Jupiter and Sun are in square: one partner overestimates or over-praises the other. Excess and clashing views on scale. Strength: a generous, growing dynamic; the risk, overconfidence and empty promises.",
      "trine": "Jupiter and Sun are in trine: one naturally inspires the other and brings luck and self-belief. Strength: growth, optimism, and mutual generosity; the risk, slackness and a taste for excess.",
      "opposition": "Jupiter and Sun are in opposition: one partner's scope and the other's will on opposite poles — mutual growth with a risk of overreach. Strength: generosity and development; the risk, extravagance and imposing beliefs."
    },
    "jupiter-moon": {
      "conjunction": "One partner's Jupiter and the other's Moon are in conjunction: one surrounds the other's feelings with optimism, care, and abundance. A warm, supportive combination. Strength: emotional generosity, growth, and a feeling of safety; the risk, indulgence and over-caretaking.",
      "sextile": "Jupiter and Moon are in sextile: one gently encourages and lifts the other emotionally. Strength: optimism, warmth, and mutual care; the risk, laziness and counting on things to work out.",
      "square": "Jupiter and Moon are in square: one partner overdoes care or optimism, misreading the other's real needs. Strength: generosity and warmth; the risk, excess and hollow reassurance.",
      "trine": "Jupiter and Moon are in trine: one naturally warms and supports the other, giving a feeling of protection and growth. Strength: emotional generosity, optimism, and comfort; the risk, indulgence and slackness.",
      "opposition": "Jupiter and Moon are in opposition: one partner's generosity and the other's needs on opposite poles. Strength: care and optimism; the risk, over-caretaking and mismatched senses of scale."
    },
    "jupiter-mercury": {
      "conjunction": "One partner's Jupiter and the other's Mercury are in conjunction: one broadens the other's thinking, adding optimism and scope. The second grounds the first's ideas. Strength: an inspiring exchange of ideas and mutual growth; the risk, exaggeration and overlooking details.",
      "sextile": "Jupiter and Mercury are in sextile: one gently broadens the other's horizons. Conversations are uplifting. Strength: an optimistic, enriching exchange; the risk, superficiality.",
      "square": "Jupiter and Mercury are in square: one partner thinks at too grand a scale for the other's concrete thinking. Clashes of scope and detail. Strength: growth through debate; the risk, exaggeration and dismissing the facts.",
      "trine": "Jupiter and Mercury are in trine: one naturally inspires the other's thinking, bringing breadth and optimism. Strength: an enriching, encouraging dialogue; the risk, carelessness about the details.",
      "opposition": "Jupiter and Mercury are in opposition: one partner's broad view and the other's detailed mind on opposite poles. Strength: joining scale and concreteness; the risk, exaggeration and clashing versions of the truth."
    },
    "jupiter-venus": {
      "conjunction": "One partner's Jupiter and the other's Venus are in conjunction: one expands the other's love and pleasures, bringing generosity and optimism. A warm and lucky combination. Strength: warmth, luck in love, and pleasure together; the risk, indulgence, extravagance, and idealization.",
      "sextile": "Jupiter and Venus are in sextile: one gently adds generosity and optimism to the other's love. Strength: warmth, joy, and goodwill; the risk, overdoing the pleasures.",
      "square": "Jupiter and Venus are in square: one partner goes overboard with generosity or idealizes the relationship. Excess and unrealistic expectations are possible. Strength: a warm, generous dynamic; the risk, extravagance and overrating feelings.",
      "trine": "Jupiter and Venus are in trine: one naturally multiplies the other's love and joys, bringing luck and generosity. Strength: warmth, good fortune, and a big heart; the risk, indulgence and excess.",
      "opposition": "Jupiter and Venus are in opposition: one partner's generosity and the other's love on opposite poles. Strength: generosity and joy; the risk, extravagance and unrealistic expectations."
    },
    "jupiter-mars": {
      "conjunction": "One partner's Jupiter and the other's Mars are in conjunction: one uplifts and expands the other's actions, adding courage and optimism. Together there's a lot of energy and enthusiasm. Strength: drive, enterprise, and luck in new starts; the risk, overrating abilities and recklessness.",
      "sextile": "Jupiter and Mars are in sextile: one gently supports the other's initiative, adding optimism. Strength: an energetic, fortunate team; the risk, waiting instead of acting.",
      "square": "Jupiter and Mars are in square: one partner inflates the other's actions to excess. Risky ventures and overconfidence. Strength: bold, ambitious dynamism; the risk, rashness and wasted energy.",
      "trine": "Jupiter and Mars are in trine: one naturally inspires and supports the other's ventures, adding luck and scope. Strength: enthusiasm, courage, and productivity; the risk, overdoing it.",
      "opposition": "Jupiter and Mars are in opposition: one partner's scope and the other's drive on opposite poles — they stimulate each other but risk overreach. Strength: enterprising energy; the risk, reckless ventures and different senses of measure."
    },
    "jupiter-jupiter": {
      "conjunction": "Jupiter meets Jupiter — both partners share similar views on growth, faith, and meaning. Easy to share optimism. This is often the same age group, so the aspect also speaks to generational commonality. Strength: shared values and mutual encouragement; the risk, shared excess and overindulgence.",
      "sextile": "The Jupiters are in sextile: views on life and growth gently coincide (partly a generational aspect). Strength: shared optimism and support of development; the risk, comfortable slackness.",
      "square": "The Jupiters are in square: beliefs, faith, and ideas about growth diverge — different 'right ways to live,' often across generations. Strength: expansion through the clash of views; the risk, disputes over values.",
      "trine": "The Jupiters are in trine: worldviews and optimism are naturally in tune (partly a generational aspect). Strength: shared faith, growth, and generosity; the risk, a shared tendency toward excess.",
      "opposition": "The Jupiters are in opposition: views on meaning and faith are opposite. They broaden each other's perspective but disagree on values. Strength: complementary worldviews; the risk, dogmatism and imposing beliefs."
    },
    "jupiter-saturn": {
      "conjunction": "One partner's Jupiter and the other's Saturn are in conjunction: optimism and scope meet caution and structure — together the result is realistic, grounded growth. Strength: measured ambition and lasting plans; the risk, seesawing between hope and doubt.",
      "sextile": "Jupiter and Saturn are in sextile: one partner's faith and the other's discipline easily complement each other. Strength: practical, steady growth; the risk, leaving the balance of scope and support underused.",
      "square": "Jupiter and Saturn are in square: one partner's scope clashes with the other's limits. Tension between 'let's take the risk' and 'let's slow down.' Strength: tempered, realistic achievement; the risk, frustration and swings of optimism and pessimism.",
      "trine": "Jupiter and Saturn are in trine: one brings faith and scope, the other brings realism and structure. Together they build wisely and for the long run. Strength: realistic ambition and lasting success; the risk, caution that holds back potential.",
      "opposition": "Jupiter and Saturn are in opposition: one partner's scope and the other's restraint on opposite poles — growth against caution. Strength: mature equilibrium of risk and support; the risk, seesawing between overreach and blockage."
    },
    "jupiter-uranus": {
      "conjunction": "One partner's Jupiter and the other's Uranus are in conjunction: one brings freedom, novelty, and unexpected opportunities into the other's growth. Together they're drawn to change and risk. Strength: lucky breakthroughs, originality, and optimism; the risk, restlessness and reckless change.",
      "sextile": "Jupiter and Uranus are in sextile: one gently opens fresh opportunities for the other through change. Strength: inventive optimism and good instincts; the risk, waiting for luck instead of creating it.",
      "square": "Jupiter and Uranus are in square: one partner's drive for freedom inflates the other's appetite for risk. Abrupt, adventurous moves. Strength: bold innovation; the risk, reckless change and sharp reversals.",
      "trine": "Jupiter and Uranus are in trine: one easily brings the other luck through originality and openness to the new. Strength: inventive optimism, freedom, and good fortune; the risk, taking luck for granted.",
      "opposition": "Jupiter and Uranus are in opposition: one partner's scope and the other's freedom on opposite poles — growth through the unexpected, but seesawing. Strength: development through change; the risk, restlessness and sharp turns."
    },
    "jupiter-neptune": {
      "conjunction": "One partner's Jupiter and the other's Neptune are in conjunction: one spiritualizes the other's growth, coloring the bond with idealism and compassion. Strength: inspired faith, generosity, and a shared dream; the risk, illusions and unrealistic idealism.",
      "sextile": "Jupiter and Neptune are in sextile: one partner's faith and the other's imagination gently complement each other. Strength: idealism and spiritual warmth; the risk, dreaming more than doing.",
      "square": "Jupiter and Neptune are in square: one partner's growth and the other's illusions amplify each other — inflated dreams and detachment from reality. Strength: a dream grounded through sober reckoning; the risk, illusions and unrealistic hopes.",
      "trine": "Jupiter and Neptune are in trine: one naturally joins the other's optimism with compassion and creative dreaming. Strength: inspired generosity and idealism; the risk, retreating into dreams.",
      "opposition": "Jupiter and Neptune are in opposition: one partner's faith and the other's ideals on opposite poles — inspiring but foggy. Strength: compassionate dreaming; the risk, illusions and disappointments."
    },
    "jupiter-pluto": {
      "conjunction": "One partner's Jupiter and the other's Pluto are in conjunction: one gives the other's growth depth, power, and scale — a shared pull toward transformation and great influence. Strength: powerful faith, will, and the ability to reshape; the risk, obsession with power and fanaticism.",
      "sextile": "Jupiter and Pluto are in sextile: one helps the other deepen goals and transform circumstances. Strength: focused ambition and influence; the risk, leaving this power untapped.",
      "square": "Jupiter and Pluto are in square: one partner's scope and the other's power clash. A hunger for control and fanatical drive. Strength: large-scale achievement through tension; the risk, obsession and a drive to dominate.",
      "trine": "Jupiter and Pluto are in trine: one organically joins the other's growth with depth and transforming influence. Strength: powerful faith, regeneration, and major success; the risk, underrating the pull toward power.",
      "opposition": "Jupiter and Pluto are in opposition: one partner's scope and the other's power on opposite poles. Growth through big stakes. Strength: transformation through strong confrontations; the risk, power struggle and excess."
    },
    "saturn-sun": {
      "conjunction": "One partner's Saturn and the other's Sun are in conjunction: one gives the other's life structure and seriousness — a solid, 'karmic' bond. Strength: stability, responsibility, and durability; the risk, one partner feeling pressed down, cold, or judged.",
      "sextile": "Saturn and Sun are in sextile: one gives the other stability and support without suffocation. Strength: reliability, mature support, and discipline; the risk, leaving this foundation underused.",
      "square": "Saturn and Sun are in square: one partner limits, controls, or criticizes the other's self-expression. Tension of duty and weight. Strength: growth through discipline and the test of time; the risk, coldness, suppression, and resentment.",
      "trine": "Saturn and Sun are in trine: one gives the other reliable support, wisdom, and stability without pressure. The bond is mature and lasting. Strength: support, responsibility, and solidity; the risk, a certain dryness and lack of lightness.",
      "opposition": "Saturn and Sun are in opposition: one partner's limits and the other's will on opposite poles. One is seen as authority or 'brake.' Strength: growing up through challenge; the risk, suppression, criticism, and feeling constrained."
    },
    "saturn-moon": {
      "conjunction": "One partner's Saturn and the other's Moon are in conjunction: a serious, 'karmic' combination. One gives the other's feelings support and structure, but may also cool them. Strength: reliability and lasting bonds; the risk, emotional coldness and a sense that love must be earned.",
      "sextile": "Saturn and Moon are in sextile: one gives the other's feelings mature support without pressure. Strength: reliability and emotional maturity; the risk, leaving this foundation underused.",
      "square": "Saturn and Moon are in square: one partner restrains or chills the other's feelings. A shortage of warmth and approval. Strength: growth through responsibility; the risk, coldness and feeling that love must be earned.",
      "trine": "Saturn and Moon are in trine: one gives the other emotional reliability, stability, and mature care without pressure. Strength: support, loyalty, and enduring feeling; the risk, a certain restraint and dryness.",
      "opposition": "Saturn and Moon are in opposition: one partner's warmth and the other's reserve on opposite poles. Strength: emotional maturing through challenge; the risk, coldness, distance, and feeling undervalued."
    },
    "saturn-mercury": {
      "conjunction": "One partner's Saturn and the other's Mercury are in conjunction: one gives the other's thinking structure and seriousness — conversation is measured and thorough. Strength: depth and reliability in communication; the risk, one partner feeling criticized and insecure in speech.",
      "sextile": "Saturn and Mercury are in sextile: one gives the other's ideas structure and realism without pressure. Strength: a practical, reliable dialogue; the risk, a certain dryness.",
      "square": "Saturn and Mercury are in square: one partner criticizes, limits, or undervalues the other's thinking. Insecurity and a sense of not being understood. Strength: disciplined thinking through challenge; the risk, criticism and tightness in communication.",
      "trine": "Saturn and Mercury are in trine: one gives the other's thinking maturity and structure without pressure. Strength: a considered, reliable dialogue; the risk, a certain dryness.",
      "opposition": "Saturn and Mercury are in opposition: one partner's strictness and the other's flexible mind on opposite poles. Strength: balancing discipline and freedom of thought; the risk, criticism and feeling misunderstood."
    },
    "saturn-venus": {
      "conjunction": "One partner's Saturn and the other's Venus are in conjunction: one brings seriousness, loyalty, and lasting quality to the other's love, but may also cool it. Strength: devotion, commitment, and solidity; the risk, coldness and a sense that love is conditional.",
      "sextile": "Saturn and Venus are in sextile: one gives the other's feelings reliability and maturity without pressure. Strength: loyalty and stability; the risk, leaving this foundation underused.",
      "square": "Saturn and Venus are in square: one partner restrains or undervalues the other's tenderness. Coldness, distance, and fear of rejection. Strength: loyalty through testing; the risk, emotional coldness and a feeling that love is in short supply.",
      "trine": "Saturn and Venus are in trine: one gives the other's love a solid, mature foundation without pressure. Strength: devotion, reliability, and lasting feeling; the risk, a certain restraint and dryness.",
      "opposition": "Saturn and Venus are in opposition: one partner's reserve and the other's tenderness on opposite poles. Strength: mature, tested love; the risk, coldness, distance, and feeling unloved."
    },
    "saturn-mars": {
      "conjunction": "One partner's Saturn and the other's Mars are in conjunction: one restrains and disciplines the other's energy — actions become more measured but sometimes feel blocked. Strength: endurance, control, and strategic effort; the risk, frustration, blocked energy, and a feeling of being braked.",
      "sextile": "Saturn and Mars are in sextile: one gives the other's energy discipline and steadiness without suffocation. Strength: an enduring, persistent team; the risk, leaving this focus unused.",
      "square": "Saturn and Mars are in square: one partner's limits clash with the other's drive. Irritation and blockage of action. Strength: tempered, disciplined achievement through resistance; the risk, frustration, coldness, and power struggle.",
      "trine": "Saturn and Mars are in trine: one gives the other's actions steadiness, endurance, and strategy without pressure. Strength: resilience, discipline, and a reliable result; the risk, caution that holds back boldness.",
      "opposition": "Saturn and Mars are in opposition: one partner's restraint and the other's drive on opposite poles — control against energy. Strength: disciplined force through challenge; the risk, frustration, conflict, and clashing paces."
    },
    "saturn-jupiter": {
      "conjunction": "One partner's Saturn and the other's Jupiter are in conjunction: caution and structure meet optimism and scope — together the result is realistic, grounded growth. Strength: measured ambition and lasting plans; the risk, seesawing between hope and doubt.",
      "sextile": "Saturn and Jupiter are in sextile: one partner's discipline and the other's faith easily complement each other. Strength: practical, steady growth; the risk, leaving the balance of support and scope underused.",
      "square": "Saturn and Jupiter are in square: one partner's limits clash with the other's scope. Tension between 'let's slow down' and 'let's take the risk.' Strength: tempered, realistic achievement; the risk, frustration and swings between pessimism and optimism.",
      "trine": "Saturn and Jupiter are in trine: one brings realism and structure, the other faith and scope. Together they build wisely and for the long run. Strength: realistic ambition and lasting success; the risk, caution that holds back potential.",
      "opposition": "Saturn and Jupiter are in opposition: one partner's restraint and the other's scope on opposite poles — caution against growth. Strength: mature equilibrium of support and risk; the risk, seesawing between blockage and overreach."
    },
    "saturn-saturn": {
      "conjunction": "Saturn meets Saturn — both partners share a similar sense of duty, responsibility, and structure. Usually close in age, so this is partly a generational aspect. Strength: shared values of maturity and mutual reliability; the risk, shared rigidity and excessive seriousness.",
      "sextile": "The Saturns are in sextile: the sense of responsibility and grounding gently coincides (partly generational). Strength: mature, reliable compatibility; the risk, excessive seriousness.",
      "square": "The Saturns are in square: ideas about duty, discipline, and rules diverge — often an age or generational gap. Strength: growing up through difference; the risk, mutual restriction and a fight over 'the right way.'",
      "trine": "The Saturns are in trine: the sense of responsibility and maturity is naturally in tune (partly generational). Strength: reliability, shared grounding, and durability; the risk, excessive seriousness and restraint.",
      "opposition": "The Saturns are in opposition: approaches to duty and structure are opposite — often a generational difference. Strength: complementary mature positions; the risk, mutual restriction and a heavy atmosphere."
    },
    "saturn-uranus": {
      "conjunction": "One partner's Saturn and the other's Uranus are in conjunction: structure meets a drive for freedom — the tension of 'order versus change.' Both planets are slow, making this largely a generational aspect; personally it speaks through houses and personal planets. Strength: disciplined innovation; the risk, lurching between stability and rebellion.",
      "sextile": "Saturn and Uranus are in sextile: one partner's discipline and the other's innovation gently complement each other (largely generational; personally through houses and personal planets). Strength: practical, grounded change; the risk, leaving the balance untapped.",
      "square": "Saturn and Uranus are in square: order and freedom clash (largely generational; personally through houses and personal planets). Strength: reform through friction; the risk, lurches and the clash of old and new.",
      "trine": "Saturn and Uranus are in trine: structure and innovation blend easily (largely generational; personally through houses and personal planets). Strength: practical, steady innovation; the risk, taking the balance for granted.",
      "opposition": "Saturn and Uranus are in opposition: order and freedom on opposite poles (largely generational; personally through houses and personal planets). Strength: joining tradition and change; the risk, seesawing between rigidity and chaos."
    },
    "saturn-neptune": {
      "conjunction": "One partner's Saturn and the other's Neptune are in conjunction: structure meets dream and ideal — an attempt to ground vision in reality (largely generational; personally through houses and personal planets). Strength: practical idealism; the risk, disappointment, doubt, and fog.",
      "sextile": "Saturn and Neptune are in sextile: one partner's discipline and the other's imagination gently complement each other (generational; personally through houses and personal planets). Strength: a grounded dream; the risk, leaving the vision unmanifested.",
      "square": "Saturn and Neptune are in square: one partner's realism and the other's illusions clash (largely generational; personally through houses and personal planets). Strength: a dream earned through effort; the risk, gloom and swings between fantasy and cynicism.",
      "trine": "Saturn and Neptune are in trine: structure and imagination blend easily — the dream takes shape (largely generational; personally through houses and personal planets). Strength: practical idealism; the risk, the vision staying foggy without effort.",
      "opposition": "Saturn and Neptune are in opposition: reality and ideal on opposite poles (largely generational; personally through houses and personal planets). Strength: a dream tested by reality; the risk, doubt and swings of illusion and skepticism."
    },
    "saturn-pluto": {
      "conjunction": "One partner's Saturn and the other's Pluto are in conjunction: structure fuses with deep power — heavy transformation and rebuilding through crisis (largely generational; personally through houses and personal planets). Strength: endurance and the power to rebuild; the risk, harshness, control, and crushing weight.",
      "sextile": "Saturn and Pluto are in sextile: one partner's discipline and the other's power gently complement each other (generational; personally through houses and personal planets). Strength: dogged resilience and deep work; the risk, leaving the power unused.",
      "square": "Saturn and Pluto are in square: structure and power clash (largely generational; personally through houses and personal planets). Strength: iron endurance through crisis; the risk, harshness, ruthlessness, and a sense of heavy blockage.",
      "trine": "Saturn and Pluto are in trine: structure and deep force blend easily (largely generational; personally through houses and personal planets). Strength: endurance and steady transforming power; the risk, underrating one's own relentlessness.",
      "opposition": "Saturn and Pluto are in opposition: structure and power on opposite poles (largely generational; personally through houses and personal planets). Strength: deep resilience under pressure; the risk, power struggle, harshness, and exhausting conflict."
    },
    "uranus-sun": {
      "conjunction": "One partner's Uranus and the other's Sun are in conjunction: one brings freshness, freedom, and the unexpected into the other's life, jolting and awakening them. Strength: vividness, originality, and the pull of novelty; the risk, instability and a shortage of grounding.",
      "sextile": "Uranus and Sun are in sextile: one gently inspires the other toward the new and unconventional. Strength: a creative impulse and mutual freedom; the risk, leaving the spark undeveloped.",
      "square": "Uranus and Sun are in square: one partner's drive for freedom and change unsettles the other's stability. Sudden disruptions and unpredictability are possible. Strength: awakening and dynamism; the risk, instability and sharp reversals.",
      "trine": "Uranus and Sun are in trine: one easily brings novelty and freedom into the other's life without wrecking it. Strength: originality, lightness, and mutual space; the risk, mistaking freedom for indifference.",
      "opposition": "Uranus and Sun are in opposition: one partner's pull toward freedom opposes the other's need for stability. The attraction is exciting but seesawing. Strength: awakening through difference; the risk, instability and growing distance."
    },
    "uranus-moon": {
      "conjunction": "One partner's Uranus and the other's Moon are in conjunction: one shakes up the other's feelings, bringing novelty and unpredictability. Strength: liveliness, freshness, and excitement; the risk, instability and a shortage of reliability.",
      "sextile": "Uranus and Moon are in sextile: one gently refreshes the other's feelings. A lightness and freedom flows between them. Strength: a lively, never-boring warmth; the risk, leaving the spark without depth.",
      "square": "Uranus and Moon are in square: one partner's drive for freedom unsettles the other's need for stability. Strength: an awakening of feeling; the risk, unpredictability and emotional instability.",
      "trine": "Uranus and Moon are in trine: one easily brings freshness and freedom into the other's feelings without destroying closeness. Strength: liveliness, ease, and mutual space; the risk, mistaking freedom for coolness.",
      "opposition": "Uranus and Moon are in opposition: one partner's pull toward freedom and the other's need for closeness on opposite poles. Exciting but seesawing attraction. Strength: awakening through difference; the risk, instability and growing distance."
    },
    "uranus-mercury": {
      "conjunction": "One partner's Uranus and the other's Mercury are in conjunction: one jolts the other's mind with unexpected ideas. Conversation crackles with flashes of insight. Strength: originality and intellectual excitement; the risk, nervousness and unpredictability.",
      "sextile": "Uranus and Mercury are in sextile: one tosses fresh ideas to the other. Conversations are lively and never boring. Strength: inventiveness and openness to the new; the risk, leaving the spark without follow-through.",
      "square": "Uranus and Mercury are in square: one partner's unconventionality unsettles the other's thinking. Arguments and sharpness. Strength: originality through friction; the risk, nervousness and intellectual rebellion.",
      "trine": "Uranus and Mercury are in trine: one easily inspires the other's mind toward the new without confusion. Strength: insight, flexibility, and a never-boring dialogue; the risk, taking ease for granted.",
      "opposition": "Uranus and Mercury are in opposition: one partner's originality and the other's orderly thinking on opposite poles. Strength: mutual awakening; the risk, arguments and inconsistency."
    },
    "uranus-venus": {
      "conjunction": "One partner's Uranus and the other's Venus are in conjunction: one brings excitement, novelty, and freedom into the other's love life. The attraction is vivid and sudden. Strength: a spark, originality, and a passion for the new; the risk, instability and inconstancy.",
      "sextile": "Uranus and Venus are in sextile: one gently refreshes the other's feelings, adding lightness and freedom. Strength: a lively, never-boring tenderness; the risk, leaving the spark without depth.",
      "square": "Uranus and Venus are in square: one partner's drive for freedom unsettles the other's need for closeness. Sudden attractions and coolings. Strength: excitement and novelty; the risk, inconstancy and breakups.",
      "trine": "Uranus and Venus are in trine: one easily brings freshness and freedom into the other's love without destroying closeness. Strength: originality, lightness, and attraction; the risk, valuing freedom over depth.",
      "opposition": "Uranus and Venus are in opposition: one partner's drive for freedom and the other's tenderness on opposite poles. Exciting but seesawing attraction. Strength: a vivid, awakening bond; the risk, inconstancy."
    },
    "uranus-mars": {
      "conjunction": "One partner's Uranus and the other's Mars are in conjunction: one gives the other's actions sudden daring and freedom — energy crackles. Strength: courage, originality, and an electrifying drive; the risk, impulsiveness, recklessness, and destructive urges.",
      "sextile": "Uranus and Mars are in sextile: one gently adds inventiveness and drive to the other's actions. Strength: bold, original initiative; the risk, needing a trigger to activate the charge.",
      "square": "Uranus and Mars are in square: one partner's drive for freedom makes the other's energy impulsive and rebellious. Sudden outbursts and resistance to limits. Strength: daring originality; the risk, recklessness and destructive urges.",
      "trine": "Uranus and Mars are in trine: one easily adds courage, speed, and originality to the other's actions. Strength: bravery, innovation, and quick response; the risk, taking boldness for granted.",
      "opposition": "Uranus and Mars are in opposition: one partner's freedom and the other's drive on opposite poles — dynamic but explosive. Strength: an awakening, electrifying energy; the risk, clashes and sudden breaks."
    },
    "uranus-jupiter": {
      "conjunction": "One partner's Uranus and the other's Jupiter are in conjunction: one brings freedom, novelty, and unexpected opportunities into the other's growth. Together they're drawn to change and risk. Strength: lucky breakthroughs, originality, and optimism; the risk, restlessness and reckless change.",
      "sextile": "Uranus and Jupiter are in sextile: one gently opens fresh opportunities for the other through change. Strength: inventive optimism and good instincts; the risk, waiting for luck instead of creating it.",
      "square": "Uranus and Jupiter are in square: one partner's drive for freedom inflates the other's appetite for risk. Abrupt, adventurous moves. Strength: bold innovation; the risk, reckless change and sharp reversals.",
      "trine": "Uranus and Jupiter are in trine: one easily brings the other luck through originality and openness to the new. Strength: inventive optimism, freedom, and good fortune; the risk, taking luck for granted.",
      "opposition": "Uranus and Jupiter are in opposition: one partner's freedom and the other's scope on opposite poles — growth through the unexpected, but seesawing. Strength: development through change; the risk, restlessness and sharp turns."
    },
    "uranus-saturn": {
      "conjunction": "One partner's Uranus and the other's Saturn are in conjunction: a drive for freedom meets structure — the tension of 'change versus order' (largely generational; personally through houses and personal planets). Strength: disciplined innovation; the risk, lurching between rebellion and stability.",
      "sextile": "Uranus and Saturn are in sextile: one partner's innovation and the other's discipline gently complement each other (generational; personally through houses and personal planets). Strength: practical, grounded change; the risk, leaving the balance untapped.",
      "square": "Uranus and Saturn are in square: freedom and order clash (largely generational; personally through houses and personal planets). Strength: reform through friction; the risk, lurches and the clash of new and old.",
      "trine": "Uranus and Saturn are in trine: innovation and structure blend easily (largely generational; personally through houses and personal planets). Strength: practical, steady innovation; the risk, taking the balance for granted.",
      "opposition": "Uranus and Saturn are in opposition: freedom and order on opposite poles (largely generational; personally through houses and personal planets). Strength: joining change and tradition; the risk, seesawing between chaos and rigidity."
    },
    "uranus-uranus": {
      "conjunction": "Uranus meets Uranus — both partners are from the same generation with a shared sense of freedom and unconventionality. Almost entirely a generational aspect; personally it speaks through houses and personal planets. Strength: shared values of freedom and progress; the risk, shared instability and rebelliousness.",
      "sextile": "The Uranuses are in sextile: neighboring generations with resonant innovative spirits (generational; personally through houses and personal planets). Strength: an easy commonality of outlook on freedom; the risk, superficiality outside the personal context.",
      "square": "The Uranuses are in square: different generations with clashing attitudes toward freedom and change (generational; personally through houses and personal planets). Strength: meeting different views on the new; the risk, generational value conflict.",
      "trine": "The Uranuses are in trine: generations with a harmonious, resonant spirit of innovation and freedom (generational; personally through houses and personal planets). Strength: shared progressive outlook; the risk, without personal contacts the influence stays general.",
      "opposition": "The Uranuses are in opposition: generations with opposite attitudes toward freedom (a notable age gap; generational; personally through houses and personal planets). Strength: dialogue across different eras; the risk, value clash."
    },
    "uranus-neptune": {
      "conjunction": "One partner's Uranus and the other's Neptune are in conjunction: innovation fuses with dreaming — a blend of progress, technology, and spiritual ideals (almost entirely generational; personally through houses and personal planets). Strength: visionary creativity and awakening; the risk, unstable ideals and confusion.",
      "sextile": "Uranus and Neptune are in sextile: one partner's innovation and the other's imagination gently complement each other (generational; personally through houses and personal planets). Strength: visionary creativity; the risk, vagueness outside the personal context.",
      "square": "Uranus and Neptune are in square: change and ideals in tension (generational; personally through houses and personal planets). Strength: creative breakthroughs through friction; the risk, instability and disappointed ideals.",
      "trine": "Uranus and Neptune are in trine: innovation and dreaming are in tune (generational; personally through houses and personal planets). Strength: inspired innovation; the risk, without personal focus the influence stays foggy.",
      "opposition": "Uranus and Neptune are in opposition: innovation and ideal on opposite poles (generational; personally through houses and personal planets). Strength: tension that gives birth to vision; the risk, instability and illusions."
    },
    "uranus-pluto": {
      "conjunction": "One partner's Uranus and the other's Pluto are in conjunction: radical change and deep transformation fuse — an era of upheaval (almost entirely generational; personally through houses and personal planets). Strength: the power of renewal and breakthrough; the risk, extremism and chaotic change.",
      "sextile": "Uranus and Pluto are in sextile: one partner's innovation and the other's deep power gently complement each other (generational; personally through houses and personal planets). Strength: constructive, large-scale change; the risk, loss of focus outside the personal context.",
      "square": "Uranus and Pluto are in square: change and power in tension (generational; personally through houses and personal planets). Strength: revolutionary energy; the risk, extremism and destructiveness.",
      "trine": "Uranus and Pluto are in trine: innovation and transformation are in tune (generational; personally through houses and personal planets). Strength: powerful, constructive change; the risk, without personal focus the force stays impersonal.",
      "opposition": "Uranus and Pluto are in opposition: freedom and power on opposite poles (generational; personally through houses and personal planets). Strength: transforming tension; the risk, extremism and destructive conflict."
    },
    "neptune-sun": {
      "conjunction": "One partner's Neptune and the other's Sun are in conjunction: one sees an ideal in the other, wrapping them in romance and inspiration. The bond is subtle and spiritual. Strength: tenderness, creativity, and spiritual attraction; the risk, illusions and disappointment when the fog clears.",
      "sextile": "Neptune and Sun are in sextile: one gently inspires and spiritualizes the other. Strength: compassion, creativity, and sensitivity; the risk, vagueness without grounding.",
      "square": "Neptune and Sun are in square: one partner's view of the other is blurred by illusions. Misunderstanding and disappointment are possible. Strength: creative and spiritual inspiration; the risk, fog, idealization, and lost clarity.",
      "trine": "Neptune and Sun are in trine: one naturally inspires the other, bringing tenderness, dreaming, and spiritual closeness. Strength: compassion, creativity, and a fine soul connection; the risk, idealization and drifting from reality.",
      "opposition": "Neptune and Sun are in opposition: one partner's ideals and the other's personality on opposite poles. Strong romantic-spiritual attraction with a risk of fog. Strength: inspiration and compassion; the risk, illusions and blurred boundaries."
    },
    "neptune-moon": {
      "conjunction": "One partner's Neptune and the other's Moon are in conjunction: a subtle, dreamy emotional bond. One feels the other almost telepathically, enveloping them in compassion and romance. Strength: empathy, tenderness, and spiritual unity; the risk, illusions, blurred boundaries, and codependence.",
      "sextile": "Neptune and Moon are in sextile: one gently attunes to and spiritualizes the other's feelings. Strength: sensitivity, compassion, and creative closeness; the risk, vagueness without grounding.",
      "square": "Neptune and Moon are in square: one partner's illusions and the other's feelings get confused. Misunderstanding and disappointment are possible. Strength: deep empathy; the risk, fog and lost emotional boundaries.",
      "trine": "Neptune and Moon are in trine: one naturally empathizes with the other, creating a tender, subtle soul connection. Strength: empathy, romance, and spiritual closeness; the risk, drifting into dreams and blurred boundaries.",
      "opposition": "Neptune and Moon are in opposition: one partner's ideals and the other's feelings on opposite poles. Strength: compassion and a soul connection; the risk, illusions and codependence."
    },
    "neptune-mercury": {
      "conjunction": "One partner's Neptune and the other's Mercury are in conjunction: one wraps the other's thinking in imagination and poetry. Conversation is vivid but hazy. Strength: a creative, imaginative exchange and sensitivity; the risk, misunderstanding and deceptive expectations.",
      "sextile": "Neptune and Mercury are in sextile: one gently adds intuition and imagery to the other's thinking. Strength: creative, sensitive communication; the risk, vagueness.",
      "square": "Neptune and Mercury are in square: one partner's illusions and the other's logic get confused. Misunderstanding and things left unsaid. Strength: creative inspiration; the risk, fog and distorted perception of each other's words.",
      "trine": "Neptune and Mercury are in trine: one naturally adds subtlety and intuition to the other's thinking. Strength: an imaginative, attuned, creative dialogue; the risk, drifting into fantasy.",
      "opposition": "Neptune and Mercury are in opposition: one partner's imagination and the other's logic on opposite poles. Strength: joining intuition and reason; the risk, misunderstanding and illusions."
    },
    "neptune-venus": {
      "conjunction": "One partner's Neptune and the other's Venus are in conjunction: an elevated, romantic bond. One wraps the other's love in dream, compassion, and ideal. Strength: tenderness, creativity, and spiritual romance; the risk, illusions, idealization, and disappointment.",
      "sextile": "Neptune and Venus are in sextile: one gently spiritualizes the other's love, adding tenderness and imagination. Strength: compassion, romance, and creativity; the risk, vagueness without grounding.",
      "square": "Neptune and Venus are in square: one partner's illusions and the other's love get confused. Idealization, things left unsaid, disappointments. Strength: a tender, compassionate bond; the risk, deception, illusions, and rescuing.",
      "trine": "Neptune and Venus are in trine: one naturally spiritualizes the other's love, bringing romance and a fine soul connection. Strength: tenderness, creativity, and spiritual closeness; the risk, idealization.",
      "opposition": "Neptune and Venus are in opposition: one partner's ideals and the other's love on opposite poles. Strength: compassion and romance; the risk, illusions, idealization, and codependence."
    },
    "neptune-mars": {
      "conjunction": "One partner's Neptune and the other's Mars are in conjunction: one blurs and spiritualizes the other's actions — energy flows by inspiration rather than force. Strength: creative, attuned, inspired action; the risk, a dip in motivation, unclear goals, and deceptive expectations.",
      "sextile": "Neptune and Mars are in sextile: one gently inspires the other's actions, adding intuition and creativity. Strength: inspired, purposeful activity; the risk, letting energy dissolve.",
      "square": "Neptune and Mars are in square: one partner's illusions and the other's drive get confused. Unclear goals and wasted action. Strength: inspired action when grounded; the risk, weak motivation and disappointments.",
      "trine": "Neptune and Mars are in trine: one naturally inspires the other's actions, giving them creativity and intuition. Strength: artistic, purposeful, attuned activity; the risk, drifting from concrete goals.",
      "opposition": "Neptune and Mars are in opposition: one partner's ideals and the other's drive on opposite poles — inspiration against action. Strength: inspired, compassionate energy; the risk, confusion and action going nowhere."
    },
    "neptune-jupiter": {
      "conjunction": "One partner's Neptune and the other's Jupiter are in conjunction: one spiritualizes the other's growth, coloring the bond with idealism and compassion. Strength: inspired faith, generosity, and a shared dream; the risk, illusions and unrealistic idealism.",
      "sextile": "Neptune and Jupiter are in sextile: one partner's imagination and the other's faith gently complement each other. Strength: idealism and spiritual warmth; the risk, dreaming more than doing.",
      "square": "Neptune and Jupiter are in square: one partner's illusions and the other's growth amplify each other — inflated dreams and detachment from reality. Strength: a dream grounded through sober reckoning; the risk, illusions and unrealistic hopes.",
      "trine": "Neptune and Jupiter are in trine: one naturally joins the other's optimism with compassion and creative dreaming. Strength: inspired generosity and idealism; the risk, retreating into dreams.",
      "opposition": "Neptune and Jupiter are in opposition: one partner's ideals and the other's faith on opposite poles — inspiring but foggy. Strength: compassionate dreaming; the risk, illusions and disappointments."
    },
    "neptune-saturn": {
      "conjunction": "One partner's Neptune and the other's Saturn are in conjunction: dream and ideal meet structure — an attempt to ground vision in reality (largely generational; personally through houses and personal planets). Strength: practical idealism; the risk, disappointment, doubt, and fog.",
      "sextile": "Neptune and Saturn are in sextile: one partner's imagination and the other's discipline gently complement each other (generational; personally through houses and personal planets). Strength: a grounded dream; the risk, leaving the vision unmanifested.",
      "square": "Neptune and Saturn are in square: one partner's illusions and the other's realism clash (largely generational; personally through houses and personal planets). Strength: a dream earned through effort; the risk, gloom and swings between fantasy and cynicism.",
      "trine": "Neptune and Saturn are in trine: imagination and structure blend easily — the dream takes shape (largely generational; personally through houses and personal planets). Strength: practical idealism; the risk, the vision staying foggy without effort.",
      "opposition": "Neptune and Saturn are in opposition: ideal and reality on opposite poles (largely generational; personally through houses and personal planets). Strength: a dream tested by reality; the risk, doubt and swings of illusion and skepticism."
    },
    "neptune-uranus": {
      "conjunction": "One partner's Neptune and the other's Uranus are in conjunction: dreaming fuses with innovation — a blend of spiritual ideals, progress, and technology (almost entirely generational; personally through houses and personal planets). Strength: visionary creativity and awakening; the risk, unstable ideals and confusion.",
      "sextile": "Neptune and Uranus are in sextile: one partner's imagination and the other's innovation gently complement each other (generational; personally through houses and personal planets). Strength: visionary creativity; the risk, vagueness outside the personal context.",
      "square": "Neptune and Uranus are in square: ideals and change in tension (generational; personally through houses and personal planets). Strength: creative breakthroughs through friction; the risk, instability and disappointed ideals.",
      "trine": "Neptune and Uranus are in trine: dreaming and innovation are in tune (generational; personally through houses and personal planets). Strength: inspired innovation; the risk, without personal focus the influence stays foggy.",
      "opposition": "Neptune and Uranus are in opposition: ideal and innovation on opposite poles (generational; personally through houses and personal planets). Strength: tension that gives birth to vision; the risk, instability and illusions."
    },
    "neptune-neptune": {
      "conjunction": "Neptune meets Neptune — both partners are from the same generation with shared ideals, dreams, and spiritual attunement. Almost entirely a generational aspect; personally it speaks through houses and personal planets. Strength: shared faith and subtle mutual understanding; the risk, shared illusions and drifting from reality.",
      "sextile": "The Neptunes are in sextile: neighboring generations with resonant dreams and sensitivity (generational; personally through houses and personal planets). Strength: a shared spiritual and creative wave; the risk, vagueness outside the personal context.",
      "square": "The Neptunes are in square: different generations with clashing ideals and illusions (generational; personally through houses and personal planets). Strength: meeting different visions; the risk, mutual illusions and misread values.",
      "trine": "The Neptunes are in trine: generations with harmonious, resonant ideals and spirituality (generational; personally through houses and personal planets). Strength: shared inspiration and compassion; the risk, without personal contact the influence stays general.",
      "opposition": "The Neptunes are in opposition: generations with opposite ideals and dreams (generational; personally through houses and personal planets). Strength: dialogue across different spiritual eras; the risk, mutual illusions."
    },
    "neptune-pluto": {
      "conjunction": "One partner's Neptune and the other's Pluto are in conjunction: ideals fuse with deep force — a rare generational combination that reshapes the collective psyche; personally through houses and personal planets. Strength: deep spiritual and cultural renewal; the risk, collective illusions beyond the personal level.",
      "sextile": "Neptune and Pluto are in sextile: one partner's imagination and the other's power gently complement each other (generational; personally through houses and personal planets). Strength: a deep creative-spiritual potential; the risk, the influence staying impersonal and diffuse.",
      "square": "Neptune and Pluto are in square: ideals and power in tension (a rare generational combination; personally through houses and personal planets). Strength: deep transformation of faith; the risk, collective illusions and disorientation.",
      "trine": "Neptune and Pluto are in trine: imagination and transformation are in tune (a long generational aspect; personally through houses and personal planets). Strength: deep regenerative vision; the risk, without personal focus the influence stays collective.",
      "opposition": "Neptune and Pluto are in opposition: ideals and power on opposite poles (an extremely rare generational combination; in the chart it works mainly through houses and personal planets). Strength: an epochal transformation of values; the risk, the influence felt collectively rather than personally."
    },
    "pluto-sun": {
      "conjunction": "One partner's Pluto and the other's Sun are in conjunction: a deep, transforming influence on the other's identity — attraction that is powerful, almost magnetic. Strength: depth, passion, and mutual transformation; the risk, power struggles, control, and obsession.",
      "sextile": "Pluto and Sun are in sextile: one helps the other grow and change through depth. The influence is gentle. Strength: transformation, willpower, and support of change; the risk, leaving the potential untapped.",
      "square": "Pluto and Sun are in square: one partner seeks to influence and control the other. Strong attraction and a tense clash of wills. Strength: deep transformation through crisis; the risk, manipulation and power games.",
      "trine": "Pluto and Sun are in trine: one powerfully but organically transforms the other, strengthening them through change. Strength: depth, regeneration, and mutual empowerment; the risk, underrating the bond's intensity.",
      "opposition": "Pluto and Sun are in opposition: one partner's force and the other's will on opposite poles — powerful attraction and a fight for control. Strength: deep transformation through another; the risk, control, manipulation, and obsessive intensity."
    },
    "pluto-moon": {
      "conjunction": "One partner's Pluto and the other's Moon are in conjunction: a deep, all-encompassing emotional bond. One powerfully influences the other's feelings, awakening passion and transformation. Strength: depth, intensity, and emotional transformation; the risk, jealousy, control, and obsession.",
      "sextile": "Pluto and Moon are in sextile: one helps the other live through and renew deep feelings. Strength: emotional depth and support of change; the risk, leaving the potential untapped.",
      "square": "Pluto and Moon are in square: one partner seeks to control or intensely influence the other's feelings. Strength: transformation through crisis; the risk, manipulation, jealousy, and obsessiveness.",
      "trine": "Pluto and Moon are in trine: one deeply but organically transforms the other's feelings. Strength: emotional depth and regeneration; the risk, underrating the power of the attachment.",
      "opposition": "Pluto and Moon are in opposition: one partner's deep force and the other's feelings on opposite poles. Strength: transformation through deep bonds; the risk, jealousy and emotional extremes."
    },
    "pluto-mercury": {
      "conjunction": "One partner's Pluto and the other's Mercury are in conjunction: one gives the other's thinking depth and intensity — conversations cut to the core. Strength: penetrating, transforming exchange; the risk, pressure and attempts to control the other's thinking.",
      "sextile": "Pluto and Mercury are in sextile: one helps the other's mind dig deeper and see what's hidden. Strength: insight and the power to persuade; the risk, leaving the depth untapped.",
      "square": "Pluto and Mercury are in square: one partner pressures the other's thinking, pushes views, or manipulates with words. Strength: deep transformation of thought through challenge; the risk, manipulation, suspicion, and power-charged arguments.",
      "trine": "Pluto and Mercury are in trine: one organically deepens the other's thinking, helping them see to the essence and persuade. Strength: insight, concentration, and influence; the risk, underrating the intensity of conversations.",
      "opposition": "Pluto and Mercury are in opposition: one partner's power and the other's mind on opposite poles. Strength: a transforming exchange; the risk, verbal power games and suspicion."
    },
    "pluto-venus": {
      "conjunction": "One partner's Pluto and the other's Venus are in conjunction: a deep, all-consuming attraction. One influences the other's love with enormous force — passion transforms. Strength: magnetism, depth, and passionate closeness; the risk, jealousy, possessiveness, and control.",
      "sextile": "Pluto and Venus are in sextile: one helps the other's love deepen and renew through honesty. Strength: magnetism and emotional depth; the risk, leaving the intensity untapped.",
      "square": "Pluto and Venus are in square: one partner seeks to possess and control the other's feelings. Obsessive attraction and jealousy. Strength: deep, transforming passion; the risk, control, manipulation, and possessiveness.",
      "trine": "Pluto and Venus are in trine: one deeply but organically transforms the other's love, bringing passion and depth. Strength: magnetism, passion, and transforming closeness; the risk, underrating the power of the attachment.",
      "opposition": "Pluto and Venus are in opposition: one partner's power and the other's love on opposite poles. Powerful attraction and a fight for control. Strength: a deep, transforming bond; the risk, jealousy, possessiveness, and extremes."
    },
    "pluto-mars": {
      "conjunction": "One partner's Pluto and the other's Mars are in conjunction: one gives the other's actions enormous force, intensity, and will. The bond is powerful and transforming. Strength: iron will, endurance, and passion; the risk, power struggles, ruthlessness, and destructive intensity.",
      "sextile": "Pluto and Mars are in sextile: one helps the other's actions gain depth and transforming power. Strength: intense, effective willpower; the risk, leaving this force untapped.",
      "square": "Pluto and Mars are in square: one partner's power and the other's drive clash. Power struggles and obsessive intensity. Strength: the deepest willpower through crisis; the risk, ruthlessness, domination, and self-destructive intensity.",
      "trine": "Pluto and Mars are in trine: one organically deepens and amplifies the other's actions, bringing endurance and will. Strength: powerful will, regeneration, and resilience; the risk, underrating the bond's intensity.",
      "opposition": "Pluto and Mars are in opposition: one partner's power and the other's drive on opposite poles. Powerful attraction and a fight for control. Strength: transforming willpower through confrontation; the risk, power games, ruthlessness, and extremes."
    },
    "pluto-jupiter": {
      "conjunction": "One partner's Pluto and the other's Jupiter are in conjunction: one gives the other's growth depth, power, and scale — a shared pull toward transformation and great influence. Strength: powerful faith, will, and the ability to reshape; the risk, obsession with power and fanaticism.",
      "sextile": "Pluto and Jupiter are in sextile: one helps the other deepen goals and transform circumstances. Strength: focused ambition and influence; the risk, leaving this power untapped.",
      "square": "Pluto and Jupiter are in square: one partner's power and the other's scope clash. A hunger for control and fanatical drive. Strength: large-scale achievement through tension; the risk, obsession and a drive to dominate.",
      "trine": "Pluto and Jupiter are in trine: one organically joins the other's growth with depth and transforming influence. Strength: powerful faith, regeneration, and major success; the risk, underrating the pull toward power.",
      "opposition": "Pluto and Jupiter are in opposition: one partner's power and the other's scope on opposite poles. Growth through big stakes. Strength: transformation through strong confrontations; the risk, power struggle and excess."
    },
    "pluto-saturn": {
      "conjunction": "One partner's Pluto and the other's Saturn are in conjunction: deep power fuses with structure — heavy transformation and rebuilding through crisis (largely generational; personally through houses and personal planets). Strength: endurance and the power to rebuild; the risk, harshness, control, and crushing weight.",
      "sextile": "Pluto and Saturn are in sextile: one partner's power and the other's discipline gently complement each other (generational; personally through houses and personal planets). Strength: dogged resilience and deep work; the risk, leaving the power unused.",
      "square": "Pluto and Saturn are in square: power and structure clash (largely generational; personally through houses and personal planets). Strength: iron endurance through crisis; the risk, harshness, ruthlessness, and a sense of heavy blockage.",
      "trine": "Pluto and Saturn are in trine: deep force and structure blend easily (largely generational; personally through houses and personal planets). Strength: endurance and steady transforming power; the risk, underrating one's own relentlessness.",
      "opposition": "Pluto and Saturn are in opposition: power and structure on opposite poles (largely generational; personally through houses and personal planets). Strength: deep resilience under pressure; the risk, power struggle, harshness, and exhausting conflict."
    },
    "pluto-uranus": {
      "conjunction": "One partner's Pluto and the other's Uranus are in conjunction: deep transformation fuses with radical change — an era of upheaval (almost entirely generational; personally through houses and personal planets). Strength: the power of renewal and breakthrough; the risk, extremism and chaotic change.",
      "sextile": "Pluto and Uranus are in sextile: one partner's deep power and the other's innovation gently complement each other (generational; personally through houses and personal planets). Strength: constructive, large-scale change; the risk, loss of focus outside the personal context.",
      "square": "Pluto and Uranus are in square: power and change in tension (generational; personally through houses and personal planets). Strength: revolutionary energy; the risk, extremism, destructiveness, and abrupt breaks.",
      "trine": "Pluto and Uranus are in trine: transformation and innovation are in tune (generational; personally through houses and personal planets). Strength: powerful, constructive change; the risk, without personal focus the force stays impersonal.",
      "opposition": "Pluto and Uranus are in opposition: power and freedom on opposite poles (generational; personally through houses and personal planets). Strength: transforming tension; the risk, extremism and destructive conflict."
    },
    "pluto-neptune": {
      "conjunction": "One partner's Pluto and the other's Neptune are in conjunction: deep transformation fuses with ideals — a rare generational combination that reshapes the collective psyche; personally through houses and personal planets. Strength: deep spiritual and cultural renewal; the risk, collective illusions beyond the personal level.",
      "sextile": "Pluto and Neptune are in sextile: one partner's power and the other's imagination gently complement each other (generational; personally through houses and personal planets). Strength: a deep creative-spiritual potential; the risk, the influence staying impersonal and diffuse.",
      "square": "Pluto and Neptune are in square: power and ideals in tension (a rare generational combination; personally through houses and personal planets). Strength: deep transformation of faith; the risk, collective illusions and disorientation.",
      "trine": "Pluto and Neptune are in trine: transformation and imagination are in tune (a long generational aspect; personally through houses and personal planets). Strength: deep regenerative vision; the risk, without personal focus the influence stays collective.",
      "opposition": "Pluto and Neptune are in opposition: power and ideals on opposite poles (an extremely rare generational combination; in the chart it works mainly through houses and personal planets). Strength: an epochal transformation of values; the risk, the influence felt collectively rather than personally."
    },
    "pluto-pluto": {
      "conjunction": "Pluto meets Pluto — both partners are from the same generation with a shared deep theme of power, crisis, and transformation. Almost entirely a generational aspect; personally it speaks through houses and personal planets. Strength: a shared capacity for rebirth; the risk, shared obsessiveness and extremes.",
      "sextile": "The Plutos are in sextile: neighboring generations with resonant deep power (generational; personally through houses and personal planets). Strength: shared potential for transformation; the risk, loss of focus outside the personal context.",
      "square": "The Plutos are in square: different generations with clashing attitudes toward power and change (generational; personally through houses and personal planets). Strength: meeting different forces of transformation; the risk, generational value struggle.",
      "trine": "The Plutos are in trine: generations with harmonious, resonant deep power (generational; personally through houses and personal planets). Strength: shared potential for deep renewal; the risk, without personal contact the influence stays general.",
      "opposition": "The Plutos are in opposition: generations with opposite attitudes toward power (a large age gap; generational; personally through houses and personal planets). Strength: dialogue across different eras of transformation; the risk, a power struggle of values."
    },
    "moon-sun": {
      "conjunction": "One partner's Moon and the other's Sun are in conjunction: a warm, nourishing combination. One partner instinctively cares for the other, while the second's brightness warms the first's emotional world. Strength: mutual support, warmth, and a feeling of 'home' together; the risk, emotional dependence and merging.",
      "sextile": "Moon and Sun are in sextile: one partner's feelings and the other's will find easy common ground. A natural warmth flows between them. Strength: comfort, understanding, and tenderness; the risk, leaving the connection at a pleasant but shallow level.",
      "square": "Moon and Sun are in square: one partner's emotional needs clash with the other's self-expression. Strength: growth through the friction of adjustment; the risk, friction in daily moods, a sense of not being understood.",
      "trine": "Moon and Sun are in trine: one partner's feelings naturally support the other's will. Easy to create warmth and mutual care. Strength: gentleness, harmony, and mutual support; the risk, slackness and passivity.",
      "opposition": "Moon and Sun are in opposition: one brings feeling and receptivity, the other will and activity — on opposite poles. Strength: a polar but powerful connection; the risk, misreading each other and swings between closeness and distance."
    }
  }
},
  ru: {
  "aspects": {
    "sun-sun": {
      "conjunction": "Солнце встречает Солнце — партнёры рождены в одном знаке и воспринимают жизнь схожим образом. Много общего в целях, стиле и самовыражении. Сила — взаимное понимание и поддержка; риск — соперничество и нехватка дополняющей разницы.",
      "sextile": "Солнцам партнёров легко находить общий язык: цели и стиль жизни мягко созвучны. Сила — приятное взаимопонимание без усилий; риск — оставить контакт поверхностным.",
      "square": "Солнца в квадрате: воля и стиль самовыражения партнёров сталкиваются. Каждый тянет в свою сторону — возникает борьба за лидерство. Сила — рост через различие и вызов; риск — упрямство и постоянное соперничество.",
      "trine": "Солнца в тригоне: энергии партнёров естественно созвучны. Легко поддерживать и вдохновлять друг друга. Сила — тёплое взаимопонимание и общий поток; риск — принимать гармонию как должное.",
      "opposition": "Солнца в оппозиции: партнёры рождены в противоположных знаках. Притяжение через непохожесть — каждый видит в другом то, чего не хватает себе. Сила — яркая динамика и взаимное дополнение; риск — упрямство и полярные взгляды."
    },
    "sun-moon": {
      "conjunction": "Солнце одного партнёра встречает Луну другого — одно из лучших сочетаний для близости. Личность и воля одного естественно согревают и питают эмоциональный мир другого. Сила — глубокое взаимопонимание и ощущение «дома» рядом; риск — эмоциональная зависимость и слияние.",
      "sextile": "Солнце и Луна партнёров мягко согласуются: между ними тепло и взаимная поддержка без напряжения. Сила — комфорт, понимание и нежность; риск — недоиспользовать потенциал связи.",
      "square": "Солнце одного задевает Луну другого: самовыражение одного расходится с эмоциональными нуждами другого. Сила — рост через притирку и взаимное приспособление; риск — трение быта и настроений, ощущение непонятости.",
      "trine": "Солнце и Луна в тригоне: воля одного естественно поддерживает чувства другого. Легко создавать уют и взаимную заботу. Сила — тепло, гармония и взаимная поддержка; риск — расслабленность и пассивность.",
      "opposition": "Солнце и Луна в оппозиции: между партнёрами сильное притяжение через контраст — один привносит рациональное и активное, другой — эмоциональное и принимающее. Сила — полярная, но мощная связь; риск — непонимание и качели тепла и холода."
    },
    "sun-mercury": {
      "conjunction": "Солнце одного и Меркурий другого в соединении: общение живое и личное, идеи естественно перетекают в совместные планы. Сила — лёгкий диалог и взаимный интерес; риск — один доминирует в разговоре.",
      "sextile": "Солнце и Меркурий мягко созвучны: партнёрам легко понимать и поддерживать идеи друг друга. Сила — приятный, продуктивный обмен; риск — остаться на поверхности.",
      "square": "Солнце и Меркурий в квадрате: воля одного и мышление другого сталкиваются. Споры, ощущение непонятости, разные взгляды на одно и то же. Сила — острый, развивающий диалог; риск — словесные конфликты и упрямство.",
      "trine": "Солнце и Меркурий в тригоне: мысли и планы партнёров легко согласуются. Общение течёт естественно. Сила — ясный, поддерживающий диалог; риск — принимать лёгкость как должное.",
      "opposition": "Солнце и Меркурий в оппозиции: взгляды и стиль мышления партнёров расходятся, но это стимулирует дискуссию. Сила — расширение кругозора через другого; риск — споры и взаимное непонимание."
    },
    "sun-venus": {
      "conjunction": "Солнце одного и Венера другого в соединении: тёплое, притягивающее сочетание. Один партнёр восхищается и нравится другому с первого взгляда. Сила — симпатия, тепло и естественное притяжение; риск — идеализация и потакание.",
      "sextile": "Солнце и Венера в секстиле: между партнёрами мягкое притяжение и взаимная симпатия. Легко быть приятными друг для друга. Сила — тепло и гармония; риск — не углублять связь.",
      "square": "Солнце и Венера в квадрате: между любовью и самовыражением партнёров возникает трение. Вкусы и ценности расходятся, что создаёт напряжение. Сила — рост через различие; риск — взаимная критика и нехватка понимания.",
      "trine": "Солнце и Венера в тригоне: легко нравиться друг другу и создавать красоту вместе. Связь тёплая и приятная. Сила — гармония, взаимное восхищение и радость; риск — расслабленность.",
      "opposition": "Солнце и Венера в оппозиции: притяжение через контраст — один привносит уверенность и активность, другой — нежность и вкус. Сила — взаимное дополнение; риск — разные ожидания от отношений."
    },
    "sun-mars": {
      "conjunction": "Солнце одного и Марс другого в соединении: мощная, энергичная связь. Один зажигает, другой действует — вместе много драйва и страсти. Сила — динамика, инициатива и притяжение; риск — соперничество и вспышки.",
      "sextile": "Солнце и Марс в секстиле: энергии партнёров мягко поддерживают друг друга. Хорошо действуют вместе. Сила — продуктивный тандем и взаимная мотивация; риск — недоиспользовать заряд.",
      "square": "Солнце и Марс в квадрате: сильное притяжение вперемешку с раздражением. Воля одного сталкивается с напором другого. Сила — страсть и энергия; риск — ссоры, агрессия и соперничество.",
      "trine": "Солнце и Марс в тригоне: энергии партнёров естественно поддерживают друг друга. Действуют слаженно, с азартом и уважением. Сила — драйв, страсть и эффективное сотрудничество; риск — принимать синергию как должное.",
      "opposition": "Солнце и Марс в оппозиции: воля одного и напор другого на разных полюсах — страсть граничит с борьбой. Сила — мощная энергия и сексуальный магнетизм; риск — конфликты и провокационные стычки."
    },
    "sun-jupiter": {
      "conjunction": "Солнце одного и Юпитер другого в соединении: один партнёр расширяет горизонты другого, верит в него и приносит удачу. Сила — оптимизм, щедрость и взаимный рост; риск — потакание и переоценка возможностей.",
      "sextile": "Солнце и Юпитер в секстиле: один мягко поддерживает и воодушевляет другого. Связь лёгкая и благоприятная. Сила — оптимизм и взаимная польза; риск — лень без общего дела.",
      "square": "Солнце и Юпитер в квадрате: один перебарщивает с щедростью или завышает ожидания от другого. Сила — щедрая, растущая динамика; риск — самонадеянность и разные представления о масштабе.",
      "trine": "Солнце и Юпитер в тригоне: один естественно вдохновляет другого и приносит веру в себя. Сила — рост, оптимизм и взаимная щедрость; риск — расслабленность и склонность к излишествам.",
      "opposition": "Солнце и Юпитер в оппозиции: широта одного и воля другого на разных полюсах. Взаимный рост с риском перебора. Сила — щедрость и развитие; риск — расточительность и навязывание убеждений."
    },
    "sun-saturn": {
      "conjunction": "Солнце одного и Сатурн другого в соединении: один придаёт жизни другого структуру и серьёзность — связь прочная и «кармическая». Сила — стабильность, ответственность и долговечность; риск — один давит, другой чувствует холод и ограничения.",
      "sextile": "Солнце и Сатурн в секстиле: один даёт другому устойчивость и опору без давления. Сила — надёжность и зрелая поддержка; риск — недоиспользовать эту опору.",
      "square": "Солнце и Сатурн в квадрате: один ограничивает или критикует самовыражение другого. Напряжение долга и тяжести. Сила — рост через дисциплину и проверку временем; риск — холод, подавление и обиды.",
      "trine": "Солнце и Сатурн в тригоне: один даёт другому надёжную опору и мудрость без давления. Связь зрелая и долговечная. Сила — поддержка, ответственность и прочность; риск — сухость и нехватка лёгкости.",
      "opposition": "Солнце и Сатурн в оппозиции: воля одного и ограничения другого на разных полюсах. Один видится как авторитет или «тормоз». Сила — взросление через вызов; риск — подавление, критика и скованность."
    },
    "sun-uranus": {
      "conjunction": "Солнце одного и Уран другого в соединении: один приносит в жизнь другого свежесть, свободу и неожиданность. Сила — яркость, оригинальность и притяжение новизны; риск — нестабильность и нехватка опоры.",
      "sextile": "Солнце и Уран в секстиле: один мягко вдохновляет другого на новое и нестандартное. Сила — творческий импульс и взаимная свобода; риск — оставить искру без развития.",
      "square": "Солнце и Уран в квадрате: стремление одного к свободе расшатывает устойчивость другого. Возможны внезапные сбои и непредсказуемость. Сила — пробуждение и динамика; риск — нестабильность и резкие повороты.",
      "trine": "Солнце и Уран в тригоне: один легко привносит в жизнь другого новизну и свободу, не разрушая её. Сила — оригинальность, лёгкость и взаимное пространство; риск — принимать свободу за безразличие.",
      "opposition": "Солнце и Уран в оппозиции: тяга одного к свободе противостоит потребности другого в устойчивости. Притяжение волнующее, но качельное. Сила — пробуждение через непохожесть; риск — нестабильность и дистанция."
    },
    "sun-neptune": {
      "conjunction": "Солнце одного и Нептун другого в соединении: один видит в другом идеал, окутывает романтикой и вдохновением. Связь тонкая и духовная. Сила — нежность, творчество и притяжение; риск — иллюзии и разочарование, когда туман рассеется.",
      "sextile": "Солнце и Нептун в секстиле: один мягко вдохновляет и одухотворяет другого. Сила — сострадание, творчество и чуткость; риск — расплывчатость без заземления.",
      "square": "Солнце и Нептун в квадрате: один размывает образ другого иллюзиями. Возможны недопонимание и разочарования. Сила — творческое и духовное вдохновение; риск — туман, идеализация и потеря ясности.",
      "trine": "Солнце и Нептун в тригоне: один естественно вдохновляет другого, привносит нежность и духовную близость. Сила — сострадание, творчество и тонкая связь; риск — идеализация и уход от реальности.",
      "opposition": "Солнце и Нептун в оппозиции: идеалы одного и личность другого на разных полюсах. Романтическое притяжение с риском тумана. Сила — вдохновение и сострадание; риск — иллюзии и нечёткие границы."
    },
    "sun-pluto": {
      "conjunction": "Солнце одного и Плутон другого в соединении: глубокое, преображающее влияние одного на другого — притяжение мощное, почти магнетическое. Сила — глубина, страсть и взаимная трансформация; риск — борьба за власть и одержимость.",
      "sextile": "Солнце и Плутон в секстиле: один помогает другому расти через глубину. Влияние мягкое. Сила — преображение и поддержка перемен; риск — оставить потенциал нераскрытым.",
      "square": "Солнце и Плутон в квадрате: один стремится влиять на другого и контролировать его. Сильное притяжение и напряжённая борьба воль. Сила — глубокая трансформация; риск — манипуляции и силовые игры.",
      "trine": "Солнце и Плутон в тригоне: один мощно, но органично преображает другого и поддерживает в переменах. Сила — глубина, регенерация и взаимное усиление; риск — недооценить интенсивность связи.",
      "opposition": "Солнце и Плутон в оппозиции: сила одного и воля другого на разных полюсах — мощное притяжение и борьба за власть. Сила — глубокая трансформация через другого; риск — контроль и навязчивая интенсивность."
    },
    "moon-sun": {
      "conjunction": "Луна одного и Солнце другого в соединении: тёплое, питающее сочетание. Чувства и воля сходятся — один инстинктивно заботится о другом, второй согревает своей яркостью. Сила — взаимная поддержка, тепло и ощущение «дома»; риск — эмоциональная зависимость и слияние.",
      "sextile": "Луна и Солнце в секстиле: чувства одного и воля другого легко находят общий язык. Между ними естественная теплота. Сила — комфорт, понимание и нежность; риск — не углублять связь.",
      "square": "Луна и Солнце в квадрате: эмоциональные нужды одного расходятся с самовыражением другого. Трение настроений и целей. Сила — рост через притирку; риск — ощущение непонятости и конфликт быта.",
      "trine": "Луна и Солнце в тригоне: чувства одного естественно поддерживают волю другого. Легко создавать уют и взаимную заботу. Сила — тепло, гармония и взаимная поддержка; риск — расслабленность.",
      "opposition": "Луна и Солнце в оппозиции: эмоциональное и рациональное на разных полюсах — один привносит чуткость, другой — волю и активность. Сила — полярная, но мощная связь; риск — качели тепла и холода."
    },
    "moon-moon": {
      "conjunction": "Луна встречает Луну: партнёры эмоционально настроены схоже — быстро чувствуют нужды друг друга, создают уют и безопасность. Сила — глубокое душевное сродство и забота; риск — чрезмерная зависимость и усиление перепадов настроения.",
      "sextile": "Луны в секстиле: эмоциональный мир партнёров мягко созвучен. Легко поддерживать и понимать чувства друг друга. Сила — тёплая душевная гармония; риск — оставить связь без глубины.",
      "square": "Луны в квадрате: эмоциональные нужды и привычки партнёров расходятся. Частые недопонимания в быту и настроениях. Сила — рост эмоциональной зрелости через различие; риск — обиды и взаимная нечуткость.",
      "trine": "Луны в тригоне: чувства партнёров естественно созвучны. Легко заботиться и чувствовать себя дома рядом друг с другом. Сила — душевный уют и взаимная поддержка; риск — принимать гармонию как должное.",
      "opposition": "Луны в оппозиции: эмоциональные стили партнёров противоположны — один реагирует там, где другой сдержан. Притяжение через контраст. Сила — взаимное дополнение; риск — эмоциональные столкновения и непонимание нужд."
    },
    "moon-mercury": {
      "conjunction": "Луна одного и Меркурий другого в соединении: чувства и слова переплетены — разговоры по душам, интуитивное понимание. Сила — тёплое, чуткое общение; риск — субъективность и смешение фактов с ощущениями.",
      "sextile": "Луна и Меркурий в секстиле: один улавливает чувства другого, другой находит слова для них. Сила — душевный, понимающий диалог; риск — оставить связь поверхностной.",
      "square": "Луна и Меркурий в квадрате: логика одного задевает чувства другого. Слова обижают, эмоции мешают мыслить. Сила — учиться соединять разум и сердце; риск — недопонимание и обиды.",
      "trine": "Луна и Меркурий в тригоне: один легко выражает то, что другой чувствует. Общение тёплое и ясное. Сила — взаимопонимание и тонкий диалог; риск — принимать лёгкость как должное.",
      "opposition": "Луна и Меркурий в оппозиции: чувства одного и логика другого на разных полюсах. Стимулирует, но рождает недопонимание. Сила — баланс ума и сердца; риск — споры и ощущение непонятости."
    },
    "moon-venus": {
      "conjunction": "Луна одного и Венера другого в соединении: тёплое, нежное и любящее сочетание. Один окружает другого заботой и нежностью. Сила — эмоциональная теплота, близость и взаимная забота; риск — потакание и нежелание видеть трудное.",
      "sextile": "Луна и Венера в секстиле: между партнёрами мягкое тепло и нежность. Легко заботиться и нравиться друг другу. Сила — уют и эмоциональная гармония; риск — оставить связь без глубины.",
      "square": "Луна и Венера в квадрате: потребность в заботе одного расходится с желаниями другого. Возможны обиды и капризы. Сила — рост через притирку; риск — эмоциональные разочарования и разлад.",
      "trine": "Луна и Венера в тригоне: нежность и забота текут легко и естественно. Связь тёплая и питающая. Сила — эмоциональная и романтическая гармония; риск — лень и привычка к комфорту.",
      "opposition": "Луна и Венера в оппозиции: нужды одного и желания другого на разных полюсах. Притяжение через контраст. Сила — взаимное дополнение тепла и красоты; риск — разные ожидания близости."
    },
    "moon-mars": {
      "conjunction": "Луна одного и Марс другого в соединении: страстное, но взрывоопасное сочетание. Напор одного будоражит чувства другого — сильное притяжение, но и задетые эмоции. Сила — страсть, защита и живость; риск — вспышки и эмоциональные конфликты.",
      "sextile": "Луна и Марс в секстиле: энергия одного бодрит чувства другого. Между ними живая теплота. Сила — страстная, но мягкая динамика; риск — недоиспользовать заряд.",
      "square": "Луна и Марс в квадрате: напор одного ранит чувствительность другого. Частые ссоры и эмоциональные взрывы. Сила — страсть и энергия; риск — конфликты и обиды.",
      "trine": "Луна и Марс в тригоне: энергия одного естественно защищает и поддерживает другого. Страсть сочетается с теплом. Сила — страстная забота и живая, тёплая динамика; риск — принимать гармонию как должное.",
      "opposition": "Луна и Марс в оппозиции: напор одного и чувства другого на разных полюсах — страсть граничит с конфликтом. Сила — сильное притяжение и энергия; риск — ссоры и эмоциональные провокации."
    },
    "moon-jupiter": {
      "conjunction": "Луна одного и Юпитер другого в соединении: щедрое, тёплое сочетание. Один окружает другого оптимизмом, заботой и щедростью. Сила — эмоциональная щедрость, рост и уют; риск — потакание и избыточная опека.",
      "sextile": "Луна и Юпитер в секстиле: один мягко поддерживает и подбадривает другого эмоционально. Сила — оптимизм, тепло и взаимная забота; риск — лень и расчёт на «само наладится».",
      "square": "Луна и Юпитер в квадрате: один перебарщивает с заботой или оптимизмом, не считываясь с нуждами другого. Сила — щедрость и тепло; риск — излишества и пустые утешения.",
      "trine": "Луна и Юпитер в тригоне: один естественно согревает и поддерживает другого, дарит ощущение защищённости и роста. Сила — эмоциональная щедрость и уют; риск — потакание и расслабленность.",
      "opposition": "Луна и Юпитер в оппозиции: щедрость одного и нужды другого на разных полюсах. Сила — забота и оптимизм; риск — избыточная опека и разные представления о мере."
    },
    "moon-saturn": {
      "conjunction": "Луна одного и Сатурн другого в соединении: серьёзное, «кармическое» сочетание. Один придаёт чувствам другого опору, но может и холодить. Сила — надёжность и долговечность; риск — эмоциональный холод и ощущение, что нужно заслужить любовь.",
      "sextile": "Луна и Сатурн в секстиле: один даёт чувствам другого зрелую опору без давления. Сила — надёжность и эмоциональная зрелость; риск — недоиспользовать эту опору.",
      "square": "Луна и Сатурн в квадрате: один сковывает или холодит чувства другого. Возникает нехватка тепла и одобрения. Сила — рост через ответственность; риск — холод и ощущение, что любовь надо заслужить.",
      "trine": "Луна и Сатурн в тригоне: один даёт другому эмоциональную надёжность и зрелую заботу без давления. Сила — опора, верность и прочность чувств; риск — некоторая сдержанность.",
      "opposition": "Луна и Сатурн в оппозиции: тепло одного и сдержанность другого на разных полюсах. Сила — взросление чувств через вызов; риск — холод и дистанция."
    },
    "moon-uranus": {
      "conjunction": "Луна одного и Уран другого в соединении: один будоражит чувства другого, приносит новизну и непредсказуемость. Сила — живость, свежесть и волнение; риск — нестабильность и нехватка надёжности.",
      "sextile": "Луна и Уран в секстиле: один мягко освежает чувства другого. Между ними лёгкость и свобода. Сила — живая, нескучная теплота; риск — оставить искру без глубины.",
      "square": "Луна и Уран в квадрате: тяга одного к свободе расшатывает потребность другого в стабильности. Сила — пробуждение чувств; риск — непредсказуемость и нестабильность.",
      "trine": "Луна и Уран в тригоне: один легко привносит в чувства другого свежесть и свободу, не разрушая близость. Сила — живость, лёгкость и взаимное пространство; риск — принять свободу за прохладу.",
      "opposition": "Луна и Уран в оппозиции: тяга одного к свободе и потребность другого в близости на разных полюсах. Притяжение волнующее, но качельное. Сила — пробуждение через непохожесть; риск — нестабильность и дистанция."
    },
    "moon-neptune": {
      "conjunction": "Луна одного и Нептун другого в соединении: тонкая, мечтательная эмоциональная связь. Между ними почти телепатическое сопереживание. Сила — эмпатия, нежность и духовное единство; риск — иллюзии, размытые границы и созависимость.",
      "sextile": "Луна и Нептун в секстиле: один мягко улавливает и одухотворяет чувства другого. Сила — чуткость, сострадание и творческая близость; риск — расплывчатость без заземления.",
      "square": "Луна и Нептун в квадрате: иллюзии одного и чувства другого путаются. Возможны недопонимание и разочарования. Сила — глубокое сопереживание; риск — туман и потеря эмоциональных границ.",
      "trine": "Луна и Нептун в тригоне: один естественно сопереживает другому и создаёт тонкую, нежную связь. Сила — эмпатия, романтика и духовная близость; риск — уход в мечты и нечёткость границ.",
      "opposition": "Луна и Нептун в оппозиции: идеалы одного и чувства другого на разных полюсах. Сила — сострадание и душевная связь; риск — иллюзии и созависимость."
    },
    "moon-pluto": {
      "conjunction": "Луна одного и Плутон другого в соединении: глубокая, всепоглощающая эмоциональная связь. Один мощно влияет на чувства другого, пробуждая страсть и перемены. Сила — глубина, интенсивность и эмоциональная трансформация; риск — ревность, контроль и одержимость.",
      "sextile": "Луна и Плутон в секстиле: один помогает другому проживать и обновлять глубокие чувства. Сила — эмоциональная глубина и поддержка перемен; риск — оставить потенциал нераскрытым.",
      "square": "Луна и Плутон в квадрате: один стремится контролировать или интенсивно влиять на чувства другого. Сила — трансформация через кризис; риск — манипуляции, ревность и навязчивость.",
      "trine": "Луна и Плутон в тригоне: один глубоко, но органично преображает чувства другого. Сила — эмоциональная глубина и регенерация; риск — недооценить силу привязанности.",
      "opposition": "Луна и Плутон в оппозиции: глубинная сила одного и чувства другого на разных полюсах. Сила — трансформация через глубокие связи; риск — ревность и эмоциональные крайности."
    },
    "mercury-sun": {
      "conjunction": "Меркурий одного и Солнце другого в соединении: ум одного работает на цели другого — общение живое, идеи подхватываются на лету. Сила — энергичный, личный диалог и взаимный интерес; риск — один может доминировать в разговоре.",
      "sextile": "Меркурий и Солнце в секстиле: мышление одного мягко поддерживает инициативы другого. Сила — лёгкий, продуктивный обмен; риск — остаться на поверхности.",
      "square": "Меркурий и Солнце в квадрате: мышление одного и воля другого сталкиваются. Споры, разные взгляды на одно и то же. Сила — острый, развивающий диалог; риск — словесные конфликты и упрямство.",
      "trine": "Меркурий и Солнце в тригоне: мысли одного естественно согласуются с целями другого. Общение течёт легко. Сила — ясный, поддерживающий диалог; риск — принимать лёгкость как должное.",
      "opposition": "Меркурий и Солнце в оппозиции: стиль мышления одного расходится с волей другого. Стимулирует дискуссию. Сила — расширение кругозора; риск — споры и взаимное непонимание."
    },
    "mercury-moon": {
      "conjunction": "Меркурий одного и Луна другого в соединении: слова одного трогают чувства другого — разговоры по душам, интуитивное понимание. Сила — тёплое, чуткое общение; риск — слова легко задевают, а субъективность мешает ясности.",
      "sextile": "Меркурий и Луна в секстиле: один находит слова для чувств другого. Сила — душевный, понимающий диалог; риск — оставить связь поверхностной.",
      "square": "Меркурий и Луна в квадрате: логика одного задевает чувства другого. Слова обижают, эмоции мешают думать. Сила — учиться соединять разум и сердце; риск — недопонимание и обиды.",
      "trine": "Меркурий и Луна в тригоне: один легко выражает то, что другой чувствует. Общение тёплое и ясное. Сила — взаимопонимание и тонкий диалог; риск — принимать лёгкость как должное.",
      "opposition": "Меркурий и Луна в оппозиции: логика одного и чувства другого на разных полюсах. Стимулирует, но рождает недопонимание. Сила — баланс ума и сердца; риск — ощущение непонятости."
    },
    "mercury-mercury": {
      "conjunction": "Меркурии партнёров в соединении: мышление и стиль общения схожи — легко понимают друг друга, много говорят и думают об одном. Сила — быстрый, живой диалог и взаимопонимание; риск — варятся в одних идеях без свежего взгляда.",
      "sextile": "Меркурии в секстиле: стиль мышления партнёров мягко созвучен. Разговоры приятны и продуктивны. Сила — лёгкий, интересный обмен; риск — поверхностность.",
      "square": "Меркурии в квадрате: стили мышления и общения расходятся — споры, недопонимание, разные «правды». Сила — стимулирующий, развивающий диалог; риск — словесные конфликты и упрямство.",
      "trine": "Меркурии в тригоне: мышление партнёров естественно созвучно. Легко вести разговор, учиться друг у друга и строить планы. Сила — ясный, гармоничный диалог; риск — принимать лёгкость как должное.",
      "opposition": "Меркурии в оппозиции: стили мышления противоположны — один конкретен, другой широк; один эмоционален, другой логичен. Сила — взаимное дополнение и расширение взглядов; риск — споры и непонимание."
    },
    "mercury-venus": {
      "conjunction": "Меркурий одного и Венера другого в соединении: общение тёплое, обаятельное и приятное. Один находит слова, которые нравятся другому. Сила — такт, дипломатия и взаимная симпатия в разговоре; риск — говорить приятное вместо честного.",
      "sextile": "Меркурий и Венера в секстиле: один легко говорит то, что приятно другому. Контакты тёплые. Сила — обаяние в общении и согласие; риск — поверхностность.",
      "square": "Меркурий и Венера в квадрате: слова одного задевают ценности другого. Трение в разговорах о вкусах, деньгах или нежности. Сила — прояснение того, что важно; риск — недосказанность и взаимная критика.",
      "trine": "Меркурий и Венера в тригоне: общение тёплое, обаятельное и приятное. Легко находить согласие и говорить красиво. Сила — такт и дипломатия; риск — уход от неудобных тем.",
      "opposition": "Меркурий и Венера в оппозиции: слово одного и чувство другого на разных полюсах. Стимулирует, но рождает непонимание. Сила — баланс ума и нежности; риск — нерешительность и разные языки любви."
    },
    "mercury-mars": {
      "conjunction": "Меркурий одного и Марс другого в соединении: разговоры острые, страстные, решительные. Один думает и говорит, другой сразу действует. Сила — энергичный, прямой диалог и переход от слов к делу; риск — резкость, споры и поспешные слова.",
      "sextile": "Меркурий и Марс в секстиле: мысль одного легко переходит в действие другого. Хороший рабочий тандем. Сила — решительность и эффективность; риск — недоиспользовать заряд.",
      "square": "Меркурий и Марс в квадрате: слова одного задевают напор другого. Словесные стычки, резкость, споры. Сила — острый, развивающий диалог; риск — ссоры и поспешные слова.",
      "trine": "Меркурий и Марс в тригоне: мысли одного легко превращаются в действия через другого. Сила — решительный, эффективный тандем; риск — принимать лёгкость как должное.",
      "opposition": "Меркурий и Марс в оппозиции: мышление одного и напор другого на разных полюсах. Жаркие дебаты. Сила — динамичный обмен; риск — словесные баталии и провокации."
    },
    "mercury-jupiter": {
      "conjunction": "Меркурий одного и Юпитер другого в соединении: один расширяет мышление другого, добавляет оптимизма и широты взглядов. Сила — вдохновляющий обмен идеями и рост; риск — преувеличения и пропуск деталей.",
      "sextile": "Меркурий и Юпитер в секстиле: один мягко расширяет кругозор другого. Разговоры воодушевляют. Сила — оптимистичный, познавательный обмен; риск — поверхностность.",
      "square": "Меркурий и Юпитер в квадрате: один мыслит слишком широко для конкретного другого. Расхождения в масштабе и деталях. Сила — рост через дискуссию; риск — преувеличения и небрежность к фактам.",
      "trine": "Меркурий и Юпитер в тригоне: один естественно вдохновляет мышление другого, дарит широту и оптимизм. Сила — познавательный, обнадёживающий диалог; риск — небрежность к деталям.",
      "opposition": "Меркурий и Юпитер в оппозиции: детальный ум одного и широкие взгляды другого на разных полюсах. Сила — соединение конкретики и масштаба; риск — преувеличения и разный взгляд на «правду»."
    },
    "mercury-saturn": {
      "conjunction": "Меркурий одного и Сатурн другого в соединении: один придаёт мышлению другого структуру и серьёзность. Разговоры взвешенные, основательные. Сила — глубина и надёжность в общении; риск — критика и скованность речи.",
      "sextile": "Меркурий и Сатурн в секстиле: один придаёт идеям другого структуру и реализм без давления. Сила — практичный, надёжный диалог; риск — сухость.",
      "square": "Меркурий и Сатурн в квадрате: один критикует или ограничивает мысли другого. Неуверенность и ощущение непонятости. Сила — дисциплина мышления через вызов; риск — критика и зажатость в общении.",
      "trine": "Меркурий и Сатурн в тригоне: один даёт мышлению другого зрелость и структуру без давления. Сила — продуманный, надёжный диалог; риск — некоторая сухость.",
      "opposition": "Меркурий и Сатурн в оппозиции: гибкий ум одного и строгость другого на разных полюсах. Сила — баланс дисциплины и свободы мысли; риск — критика и ощущение непонятости."
    },
    "mercury-uranus": {
      "conjunction": "Меркурий одного и Уран другого в соединении: один будоражит ум другого неожиданными идеями. Общение искрит озарениями. Сила — оригинальность и интеллектуальное волнение; риск — нервозность и непредсказуемость.",
      "sextile": "Меркурий и Уран в секстиле: один подбрасывает другому свежие идеи. Разговоры живые и нескучные. Сила — изобретательность и открытость; риск — оставить искру без развития.",
      "square": "Меркурий и Уран в квадрате: нестандартность одного расшатывает мышление другого. Споры, резкость. Сила — оригинальность через трение; риск — нервозность и интеллектуальный бунт.",
      "trine": "Меркурий и Уран в тригоне: один легко вдохновляет ум другого на новое, не сбивая с толку. Сила — озарения, гибкость и нескучный диалог; риск — принимать лёгкость как должное.",
      "opposition": "Меркурий и Уран в оппозиции: упорядоченный ум одного и оригинальность другого на разных полюсах. Сила — взаимное пробуждение; риск — споры и нестабильность."
    },
    "mercury-neptune": {
      "conjunction": "Меркурий одного и Нептун другого в соединении: один окутывает мышление другого воображением и поэтичностью. Разговоры образные, но туманные. Сила — творческий, образный обмен; риск — недопонимание и обманчивые ожидания.",
      "sextile": "Меркурий и Нептун в секстиле: один мягко добавляет интуиции и образности в мышление другого. Сила — творческое, чуткое общение; риск — расплывчатость.",
      "square": "Меркурий и Нептун в квадрате: иллюзии одного и логика другого путаются. Недопонимание, недосказанность. Сила — творческое вдохновение; риск — туман и искажённое восприятие слов.",
      "trine": "Меркурий и Нептун в тригоне: один естественно добавляет интуиции и тонкости в мышление другого. Сила — образный, чуткий диалог; риск — уход в фантазии.",
      "opposition": "Меркурий и Нептун в оппозиции: логика одного и воображение другого на разных полюсах. Сила — соединение интуиции и разума; риск — недопонимание и иллюзии."
    },
    "mercury-pluto": {
      "conjunction": "Меркурий одного и Плутон другого в соединении: один придаёт мышлению другого глубину и интенсивность. Разговоры проникают до сути. Сила — проницательный, преображающий обмен; риск — давление и попытки контролировать мысли другого.",
      "sextile": "Меркурий и Плутон в секстиле: один помогает уму другого копать глубже и видеть скрытое. Сила — проницательность и сила убеждения; риск — оставить глубину нераскрытой.",
      "square": "Меркурий и Плутон в квадрате: один давит на мышление другого, навязывает взгляды. Силовые споры. Сила — глубокая трансформация мысли; риск — манипуляции и интеллектуальный контроль.",
      "trine": "Меркурий и Плутон в тригоне: один органично углубляет мышление другого, помогает видеть суть. Сила — проницательность и влияние; риск — недооценить интенсивность разговоров.",
      "opposition": "Меркурий и Плутон в оппозиции: острый ум одного и глубинная сила другого на разных полюсах. Сила — преображающий обмен; риск — словесные силовые игры."
    },
    "venus-sun": {
      "conjunction": "Венера одного и Солнце другого в соединении: нежность и притяжение одного освещают личность другого — естественная симпатия и теплота. Сила — тепло, взаимное восхищение и лёгкость; риск — идеализация и потакание.",
      "sextile": "Венера и Солнце в секстиле: нежность одного мягко поддерживает другого. Между партнёрами приятная симпатия. Сила — тепло и гармония; риск — не углублять связь.",
      "square": "Венера и Солнце в квадрате: нежность одного и самовыражение другого трутся. Вкусы и ценности расходятся. Сила — рост через различие; риск — взаимная критика и нехватка понимания.",
      "trine": "Венера и Солнце в тригоне: нежность одного легко гармонирует с волей другого. Связь тёплая и приятная. Сила — взаимное восхищение, гармония и радость; риск — расслабленность.",
      "opposition": "Венера и Солнце в оппозиции: нежность одного и воля другого на разных полюсах — притяжение через контраст. Сила — взаимное дополнение; риск — разные ожидания от отношений."
    },
    "venus-moon": {
      "conjunction": "Венера одного и Луна другого в соединении: нежность и забота сливаются — тёплое, питающее и ласковое сочетание. Сила — эмоциональная теплота, близость и взаимная нежность; риск — потакание и нежелание видеть трудное.",
      "sextile": "Венера и Луна в секстиле: нежность одного мягко поддерживает чувства другого. Сила — уют и эмоциональная гармония; риск — оставить связь без глубины.",
      "square": "Венера и Луна в квадрате: желания одного расходятся с эмоциональными нуждами другого. Возможны обиды и капризы. Сила — рост через притирку; риск — эмоциональный разлад.",
      "trine": "Венера и Луна в тригоне: нежность одного и чувства другого течут легко и естественно. Связь тёплая и питающая. Сила — эмоциональная и романтическая гармония; риск — лень и привычка к комфорту.",
      "opposition": "Венера и Луна в оппозиции: желания одного и нужды другого на разных полюсах. Притяжение через контраст. Сила — взаимное дополнение; риск — разные ожидания близости."
    },
    "venus-mercury": {
      "conjunction": "Венера одного и Меркурий другого в соединении: нежность одного находит слова у другого — общение обаятельное и приятное. Сила — такт, дипломатия и взаимная симпатия в разговоре; риск — говорить приятное вместо честного.",
      "sextile": "Венера и Меркурий в секстиле: нежность одного и слово другого легко согласуются. Контакты тёплые. Сила — обаяние в общении и согласие; риск — поверхностность.",
      "square": "Венера и Меркурий в квадрате: ценности одного и слова другого трутся. Трение в разговорах о вкусах и нежности. Сила — прояснение того, что важно; риск — недосказанность и взаимная критика.",
      "trine": "Венера и Меркурий в тригоне: нежность одного и слово другого текут легко и согласно. Общение приятное и тёплое. Сила — такт и дипломатия; риск — уход от неудобных тем.",
      "opposition": "Венера и Меркурий в оппозиции: нежность одного и логика другого на разных полюсах. Стимулирует, но рождает непонимание. Сила — баланс ума и нежности; риск — нерешительность."
    },
    "venus-venus": {
      "conjunction": "Венеры партнёров в соединении: схожие вкусы, ценности и способ любить. Легко нравиться друг другу и разделять удовольствия. Сила — гармония в любви, красоте и ценностях; риск — потакание и нехватка стимулирующей разницы.",
      "sextile": "Венеры в секстиле: вкусы и способ любить партнёров мягко созвучны. Легко получать удовольствие вместе. Сила — приятная гармония; риск — оставить связь без глубины.",
      "square": "Венеры в квадрате: вкусы, ценности и способ любить расходятся. Трение в том, как выражать и получать нежность. Сила — рост через различие; риск — взаимная критика вкусов и нехватка понимания.",
      "trine": "Венеры в тригоне: партнёры легко понимают, что нужно другому в любви. Гармония в ценностях и удовольствиях. Сила — взаимное притяжение и комфорт; риск — расслабленность.",
      "opposition": "Венеры в оппозиции: способ любить и ценности противоположны. Притяжение через контраст. Сила — взаимное дополнение; риск — разные ожидания от отношений и нехватка понимания."
    },
    "venus-mars": {
      "conjunction": "Венера одного и Марс другого в соединении: классическое сочетание влечения. Нежность встречает страсть — сильное романтическое и сексуальное притяжение. Сила — химия, страсть и взаимное желание; риск — импульсивность, ревность и накал страстей.",
      "sextile": "Венера и Марс в секстиле: нежность и напор легко согласуются — приятное притяжение и живая страсть. Сила — здоровое влечение, обаяние и романтика; риск — недоиспользовать искру.",
      "square": "Венера и Марс в квадрате: нежность одного и напор другого сталкиваются. Страстно, но бурно. Сила — мощное влечение; риск — конфликты в любви, ревность и импульсивность.",
      "trine": "Венера и Марс в тригоне: нежность и страсть текут в гармонии — естественное, тёплое и страстное притяжение. Сила — магнетизм, лёгкая романтика и желание; риск — принимать химию как должное.",
      "opposition": "Венера и Марс в оппозиции: нежность и напор на разных полюсах — мощное притяжение «инь–ян». Сила — страстная, динамичная связь; риск — качели влечения, трение и ревность."
    },
    "venus-jupiter": {
      "conjunction": "Венера одного и Юпитер другого в соединении: тёплое, щедрое и удачное сочетание. Один расширяет любовь и радости другого, дарит щедрость и оптимизм. Сила — тепло, везение в отношениях и удовольствие вдвоём; риск — потакание, расточительность и идеализация.",
      "sextile": "Венера и Юпитер в секстиле: один мягко добавляет в любовь другого щедрости и оптимизма. Сила — тепло, радость и доброжелательность; риск — перебор с удовольствиями.",
      "square": "Венера и Юпитер в квадрате: один перебарщивает с щедростью или идеализирует отношения — возможны излишества и нереалистичные ожидания. Сила — щедрая, тёплая динамика; риск — расточительность и переоценка чувств.",
      "trine": "Венера и Юпитер в тригоне: один естественно умножает любовь и радости другого. Удача и щедрость в отношениях. Сила — тепло, везение и большое сердце; риск — потакание и склонность к излишествам.",
      "opposition": "Венера и Юпитер в оппозиции: щедрость одного и любовь другого на разных полюсах. Сила — щедрость и радость; риск — расточительность и нереалистичные ожидания."
    },
    "venus-saturn": {
      "conjunction": "Венера одного и Сатурн другого в соединении: один придаёт любви другого серьёзность, верность и долговечность, но может и холодить. Сила — преданность, обязательность и прочность связи; риск — холод и ощущение, что любовь под условием.",
      "sextile": "Венера и Сатурн в секстиле: один даёт чувствам другого надёжность и зрелость без давления. Сила — верность и стабильность; риск — недоиспользовать эту опору.",
      "square": "Венера и Сатурн в квадрате: один сдерживает или обесценивает нежность другого. Холод, дистанция, страх отвержения. Сила — верность через испытания; риск — холодность и чувство нехватки любви.",
      "trine": "Венера и Сатурн в тригоне: один даёт любви другого прочную, зрелую опору без давления. Сила — преданность, надёжность и долговечность чувств; риск — некоторая сдержанность.",
      "opposition": "Венера и Сатурн в оппозиции: нежность одного и сдержанность другого на разных полюсах. Сила — зрелая, проверенная любовь; риск — холод, дистанция и чувство недолюбленности."
    },
    "venus-uranus": {
      "conjunction": "Венера одного и Уран другого в соединении: один вносит в любовь другого волнение, новизну и свободу. Притяжение яркое и внезапное. Сила — искра, оригинальность и страсть к новому; риск — нестабильность и страх обязательств.",
      "sextile": "Венера и Уран в секстиле: один мягко освежает чувства другого. Лёгкость и свобода в отношениях. Сила — живая, нескучная нежность; риск — оставить искру без глубины.",
      "square": "Венера и Уран в квадрате: тяга одного к свободе расшатывает потребность другого в близости. Внезапные притяжения и охлаждения. Сила — волнение и новизна; риск — непостоянство и разрывы.",
      "trine": "Венера и Уран в тригоне: один легко привносит в любовь другого свежесть и свободу, не разрушая близость. Сила — оригинальность, лёгкость и притяжение; риск — ценить свободу больше глубины.",
      "opposition": "Венера и Уран в оппозиции: тяга одного к свободе и нежность другого на разных полюсах. Волнующее, но качельное притяжение. Сила — яркая, пробуждающая связь; риск — непостоянство."
    },
    "venus-neptune": {
      "conjunction": "Венера одного и Нептун другого в соединении: возвышенная, романтическая связь. Один окутывает любовь другого мечтой и идеалом — словно родственные души. Сила — нежность, творчество и духовная романтика; риск — иллюзии и разочарование.",
      "sextile": "Венера и Нептун в секстиле: один мягко одухотворяет любовь другого, добавляет нежности и воображения. Сила — сострадание, романтика и творчество; риск — расплывчатость без заземления.",
      "square": "Венера и Нептун в квадрате: иллюзии одного и любовь другого путаются. Идеализация, недосказанность, разочарования. Сила — нежная, сострадательная связь; риск — обманы, иллюзии и спасательство.",
      "trine": "Венера и Нептун в тригоне: один естественно одухотворяет любовь другого, дарит романтику и тонкую связь душ. Сила — нежность, творчество и духовная близость; риск — идеализация.",
      "opposition": "Венера и Нептун в оппозиции: идеалы одного и любовь другого на разных полюсах. Сила — сострадание и романтика; риск — иллюзии и созависимость."
    },
    "venus-pluto": {
      "conjunction": "Венера одного и Плутон другого в соединении: глубокое, всепоглощающее притяжение. Один влияет на любовь другого с огромной силой, страсть преображает. Сила — магнетизм, глубина и страстная близость; риск — ревность, собственничество и контроль.",
      "sextile": "Венера и Плутон в секстиле: один помогает любви другого углубляться и обновляться через честность. Сила — магнетизм и эмоциональная глубина; риск — оставить интенсивность нераскрытой.",
      "square": "Венера и Плутон в квадрате: один стремится обладать и контролировать чувства другого. Навязчивое притяжение и ревность. Сила — глубокая, преображающая страсть; риск — контроль, манипуляции и собственничество.",
      "trine": "Венера и Плутон в тригоне: один глубоко, но органично преображает любовь другого, дарит страсть и глубину. Сила — магнетизм, страсть и преображающая близость; риск — недооценить силу привязанности.",
      "opposition": "Венера и Плутон в оппозиции: любовь одного и сила другого на разных полюсах. Мощное притяжение и борьба за контроль. Сила — глубокая, преображающая связь; риск — ревность, собственничество и крайности."
    },
    "mars-sun": {
      "conjunction": "Марс одного и Солнце другого в соединении: мощная, энергичная связь. Один зажигает, другой действует — вместе много драйва и страсти. Сила — динамика, инициатива и сексуальное притяжение; риск — соперничество, вспышки и борьба за лидерство.",
      "sextile": "Марс и Солнце в секстиле: энергии партнёров мягко поддерживают друг друга. Хорошо действуют вместе. Сила — продуктивный тандем, страсть и взаимная мотивация; риск — недоиспользовать заряд.",
      "square": "Марс и Солнце в квадрате: напор одного сталкивается с волей другого. Сильное притяжение вперемешку с раздражением и борьбой за главенство. Сила — страсть и энергия; риск — ссоры, агрессия и соперничество.",
      "trine": "Марс и Солнце в тригоне: энергии партнёров естественно поддерживают друг друга. Действуют слаженно, с азартом и уважением. Сила — драйв, страсть и эффективное сотрудничество; риск — принимать лёгкую синергию как должное.",
      "opposition": "Марс и Солнце в оппозиции: напор одного и воля другого на разных полюсах — страсть граничит с борьбой. Сила — мощная энергия и сексуальный магнетизм; риск — конфликты, соперничество и провокации."
    },
    "mars-moon": {
      "conjunction": "Марс одного и Луна другого в соединении: страстное, но взрывоопасное сочетание. Напор одного будоражит чувства другого — сильное притяжение, но и задетые эмоции. Сила — страсть, защита близких и живость; риск — вспышки, обиды и эмоциональные конфликты.",
      "sextile": "Марс и Луна в секстиле: энергия одного бодрит чувства другого, между ними живая теплота. Сила — страстная, но мягкая динамика; риск — недоиспользовать заряд.",
      "square": "Марс и Луна в квадрате: напор одного ранит чувствительность другого. Частые ссоры и эмоциональные взрывы. Сила — страсть и энергия; риск — конфликты, обиды и резкость.",
      "trine": "Марс и Луна в тригоне: энергия одного естественно защищает и поддерживает другого. Страсть сочетается с теплом. Сила — страстная забота и живая тёплая динамика; риск — принимать гармонию как должное.",
      "opposition": "Марс и Луна в оппозиции: напор одного и чувства другого на разных полюсах — страсть граничит с конфликтом. Сила — сильное притяжение и энергия; риск — ссоры, обиды и провокации."
    },
    "mars-mercury": {
      "conjunction": "Марс одного и Меркурий другого в соединении: напор одного заряжает мышление другого. Разговоры живые и страстные, решительные. Сила — острый, энергичный диалог и инициатива; риск — споры, резкость и словесные стычки.",
      "sextile": "Марс и Меркурий в секстиле: энергия одного бодрит ум другого. Хорошо обсуждают и действуют вместе. Сила — продуктивный обмен и решительность; риск — недоиспользовать заряд.",
      "square": "Марс и Меркурий в квадрате: напор одного сталкивается с мышлением другого. Споры, резкие слова. Сила — острота ума под напряжением; риск — ссоры, грубость и интеллектуальное соперничество.",
      "trine": "Марс и Меркурий в тригоне: энергия одного естественно подстёгивает ум другого, идеи легко переходят в действие. Сила — решительный, эффективный диалог; риск — принимать лёгкость как должное.",
      "opposition": "Марс и Меркурий в оппозиции: напор одного и мышление другого на разных полюсах. Хорошо для жарких дебатов. Сила — динамичный обмен; риск — словесные баталии и провокации."
    },
    "mars-venus": {
      "conjunction": "Марс одного и Венера другого в соединении: классическое сочетание влечения. Страсть встречает нежность — сильное романтическое и сексуальное притяжение. Сила — химия, страсть и взаимное желание; риск — импульсивность, ревность и накал страстей.",
      "sextile": "Марс и Венера в секстиле: напор одного и любовь другого легко согласуются. Приятное притяжение и живая страсть. Сила — здоровое влечение, обаяние и романтика; риск — недоиспользовать искру.",
      "square": "Марс и Венера в квадрате: напор одного и нежность другого сталкиваются — страстно, но бурно. Сила — мощное влечение; риск — конфликты в любви, ревность и импульсивность.",
      "trine": "Марс и Венера в тригоне: страсть и любовь текут в гармонии — естественное, тёплое и страстное притяжение. Сила — магнетизм, лёгкая романтика и желание; риск — принимать химию как должное.",
      "opposition": "Марс и Венера в оппозиции: напор одного и нежность другого на разных полюсах — мощное притяжение «инь–ян». Сила — страстная, динамичная связь; риск — качели влечения, трение и ревность."
    },
    "mars-mars": {
      "conjunction": "Марсы партнёров в соединении: много общей энергии, страсти и инициативы. Оба действуют и желают схожим образом. Сила — драйв, совместная активность и сексуальная совместимость; риск — соперничество и столкновение двух напоров.",
      "sextile": "Марсы в секстиле: энергии партнёров легко согласуются, хорошо действуют вместе. Сила — продуктивный тандем и взаимная мотивация; риск — недоиспользовать общий заряд.",
      "square": "Марсы в квадрате: стили действия и желания сталкиваются — борьба за лидерство и частые конфликты. Сила — мощная динамика; риск — ссоры, агрессия и силовая борьба.",
      "trine": "Марсы в тригоне: энергии партнёров естественно созвучны. Действуют слаженно и страстно. Сила — общий драйв, инициатива и сексуальная гармония; риск — принимать синергию как должное.",
      "opposition": "Марсы в оппозиции: напоры партнёров направлены в разные стороны — страсть и соперничество одновременно. Сила — динамичное притяжение и энергия; риск — конфликты и борьба за главенство."
    },
    "mars-jupiter": {
      "conjunction": "Марс одного и Юпитер другого в соединении: один воодушевляет и расширяет действия другого, придаёт смелости и оптимизма. Вместе много энергии и энтузиазма. Сила — драйв, предприимчивость и удача в начинаниях; риск — переоценка сил, авантюры и перебор.",
      "sextile": "Марс и Юпитер в секстиле: один мягко поддерживает инициативу другого, добавляет оптимизма. Сила — энергичный, удачливый тандем; риск — недоиспользовать заряд.",
      "square": "Марс и Юпитер в квадрате: один раздувает действия другого до перебора. Рискованные авантюры и самонадеянность. Сила — смелая, амбициозная динамика; риск — опрометчивость и расточительность сил.",
      "trine": "Марс и Юпитер в тригоне: один естественно вдохновляет и поддерживает начинания другого, добавляя удачи и размаха. Сила — энтузиазм, смелость и продуктивность; риск — перебор.",
      "opposition": "Марс и Юпитер в оппозиции: напор одного и размах другого на разных полюсах — стимулируют, но могут провоцировать перебор. Сила — энергичная предприимчивость; риск — авантюры и разные представления о мере."
    },
    "mars-saturn": {
      "conjunction": "Марс одного и Сатурн другого в соединении: один сдерживает и дисциплинирует энергию другого — действия становятся выверенными, но иногда скованными. Сила — выносливость, контроль и стратегическое усилие; риск — фрустрация и ощущение «тормоза».",
      "sextile": "Марс и Сатурн в секстиле: один придаёт энергии другого дисциплину и устойчивость без удушья. Сила — выносливый, упорный тандем; риск — недоиспользовать этот фокус.",
      "square": "Марс и Сатурн в квадрате: напор одного сталкивается с ограничениями другого. Раздражение, блокировка действий. Сила — закалённое, дисциплинированное достижение через сопротивление; риск — фрустрация и холод.",
      "trine": "Марс и Сатурн в тригоне: один придаёт действиям другого устойчивость, выдержку и стратегию без давления. Сила — выносливость, дисциплина и надёжный результат; риск — осторожность, тормозящая смелые шаги.",
      "opposition": "Марс и Сатурн в оппозиции: напор одного и сдержанность другого на разных полюсах — энергия против контроля. Сила — дисциплинированная сила через вызов; риск — фрустрация, конфликты и борьба темпов."
    },
    "mars-uranus": {
      "conjunction": "Марс одного и Уран другого в соединении: один придаёт действиям другого внезапность, дерзость и свободу — энергия искрит. Сила — смелость, оригинальность и электризующий драйв; риск — импульсивность, безрассудство и разрушительные порывы.",
      "sextile": "Марс и Уран в секстиле: один мягко добавляет действиям другого изобретательности и драйва. Сила — смелая, оригинальная инициатива; риск — нужен повод, чтобы заряд включился.",
      "square": "Марс и Уран в квадрате: тяга одного к свободе делает энергию другого импульсивной и бунтарской. Внезапные вспышки и сопротивление рамкам. Сила — дерзкая оригинальность; риск — безрассудство и разрушительные порывы.",
      "trine": "Марс и Уран в тригоне: один легко добавляет действиям другого смелости, скорости и оригинальности. Сила — храбрость, новаторство и быстрая реакция; риск — принимать дерзость как должное.",
      "opposition": "Марс и Уран в оппозиции: напор одного и свобода другого на разных полюсах — динамично, но взрывоопасно. Сила — пробуждающая, электризующая энергия; риск — столкновения и внезапные разрывы."
    },
    "mars-neptune": {
      "conjunction": "Марс одного и Нептун другого в соединении: один размывает и одухотворяет действия другого. Энергия течёт по вдохновению, а не по силе. Сила — творческое, чуткое, вдохновлённое действие; риск — спад мотивации и неясные цели.",
      "sextile": "Марс и Нептун в секстиле: один мягко вдохновляет действия другого, добавляет интуиции и творчества. Сила — вдохновлённая, идейная активность; риск — дать энергии раствориться.",
      "square": "Марс и Нептун в квадрате: напор одного и иллюзии другого путаются. Размытые цели и действия впустую. Сила — вдохновлённое действие при заземлении; риск — слабая мотивация и разочарования.",
      "trine": "Марс и Нептун в тригоне: один естественно вдохновляет действия другого, придаёт им творчество и интуицию. Сила — артистичная, идейная, чуткая активность; риск — уход от конкретных целей.",
      "opposition": "Марс и Нептун в оппозиции: напор одного и идеалы другого на разных полюсах — вдохновение против действия. Сила — вдохновлённая, сострадательная энергия; риск — путаница и действия впустую."
    },
    "mars-pluto": {
      "conjunction": "Марс одного и Плутон другого в соединении: один придаёт действиям другого огромную силу, интенсивность и волю. Связь мощная и преображающая. Сила — несгибаемая воля, выносливость и страсть; риск — борьба за власть, безжалостность и разрушительный накал.",
      "sextile": "Марс и Плутон в секстиле: один помогает действиям другого обрести глубину и преображающую силу. Сила — интенсивная, эффективная воля; риск — оставить эту мощь нераскрытой.",
      "square": "Марс и Плутон в квадрате: напор одного и сила другого сталкиваются. Силовая борьба и навязчивая интенсивность. Сила — глубочайшая воля через кризис; риск — безжалостность, доминирование и саморазрушительный накал.",
      "trine": "Марс и Плутон в тригоне: один органично углубляет и усиливает действия другого, дарит выносливость и волю. Сила — мощная воля, регенерация и стойкость; риск — недооценить интенсивность связи.",
      "opposition": "Марс и Плутон в оппозиции: напор одного и сила другого на разных полюсах. Мощное притяжение и борьба за власть. Сила — преображающая воля через противостояние; риск — силовые игры, безжалостность и крайности."
    },
    "jupiter-sun": {
      "conjunction": "Юпитер одного и Солнце другого в соединении: один расширяет горизонты другого, верит в него и приносит удачу. Второй вдохновляет напор первого. Сила — оптимизм, щедрость и взаимный рост; риск — потакание, переоценка возможностей и излишества вдвоём.",
      "sextile": "Юпитер и Солнце в секстиле: один мягко поддерживает и воодушевляет другого. Связь лёгкая и способствует развитию. Сила — оптимизм и взаимная польза; риск — лень и расчёт на «само сложится».",
      "square": "Юпитер и Солнце в квадрате: один переоценивает или «перехваливает» другого. Возможны излишества и расхождения в убеждениях. Сила — щедрая, растущая динамика; риск — самонадеянность и пустые обещания.",
      "trine": "Юпитер и Солнце в тригоне: один естественно вдохновляет другого и приносит ему удачу и веру в себя. Сила — рост, оптимизм и взаимная щедрость; риск — расслабленность и излишества.",
      "opposition": "Юпитер и Солнце в оппозиции: размах одного и воля другого на разных полюсах — взаимный рост с риском перебора. Сила — щедрость и развитие; риск — преувеличения и навязывание убеждений."
    },
    "jupiter-moon": {
      "conjunction": "Юпитер одного и Луна другого в соединении: один окружает чувства другого оптимизмом, заботой и щедростью. Тёплое, поддерживающее сочетание. Сила — эмоциональная щедрость, рост и уют; риск — потакание и избыточная опека.",
      "sextile": "Юпитер и Луна в секстиле: один мягко поддерживает и подбадривает другого эмоционально. Сила — оптимизм, тепло и взаимная забота; риск — лень и расчёт на «само наладится».",
      "square": "Юпитер и Луна в квадрате: один перебарщивает с заботой или оптимизмом, не считываясь с нуждами другого. Сила — щедрость и тепло; риск — излишества и разные эмоциональные масштабы.",
      "trine": "Юпитер и Луна в тригоне: один естественно согревает и поддерживает другого, дарит чувство защищённости и роста. Сила — эмоциональная щедрость, оптимизм и уют; риск — потакание и расслабленность.",
      "opposition": "Юпитер и Луна в оппозиции: щедрость одного и нужды другого на разных полюсах. Сила — забота и оптимизм; риск — избыточная опека и разные представления о мере."
    },
    "jupiter-mercury": {
      "conjunction": "Юпитер одного и Меркурий другого в соединении: один расширяет мышление другого, добавляет оптимизма и широты. Второй конкретизирует идеи первого. Сила — вдохновляющий обмен идеями и рост; риск — преувеличения и пропуск деталей.",
      "sextile": "Юпитер и Меркурий в секстиле: один мягко расширяет кругозор другого. Разговоры воодушевляют. Сила — оптимистичный, познавательный обмен; риск — поверхностность без углубления.",
      "square": "Юпитер и Меркурий в квадрате: один мыслит слишком широко для конкретного другого. Расхождения в масштабе и деталях. Сила — рост через дискуссию; риск — преувеличения и небрежность к фактам.",
      "trine": "Юпитер и Меркурий в тригоне: один естественно вдохновляет мышление другого, дарит широту и оптимизм. Сила — познавательный, обнадёживающий диалог; риск — небрежность к деталям.",
      "opposition": "Юпитер и Меркурий в оппозиции: широкие взгляды одного и детальный ум другого на разных полюсах. Сила — соединение масштаба и конкретики; риск — преувеличения."
    },
    "jupiter-venus": {
      "conjunction": "Юпитер одного и Венера другого в соединении: один расширяет любовь и радости другого, дарит щедрость и оптимизм. Тёплое и удачное сочетание. Сила — тепло, везение в отношениях и удовольствие вдвоём; риск — потакание, расточительность и идеализация.",
      "sextile": "Юпитер и Венера в секстиле: один мягко добавляет в любовь другого щедрости и оптимизма. Сила — тепло, радость и доброжелательность; риск — перебор с удовольствиями.",
      "square": "Юпитер и Венера в квадрате: один перебарщивает с щедростью или идеализирует отношения. Возможны излишества и нереалистичные ожидания. Сила — тёплая, щедрая динамика; риск — расточительность и переоценка чувств.",
      "trine": "Юпитер и Венера в тригоне: один естественно умножает любовь и радости другого, дарит удачу и щедрость. Сила — тепло, везение и большое сердце; риск — потакание и излишества.",
      "opposition": "Юпитер и Венера в оппозиции: щедрость одного и любовь другого на разных полюсах. Сила — щедрость и радость; риск — расточительность и нереалистичные ожидания."
    },
    "jupiter-mars": {
      "conjunction": "Юпитер одного и Марс другого в соединении: один воодушевляет и расширяет действия другого, придаёт смелости и оптимизма. Вместе много энергии и энтузиазма. Сила — драйв, предприимчивость и удача в начинаниях; риск — переоценка сил, авантюры и перебор.",
      "sextile": "Юпитер и Марс в секстиле: один мягко поддерживает инициативу другого, добавляет оптимизма. Сила — энергичный, удачливый тандем; риск — ждать вместо действий.",
      "square": "Юпитер и Марс в квадрате: один раздувает действия другого до перебора. Рискованные авантюры и самонадеянность. Сила — смелая, амбициозная динамика; риск — опрометчивость и расточительность энергии.",
      "trine": "Юпитер и Марс в тригоне: один естественно вдохновляет и поддерживает начинания другого, добавляя удачи и размаха. Сила — энтузиазм, смелость и продуктивность; риск — перебор.",
      "opposition": "Юпитер и Марс в оппозиции: размах одного и напор другого на разных полюсах. Стимулируют, но могут провоцировать перебор. Сила — энергичная предприимчивость; риск — авантюры и разные представления о мере."
    },
    "jupiter-jupiter": {
      "conjunction": "Юпитеры партнёров в соединении: схожие взгляды на рост, веру и смысл. Легко разделять оптимизм. У людей близкого возраста это сочетание частое — говорит и об общности поколения. Сила — общие ценности и взаимное воодушевление; риск — совместный перебор и излишества.",
      "sextile": "Юпитеры в секстиле: взгляды на жизнь и рост мягко совпадают (отчасти поколенческий аспект). Сила — общий оптимизм и поддержка развития; риск — расслабленность.",
      "square": "Юпитеры в квадрате: убеждения, вера и представления о росте расходятся. Разные «как надо жить» (часто между разными поколениями). Сила — расширение через различие взглядов; риск — споры о ценностях.",
      "trine": "Юпитеры в тригоне: мировоззрение и оптимизм естественно созвучны (отчасти поколенческий аспект). Сила — общая вера, рост и щедрость; риск — совместная склонность к излишествам.",
      "opposition": "Юпитеры в оппозиции: взгляды на смысл и веру противоположны. Расширяют кругозор друг друга, но спорят о ценностях. Сила — взаимное дополнение мировоззрений; риск — догматизм."
    },
    "jupiter-saturn": {
      "conjunction": "Юпитер одного и Сатурн другого в соединении: оптимизм и размах встречают осторожность и структуру. Вместе получается реалистичный, устойчивый рост. Сила — взвешенная амбиция и долговечные планы; риск — качели надежды и сомнения.",
      "sextile": "Юпитер и Сатурн в секстиле: вера одного и дисциплина другого легко дополняют друг друга. Сила — практичный, устойчивый рост; риск — недоиспользовать баланс размаха и опоры.",
      "square": "Юпитер и Сатурн в квадрате: размах одного сталкивается с ограничениями другого. Напряжение между «давай рискнём» и «давай притормозим». Сила — закалённое, реалистичное достижение; риск — фрустрация и качели оптимизма и пессимизма.",
      "trine": "Юпитер и Сатурн в тригоне: один добавляет веру и размах, другой — реализм и структуру. Строят разумно и надолго. Сила — реалистичная амбиция и устойчивый успех; риск — осторожность, сдерживающая потенциал.",
      "opposition": "Юпитер и Сатурн в оппозиции: размах одного и сдержанность другого на разных полюсах — рост против осторожности. Сила — зрелое равновесие риска и опоры; риск — качели между перебором и блокировкой."
    },
    "jupiter-uranus": {
      "conjunction": "Юпитер одного и Уран другого в соединении: один приносит в рост другого свободу, новизну и неожиданные возможности. Вместе — тяга к переменам и риску. Сила — удачные прорывы, оригинальность и оптимизм; риск — беспокойность и безрассудные перемены.",
      "sextile": "Юпитер и Уран в секстиле: один мягко открывает другому свежие возможности через перемены. Сила — изобретательный оптимизм и удачное чутьё; риск — ждать удачу вместо того, чтобы создавать её.",
      "square": "Юпитер и Уран в квадрате: жажда свободы одного раздувает аппетит другого к риску. Резкие, авантюрные ходы. Сила — смелое новаторство; риск — безрассудные перемены и резкие развороты.",
      "trine": "Юпитер и Уран в тригоне: один легко приносит другому удачу через оригинальность и открытость новому. Сила — изобретательный оптимизм, свобода и везение; риск — принимать удачу как должное.",
      "opposition": "Юпитер и Уран в оппозиции: размах одного и свобода другого на разных полюсах — рост через неожиданное, но качельно. Сила — развитие через перемены; риск — беспокойность и резкие повороты."
    },
    "jupiter-neptune": {
      "conjunction": "Юпитер одного и Нептун другого в соединении: один одухотворяет рост другого, окрашивает связь идеализмом и состраданием. Сила — вдохновлённая вера, щедрость и общая мечта; риск — иллюзии и нереалистичный идеализм.",
      "sextile": "Юпитер и Нептун в секстиле: вера одного и воображение другого мягко дополняют друг друга. Сила — идеализм и духовное тепло; риск — больше мечтать, чем делать.",
      "square": "Юпитер и Нептун в квадрате: рост одного и иллюзии другого раздувают друг друга. Завышенные мечты и оторванность от реальности. Сила — мечта через отрезвление; риск — иллюзии и нереалистичные надежды.",
      "trine": "Юпитер и Нептун в тригоне: один естественно соединяет оптимизм другого с состраданием и творческой мечтой. Сила — вдохновлённая щедрость и идеализм; риск — уход в мечты.",
      "opposition": "Юпитер и Нептун в оппозиции: вера одного и идеалы другого на разных полюсах — вдохновляет, но туманит. Сила — сострадательная мечта; риск — иллюзии и разочарования."
    },
    "jupiter-pluto": {
      "conjunction": "Юпитер одного и Плутон другого в соединении: один придаёт росту другого глубину, силу и масштаб — общая тяга к преображению и большому влиянию. Сила — мощная вера, воля и способность переделывать; риск — одержимость властью и фанатизм.",
      "sextile": "Юпитер и Плутон в секстиле: один помогает другому углублять цели и преображать обстоятельства. Сила — сфокусированная амбиция и влияние; риск — оставить эту силу нераскрытой.",
      "square": "Юпитер и Плутон в квадрате: размах одного и власть другого сталкиваются. Жажда контроля, фанатичный пыл. Сила — масштабное достижение через напряжение; риск — одержимость и стремление доминировать.",
      "trine": "Юпитер и Плутон в тригоне: один органично соединяет рост другого с глубиной и преображающим влиянием. Сила — мощная вера, регенерация и крупный успех; риск — недооценить тягу к власти.",
      "opposition": "Юпитер и Плутон в оппозиции: размах одного и власть другого на разных полюсах. Рост через большие ставки. Сила — трансформация через сильные столкновения; риск — силовая борьба и перебор."
    },
    "saturn-sun": {
      "conjunction": "Сатурн одного и Солнце другого в соединении: один придаёт жизни другого структуру и серьёзность — связь прочная и «кармическая». Сила — стабильность, ответственность и долговечность; риск — один давит и сковывает, другой чувствует холод и осуждение.",
      "sextile": "Сатурн и Солнце в секстиле: один даёт другому устойчивость и опору без удушья. Сила — надёжность, зрелая поддержка и дисциплина; риск — недоиспользовать эту опору.",
      "square": "Сатурн и Солнце в квадрате: один ограничивает, контролирует или критикует самовыражение другого. Напряжение долга и тяжести. Сила — рост через дисциплину и проверку временем; риск — холод, подавление и обиды.",
      "trine": "Сатурн и Солнце в тригоне: один даёт другому надёжную опору, мудрость и стабильность без давления. Связь зрелая и долговечная. Сила — поддержка, ответственность и прочность; риск — некоторая сухость.",
      "opposition": "Сатурн и Солнце в оппозиции: ограничения одного и воля другого на разных полюсах. Один видится как авторитет или «тормоз». Сила — взросление через вызов; риск — подавление, критика и скованность."
    },
    "saturn-moon": {
      "conjunction": "Сатурн одного и Луна другого в соединении: серьёзное, «кармическое» сочетание. Один даёт чувствам другого опору, но может и холодить. Сила — надёжность и долговечность; риск — эмоциональный холод и ощущение, что любовь надо заслужить.",
      "sextile": "Сатурн и Луна в секстиле: один даёт чувствам другого зрелую опору без давления. Сила — надёжность и эмоциональная зрелость; риск — недоиспользовать эту опору.",
      "square": "Сатурн и Луна в квадрате: один сковывает или холодит чувства другого. Нехватка тепла и одобрения. Сила — рост через ответственность; риск — холод, подавление чувств и ощущение, что любовь надо заслужить.",
      "trine": "Сатурн и Луна в тригоне: один даёт другому эмоциональную надёжность, стабильность и зрелую заботу без давления. Сила — опора, верность и прочность чувств; риск — некоторая сдержанность.",
      "opposition": "Сатурн и Луна в оппозиции: сдержанность одного и чувства другого на разных полюсах. Один кажется холодным или ограничивающим. Сила — взросление чувств через вызов; риск — холод, дистанция и подавленность."
    },
    "saturn-mercury": {
      "conjunction": "Сатурн одного и Меркурий другого в соединении: один придаёт мышлению другого структуру и серьёзность. Разговоры взвешенные, глубокие. Сила — основательный, продуманный обмен; риск — один давит на другого, ощущение холода и неуверенности в общении.",
      "sextile": "Сатурн и Меркурий в секстиле: один придаёт идеям другого структуру и реализм без давления. Сила — практичный, надёжный диалог; риск — недоиспользовать эту опору.",
      "square": "Сатурн и Меркурий в квадрате: один критикует, ограничивает или обесценивает мысли другого. Неуверенность, ощущение «недостаточно умён». Сила — дисциплина мышления через вызов; риск — критика, холод и зажатость в общении.",
      "trine": "Сатурн и Меркурий в тригоне: один даёт мышлению другого зрелость, структуру и реализм без давления. Сила — продуманный, надёжный диалог; риск — некоторая сухость.",
      "opposition": "Сатурн и Меркурий в оппозиции: строгость одного и гибкий ум другого на разных полюсах. Сила — баланс дисциплины и свободы мысли; риск — критика и ощущение непонятости."
    },
    "saturn-venus": {
      "conjunction": "Сатурн одного и Венера другого в соединении: один придаёт любви другого серьёзность, верность и долговечность, но может и холодить. Сила — преданность, обязательность и прочность связи; риск — холод, скованность и ощущение, что любовь под условием.",
      "sextile": "Сатурн и Венера в секстиле: один даёт чувствам другого надёжность и зрелость без давления. Сила — верность и стабильность; риск — недоиспользовать эту опору.",
      "square": "Сатурн и Венера в квадрате: один сдерживает или обесценивает нежность другого. Холод, дистанция, страх отвержения. Сила — верность через испытания; риск — холодность, скупость на тепло и чувство нехватки любви.",
      "trine": "Сатурн и Венера в тригоне: один даёт любви другого прочную, зрелую опору без давления. Сила — преданность, надёжность и долговечность чувств; риск — некоторая сдержанность.",
      "opposition": "Сатурн и Венера в оппозиции: сдержанность одного и нежность другого на разных полюсах. Сила — зрелая, проверенная любовь; риск — холод, дистанция и чувство недолюбленности."
    },
    "saturn-mars": {
      "conjunction": "Сатурн одного и Марс другого в соединении: один сдерживает и дисциплинирует энергию другого — действия становятся выверенными, но иногда скованными. Сила — выносливость, контроль и стратегическое усилие; риск — фрустрация, блок энергии и ощущение «тормоза».",
      "sextile": "Сатурн и Марс в секстиле: один придаёт энергии другого дисциплину и устойчивость без удушья. Сила — выносливый, упорный тандем; риск — недоиспользовать этот фокус.",
      "square": "Сатурн и Марс в квадрате: ограничения одного сталкиваются с напором другого. Раздражение, блокировка действий. Сила — закалённое, дисциплинированное достижение через сопротивление; риск — фрустрация, холод и силовое противостояние.",
      "trine": "Сатурн и Марс в тригоне: один придаёт действиям другого устойчивость, выдержку и стратегию без давления. Сила — выносливость, дисциплина и надёжный результат; риск — осторожность, тормозящая смелые шаги.",
      "opposition": "Сатурн и Марс в оппозиции: сдержанность одного и напор другого на разных полюсах — контроль против энергии. Сила — дисциплинированная сила через вызов; риск — фрустрация, конфликты и борьба темпов."
    },
    "saturn-jupiter": {
      "conjunction": "Сатурн одного и Юпитер другого в соединении: осторожность и структура встречают оптимизм и размах. Вместе получается реалистичный, устойчивый рост. Сила — взвешенная амбиция и долговечные планы; риск — качели надежды и сомнения.",
      "sextile": "Сатурн и Юпитер в секстиле: дисциплина одного и вера другого легко дополняют друг друга. Сила — практичный, устойчивый рост; риск — недоиспользовать баланс.",
      "square": "Сатурн и Юпитер в квадрате: ограничения одного сталкиваются с размахом другого. Напряжение между «давай притормозим» и «давай рискнём». Сила — закалённое, реалистичное достижение; риск — фрустрация и качели оптимизма и пессимизма.",
      "trine": "Сатурн и Юпитер в тригоне: один добавляет реализм и структуру, другой — веру и размах. Строят разумно и надолго. Сила — реалистичная амбиция и устойчивый успех; риск — осторожность, сдерживающая потенциал.",
      "opposition": "Сатурн и Юпитер в оппозиции: сдержанность одного и размах другого на разных полюсах — осторожность против роста. Сила — зрелое равновесие опоры и риска; риск — качели между блокировкой и перебором."
    },
    "saturn-saturn": {
      "conjunction": "Сатурны партнёров в соединении: схожее понимание долга, ответственности и структуры. Обычно близкий возраст — аспект во многом поколенческий. Сила — общие ценности зрелости и взаимная надёжность; риск — совместная скованность и излишняя серьёзность.",
      "sextile": "Сатурны в секстиле: чувство ответственности и опоры мягко совпадает (отчасти поколенческий аспект). Сила — зрелая, надёжная совместимость; риск — излишняя серьёзность.",
      "square": "Сатурны в квадрате: представления о долге, дисциплине и правилах расходятся. Часто разрыв в возрасте или поколениях. Сила — взросление через различие; риск — взаимные ограничения и борьба «как правильно».",
      "trine": "Сатурны в тригоне: чувство ответственности и зрелости естественно созвучно (отчасти поколенческий аспект). Сила — надёжность, общая опора и долговечность; риск — излишняя серьёзность и сдержанность.",
      "opposition": "Сатурны в оппозиции: подходы к долгу и структуре противоположны. Часто разница поколений. Сила — взаимное дополнение зрелых позиций; риск — взаимные ограничения и ощущение тяжести."
    },
    "saturn-uranus": {
      "conjunction": "Сатурн одного и Уран другого в соединении: структура встречает тягу к свободе — напряжение «порядок против перемен». Обе планеты медленные, аспект во многом поколенческий; личностно — через дома и личные планеты. Сила — дисциплинированное новаторство; риск — рывки между стабильностью и бунтом.",
      "sextile": "Сатурн и Уран в секстиле: дисциплина одного и новаторство другого мягко дополняют друг друга (во многом поколенческий аспект, личностно — через дома и личные планеты). Сила — практичные, заземлённые перемены; риск — оставить баланс нераскрытым.",
      "square": "Сатурн и Уран в квадрате: порядок одного и свобода другого сталкиваются (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — реформа через трение; риск — рывки и борьба старого и нового.",
      "trine": "Сатурн и Уран в тригоне: структура одного и новаторство другого легко сочетаются (в значительной мере поколенческий аспект, личностно — через дома и личные планеты). Сила — практичное, устойчивое новаторство; риск — принять баланс как должное.",
      "opposition": "Сатурн и Уран в оппозиции: порядок одного и свобода другого на разных полюсах (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — соединение традиции и перемен; риск — качели между жёсткостью и хаосом."
    },
    "saturn-neptune": {
      "conjunction": "Сатурн одного и Нептун другого в соединении: структура встречает мечту и идеал. Попытка заземлить грёзы в реальность (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — практичный идеализм; риск — разочарование, сомнения и туман.",
      "sextile": "Сатурн и Нептун в секстиле: дисциплина одного и воображение другого мягко дополняют друг друга (поколенческий аспект, личностно — через дома и личные планеты). Сила — заземлённая мечта; риск — оставить видение невоплощённым.",
      "square": "Сатурн и Нептун в квадрате: реализм одного и иллюзии другого сталкиваются (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — мечта через усилие; риск — уныние и колебания между цинизмом и фантазией.",
      "trine": "Сатурн и Нептун в тригоне: структура одного и воображение другого легко сочетаются — мечта обретает форму (поколенческий аспект, личностно — через дома и личные планеты). Сила — практичный идеализм; риск — без усилия видение остаётся туманным.",
      "opposition": "Сатурн и Нептун в оппозиции: реальность одного и идеал другого на разных полюсах (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — мечта, проверенная реальностью; риск — сомнения и качели скепсиса и иллюзий."
    },
    "saturn-pluto": {
      "conjunction": "Сатурн одного и Плутон другого в соединении: структура сплавляется с глубинной силой — тяжёлые трансформации, перестройка через кризис (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — выносливость и способность перестраивать; риск — жёсткость, контроль и груз.",
      "sextile": "Сатурн и Плутон в секстиле: дисциплина одного и сила другого мягко дополняют друг друга (поколенческий аспект, личностно — через дома и личные планеты). Сила — упорная стойкость и глубокая работа; риск — оставить силу неиспользованной.",
      "square": "Сатурн и Плутон в квадрате: структура одного и власть другого сталкиваются (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — железная выносливость через кризис; риск — жёсткость, безжалостность и тяжёлый блок.",
      "trine": "Сатурн и Плутон в тригоне: структура одного и сила другого легко сочетаются (поколенческий аспект, личностно — через дома и личные планеты). Сила — выносливость и устойчивая мощь перестройки; риск — недооценить собственную неумолимость.",
      "opposition": "Сатурн и Плутон в оппозиции: структура одного и власть другого на разных полюсах (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — глубокая стойкость через давление; риск — силовая борьба, жёсткость и изматывающий конфликт."
    },
    "uranus-sun": {
      "conjunction": "Уран одного и Солнце другого в соединении: один приносит в жизнь другого свежесть, свободу и неожиданность, будоражит и пробуждает. Сила — яркость, оригинальность и притяжение новизны; риск — нестабильность и нехватка опоры.",
      "sextile": "Уран и Солнце в секстиле: один мягко вдохновляет другого на новое и нестандартное. Связь живая и освежающая. Сила — творческий импульс и взаимная свобода; риск — оставить искру без развития.",
      "square": "Уран и Солнце в квадрате: стремление одного к свободе и переменам расшатывает устойчивость другого. Возможны внезапные сбои и бунт. Сила — пробуждение и динамика; риск — нестабильность и резкие повороты.",
      "trine": "Уран и Солнце в тригоне: один легко привносит в жизнь другого новизну и свободу, не разрушая её. Сила — оригинальность, лёгкость и взаимное пространство; риск — принимать свободу за безразличие.",
      "opposition": "Уран и Солнце в оппозиции: тяга одного к свободе противостоит потребности другого в устойчивости. Притяжение волнующее, но качельное. Сила — пробуждение через непохожесть; риск — нестабильность и дистанция."
    },
    "uranus-moon": {
      "conjunction": "Уран одного и Луна другого в соединении: один будоражит чувства другого, приносит новизну и непредсказуемость. Сила — живость, свежесть и волнение; риск — нестабильность и нехватка надёжности.",
      "sextile": "Уран и Луна в секстиле: один мягко освежает чувства другого. Между ними лёгкость и свобода. Сила — живая, нескучная теплота; риск — оставить искру без глубины.",
      "square": "Уран и Луна в квадрате: тяга одного к свободе расшатывает потребность другого в стабильности. Сила — пробуждение чувств; риск — непредсказуемость и нестабильность.",
      "trine": "Уран и Луна в тригоне: один легко привносит в чувства другого свежесть и свободу, не разрушая близость. Сила — живость, лёгкость и взаимное пространство; риск — принять свободу за прохладу.",
      "opposition": "Уран и Луна в оппозиции: тяга одного к свободе и потребность другого в близости на разных полюсах. Притяжение волнующее, но качельное. Сила — пробуждение через непохожесть; риск — нестабильность и дистанция."
    },
    "uranus-mercury": {
      "conjunction": "Уран одного и Меркурий другого в соединении: один будоражит ум другого неожиданными идеями. Общение искрит. Сила — озарения, оригинальность и интеллектуальное волнение; риск — нервозность и непоследовательность.",
      "sextile": "Уран и Меркурий в секстиле: один подбрасывает другому свежие идеи. Разговоры живые и нескучные. Сила — изобретательность и открытость новому; риск — оставить искру без развития.",
      "square": "Уран и Меркурий в квадрате: нестандартность одного расшатывает мышление другого. Споры, резкость. Сила — оригинальность через трение; риск — нервозность и интеллектуальный бунт.",
      "trine": "Уран и Меркурий в тригоне: один легко вдохновляет ум другого на новое, не сбивая с толку. Сила — озарения, гибкость и нескучный диалог; риск — принимать лёгкость как должное.",
      "opposition": "Уран и Меркурий в оппозиции: оригинальность одного и упорядоченный ум другого на разных полюсах. Сила — взаимное пробуждение; риск — споры и непостоянство."
    },
    "uranus-venus": {
      "conjunction": "Уран одного и Венера другого в соединении: один вносит в любовь другого волнение, новизну и свободу. Притяжение яркое и внезапное. Сила — искра, оригинальность и страсть к новому; риск — нестабильность и непостоянство.",
      "sextile": "Уран и Венера в секстиле: один мягко освежает чувства другого, добавляет лёгкости и свободы. Сила — живая, нескучная нежность; риск — оставить искру без глубины.",
      "square": "Уран и Венера в квадрате: тяга одного к свободе расшатывает потребность другого в близости. Внезапные притяжения и охлаждения. Сила — волнение и новизна; риск — непостоянство и разрывы.",
      "trine": "Уран и Венера в тригоне: один легко привносит в любовь другого свежесть и свободу, не разрушая близость. Сила — оригинальность, лёгкость и притяжение; риск — ценить свободу больше глубины.",
      "opposition": "Уран и Венера в оппозиции: тяга одного к свободе и нежность другого на разных полюсах. Волнующее, но качельное притяжение. Сила — яркая, пробуждающая связь; риск — непостоянство."
    },
    "uranus-mars": {
      "conjunction": "Уран одного и Марс другого в соединении: один придаёт действиям другого внезапность, дерзость и свободу — энергия искрит. Сила — смелость, оригинальность и электризующий драйв; риск — импульсивность, безрассудство и разрушительные порывы.",
      "sextile": "Уран и Марс в секстиле: один мягко добавляет действиям другого изобретательности и драйва. Сила — смелая, оригинальная инициатива; риск — нужен повод, чтобы заряд включился.",
      "square": "Уран и Марс в квадрате: тяга одного к свободе делает энергию другого импульсивной и бунтарской. Сила — дерзкая оригинальность; риск — безрассудство и разрушительные порывы.",
      "trine": "Уран и Марс в тригоне: один легко добавляет действиям другого смелости, скорости и оригинальности. Сила — храбрость, новаторство и быстрая реакция; риск — принимать дерзость как должное.",
      "opposition": "Уран и Марс в оппозиции: свобода одного и напор другого на разных полюсах — динамично, но взрывоопасно. Сила — пробуждающая, электризующая энергия; риск — столкновения и внезапные разрывы."
    },
    "uranus-jupiter": {
      "conjunction": "Уран одного и Юпитер другого в соединении: один приносит в рост другого свободу, новизну и неожиданные возможности. Вместе — тяга к переменам и риску. Сила — удачные прорывы, оригинальность и оптимизм; риск — беспокойность и безрассудные перемены.",
      "sextile": "Уран и Юпитер в секстиле: один мягко открывает другому свежие возможности. Перемены идут на пользу. Сила — изобретательный оптимизм и удачное чутьё; риск — ждать удачу вместо того, чтобы создавать.",
      "square": "Уран и Юпитер в квадрате: жажда свободы одного раздувает аппетит другого к риску. Резкие, авантюрные ходы. Сила — смелое новаторство; риск — безрассудные перемены и резкие развороты.",
      "trine": "Уран и Юпитер в тригоне: один легко приносит другому удачу через оригинальность и открытость. Сила — изобретательный оптимизм, свобода и везение; риск — принимать удачу как должное.",
      "opposition": "Уран и Юпитер в оппозиции: свобода одного и размах другого на разных полюсах. Рост через неожиданное, но качельно. Сила — развитие через перемены; риск — беспокойность и резкие повороты."
    },
    "uranus-saturn": {
      "conjunction": "Уран одного и Сатурн другого в соединении: тяга к свободе встречает структуру — напряжение «перемены против порядка» (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — дисциплинированное новаторство; риск — рывки между бунтом и стабильностью.",
      "sextile": "Уран и Сатурн в секстиле: новаторство одного и дисциплина другого мягко дополняют друг друга (поколенческий аспект, личностно — через дома и личные планеты). Сила — практичные, заземлённые перемены; риск — оставить баланс нераскрытым.",
      "square": "Уран и Сатурн в квадрате: свобода одного и порядок другого сталкиваются (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — реформа через трение; риск — рывки и борьба нового и старого.",
      "trine": "Уран и Сатурн в тригоне: новаторство одного и структура другого легко сочетаются (поколенческий аспект, личностно — через дома и личные планеты). Сила — практичное, устойчивое новаторство; риск — принять баланс как должное.",
      "opposition": "Уран и Сатурн в оппозиции: свобода одного и порядок другого на разных полюсах (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — соединение перемен и традиции; риск — качели между хаосом и жёсткостью."
    },
    "uranus-uranus": {
      "conjunction": "Уранов партнёров в соединении: оба одного поколения с общим чувством свободы и нестандартности. Аспект почти полностью поколенческий; личностно — через дома и личные планеты. Сила — общие взгляды на свободу и прогресс; риск — совместная нестабильность.",
      "sextile": "Ураны в секстиле: близкие поколения с созвучным новаторским настроем (поколенческий аспект; личностно — через дома и личные планеты). Сила — лёгкая общность взглядов на свободу; риск — поверхностность вне личного контекста.",
      "square": "Ураны в квадрате: разные поколения с расходящимся отношением к свободе и переменам (поколенческий аспект, личностно — через дома и личные планеты). Сила — встреча разных взглядов на новое; риск — конфликт ценностей поколений.",
      "trine": "Ураны в тригоне: поколения с гармоничным духом новаторства и свободы (поколенческий аспект; личностно — через дома и личные планеты). Сила — общий прогрессивный настрой; риск — без личных контактов влияние остаётся общим.",
      "opposition": "Ураны в оппозиции: поколения с противоположным отношением к свободе (заметный возрастной разрыв; поколенческий аспект, личностно — через дома и личные планеты). Сила — диалог разных эпох; риск — разрыв ценностей."
    },
    "uranus-neptune": {
      "conjunction": "Уран одного и Нептун другого в соединении: новаторство сливается с мечтой — смесь прогресса, технологий и духовных идеалов. Почти полностью поколенческий аспект; личностно — через дома и личные планеты. Сила — визионерское творчество и пробуждение; риск — нестабильные идеалы и путаница.",
      "sextile": "Уран и Нептун в секстиле: новаторство одного и воображение другого мягко дополняют друг друга (поколенческий аспект; личностно — через дома и личные планеты). Сила — визионерская креативность; риск — расплывчатость вне личного контекста.",
      "square": "Уран и Нептун в квадрате: перемены одного и идеалы другого в напряжении (поколенческий аспект, личностно — через дома и личные планеты). Сила — творческие прорывы через трение; риск — нестабильность и разочарованные идеалы.",
      "trine": "Уран и Нептун в тригоне: новаторство одного и воображение другого созвучны (поколенческий аспект; личностно — через дома и личные планеты). Сила — вдохновлённое новаторство; риск — без личного фокуса влияние туманно.",
      "opposition": "Уран и Нептун в оппозиции: новаторство одного и идеал другого на разных полюсах (поколенческий аспект, личностно — через дома и личные планеты). Сила — напряжение, рождающее видение; риск — нестабильность и иллюзии."
    },
    "uranus-pluto": {
      "conjunction": "Уран одного и Плутон другого в соединении: радикальные перемены и глубинная трансформация сплавляются — эпоха потрясений (почти полностью поколенческий аспект; личностно — через дома и личные планеты). Сила — мощь обновления и слома старого; риск — экстремизм и хаотичные перемены.",
      "sextile": "Уран и Плутон в секстиле: новаторство одного и сила другого мягко дополняют друг друга (поколенческий аспект; личностно — через дома и личные планеты). Сила — конструктивные, масштабные перемены; риск — расфокус вне личного контекста.",
      "square": "Уран и Плутон в квадрате: перемены одного и власть другого в напряжении (поколенческий аспект, личностно — через дома и личные планеты). Сила — революционная энергия; риск — экстремизм и разрушительность.",
      "trine": "Уран и Плутон в тригоне: новаторство одного и трансформация другого созвучны (поколенческий аспект; личностно — через дома и личные планеты). Сила — мощные конструктивные перемены; риск — без личного фокуса сила безлична.",
      "opposition": "Уран и Плутон в оппозиции: свобода одного и власть другого на разных полюсах (поколенческий аспект, личностно — через дома и личные планеты). Сила — преображающее напряжение; риск — экстремизм и разрушительный конфликт."
    },
    "neptune-sun": {
      "conjunction": "Нептун одного и Солнце другого в соединении: один видит в другом идеал, окутывает его романтикой и вдохновением. Связь тонкая и духовная. Сила — нежность, творчество и духовное притяжение; риск — иллюзии и разочарование, когда туман рассеется.",
      "sextile": "Нептун и Солнце в секстиле: один мягко вдохновляет и одухотворяет другого. Сила — сострадание, творчество и чуткость; риск — расплывчатость без заземления.",
      "square": "Нептун и Солнце в квадрате: восприятие одного размыто иллюзиями. Возможны недопонимание, обманы, разочарования. Сила — творческое и духовное вдохновение; риск — туман, идеализация и потеря ясности.",
      "trine": "Нептун и Солнце в тригоне: один естественно вдохновляет другого, привносит нежность, мечту и духовную близость. Сила — сострадание, творчество и тонкая связь душ; риск — идеализация и уход от реальности.",
      "opposition": "Нептун и Солнце в оппозиции: идеалы одного и личность другого на разных полюсах. Сильное романтически-духовное притяжение с риском тумана. Сила — вдохновение и сострадание; риск — иллюзии и нечёткие границы."
    },
    "neptune-moon": {
      "conjunction": "Нептун одного и Луна другого в соединении: тонкая, мечтательная эмоциональная связь. Один чувствует другого почти телепатически, окутывает состраданием и романтикой. Сила — эмпатия, нежность и духовное единство; риск — иллюзии, размытые границы и созависимость.",
      "sextile": "Нептун и Луна в секстиле: один мягко улавливает и одухотворяет чувства другого. Сила — чуткость, сострадание и творческая близость; риск — расплывчатость без заземления.",
      "square": "Нептун и Луна в квадрате: иллюзии одного и чувства другого путаются. Возможны недопонимание и разочарования. Сила — глубокое сопереживание; риск — туман и потеря эмоциональных границ.",
      "trine": "Нептун и Луна в тригоне: один естественно сопереживает другому и создаёт тонкую, нежную связь душ. Сила — эмпатия, романтика и духовная близость; риск — уход в мечты и нечёткость границ.",
      "opposition": "Нептун и Луна в оппозиции: идеалы одного и чувства другого на разных полюсах. Сила — сострадание и душевная связь; риск — иллюзии и созависимость."
    },
    "neptune-mercury": {
      "conjunction": "Нептун одного и Меркурий другого в соединении: один окутывает мышление другого воображением и поэтичностью. Разговоры образные, но туманные. Сила — творческий, образный обмен и чуткость; риск — недопонимание и обманчивые ожидания.",
      "sextile": "Нептун и Меркурий в секстиле: один мягко добавляет интуиции и образности в мышление другого. Сила — творческое, чуткое общение; риск — расплывчатость.",
      "square": "Нептун и Меркурий в квадрате: иллюзии одного и мысли другого путаются. Недопонимание, недосказанность. Сила — творческое вдохновение; риск — туман и искажённое восприятие слов.",
      "trine": "Нептун и Меркурий в тригоне: один естественно добавляет тонкости и интуиции в мышление другого. Сила — образный, чуткий, творческий диалог; риск — уход в фантазии.",
      "opposition": "Нептун и Меркурий в оппозиции: воображение одного и логика другого на разных полюсах. Сила — соединение интуиции и разума; риск — недопонимание и иллюзии."
    },
    "neptune-venus": {
      "conjunction": "Нептун одного и Венера другого в соединении: возвышенная, романтическая связь. Один окутывает любовь другого мечтой, состраданием и идеалом. Сила — нежность, творчество и духовная романтика; риск — иллюзии, идеализация и разочарование.",
      "sextile": "Нептун и Венера в секстиле: один мягко одухотворяет любовь другого, добавляет нежности и воображения. Сила — сострадание, романтика и творчество; риск — расплывчатость без заземления.",
      "square": "Нептун и Венера в квадрате: иллюзии одного и любовь другого путаются. Идеализация, недосказанность, разочарования. Сила — нежная, сострадательная связь; риск — обманы, иллюзии и спасательство.",
      "trine": "Нептун и Венера в тригоне: один естественно одухотворяет любовь другого, дарит романтику и тонкую связь. Сила — нежность, творчество и духовная близость; риск — идеализация.",
      "opposition": "Нептун и Венера в оппозиции: идеалы одного и любовь другого на разных полюсах. Сила — сострадание и романтика; риск — иллюзии, идеализация и созависимость."
    },
    "neptune-mars": {
      "conjunction": "Нептун одного и Марс другого в соединении: один размывает и одухотворяет действия другого — энергия течёт по вдохновению, а не по силе. Сила — творческое, чуткое, вдохновлённое действие; риск — спад мотивации, неясные цели и обманчивые ожидания.",
      "sextile": "Нептун и Марс в секстиле: один мягко вдохновляет действия другого, добавляет интуиции и творчества. Сила — вдохновлённая, идейная активность; риск — дать энергии раствориться.",
      "square": "Нептун и Марс в квадрате: иллюзии одного и напор другого путаются. Размытые цели и действия впустую. Сила — вдохновлённое действие при заземлении; риск — слабая мотивация и разочарования.",
      "trine": "Нептун и Марс в тригоне: один естественно вдохновляет действия другого, придаёт им творчество и интуицию. Сила — артистичная, идейная, чуткая активность; риск — уход от конкретных целей.",
      "opposition": "Нептун и Марс в оппозиции: идеалы одного и напор другого на разных полюсах. Сила — вдохновлённая, сострадательная энергия; риск — путаница и действия впустую."
    },
    "neptune-jupiter": {
      "conjunction": "Нептун одного и Юпитер другого в соединении: один одухотворяет рост другого, окрашивает связь идеализмом и состраданием. Сила — вдохновлённая вера, щедрость и общая мечта; риск — иллюзии и нереалистичный идеализм.",
      "sextile": "Нептун и Юпитер в секстиле: воображение одного и вера другого мягко дополняют друг друга. Сила — идеализм и духовное тепло; риск — больше мечтать, чем делать.",
      "square": "Нептун и Юпитер в квадрате: иллюзии одного и рост другого раздувают друг друга. Завышенные мечты. Сила — мечта через отрезвление; риск — иллюзии и нереалистичные надежды.",
      "trine": "Нептун и Юпитер в тригоне: один естественно соединяет оптимизм другого с состраданием и творческой мечтой. Сила — вдохновлённая щедрость и идеализм; риск — уход в мечты.",
      "opposition": "Нептун и Юпитер в оппозиции: идеалы одного и вера другого на разных полюсах. Сила — сострадательная мечта; риск — иллюзии и разочарования."
    },
    "neptune-saturn": {
      "conjunction": "Нептун одного и Сатурн другого в соединении: мечта и идеал встречают структуру — попытка заземлить грёзы (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — практичный идеализм; риск — разочарование, сомнения и туман.",
      "sextile": "Нептун и Сатурн в секстиле: воображение одного и дисциплина другого мягко дополняют друг друга (поколенческий аспект, личностно — через дома и личные планеты). Сила — заземлённая мечта; риск — оставить видение невоплощённым.",
      "square": "Нептун и Сатурн в квадрате: иллюзии одного и реализм другого сталкиваются (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — мечта через усилие; риск — уныние и колебания.",
      "trine": "Нептун и Сатурн в тригоне: воображение одного и структура другого легко сочетаются (поколенческий аспект, личностно — через дома и личные планеты). Сила — практичный идеализм; риск — без усилия видение остаётся туманным.",
      "opposition": "Нептун и Сатурн в оппозиции: идеал одного и реальность другого на разных полюсах (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — мечта, проверенная реальностью; риск — сомнения и качели иллюзий и скепсиса."
    },
    "neptune-uranus": {
      "conjunction": "Нептун одного и Уран другого в соединении: мечта сливается с новаторством — смесь духовных идеалов, прогресса и технологий (почти полностью поколенческий аспект; личностно — через дома и личные планеты). Сила — визионерское творчество и пробуждение; риск — нестабильные идеалы и путаница.",
      "sextile": "Нептун и Уран в секстиле: воображение одного и новаторство другого мягко дополняют друг друга (поколенческий аспект; личностно — через дома и личные планеты). Сила — визионерская креативность; риск — расплывчатость вне личного контекста.",
      "square": "Нептун и Уран в квадрате: идеалы одного и перемены другого в напряжении (поколенческий аспект, личностно — через дома и личные планеты). Сила — творческие прорывы через трение; риск — нестабильность и разочарованные идеалы.",
      "trine": "Нептун и Уран в тригоне: воображение одного и новаторство другого созвучны (поколенческий аспект; личностно — через дома и личные планеты). Сила — вдохновлённое новаторство; риск — без личного фокуса влияние туманно.",
      "opposition": "Нептун и Уран в оппозиции: идеал одного и новаторство другого на разных полюсах (поколенческий аспект, личностно — через дома и личные планеты). Сила — напряжение, рождающее видение; риск — нестабильность и иллюзии."
    },
    "neptune-neptune": {
      "conjunction": "Нептуны партнёров в соединении: оба одного поколения с общими идеалами, мечтами и духовным настроем. Аспект почти полностью поколенческий; личностно — через дома и личные планеты. Сила — общая вера и тонкое взаимопонимание; риск — совместные иллюзии и уход от реальности.",
      "sextile": "Нептуны в секстиле: близкие поколения с созвучными мечтами и чувствительностью (поколенческий аспект; личностно — через дома и личные планеты). Сила — общая духовная и творческая волна; риск — расплывчатость вне личного контекста.",
      "square": "Нептуны в квадрате: разные поколения с расходящимися идеалами и иллюзиями (поколенческий аспект, личностно — через дома и личные планеты). Сила — встреча разных мечтаний; риск — взаимные иллюзии и непонимание ценностей.",
      "trine": "Нептуны в тригоне: поколения с гармоничными, созвучными идеалами и духовностью (поколенческий аспект; личностно — через дома и личные планеты). Сила — общее вдохновение и сострадание; риск — без личных контактов влияние остаётся общим.",
      "opposition": "Нептуны в оппозиции: поколения с противоположными идеалами и мечтами (поколенческий аспект, личностно — через дома и личные планеты). Сила — диалог разных духовных эпох; риск — взаимные иллюзии."
    },
    "neptune-pluto": {
      "conjunction": "Нептун одного и Плутон другого в соединении: идеалы сплавляются с глубинной силой — редкое поколенческое сочетание, меняющее коллективную психику; личностно — через дома и личные планеты. Сила — глубокое духовное и культурное обновление; риск — коллективные иллюзии вне личного уровня.",
      "sextile": "Нептун и Плутон в секстиле: воображение одного и сила другого мягко дополняют друг друга (поколенческий аспект, личностно — через дома и личные планеты). Сила — глубокий творческо-духовный потенциал; риск — влияние остаётся безличным.",
      "square": "Нептун и Плутон в квадрате: идеалы одного и власть другого в напряжении (редкое поколенческое сочетание, личностно — через дома и личные планеты). Сила — глубокая трансформация веры; риск — коллективные иллюзии и дезориентация.",
      "trine": "Нептун и Плутон в тригоне: воображение одного и трансформация другого созвучны (долгий поколенческий аспект; личностно — через дома и личные планеты). Сила — глубокое регенеративное видение; риск — без личного фокуса влияние коллективное.",
      "opposition": "Нептун и Плутон в оппозиции: идеалы одного и власть другого на разных полюсах (крайне редкое поколенческое сочетание; в карте работает через дома и личные планеты). Сила — эпохальное преображение ценностей; риск — влияние ощущается коллективно, а не лично."
    },
    "pluto-sun": {
      "conjunction": "Плутон одного и Солнце другого в соединении: глубокое, преображающее влияние на личность другого — притяжение мощное, почти магнетическое. Сила — глубина, страсть и взаимная трансформация; риск — борьба за власть, контроль и одержимость.",
      "sextile": "Плутон и Солнце в секстиле: один помогает другому расти и меняться через глубину. Влияние мягкое. Сила — преображение, сила воли и поддержка перемен; риск — оставить потенциал нераскрытым.",
      "square": "Плутон и Солнце в квадрате: один стремится влиять на другого и контролировать его. Напряжённая борьба воль. Сила — глубокая трансформация через кризис; риск — манипуляции, ревность и силовые игры.",
      "trine": "Плутон и Солнце в тригоне: один мощно, но органично преображает другого, усиливает его в переменах. Сила — глубина, регенерация и взаимное усиление; риск — недооценить интенсивность связи.",
      "opposition": "Плутон и Солнце в оппозиции: сила одного и воля другого на разных полюсах — мощное притяжение и борьба за власть. Сила — глубокая трансформация через другого; риск — контроль, манипуляции и навязчивая интенсивность."
    },
    "pluto-moon": {
      "conjunction": "Плутон одного и Луна другого в соединении: глубокая, всепоглощающая эмоциональная связь. Один мощно влияет на чувства другого, пробуждая страсть и перемены. Сила — глубина, интенсивность и эмоциональная трансформация; риск — ревность, контроль и одержимость.",
      "sextile": "Плутон и Луна в секстиле: один помогает другому проживать и обновлять глубокие чувства. Сила — эмоциональная глубина и поддержка перемен; риск — оставить потенциал нераскрытым.",
      "square": "Плутон и Луна в квадрате: один стремится контролировать или интенсивно влиять на чувства другого. Сила — трансформация через кризис; риск — манипуляции, ревность и навязчивость.",
      "trine": "Плутон и Луна в тригоне: один глубоко, но органично преображает чувства другого. Сила — эмоциональная глубина и регенерация; риск — недооценить силу привязанности.",
      "opposition": "Плутон и Луна в оппозиции: глубинная сила одного и чувства другого на разных полюсах. Сила — трансформация через глубокие связи; риск — ревность, контроль и эмоциональные крайности."
    },
    "pluto-mercury": {
      "conjunction": "Плутон одного и Меркурий другого в соединении: один придаёт мышлению другого глубину и интенсивность, разговоры проникают до сути. Сила — проницательный, преображающий обмен; риск — давление и попытки контролировать мысли другого.",
      "sextile": "Плутон и Меркурий в секстиле: один помогает уму другого копать глубже и видеть скрытое. Сила — проницательность и сила убеждения; риск — оставить глубину нераскрытой.",
      "square": "Плутон и Меркурий в квадрате: один давит на мышление другого, навязывает взгляды или манипулирует словом. Сила — глубокая трансформация мысли через напряжение; риск — манипуляции, подозрительность и силовые споры.",
      "trine": "Плутон и Меркурий в тригоне: один органично углубляет мышление другого, помогает видеть суть и убеждать. Сила — проницательность, концентрация и влияние; риск — недооценить интенсивность разговоров.",
      "opposition": "Плутон и Меркурий в оппозиции: сила одного и ум другого на разных полюсах. Сила — преображающий обмен; риск — словесные силовые игры и подозрительность."
    },
    "pluto-venus": {
      "conjunction": "Плутон одного и Венера другого в соединении: глубокое, всепоглощающее притяжение. Один влияет на любовь другого с огромной силой, страсть преображает. Сила — магнетизм, глубина и страстная близость; риск — ревность, собственничество и контроль.",
      "sextile": "Плутон и Венера в секстиле: один помогает любви другого углубляться и обновляться через честность. Сила — магнетизм и эмоциональная глубина; риск — оставить интенсивность нераскрытой.",
      "square": "Плутон и Венера в квадрате: один стремится обладать и контролировать чувства другого. Навязчивое притяжение и ревность. Сила — глубокая, преображающая страсть; риск — контроль, манипуляции и собственничество.",
      "trine": "Плутон и Венера в тригоне: один глубоко, но органично преображает любовь другого, дарит страсть и глубину. Сила — магнетизм, страсть и преображающая близость; риск — недооценить силу привязанности.",
      "opposition": "Плутон и Венера в оппозиции: сила одного и любовь другого на разных полюсах. Мощное притяжение и борьба за контроль. Сила — глубокая, преображающая связь; риск — ревность, собственничество и крайности."
    },
    "pluto-mars": {
      "conjunction": "Плутон одного и Марс другого в соединении: один придаёт действиям другого огромную силу, интенсивность и волю. Связь мощная и преображающая. Сила — несгибаемая воля, выносливость и страсть; риск — борьба за власть, безжалостность и разрушительный накал.",
      "sextile": "Плутон и Марс в секстиле: один помогает действиям другого обрести глубину и преображающую силу. Сила — интенсивная, эффективная воля; риск — оставить эту мощь нераскрытой.",
      "square": "Плутон и Марс в квадрате: сила одного и напор другого сталкиваются. Силовая борьба и навязчивая интенсивность. Сила — глубочайшая воля через кризис; риск — безжалостность, доминирование и саморазрушительный накал.",
      "trine": "Плутон и Марс в тригоне: один органично углубляет и усиливает действия другого, дарит выносливость и волю. Сила — мощная воля, регенерация и стойкость; риск — недооценить интенсивность связи.",
      "opposition": "Плутон и Марс в оппозиции: сила одного и напор другого на разных полюсах. Мощное притяжение и борьба за власть. Сила — преображающая воля через противостояние; риск — силовые игры, безжалостность и крайности."
    },
    "pluto-jupiter": {
      "conjunction": "Плутон одного и Юпитер другого в соединении: один придаёт росту другого глубину, силу и масштаб — общая тяга к преображению и большому влиянию. Сила — мощная вера, воля и способность переделывать; риск — одержимость властью, фанатизм и перебор.",
      "sextile": "Плутон и Юпитер в секстиле: один помогает другому углублять цели и преображать обстоятельства. Сила — сфокусированная амбиция и влияние; риск — оставить эту силу нераскрытой.",
      "square": "Плутон и Юпитер в квадрате: сила одного и размах другого сталкиваются. Жажда контроля и фанатичный пыл. Сила — масштабное достижение через напряжение; риск — одержимость и стремление доминировать.",
      "trine": "Плутон и Юпитер в тригоне: один органично соединяет рост другого с глубиной и преображающим влиянием. Сила — мощная вера, регенерация и крупный успех; риск — недооценить тягу к власти.",
      "opposition": "Плутон и Юпитер в оппозиции: сила одного и размах другого на разных полюсах. Рост через большие ставки. Сила — трансформация через сильные столкновения; риск — силовая борьба и перебор."
    },
    "pluto-saturn": {
      "conjunction": "Плутон одного и Сатурн другого в соединении: глубинная сила сплавляется со структурой — тяжёлые трансформации через кризис (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — выносливость и способность перестраивать; риск — жёсткость, контроль и груз.",
      "sextile": "Плутон и Сатурн в секстиле: сила одного и дисциплина другого мягко дополняют друг друга (поколенческий аспект, личностно — через дома и личные планеты). Сила — упорная стойкость и глубокая работа; риск — оставить силу неиспользованной.",
      "square": "Плутон и Сатурн в квадрате: власть одного и структура другого сталкиваются (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — железная выносливость через кризис; риск — жёсткость, безжалостность и тяжёлый блок.",
      "trine": "Плутон и Сатурн в тригоне: сила одного и структура другого легко сочетаются (поколенческий аспект, личностно — через дома и личные планеты). Сила — выносливость и устойчивая мощь перестройки; риск — недооценить собственную неумолимость.",
      "opposition": "Плутон и Сатурн в оппозиции: власть одного и структура другого на разных полюсах (аспект во многом поколенческий, личностно — через дома и личные планеты). Сила — глубокая стойкость через давление; риск — силовая борьба, жёсткость и изматывающий конфликт."
    },
    "pluto-uranus": {
      "conjunction": "Плутон одного и Уран другого в соединении: глубинная трансформация сливается с радикальными переменами — эпоха потрясений (аспект почти полностью поколенческий; личностно — через дома и личные планеты). Сила — мощь обновления и слома старого; риск — экстремизм и хаотичные перемены.",
      "sextile": "Плутон и Уран в секстиле: сила одного и новаторство другого мягко дополняют друг друга (поколенческий аспект; личностно — через дома и личные планеты). Сила — конструктивные, масштабные перемены; риск — расфокус вне личного контекста.",
      "square": "Плутон и Уран в квадрате: власть одного и перемены другого в напряжении (поколенческий аспект, личностно — через дома и личные планеты). Сила — революционная энергия; риск — экстремизм, разрушительность и резкие сломы.",
      "trine": "Плутон и Уран в тригоне: трансформация одного и новаторство другого созвучны (поколенческий аспект; личностно — через дома и личные планеты). Сила — мощные конструктивные перемены; риск — без личного фокуса сила безлична.",
      "opposition": "Плутон и Уран в оппозиции: власть одного и свобода другого на разных полюсах (поколенческий аспект, личностно — через дома и личные планеты). Сила — преображающее напряжение; риск — экстремизм и разрушительный конфликт."
    },
    "pluto-neptune": {
      "conjunction": "Плутон одного и Нептун другого в соединении: глубинная трансформация сливается с идеалами — редкое поколенческое сочетание, меняющее коллективную психику; личностно — через дома и личные планеты. Сила — глубокое духовное и культурное обновление; риск — коллективные иллюзии вне личного уровня.",
      "sextile": "Плутон и Нептун в секстиле: сила одного и воображение другого мягко дополняют друг друга (поколенческий аспект, личностно — через дома и личные планеты). Сила — глубокий творческо-духовный потенциал; риск — влияние остаётся безличным.",
      "square": "Плутон и Нептун в квадрате: власть одного и идеалы другого в напряжении (редкое поколенческое сочетание, личностно — через дома и личные планеты). Сила — глубокая трансформация веры; риск — коллективные иллюзии и дезориентация.",
      "trine": "Плутон и Нептун в тригоне: трансформация одного и воображение другого созвучны (долгий поколенческий аспект; личностно — через дома и личные планеты). Сила — глубокое регенеративное видение; риск — без личного фокуса влияние коллективное.",
      "opposition": "Плутон и Нептун в оппозиции: власть одного и идеалы другого на разных полюсах (крайне редкое поколенческое сочетание; в карте работает через дома и личные планеты). Сила — эпохальное преображение ценностей; риск — влияние ощущается коллективно, а не лично."
    },
    "pluto-pluto": {
      "conjunction": "Плутоны партнёров в соединении: оба одного поколения с общей глубинной темой власти, кризисов и преображения. Аспект почти полностью поколенческий; личностно — через дома и личные планеты. Сила — общая способность к перерождению; риск — совместная одержимость и крайности.",
      "sextile": "Плутоны в секстиле: близкие поколения с созвучной глубинной силой (поколенческий аспект; личностно — через дома и личные планеты). Сила — общий потенциал трансформации; риск — расфокус вне личного контекста.",
      "square": "Плутоны в квадрате: разные поколения с расходящимся отношением к власти и переменам (поколенческий аспект, личностно — через дома и личные планеты). Сила — встреча разных сил преображения; риск — борьба ценностей поколений.",
      "trine": "Плутоны в тригоне: поколения с гармоничной, созвучной глубинной силой (поколенческий аспект; личностно — через дома и личные планеты). Сила — общий потенциал глубокого обновления; риск — без личных контактов влияние остаётся общим.",
      "opposition": "Плутоны в оппозиции: поколения с противоположным отношением к власти (большой возрастной разрыв; поколенческий аспект, личностно — через дома и личные планеты). Сила — диалог разных эпох преображения; риск — силовое противостояние ценностей."
    }
  }
},
};
