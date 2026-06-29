// Тонкий Telegram-бот (grammY, long polling).
// Сбор данных переехал в Mini App, поэтому бот лишь приветствует и
// открывает приложение кнопкой. Состояние/онбординг в чате больше не ведётся.
//
// Точки входа:
//   • src/index.ts      — вместе с Fastify API на Railway (24/7)
//   • src/bot/index.ts  — отдельный локальный запуск (npm run bot)

import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import type { Context } from 'grammy';
import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { upsertUser, setBlocked, allActiveUsers } from '../db/queries/users.js';
import { getSelfPerson } from '../db/queries/people.js';
import { findTariff, STAR_PAYLOAD_PREFIX } from '../payments.js';
import { creditStarsPurchase } from '../db/queries/payments.js';

export const bot = new Bot(config.tg.botToken);

// Путь вебхука. Безопасность — через secret_token (заголовок от Telegram).
export const WEBHOOK_PATH = '/telegram/webhook';

// ─── /start ───────────────────────────────────────────────────────────────────
async function handleStart(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  const tgId = String(from.id);

  await upsertUser({
    tg_id:         tgId,
    tg_username:   from.username ?? null,
    tg_first_name: from.first_name ?? null,
    tg_last_name:  from.last_name ?? null,
  });

  const self = await getSelfPerson(tgId);

  const text = self
    ? 'С возвращением! ✨\nТвоя карта уже ждёт — открывай приложение.'
    : '✨ Привет! Я AstroAI — твой персональный астролог.\n\n' +
      'Нажми кнопку ниже, заполни пару полей о себе — и звёзды раскроют, что обещает тебе небо.';

  const label = self ? 'Открыть приложение' : 'Заполнить данные';
  await ctx.reply(text, { reply_markup: openAppKeyboard(ctx, label) });
}

// Кнопка открытия приложения.
// Открываем Main App через прямую ссылку t.me/<bot>?startapp — тогда Telegram
// показывает чистую шапку (как у настроенного Mini App), без «бот · мини-приложение».
// web_app-кнопка как fallback, если username почему-то недоступен.
function openAppKeyboard(ctx: Context, label = 'Открыть приложение'): InlineKeyboard | undefined {
  const username = ctx.me?.username;
  if (username) {
    return new InlineKeyboard().url(label, `https://t.me/${username}?startapp`);
  }
  if (config.miniAppUrl) {
    return new InlineKeyboard().webApp(label, config.miniAppUrl);
  }
  return undefined;
}

bot.command('start', async (ctx) => { await handleStart(ctx); });

// ─── Админ: рассылки от имени бота ──────────────────────────────────────────────
function isAdmin(tgId?: string | number): boolean {
  return tgId != null && config.adminIds.includes(String(tgId));
}

// Черновики рассылок в памяти процесса (один инстанс на Railway).
// Текст не помещается в callback_data (лимит 64 байта), поэтому держим его тут.
const pendingBroadcast = new Map<string, string>();

/** Шлёт текст всем активным пользователям. Заблокировавших помечает, считает итог. */
async function broadcastToAll(text: string): Promise<{ ok: number; blocked: number; fail: number }> {
  const users = await allActiveUsers();
  let ok = 0, blocked = 0, fail = 0;
  for (const u of users) {
    try {
      await bot.api.sendMessage(u.tg_id, text);
      ok++;
    } catch (e: any) {
      if (e?.error_code === 403) { blocked++; try { await setBlocked(u.tg_id, true); } catch { /* ignore */ } }
      else { fail++; console.error('broadcast send failed', u.tg_id, e?.description ?? e); }
    }
    await new Promise((r) => setTimeout(r, 50)); // троттлинг под лимиты Telegram
  }
  return { ok, blocked, fail };
}

// /id — узнать свой Telegram ID (нужен, чтобы вписать себя в ADMIN_TG_IDS).
bot.command('id', async (ctx) => {
  await ctx.reply(`Твой Telegram ID: ${ctx.from?.id ?? '—'}`);
});

// /me <текст> — отправить сообщение только себе (проверить вид). Только админ.
bot.command('me', async (ctx, next) => {
  if (!isAdmin(ctx.from?.id)) return next();
  const text = (ctx.match ?? '').trim();
  if (!text) { await ctx.reply('Использование: /me <текст>'); return; }
  await ctx.reply(text);
});

// /broadcast <текст> — рассылка всем, с предпросмотром и подтверждением. Только админ.
bot.command('broadcast', async (ctx, next) => {
  if (!isAdmin(ctx.from?.id)) return next();
  const text = (ctx.match ?? '').trim();
  if (!text) { await ctx.reply('Использование: /broadcast <текст сообщения>'); return; }
  pendingBroadcast.set(String(ctx.from!.id), text);
  const kb = new InlineKeyboard()
    .text('📢 Отправить всем', 'bc:send').row()
    .text('Отмена', 'bc:cancel');
  await ctx.reply(`Предпросмотр рассылки:\n\n${text}\n\n— отправить всем активным пользователям?`, { reply_markup: kb });
});

bot.callbackQuery('bc:cancel', async (ctx) => {
  if (!isAdmin(ctx.from?.id)) { await ctx.answerCallbackQuery(); return; }
  pendingBroadcast.delete(String(ctx.from.id));
  await ctx.answerCallbackQuery();
  await ctx.editMessageText('Рассылка отменена.');
});

bot.callbackQuery('bc:send', async (ctx) => {
  if (!isAdmin(ctx.from?.id)) { await ctx.answerCallbackQuery(); return; }
  const text = pendingBroadcast.get(String(ctx.from.id));
  await ctx.answerCallbackQuery();
  if (!text) { await ctx.editMessageText('Текст устарел — отправь /broadcast заново.'); return; }
  pendingBroadcast.delete(String(ctx.from.id));
  await ctx.editMessageText('Рассылаю…');
  const r = await broadcastToAll(text);
  await ctx.reply(`Готово ✅\nДоставлено: ${r.ok}\nЗаблокировали бота: ${r.blocked}\nОшибок: ${r.fail}`);
});

// ─── Оплата виртуальных звёзд через Telegram Stars (XTR) ───────────────────────
// 1) pre_checkout_query: подтверждаем платёж (нужно ответить в течение 10 c).
bot.on('pre_checkout_query', async (ctx) => {
  const payload = ctx.preCheckoutQuery.invoice_payload || '';
  const tariffId = payload.startsWith(STAR_PAYLOAD_PREFIX) ? payload.slice(STAR_PAYLOAD_PREFIX.length) : '';
  const t = findTariff(tariffId);
  if (!t) { await ctx.answerPreCheckoutQuery(false, { error_message: 'Тариф недоступен. Попробуйте ещё раз.' }); return; }
  await ctx.answerPreCheckoutQuery(true);
});

// 2) successful_payment: начисляем ✦ — атомарно и идемпотентно (по charge_id).
//    Зарегистрировано ДО общего обработчика message, иначе сработает заглушка-ответ.
bot.on('message:successful_payment', async (ctx) => {
  const sp = ctx.message.successful_payment;
  const payload = sp.invoice_payload || '';
  const tariffId = payload.startsWith(STAR_PAYLOAD_PREFIX) ? payload.slice(STAR_PAYLOAD_PREFIX.length) : '';
  const t = findTariff(tariffId);
  const tgId = String(ctx.from.id);
  if (!t) { console.error('successful_payment: unknown tariff', payload); return; }
  try {
    const r = await creditStarsPurchase(tgId, t.id, t.vz, t.stars, sp.telegram_payment_charge_id);
    if (r.credited) {
      await ctx.reply(`Готово! ✦ Начислено ${t.vz} звёзд. Твой баланс: ${r.balance} ✦`);
    }
    // если credited=false — платёж уже был обработан, молча игнорируем (не дублируем)
  } catch (e) {
    console.error('creditStarsPurchase failed:', e);
  }
});

// Любое сообщение/команда — мягко направляем в приложение.
bot.on('message', async (ctx) => {
  if (ctx.message?.text?.startsWith('/start')) return; // уже обработано выше
  await ctx.reply('Всё происходит в приложении — открывай 👇', { reply_markup: openAppKeyboard(ctx) });
});

// Пользователь заблокировал бота — помечаем в БД.
bot.catch(async (err) => {
  const e: any = err.error;
  if (e?.error_code === 403 && err.ctx.from) {
    try { await setBlocked(String(err.ctx.from.id), true); } catch { /* ignore */ }
    return;
  }
  console.error('Bot error:', e ?? err);
});

/**
 * Запускает long-polling (локальная разработка). НЕ ожидать.
 * Сначала снимаем возможный вебхук, иначе getUpdates конфликтует с ним.
 */
export function startBot(): Bot {
  void bot.api.deleteWebhook().catch(() => {}).then(() =>
    bot.start({
      onStart: (info) => console.log(`AstroBot: @${info.username} online ✅ (long polling)`),
    }),
  );
  return bot;
}

/** Регистрирует Fastify-роут, принимающий апдейты от Telegram (вебхук). */
export function registerWebhookRoute(app: FastifyInstance): void {
  app.post(
    WEBHOOK_PATH,
    { config: { skipAuth: true } }, // авторизация — через secret_token Telegram
    webhookCallback(bot, 'fastify', { secretToken: config.tg.botSecret }),
  );
}

/** Сообщает Telegram, куда слать апдейты. Вызывать после app.listen(). */
export async function activateWebhook(publicUrl: string): Promise<void> {
  await bot.init(); // нужно для ctx.me (имя бота в ссылках)
  const url = publicUrl.replace(/\/$/, '') + WEBHOOK_PATH;
  await bot.api.setWebhook(url, { secret_token: config.tg.botSecret });
  console.log(`AstroBot: @${bot.botInfo.username} online ✅ (webhook: ${url})`);
}
