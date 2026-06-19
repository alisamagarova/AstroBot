// Отдельный локальный запуск бота: npm run bot
// (на Railway бот стартует вместе с API из src/index.ts)

import { startBot, bot } from './bot.js';
import { pool } from '../db/pool.js';

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

  startBot();
}

void main();
