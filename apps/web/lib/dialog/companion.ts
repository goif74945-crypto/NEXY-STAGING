import { z } from 'zod';

import { IntentModeSchema } from '../types/intent-mode';
import { TrustLevelSchema } from '../types/trust-level';

export const CompanionReplyInputSchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    mode: IntentModeSchema,
    trust_level: TrustLevelSchema,
  })
  .strict();
export type CompanionReplyInput = z.infer<typeof CompanionReplyInputSchema>;

const CompanionToneSchema = z.enum(['neutral', 'gentle', 'firm']);
export type CompanionTone = z.infer<typeof CompanionToneSchema>;

export const CompanionReplyPlanSchema = z
  .object({
    tone: CompanionToneSchema,
    show_reason_summary: z.boolean(),
    show_soft_probe: z.boolean(),
  })
  .strict();
export type CompanionReplyPlan = z.infer<typeof CompanionReplyPlanSchema>;

export function planCompanionReply(input: unknown): CompanionReplyPlan {
  const parsed = CompanionReplyInputSchema.parse(input);
  const normalizedText = parsed.text.trim().toLowerCase();

  const show_reason_summary =
    parsed.mode === 'owner' ||
    parsed.mode === 'operator' ||
    normalizedText.includes('why') ||
    normalizedText.includes('reason');

  const show_soft_probe = parsed.trust_level === 'high' || parsed.trust_level === 'critical';

  let tone: CompanionTone = 'neutral';

  if (parsed.trust_level === 'critical') {
    tone = 'firm';
  } else if (
    parsed.trust_level === 'medium' ||
    parsed.trust_level === 'high' ||
    parsed.mode === 'viewer'
  ) {
    tone = 'gentle';
  }

  return CompanionReplyPlanSchema.parse({
    tone,
    show_reason_summary,
    show_soft_probe,
  });
}
