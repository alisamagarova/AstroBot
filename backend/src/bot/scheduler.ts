// Ежедневная проверка условий и отправка уведомлений через бота.
// Работает внутри процесса бота (Railway 24/7) — внешний cron не нужен.
// Журнал notifications_sent защищает от дублей, поэтому запуск можно повторять.

import { InlineKeyboard } from 'grammy';
import { bot } from './bot.js';
import { config } from '../config.js';
import { setBlocked, allActiveUsers } from '../db/queries/users.js';
import { getSetting, setSetting } from '../db/queries/settings.js';
import {
  usersForSolarNotify, usersForAspectNotify, usersForDailyNotify,
  hasSolarView, hasAspectView, claimNotification, unclaimNotification,
} from '../db/queries/notifications.js';

const DAY_MS = 86400000;

// Ступенчатый горизонт «Жизненных вех»: база 2038, шаг +5 лет.
// Сдвигается, когда до построенного предела остаётся ≤5 лет (2033 → 2043 и т.д.).
// ВАЖНО: должен совпадать с фронтом (milestones-engine.js), иначе год в рассылке
// разойдётся с тем, что пользователь видит в приложении.
const MS_HORIZON_BASE = 2038;
function milestonesHorizon(now = new Date()): number {
  const y = now.getFullYear();
  let h = MS_HORIZON_BASE;
  while (y >= h - 5) h += 5;
  return h;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
async function claimAndSend(userId: string, tgId: string, kind: 'solar' | 'aspects' | 'milestones' | 'daily', ref: string, text: string): Promise<void> {
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

  // ── Карта дня: раз в сутки для подписанных (антидубль по дате) ──
  try {
    const now = new Date();
    const ref = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const dailyUsers = await usersForDailyNotify();
    for (const u of dailyUsers) {
      await claimAndSend(u.id, u.tg_id, 'daily', ref,
        '🃏 Новая карта дня уже ждёт!\n' +
        'Открой приложение и узнай, что она подсказывает на сегодня.');
      await sleep(40); // мягкий троттлинг под лимиты Telegram
    }
  } catch (e) { console.error('daily card notify check failed', e); }

  // ── Горизонт «Жизненных вех»: при сдвиге — разовая рассылка всем ──
  await runMilestonesHorizonCheck();
}

/**
 * Следит за ступенчатым горизонтом вех. При самом первом запуске на БД просто
 * фиксирует текущий горизонт как базовый (без рассылки — не спамим существующих).
 * Когда горизонт вырастает (раз в 5 лет) — шлёт всем сообщение с новым годом.
 * Антидубль на уровне пользователя (notifications_sent, kind='milestones', ref=год)
 * делает прогон идемпотентным: рестарт посреди рассылки не задвоит сообщения.
 */
export async function runMilestonesHorizonCheck(): Promise<void> {
  try {
    const h = milestonesHorizon();
    const stored = await getSetting('milestones_horizon');
    if (stored == null) {
      await setSetting('milestones_horizon', String(h)); // базовый уровень, без рассылки
      return;
    }
    if (h <= Number(stored)) return; // горизонт не вырос — ничего не делаем

    const ref = String(h);
    const text =
      '🔭 Жизненные вехи обновились!\n' +
      `Прогноз теперь построен до ${h} года — впереди открылись новые годы.\n` +
      'Загляни в раздел «Жизненные вехи» и посмотри, что приготовило небо.';
    const users = await allActiveUsers();
    for (const u of users) {
      await claimAndSend(u.id, u.tg_id, 'milestones', ref, text);
      await sleep(50); // мягкий троттлинг под лимиты Telegram (~20 сообщений/с)
    }
    await setSetting('milestones_horizon', ref); // все разосланы → двигаем отметку
  } catch (e) { console.error('milestones horizon check failed', e); }
}

/** Запускает периодическую проверку: первый прогон через минуту, далее каждые 12 часов. */
export function startNotificationScheduler(): void {
  setTimeout(() => { void runNotificationCheck(); }, 60_000);
  setInterval(() => { void runNotificationCheck(); }, 12 * 3600 * 1000);
  console.log('AstroBot: notification scheduler started');
}
