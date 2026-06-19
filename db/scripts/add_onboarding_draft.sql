-- Добавляет колонку черновика онбординга к уже существующей БД.
-- Запускать один раз на Railway: psql $DATABASE_URL -f db/scripts/add_onboarding_draft.sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_draft JSONB NOT NULL DEFAULT '{}'::jsonb;

SELECT 'onboarding_draft column added' AS status;
