import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { isDev } from './config.js';
import authPlugin from './plugins/auth.js';
import usersRoutes from './routes/users.js';
import peopleRoutes from './routes/people.js';
import chartsRoutes from './routes/charts.js';

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

  // ─── Health check (без авторизации) ───────────────────────────────────────
  app.get('/health', { config: { skipAuth: true } }, async () => ({ ok: true }));

  return app;
}
