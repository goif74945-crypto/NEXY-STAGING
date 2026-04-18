type RequiredEnvKey =
  | 'NODE_ENV'
  | 'APP_BASE_URL'
  | 'DATABASE_URL'
  | 'SESSION_COOKIE_NAME'
  | 'SESSION_TTL_MINUTES'
  | 'OTAC_TTL_MINUTES';

export type AppEnv = {
  nodeEnv: 'development' | 'test' | 'production';
  appBaseUrl: string;
  databaseUrl: string;
  sessionCookieName: string;
  sessionTtlMinutes: number;
  otacTtlMinutes: number;
};

const REQUIRED_ENV_KEYS: RequiredEnvKey[] = [
  'NODE_ENV',
  'APP_BASE_URL',
  'DATABASE_URL',
  'SESSION_COOKIE_NAME',
  'SESSION_TTL_MINUTES',
  'OTAC_TTL_MINUTES',
];

function getRequiredEnv(key: RequiredEnvKey): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getPositiveInteger(key: 'SESSION_TTL_MINUTES' | 'OTAC_TTL_MINUTES'): number {
  const value = Number(getRequiredEnv(key));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${key} must be a positive integer.`);
  }

  return value;
}

function assertAllRequiredEnvPresent(): void {
  for (const key of REQUIRED_ENV_KEYS) {
    getRequiredEnv(key);
  }
}

assertAllRequiredEnvPresent();

export const appEnv: AppEnv = {
  nodeEnv: getRequiredEnv('NODE_ENV') as AppEnv['nodeEnv'],
  appBaseUrl: getRequiredEnv('APP_BASE_URL'),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  sessionCookieName: getRequiredEnv('SESSION_COOKIE_NAME'),
  sessionTtlMinutes: getPositiveInteger('SESSION_TTL_MINUTES'),
  otacTtlMinutes: getPositiveInteger('OTAC_TTL_MINUTES'),
};
