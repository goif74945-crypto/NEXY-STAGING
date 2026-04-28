import { z } from 'zod';

export const TextDiffResultSchema = z
  .object({
    same: z.boolean(),
    left_length: z.number().int().nonnegative(),
    right_length: z.number().int().nonnegative(),
    first_difference_index: z.number().int().nonnegative().nullable(),
  })
  .strict();

export type TextDiffResult = z.infer<typeof TextDiffResultSchema>;

function findFirstDifferenceIndex(left: string, right: string): number | null {
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (left[index] !== right[index]) {
      return index;
    }
  }

  return null;
}

export function buildTextDiff(left: string, right: string): TextDiffResult {
  const same = left === right;

  return TextDiffResultSchema.parse({
    same,
    left_length: left.length,
    right_length: right.length,
    first_difference_index: same
      ? null
      : findFirstDifferenceIndex(left, right),
  });
}
