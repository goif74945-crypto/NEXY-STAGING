import { z } from 'zod';

import { IntentModeSchema, type IntentMode } from '../types/intent-mode';

export const FrontIntentInputSchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    session_role: IntentModeSchema.optional(),
    first_contact: z.boolean(),
  })
  .strict();
export type FrontIntentInput = z.infer<typeof FrontIntentInputSchema>;

export const FrontIntentResultSchema = z
  .object({
    mode: IntentModeSchema,
    confidence: z.number().int().min(0).max(100),
    reasons: z.array(z.string().trim().min(1).max(512)),
  })
  .strict();
export type FrontIntentResult = z.infer<typeof FrontIntentResultSchema>;

const OWNER_KEYWORDS = [
  'owner',
  'admin',
  'administrator',
  'override',
  'root',
  'policy',
  'governance',
];
const OPERATOR_KEYWORDS = [
  'run',
  'execute',
  'build',
  'deploy',
  'queue',
  'fix',
  'repair',
  'operate',
  'kill',
  'unfreeze',
  'freeze',
];
const VIEWER_KEYWORDS = [
  'view',
  'read',
  'show',
  'inspect',
  'search',
  'explain',
  'status',
  'summary',
];

function includesAnyKeyword(text: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function clampConfidence(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 100) {
    return 100;
  }

  return value;
}

export function inferFrontIntent(input: unknown): FrontIntentResult {
  const parsed = FrontIntentInputSchema.parse(input);
  const normalizedText = parsed.text.trim().toLowerCase();
  const reasons: string[] = [];

  let mode: IntentMode = 'unknown';
  let confidence = 20;

  if (includesAnyKeyword(normalizedText, OWNER_KEYWORDS)) {
    mode = 'owner';
    confidence = 90;
    reasons.push('owner_keywords_detected');
  } else if (includesAnyKeyword(normalizedText, OPERATOR_KEYWORDS)) {
    mode = 'operator';
    confidence = 82;
    reasons.push('operator_keywords_detected');
  } else if (includesAnyKeyword(normalizedText, VIEWER_KEYWORDS)) {
    mode = 'viewer';
    confidence = 74;
    reasons.push('viewer_keywords_detected');
  }

  if (parsed.first_contact) {
    reasons.push('first_contact_context');
    if (mode === 'unknown') {
      mode = 'viewer';
      confidence = 68;
    } else {
      confidence += 4;
    }
  }

  if (parsed.session_role !== undefined && parsed.session_role !== 'unknown') {
    reasons.push(`session_role:${parsed.session_role}`);

    if (mode === 'unknown') {
      mode = parsed.session_role;
      confidence = 60;
    } else if (mode === parsed.session_role) {
      confidence += 6;
    }
  }

  if (reasons.length === 0) {
    reasons.push('no_strong_signal');
  }

  return FrontIntentResultSchema.parse({
    mode,
    confidence: clampConfidence(confidence),
    reasons,
  });
}

export function shouldEscalateIntent(input: unknown): boolean {
  const result = inferFrontIntent(input);
  return (result.mode === 'owner' || result.mode === 'operator') && result.confidence >= 75;
}
