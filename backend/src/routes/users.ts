import { z } from 'zod';
import type { FastifyPluginAsync } from 'fastify';
import {
  upsertUser,
  getUserByTgId,
  setOnboardingStep,
  setLang,
  setBlocked,
  getBalance,
  addBalance,
} from '../db/queries/users.js';
import { purchaseFeature, listEntitlements } from '../db/queries/entitlements.js';
import { saveConsent, getConsentsByUser } from '../db/queries/consents.js';
import { requireOwner } from '../plugins/auth.js';
import { config } from '../config.js';
import { bot } from '../bot/bot.js';
import { STAR_TARIFFS, findTariff, STAR_PAYLOAD_PREFIX } from '../payments.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const UpsertUserBody = z.object({
  tg_id:         z.string().regex(/^\d+$/),
  tg_username:   z.string().optional().nullable(),
  tg_first_name: z.string().optional().nullable(),
  tg_last_name:  z.string().optional().nullable(),
  lang:          z.enum(['ru', 'en']).default('ru'),
});

const SetStepBody = z.object({
  step: z.enum(['name', 'birth_date', 'birth_time', 'city', 'consent', 'done']),
});

const SetLangBody = z.object({
  lang: z.enum(['ru', 'en']),
});

const ConsentBody = z.object({
  document_type:    z.enum(['privacy_policy', 'terms_of_service']),
  document_version: z.string().min(1),
  tg_client:        z.string().optional().nullable(),
});

// ─── Plugin ───────────────────────────────────────────────────────────────────

const usersRoutes: FastifyPluginAsync = async (fastify) => {

  /** POST /users/upsert
   *  Вызывается ботом при каждом /start.
   *  Создаёт пользователя или обновляет его Telegram-мета.
   */
  fastify.post('/users/upsert', async (request, reply) => {
    const body = UpsertUserBody.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }
    if (!requireOwner(request, reply, body.data.tg_id)) return;

    const user = await upsertUser(body.data);
    return reply.status(200).send({ user });
  });

  /** GET /users/:tgId
   *  Возвращает пользователя по Telegram ID.
   */
  fastify.get<{ Params: { tgId: string } }>('/users/:tgId', async (request, reply) => {
    const { tgId } = request.params;
    if (!requireOwner(request, reply, tgId)) return;
    const user = await getUserByTgId(tgId);
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return { user };
  });

  /** GET /users/:tgId/balance
   *  Возвращает баланс игровой валюты (кристаллов).
   */
  fastify.get<{ Params: { tgId: string } }>('/users/:tgId/balance', async (request, reply) => {
    const { tgId } = request.params;
    if (!requireOwner(request, reply, tgId)) return;
    const balance = await getBalance(tgId);
    return { balance };
  });

  /** GET /users/:tgId/entitlements — что уже оплачено (для отображения «Открыто»). */
  fastify.get<{ Params: { tgId: string } }>('/users/:tgId/entitlements', async (request, reply) => {
    const { tgId } = request.params;
    if (!requireOwner(request, reply, tgId)) return;
    const entitlements = await listEntitlements(tgId);
    return { entitlements };
  });

  /** POST /users/:tgId/purchase — покупка возможности за звёзды (транзакционно). */
  fastify.post<{ Params: { tgId: string } }>('/users/:tgId/purchase', async (request, reply) => {
    const { tgId } = request.params;
    if (!requireOwner(request, reply, tgId)) return;
    const body = z.object({
      feature: z.string().min(1),
      key:     z.string().default(''),
      limit:   z.number().int().optional(),
      extend:  z.boolean().optional(),
    }).safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const r = await purchaseFeature(tgId, body.data.feature, body.data.key, {
      limit: body.data.limit, extend: body.data.extend,
    });
    if (!r.ok && (r.error === 'no_user' || r.error === 'bad_feature')) {
      return reply.status(400).send(r);
    }
    return r; // {ok, charged, balance, owned, error?}
  });

  /** GET /users/:tgId/stars/tariffs — список тарифов пополнения. */
  fastify.get<{ Params: { tgId: string } }>('/users/:tgId/stars/tariffs', async (request, reply) => {
    if (!requireOwner(request, reply, request.params.tgId)) return;
    return { tariffs: STAR_TARIFFS };
  });

  /** POST /users/:tgId/stars/invoice — создаёт ссылку на инвойс Telegram Stars. */
  fastify.post<{ Params: { tgId: string } }>('/users/:tgId/stars/invoice', async (request, reply) => {
    const { tgId } = request.params;
    if (!requireOwner(request, reply, tgId)) return;
    const body = z.object({ tariff: z.string().min(1) }).safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

    const t = findTariff(body.data.tariff);
    if (!t) return reply.status(400).send({ error: 'unknown tariff' });

    // Цифровой товар за Telegram Stars: currency XTR, provider_token пустой.
    const link = await bot.api.createInvoiceLink(
      `${t.vz} ✦`,
      `Пополнение баланса: ${t.vz} виртуальных звёзд приложения.`,
      `${STAR_PAYLOAD_PREFIX}${t.id}`,
      '',          // provider_token — пусто для XTR
      'XTR',
      [{ label: `${t.vz} ✦`, amount: t.stars }],
    );
    return { url: link };
  });

  /** GET /users/:tgId/stars/bot-balance — баланс бота в Telegram Stars (только админ). */
  fastify.get<{ Params: { tgId: string } }>('/users/:tgId/stars/bot-balance', async (request, reply) => {
    const { tgId } = request.params;
    if (!requireOwner(request, reply, tgId)) return;
    if (!config.adminIds.includes(String(tgId))) return reply.status(403).send({ error: 'admin only' });
    try {
      const bal = await bot.api.getMyStarBalance();
      return { stars: bal.amount };
    } catch (e) {
      request.log.error({ e }, 'getMyStarBalance failed');
      return reply.status(502).send({ error: 'stars_unavailable' });
    }
  });

  /** POST /users/:tgId/balance/test-grant — ТЕСТОВОЕ начисление 10 звёзд (только админ). */
  fastify.post<{ Params: { tgId: string } }>('/users/:tgId/balance/test-grant', async (request, reply) => {
    const { tgId } = request.params;
    if (!requireOwner(request, reply, tgId)) return;
    if (!config.adminIds.includes(String(tgId))) {
      return reply.status(403).send({ error: 'admin only' });
    }
    const balance = await addBalance(tgId, 10);
    return { balance };
  });

  /** PATCH /users/:tgId/onboarding-step
   *  Обновляет текущий шаг онбординга.
   */
  fastify.patch<{ Params: { tgId: string } }>(
    '/users/:tgId/onboarding-step',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = SetStepBody.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }
      await setOnboardingStep(request.params.tgId, body.data.step);
      return reply.status(204).send();
    },
  );

  /** PATCH /users/:tgId/lang
   *  Меняет язык интерфейса.
   */
  fastify.patch<{ Params: { tgId: string } }>(
    '/users/:tgId/lang',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = SetLangBody.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }
      await setLang(request.params.tgId, body.data.lang);
      return reply.status(204).send();
    },
  );

  /** PATCH /users/:tgId/blocked
   *  Помечает пользователя как заблокировавшего бота (или снимает блокировку).
   */
  fastify.patch<{ Params: { tgId: string } }>(
    '/users/:tgId/blocked',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = z.object({ blocked: z.boolean() }).safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }
      await setBlocked(request.params.tgId, body.data.blocked);
      return reply.status(204).send();
    },
  );

  /** POST /users/:tgId/consents
   *  Сохраняет согласие с юридическим документом.
   *  Идемпотентно: повторный вызов с той же версией ничего не меняет.
   */
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/consents',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = ConsentBody.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const user = await getUserByTgId(request.params.tgId);
      if (!user) return reply.status(404).send({ error: 'User not found' });

      const consent = await saveConsent({
        user_id:          user.id,
        tg_id:            user.tg_id,
        document_type:    body.data.document_type,
        document_version: body.data.document_version,
        tg_client:        body.data.tg_client ?? null,
        ip_address:       request.ip,
      });

      return reply.status(201).send({ consent });
    },
  );

  /** GET /users/:tgId/consents
   *  Список всех принятых согласий пользователя.
   */
  fastify.get<{ Params: { tgId: string } }>(
    '/users/:tgId/consents',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const user = await getUserByTgId(request.params.tgId);
      if (!user) return reply.status(404).send({ error: 'User not found' });

      const consents = await getConsentsByUser(user.id);
      return { consents };
    },
  );
};

export default usersRoutes;
