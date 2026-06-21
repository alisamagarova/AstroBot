import { z } from 'zod';
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { getUserByTgId, getUserById } from '../db/queries/users.js';
import {
  createPerson,
  getSelfPerson,
  getPeopleByOwner,
  getPersonById,
  updatePerson,
  deletePerson,
} from '../db/queries/people.js';
import { requireOwner, ownsAccount } from '../plugins/auth.js';
import type { DbPerson } from '../types.js';

/** Проверяет, что профиль принадлежит вызывающему (через owner_id → tg_id). */
async function requirePersonOwner(
  request: FastifyRequest,
  reply: FastifyReply,
  person: DbPerson,
): Promise<boolean> {
  if (request.authCtx?.caller === 'bot') return true;
  const owner = await getUserById(person.owner_id);
  if (owner && ownsAccount(request, owner.tg_id)) return true;
  reply.status(403).send({ error: 'Forbidden: profile does not belong to caller' });
  return false;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

/**
 * Дата существует (не 31 февраля) и не находится в будущем.
 * Проверяет полную дату, а не только год — иначе 31.12 текущего года
 * прошёл бы валидацию по году, будучи будущей датой.
 */
function isRealPastDate(day: number, month: number, year: number): boolean {
  const d = new Date(year, month - 1, day);
  // Date нормализует несуществующие даты (31 фев → 3 мар) — проверяем совпадение
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return false;
  }
  // Не из будущего (сравниваем по началу сегодняшнего дня)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() <= today.getTime();
}

const DATE_ERROR = {
  message: 'Дата рождения должна существовать и не может быть в будущем',
  path: ['birth_year'],
};

// Самый ранний час каждого примерного периода — для проверки «не из будущего».
const APPROX_START_HOUR: Record<string, number> = {
  night: 0, morning: 6, day: 12, evening: 18,
};

/**
 * Если дата рождения — сегодня, время рождения не должно быть в будущем.
 * Для exact сравниваем час:минуту, для approx — начало периода.
 * Для дат в прошлом и time_mode='unknown' ограничений нет.
 */
function isBirthTimeNotFuture(d: {
  birth_day: number; birth_month: number; birth_year: number;
  time_mode: string; birth_hour?: number; birth_minute?: number; approx_time?: string;
}): boolean {
  const now = new Date();
  const isToday =
    d.birth_year === now.getFullYear() &&
    d.birth_month === now.getMonth() + 1 &&
    d.birth_day === now.getDate();
  if (!isToday) return true;

  if (d.time_mode === 'exact' && d.birth_hour != null && d.birth_minute != null) {
    const birthMins = d.birth_hour * 60 + d.birth_minute;
    const nowMins   = now.getHours() * 60 + now.getMinutes();
    return birthMins <= nowMins;
  }
  if (d.time_mode === 'approx' && d.approx_time) {
    const startHour = APPROX_START_HOUR[d.approx_time] ?? 0;
    return startHour <= now.getHours();
  }
  return true; // unknown — без ограничений
}

const TIME_ERROR = {
  message: 'Время рождения ещё не наступило сегодня',
  path: ['birth_hour'],
};

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
    birth_year:  z.number().int().min(1900).max(new Date().getFullYear()),
    res_city_ru: z.string().optional().nullable(),
    res_city_en: z.string().optional().nullable(),
    res_lat:     z.number().min(-90).max(90).optional().nullable(),
    res_lon:     z.number().min(-180).max(180).optional().nullable(),
    res_timezone: z.string().optional().nullable(),
  })
  .merge(BirthLocation)
  .and(BirthTime)
  .refine((d) => isRealPastDate(d.birth_day, d.birth_month, d.birth_year), DATE_ERROR)
  .refine(isBirthTimeNotFuture, TIME_ERROR);

// Обновление профиля — все поля опциональны
const UpdatePersonBody = z.object({
  name:        z.string().min(1).max(100).optional(),
  name_en:     z.string().max(100).optional().nullable(),

  // Дата (для is_self — только 1 раз за всё время)
  birth_day:   z.number().int().min(1).max(31).optional(),
  birth_month: z.number().int().min(1).max(12).optional(),
  birth_year:  z.number().int().min(1900).max(new Date().getFullYear()).optional(),

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
})
  // Если в запросе передана полная дата — проверяем, что она реальна и не из будущего.
  .refine(
    (d) => d.birth_day == null || d.birth_month == null || d.birth_year == null
      || isRealPastDate(d.birth_day, d.birth_month, d.birth_year),
    DATE_ERROR,
  )
  // Если передана и полная дата, и время — проверяем, что момент не из будущего.
  .refine(
    (d) => d.birth_day == null || d.birth_month == null || d.birth_year == null || d.time_mode == null
      || isBirthTimeNotFuture({
        birth_day: d.birth_day, birth_month: d.birth_month, birth_year: d.birth_year,
        time_mode: d.time_mode,
        birth_hour: d.birth_hour ?? undefined,
        birth_minute: d.birth_minute ?? undefined,
        approx_time: d.approx_time ?? undefined,
      }),
    TIME_ERROR,
  );

// ─── Plugin ───────────────────────────────────────────────────────────────────

const peopleRoutes: FastifyPluginAsync = async (fastify) => {

  /** POST /users/:tgId/self
   *  Создаёт профиль самого пользователя (вызывается при онбординге).
   */
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/self',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
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
      if (!requireOwner(request, reply, request.params.tgId)) return;
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
      if (!requireOwner(request, reply, request.params.tgId)) return;
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
      if (!requireOwner(request, reply, request.params.tgId)) return;
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
      if (!requireOwner(request, reply, request.params.tgId)) return;
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
      const target = await getPersonById(request.params.personId);
      if (!target) return reply.status(404).send({ error: 'Person not found' });
      if (!(await requirePersonOwner(request, reply, target))) return;

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
      if (!(await requirePersonOwner(request, reply, person))) return;
      if (person.is_self) {
        return reply.status(403).send({ error: 'Cannot delete self profile' });
      }

      await deletePerson(request.params.personId);
      return reply.status(204).send();
    },
  );
};

export default peopleRoutes;
