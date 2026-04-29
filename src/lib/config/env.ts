import { z } from 'zod';

export const EnvSchema = z
  .object({
    DATABASE_URL: z.string().trim().min(1),
    NEXY_ENV: z.enum(['development', 'test', 'production']),
    NEXY_AUTH_SECRET: z.string().trim().min(1),
  })
  .strict();

export type Env = z.infer<typeof EnvSchema>;

export function parseEnv(input: unknown): Env {
  return EnvSchema.parse(input);
}

export function buildEnv(input: unknown): Env {
  return parseEnv(input);
}
