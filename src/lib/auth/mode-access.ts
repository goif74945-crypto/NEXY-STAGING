import { z } from 'zod';

import { SessionRoleSchema } from '@/lib/auth/session';

export const ModeSchema = z.enum(['VIEW', 'RUN', 'FORGE']);

export const ModeAccessDecisionSchema = z
  .object({
    mode: ModeSchema,
    role: SessionRoleSchema,
    allowed: z.boolean(),
    reason: z.string().trim().min(1).max(256),
  })
  .strict();

export type Mode = z.infer<typeof ModeSchema>;
export type ModeAccessDecision = z.infer<typeof ModeAccessDecisionSchema>;

function isAllowed(mode: Mode, role: z.infer<typeof SessionRoleSchema>): boolean {
  if (role === 'OWNER') {
    return true;
  }

  if (role === 'OPERATOR') {
    return mode === 'VIEW' || mode === 'RUN';
  }

  return mode === 'VIEW';
}

export function evaluateModeAccess(input: {
  mode: Mode;
  role: z.infer<typeof SessionRoleSchema>;
}): ModeAccessDecision {
  const parsed = z
    .object({
      mode: ModeSchema,
      role: SessionRoleSchema,
    })
    .strict()
    .parse(input);

  const allowed = isAllowed(parsed.mode, parsed.role);

  return ModeAccessDecisionSchema.parse({
    mode: parsed.mode,
    role: parsed.role,
    allowed,
    reason: allowed ? 'allowed' : 'insufficient_role',
  });
}
