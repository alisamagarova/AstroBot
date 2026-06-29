import type { FastifyPluginAsync } from 'fastify';
import { getPayment, yooEnabled } from '../yookassa.js';
import { findRubleTariff } from '../payments.js';
import { creditRublePurchase } from '../db/queries/payments.js';
import { bot } from '../bot/bot.js';

// Вебхук ЮKassa. Без авторизации (Telegram-initData тут нет).
// Безопасность: НЕ доверяем телу вебхука — перезапрашиваем платёж по API и
// проверяем статус. Начисление идемпотентно по payment_id.
const yookassaRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/yookassa/webhook', { config: { skipAuth: true } }, async (request, reply) => {
    if (!yooEnabled()) return reply.status(200).send({ ok: true }); // выключено — молча 200

    const body = request.body as { event?: string; object?: { id?: string } } | undefined;
    const paymentId = body?.object?.id;
    if (!paymentId) return reply.status(200).send({ ok: true });

    try {
      // Достоверный статус — из API, а не из тела вебхука.
      const p = await getPayment(paymentId);
      if (p.status !== 'succeeded') return reply.status(200).send({ ok: true });

      const tgId = p.metadata?.tgId;
      const tariffId = p.metadata?.tariff;
      const t = tariffId ? findRubleTariff(tariffId) : undefined;
      if (!tgId || !t) {
        request.log.error({ paymentId, metadata: p.metadata }, 'YooKassa webhook: missing tgId/tariff');
        return reply.status(200).send({ ok: true });
      }

      const r = await creditRublePurchase(tgId, t.id, t.vz, t.rub, p.id);
      if (r.credited) {
        try { await bot.api.sendMessage(tgId, `Готово! ✦ Начислено ${t.vz} звёзд. Твой баланс: ${r.balance} ✦`); } catch { /* ignore */ }
      }
      return reply.status(200).send({ ok: true });
    } catch (e) {
      request.log.error({ e, paymentId }, 'YooKassa webhook failed');
      // 200, чтобы ЮKassa не зацикливала ретраи на нашей внутренней ошибке;
      // повторную доставку обработаем идемпотентно.
      return reply.status(200).send({ ok: true });
    }
  });
};

export default yookassaRoutes;
