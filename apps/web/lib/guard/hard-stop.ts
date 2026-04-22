import { z } from 'zod';

import { IntentModeSchema } from '../types/intent-mode';
import { TrustLevelSchema } from '../types/trust-level';
import { SocialEngineeringSignalSchema } from './social-engineering';

export const HardStopInputSchema = z
  .object({
    trust_level: TrustLevelSchema,
    signals: z.array(SocialEngineeringSignalSchema),
    credential_request: z.boolean(),
    session_role: IntentModeSchema,
  })
  .strict();
export type HardStopInput = z.infer<typeof HardStopInputSchema>;

export const HardStopResultSchema = z
  .object({
    blocked: z.boolean(),
    reason: z.string().trim().min(1).max(512),
    severity: TrustLevelSchema,
  })
  .strict();
export type HardStopResult = z.infer<typeof HardStopResultSchema>;

export function evaluateHardStop(input: unknown): HardStopResult {
  const parsed = HardStopInputSchema.parse(input);

  if (parsed.trust_level === 'critical') {
    return HardStopResultSchema.parse({
      blocked: true,
      reason: 'critical_trust_level',
      severity: 'critical',
    });
  }

  if (
    parsed.credential_request &&
    (
      parsed.signals.includes('credential_request') ||
      parsed.signals.includes('secrecy') ||
      parsed.signals.includes('authority_pressure') ||
      parsed.trust_level === 'high'
    )
  ) {
    return HardStopResultSchema.parse({
      blocked: true,
      reason: 'credential_request_high_risk',
      severity: 'critical',
    });
  }

  if (
    parsed.session_role === 'unknown' &&
    (
      parsed.signals.includes('authority_pressure') ||
      parsed.signals.includes('confusion_pressure')
    )
  ) {
    return HardStopResultSchema.parse({
      blocked: true,
      reason: 'unknown_session_role_with_pressure_signals',
      severity: 'high',
    });
  }

  return HardStopResultSchema.parse({
    blocked: false,
    reason: 'no_hard_stop',
    severity: parsed.trust_level,
  });
}
