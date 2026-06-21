import { pool } from '../pool.js';
import type { DbConsent, DocumentType } from '../../types.js';

export interface SaveConsentInput {
  user_id:          string;
  tg_id:            string;
  document_type:    DocumentType;
  document_version: string;
  tg_client?:       string | null;
  ip_address?:      string | null;
}

/** Сохраняет согласие. Если пользователь уже принял эту версию — возвращает существующую запись. */
export async function saveConsent(input: SaveConsentInput): Promise<DbConsent> {
  const { rows } = await pool.query<DbConsent>(
    `INSERT INTO legal_consents (user_id, tg_id, document_type, document_version, tg_client, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT ON CONSTRAINT uq_consent_per_version DO UPDATE
       SET accepted_at = legal_consents.accepted_at  -- без изменений, возвращаем оригинал
     RETURNING *`,
    [
      input.user_id,
      input.tg_id,
      input.document_type,
      input.document_version,
      input.tg_client  ?? null,
      input.ip_address ?? null,
    ],
  );
  return rows[0];
}

/** Все согласия пользователя. */
export async function getConsentsByUser(userId: string): Promise<DbConsent[]> {
  const { rows } = await pool.query<DbConsent>(
    `SELECT * FROM legal_consents WHERE user_id = $1 ORDER BY accepted_at ASC`,
    [userId],
  );
  return rows;
}

/**
 * Проверяет, принял ли пользователь указанную версию документа.
 */
export async function hasConsent(
  userId: string,
  documentType: DocumentType,
  documentVersion: string,
): Promise<boolean> {
  const { rows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM legal_consents
       WHERE user_id = $1 AND document_type = $2 AND document_version = $3
     ) AS exists`,
    [userId, documentType, documentVersion],
  );
  return rows[0].exists;
}
