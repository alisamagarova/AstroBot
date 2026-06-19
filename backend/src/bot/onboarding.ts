// Онбординг в чате: /start → имя → дата → время → город → согласие → готово.
// Состояние (шаг + черновик ответов) хранится в БД, поэтому диалог
// переживает остановку/перезапуск бота — утром продолжится с того же места.

import { InlineKeyboard } from 'grammy';
import type { Context } from 'grammy';
import { config } from '../config.js';
import type { OnboardingStep } from '../types.js';
import {
  upsertUser, getUserByTgId, setOnboardingStep,
  getOnboardingDraft, mergeOnboardingDraft, clearOnboardingDraft,
  type OnboardingDraft,
} from '../db/queries/users.js';
import { createPerson, getSelfPerson } from '../db/queries/people.js';
import { saveConsent } from '../db/queries/consents.js';
import { searchCities, type GeoCity } from './geocode.js';

const DOC_VERSION = '1.0';

// ─── Тексты вопросов ────────────────────────────────────────────────────────

const ASK = {
  name:       'Как тебя зовут? Напиши своё имя 🙂',
  birth_date: 'Отлично! Теперь дата рождения.\nНапиши её в формате ДД.ММ.ГГГГ — например, 03.08.2002',
  birth_time: 'Во сколько ты родился(ась)?\n\n' +
              '• Точное время — формат ЧЧ:ММ (например 14:30)\n' +
              '• Примерно — напиши: утро / день / вечер / ночь\n' +
              '• Не знаешь — напиши: не знаю',
  city:       'В каком городе ты родился(ась)? Напиши название.',
};

// ─── Вспомогательные парсеры ──────────────────────────────────────────────────

function parseDate(text: string): { day: number; month: number; year: number } | null {
  const m = text.trim().match(/^(\d{1,2})[.\-/\s]+(\d{1,2})[.\-/\s]+(\d{4})$/);
  if (!m) return null;
  const day = +m[1], month = +m[2], year = +m[3];
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (year < 1900 || year > new Date().getFullYear()) return null;
  return { day, month, year };
}

type TimeAnswer =
  | { mode: 'exact'; hour: number; minute: number }
  | { mode: 'approx'; approx: 'morning' | 'day' | 'evening' | 'night' }
  | { mode: 'unknown' };

function parseTime(text: string): TimeAnswer | null {
  const t = text.trim().toLowerCase();
  const hm = t.match(/^(\d{1,2})[:.\s](\d{2})$/);
  if (hm) {
    const hour = +hm[1], minute = +hm[2];
    if (hour > 23 || minute > 59) return null;
    return { mode: 'exact', hour, minute };
  }
  if (/^утр/.test(t))  return { mode: 'approx', approx: 'morning' };
  if (/^день|^дня/.test(t)) return { mode: 'approx', approx: 'day' };
  if (/^веч/.test(t))  return { mode: 'approx', approx: 'evening' };
  if (/^ноч/.test(t))  return { mode: 'approx', approx: 'night' };
  if (/^не\s*зна|^-+$|^хз/.test(t)) return { mode: 'unknown' };
  return null;
}

// ─── Отправка вопроса по текущему шагу (используется и при возобновлении) ─────

async function askStep(ctx: Context, step: OnboardingStep): Promise<void> {
  switch (step) {
    case 'name':       await ctx.reply(ASK.name); break;
    case 'birth_date': await ctx.reply(ASK.birth_date); break;
    case 'birth_time': await ctx.reply(ASK.birth_time); break;
    case 'city':       await ctx.reply(ASK.city); break;
    case 'consent':    await askConsent(ctx); break;
    case 'done':       await sendDone(ctx); break;
  }
}

async function askConsent(ctx: Context): Promise<void> {
  const kb = new InlineKeyboard().text('✅ Принимаю', 'consent:accept');
  await ctx.reply(
    'Почти готово! Перед началом нужно согласие на обработку данных.\n\n' +
    'Нажимая «Принимаю», ты соглашаешься с политикой конфиденциальности ' +
    'и пользовательским соглашением.',
    { reply_markup: kb },
  );
}

async function sendDone(ctx: Context): Promise<void> {
  const text = '🌟 Готово! Твой профиль создан.\nОткрывай приложение — натальная карта уже ждёт.';
  if (config.miniAppUrl) {
    const kb = new InlineKeyboard().webApp('Открыть приложение', config.miniAppUrl);
    await ctx.reply(text, { reply_markup: kb });
  } else {
    await ctx.reply(text + '\n\n(Нажми кнопку меню слева от поля ввода, чтобы открыть приложение.)');
  }
}

// ─── /start ───────────────────────────────────────────────────────────────────

export async function handleStart(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  const tgId = String(from.id);

  await upsertUser({
    tg_id:         tgId,
    tg_username:   from.username ?? null,
    tg_first_name: from.first_name ?? null,
    tg_last_name:  from.last_name ?? null,
  });

  const user = await getUserByTgId(tgId);

  // Уже прошёл онбординг — сразу даём кнопку приложения.
  if (user?.onboarding_completed) {
    await ctx.reply('С возвращением! ✨');
    await sendDone(ctx);
    return;
  }

  // Начинаем заново с имени.
  await ctx.reply(
    '✨ Привет! Я AstroAI — твой персональный астролог.\n\n' +
    'Задам несколько вопросов, чтобы построить твою натальную карту. Это займёт минуту.',
  );
  await setOnboardingStep(tgId, 'name');
  await askStep(ctx, 'name');
}

// ─── Обработка текстовых ответов ──────────────────────────────────────────────

export async function handleText(ctx: Context): Promise<void> {
  const from = ctx.from;
  const text = ctx.message?.text;
  if (!from || !text) return;
  const tgId = String(from.id);

  const user = await getUserByTgId(tgId);
  if (!user || !user.onboarding_step) {
    // Не начинал — отправим к /start.
    await ctx.reply('Напиши /start, чтобы начать 🙂');
    return;
  }

  const step = user.onboarding_step as OnboardingStep;

  switch (step) {
    case 'name': {
      const name = text.trim().slice(0, 64);
      if (!name) { await ctx.reply('Имя не может быть пустым. Попробуй ещё раз.'); return; }
      await mergeOnboardingDraft(tgId, { name });
      await setOnboardingStep(tgId, 'birth_date');
      await askStep(ctx, 'birth_date');
      return;
    }

    case 'birth_date': {
      const d = parseDate(text);
      if (!d) { await ctx.reply('Не понял дату. Формат: ДД.ММ.ГГГГ (например 03.08.2002).'); return; }
      await mergeOnboardingDraft(tgId, { birth_day: d.day, birth_month: d.month, birth_year: d.year });
      await setOnboardingStep(tgId, 'birth_time');
      await askStep(ctx, 'birth_time');
      return;
    }

    case 'birth_time': {
      const t = parseTime(text);
      if (!t) { await ctx.reply('Не понял время. Напиши ЧЧ:ММ, либо утро/день/вечер/ночь, либо «не знаю».'); return; }
      const patch: OnboardingDraft =
        t.mode === 'exact'  ? { time_mode: 'exact', birth_hour: t.hour, birth_minute: t.minute }
      : t.mode === 'approx' ? { time_mode: 'approx', approx_time: t.approx }
      :                       { time_mode: 'unknown' };
      await mergeOnboardingDraft(tgId, patch);
      await setOnboardingStep(tgId, 'city');
      await askStep(ctx, 'city');
      return;
    }

    case 'city': {
      let cities: GeoCity[] = [];
      try { cities = await searchCities(text, 5); } catch { /* network */ }
      if (cities.length === 0) {
        await ctx.reply('Не нашёл такой город. Попробуй написать иначе (например «Москва»).');
        return;
      }
      // Сохраняем варианты в черновик и предлагаем выбрать кнопками.
      const kb = new InlineKeyboard();
      cities.forEach((c, i) => {
        kb.text(`${c.city_ru}${c.city_reg ? ' · ' + c.city_reg : ''}`, `city:${i}`).row();
      });
      // временно держим список в draft под служебным ключом
      await mergeOnboardingDraft(tgId, { _cityChoices: cities } as any);
      await ctx.reply('Нашёл несколько вариантов — выбери свой:', { reply_markup: kb });
      return;
    }

    case 'consent':
      await ctx.reply('Нажми кнопку «✅ Принимаю» выше, чтобы продолжить.');
      return;

    case 'done':
      await sendDone(ctx);
      return;
  }
}

// ─── Обработка нажатий inline-кнопок ──────────────────────────────────────────

export async function handleCallback(ctx: Context): Promise<void> {
  const from = ctx.from;
  const data = ctx.callbackQuery?.data;
  if (!from || !data) return;
  const tgId = String(from.id);

  // Выбор города: city:N
  if (data.startsWith('city:')) {
    await ctx.answerCallbackQuery();
    const idx = Number(data.slice(5));
    const draft = await getOnboardingDraft(tgId) as OnboardingDraft & { _cityChoices?: GeoCity[] };
    const choice = draft._cityChoices?.[idx];
    if (!choice) { await ctx.reply('Выбор устарел. Напиши город ещё раз.'); return; }

    await mergeOnboardingDraft(tgId, {
      city_ru:    choice.city_ru,
      city_en:    choice.city_en,
      city_reg:   choice.city_reg,
      lat:        choice.lat,
      lon:        choice.lon,
      utc_offset: choice.utc_offset,
      timezone:   choice.timezone,
      _cityChoices: undefined,
    } as any);

    await ctx.reply(`Город: ${choice.city_ru}. Отлично!`);
    await setOnboardingStep(tgId, 'consent');
    await askStep(ctx, 'consent');
    return;
  }

  // Согласие
  if (data === 'consent:accept') {
    await ctx.answerCallbackQuery();
    await finishOnboarding(ctx, tgId);
    return;
  }

  await ctx.answerCallbackQuery();
}

// ─── Финал: сохраняем согласия и создаём профиль ──────────────────────────────

async function finishOnboarding(ctx: Context, tgId: string): Promise<void> {
  const user = await getUserByTgId(tgId);
  if (!user) return;

  const d = await getOnboardingDraft(tgId);
  if (!d.name || !d.birth_day || d.lat == null) {
    await ctx.reply('Кажется, не все данные собраны. Напиши /start, чтобы начать заново.');
    return;
  }

  // Сохраняем оба согласия.
  await saveConsent({ user_id: user.id, document_type: 'privacy_policy',   document_version: DOC_VERSION, tg_client: 'bot' });
  await saveConsent({ user_id: user.id, document_type: 'terms_of_service', document_version: DOC_VERSION, tg_client: 'bot' });

  // Создаём профиль себя, если ещё нет.
  const existing = await getSelfPerson(tgId);
  if (!existing) {
    await createPerson({
      owner_id:         user.id,
      is_self:          true,
      name:             d.name!,
      birth_day:        d.birth_day!,
      birth_month:      d.birth_month!,
      birth_year:       d.birth_year!,
      time_mode:        d.time_mode ?? 'unknown',
      birth_hour:       d.birth_hour ?? null,
      birth_minute:     d.birth_minute ?? null,
      approx_time:      d.approx_time ?? null,
      birth_city_ru:    d.city_ru ?? null,
      birth_city_en:    d.city_en ?? null,
      birth_city_reg:   d.city_reg ?? null,
      birth_lat:        d.lat ?? 0,
      birth_lon:        d.lon ?? 0,
      birth_utc_offset: d.utc_offset ?? 0,
      birth_timezone:   d.timezone ?? 'UTC',
    });
  }

  await clearOnboardingDraft(tgId);
  await setOnboardingStep(tgId, 'done');
  await sendDone(ctx);
}
