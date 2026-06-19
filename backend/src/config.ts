import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const config = {
  port:    Number(process.env.PORT  ?? 3000),
  host:    process.env.HOST         ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV     ?? 'development',
  db: {
    url: required('DATABASE_URL'),
  },
  tg: {
    botToken: required('BOT_TOKEN'),
    botSecret: required('BOT_SECRET'),
  },
} as const;

export const isDev = config.nodeEnv === 'development';
