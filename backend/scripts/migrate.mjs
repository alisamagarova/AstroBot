// Применяет схему БД целиком и надёжно (без ручной вставки в консоль).
// Запуск:
//   DATABASE_URL="postgresql://...public..." node scripts/migrate.mjs
// или передать строку аргументом:
//   node scripts/migrate.mjs "postgresql://...public..."

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, '..', '..', 'db', 'migrations', '001_initial_schema.sql');

const url = process.argv[2] || process.env.DATABASE_URL;
if (!url) {
  console.error('Нужен DATABASE_URL (env или первым аргументом).');
  process.exit(1);
}

const sql = readFileSync(sqlPath, 'utf8');

const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  if (process.env.RESET === '1') {
    console.log('RESET=1 — очищаю схему public…');
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  }
  console.log('Подключение установлено. Применяю схему…');
  await client.query(sql);          // pg выполняет multi-statement SQL целиком
  console.log('✅ Схема применена успешно.');
  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`,
  );
  console.log('Таблицы:', rows.map(r => r.tablename).join(', '));
} catch (e) {
  console.error('❌ Ошибка:', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
