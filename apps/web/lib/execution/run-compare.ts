import { z } from 'zod';

export const RunCompareInputSchema = z
  .object({
    left_run_id: z.string().trim().min(1).max(256),
    right_run_id: z.string().trim().min(1).max(256),
    left_status: z.string().trim().min(1).max(128),
    right_status: z.string().trim().min(1).max(128),
    left_output_class: z.string().trim().max(256),
    right_output_class: z.string().trim().max(256),
  })
  .strict();

export const RunCompareResultSchema = z
  .object({
    left_run_id: z.string().trim().min(1).max(256),
    right_run_id: z.string().trim().min(1).max(256),
    same_status: z.boolean(),
    same_output_class: z.boolean(),
  })
  .strict();

export type RunCompareInput = z.infer<typeof RunCompareInputSchema>;
export type RunCompareResult = z.infer<typeof RunCompareResultSchema>;

export function parseRunCompareInput(input: unknown): RunCompareInput {
  return RunCompareInputSchema.parse(input);
}

export function buildRunCompareResult(
  input: RunCompareInput,
): RunCompareResult {
  const parsed = parseRunCompareInput(input);

  return RunCompareResultSchema.parse({
    left_run_id: parsed.left_run_id,
    right_run_id: parsed.right_run_id,
    same_status: parsed.left_status === parsed.right_status,
    same_output_class:
      parsed.left_output_class === parsed.right_output_class,
  });
  }
