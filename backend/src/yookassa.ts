// Тонкий клиент ЮKassa (https://yookassa.ru/developers/api).
// Активен только при заданных YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY.
import { randomUUID } from 'node:crypto';
import { config } from './config.js';

const API = 'https://api.yookassa.ru/v3';

export function yooEnabled(): boolean {
  return !!(config.yookassa.shopId && config.yookassa.secretKey);
}

function authHeader(): string {
  const raw = `${config.yookassa.shopId}:${config.yookassa.secretKey}`;
  return 'Basic ' + Buffer.from(raw).toString('base64');
}

export interface YooPayment {
  id: string;
  status: string;               // 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  paid: boolean;
  amount: { value: string; currency: string };
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
}

/** Создаёт платёж с подтверждением через redirect. Возвращает платёж с confirmation_url. */
export async function createPayment(params: {
  amountRub: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
}): Promise<YooPayment> {
  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Idempotence-Key': randomUUID(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: { value: params.amountRub.toFixed(2), currency: 'RUB' },
      capture: true,
      confirmation: { type: 'redirect', return_url: params.returnUrl },
      description: params.description,
      metadata: params.metadata,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`YooKassa createPayment ${res.status}: ${text}`);
  }
  return (await res.json()) as YooPayment;
}

/** Запрашивает платёж по id — для проверки статуса на вебхуке (не доверяем телу вебхука). */
export async function getPayment(id: string): Promise<YooPayment> {
  const res = await fetch(`${API}/payments/${id}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`YooKassa getPayment ${res.status}: ${text}`);
  }
  return (await res.json()) as YooPayment;
}
