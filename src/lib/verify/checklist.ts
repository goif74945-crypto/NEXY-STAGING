import { z } from 'zod';

export const ChecklistItemSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    passed: z.boolean(),
  })
  .strict();

export const ChecklistSchema = z.array(ChecklistItemSchema);

export const ChecklistEvaluationSchema = z
  .object({
    items: z.array(ChecklistItemSchema),
    all_passed: z.boolean(),
    failed_ids: z.array(z.string()),
  })
  .strict();

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type Checklist = z.infer<typeof ChecklistSchema>;
export type ChecklistEvaluation = z.infer<typeof ChecklistEvaluationSchema>;

export function evaluateChecklist(items: Checklist): ChecklistEvaluation {
  const parsedItems = ChecklistSchema.parse(items);
  const failedIds = parsedItems
    .filter((item) => item.passed === false)
    .map((item) => item.id);

  return ChecklistEvaluationSchema.parse({
    items: parsedItems,
    all_passed: failedIds.length === 0,
    failed_ids: failedIds,
  });
}
