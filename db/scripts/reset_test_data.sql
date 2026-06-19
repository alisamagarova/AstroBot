-- Сброс тестовых данных (не трогает схему и типы)
-- Запускать: psql $DATABASE_URL -f db/scripts/reset_test_data.sql

BEGIN;

-- Порядок важен: сначала зависимые таблицы
TRUNCATE TABLE
  payments,
  horar_charts,
  milestone_reports,
  aspect_snapshots,
  synastry_reports,
  solar_charts,
  natal_charts,
  legal_consents,
  people,
  users
RESTART IDENTITY CASCADE;

COMMIT;

SELECT 'DB test data cleared' AS status;
