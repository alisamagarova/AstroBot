import type { FastifyPluginAsync } from 'fastify';
import { pool } from '../db/pool.js';
import { isDev } from '../config.js';

const TABLES = [
  'payments', 'horar_charts', 'milestone_reports', 'aspect_snapshots',
  'synastry_reports', 'solar_charts', 'natal_charts',
  'legal_consents', 'people', 'users',
];

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Only registered in development — not exposed in production at all
  if (!isDev) return;

  fastify.post('/admin/reset-db', { config: { skipAuth: true } }, async (_req, reply) => {
    await pool.query(
      `TRUNCATE TABLE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`
    );
    return reply.send({ ok: true, message: 'All test data cleared' });
  });

  fastify.post('/admin/reset-and-seed', { config: { skipAuth: true } }, async (_req, reply) => {
    await pool.query(
      `TRUNCATE TABLE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`
    );
    // Minimal seed: one test user
    await pool.query(`
      INSERT INTO users (tg_id, tg_first_name, tg_username, lang, onboarding_completed)
      VALUES (123456789, 'Dev', 'dev_user', 'ru', true)
      ON CONFLICT (tg_id) DO NOTHING
    `);
    return reply.send({ ok: true, message: 'Reset + seed done' });
  });
};

export default adminRoutes;
