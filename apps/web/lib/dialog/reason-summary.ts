import { z } from 'zod';

export const ReasonSummaryInputSchema = z
  .object({
    reasons: z.array(z.string().trim().min(1).max(512)),
    max_items: z.number().int().nonnegative(),
  })
  .strict();
export type ReasonSummaryInput = z.infer<typeof ReasonSummaryInputSchema>;

export const ReasonSummaryViewSchema = z
  .object({
    items: z.array(z.string().trim().min(1).max(512)),
    truncated: z.boolean(),
  })
  .strict();
export type ReasonSummaryView = z.infer<typeof ReasonSummaryViewSchema>;

export function buildReasonSummaryView(input: unknown): ReasonSummaryView {
  const parsed = ReasonSummaryInputSchema.parse(input);
  const seen = new Set<string>();
  const uniqueReasons: string[] = [];

  for (const reason of parsed.reasons) {
    if (!seen.has(reason)) {
      seen.add(reason);
      uniqueReasons.push(reason);
    }
  }

  const items = uniqueReasons.slice(0, parsed.max_items);
  const truncated = uniqueReasons.length > items.length;

  return ReasonSummaryViewSchema.parse({
    items,
    truncated,
  });
}
