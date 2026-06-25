import { pool } from '../pool.js';

// ─── Глобальные настройки приложения (key-value) ──────────────────────────────

/** Возвращает значение настройки или null. */
export async function getSetting(key: string): Promise<string | null> {
  const { rows } = await pool.query<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = $1',
    [key],
  );
  return rows[0]?.value ?? null;
}

/** Создаёт/обновляет настройку. */
export async function setSetting(key: string, value: string): Promise<void> {
  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, value],
  );
}
