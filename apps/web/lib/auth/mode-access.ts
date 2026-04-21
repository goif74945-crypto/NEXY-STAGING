import { z } from 'zod';

export const AccessModeSchema = z.enum(['owner', 'operator', 'viewer']);
export type AccessMode = z.infer<typeof AccessModeSchema>;

export const ModeAccessInputSchema = z
  .object({
    required_mode: AccessModeSchema,
    session_role: AccessModeSchema,
  })
  .strict();
export type ModeAccessInput = z.infer<typeof ModeAccessInputSchema>;

export const ModeAccessReasonSchema = z.enum(['ok', 'insufficient_role']);

export const ModeAccessResultSchema = z
  .object({
    allowed: z.boolean(),
    reason: ModeAccessReasonSchema,
  })
  .strict();
export type ModeAccessResult = z.infer<typeof ModeAccessResultSchema>;

function getModeRank(mode: AccessMode): number {
  switch (mode) {
    case 'viewer':
      return 1;
    case 'operator':
      return 2;
    case 'owner':
      return 3;
  }
}

export function evaluateModeAccess(input: unknown): ModeAccessResult {
  const parsed = ModeAccessInputSchema.parse(input);
  const allowed = getModeRank(parsed.session_role) >= getModeRank(parsed.required_mode);

  return ModeAccessResultSchema.parse({
    allowed,
    reason: allowed ? 'ok' : 'insufficient_role',
  });
}

export function hasModeAccess(input: unknown): boolean {
  return evaluateModeAccess(input).allowed;
}