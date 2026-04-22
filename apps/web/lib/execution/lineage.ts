import { z } from 'zod';

export const ExecutionLineageSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    parent_run_id: z.string().trim().max(256),
    spec_hash: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    output_id: z.string().trim().min(1).max(256),
  })
  .strict();

export type ExecutionLineage = z.infer<typeof ExecutionLineageSchema>;

export function parseExecutionLineage(input: unknown): ExecutionLineage {
  return ExecutionLineageSchema.parse(input);
}

export function validateExecutionLineage(input: unknown): boolean {
  return ExecutionLineageSchema.safeParse(input).success;
}

export function buildExecutionLineage(
  input: ExecutionLineage,
): ExecutionLineage {
  const parsed = parseExecutionLineage(input);

  if (parsed.parent_run_id !== '' && parsed.parent_run_id === parsed.run_id) {
    throw new Error('parent_run_id must not equal run_id');
  }

  return {
    run_id: parsed.run_id,
    parent_run_id: parsed.parent_run_id,
    spec_hash: parsed.spec_hash,
    artifact_hash: parsed.artifact_hash,
    output_id: parsed.output_id,
  };
}
