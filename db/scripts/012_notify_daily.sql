-- Новая настройка уведомлений: «уведомлять о новой карте дня».
-- Плюс расширяем CHECK на kind в журнале отправленных, чтобы разрешить 'daily'.
-- Применить к работающей БД:
--   psql "$DATABASE_URL" -f db/scripts/012_notify_daily.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_daily BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE notifications_sent DROP CONSTRAINT IF EXISTS notifications_sent_kind_check;
ALTER TABLE notifications_sent
  ADD CONSTRAINT notifications_sent_kind_check
  CHECK (kind IN ('solar', 'aspects', 'milestones', 'daily'));

SELECT 'notify_daily applied' AS status;
