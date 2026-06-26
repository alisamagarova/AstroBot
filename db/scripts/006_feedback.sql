-- Обратная связь / баг-репорты из мини-аппа.
-- Применить к работающей БД:
--   psql "$DATABASE_URL" -f db/scripts/006_feedback.sql

CREATE TABLE IF NOT EXISTS feedback (
  id             BIGSERIAL    PRIMARY KEY,
  user_id        BIGINT       REFERENCES users(id) ON DELETE SET NULL,
  tg_id          BIGINT       NOT NULL,                       -- кто прислал (снимок)
  kind           TEXT         NOT NULL CHECK (kind IN ('idea', 'bug')),
  message        TEXT         NOT NULL,
  has_screenshot BOOLEAN      NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at DESC);

SELECT 'feedback schema applied' AS status;
