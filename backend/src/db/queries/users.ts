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

