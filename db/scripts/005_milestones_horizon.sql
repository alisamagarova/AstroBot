-- Ступенчатый горизонт «Жизненных вех» + разовая рассылка при его сдвиге.
-- Применить к работающей БД напрямую:
--   psql "$DATABASE_URL" -f db/scripts/005_milestones_horizon.sql

-- 1. Разрешаем новый вид уведомления 'milestones' в журнале антидублей.
--    ref = год нового горизонта (напр. '2043').
ALTER TABLE notifications_sent DROP CONSTRAINT IF EXISTS notifications_sent_kind_check;
ALTER TABLE notifications_sent
  ADD CONSTRAINT notifications_sent_kind_check
  CHECK (kind IN ('solar', 'aspects', 'milestones'));

-- 2. Глобальные настройки приложения (key-value).
--    Здесь храним последний объявленный горизонт вех: 'milestones_horizon' = '2038'.
--    Если строки нет — планировщик при первом запуске возьмёт текущий горизонт
--    как базовый (без рассылки), чтобы не спамить существующих пользователей.
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

SELECT 'milestones horizon schema applied' AS status;
