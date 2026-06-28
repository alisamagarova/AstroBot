-- Игровая валюта «Кристаллы» 🔮 — баланс пользователя.
-- Новый пользователь стартует с 10 кристаллов (DEFAULT применится и к существующим строкам).
-- Применить к работающей БД:
--   psql "$DATABASE_URL" -f db/scripts/007_balance.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS balance INTEGER NOT NULL DEFAULT 10;

SELECT 'balance column applied' AS status;
