import { z } from 'zod';

export const AuditRecordSchema = z
  .object({
    audit_id: z.string().trim().min(1),
    actor_id: z.string().trim().min(1),
    action: z.string().trim().min(1),
    target_id: z.string().trim().min(1),
    created_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export type AuditRecord = z.infer<typeof AuditRecordSchema>;

function buildAuditRecords(): AuditRecord[] {
  return [
    AuditRecordSchema.parse({
      audit_id: 'audit_001',
      actor_id: 'user_owner_001',
      action: 'session_checked',
      target_id: 'session_owner_001',
      created_at_epoch_ms: 1700000000000,
    }),
    AuditRecordSchema.parse({
      audit_id: 'audit_002',
      actor_id: 'user_operator_001',
      action: 'run_created',
      target_id: 'run_001',
      created_at_epoch_ms: 1700000010000,
    }),
  ];
}

function cloneAuditRecord(record: AuditRecord): AuditRecord {
  return AuditRecordSchema.parse({
    audit_id: record.audit_id,
    actor_id: record.actor_id,
    action: record.action,
    target_id: record.target_id,
    created_at_epoch_ms: record.created_at_epoch_ms,
  });
}

export function listAuditRecords(): AuditRecord[] {
  return buildAuditRecords().map(cloneAuditRecord);
}

export function getAuditRecordById(auditId: string): AuditRecord | null {
  const auditRecord = buildAuditRecords().find(
    (record) => record.audit_id === auditId,
  );

  return auditRecord === undefined ? null : cloneAuditRecord(auditRecord);
}
