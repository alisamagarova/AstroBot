import { z } from 'zod';
import type { FastifyPluginAsync } from 'fastify';
import { InputFile } from 'grammy';
import { requireOwner } from '../plugins/auth.js';
import { bot } from '../bot/bot.js';
import { config } from '../config.js';
import { insertFeedback } from '../db/queries/feedback.js';
import { getUserByTgId } from '../db/queries/users.js';

const Body = z.object({
  kind:       z.enum(['idea', 'bug']),
  message:    z.string().trim().min(3).max(2000),
  screenshot: z.string().nullable().optional(), // data:image/...;base64,...  (только для бага)
});

const feedbackRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/feedback',
    { bodyLimit: 12 * 1024 * 1024 }, // скрин в base64 может быть крупным
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const parsed = Body.safeParse(request.body);
      if (!parsed.success) return reply.status(400).send({ error: 'bad_input' });
      const { kind, message } = parsed.data;
      const tgId = request.params.tgId;

      // Данные отправителя (из initData, с откатом на БД).
      const tgUser = (request as any).authCtx?.tgUser;
      const dbu = await getUserByTgId(tgId).catch(() => null);
      const name = tgUser?.first_name || dbu?.tg_first_name || '—';
      const uname = tgUser?.username || dbu?.tg_username;
      const usernameStr = uname ? '@' + uname : '';

      // Скриншот (только для бага) → Buffer.
      let photoBuf: Buffer | null = null;
      if (kind === 'bug' && parsed.data.screenshot) {
        const m = /^data:image\/\w+;base64,(.+)$/s.exec(parsed.data.screenshot);
        const b64 = m ? m[1] : parsed.data.screenshot;
        try {
          const buf = Buffer.from(b64, 'base64');
          if (buf.length > 200 && buf.length <= 10 * 1024 * 1024) photoBuf = buf;
        } catch { /* битый base64 — игнорируем картинку */ }
      }

      // Сохраняем в БД (не критично, если упадёт).
      let id: string | null = null;
      try { id = await insertFeedback({ tgId, kind, message, hasScreenshot: !!photoBuf }); } catch (e) {
        console.error('feedback insert failed', e);
      }

      const label = kind === 'bug' ? '🐞 Баг' : '💡 Идея';
      const text =
        `${label} · обратная связь${id ? ` #${id}` : ''}\n` +
        `От: ${name} ${usernameStr} (id ${tgId})\n\n` +
        message;

      // Доставляем всем админам в личку.
      const admins = config.adminIds;
      if (!admins.length) console.warn('feedback: ADMIN_TG_IDS не задан — некому доставить');
      for (const a of admins) {
        try {
          await bot.api.sendMessage(a, text);
          if (photoBuf) {
            await bot.api.sendPhoto(a, new InputFile(photoBuf, 'screenshot.jpg'), { caption: `${label}${id ? ` #${id}` : ''} — скриншот` });
          }
        } catch (e: any) {
          console.error('feedback delivery failed', a, e?.description ?? e);
        }
      }

      return { ok: true };
    },
  );
};

export default feedbackRoutes;
