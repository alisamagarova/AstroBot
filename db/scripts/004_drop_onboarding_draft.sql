-- Удаление мёртвой колонки users.onboarding_draft (наследие онбординга-диалога в боте).
-- Онбординг давно перенесён в формы Mini App; колонка не читалась и не писалась.
ALTER TABLE users DROP COLUMN IF EXISTS onboarding_draft;
