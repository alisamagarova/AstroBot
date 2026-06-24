import { z } from 'zod';
import type { FastifyPluginAsync } from 'fastify';
import { InputFile } from 'grammy';
import { requireOwner } from '../plugins/auth.js';
import { bot } from '../bot/bot.js';

// ─── Транзитное хранилище файлов (НЕ БД) ──────────────────────────────────────
// PDF держим в памяти ~15 минут только для доставки через нативный шэр Telegram.
// Никакой записи в базу — данные другого человека нигде не сохраняются.
interface Transient { buf: Buffer; name: string; exp: number; }
const FILES = new Map<string, Transient>();
const TTL_MS = 15 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of FILES) if (v.exp < now) FILES.delete(k);
}, 60 * 1000).unref?.();

function putFile(buf: Buffer, name: string): string {
  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  FILES.set(token, { buf, name, exp: Date.now() + TTL_MS });
  return token;
}

const ShareBody = z.object({
  pdf_base64:  z.string().min(1),
  target_name: z.string().max(80).optional(),
  mode:        z.enum(['share', 'relay']).default('relay'),
});

const shareRoutes: FastifyPluginAsync = async (fastify) => {

  /** Публичная отдача транзитного файла (Telegram скачивает при шэре). */
  fastify.get<{ Params: { token: string } }>(
    '/share/file/:token',
    { config: { skipAuth: true } },
    async (request, reply) => {
      const f = FILES.get(request.params.token);
      if (!f || f.exp < Date.now()) return reply.status(404).send({ error: 'expired' });
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `inline; filename="${f.name}"`);
      return reply.send(f.buf);
    },
  );

  /** POST /api/share/natal — принять PDF и доставить в Telegram (без сохранения). */
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/share/natal',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = ShareBody.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      const buf = Buffer.from(body.data.pdf_base64, 'base64');
      if (buf.length === 0 || buf.length > 8 * 1024 * 1024) {
        return reply.status(400).send({ error: 'bad_size' });
      }
      const name = `natal_${(body.data.target_name || 'chart').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40)}.pdf`;
      const caption = body.data.target_name
        ? `🔮 Натальная карта — ${body.data.target_name}`
        : '🔮 Натальная карта';

      // Нативный шэр: готовим inline-сообщение с документом по транзитной ссылке.
      if (body.data.mode === 'share') {
        try {
          const token = putFile(buf, name);
          const host = (request.headers['x-forwarded-host'] as string) || request.headers.host;
          const url = `https://${host}/api/share/file/${token}`;
          const result: any = {
            type: 'document',
            id: token,
            title: caption,
            document_url: url,
            mime_type: 'application/pdf',
            description: 'Полная натальная карта · AstroBot',
          };
          const prep: any = await (bot.api as any).savePreparedInlineMessage(
            Number(request.params.tgId),
            result,
            { allow_user_chats: true, allow_group_chats: true },
          );
          return { prepared_message_id: prep.id };
        } catch (e: any) {
          // не получилось — падаем в relay ниже
          console.error('savePreparedInlineMessage failed, fallback to relay:', e?.description ?? e);
        }
      }

      // Relay: присылаем документ пользователю в чат — он перешлёт нужному человеку.
      try {
        await bot.api.sendDocument(
          request.params.tgId,
          new InputFile(buf, name),
          { caption: caption + '\n\nПерешлите это сообщение тому, кому строили карту 💫' },
        );
        return { relayed: true };
      } catch (e: any) {
        return reply.status(502).send({ error: 'send_failed', detail: String(e?.description ?? e) });
      }
    },
  );
};

export default shareRoutes;
