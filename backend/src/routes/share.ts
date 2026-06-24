import { z } from 'zod';
import type { FastifyPluginAsync } from 'fastify';
import { InputFile } from 'grammy';
import { requireOwner } from '../plugins/auth.js';
import { bot } from '../bot/bot.js';

// Натальная карта для другого человека: PDF приходит с клиента, мы НЕ сохраняем
// его в БД — только доставляем в Telegram. Для надёжного нативного шэра загружаем
// документ боту (получаем file_id) и шарим уже закэшированный документ.
const ShareBody = z.object({
  pdf_base64:  z.string().min(1),
  target_name: z.string().max(80).optional(),
  mode:        z.enum(['share', 'relay']).default('relay'),
});

const shareRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Params: { tgId: string } }>(
    '/users/:tgId/share/natal',
    async (request, reply) => {
      if (!requireOwner(request, reply, request.params.tgId)) return;
      const body = ShareBody.safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.flatten() });

      const buf = Buffer.from(body.data.pdf_base64, 'base64');
      if (buf.length < 100 || buf.length > 8 * 1024 * 1024) {
        return reply.status(400).send({ error: 'bad_size' });
      }
      const safe = (body.data.target_name || 'chart').replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 40);
      const name = `natal_${safe}.pdf`;
      const title = body.data.target_name ? `🔮 Натальная карта — ${body.data.target_name}` : '🔮 Натальная карта';

      // 1) Загружаем документ боту → получаем file_id (Telegram уже хранит файл).
      let fileId: string | undefined;
      let sentMsgId: number | undefined;
      try {
        const cap = body.data.mode === 'share'
          ? title
          : title + '\n\nПерешлите это сообщение тому, кому строили карту 💫';
        const sent = await bot.api.sendDocument(
          request.params.tgId,
          new InputFile(buf, name),
          { caption: cap, disable_notification: body.data.mode === 'share' },
        );
        fileId = (sent as any).document?.file_id;
        sentMsgId = sent.message_id;
      } catch (e: any) {
        return reply.status(502).send({ error: 'send_failed', detail: String(e?.description ?? e) });
      }

      // 2) Нативный шэр: убираем копию из чата (file_id остаётся валидным) и готовим
      //    inline-сообщение с закэшированным документом — пользователь выберет получателя.
      if (body.data.mode === 'share' && fileId) {
        try {
          if (sentMsgId) { try { await bot.api.deleteMessage(request.params.tgId, sentMsgId); } catch {} }
          const result: any = {
            type: 'document',
            id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
            title,
            document_file_id: fileId,
            description: 'Полная натальная карта · AstroBot',
          };
          const prep: any = await (bot.api as any).savePreparedInlineMessage(
            Number(request.params.tgId),
            result,
            { allow_user_chats: true, allow_group_chats: true },
          );
          return { prepared_message_id: prep.id };
        } catch (e: any) {
          console.error('savePreparedInlineMessage failed, fallback to relay:', e?.description ?? e);
          // Не вышло — возвращаем файл пользователю в чат (мы его удалили), пусть перешлёт.
          try {
            await bot.api.sendDocument(request.params.tgId, fileId, {
              caption: title + '\n\nПерешлите это сообщение тому, кому строили карту 💫',
            });
          } catch {}
          return { relayed: true };
        }
      }

      // Relay-режим: документ уже в чате пользователя — добавим подсказку.
      return { relayed: true };
    },
  );
};

export default shareRoutes;
