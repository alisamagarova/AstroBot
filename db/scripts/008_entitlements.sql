-- Покупки за игровую валюту «Звёзды» ✦ — что пользователь уже оплатил.
-- Применить к работающей БД:
--   psql "$DATABASE_URL" -f db/scripts/008_entitlements.sql
--
-- feature   — тип возможности (natal_self, aspects, solar, synastry, milestones, daily…)
-- item_key  — ключ конкретной единицы:
--               natal_self  → ''            (один на всю жизнь)
--               aspects     → 'YYYY-MM'      (учитываем месяц И год)
--               solar       → 'YYYY'
--               synastry    → id партнёра
--               milestones  → id темы
--               daily       → 'YYYY-MM-DD'
-- paid_limit — для milestones: год-лимит, до которого тема оплачена.

CREATE TABLE IF NOT EXISTS entitlements (
  id         BIGSERIAL    PRIMARY KEY,
  user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature    TEXT         NOT NULL,
  item_key   TEXT         NOT NULL DEFAULT '',
  paid_limit INTEGER,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature, item_key)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements (user_id);

SELECT 'entitlements schema applied' AS status;
