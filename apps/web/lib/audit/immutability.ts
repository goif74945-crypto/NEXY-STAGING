import { z } from 'zod';

export const AuditImmutabilityInputSchema = z
  .object({
    immutable_audit: z.boolean(),
    chain_valid: z.boolean(),
    write_locked: z.boolean(),
  })
  .strict();

export const AuditImmutabilityResultSchema = z
  .object({
    ok: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type AuditImmutabilityInput = z.infer<typeof AuditImmutabilityInputSchema>;
export type AuditImmutabilityResult = z.infer<typeof AuditImmutabilityResultSchema>;

export function parseAuditImmutabilityInput(
  input: unknown,
): AuditImmutabilityInput {
  return AuditImmutabilityInputSchema.parse(input);
}

export function evaluateAuditImmutability(
  input: AuditImmutabilityInput,
): AuditImmutabilityResult {
  const parsed = parseAuditImmutabilityInput(input);
  const ok = parsed.immutable_audit && parsed.chain_valid && parsed.write_locked;

  if (ok) {
    return {
      ok: true,
      reason: 'ok',
    };
  }

  const reasons: string[] = [];

  if (!parsed.immutable_audit) {
    reasons.push('immutable_audit_false');
  }

  if (!parsed.chain_valid) {
    reasons.push('chain_invalid');
  }

  if (!parsed.write_locked) {
    reasons.push('write_locked_false');
  }

  return {
    ok: false,
    reason: reasons.join('|'),
  };
}
