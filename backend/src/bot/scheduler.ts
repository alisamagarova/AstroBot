// Ежедневная проверка условий и отправка уведомлений через бота.
// Работает внутри процесса бота (Railway 24/7) — внешний cron не нужен.
// Журнал notifications_sent защищает от дублей, поэтому запуск можно повторять.

import { InlineKeyboard } from 'grammy';
import { bot } from './bot.js';
import { config } from '../config.js';
import { setBlocked } from '../db/queries/users.js';
import {
  usersForSolarNotify, usersForAspectNotify,
  hasSolarView, hasAspectView, claimNotification, unclaimNotification,
} from '../db/queries/notifications.js';

const DAY_MS = 86400000;

function openAppKeyboard(): InlineKeyboard | undefined {
  const username = bot.botInfo?.username;
  if (username) return new InlineKeyboard().url('Открыть приложение', `https://t.me/${username}?startapp`);
  if (config.miniAppUrl) return new InlineKeyboard().webApp('Открыть приложение', config.miniAppUrl);
  return undefined;
}

/** Сколько дней до ближайшего дня рождения (0 = сегодня). Возвращает {days, year}. */
function nextBirthday(month: number, day: number): { days: number; year: number } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let y = today.getFullYear();
  let bd = new Date(y, month - 1, day);
  if (bd.getTime() < today.getTime()) { y += 1; bd = new Date(y, month - 1, day); }
  const days = Math.round((bd.getTime() - today.getTime()) / DAY_MS);
  return { days, year: y };
}

type SendResult = 'ok' | 'blocked' | 'fail';

async function send(tgId: string, text: string): Promise<SendResult> {
  try {
    await bot.api.sendMessage(tgId, text, { reply_markup: openAppKeyboard() });
    return 'ok';
  } catch (e: any) {
    if (e?.error_code === 403) { try { await setBlocked(tgId, true); } catch {} return 'blocked'; }
    console.error('notify send failed', tgId, e?.description ?? e);
    return 'fail';
  }
}

/** Помечает отправку, шлёт сообщение; при временной ошибке снимает пометку (повтор позже). */
async function claimAndSend(userId: string, tgId: string, kind: 'solar' | 'aspects', ref: string, text: string): Promise<void> {
  if (!(await claimNotification(userId, kind, ref))) return; // уже отправляли
  const r = await send(tgId, text);
  if (r === 'fail') await unclaimNotification(userId, kind, ref); // транзиторная ошибка → повторим
  // 'ok' и 'blocked' оставляем помеченным (заблокировавшему повторять не нужно)
}

export async function runNotificationCheck(): Promise<void> {
  // ── Соляр: за 7 дней до ДР, если предстоящий солярный год не просмотрен ──
  try {
    const solarUsers = await usersForSolarNotify();
    for (const u of solarUsers) {
      const { days, year } = nextBirthday(u.birth_month, u.birth_day);
      if (days < 0 || days > 7) continue;
      // Если notify_viewed выкл — не шлём о уже просмотренном году.
      if (!u.notify_viewed && await hasSolarView(u.id, year)) continue;
      await claimAndSend(u.id, u.tg_id, 'solar', String(year),
        '🌟 Через неделю начнётся твой новый солярный год!\n' +
        'Загляни в раздел «Соляр» — узнай, что звёзды приготовили на год вперёд.');
    }
  } catch (e) { console.error('solar notify check failed', e); }

  // ── Аспекты: в новом календарном месяце, если текущий месяц не просмотрен ──
  try {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth() + 1;
    const ref = `${y}-${String(m).padStart(2, '0')}`;
    const aspectUsers = await usersForAspectNotify();
    for (const u of aspectUsers) {
      // Если notify_viewed выкл — не шлём о уже просмотренном месяце.
      if (!u.notify_viewed && await hasAspectView(u.id, y, m)) continue;
      await claimAndSend(u.id, u.tg_id, 'aspects', ref,
        '📅 Наступил новый месяц — у неба новые акценты.\n' +
        'Открой «Аспекты на месяц» и посмотри, что он тебе принёс.');
    }
  } catch (e) { console.error('aspect notify check failed', e); }
}

/** Запускает периодическую проверку: первый прогон через минуту, далее каждые 12 часов. */
export function startNotificationScheduler(): void {
  setTimeout(() => { void runNotificationCheck(); }, 60_000);
  setInterval(() => { void runNotificationCheck(); }, 12 * 3600 * 1000);
  console.log('AstroBot: notification scheduler started');
}
