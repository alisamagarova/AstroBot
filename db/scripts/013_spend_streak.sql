-- Приз за ежедневную трату кристаллов: если пользователь тратит кристаллы
-- 7 дней подряд (на что угодно), начисляем ему +5 ✦ и обнуляем счётчик серии.
-- spend_streak_days       — сколько дней подряд уже потрачено (0..6, копится).
-- spend_streak_last_date  — дата (UTC) последнего дня, засчитанного в серию.
-- Применить к работающей БД:
--   psql "$DATABASE_URL" -f db/scripts/013_spend_streak.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS spend_streak_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spend_streak_last_date DATE;

SELECT 'spend_streak schema applied' AS status;
