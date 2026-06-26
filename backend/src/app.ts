import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { isDev, config } from './config.js';
import authPlugin from './plugins/auth.js';
import usersRoutes from './routes/users.js';
import peopleRoutes from './routes/people.js';
import chartsRoutes from './routes/charts.js';
import adminRoutes from './routes/admin.js';
import notificationsRoutes from './routes/notifications.js';
import shareRoutes from './routes/share.js';
import feedbackRoutes from './routes/feedback.js';
import { registerWebhookRoute } from './bot/bot.js';

export async function buildApp() {
  const app = Fastify({
    logger: isDev
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : true,
  });

  // ─── Plugins ───────────────────────────────────────────────────────────────
  await app.register(cors, { origin: true });
  await app.register(sensible);
  await app.register(authPlugin);

  // ─── Routes ───────────────────────────────────────────────────────────────
  await app.register(usersRoutes,  { prefix: '/api' });
  await app.register(peopleRoutes, { prefix: '/api' });
  await app.register(chartsRoutes, { prefix: '/api' });
  await app.register(notificationsRoutes, { prefix: '/api' });
  await app.register(shareRoutes, { prefix: '/api' });
  await app.register(feedbackRoutes, { prefix: '/api' });
  await app.register(adminRoutes);

  // ─── Telegram webhook (если задан публичный URL) ───────────────────────────
  if (config.webhookUrl) registerWebhookRoute(app);

  // ─── Health check (без авторизации) ───────────────────────────────────────
  app.get('/health', { config: { skipAuth: true } }, async () => ({ ok: true }));

  return app;
}
