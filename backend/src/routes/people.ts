import { z } from 'zod';
import type { FastifyPluginAsync } from 'fastify';
import { getUserByTgId } from '../db/queries/users.js';
import {
  createPerson,
  getSelfPerson,
  getPeopleByOwner,
  getPersonById,
  updatePerson,
  deletePerson,
} from '../db/queries/people.js';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const BirthLocation = z.object({
  birth_city_ru:    z.string().optional().nullable(),
  birth_city_en:    z.string().optional().nullable(),
  birth_city_reg:   z.string().optional().nullable(),
  birth_lat:        z.number().min(-90).max(90),
  birth_lon:        z.number().min(-180).max(180),
  birth_utc_offset: z.number().min(-12).max(14),
  birth_timezone:   z.string().min(1),
});

const BirthTime = z.discriminatedUnion('time_mode', [
  z.object({
    time_mode:    z.literal('exact'),
    birth_hour:   z.number().int().min(0).max(23),
    birth_minute: z.number().int().min(0).max(59),
  }),
  z.object({
    time_mode:   z.literal('approx'),
    approx_time: z.enum(['morning', 'day', 'evening', 'night']),
  }),
  z.object({
    time_mode: z.literal('unknown'),
  }),
]);

// Полный профиль рождения (для создания)
const CreatePersonBody = z
  .object({
    name:        z.string().min(1).max(100),
    name_en:     z.string().max(100).optional().nullable(),
    birth_day:   z.number().int().min(1).max(31),
    birth_month: z.number().int().min(1).max(12),
    birth_year:  z.number().int().min(1900).max(2025),
    res_city_ru: z.string().optional().nullable(),
    res_city_en: z.string().optional().nullable(),
    res_lat:     z.number().min(-90).max(90).optional().nullable(),
    res_lon:     z.number().min(-180).max(180).optional().nullable(),
    res_timezone: z.string().optional().nullable(),
  })
  .merge(BirthLocation)
  .and(BirthTime);

// Обновление профиля — все поля опциональны
const UpdatePersonBody = z.object({
  name:        z.string().min(1).max(100).optional(),
  name_en:     z.string().max(100).optional().nullable(),

  // Дата (для is_self — только 1 раз за всё время)
  birth_day:   z.number().int().min(1).max(31).optional(),
  birth_month: z.number().int().min(1).max(12).optional(),
  birth_year:  z.number().int().min(1900).max(2025).optional(),

  // Время — без ограничений
  time_mode:    z.enum(['exact', 'approx', 'unknown']).optional(),
  birth_hour:   z.number().int().min(0).max(23).optional().nullable(),
  birth_minute: z.number().int().min(0).max(59).optional().nullable(),
  approx_time:  z.enum(['morning', 'day', 'evening', 'night']).optional().nullable(),

  // Место рождения
  birth_city_ru:    z.string().optional().nullable(),
  birth_city_en:    z.string().optional().nullable(),
  birth_city_reg:   z.string().optional().nullable(),
  birth_lat:        z.number().min(-90).max(90).optional(),
  birth_lon:        z.number().min(-180).max(180).optional(),
  birth_utc_offset: z.number().min(-12).max(14).optional(),
  birth_timezone:   z.string().min(1).optional(),

  // Место проживания (для соляра)
  res_city_ru:  z.string().optional().nullable(),
  res_city_en:  z.string().optional().nullable(),
  res_lat:      z.number().min(-90).max(90).optional().nullable(),
  res_lon:      z.number().min(-180).max(180).optional().nullable(),
  res_timezone: z.string().optional().nullable(),
});

// ─── Plugin ───────────────────────────────────────────────────────────────────

const peopleRoutes: FastifyPluginAsync = async (fastify) => {

  /** POST /users/:tgId/self
   *  Создаёт профиль самого пользователя (вызывается при онбординге).
   */
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/self',
    async (request, reply) => {
      const user = await getUserByTgId(request.params.tgId);
      if (!user) return reply.status(404).send({ error: 'User not found' });

      // Нельзя создать второй self-профиль
      const existing = await getSelfPerson(request.params.tgId);
      if (existing) {
        return reply.status(409).send({ error: 'Self profile already exists' });
      }

      const body = CreatePersonBody.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const data = body.data as z.infer<typeof CreatePersonBody> & {
        birth_hour?: number; birth_minute?: number; approx_time?: string;
      };

      const person = await createPerson({
        owner_id:    user.id,
        is_self:     true,
        name:        data.name,
        name_en:     data.name_en ?? null,
        birth_day:   data.birth_day,
        birth_month: data.birth_month,
        birth_year:  data.birth_year,
        time_mode:   data.time_mode,
        birth_hour:  'birth_hour' in data ? data.birth_hour : null,
        birth_minute: 'birth_minute' in data ? data.birth_minute : null,
        approx_time: 'approx_time' in data ? (data.approx_time as any) : null,
        birth_city_ru:    data.birth_city_ru,
        birth_city_en:    data.birth_city_en,
        birth_city_reg:   data.birth_city_reg,
        birth_lat:        data.birth_lat,
        birth_lon:        data.birth_lon,
        birth_utc_offset: data.birth_utc_offset,
        birth_timezone:   data.birth_timezone,
      });

      return reply.status(201).send({ person });
    },
  );

  /** GET /users/:tgId/self
   *  Возвращает self-профиль пользователя.
   */
  fastify.get<{ Params: { tgId: string } }>(
    '/users/:tgId/self',
    async (request, reply) => {
      const person = await getSelfPerson(request.params.tgId);
      if (!person) return reply.status(404).send({ error: 'Self profile not found' });
      return { person };
    },
  );

  /** PATCH /users/:tgId/self
   *  Обновляет self-профиль.
   *  Дата рождения может быть изменена только один раз (бизнес-правило).
   */
  fastify.patch<{ Params: { tgId: string } }>(
    '/users/:tgId/self',
    async (request, reply) => {
      const person = await getSelfPerson(request.params.tgId);
      if (!person) return reply.status(404).send({ error: 'Self profile not found' });

      const body = UpdatePersonBody.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      try {
        const updated = await updatePerson(person.id, body.data);
        return { person: updated };
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'BIRTH_DATE_LOCKED') {
          return reply.status(409).send({
            error: 'BIRTH_DATE_LOCKED',
            message: 'Дата рождения уже была изменена однажды и не может быть изменена повторно.',
          });
        }
        throw err;
      }
    },
  );

  /** GET /users/:tgId/people
   *  Список всех профилей пользователя (себя + партнёры).
   */
  fastify.get<{ Params: { tgId: string } }>(
    '/users/:tgId/people',
    async (request, reply) => {
      const people = await getPeopleByOwner(request.params.tgId);
      return { people };
    },
  );

  /** POST /users/:tgId/people
   *  Создаёт профиль партнёра для синастрии.
   */
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/people',
    async (request, reply) => {
      const user = await getUserByTgId(request.params.tgId);
      if (!user) return reply.status(404).send({ error: 'User not found' });

      const body = CreatePersonBody.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      const data = body.data as any;
      const person = await createPerson({
        owner_id:    user.id,
        is_self:     false,
        name:        data.name,
        name_en:     data.name_en ?? null,
        birth_day:   data.birth_day,
        birth_month: data.birth_month,
        birth_year:  data.birth_year,
        time_mode:   data.time_mode,
        birth_hour:  data.birth_hour   ?? null,
        birth_minute: data.birth_minute ?? null,
        approx_time: data.approx_time  ?? null,
        birth_city_ru:    data.birth_city_ru,
        birth_city_en:    data.birth_city_en,
        birth_city_reg:   data.birth_city_reg,
        birth_lat:        data.birth_lat,
        birth_lon:        data.birth_lon,
        birth_utc_offset: data.birth_utc_offset,
        birth_timezone:   data.birth_timezone,
      });

      return reply.status(201).send({ person });
    },
  );

  /** PATCH /people/:personId
   *  Обновляет любой профиль (партнёра или свой через внутренний ID).
   */
  fastify.patch<{ Params: { personId: string } }>(
    '/people/:personId',
    async (request, reply) => {
      const body = UpdatePersonBody.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({ error: body.error.flatten() });
      }

      try {
        const updated = await updatePerson(request.params.personId, body.data);
        return { person: updated };
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === 'PERSON_NOT_FOUND')
            return reply.status(404).send({ error: 'Person not found' });
          if (err.message === 'BIRTH_DATE_LOCKED')
            return reply.status(409).send({
              error: 'BIRTH_DATE_LOCKED',
              message: 'Дата рождения уже была изменена однажды и не может быть изменена повторно.',
            });
        }
        throw err;
      }
    },
  );

  /** DELETE /people/:personId
   *  Удаляет партнёрский профиль.
   *  Self-профиль удалить нельзя (проверяем is_self).
   */
  fastify.delete<{ Params: { personId: string } }>(
    '/people/:personId',
    async (request, reply) => {
      const person = await getPersonById(request.params.personId);
      if (!person) return reply.status(404).send({ error: 'Person not found' });
      if (person.is_self) {
        return reply.status(403).send({ error: 'Cannot delete self profile' });
      }

      await deletePerson(request.params.personId);
      return reply.status(204).send();
    },
  );
};

export default peopleRoutes;
