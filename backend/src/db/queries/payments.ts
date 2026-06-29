import { pool } from '../pool.js';

export interface CreditResult {
  credited: boolean;  // true — начислили сейчас; false — этот платёж уже обработан
  balance: number;    // актуальный баланс после
}

/**
 * Начисляет vz виртуальных звёзд за оплату Telegram Stars — атомарно и идемпотентно.
 * Идемпотентность по charge_id (telegram_payment_charge_id): повторная доставка
 * вебхука не начислит баланс дважды. Всё в одной транзакции (ACID).
 */
export async function creditStarsPurchase(
  tgId: string,
  tariff: string,
  vz: number,
  stars: number,
  chargeId: string,
): Promise<CreditResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Блокируем строку пользователя на время транзакции.
    const u = await client.query<{ id: string; balance: number }>(
      'SELECT id, balance FROM users WHERE tg_id = $1 FOR UPDATE',
      [tgId],
    );
    if (!u.rows[0]) { await client.query('ROLLBACK'); return { credited: false, balance: 0 }; }
    const userId = u.rows[0].id;

    // Пытаемся зафиксировать платёж. Если charge_id уже есть — ничего не вставится.
    const ins = await client.query(
      `INSERT INTO star_purchases (user_id, tg_id, charge_id, tariff, vz, stars)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (charge_id) DO NOTHING
       RETURNING id`,
      [userId, tgId, chargeId, tariff, vz, stars],
    );

    if (ins.rows.length === 0) {
      // Платёж уже обработан ранее — баланс не трогаем.
      await client.query('COMMIT');
      return { credited: false, balance: u.rows[0].balance };
    }

    const upd = await client.query<{ balance: number }>(
      'UPDATE users SET balance = balance + $2, updated_at = now() WHERE id = $1 RETURNING balance',
      [userId, vz],
    );

    await client.query('COMMIT');
    return { credited: true, balance: upd.rows[0].balance };
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    client.release();
  }
}
