-- Реферальная программа: кто кого привёл + была ли выдана награда пригласившему.
-- referred_by       — tg_id пользователя, который пригласил (ставится один раз).
-- referral_rewarded — награда пригласившему уже выдана (при первой покупке друга).
-- Применить к работающей БД:
--   psql "$DATABASE_URL" -f db/scripts/011_referrals.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_rewarded BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users (referred_by);

SELECT 'referrals schema applied' AS status;
