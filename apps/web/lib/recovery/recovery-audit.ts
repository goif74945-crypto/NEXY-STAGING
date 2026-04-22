import { z } from 'zod';

import { RecoveryModeSchema } from '../types/recovery-mode';

export const RecoveryAuditSchema = z
  .object({
    audit_id: z.string().trim().min(1).max(256),
    universe_id: z.string().trim().min(1).max(256),
    mode: RecoveryModeSchema,
    decision_ok: z.boolean(),
    notes: z.string().trim().min(1).max(4096),
  })
  .strict();

export type RecoveryAudit = z.infer<typeof RecoveryAuditSchema>;

export function parseRecoveryAudit(input: unknown): RecoveryAudit {
  return RecoveryAuditSchema.parse(input);
}

export function validateRecoveryAudit(input: unknown): boolean {
  return RecoveryAuditSchema.safeParse(input).success;
}

export function buildRecoveryAudit(input: RecoveryAudit): RecoveryAudit {
  const parsed = parseRecoveryAudit(input);

  return {
    audit_id: parsed.audit_id,
    universe_id: parsed.universe_id,
    mode: parsed.mode,
    decision_ok: parsed.decision_ok,
    notes: parsed.notes,
  };
}
