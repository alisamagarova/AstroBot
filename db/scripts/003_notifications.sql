-- Уведомления: настройки + отслеживание просмотров. Применить к работающей БД.
-- node scripts/migrate.mjs не используем (он накатывает 001) — выполнить этот файл напрямую:
--   psql "$DATABASE_URL" -f db/scripts/003_notifications.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_solar   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_aspects BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_viewed  BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS solar_views (
  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  solar_year SMALLINT    NOT NULL,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, solar_year)
);

CREATE TABLE IF NOT EXISTS aspect_views (
  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  view_year  SMALLINT    NOT NULL,
  view_month SMALLINT    NOT NULL CHECK (view_month BETWEEN 1 AND 12),
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, view_year, view_month)
);

CREATE TABLE IF NOT EXISTS notifications_sent (
  user_id  BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind     TEXT        NOT NULL CHECK (kind IN ('solar','aspects')),
  ref      TEXT        NOT NULL,
  sent_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, ref)
);

SELECT 'notifications schema applied' AS status;
