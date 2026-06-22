// Ежедневная проверка условий и отправка уведомлений через бота.
// Работает внутри процесса бота (Railway 24/7) — внешний cron не нужен.
// Журнал notifications_sent защищает от дублей, поэтому запуск можно повторять.

import { InlineKeyboard } from 'grammy';
import { bot } from './bot.js';
import { config } from '../config.js';
import { setBlocked } from '../db/queries/users.js';
import {
  usersForSolarNotify, usersForAspectNotify,
  hasSolarView, hasAspectView, claimNotification,
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

async function send(tgId: string, text: string): Promise<void> {
  try {
    await bot.api.sendMessage(tgId, text, { reply_markup: openAppKeyboard() });
  } catch (e: any) {
    if (e?.error_code === 403) { try { await setBlocked(tgId, true); } catch {} }
    else console.error('notify send failed', tgId, e?.description ?? e);
  }
}

export async function runNotificationCheck(): Promise<void> {
  // ── Соляр: за 7 дней до ДР, если предстоящий солярный год не просмотрен ──
  try {
    const solarUsers = await usersForSolarNotify();
    for (const u of solarUsers) {
      const { days, year } = nextBirthday(u.birth_month, u.birth_day);
      if (days < 0 || days > 7) continue;
      if (await hasSolarView(u.id, year)) continue;
      if (!(await claimNotification(u.id, 'solar', String(year)))) continue;
      await send(u.tg_id,
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
      if (await hasAspectView(u.id, y, m)) continue;
      if (!(await claimNotification(u.id, 'aspects', ref))) continue;
      await send(u.tg_id,
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
