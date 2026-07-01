import { pool } from '../pool.js';
import { REFERRAL_REWARD } from '../../payments.js';
import type { PoolClient } from 'pg';

export interface CreditResult {
  credited: boolean;  // true — начислили сейчас; false — этот платёж уже обработан
  balance: number;    // актуальный баланс после
  // Если этой покупкой сработала реферальная награда — данные пригласившего (для уведомления).
  referrer?: { tgId: string; reward: number; balance: number };
}

/**
 * Реферальная награда: если у покупателя есть пригласивший и награда ещё не выдана —
 * начисляем пригласившему REFERRAL_REWARD ✦ и помечаем награду выданной. В той же
 * транзакции, что и покупка. Возвращает данные пригласившего или undefined.
 */
async function rewardReferrerIfEligible(
  client: PoolClient,
  buyer: { id: string; referred_by: string | null; referral_rewarded: boolean },
): Promise<CreditResult['referrer']> {
  if (!buyer.referred_by || buyer.referral_rewarded) return undefined;
  const rr = await client.query<{ tg_id: string; balance: number }>(
    `UPDATE users SET balance = balance + $2, updated_at = now()
     WHERE tg_id = $1 RETURNING tg_id, balance`,
    [buyer.referred_by, REFERRAL_REWARD],
  );
  if (!rr.rows[0]) return undefined; // пригласившего уже нет — пропускаем
  await client.query('UPDATE users SET referral_rewarded = true WHERE id = $1', [buyer.id]);
  return { tgId: rr.rows[0].tg_id, reward: REFERRAL_REWARD, balance: rr.rows[0].balance };
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
    const u = await client.query<{ id: string; balance: number; referred_by: string | null; referral_rewarded: boolean }>(
      'SELECT id, balance, referred_by, referral_rewarded FROM users WHERE tg_id = $1 FOR UPDATE',
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

    const referrer = await rewardReferrerIfEligible(client, { id: userId, referred_by: u.rows[0].referred_by, referral_rewarded: u.rows[0].referral_rewarded });

    await client.query('COMMIT');
    return { credited: true, balance: upd.rows[0].balance, referrer };
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Начисляет vz за оплату рублями (ЮKassa) — атомарно и идемпотентно по payment_id.
 * Повторный вебхук payment.succeeded не начислит баланс дважды.
 */
export async function creditRublePurchase(
  tgId: string,
  tariff: string,
  vz: number,
  rub: number,
  paymentId: string,
): Promise<CreditResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const u = await client.query<{ id: string; balance: number; referred_by: string | null; referral_rewarded: boolean }>(
      'SELECT id, balance, referred_by, referral_rewarded FROM users WHERE tg_id = $1 FOR UPDATE',
      [tgId],
    );
    if (!u.rows[0]) { await client.query('ROLLBACK'); return { credited: false, balance: 0 }; }
    const userId = u.rows[0].id;

    const ins = await client.query(
      `INSERT INTO ruble_purchases (user_id, tg_id, payment_id, tariff, vz, rub)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (payment_id) DO NOTHING
       RETURNING id`,
      [userId, tgId, paymentId, tariff, vz, rub],
    );

    if (ins.rows.length === 0) {
      await client.query('COMMIT');
      return { credited: false, balance: u.rows[0].balance };
    }

    const upd = await client.query<{ balance: number }>(
      'UPDATE users SET balance = balance + $2, updated_at = now() WHERE id = $1 RETURNING balance',
      [userId, vz],
    );

    const referrer = await rewardReferrerIfEligible(client, { id: userId, referred_by: u.rows[0].referred_by, referral_rewarded: u.rows[0].referral_rewarded });

    await client.query('COMMIT');
    return { credited: true, balance: upd.rows[0].balance, referrer };
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    client.release();
  }
}
