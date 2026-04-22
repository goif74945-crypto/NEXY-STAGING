import { z } from 'zod';

export const RecoveryModeSchema = z.enum([
  'exact_replay',
  'clean_reboot',
  'manual_inspect',
]);

export type RecoveryMode = z.infer<typeof RecoveryModeSchema>;

export function parseRecoveryMode(input: unknown): RecoveryMode {
  return RecoveryModeSchema.parse(input);
}

export function validateRecoveryMode(input: unknown): boolean {
  return RecoveryModeSchema.safeParse(input).success;
}
