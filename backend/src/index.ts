import { buildApp } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { startBot, activateWebhook, bot } from './bot/bot.js';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    app.log.error(err);
    await pool.end();
    process.exit(1);
  }

  // Бот: вебхук (прод, Render) если задан публичный URL, иначе long polling (локально).
  if (config.webhookUrl) {
    try { await activateWebhook(config.webhookUrl); app.log.info('Telegram bot: webhook mode'); }
    catch (e) { app.log.error({ e }, 'Failed to set webhook'); }
  } else {
    startBot();
    app.log.info('Telegram bot: long-polling mode');
  }

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
