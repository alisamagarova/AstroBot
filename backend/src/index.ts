import { buildApp } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { startBot, bot } from './bot/bot.js';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    app.log.error(err);
    await pool.end();
    process.exit(1);
  }

  // Запускаем Telegram-бота в том же процессе (long polling).
  startBot();
  app.log.info('Telegram bot started alongside API');

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down...`);
    try { await bot.stop(); } catch { /* ignore */ }
    await app.close();
    await pool.end();
    process.exit(0);
  };

  process.on('SIGINT',  () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void main();
