-- Покупки виртуальных звёзд (✦) за рубли через ЮKassa.
-- payment_id (id платежа ЮKassa) уникален → идемпотентное начисление:
-- повторный вебхук payment.succeeded не начислит баланс дважды.
-- Применить к работающей БД:
--   psql "$DATABASE_URL" -f db/scripts/010_ruble_purchases.sql

CREATE TABLE IF NOT EXISTS ruble_purchases (
  id         BIGSERIAL    PRIMARY KEY,
  user_id    BIGINT       REFERENCES users(id) ON DELETE SET NULL,
  tg_id      BIGINT       NOT NULL,
  payment_id TEXT         NOT NULL UNIQUE,    -- id платежа ЮKassa
  tariff     TEXT         NOT NULL,
  vz         INTEGER      NOT NULL,           -- начислено ✦
  rub        INTEGER      NOT NULL,           -- уплачено рублей
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ruble_purchases_tg ON ruble_purchases (tg_id, created_at DESC);

SELECT 'ruble_purchases schema applied' AS status;
