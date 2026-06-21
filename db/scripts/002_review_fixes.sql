-- Применяет находки ревью к уже поднятой БД (Railway).
-- Запускать один раз: psql $DATABASE_URL -f db/scripts/002_review_fixes.sql

-- ── legal_consents: согласия должны переживать удаление пользователя ──────────
-- 1) добавляем снимок tg_id (кто соглашался)
ALTER TABLE legal_consents
  ADD COLUMN IF NOT EXISTS tg_id BIGINT;

-- заполняем tg_id для существующих записей из users
UPDATE legal_consents lc
  SET tg_id = u.tg_id
  FROM users u
  WHERE lc.user_id = u.id AND lc.tg_id IS NULL;

-- теперь делаем NOT NULL (после заполнения)
ALTER TABLE legal_consents
  ALTER COLUMN tg_id SET NOT NULL;

-- 2) user_id больше не обязателен и обнуляется при удалении пользователя
ALTER TABLE legal_consents
  ALTER COLUMN user_id DROP NOT NULL;

-- пересоздаём внешний ключ с ON DELETE SET NULL вместо CASCADE
DO $$
DECLARE fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'legal_consents'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass;
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE legal_consents DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

ALTER TABLE legal_consents
  ADD CONSTRAINT legal_consents_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ── people.birth_year: снять устаревший потолок 2025 ─────────────────────────
ALTER TABLE people
  DROP CONSTRAINT IF EXISTS people_birth_year_check;
ALTER TABLE people
  ADD CONSTRAINT people_birth_year_check CHECK (birth_year BETWEEN 1900 AND 2100);

SELECT 'review fixes applied' AS status;
