// Сборка и запуск Telegram-бота (grammY, long polling).
// Используется двумя точками входа:
//   • src/index.ts      — вместе с Fastify API на Railway (24/7)
//   • src/bot/index.ts  — отдельный локальный запуск (npm run bot)

import { Bot } from 'grammy';
import { config } from '../config.js';
import { setBlocked } from '../db/queries/users.js';
import { handleStart, handleText, handleCallback } from './onboarding.js';

export const bot = new Bot(config.tg.botToken);

bot.command('start', async (ctx) => { await handleStart(ctx); });
bot.on('callback_query:data', async (ctx) => { await handleCallback(ctx); });
bot.on('message:text', async (ctx) => { await handleText(ctx); });

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
 * Возвращает сам экземпляр для управления (bot.stop()).
 */
export function startBot(): Bot {
  void bot.start({
    onStart: (info) => console.log(`AstroBot: @${info.username} online ✅`),
  });
  return bot;
}
