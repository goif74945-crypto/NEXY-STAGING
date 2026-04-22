import { z } from 'zod';

import { TrustLevelSchema, type TrustLevel } from '../types/trust-level';

export const SocialEngineeringSignalSchema = z.enum([
  'urgency',
  'authority_pressure',
  'secrecy',
  'credential_request',
  'confusion_pressure',
]);
export type SocialEngineeringSignal = z.infer<typeof SocialEngineeringSignalSchema>;

export const SocialEngineeringAssessmentSchema = z
  .object({
    signals: z.array(SocialEngineeringSignalSchema),
    risk_level: TrustLevelSchema,
    score: z.number().int().min(0).max(100),
  })
  .strict();
export type SocialEngineeringAssessment = z.infer<typeof SocialEngineeringAssessmentSchema>;

const SIGNAL_ORDER: SocialEngineeringSignal[] = [
  'urgency',
  'authority_pressure',
  'secrecy',
  'credential_request',
  'confusion_pressure',
];

function inferRiskLevel(score: number): TrustLevel {
  if (score >= 80) {
    return 'critical';
  }

  if (score >= 50) {
    return 'high';
  }

  if (score >= 20) {
    return 'medium';
  }

  return 'low';
}

export function assessSocialEngineeringSignals(input: unknown): SocialEngineeringAssessment {
  const text = z.string().trim().min(1).max(10000).parse(input).toLowerCase();
  const detected = new Set<SocialEngineeringSignal>();

  if (
    text.includes('urgent') ||
    text.includes('immediately') ||
    text.includes('asap') ||
    text.includes('right now')
  ) {
    detected.add('urgency');
  }

  if (
    text.includes('boss') ||
    text.includes('ceo') ||
    text.includes('owner') ||
    text.includes('admin said')
  ) {
    detected.add('authority_pressure');
  }

  if (
    text.includes('secret') ||
    text.includes('confidential') ||
    text.includes('do not tell') ||
    text.includes('keep this private')
  ) {
    detected.add('secrecy');
  }

  if (
    text.includes('password') ||
    text.includes('token') ||
    text.includes('credential') ||
    text.includes('otp') ||
    text.includes('code')
  ) {
    detected.add('credential_request');
  }

  if (
    text.includes('just do it') ||
    text.includes('do not ask') ||
    text.includes('skip verification') ||
    text.includes('no questions')
  ) {
    detected.add('confusion_pressure');
  }

  const signals = SIGNAL_ORDER.filter((signal) => detected.has(signal));
  const score = Math.min(
    100,
    signals.reduce((total, signal) => {
      switch (signal) {
        case 'urgency':
          return total + 20;
        case 'authority_pressure':
          return total + 20;
        case 'secrecy':
          return total + 20;
        case 'credential_request':
          return total + 30;
        case 'confusion_pressure':
          return total + 15;
      }
    }, 0),
  );

  return SocialEngineeringAssessmentSchema.parse({
    signals,
    risk_level: inferRiskLevel(score),
    score,
  });
}
