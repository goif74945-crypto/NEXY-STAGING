import { z } from 'zod';

export const ForkLawInputSchema = z
  .object({
    branch: z.string().trim().min(1).max(256),
    forked: z.boolean(),
    reason: z.string().trim().max(4096),
  })
  .strict();

export const ForkLawResultSchema = z
  .object({
    branch: z.string().trim().min(1).max(256),
    forked: z.boolean(),
    reason: z.string().trim().max(4096),
    allowed: z.boolean(),
  })
  .strict();

export type ForkLawInput = z.infer<typeof ForkLawInputSchema>;
export type ForkLawResult = z.infer<typeof ForkLawResultSchema>;

export function parseForkLawInput(input: unknown): ForkLawInput {
  return ForkLawInputSchema.parse(input);
}

export function evaluateForkLaw(input: ForkLawInput): ForkLawResult {
  const parsed = parseForkLawInput(input);
  const normalizedReason = parsed.reason.trim();

  return ForkLawResultSchema.parse({
    branch: parsed.branch,
    forked: parsed.forked,
    reason: normalizedReason,
    allowed: parsed.forked === false ? true : normalizedReason.length > 0,
  });
}
