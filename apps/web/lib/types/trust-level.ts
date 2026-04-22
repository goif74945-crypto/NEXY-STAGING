import { z } from 'zod';

export const TrustLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export type TrustLevel = z.infer<typeof TrustLevelSchema>;

export function parseTrustLevel(input: unknown): TrustLevel {
  return TrustLevelSchema.parse(input);
}

export function validateTrustLevel(input: unknown): boolean {
  return TrustLevelSchema.safeParse(input).success;
}
