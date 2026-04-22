import { z } from 'zod';

export const ExecutionHistoryRecordSchema = z
  .object({
    id: z.string().trim().min(1).max(256),
    label: z.string().trim().min(1).max(256),
    timestamp_epoch_ms: z.number().int().nonnegative(),
    description: z.string().trim().min(1).max(4096),
  })
  .strict();

export type ExecutionHistoryRecord = z.infer<
  typeof ExecutionHistoryRecordSchema
>;

export function parseExecutionHistoryRecord(
  input: unknown,
): ExecutionHistoryRecord {
  return ExecutionHistoryRecordSchema.parse(input);
}

export function validateExecutionHistoryRecord(input: unknown): boolean {
  return ExecutionHistoryRecordSchema.safeParse(input).success;
}

export function buildExecutionHistoryRecord(
  input: ExecutionHistoryRecord,
): ExecutionHistoryRecord {
  const parsed = parseExecutionHistoryRecord(input);

  return {
    id: parsed.id,
    label: parsed.label,
    timestamp_epoch_ms: parsed.timestamp_epoch_ms,
    description: parsed.description,
  };
    }
