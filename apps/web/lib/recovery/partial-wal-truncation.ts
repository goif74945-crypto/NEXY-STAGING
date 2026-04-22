import { z } from 'zod';

export const PartialWalTruncationSchema = z
  .object({
    before_count: z.number().int().nonnegative(),
    after_count: z.number().int().nonnegative(),
    truncated: z.boolean(),
    safe: z.boolean(),
  })
  .strict();

export type PartialWalTruncation = z.infer<typeof PartialWalTruncationSchema>;

export function parsePartialWalTruncation(
  input: unknown,
): PartialWalTruncation {
  return PartialWalTruncationSchema.parse(input);
}

export function validatePartialWalTruncation(input: unknown): boolean {
  return PartialWalTruncationSchema.safeParse(input).success;
}

export function buildPartialWalTruncation(
  input: PartialWalTruncation,
): PartialWalTruncation {
  const parsed = parsePartialWalTruncation(input);
  const truncated = parsed.after_count < parsed.before_count;
  const safe =
    parsed.after_count >= 0 && parsed.after_count <= parsed.before_count;

  if (parsed.truncated !== truncated || parsed.safe !== safe) {
    throw new Error('Illegal partial WAL truncation contradiction.');
  }

  return {
    before_count: parsed.before_count,
    after_count: parsed.after_count,
    truncated,
    safe,
  };
}
