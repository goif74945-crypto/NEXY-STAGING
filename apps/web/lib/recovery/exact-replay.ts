import { z } from 'zod';

export const ExactReplayRecordSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    mode: z.literal('exact_replay'),
    ready: z.boolean(),
    summary: z.string().trim().min(1).max(4096),
  })
  .strict();

export type ExactReplayRecord = z.infer<typeof ExactReplayRecordSchema>;

export function parseExactReplayRecord(input: unknown): ExactReplayRecord {
  return ExactReplayRecordSchema.parse(input);
}

export function validateExactReplayRecord(input: unknown): boolean {
  return ExactReplayRecordSchema.safeParse(input).success;
}

export function buildExactReplayRecord(
  input: ExactReplayRecord,
): ExactReplayRecord {
  const parsed = parseExactReplayRecord(input);

  return {
    universe_id: parsed.universe_id,
    mode: parsed.mode,
    ready: parsed.ready,
    summary: parsed.summary,
  };
}
