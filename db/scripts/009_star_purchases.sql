-- Покупки виртуальных звёзд (✦) за Telegram Stars (XTR).
-- charge_id (telegram_payment_charge_id) уникален → идемпотентное начисление:
-- повторная доставка вебхука successful_payment не начислит баланс дважды.
-- Применить к работающей БД:
--   psql "$DATABASE_URL" -f db/scripts/009_star_purchases.sql

CREATE TABLE IF NOT EXISTS star_purchases (
  id         BIGSERIAL    PRIMARY KEY,
  user_id    BIGINT       REFERENCES users(id) ON DELETE SET NULL,
  tg_id      BIGINT       NOT NULL,
  charge_id  TEXT         NOT NULL UNIQUE,     -- telegram_payment_charge_id
  tariff     TEXT         NOT NULL,
  vz         INTEGER      NOT NULL,            -- начислено виртуальных звёзд
  stars      INTEGER      NOT NULL,            -- уплачено Telegram Stars (XTR)
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_star_purchases_tg ON star_purchases (tg_id, created_at DESC);

SELECT 'star_purchases schema applied' AS status;
