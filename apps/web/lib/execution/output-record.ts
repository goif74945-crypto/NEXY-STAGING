import { z } from 'zod';

export const ExecutionOutputRecordSchema = z
  .object({
    output_id: z.string().trim().min(1).max(256),
    run_id: z.string().trim().min(1).max(256),
    output_class: z.string().trim().min(1).max(256),
    content_hash: z.string().trim().min(1).max(256),
    reason_summary: z.array(z.string().trim().min(1).max(4096)),
  })
  .strict();

export type ExecutionOutputRecord = z.infer<
  typeof ExecutionOutputRecordSchema
>;

export function parseExecutionOutputRecord(
  input: unknown,
): ExecutionOutputRecord {
  return ExecutionOutputRecordSchema.parse(input);
}

export function validateExecutionOutputRecord(input: unknown): boolean {
  return ExecutionOutputRecordSchema.safeParse(input).success;
}

export function buildExecutionOutputRecord(
  input: ExecutionOutputRecord,
): ExecutionOutputRecord {
  const parsed = parseExecutionOutputRecord(input);

  return {
    output_id: parsed.output_id,
    run_id: parsed.run_id,
    output_class: parsed.output_class,
    content_hash: parsed.content_hash,
    reason_summary: [...parsed.reason_summary],
  };
  }
