// Центральный доступ к переменным окружения с жёсткой проверкой.

const required = [
  'DATABASE_URL',
  'YOOKASSA_SHOP_ID',
  'YOOKASSA_SECRET_KEY',
  'NEXTAUTH_SECRET',
];

interface AppEnv {
  DATABASE_URL: string;
  YOOKASSA_SHOP_ID: string;
  YOOKASSA_SECRET_KEY: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXTAUTH_SECRET: string;
  NODE_ENV: string;
}

function getVar(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const appEnv: AppEnv = {
  DATABASE_URL: getVar('DATABASE_URL'),
  YOOKASSA_SHOP_ID: getVar('YOOKASSA_SHOP_ID'),
  YOOKASSA_SECRET_KEY: getVar('YOOKASSA_SECRET_KEY'),
  NEXTAUTH_SECRET: getVar('NEXTAUTH_SECRET'),
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
