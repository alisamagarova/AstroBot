// ─── Domain enums (must match DB CHECK constraints) ───────────────────────────

export type LangCode    = 'ru' | 'en';
export type TimeMode    = 'exact' | 'approx' | 'unknown';
export type ApproxTime  = 'morning' | 'day' | 'evening' | 'night';
export type OnboardingStep = 'name' | 'birth_date' | 'birth_time' | 'city' | 'consent' | 'done';
export type DocumentType = 'privacy_policy' | 'terms_of_service';

export type MilestoneTheme =
  | 'marriage' | 'divorce' | 'child' | 'career' | 'relocation'
  | 'health'   | 'surgery' | 'travel' | 'change' | 'key';

// ─── DB row shapes ─────────────────────────────────────────────────────────────
// pg возвращает BIGINT/BIGSERIAL как string — используем string для id / tg_id,
// чтобы не потерять точность (tg_id может превышать Number.MAX_SAFE_INTEGER).

export interface DbUser {
  id: string;
  tg_id: string;
  tg_username:          string | null;
  tg_first_name:        string | null;
  tg_last_name:         string | null;
  lang:                 LangCode;
  is_blocked:           boolean;
  onboarding_step:      OnboardingStep | null;
  onboarding_completed: boolean;
  created_at:           Date;
  updated_at:           Date;
}

export interface DbPerson {
  id: string;
  owner_id: string;
  is_self:  boolean;
  name:     string;
  name_en:  string | null;

  birth_day:    number;
  birth_month:  number;
  birth_year:   number;

  time_mode:    TimeMode;
  birth_hour:   number | null;
  birth_minute: number | null;
  approx_time:  ApproxTime | null;

  birth_city_ru:    string | null;
  birth_city_en:    string | null;
  birth_city_reg:   string | null;
  birth_lat:        number;
  birth_lon:        number;
  birth_utc_offset: number;
  birth_timezone:   string;

  res_city_ru:  string | null;
  res_city_en:  string | null;
  res_lat:      number | null;
  res_lon:      number | null;
  res_timezone: string | null;

  sun_sign:             string | null;
  birth_date_changed_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export interface DbConsent {
  id:               string;
  user_id:          string | null;   // null после удаления пользователя
  tg_id:            string;           // снимок: кто соглашался (сохраняется навсегда)
  document_type:    DocumentType;
  document_version: string;
  accepted_at:      Date;
  tg_client:        string | null;
  ip_address:       string | null;
}

// ─── Telegram WebApp auth ─────────────────────────────────────────────────────

export interface TgInitUser {
  id:             number;
  first_name:     string;
  last_name?:     string;
  username?:      string;
  language_code?: string;
}

// Прикрепляется к каждому аутентифицированному запросу
export interface AuthContext {
  caller: 'miniapp' | 'bot';
  tgUser: TgInitUser | null; // заполнен только для 'miniapp'
}

// Fastify augmentation — добавляем authCtx к Request
declare module 'fastify' {
  interface FastifyRequest {
    authCtx: AuthContext;
  }
}
