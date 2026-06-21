// Тонкий Telegram-бот (grammY, long polling).
// Сбор данных переехал в Mini App, поэтому бот лишь приветствует и
// открывает приложение кнопкой. Состояние/онбординг в чате больше не ведётся.
//
// Точки входа:
//   • src/index.ts      — вместе с Fastify API на Railway (24/7)
//   • src/bot/index.ts  — отдельный локальный запуск (npm run bot)

import { Bot, InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { config } from '../config.js';
import { upsertUser, setBlocked } from '../db/queries/users.js';
import { getSelfPerson } from '../db/queries/people.js';

export const bot = new Bot(config.tg.botToken);

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

  if (config.miniAppUrl) {
    const kb = new InlineKeyboard().webApp(label, config.miniAppUrl);
    await ctx.reply(text, { reply_markup: kb });
  } else {
    await ctx.reply(text + '\n\n(Открой приложение кнопкой меню слева от поля ввода.)');
  }
}

bot.command('start', async (ctx) => { await handleStart(ctx); });

// Любое сообщение/команда — мягко направляем в приложение.
bot.on('message', async (ctx) => {
  if (ctx.message?.text?.startsWith('/start')) return; // уже обработано выше
  const kb = config.miniAppUrl
    ? new InlineKeyboard().webApp('Открыть приложение', config.miniAppUrl)
    : undefined;
  await ctx.reply('Всё происходит в приложении — открывай 👇', { reply_markup: kb });
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
 * Запускает long-polling. НЕ ожидать (start() резолвится только при остановке).
 */
export function startBot(): Bot {
  void bot.start({
    onStart: (info) => console.log(`AstroBot: @${info.username} online ✅`),
  });
  return bot;
}
