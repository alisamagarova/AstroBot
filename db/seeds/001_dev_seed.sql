-- ════════════════════════════════════════════════════════════════════════════
-- Dev seed — тестовые данные для разработки
-- ════════════════════════════════════════════════════════════════════════════

-- Тестовый пользователь (Алиса)
INSERT INTO users (tg_id, tg_username, tg_first_name, lang)
VALUES (123456789, 'alisa_cosmos', 'Алиса', 'ru')
ON CONFLICT (tg_id) DO NOTHING;

-- Профиль пользователя (данные из DEFAULT_BIRTH прототипа)
INSERT INTO people (
  owner_id, is_self, name, name_en,
  birth_day, birth_month, birth_year,
  time_mode, birth_hour, birth_minute,
  birth_city_ru, birth_city_en, birth_city_reg,
  birth_lat, birth_lon, birth_utc_offset, birth_timezone,
  sun_sign
)
SELECT
  u.id, true, 'Алиса', 'Alisa',
  3, 8, 2002,
  'exact', 7, 21,
  'Ангарск', 'Angarsk', 'Иркутская обл.',
  52.5440, 103.8880, 8, 'Asia/Irkutsk',
  'leo'
FROM users u WHERE u.tg_id = 123456789
ON CONFLICT ON CONSTRAINT uq_one_self_per_user DO NOTHING;

-- Тестовый партнёр (Марк — из DEFAULT_PARTNER прототипа)
INSERT INTO people (
  owner_id, is_self, name, name_en,
  birth_day, birth_month, birth_year,
  time_mode, birth_hour, birth_minute,
  birth_city_ru, birth_city_en, birth_city_reg,
  birth_lat, birth_lon, birth_utc_offset, birth_timezone,
  sun_sign
)
SELECT
  u.id, false, 'Марк', 'Mark',
  14, 2, 1999,
  'exact', 18, 40,
  'Москва', 'Moscow', 'Россия',
  55.7558, 37.6173, 3, 'Europe/Moscow',
  'aquarius'
FROM users u WHERE u.tg_id = 123456789;
