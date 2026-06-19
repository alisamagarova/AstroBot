// Геокодинг города через Open-Meteo (бесплатно, без ключа) — тот же сервис,
// что использует фронтенд. Возвращает координаты, IANA-таймзону и смещение UTC.

export interface GeoCity {
  city_ru:    string;
  city_en:    string;
  city_reg:   string;
  lat:        number;
  lon:        number;
  timezone:   string;
  utc_offset: number; // часы, на текущую дату
}

/** Смещение таймзоны от UTC в часах для конкретной даты (учитывает летнее время). */
function zoneOffsetHours(timeZone: string, when: Date): number {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const parts = dtf.formatToParts(when);
    const map: Record<string, number> = {};
    for (const p of parts) if (p.type !== 'literal') map[p.type] = Number(p.value);
    const asUTC = Date.UTC(map.year, map.month - 1, map.day, map.hour, map.minute, map.second);
    return Math.round((asUTC - when.getTime()) / 3600000 * 10) / 10;
  } catch {
    return 0;
  }
}

/** Ищет город по названию. Возвращает до `limit` совпадений (по убыванию населения). */
export async function searchCities(query: string, limit = 5): Promise<GeoCity[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(term)}&count=${limit}&language=ru&format=json`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: any[] };
  const results = data.results ?? [];
  const now = new Date();

  return results.map((r) => {
    const reg = [r.admin1, r.country].filter(Boolean)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
      .join(', ');
    const tz = r.timezone || 'UTC';
    return {
      city_ru:    r.name,
      city_en:    r.name,
      city_reg:   reg || (r.country ?? ''),
      lat:        r.latitude,
      lon:        r.longitude,
      timezone:   tz,
      utc_offset: zoneOffsetHours(tz, now),
    };
  });
}
