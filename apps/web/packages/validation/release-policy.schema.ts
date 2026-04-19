import { z } from 'zod';

import {
  BlockingLayerSchema,
  DEFAULT_RELEASE_THRESHOLDS,
  FreezeReasonSchema,
  ReleasePolicyDecisionSchema,
  ReleasePolicyGateSchema,
  ReleasePolicyResultSchema,
  ReleaseThresholdSnapshotSchema,
} from '../contracts/release-policy';

export const ReleasePolicyEvaluationRequestSchema = z
  .object({
    gate: ReleasePolicyGateSchema,
    threshold_snapshot: ReleaseThresholdSnapshotSchema.default(DEFAULT_RELEASE_THRESHOLDS),
  })
  .strict();
export type ReleasePolicyEvaluationRequest = z.infer<typeof ReleasePolicyEvaluationRequestSchema>;

export const ReleasePolicyAcceptResultSchema = ReleasePolicyResultSchema.refine(
  (value) => value.decision === 'ACCEPT' && value.passed && value.accepted,
  {
    message: 'decision must be ACCEPT with passed=true and accepted=true.',
  },
);
export type ReleasePolicyAcceptResult = z.infer<typeof ReleasePolicyAcceptResultSchema>;

export const ReleasePolicyReleaseableResultSchema = ReleasePolicyResultSchema.refine(
  (value) => value.decision === 'RELEASEABLE' && value.releaseable,
  {
    message: 'decision must be RELEASEABLE with releaseable=true.',
  },
);
export type ReleasePolicyReleaseableResult = z.infer<typeof ReleasePolicyReleaseableResultSchema>;

export const ReleasePolicyRejectResultSchema = ReleasePolicyResultSchema.refine(
  (value) => value.decision === 'REJECT' && !value.releaseable,
  {
    message: 'decision must be REJECT with releaseable=false.',
  },
);
export type ReleasePolicyRejectResult = z.infer<typeof ReleasePolicyRejectResultSchema>;

export const ReleasePolicyFreezeResultSchema = ReleasePolicyResultSchema.refine(
  (value) => value.decision === 'FREEZE' && value.freeze_reason !== undefined,
  {
    message: 'decision must be FREEZE with freeze_reason present.',
  },
);
export type ReleasePolicyFreezeResult = z.infer<typeof ReleasePolicyFreezeResultSchema>;

export const ReleasePolicyFreezeLookupSchema = z
  .object({
    blocking_layer: BlockingLayerSchema,
    freeze_reason: FreezeReasonSchema,
  })
  .strict();
export type ReleasePolicyFreezeLookup = z.infer<typeof ReleasePolicyFreezeLookupSchema>;

export const ReleasePolicyDecisionOnlySchema = z
  .object({
    decision: ReleasePolicyDecisionSchema,
  })
  .strict();
export type ReleasePolicyDecisionOnly = z.infer<typeof ReleasePolicyDecisionOnlySchema>;

export function parseReleasePolicyEvaluationRequest(input: unknown): ReleasePolicyEvaluationRequest {
  return ReleasePolicyEvaluationRequestSchema.parse(input);
}

export function parseReleasePolicyResult(input: unknown) {
  return ReleasePolicyResultSchema.parse(input);
}

export function parseReleasePolicyAcceptResult(input: unknown): ReleasePolicyAcceptResult {
  return ReleasePolicyAcceptResultSchema.parse(input);
}

export function parseReleasePolicyReleaseableResult(input: unknown): ReleasePolicyReleaseableResult {
  return ReleasePolicyReleaseableResultSchema.parse(input);
}

export function parseReleasePolicyRejectResult(input: unknown): ReleasePolicyRejectResult {
  return ReleasePolicyRejectResultSchema.parse(input);
}

export function parseReleasePolicyFreezeResult(input: unknown): ReleasePolicyFreezeResult {
  return ReleasePolicyFreezeResultSchema.parse(input);
}

export function validateReleasePolicyEvaluationRequest(input: unknown): boolean {
  return ReleasePolicyEvaluationRequestSchema.safeParse(input).success;
}

export function validateReleasePolicyResult(input: unknown): boolean {
  return ReleasePolicyResultSchema.safeParse(input).success;
}