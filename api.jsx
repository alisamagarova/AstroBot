// api.jsx — клиент для общения Mini App с backend (Fastify на Railway).
// Авторизация: Telegram initData (заголовок Authorization: tma <initData>).
// Базовый URL задаётся в index.html через window.ASTRO_API_BASE.

const API_BASE = (window.ASTRO_API_BASE || '').replace(/\/$/, '');

function tg() { return window.Telegram && window.Telegram.WebApp; }

/** Telegram user id текущего пользователя (или null вне Telegram). */
function tgUserId() {
  const u = tg() && tg().initDataUnsafe && tg().initDataUnsafe.user;
  return u ? String(u.id) : null;
}

/** Базовые заголовки авторизации. */
function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const initData = tg() && tg().initData;
  if (initData) h['Authorization'] = 'tma ' + initData;
  return h;
}

async function apiFetch(path, opts = {}) {
  if (!API_BASE) throw new Error('API base URL not configured');
  const res = await fetch(API_BASE + path, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers || {}) },
  });
  return res;
}

// ─── Преобразование объекта формы (birthedit) → тело CreatePerson ─────────────
function birthToPersonBody(b) {
  const c = b.city || {};
  const body = {
    name:             (b.name || '').trim(),
    birth_day:        b.day,
    birth_month:      b.month,
    birth_year:       b.year,
    birth_city_ru:    c.ru ?? null,
    birth_city_en:    c.en ?? null,
    birth_city_reg:   c.reg ?? null,
    birth_lat:        c.lat,
    birth_lon:        c.lon,
    birth_utc_offset: c.tz,
    birth_timezone:   c.zone,
    time_mode:        b.timeMode || 'unknown',
  };
  if (body.time_mode === 'exact') {
    body.birth_hour   = b.hour ?? 0;
    body.birth_minute = b.minute ?? 0;
  } else if (body.time_mode === 'approx') {
    body.approx_time = b.approx || 'day';
  }
  // Город проживания (для соляра) — только если отличается от места рождения
  if (b.residence) {
    const r = b.residence;
    body.res_city_ru  = r.ru ?? null;
    body.res_city_en  = r.en ?? null;
    body.res_lat      = r.lat;
    body.res_lon      = r.lon;
    body.res_timezone = r.zone ?? null;
  }
  return body;
}

// ─── Преобразование backend person → объект формы (birthedit) ─────────────────
function personToBirth(p) {
  return {
    name:   p.name,
    day:    p.birth_day,
    month:  p.birth_month,
    year:   p.birth_year,
    timeMode: p.time_mode,
    hour:   p.birth_hour ?? 12,
    minute: p.birth_minute ?? 0,
    approx: p.approx_time ?? 'day',
    city: {
      ru:  p.birth_city_ru || p.birth_city_en || '',
      en:  p.birth_city_en || p.birth_city_ru || '',
      reg: p.birth_city_reg || '',
      lat: p.birth_lat,
      lon: p.birth_lon,
      tz:  p.birth_utc_offset,
      zone: p.birth_timezone,
    },
    residence: (p.res_lat != null && p.res_lon != null) ? {
      ru: p.res_city_ru || '', en: p.res_city_en || '',
      lat: p.res_lat, lon: p.res_lon, tz: 0, zone: p.res_timezone || 'UTC',
    } : null,
  };
}

// ─── Публичные методы ─────────────────────────────────────────────────────────

const AstroAPI = {
  isConfigured() { return !!API_BASE && !API_BASE.includes('REPLACE_WITH'); },
  inTelegram()   { return !!(tg() && tg().platform && tg().platform !== 'unknown'); },
  tgUserId,
  personToBirth,

  /** Профиль себя: возвращает person | null (404). */
  async getSelf() {
    const id = tgUserId();
    if (!id) return null;
    const res = await apiFetch(`/api/users/${id}/self`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('getSelf failed: ' + res.status);
    const data = await res.json();
    return data.person;
  },

  /** Создаёт пользователя (идемпотентно) — на случай, если бот ещё не успел. */
  async ensureUser() {
    const id = tgUserId();
    if (!id) return;
    const u = tg().initDataUnsafe.user;
    await apiFetch('/api/users/upsert', {
      method: 'POST',
      body: JSON.stringify({
        tg_id:         id,
        tg_username:   u.username ?? null,
        tg_first_name: u.first_name ?? null,
        tg_last_name:  u.last_name ?? null,
      }),
    });
  },

  /** Завершает онбординг: создаёт профиль + сохраняет оба согласия. */
  async completeOnboarding(b) {
    const id = tgUserId();
    if (!id) throw new Error('no tg user');

    await this.ensureUser();

    const res = await apiFetch(`/api/users/${id}/self`, {
      method: 'POST',
      body: JSON.stringify(birthToPersonBody(b)),
    });
    if (!res.ok && res.status !== 409) {
      const txt = await res.text();
      throw new Error('createSelf failed: ' + res.status + ' ' + txt);
    }

    // Согласия (идемпотентно)
    for (const doc of ['privacy_policy', 'terms_of_service']) {
      await apiFetch(`/api/users/${id}/consents`, {
        method: 'POST',
        body: JSON.stringify({ document_type: doc, document_version: '1.0', tg_client: 'miniapp' }),
      });
    }
    return true;
  },
};

window.AstroAPI = AstroAPI;
