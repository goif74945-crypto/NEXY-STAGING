import { z } from 'zod';

export const AuditRecordSchema = z
  .object({
    audit_id: z.string().trim().min(1).max(256),
    scope: z.string().trim().min(1).max(256),
    event_type: z.string().trim().min(1).max(256),
    actor: z.string().trim().min(1).max(256),
    created_at_epoch_ms: z.number().int().nonnegative(),
    payload_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export type AuditRecord = z.infer<typeof AuditRecordSchema>;

export function parseAuditRecord(input: unknown): AuditRecord {
  return AuditRecordSchema.parse(input);
}

export function validateAuditRecord(input: unknown): boolean {
  return AuditRecordSchema.safeParse(input).success;
}

export function buildAuditRecord(input: AuditRecord): AuditRecord {
  const parsed = parseAuditRecord(input);

  return {
    audit_id: parsed.audit_id,
    scope: parsed.scope,
    event_type: parsed.event_type,
    actor: parsed.actor,
    created_at_epoch_ms: parsed.created_at_epoch_ms,
    payload_hash: parsed.payload_hash,
  };
}
