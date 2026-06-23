-- ════════════════════════════════════════════════════════════════════════════
-- AstroBot · Initial Schema
-- Migration: 001_initial_schema.sql
-- ════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────

CREATE TYPE lang_code       AS ENUM ('ru', 'en');
CREATE TYPE time_mode       AS ENUM ('exact', 'approx', 'unknown');
CREATE TYPE approx_time     AS ENUM ('morning', 'day', 'evening', 'night');
CREATE TYPE milestone_theme AS ENUM (
  'marriage', 'divorce', 'child', 'career', 'relocation',
  'health', 'surgery', 'travel', 'change', 'key'
);
CREATE TYPE payment_status  AS ENUM ('pending', 'succeeded', 'cancelled', 'refunded');
CREATE TYPE payment_product AS ENUM (
  'natal_full', 'synastry', 'solar', 'milestones', 'horar', 'subscription'
);

-- ─────────────────────────────────────
-- USERS
-- ─────────────────────────────────────

CREATE TABLE users (
  id                    BIGSERIAL    PRIMARY KEY,
  tg_id                 BIGINT       NOT NULL UNIQUE,
  tg_username           TEXT,
  tg_first_name         TEXT,
  tg_last_name          TEXT,
  lang                  lang_code    NOT NULL DEFAULT 'ru',
  is_blocked            BOOLEAN      NOT NULL DEFAULT false,
  -- Онбординг: шаг, на котором сейчас находится пользователь.
  -- NULL = ещё не начал, 'done' = завершил.
  onboarding_step       TEXT         CHECK (onboarding_step IN
                          ('name','birth_date','birth_time','city','consent','done')),
  onboarding_completed  BOOLEAN      NOT NULL DEFAULT false,
  -- Черновик ответов онбординга (имя, дата, время, город) до создания профиля.
  -- Хранится в БД, чтобы диалог переживал перезапуск/остановку бота.
  onboarding_draft      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  -- Настройки уведомлений (бот шлёт сообщения)
  notify_solar          BOOLEAN      NOT NULL DEFAULT false,  -- приближается новый солярный год
  notify_aspects        BOOLEAN      NOT NULL DEFAULT false,  -- наступил новый месяц аспектов
  notify_viewed         BOOLEAN      NOT NULL DEFAULT false,  -- слать даже о том, что уже просмотрено
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- PEOPLE (birth profiles)
-- Пользователь может иметь несколько профилей:
-- себя (is_self = true) и партнёров для синастрии
-- ─────────────────────────────────────

CREATE TABLE people (
  id              BIGSERIAL    PRIMARY KEY,
  owner_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_self         BOOLEAN      NOT NULL DEFAULT false,

  -- Имя
  name            TEXT         NOT NULL,
  name_en         TEXT,

  -- Дата рождения
  birth_day       SMALLINT     NOT NULL CHECK (birth_day   BETWEEN 1  AND 31),
  birth_month     SMALLINT     NOT NULL CHECK (birth_month BETWEEN 1  AND 12),
  birth_year      SMALLINT     NOT NULL CHECK (birth_year  BETWEEN 1900 AND 2100),

  -- Время рождения
  time_mode       time_mode    NOT NULL DEFAULT 'unknown',
  birth_hour      SMALLINT     CHECK (birth_hour   BETWEEN 0 AND 23),
  birth_minute    SMALLINT     CHECK (birth_minute BETWEEN 0 AND 59),
  approx_time     approx_time,                            -- только при time_mode='approx'

  -- Место рождения
  birth_city_ru   TEXT,
  birth_city_en   TEXT,
  birth_city_reg  TEXT,                                   -- регион / страна
  birth_lat       DOUBLE PRECISION  NOT NULL CHECK (birth_lat  BETWEEN -90  AND 90),
  birth_lon       DOUBLE PRECISION  NOT NULL CHECK (birth_lon  BETWEEN -180 AND 180),
  birth_utc_offset REAL             NOT NULL CHECK (birth_utc_offset BETWEEN -12 AND 14),
  birth_timezone  TEXT             NOT NULL,              -- IANA: 'Europe/Moscow'

  -- Место проживания сейчас (для соляра; null = то же, что рождение)
  res_city_ru     TEXT,
  res_city_en     TEXT,
  res_lat         DOUBLE PRECISION  CHECK (res_lat  BETWEEN -90  AND 90),
  res_lon         DOUBLE PRECISION  CHECK (res_lon  BETWEEN -180 AND 180),
  res_timezone    TEXT,

  -- Кэшированный знак Солнца (вычисляется при сохранении)
  sun_sign             TEXT,                              -- 'leo', 'aries', …

  -- Защита от повторной смены даты рождения (is_self=true профиль):
  -- NULL  = дата никогда не менялась (смена разрешена)
  -- NOT NULL = дата уже была изменена однажды (смена заблокирована навсегда)
  birth_date_changed_at TIMESTAMPTZ,

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- Если time_mode = 'exact' — час и минута обязательны
  CONSTRAINT chk_exact_time CHECK (
    time_mode <> 'exact' OR (birth_hour IS NOT NULL AND birth_minute IS NOT NULL)
  ),
  -- Если time_mode = 'approx' — approx_time обязателен
  CONSTRAINT chk_approx_time CHECK (
    time_mode <> 'approx' OR approx_time IS NOT NULL
  )
);

-- Partial unique index: у пользователя ровно один профиль is_self=true,
-- но партнёров (is_self=false) может быть сколько угодно.
CREATE UNIQUE INDEX uq_one_self_per_user ON people (owner_id) WHERE is_self = true;

-- ─────────────────────────────────────
-- LEGAL CONSENTS (юридические согласия)
-- Хранятся навсегда: при удалении пользователя user_id обнуляется (SET NULL),
-- но сама запись согласия остаётся — для юридического аудита.
-- tg_id — денормализованный снимок: кто именно соглашался (переживает удаление).
-- ─────────────────────────────────────

CREATE TABLE legal_consents (
  id               BIGSERIAL    PRIMARY KEY,
  user_id          BIGINT       REFERENCES users(id) ON DELETE SET NULL,
  tg_id            BIGINT       NOT NULL,     -- снимок Telegram ID на момент согласия

  -- Тип документа: политика конфиденциальности или пользовательское соглашение
  document_type    TEXT         NOT NULL
    CHECK (document_type IN ('privacy_policy', 'terms_of_service')),
  document_version TEXT         NOT NULL,     -- '1.0', '2025-06', …

  accepted_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- Контекст принятия (аудит)
  tg_client        TEXT,                      -- из initData Telegram, если доступно
  ip_address       INET,                      -- IP запроса (Mini App — реальный IP пользователя)

  -- Один пользователь не может принять одну версию дважды
  CONSTRAINT uq_consent_per_version UNIQUE (user_id, document_type, document_version)
);

CREATE INDEX idx_consents_user ON legal_consents (user_id);

-- ─────────────────────────────────────
-- NATAL CHARTS (кэш расчётов)
-- Удаляется при изменении birth-данных (CASCADE через триггер обновления)
-- ─────────────────────────────────────

CREATE TABLE natal_charts (
  id              BIGSERIAL    PRIMARY KEY,
  person_id       BIGINT       NOT NULL REFERENCES people(id) ON DELETE CASCADE,

  -- Позиции планет: { sun:{lon,sign_idx,house,retrograde}, moon:{…}, … }
  planets         JSONB        NOT NULL,
  -- Куспиды домов: { 1:lon, 2:lon, …, 12:lon } — null, если время неизвестно
  houses          JSONB,
  -- Аспекты: [{p1,p2,type,angle,orb,applying}]
  aspects         JSONB        NOT NULL,

  asc_lon         DOUBLE PRECISION,
  mc_lon          DOUBLE PRECISION,

  computed_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_natal_per_person UNIQUE (person_id)
);

-- ─────────────────────────────────────
-- SOLAR CHARTS (соляр)
-- Для каждого года и места наблюдения
-- ─────────────────────────────────────

CREATE TABLE solar_charts (
  id              BIGSERIAL    PRIMARY KEY,
  person_id       BIGINT       NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  solar_year      SMALLINT     NOT NULL,                  -- год соляра

  -- Место наблюдения (откуда считать)
  obs_lat         DOUBLE PRECISION  NOT NULL,
  obs_lon         DOUBLE PRECISION  NOT NULL,
  obs_city_ru     TEXT,
  obs_city_en     TEXT,
  obs_timezone    TEXT         NOT NULL,

  -- Точный момент соляра (UTC)
  solar_moment    TIMESTAMPTZ  NOT NULL,

  -- Данные карты соляра
  planets         JSONB        NOT NULL,
  houses          JSONB,
  aspects         JSONB        NOT NULL,
  asc_lon         DOUBLE PRECISION,
  mc_lon          DOUBLE PRECISION,

  -- Аспекты «соляр → натал» (смешанные)
  mixed_aspects   JSONB,

  computed_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_solar_per_person_year_loc UNIQUE (person_id, solar_year, obs_lat, obs_lon)
);

-- ─────────────────────────────────────
-- SYNASTRY REPORTS
-- ─────────────────────────────────────

CREATE TABLE synastry_reports (
  id              BIGSERIAL    PRIMARY KEY,
  owner_id        BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_a_id     BIGINT       NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  person_b_id     BIGINT       NOT NULL REFERENCES people(id) ON DELETE CASCADE,

  -- Кросс-аспекты: [{pa,pb,type,angle,orb,domain,tone}]
  cross_aspects   JSONB        NOT NULL,

  -- Итоговые баллы: {total, attraction, emotion, communication, stability}
  scores          JSONB        NOT NULL,

  -- Краткий вывод: {theme, positive_count, tension_count}
  summary         JSONB,

  computed_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_synastry_pair UNIQUE (person_a_id, person_b_id),
  CONSTRAINT chk_synastry_different CHECK (person_a_id <> person_b_id)
);

-- ─────────────────────────────────────
-- ASPECT SNAPSHOTS (аспекты на месяц)
-- ─────────────────────────────────────

CREATE TABLE aspect_snapshots (
  id              BIGSERIAL    PRIMARY KEY,
  person_id       BIGINT       NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  month           DATE         NOT NULL,                  -- первый день месяца: 2025-07-01

  -- [{planet,transit_planet,type,date_start,date_exact,date_end,interpretation_key}]
  aspects         JSONB        NOT NULL,

  computed_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_aspect_snapshot UNIQUE (person_id, month),
  CONSTRAINT chk_month_is_first_day CHECK (EXTRACT(DAY FROM month) = 1)
);

-- ─────────────────────────────────────
-- MILESTONE REPORTS (жизненные вехи)
-- ─────────────────────────────────────

CREATE TABLE milestone_reports (
  id              BIGSERIAL    PRIMARY KEY,
  person_id       BIGINT       NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  theme           milestone_theme NOT NULL,
  report_year     SMALLINT     NOT NULL,                  -- год, для которого строился отчёт

  -- [{start,end,score,polarity,bucket,aspects:[{transiter,target,type,sym}],tone:{label,color}}]
  windows         JSONB        NOT NULL,

  computed_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT uq_milestone_per_theme_year UNIQUE (person_id, theme, report_year)
);

-- ─────────────────────────────────────
-- HORAR CHARTS (хорар) — позже
-- ─────────────────────────────────────

CREATE TABLE horar_charts (
  id              BIGSERIAL    PRIMARY KEY,
  user_id         BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  question        TEXT         NOT NULL,
  question_at     TIMESTAMPTZ  NOT NULL,

  -- Место вопроса
  lat             DOUBLE PRECISION  NOT NULL,
  lon             DOUBLE PRECISION  NOT NULL,
  timezone        TEXT         NOT NULL,
  city_name       TEXT,

  -- Карта
  planets         JSONB,
  houses          JSONB,
  aspects         JSONB,

  -- Ответ ИИ
  ai_response     JSONB,
  interpretation  TEXT,

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- PAYMENTS — позже
-- ─────────────────────────────────────

CREATE TABLE payments (
  id              BIGSERIAL       PRIMARY KEY,
  user_id         BIGINT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  provider        TEXT            NOT NULL DEFAULT 'yookassa',  -- 'yookassa' | 'telegram_stars'
  provider_id     TEXT            UNIQUE,                       -- ID платежа у провайдера
  product         payment_product NOT NULL,
  status          payment_status  NOT NULL DEFAULT 'pending',

  -- Сумма: рублей * 100 (копейки) ИЛИ количество звёзд
  amount_minor    INT             NOT NULL CHECK (amount_minor > 0),
  currency        TEXT            NOT NULL DEFAULT 'RUB',       -- 'RUB' | 'XTR' (Telegram Stars)

  -- Привязка к конкретному объекту (напр. person_id для natal_full)
  subject_id      BIGINT,

  metadata        JSONB,

  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- ОТСЛЕЖИВАНИЕ ПРОСМОТРОВ (для уведомлений)
-- ─────────────────────────────────────

-- Какие солярные годы пользователь уже открывал.
CREATE TABLE solar_views (
  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  solar_year SMALLINT    NOT NULL,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, solar_year)
);

-- Какие месяцы аспектов пользователь уже смотрел.
CREATE TABLE aspect_views (
  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  view_year  SMALLINT    NOT NULL,
  view_month SMALLINT    NOT NULL CHECK (view_month BETWEEN 1 AND 12),
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, view_year, view_month)
);

-- Журнал отправленных уведомлений — чтобы не дублировать.
-- kind='solar' → ref = год соляра; kind='aspects' → ref = 'YYYY-MM'.
CREATE TABLE notifications_sent (
  user_id  BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind     TEXT        NOT NULL CHECK (kind IN ('solar','aspects')),
  ref      TEXT        NOT NULL,
  sent_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, ref)
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════

-- users
CREATE INDEX idx_users_tg_id          ON users (tg_id);

-- people
CREATE INDEX idx_people_owner         ON people (owner_id);
CREATE INDEX idx_people_owner_self    ON people (owner_id) WHERE is_self = true;

-- natal_charts
CREATE INDEX idx_natal_person         ON natal_charts (person_id);

-- solar_charts
CREATE INDEX idx_solar_person_year    ON solar_charts (person_id, solar_year);

-- synastry
CREATE INDEX idx_synastry_owner       ON synastry_reports (owner_id);
CREATE INDEX idx_synastry_a           ON synastry_reports (person_a_id);
CREATE INDEX idx_synastry_b           ON synastry_reports (person_b_id);

-- aspect_snapshots
CREATE INDEX idx_aspects_person_month ON aspect_snapshots (person_id, month);

-- milestone_reports
CREATE INDEX idx_milestones_person    ON milestone_reports (person_id);

-- horar
CREATE INDEX idx_horar_user           ON horar_charts (user_id);

-- payments
CREATE INDEX idx_payments_user        ON payments (user_id);
CREATE INDEX idx_payments_status      ON payments (status) WHERE status = 'pending';

-- ════════════════════════════════════════════════════════════════════════════
-- updated_at TRIGGER (автоматически обновляет поле updated_at)
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
-- INVALIDATE CHART CACHE при изменении birth-данных
-- При UPDATE people — удаляем кэши, которые зависят от изменившихся полей
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION invalidate_chart_cache()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Сравниваем только поля, влияющие на расчёт
  -- При изменении birth-данных — сбрасываем все кэши расчётов
  IF (
    OLD.birth_day        IS DISTINCT FROM NEW.birth_day        OR
    OLD.birth_month      IS DISTINCT FROM NEW.birth_month      OR
    OLD.birth_year       IS DISTINCT FROM NEW.birth_year       OR
    OLD.time_mode        IS DISTINCT FROM NEW.time_mode        OR
    OLD.birth_hour       IS DISTINCT FROM NEW.birth_hour       OR
    OLD.birth_minute     IS DISTINCT FROM NEW.birth_minute     OR
    OLD.approx_time      IS DISTINCT FROM NEW.approx_time      OR
    OLD.birth_lat        IS DISTINCT FROM NEW.birth_lat        OR
    OLD.birth_lon        IS DISTINCT FROM NEW.birth_lon        OR
    OLD.birth_utc_offset IS DISTINCT FROM NEW.birth_utc_offset
  ) THEN
    DELETE FROM natal_charts     WHERE person_id = NEW.id;
    DELETE FROM synastry_reports WHERE person_a_id = NEW.id OR person_b_id = NEW.id;
    DELETE FROM aspect_snapshots WHERE person_id = NEW.id;
    DELETE FROM milestone_reports WHERE person_id = NEW.id;
  END IF;

  -- При изменении места проживания — сбрасываем только кэш соляра
  IF (
    OLD.res_lat IS DISTINCT FROM NEW.res_lat OR
    OLD.res_lon IS DISTINCT FROM NEW.res_lon
  ) THEN
    DELETE FROM solar_charts WHERE person_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invalidate_cache_on_birth_change
  AFTER UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION invalidate_chart_cache();
