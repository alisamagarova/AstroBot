import { pool } from '../pool.js';

// ─── Настройки уведомлений ────────────────────────────────────────────────────

export interface NotifyPrefs {
  notify_solar:   boolean;
  notify_aspects: boolean;
  notify_viewed:  boolean;  // слать даже о просмотренном
}

export async function getNotifyPrefs(tgId: string): Promise<NotifyPrefs | null> {
  const { rows } = await pool.query<NotifyPrefs>(
    'SELECT notify_solar, notify_aspects, notify_viewed FROM users WHERE tg_id = $1',
    [tgId],
  );
  return rows[0] ?? null;
}

export async function setNotifyPrefs(tgId: string, prefs: Partial<NotifyPrefs>): Promise<void> {
  await pool.query(
    `UPDATE users SET
       notify_solar   = COALESCE($2, notify_solar),
       notify_aspects = COALESCE($3, notify_aspects),
       notify_viewed  = COALESCE($4, notify_viewed),
       updated_at     = now()
     WHERE tg_id = $1`,
    [tgId, prefs.notify_solar ?? null, prefs.notify_aspects ?? null, prefs.notify_viewed ?? null],
  );
}

// ─── Отметки просмотров ───────────────────────────────────────────────────────

export async function recordSolarView(userId: string, year: number): Promise<void> {
  await pool.query(
    `INSERT INTO solar_views (user_id, solar_year) VALUES ($1, $2)
     ON CONFLICT (user_id, solar_year) DO UPDATE SET viewed_at = now()`,
    [userId, year],
  );
}

export async function recordAspectView(userId: string, year: number, month: number): Promise<void> {
  await pool.query(
    `INSERT INTO aspect_views (user_id, view_year, view_month) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, view_year, view_month) DO UPDATE SET viewed_at = now()`,
    [userId, year, month],
  );
}

export async function hasSolarView(userId: string, year: number): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM solar_views WHERE user_id = $1 AND solar_year = $2',
    [userId, year],
  );
  return rows.length > 0;
}

export async function hasAspectView(userId: string, year: number, month: number): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM aspect_views WHERE user_id = $1 AND view_year = $2 AND view_month = $3',
    [userId, year, month],
  );
  return rows.length > 0;
}

// ─── Журнал отправленных уведомлений (антидубль) ──────────────────────────────

/** Пытается зафиксировать отправку. true = можно слать (ещё не слали), false = уже отправляли. */
export async function claimNotification(userId: string, kind: 'solar' | 'aspects', ref: string): Promise<boolean> {
  const { rows } = await pool.query(
    `INSERT INTO notifications_sent (user_id, kind, ref) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, kind, ref) DO NOTHING
     RETURNING user_id`,
    [userId, kind, ref],
  );
  return rows.length > 0;
}

// ─── Выборки для планировщика бота ────────────────────────────────────────────

export interface NotifyCandidate {
  id:            string;   // users.id
  tg_id:         string;
  lang:          string;
  birth_month:   number;
  birth_day:     number;
  notify_viewed: boolean;
}

/** Пользователи с включённым уведомлением о соляре, у кого есть self-профиль. */
export async function usersForSolarNotify(): Promise<NotifyCandidate[]> {
  const { rows } = await pool.query<NotifyCandidate>(
    `SELECT u.id, u.tg_id, u.lang, u.notify_viewed, p.birth_month, p.birth_day
     FROM users u
     JOIN people p ON p.owner_id = u.id AND p.is_self = true
     WHERE u.notify_solar = true AND u.is_blocked = false`,
  );
  return rows;
}

/** Пользователи с включённым уведомлением об аспектах месяца. */
export async function usersForAspectNotify(): Promise<NotifyCandidate[]> {
  const { rows } = await pool.query<NotifyCandidate>(
    `SELECT u.id, u.tg_id, u.lang, u.notify_viewed, p.birth_month, p.birth_day
     FROM users u
     JOIN people p ON p.owner_id = u.id AND p.is_self = true
     WHERE u.notify_aspects = true AND u.is_blocked = false`,
  );
  return rows;
}
