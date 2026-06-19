import { pool } from '../pool.js';
import type { DbPerson, TimeMode, ApproxTime } from '../../types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIGN_KEYS = ['aries','taurus','gemini','cancer','leo','virgo',
                   'libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
const SUN_CUTS   = [19,18,20,19,20,20,22,22,22,22,21,21];
const SUN_STARTS = [10,11,0,1,2,3,4,5,6,7,8,9];

function computeSunSign(day: number, month: number): string {
  const s = SUN_STARTS[month - 1];
  return day <= SUN_CUTS[month - 1] ? SIGN_KEYS[(s + 11) % 12] : SIGN_KEYS[s];
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreatePersonInput {
  owner_id:     string;
  is_self:      boolean;
  name:         string;
  name_en?:     string | null;

  birth_day:    number;
  birth_month:  number;
  birth_year:   number;

  time_mode:    TimeMode;
  birth_hour?:  number | null;
  birth_minute?: number | null;
  approx_time?: ApproxTime | null;

  birth_city_ru?:   string | null;
  birth_city_en?:   string | null;
  birth_city_reg?:  string | null;
  birth_lat:        number;
  birth_lon:        number;
  birth_utc_offset: number;
  birth_timezone:   string;
}

export interface UpdatePersonInput {
  name?:        string;
  name_en?:     string | null;

  // Дата рождения — менять только если birth_date_changed_at IS NULL (для is_self)
  birth_day?:   number;
  birth_month?: number;
  birth_year?:  number;

  // Время — без ограничений
  time_mode?:    TimeMode;
  birth_hour?:   number | null;
  birth_minute?: number | null;
  approx_time?:  ApproxTime | null;

  // Место рождения
  birth_city_ru?:   string | null;
  birth_city_en?:   string | null;
  birth_city_reg?:  string | null;
  birth_lat?:       number;
  birth_lon?:       number;
  birth_utc_offset?: number;
  birth_timezone?:  string;

  // Место проживания (для соляра)
  res_city_ru?:  string | null;
  res_city_en?:  string | null;
  res_lat?:      number | null;
  res_lon?:      number | null;
  res_timezone?: string | null;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function createPerson(input: CreatePersonInput): Promise<DbPerson> {
  const sunSign = computeSunSign(input.birth_day, input.birth_month);

  const { rows } = await pool.query<DbPerson>(
    `INSERT INTO people (
       owner_id, is_self, name, name_en,
       birth_day, birth_month, birth_year,
       time_mode, birth_hour, birth_minute, approx_time,
       birth_city_ru, birth_city_en, birth_city_reg,
       birth_lat, birth_lon, birth_utc_offset, birth_timezone,
       sun_sign
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
     ) RETURNING *`,
    [
      input.owner_id, input.is_self, input.name, input.name_en ?? null,
      input.birth_day, input.birth_month, input.birth_year,
      input.time_mode, input.birth_hour ?? null, input.birth_minute ?? null,
      input.approx_time ?? null,
      input.birth_city_ru ?? null, input.birth_city_en ?? null,
      input.birth_city_reg ?? null,
      input.birth_lat, input.birth_lon, input.birth_utc_offset, input.birth_timezone,
      sunSign,
    ],
  );
  return rows[0];
}

export async function getPersonById(id: string): Promise<DbPerson | null> {
  const { rows } = await pool.query<DbPerson>(
    'SELECT * FROM people WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export async function getSelfPerson(ownerTgId: string): Promise<DbPerson | null> {
  const { rows } = await pool.query<DbPerson>(
    `SELECT p.*
     FROM people p
     JOIN users u ON u.id = p.owner_id
     WHERE u.tg_id = $1 AND p.is_self = true`,
    [ownerTgId],
  );
  return rows[0] ?? null;
}

export async function getPeopleByOwner(ownerTgId: string): Promise<DbPerson[]> {
  const { rows } = await pool.query<DbPerson>(
    `SELECT p.*
     FROM people p
     JOIN users u ON u.id = p.owner_id
     WHERE u.tg_id = $1
     ORDER BY p.is_self DESC, p.created_at ASC`,
    [ownerTgId],
  );
  return rows;
}

/**
 * Обновляет профиль с соблюдением бизнес-правила:
 * если is_self=true — дата рождения меняется только один раз за всё время.
 * Выбрасывает ошибку BIRTH_DATE_LOCKED если попытка повторной смены.
 */
export async function updatePerson(
  id: string,
  input: UpdatePersonInput,
): Promise<DbPerson> {
  const current = await getPersonById(id);
  if (!current) throw new Error('PERSON_NOT_FOUND');

  const isChangingDate =
    input.birth_day !== undefined ||
    input.birth_month !== undefined ||
    input.birth_year !== undefined;

  if (isChangingDate && current.is_self && current.birth_date_changed_at !== null) {
    throw new Error('BIRTH_DATE_LOCKED');
  }

  // Вычисляем новый знак Солнца если меняется дата
  const newDay   = input.birth_day    ?? current.birth_day;
  const newMonth = input.birth_month  ?? current.birth_month;
  const newSunSign = isChangingDate
    ? computeSunSign(newDay, newMonth)
    : current.sun_sign;

  // Проставляем birth_date_changed_at если is_self и дата меняется впервые
  const newChangedAt =
    isChangingDate && current.is_self && current.birth_date_changed_at === null
      ? 'now()'
      : null;

  const { rows } = await pool.query<DbPerson>(
    `UPDATE people SET
       name             = COALESCE($2,  name),
       name_en          = CASE WHEN $3::text IS NOT NULL THEN $3 ELSE name_en END,
       birth_day        = COALESCE($4,  birth_day),
       birth_month      = COALESCE($5,  birth_month),
       birth_year       = COALESCE($6,  birth_year),
       time_mode        = COALESCE($7,  time_mode),
       birth_hour       = CASE WHEN $7::text IS NOT NULL THEN $8  ELSE birth_hour   END,
       birth_minute     = CASE WHEN $7::text IS NOT NULL THEN $9  ELSE birth_minute END,
       approx_time      = CASE WHEN $7::text IS NOT NULL THEN $10 ELSE approx_time  END,
       birth_city_ru    = COALESCE($11, birth_city_ru),
       birth_city_en    = COALESCE($12, birth_city_en),
       birth_city_reg   = COALESCE($13, birth_city_reg),
       birth_lat        = COALESCE($14, birth_lat),
       birth_lon        = COALESCE($15, birth_lon),
       birth_utc_offset = COALESCE($16, birth_utc_offset),
       birth_timezone   = COALESCE($17, birth_timezone),
       res_city_ru      = CASE WHEN $18::text IS NOT NULL THEN $18 ELSE res_city_ru END,
       res_city_en      = CASE WHEN $19::text IS NOT NULL THEN $19 ELSE res_city_en END,
       res_lat          = COALESCE($20, res_lat),
       res_lon          = COALESCE($21, res_lon),
       res_timezone     = CASE WHEN $22::text IS NOT NULL THEN $22 ELSE res_timezone END,
       sun_sign         = $23,
       birth_date_changed_at = CASE WHEN $24 THEN now() ELSE birth_date_changed_at END,
       updated_at       = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.name             ?? null,
      input.name_en          ?? null,
      input.birth_day        ?? null,
      input.birth_month      ?? null,
      input.birth_year       ?? null,
      input.time_mode        ?? null,
      input.birth_hour       ?? null,
      input.birth_minute     ?? null,
      input.approx_time      ?? null,
      input.birth_city_ru    ?? null,
      input.birth_city_en    ?? null,
      input.birth_city_reg   ?? null,
      input.birth_lat        ?? null,
      input.birth_lon        ?? null,
      input.birth_utc_offset ?? null,
      input.birth_timezone   ?? null,
      input.res_city_ru      ?? null,
      input.res_city_en      ?? null,
      input.res_lat          ?? null,
      input.res_lon          ?? null,
      input.res_timezone     ?? null,
      newSunSign,
      // $24 — флаг: нужно ли проставить birth_date_changed_at сейчас
      newChangedAt === 'now()',
    ],
  );
  return rows[0];
}

export async function deletePerson(id: string): Promise<void> {
  await pool.query('DELETE FROM people WHERE id = $1', [id]);
}
