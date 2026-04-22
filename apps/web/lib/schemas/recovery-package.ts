import { z } from 'zod';

export const RecoveryPackageSchema = z
  .object({
    package_id: z.string().trim().min(1).max(256),
    universe_id: z.string().trim().min(1).max(256),
    created_at_epoch_ms: z.number().int().nonnegative(),
    summary: z.string().trim().min(1).max(4096),
  })
  .strict();

export type RecoveryPackage = z.infer<typeof RecoveryPackageSchema>;

export function parseRecoveryPackage(input: unknown): RecoveryPackage {
  return RecoveryPackageSchema.parse(input);
}

export function validateRecoveryPackage(input: unknown): boolean {
  return RecoveryPackageSchema.safeParse(input).success;
}
