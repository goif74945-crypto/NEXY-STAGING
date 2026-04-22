import { z } from 'zod';

import { TrustLevelSchema } from '../types/trust-level';
import { SocialEngineeringSignalSchema } from './social-engineering';

export const SoftProbeInputSchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    trust_level: TrustLevelSchema,
    signals: z.array(SocialEngineeringSignalSchema),
  })
  .strict();
export type SoftProbeInput = z.infer<typeof SoftProbeInputSchema>;

export const SoftProbePlanSchema = z
  .object({
    ask_probe: z.boolean(),
    message: z.string().trim().min(1).max(1024),
    reason: z.string().trim().min(1).max(512),
  })
  .strict();
export type SoftProbePlan = z.infer<typeof SoftProbePlanSchema>;

export function planSoftProbe(input: unknown): SoftProbePlan {
  const parsed = SoftProbeInputSchema.parse(input);

  if (parsed.signals.includes('credential_request')) {
    return SoftProbePlanSchema.parse({
      ask_probe: true,
      message: 'Please confirm why credentials or secret codes are required before proceeding.',
      reason: 'credential_request_detected',
    });
  }

  if (parsed.trust_level === 'high' || parsed.trust_level === 'critical') {
    return SoftProbePlanSchema.parse({
      ask_probe: true,
      message: 'Please restate the request in clear, verifiable steps before continuing.',
      reason: 'elevated_trust_level',
    });
  }

  if (parsed.signals.length > 0) {
    return SoftProbePlanSchema.parse({
      ask_probe: true,
      message: 'Please clarify the intent and expected outcome before continuing.',
      reason: `signals:${parsed.signals.join(',')}`,
    });
  }

  return SoftProbePlanSchema.parse({
    ask_probe: false,
    message: 'No probe required.',
    reason: 'no_probe_needed',
  });
}
