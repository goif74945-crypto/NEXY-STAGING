import { z } from 'zod';

import { IntentModeSchema, type IntentMode } from '../types/intent-mode';

export const FirstContactInputSchema = z
  .object({
    text: z.string().trim().min(1).max(10000),
    session_known: z.boolean(),
    has_history: z.boolean(),
  })
  .strict();
export type FirstContactInput = z.infer<typeof FirstContactInputSchema>;

export const FirstContactResultSchema = z
  .object({
    first_contact: z.boolean(),
    suggested_mode: IntentModeSchema,
    confidence: z.number().int().min(0).max(100),
  })
  .strict();
export type FirstContactResult = z.infer<typeof FirstContactResultSchema>;

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
  'repair',
  'fix',
  'operate',
  'queue',
];
const VIEWER_KEYWORDS = [
  'view',
  'read',
  'show',
  'look',
  'inspect',
  'explain',
  'help',
];
const FIRST_CONTACT_KEYWORDS = [
  'hello',
  'hi',
  'hey',
  'start',
  'what is this',
  'who are you',
  'how does this work',
  'first time',
  'new here',
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

function inferSuggestedMode(text: string, firstContact: boolean): IntentMode {
  if (includesAnyKeyword(text, OWNER_KEYWORDS)) {
    return 'owner';
  }

  if (includesAnyKeyword(text, OPERATOR_KEYWORDS)) {
    return 'operator';
  }

  if (includesAnyKeyword(text, VIEWER_KEYWORDS) || firstContact) {
    return 'viewer';
  }

  return 'unknown';
}

export function classifyFirstContact(input: unknown): FirstContactResult {
  const parsed = FirstContactInputSchema.parse(input);
  const normalizedText = parsed.text.trim().toLowerCase();

  const noKnownSessionContext = !parsed.session_known && !parsed.has_history;
  const explicitFirstContact = includesAnyKeyword(normalizedText, FIRST_CONTACT_KEYWORDS);
  const first_contact = noKnownSessionContext || explicitFirstContact;

  const suggested_mode = inferSuggestedMode(normalizedText, first_contact);

  let confidence = first_contact ? 70 : 25;

  if (noKnownSessionContext) {
    confidence += 20;
  }

  if (explicitFirstContact) {
    confidence += 10;
  }

  if (suggested_mode !== 'unknown') {
    confidence += 5;
  }

  return FirstContactResultSchema.parse({
    first_contact,
    suggested_mode,
    confidence: clampConfidence(confidence),
  });
}

export function isLikelyFirstContact(input: unknown): boolean {
  return classifyFirstContact(input).first_contact;
}
