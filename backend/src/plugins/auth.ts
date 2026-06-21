import crypto from 'node:crypto';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { config, isDev } from '../config.js';
import type { TgInitUser } from '../types.js';

// ─── Authorization helpers ────────────────────────────────────────────────────

/**
 * true, если запрос имеет право действовать от имени данного tg_id.
 * Бот (caller='bot') доверенный — проходит всегда.
 * Mini App — только если авторизованный пользователь совпадает с tgId.
 */
export function ownsAccount(request: FastifyRequest, tgId: string): boolean {
  const ctx = request.authCtx;
  if (!ctx) return false;
  if (ctx.caller === 'bot') return true;
  return ctx.tgUser != null && String(ctx.tgUser.id) === String(tgId);
}

/**
 * Проверяет доступ к аккаунту; при отказе отправляет 403 и возвращает false.
 * Использование: if (!requireOwner(request, reply, tgId)) return;
 */
export function requireOwner(
  request: FastifyRequest,
  reply: FastifyReply,
  tgId: string,
): boolean {
  if (ownsAccount(request, tgId)) return true;
  reply.status(403).send({ error: 'Forbidden: account does not belong to caller' });
  return false;
}

// ─── Telegram WebApp initData validation ──────────────────────────────────────
// Алгоритм: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

function verifyTelegramInitData(initData: string): TgInitUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');

  // Строка для проверки: отсортированные key=value через \n
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // secret_key = HMAC-SHA256("WebAppData", bot_token)
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(config.tg.botToken)
    .digest();

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (expectedHash !== hash) return null;

  // Проверяем свежесть (не старше 1 часа)
  const authDate = Number(params.get('auth_date') ?? 0);
  if (Date.now() / 1000 - authDate > 3600) return null;

  const userJson = params.get('user');
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as TgInitUser;
  } catch {
    return null;
  }
}

// ─── Fastify plugin ───────────────────────────────────────────────────────────

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('authCtx', null);

  fastify.addHook('onRequest', async (request: FastifyRequest, reply) => {
    // Роуты с config.skipAuth пропускают аутентификацию (напр. /health)
    if ((request.routeOptions as any)?.config?.skipAuth) return;

    const authHeader = request.headers['authorization'];
    const botSecret  = request.headers['x-bot-secret'];

    // DEV: если NODE_ENV=development и выставлен X-Dev-Tg-Id — пропускаем HMAC.
    // Никогда не включать в продакшне (isDev гарантирует это).
    if (isDev && request.headers['x-dev-tg-id']) {
      const devId = Number(request.headers['x-dev-tg-id']);
      request.authCtx = {
        caller: 'miniapp',
        tgUser: { id: devId, first_name: 'Dev' },
      };
      return;
    }

    // 1. Telegram Mini App: Authorization: tma <initData>
    if (authHeader?.startsWith('tma ')) {
      const initData = authHeader.slice(4);
      const tgUser = verifyTelegramInitData(initData);

      if (!tgUser) {
        return reply.status(401).send({ error: 'Invalid Telegram initData' });
      }

      request.authCtx = { caller: 'miniapp', tgUser };
      return;
    }

    // 2. Bot → Backend: X-Bot-Secret: <secret>
    if (botSecret) {
      if (botSecret !== config.tg.botSecret) {
        return reply.status(401).send({ error: 'Invalid bot secret' });
      }
      request.authCtx = { caller: 'bot', tgUser: null };
      return;
    }

    return reply.status(401).send({ error: 'Missing auth' });
  });
};

// Используем fastify-plugin чтобы декораторы были видны вне плагина
export default fp(authPlugin, { name: 'auth' });
