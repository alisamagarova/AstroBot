import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { getPersonById } from '../db/queries/people.js';
import { getUserById } from '../db/queries/users.js';
import { ownsAccount } from '../plugins/auth.js';
import type { DbPerson } from '../types.js';

/**
 * Роуты для астрологических расчётов.
 * Расчёты выполняются на сервере через Astronomy Engine (Node.js совместим).
 * Результаты кэшируются в таблицах natal_charts / solar_charts / etc.
 *
 * TODO: реализовать после подключения astronomy-engine к бэкенду.
 */

/** Загружает профиль и проверяет, что он принадлежит вызывающему. */
async function loadOwnedPerson(
  request: FastifyRequest,
  reply: FastifyReply,
  personId: string,
): Promise<DbPerson | null> {
  const person = await getPersonById(personId);
  if (!person) { reply.status(404).send({ error: 'Person not found' }); return null; }
  if (request.authCtx?.caller !== 'bot') {
    const owner = await getUserById(person.owner_id);
    if (!owner || !ownsAccount(request, owner.tg_id)) {
      reply.status(403).send({ error: 'Forbidden: profile does not belong to caller' });
      return null;
    }
  }
  return person;
}

const chartsRoutes: FastifyPluginAsync = async (fastify) => {

  /** GET /people/:personId/natal
   *  Возвращает натальную карту профиля.
   *  Если кэш есть — отдаёт из БД. Если нет — вычисляет и сохраняет.
   */
  fastify.get<{ Params: { personId: string } }>(
    '/people/:personId/natal',
    async (request, reply) => {
      const person = await loadOwnedPerson(request, reply, request.params.personId);
      if (!person) return;

      // TODO: проверить кэш в natal_charts, если пусто — вычислить
      return reply.status(501).send({ error: 'Chart computation not yet implemented' });
    },
  );

  /** GET /people/:personId/solar?year=2025
   *  Соляр — принимает год и (опционально) координаты места наблюдения.
   *  Если место не передано — берётся res_lat/res_lon из профиля,
   *  а если и они null — место рождения.
   */
  fastify.get<{
    Params: { personId: string };
    Querystring: { year?: string; lat?: string; lon?: string };
  }>(
    '/people/:personId/solar',
    async (request, reply) => {
      const person = await loadOwnedPerson(request, reply, request.params.personId);
      if (!person) return;

      const year = Number(request.query.year ?? new Date().getFullYear());
      if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        return reply.status(400).send({ error: 'Invalid year' });
      }

      // TODO: вычислить соляр
      return reply.status(501).send({ error: 'Chart computation not yet implemented' });
    },
  );

  /** GET /people/:personId/aspects?month=2025-07
   *  Аспекты на указанный месяц.
   */
  fastify.get<{
    Params: { personId: string };
    Querystring: { month?: string };
  }>(
    '/people/:personId/aspects',
    async (request, reply) => {
      const person = await loadOwnedPerson(request, reply, request.params.personId);
      if (!person) return;

      // month format: YYYY-MM
      const monthParam = request.query.month ?? new Date().toISOString().slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(monthParam)) {
        return reply.status(400).send({ error: 'month must be YYYY-MM' });
      }

      // TODO: вычислить транзитные аспекты
      return reply.status(501).send({ error: 'Chart computation not yet implemented' });
    },
  );

  /** POST /synastry
   *  Синастрия двух профилей.
   */
  fastify.post<{ Body: { person_a_id: string; person_b_id: string } }>(
    '/synastry',
    async (request, reply) => {
      const { person_a_id, person_b_id } = request.body ?? {};
      if (!person_a_id || !person_b_id) {
        return reply.status(400).send({ error: 'person_a_id and person_b_id are required' });
      }
      if (person_a_id === person_b_id) {
        return reply.status(400).send({ error: 'Cannot compute synastry for the same person' });
      }

      // Оба профиля должны принадлежать вызывающему
      const a = await loadOwnedPerson(request, reply, person_a_id);
      if (!a) return;
      const b = await loadOwnedPerson(request, reply, person_b_id);
      if (!b) return;

      // TODO: вычислить синастрию
      return reply.status(501).send({ error: 'Chart computation not yet implemented' });
    },
  );

  /** GET /people/:personId/milestones?theme=marriage&year=2025
   *  Жизненные вехи по теме и году.
   */
  fastify.get<{
    Params: { personId: string };
    Querystring: { theme?: string; year?: string };
  }>(
    '/people/:personId/milestones',
    async (request, reply) => {
      const person = await loadOwnedPerson(request, reply, request.params.personId);
      if (!person) return;

      const VALID_THEMES = ['marriage','divorce','child','career','relocation',
                           'health','surgery','travel','change','key'];
      const theme = request.query.theme;
      if (!theme || !VALID_THEMES.includes(theme)) {
        return reply.status(400).send({ error: `theme must be one of: ${VALID_THEMES.join(', ')}` });
      }

      // TODO: вычислить вехи
      return reply.status(501).send({ error: 'Chart computation not yet implemented' });
    },
  );
};

export default chartsRoutes;
