import { pool } from '../pool.js';

export interface FeedbackInput {
  tgId: string;
  kind: 'idea' | 'bug';
  message: string;
  hasScreenshot: boolean;
}

/** Сохраняет обратную связь; возвращает её id. */
export async function insertFeedback(o: FeedbackInput): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO feedback (user_id, tg_id, kind, message, has_screenshot)
     VALUES ((SELECT id FROM users WHERE tg_id = $1), $1, $2, $3, $4)
     RETURNING id`,
    [o.tgId, o.kind, o.message, o.hasScreenshot],
  );
  return rows[0].id;
}
