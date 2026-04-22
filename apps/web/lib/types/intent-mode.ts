import { z } from 'zod';

export const IntentModeSchema = z.enum(['owner', 'operator', 'viewer', 'unknown']);
export type IntentMode = z.infer<typeof IntentModeSchema>;

export function parseIntentMode(input: unknown): IntentMode {
  return IntentModeSchema.parse(input);
}

export function validateIntentMode(input: unknown): boolean {
  return IntentModeSchema.safeParse(input).success;
}
