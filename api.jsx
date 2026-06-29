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

/** Базовые заголовки авторизации (без Content-Type — он добавляется только при наличии тела). */
function authHeaders() {
  const h = {};
  const initData = tg() && tg().initData;
  if (initData) h['Authorization'] = 'tma ' + initData;
  return h;
}

async function apiFetch(path, opts = {}) {
  if (!API_BASE) throw new Error('API base URL not configured');
  const headers = { ...authHeaders(), ...(opts.headers || {}) };
  // Content-Type ставим ТОЛЬКО когда есть тело: иначе Fastify ругается на пустой JSON (400).
  if (opts.body != null && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(API_BASE + path, { ...opts, headers });
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
    id:     p.id, // backend person_id (нужен для правки/удаления партнёра)
    name:   p.name,
    dateLocked: p.birth_date_changed_at != null, // дата уже менялась → заблокирована
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

  /** Обновляет self-профиль. includeDate=false — не трогаем дату (чтобы не сработала блокировка). */
  async updateSelf(b, includeDate) {
    const id = tgUserId();
    if (!id) throw new Error('no tg user');
    const body = birthToPersonBody(b);
    if (!includeDate) { delete body.birth_day; delete body.birth_month; delete body.birth_year; }
    const res = await apiFetch(`/api/users/${id}/self`, { method: 'PATCH', body: JSON.stringify(body) });
    if (res.status === 409) { const e = new Error('BIRTH_DATE_LOCKED'); throw e; }
    if (!res.ok) throw new Error('updateSelf failed: ' + res.status);
    const data = await res.json();
    return data.person;
  },

  /** Отправляет готовый PDF натальной карты в Telegram (нативный шэр или relay). НЕ сохраняет данные. */
  async shareNatalPdf(base64, targetName) {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return { ok: false, error: 'not configured' };
    const canShare = !!(tg() && typeof tg().shareMessage === 'function');
    try {
      const res = await apiFetch(`/api/users/${id}/share/natal`, {
        method: 'POST',
        body: JSON.stringify({ pdf_base64: base64, target_name: targetName || '', mode: canShare ? 'share' : 'relay' }),
      });
      if (!res.ok) { let d=''; try{ d=(await res.json()).detail||''; }catch(_){} return { ok:false, error:'HTTP '+res.status+(d?': '+d:'') }; }
      const data = await res.json();
      if (data.prepared_message_id && canShare) {
        return await new Promise((resolve) => {
          try { tg().shareMessage(data.prepared_message_id, (sent) => resolve({ ok:true, shared: !!sent })); }
          catch (e) { resolve({ ok:true, shared:false }); }
        });
      }
      if (data.relayed) return { ok:true, relayed:true };
      return { ok:true };
    } catch (e) { return { ok:false, error:String(e) }; }
  },

  /** Список партнёров (не-self профили) в форме birth, каждый с backend id. */
  async listPartners() {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return null;
    try {
      const res = await apiFetch(`/api/users/${id}/people`);
      if (!res.ok) return null;
      const data = await res.json();
      return (data.people || []).filter(p => !p.is_self).map(personToBirth);
    } catch (e) { return null; }
  },

  /** Создаёт партнёра, возвращает его в форме birth (с id) | null. */
  async createPartner(b) {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return null;
    try {
      const res = await apiFetch(`/api/users/${id}/people`, { method: 'POST', body: JSON.stringify(birthToPersonBody(b)) });
      if (!res.ok) return null;
      const data = await res.json();
      return personToBirth(data.person);
    } catch (e) { return null; }
  },

  /** Обновляет партнёра по его backend id, возвращает birth | null. */
  async updatePartner(personId, b) {
    if (!personId || !this.isConfigured()) return null;
    try {
      const res = await apiFetch(`/api/people/${personId}`, { method: 'PATCH', body: JSON.stringify(birthToPersonBody(b)) });
      if (!res.ok) return null;
      const data = await res.json();
      return personToBirth(data.person);
    } catch (e) { return null; }
  },

  /** Удаляет партнёра по backend id. */
  async deletePartner(personId) {
    if (!personId || !this.isConfigured()) return;
    try { await apiFetch(`/api/people/${personId}`, { method: 'DELETE' }); } catch (e) {}
  },

  /** Настройки уведомлений: { notify_solar, notify_aspects } | null. */
  async getNotifyPrefs() {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return null;
    try {
      const res = await apiFetch(`/api/users/${id}/notifications`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.prefs;
    } catch (e) { return null; }
  },

  /** Обновляет настройки уведомлений (частично). */
  async setNotifyPrefs(patch) {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return;
    try {
      await apiFetch(`/api/users/${id}/notifications`, { method: 'PATCH', body: JSON.stringify(patch) });
    } catch (e) {}
  },

  /** Отмечает просмотр солярного года / месяца аспектов (для логики уведомлений). */
  async markSolarViewed(year) {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return;
    try { await apiFetch(`/api/users/${id}/views/solar`, { method: 'POST', body: JSON.stringify({ year }) }); } catch (e) {}
  },
  async markAspectViewed(year, month) {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return;
    try { await apiFetch(`/api/users/${id}/views/aspects`, { method: 'POST', body: JSON.stringify({ year, month }) }); } catch (e) {}
  },

  /** Просит бота прислать тестовое уведомление. Возвращает {ok, error?}. */
  async sendTestNotification() {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return { ok:false, error:'not configured' };
    try {
      const res = await apiFetch(`/api/users/${id}/notifications/test`, { method: 'POST' });
      if (res.ok) return { ok:true };
      let detail=''; try { detail=(await res.json()).detail||''; } catch(e){}
      return { ok:false, error: 'HTTP '+res.status+(detail?': '+detail:'') };
    } catch (e) { return { ok:false, error:String(e) }; }
  },

  /** Отправляет обратную связь (идея/баг) с опциональным скриншотом. */
  async sendFeedback({ kind, message, screenshot }) {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return { ok: false, error: 'not_configured' };
    try {
      const res = await apiFetch(`/api/users/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ kind, message, screenshot: screenshot || null }),
      });
      if (res.ok) return { ok: true };
      return { ok: false, error: 'HTTP ' + res.status };
    } catch (e) { return { ok: false, error: String(e) }; }
  },

  /** Баланс игровой валюты (кристаллов). Возвращает число или null при сбое. */
  async getBalance() {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return null;
    try {
      const res = await apiFetch(`/api/users/${id}/balance`);
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data.balance === 'number' ? data.balance : null;
    } catch (e) { return null; }
  },

  /** Список покупок (что уже оплачено). Возвращает массив {feature,item_key,paid_limit} или []. */
  async getEntitlements() {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return [];
    try {
      const res = await apiFetch(`/api/users/${id}/entitlements`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.entitlements) ? data.entitlements : [];
    } catch (e) { return []; }
  },

  /** Покупка возможности за звёзды. Возвращает {ok,charged,balance,owned,error?}. */
  async purchase({ feature, key, limit, extend }) {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return { ok: false, error: 'not_configured' };
    try {
      const res = await apiFetch(`/api/users/${id}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ feature, key: key || '', limit, extend }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return data;
      return { ok: false, error: data.error || ('HTTP ' + res.status), balance: data.balance };
    } catch (e) { return { ok: false, error: String(e) }; }
  },

  /** Создаёт ссылку на инвойс Telegram Stars для тарифа. Возвращает {ok,url}. */
  async createStarsInvoice(tariff) {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return { ok: false, error: 'not_configured' };
    try {
      const res = await apiFetch(`/api/users/${id}/stars/invoice`, { method: 'POST', body: JSON.stringify({ tariff }) });
      if (!res.ok) return { ok: false, error: 'HTTP ' + res.status };
      const data = await res.json();
      return { ok: true, url: data.url };
    } catch (e) { return { ok: false, error: String(e) }; }
  },

  /** ТЕСТОВОЕ: начислить себе 10 звёзд (только админ). Возвращает {balance} или null. */
  async testGrant() {
    const id = tgUserId();
    if (!id || !this.isConfigured()) return null;
    try {
      const res = await apiFetch(`/api/users/${id}/balance/test-grant`, { method: 'POST' });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data.balance === 'number' ? data.balance : null;
    } catch (e) { return null; }
  },

  /** ВРЕМЕННОЕ: удаляет профиль на бэкенде (для повторного теста онбординга). */
  async resetSelf() {
    const id = tgUserId();
    if (id && this.isConfigured()) {
      try { await apiFetch(`/api/users/${id}/self`, { method: 'DELETE' }); } catch (e) {}
    }
  },
};

window.AstroAPI = AstroAPI;

// Админ ли текущий пользователь (для скрытых разделов). Список — в index.html.
window.isAstroAdmin = function () {
  const id = tgUserId();
  return !!id && (window.ASTRO_ADMIN_IDS || []).map(String).includes(String(id));
};
