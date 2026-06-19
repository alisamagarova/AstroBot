-- Полный сброс + заливка тестовых данных
-- Запускать: psql $DATABASE_URL -f db/scripts/reset_and_seed.sql

\i db/scripts/reset_test_data.sql
\i db/seeds/001_dev_seed.sql

SELECT 'DB reset + seed complete' AS status;
