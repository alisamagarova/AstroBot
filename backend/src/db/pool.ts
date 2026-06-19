import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

export const pool = new Pool({ connectionString: config.db.url });

pool.on('error', (err) => {
  console.error('[pg] Unexpected pool error:', err);
});
