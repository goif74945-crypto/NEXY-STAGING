import { z } from 'zod';

export const ExecutionSessionRecordSchema = z
  .object({
    session_id: z.string().trim().min(1).max(256),
    subject: z.string().trim().min(1).max(256),
    role: z.string().trim().min(1).max(128),
    status: z.string().trim().min(1).max(128),
    issued_at_epoch_ms: z.number().int().nonnegative(),
    expires_at_epoch_ms: z.number().int().nonnegative(),
    revoked_at_epoch_ms: z.number().int().nonnegative().nullable(),
  })
  .strict();

export type ExecutionSessionRecord = z.infer<
  typeof ExecutionSessionRecordSchema
>;

export function parseExecutionSessionRecord(
  input: unknown,
): ExecutionSessionRecord {
  return ExecutionSessionRecordSchema.parse(input);
}

export function validateExecutionSessionRecord(input: unknown): boolean {
  return ExecutionSessionRecordSchema.safeParse(input).success;
}

export function buildExecutionSessionRecord(
  input: ExecutionSessionRecord,
): ExecutionSessionRecord {
  const parsed = parseExecutionSessionRecord(input);

  if (parsed.expires_at_epoch_ms < parsed.issued_at_epoch_ms) {
    throw new Error('expires_at_epoch_ms must be greater than or equal to issued_at_epoch_ms');
  }

  if (
    parsed.revoked_at_epoch_ms !== null &&
    parsed.revoked_at_epoch_ms < parsed.issued_at_epoch_ms
  ) {
    throw new Error('revoked_at_epoch_ms must be greater than or equal to issued_at_epoch_ms');
  }

  return {
    session_id: parsed.session_id,
    subject: parsed.subject,
    role: parsed.role,
    status: parsed.status,
    issued_at_epoch_ms: parsed.issued_at_epoch_ms,
    expires_at_epoch_ms: parsed.expires_at_epoch_ms,
    revoked_at_epoch_ms: parsed.revoked_at_epoch_ms,
  };
  }
