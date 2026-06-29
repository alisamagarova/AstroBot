// Тарифы пополнения виртуальных звёзд (✦) за Telegram Stars (XTR).
// vz    — сколько виртуальных звёзд приложения получает пользователь
// stars — цена в Telegram Stars (XTR), целое число

export interface StarTariff {
  id: string;
  vz: number;
  stars: number;
  hit?: boolean;
}

export const STAR_TARIFFS: StarTariff[] = [
  { id: 's5',   vz: 5,   stars: 1 },
  { id: 's10',  vz: 10,  stars: 100 },
  { id: 's20',  vz: 20,  stars: 189 },
  { id: 's30',  vz: 30,  stars: 249, hit: true },
  { id: 's50',  vz: 50,  stars: 439 },
  { id: 's100', vz: 100, stars: 759 },
];

export function findTariff(id: string): StarTariff | undefined {
  return STAR_TARIFFS.find((t) => t.id === id);
}

// Пейлоад инвойса: 'stars:<tariffId>' — по нему на successful_payment начисляем vz.
export const STAR_PAYLOAD_PREFIX = 'stars:';
