import { z } from 'zod';

export const ExecutionRunRecordSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    status: z.string().trim().min(1).max(128),
    started_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
    output_class: z.string().trim().max(256),
    freeze_reason: z.string().trim().max(4096),
  })
  .strict();

export type ExecutionRunRecord = z.infer<typeof ExecutionRunRecordSchema>;

export function parseExecutionRunRecord(input: unknown): ExecutionRunRecord {
  return ExecutionRunRecordSchema.parse(input);
}

export function validateExecutionRunRecord(input: unknown): boolean {
  return ExecutionRunRecordSchema.safeParse(input).success;
}

export function buildExecutionRunRecord(
  input: ExecutionRunRecord,
): ExecutionRunRecord {
  const parsed = parseExecutionRunRecord(input);

  if (parsed.updated_at_epoch_ms < parsed.started_at_epoch_ms) {
    throw new Error('updated_at_epoch_ms must be greater than or equal to started_at_epoch_ms');
  }

  return {
    run_id: parsed.run_id,
    status: parsed.status,
    started_at_epoch_ms: parsed.started_at_epoch_ms,
    updated_at_epoch_ms: parsed.updated_at_epoch_ms,
    output_class: parsed.output_class,
    freeze_reason: parsed.freeze_reason,
  };
  }
