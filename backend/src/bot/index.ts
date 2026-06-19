// Точка входа Telegram-бота (long polling).
// Запуск: npm run bot  (dev) или npm run bot:start (после build).
//
// Бот можно свободно останавливать и запускать снова: состояние онбординга
// хранится в БД, а Telegram при long-polling докинет сообщения, присланные
// пока бот был выключен.

import { Bot } from 'grammy';
import { config } from '../config.js';
import { pool } from '../db/pool.js';
import { setBlocked } from '../db/queries/users.js';
import { handleStart, handleText, handleCallback } from './onboarding.js';

const bot = new Bot(config.tg.botToken);

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

async function main() {
  console.log('AstroBot: starting (long polling)…');

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} — stopping bot…`);
    await bot.stop();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGINT',  () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  await bot.start({
    onStart: (info) => console.log(`AstroBot: @${info.username} online ✅`),
  });
}

void main();
