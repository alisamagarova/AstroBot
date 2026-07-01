import { pool } from '../pool.js';
import { recordDailySpend, SPEND_STREAK_REWARD } from './users.js';

// Цены в звёздах (источник истины — здесь, на сервере).
export const PRICES: Record<string, number> = {
  natal_self: 5,
  natal_other: 5,
  synastry: 3,
  solar: 3,
  milestones: 5,
  milestones_extend: 2,
  horary: 2,
  aspects: 2,
  daily: 1,
  oracle: 1,
};

// Возможности, за которые берём плату каждый раз (без записи о покупке).
const ALWAYS_CHARGE = new Set(['natal_other', 'oracle', 'horary']);

export interface PurchaseResult {
  ok: boolean;
  charged: number;   // сколько списано
  balance: number;   // баланс после
  owned: boolean;    // было ли уже оплачено (или стало доступным)
  error?: string;    // 'insufficient' | 'no_user' | 'bad_feature'
  streakReward?: number; // если этой тратой закрыта серия из 7 дней подряд — сколько ✦ начислено сверху
}

export interface PurchaseOpts {
  limit?: number;    // для milestones — текущий год-лимит
  extend?: boolean;  // для milestones — доплатить до нового лимита
}

/**
 * Транзакционная покупка возможности. Идемпотентна для одноразовых прав.
 * Если это реальное списание (charged > 0) — засчитывает день в серию трат
 * (см. recordDailySpend): на 7-й день подряд начисляет бонус поверх баланса.
 */
export async function purchaseFeature(
  tgId: string,
  feature: string,
  itemKey: string,
  opts: PurchaseOpts = {},
): Promise<PurchaseResult> {
  const r = await purchaseFeatureTx(tgId, feature, itemKey, opts);
  if (r.ok && r.charged > 0) {
    try {
      const streak = await recordDailySpend(tgId);
      r.balance = streak.balance;
      if (streak.rewarded) r.streakReward = SPEND_STREAK_REWARD;
    } catch (e) {
      console.error('recordDailySpend failed', e);
    }
  }
  return r;
}

async function purchaseFeatureTx(
  tgId: string,
  feature: string,
  itemKey: string,
  opts: PurchaseOpts = {},
): Promise<PurchaseResult> {
  const price = PRICES[feature];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const u = await client.query<{ id: string; balance: number }>(
      'SELECT id, balance FROM users WHERE tg_id = $1 FOR UPDATE',
      [tgId],
    );
    if (!u.rows[0]) { await client.query('ROLLBACK'); return { ok: false, charged: 0, balance: 0, owned: false, error: 'no_user' }; }
    const userId = u.rows[0].id;
    let balance = u.rows[0].balance;

    if (price == null) { await client.query('ROLLBACK'); return { ok: false, charged: 0, balance, owned: false, error: 'bad_feature' }; }

    const deduct = async (amount: number) => {
      balance -= amount;
      await client.query('UPDATE users SET balance = $2, updated_at = now() WHERE id = $1', [userId, balance]);
    };

    // — Плата каждый раз, без записи —
    if (ALWAYS_CHARGE.has(feature)) {
      if (balance < price) { await client.query('ROLLBACK'); return { ok: false, charged: 0, balance, owned: false, error: 'insufficient' }; }
      await deduct(price);
      await client.query('COMMIT');
      return { ok: true, charged: price, balance, owned: false };
    }

    // — Жизненные вехи: учёт оплаченного лимита лет —
    if (feature === 'milestones') {
      const curLimit = opts.limit ?? 0;
      const ex = await client.query<{ paid_limit: number | null }>(
        'SELECT paid_limit FROM entitlements WHERE user_id = $1 AND feature = $2 AND item_key = $3',
        [userId, 'milestones', itemKey],
      );
      if (ex.rows[0]) {
        const paid = ex.rows[0].paid_limit ?? 0;
        if (paid >= curLimit) { await client.query('COMMIT'); return { ok: true, charged: 0, balance, owned: true }; }
        // Тема куплена, но лимит лет вырос.
        if (opts.extend) {
          const cost = PRICES.milestones_extend;
          if (balance < cost) { await client.query('ROLLBACK'); return { ok: false, charged: 0, balance, owned: true, error: 'insufficient' }; }
          await deduct(cost);
          await client.query(
            'UPDATE entitlements SET paid_limit = $4 WHERE user_id = $1 AND feature = $2 AND item_key = $3',
            [userId, 'milestones', itemKey, curLimit],
          );
          await client.query('COMMIT');
          return { ok: true, charged: cost, balance, owned: true };
        }
        // Доплачивать не хотят — открываем до прежнего оплаченного лимита бесплатно.
        await client.query('COMMIT');
        return { ok: true, charged: 0, balance, owned: true };
      }
      // Не куплено — берём полную цену, фиксируем оплаченный лимит.
      if (balance < price) { await client.query('ROLLBACK'); return { ok: false, charged: 0, balance, owned: false, error: 'insufficient' }; }
      await deduct(price);
      await client.query(
        'INSERT INTO entitlements (user_id, feature, item_key, paid_limit) VALUES ($1, $2, $3, $4)',
        [userId, 'milestones', itemKey, curLimit],
      );
      await client.query('COMMIT');
      return { ok: true, charged: price, balance, owned: false };
    }

    // — Одноразовое право (natal_self, aspects, solar, synastry, daily) —
    const ex = await client.query(
      'SELECT 1 FROM entitlements WHERE user_id = $1 AND feature = $2 AND item_key = $3',
      [userId, feature, itemKey],
    );
    if (ex.rows[0]) { await client.query('COMMIT'); return { ok: true, charged: 0, balance, owned: true }; }
    if (balance < price) { await client.query('ROLLBACK'); return { ok: false, charged: 0, balance, owned: false, error: 'insufficient' }; }
    await deduct(price);
    await client.query(
      'INSERT INTO entitlements (user_id, feature, item_key) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [userId, feature, itemKey],
    );
    await client.query('COMMIT');
    return { ok: true, charged: price, balance, owned: false };
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    client.release();
  }
}

/** Все покупки пользователя — чтобы фронт показал, что уже открыто. */
export async function listEntitlements(
  tgId: string,
): Promise<{ feature: string; item_key: string; paid_limit: number | null }[]> {
  const { rows } = await pool.query<{ feature: string; item_key: string; paid_limit: number | null }>(
    `SELECT e.feature, e.item_key, e.paid_limit
       FROM entitlements e JOIN users u ON u.id = e.user_id
      WHERE u.tg_id = $1`,
    [tgId],
  );
  return rows;
}
