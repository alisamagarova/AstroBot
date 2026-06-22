import { z } from 'zod';
import type { FastifyPluginAsync } from 'fastify';
import { getUserByTgId } from '../db/queries/users.js';
import { requireOwner } from '../plugins/auth.js';
import {
  getNotifyPrefs, setNotifyPrefs, recordSolarView, recordAspectView,
} from '../db/queries/notifications.js';

const PrefsBody = z.object({
  notify_solar:   z.boolean().optional(),
  notify_aspects: z.boolean().optional(),
});

const SolarViewBody  = z.object({ year: z.number().int().min(1900).max(2100) });
const AspectViewBody = z.object({
  year:  z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
});

const notificationsRoutes: FastifyPluginAsync = async (fastify) => {

  /** GET /users/:tgId/notifications — текущие настройки уведомлений. */
  fastify.get<{ Params: { tgId: string } }>(
    '/users/:tgId/notifications',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const prefs = await getNotifyPrefs(request.params.tgId);
      if (!prefs) return reply.status(404).send({ error: 'User not found' });
      return { prefs };
    },
  );

  /** PATCH /users/:tgId/notifications — обновить настройки. */
  fastify.patch<{ Params: { tgId: string } }>(
    '/users/:tgId/notifications',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = PrefsBody.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
      await setNotifyPrefs(request.params.tgId, body.data);
      return reply.status(204).send();
    },
  );

  /** POST /users/:tgId/views/solar — отметить просмотр солярного года. */
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/views/solar',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = SolarViewBody.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
      const user = await getUserByTgId(request.params.tgId);
      if (!user) return reply.status(404).send({ error: 'User not found' });
      await recordSolarView(user.id, body.data.year);
      return reply.status(204).send();
    },
  );

  /** POST /users/:tgId/views/aspects — отметить просмотр месяца аспектов. */
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/views/aspects',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = AspectViewBody.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });
      const user = await getUserByTgId(request.params.tgId);
      if (!user) return reply.status(404).send({ error: 'User not found' });
      await recordAspectView(user.id, body.data.year, body.data.month);
      return reply.status(204).send();
    },
  );
};

export default notificationsRoutes;
