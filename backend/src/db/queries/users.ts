import { pool } from '../pool.js';
import type { DbUser, LangCode, OnboardingStep } from '../../types.js';

export interface UpsertUserInput {
  tg_id:         string;
  tg_username?:  string | null;
  tg_first_name?: string | null;
  tg_last_name?:  string | null;
  lang?:         LangCode;
}

/** Создаёт пользователя, если не существует. При повторном вызове обновляет имя/username. */
export async function upsertUser(input: UpsertUserInput): Promise<DbUser> {
  const { rows } = await pool.query<DbUser>(
    `INSERT INTO users (tg_id, tg_username, tg_first_name, tg_last_name, lang)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tg_id) DO UPDATE SET
       tg_username   = EXCLUDED.tg_username,
       tg_first_name = EXCLUDED.tg_first_name,
       tg_last_name  = EXCLUDED.tg_last_name,
       updated_at    = now()
     RETURNING *`,
    [
      input.tg_id,
      input.tg_username ?? null,
      input.tg_first_name ?? null,
      input.tg_last_name ?? null,
      input.lang ?? 'ru',
    ],
  );
  return rows[0];
}

/** Возвращает пользователя по tg_id или null. */
export async function getUserByTgId(tgId: string): Promise<DbUser | null> {
  const { rows } = await pool.query<DbUser>(
    'SELECT * FROM users WHERE tg_id = $1',
    [tgId],
  );
  return rows[0] ?? null;
}

/** Возвращает пользователя по внутреннему id или null. */
export async function getUserById(id: string): Promise<DbUser | null> {
  const { rows } = await pool.query<DbUser>(
    'SELECT * FROM users WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

/** Обновляет шаг онбординга. */
export async function setOnboardingStep(
  tgId: string,
  step: OnboardingStep,
): Promise<void> {
  const completed = step === 'done';
  await pool.query(
    `UPDATE users
     SET onboarding_step = $2, onboarding_completed = $3, updated_at = now()
     WHERE tg_id = $1`,
    [tgId, step, completed],
  );
}

/** Помечает пользователя как заблокировавшего бота. */
export async function setBlocked(tgId: string, blocked: boolean): Promise<void> {
  await pool.query(
    'UPDATE users SET is_blocked = $2, updated_at = now() WHERE tg_id = $1',
    [tgId, blocked],
  );
}

/** Меняет язык интерфейса. */
export async function setLang(tgId: string, lang: LangCode): Promise<void> {
  await pool.query(
    'UPDATE users SET lang = $2, updated_at = now() WHERE tg_id = $1',
    [tgId, lang],
  );
}

/** Записывает, кто пригласил пользователя. Ставится один раз, не на себя, реферер должен существовать. */
export async function setReferrer(tgId: string, refTgId: string): Promise<boolean> {
  if (!refTgId || refTgId === tgId) return false;
  const res = await pool.query(
    `UPDATE users SET referred_by = $2, updated_at = now()
     WHERE tg_id = $1 AND referred_by IS NULL
       AND EXISTS (SELECT 1 FROM users u2 WHERE u2.tg_id = $2)`,
    [tgId, refTgId],
  );
  return (res.rowCount ?? 0) > 0;
}

/** Статистика рефералов: сколько приглашено и сколько принесли награду. */
export async function getReferralStats(tgId: string): Promise<{ invited: number; rewarded: number }> {
  const { rows } = await pool.query<{ invited: number; rewarded: number }>(
    `SELECT count(*)::int AS invited,
            count(*) FILTER (WHERE referral_rewarded)::int AS rewarded
       FROM users WHERE referred_by = $1`,
    [tgId],
  );
  return { invited: rows[0]?.invited ?? 0, rewarded: rows[0]?.rewarded ?? 0 };
}

/** Текущий баланс игровой валюты (кристаллов). */
export async function getBalance(tgId: string): Promise<number> {
  const { rows } = await pool.query<{ balance: number }>(
    'SELECT balance FROM users WHERE tg_id = $1',
    [tgId],
  );
  return rows[0]?.balance ?? 0;
}

/** Изменяет баланс на delta (может быть отрицательным — списание). Возвращает новый баланс. */
export async function addBalance(tgId: string, delta: number): Promise<number> {
  const { rows } = await pool.query<{ balance: number }>(
    `UPDATE users SET balance = balance + $2, updated_at = now()
     WHERE tg_id = $1 RETURNING balance`,
    [tgId, delta],
  );
  return rows[0]?.balance ?? 0;
}

export const SPEND_STREAK_TARGET = 7;  // дней подряд с тратой кристаллов
export const SPEND_STREAK_REWARD = 5;  // приз за серию, ✦

export interface SpendStreakResult {
  balance: number;
  streakDays: number;   // текущая серия после учёта (0 сразу после начисления приза)
  rewarded: boolean;    // приз начислен именно этим вызовом
}

/**
 * Отмечает, что сегодня пользователь потратил кристаллы (любая сумма, любая фича).
 * При SPEND_STREAK_TARGET днях подряд начисляет SPEND_STREAK_REWARD и обнуляет серию.
 * Повторный вызов в тот же день — идемпотентен (день уже засчитан).
 * Одно атомарное UPDATE — блокировка строки через FOR UPDATE в CTE.
 */
export async function recordDailySpend(tgId: string): Promise<SpendStreakResult> {
  const { rows } = await pool.query<{ balance: number; streak_days: number; rewarded: boolean }>(
    `WITH cur AS (
       SELECT id, balance, spend_streak_days, spend_streak_last_date
       FROM users WHERE tg_id = $1 FOR UPDATE
     ),
     calc AS (
       SELECT
         id, balance,
         CASE
           WHEN spend_streak_last_date = CURRENT_DATE     THEN spend_streak_days
           WHEN spend_streak_last_date = CURRENT_DATE - 1 THEN spend_streak_days + 1
           ELSE 1
         END AS new_streak,
         (spend_streak_last_date IS DISTINCT FROM CURRENT_DATE) AS is_new_day
       FROM cur
     )
     UPDATE users u
     SET
       spend_streak_days      = CASE WHEN calc.new_streak >= $2 THEN 0 ELSE calc.new_streak END,
       spend_streak_last_date = CASE WHEN calc.is_new_day THEN CURRENT_DATE ELSE u.spend_streak_last_date END,
       balance                = CASE WHEN calc.is_new_day AND calc.new_streak >= $2
                                      THEN u.balance + $3 ELSE u.balance END,
       updated_at = now()
     FROM calc
     WHERE u.id = calc.id
     RETURNING u.balance,
       (CASE WHEN calc.new_streak >= $2 THEN 0 ELSE calc.new_streak END) AS streak_days,
       (calc.is_new_day AND calc.new_streak >= $2) AS rewarded`,
    [tgId, SPEND_STREAK_TARGET, SPEND_STREAK_REWARD],
  );
  const r = rows[0];
  return r
    ? { balance: r.balance, streakDays: r.streak_days, rewarded: r.rewarded }
    : { balance: 0, streakDays: 0, rewarded: false };
}

export interface SpendStreakStatus {
  streakDays: number;   // 0..target-1 (проекция на «сейчас»: пропуск дня уже обнуляет отображение)
  target:     number;
  reward:     number;
  spentToday: boolean;
}

/** Текущий прогресс серии дней с тратой кристаллов — для отображения в профиле. */
export async function getSpendStreakStatus(tgId: string): Promise<SpendStreakStatus> {
  const { rows } = await pool.query<{ streak_days: number; spent_today: boolean }>(
    `SELECT
       CASE WHEN spend_streak_last_date >= CURRENT_DATE - 1 THEN spend_streak_days ELSE 0 END AS streak_days,
       (spend_streak_last_date = CURRENT_DATE) AS spent_today
     FROM users WHERE tg_id = $1`,
    [tgId],
  );
  const r = rows[0];
  return {
    streakDays: r?.streak_days ?? 0,
    spentToday: r?.spent_today ?? false,
    target: SPEND_STREAK_TARGET,
    reward: SPEND_STREAK_REWARD,
  };
}

/** Все незаблокировавшие бота пользователи — для массовых рассылок. */
export async function allActiveUsers(): Promise<{ id: string; tg_id: string; lang: string }[]> {
  const { rows } = await pool.query<{ id: string; tg_id: string; lang: string }>(
    'SELECT id, tg_id, lang FROM users WHERE is_blocked = false',
  );
  return rows;
}

