import { z } from 'zod';

import {
  FreezeAuthoritySchema,
  FreezeReasonCodeSchema,
} from '@/lib/run/freeze-policy';
import { RunStatusSchema } from '@/lib/run/state-machine';

export const AuditActionSchema = z.enum([
  'session_checked',
  'run_created',
  'run_freeze',
  'run_unfreeze',
  'run_kill',
]);

export const AuditRecordSchema = z
  .object({
    audit_id: z.string().trim().min(1),
    actor_id: z.string().trim().min(1),
    action: AuditActionSchema,
    target_id: z.string().trim().min(1),
    created_at_epoch_ms: z.number().int().nonnegative(),
    reason_code: FreezeReasonCodeSchema,
    authority_source: FreezeAuthoritySchema,
    previous_status: RunStatusSchema,
    next_status: RunStatusSchema,
  })
  .strict();

export const AuditRecordInputSchema = AuditRecordSchema.omit({
  audit_id: true,
}).strict();

export const StateControlAuditRecordInputSchema = AuditRecordInputSchema.extend({
  action: z.enum(['run_freeze', 'run_unfreeze', 'run_kill']),
}).strict();

export type AuditAction = z.infer<typeof AuditActionSchema>;
export type AuditRecord = z.infer<typeof AuditRecordSchema>;
export type AuditRecordInput = z.infer<typeof AuditRecordInputSchema>;
export type StateControlAuditRecordInput = z.infer<
  typeof StateControlAuditRecordInputSchema
>;

function deterministicAuditHash(input: string): string {
  let hash = 2_166_136_261;

  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619) >>> 0;
  }

  return hash.toString(16).padStart(8, '0');
}

function buildAuditId(input: AuditRecordInput): string {
  const seed = [
    input.actor_id,
    input.action,
    input.target_id,
    input.created_at_epoch_ms.toString(),
    input.reason_code,
    input.authority_source,
    input.previous_status,
    input.next_status,
  ].join('|');

  return `audit_${deterministicAuditHash(seed)}`;
}

function buildAuditRecords(): AuditRecord[] {
  return [
    AuditRecordSchema.parse({
      audit_id: 'audit_001',
      actor_id: 'user_owner_001',
      action: 'session_checked',
      target_id: 'session_owner_001',
      created_at_epoch_ms: 1_700_000_000_000,
      reason_code: 'OWNER_COMMAND',
      authority_source: 'OWNER_COMMAND',
      previous_status: 'stable',
      next_status: 'stable',
    }),
    AuditRecordSchema.parse({
      audit_id: 'audit_002',
      actor_id: 'user_operator_001',
      action: 'run_created',
      target_id: 'run_001',
      created_at_epoch_ms: 1_700_000_010_000,
      reason_code: 'PIPELINE_REJECTED',
      authority_source: 'JUDGE',
      previous_status: 'queued',
      next_status: 'running',
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
    reason_code: record.reason_code,
    authority_source: record.authority_source,
    previous_status: record.previous_status,
    next_status: record.next_status,
  });
}

export function buildAuditRecord(input: AuditRecordInput): AuditRecord {
  const parsed = AuditRecordInputSchema.parse(input);

  return AuditRecordSchema.parse({
    audit_id: buildAuditId(parsed),
    actor_id: parsed.actor_id,
    action: parsed.action,
    target_id: parsed.target_id,
    created_at_epoch_ms: parsed.created_at_epoch_ms,
    reason_code: parsed.reason_code,
    authority_source: parsed.authority_source,
    previous_status: parsed.previous_status,
    next_status: parsed.next_status,
  });
}

export function buildStateControlAuditRecord(
  input: StateControlAuditRecordInput,
): AuditRecord {
  return buildAuditRecord(StateControlAuditRecordInputSchema.parse(input));
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
