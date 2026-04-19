import { z } from 'zod';

import { ErrorCodeSchema } from './errors';

export const ReleasePolicyDecisionValues = ['ACCEPT', 'RELEASEABLE', 'REJECT', 'FREEZE'] as const;
export const ReleasePolicyDecisionSchema = z.enum(ReleasePolicyDecisionValues);
export type ReleasePolicyDecision = z.infer<typeof ReleasePolicyDecisionSchema>;

export const BlockingLayerValues = [
  'CORE',
  'LAW',
  'JUDGE',
  'SWARM',
  'AUTH',
  'VAULT',
  'API',
  'QUEUE',
  'OBS',
] as const;
export const BlockingLayerSchema = z.enum(BlockingLayerValues);
export type BlockingLayer = z.infer<typeof BlockingLayerSchema>;

export const ReleaseThresholdSnapshotSchema = z
  .object({
    confidence_min: z.number().finite().min(0).max(1),
    deterministic_match_min: z.number().finite().min(0).max(1),
    quorum_min: z.number().int().positive(),
    minimum_evidence_count: z.number().int().positive(),
  })
  .strict();
export type ReleaseThresholdSnapshot = z.infer<typeof ReleaseThresholdSnapshotSchema>;

export const FreezeReasonSchema = z
  .object({
    code: ErrorCodeSchema,
    trigger: z.string().trim().min(1).max(4096),
    blocking_layer: BlockingLayerSchema,
    recoverable: z.boolean(),
    primary_incident_id: z.string().trim().min(1).max(128),
  })
  .strict();
export type FreezeReason = z.infer<typeof FreezeReasonSchema>;

export const ReleasePolicyGateSchema = z
  .object({
    confidence: z.number().finite().min(0).max(1),
    deterministic_match_score: z.number().finite().min(0).max(1),
    quorum_count: z.number().int().nonnegative(),
    evidence_count: z.number().int().nonnegative(),
  })
  .strict();
export type ReleasePolicyGate = z.infer<typeof ReleasePolicyGateSchema>;

export const ReleasePolicyResultSchema = z
  .object({
    passed: z.boolean(),
    decision: ReleasePolicyDecisionSchema,
    releaseable: z.boolean(),
    accepted: z.boolean(),
    reasons: z.array(ErrorCodeSchema),
    threshold_snapshot: ReleaseThresholdSnapshotSchema,
    freeze_reason: FreezeReasonSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.decision === 'FREEZE' && !value.freeze_reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'freeze_reason is required when decision is FREEZE.',
        path: ['freeze_reason'],
      });
    }
  });
export type ReleasePolicyResult = z.infer<typeof ReleasePolicyResultSchema>;

export const DEFAULT_RELEASE_THRESHOLDS = {
  confidence_min: 0.85,
  deterministic_match_min: 0.9,
  quorum_min: 2,
  minimum_evidence_count: 2,
} as const satisfies ReleaseThresholdSnapshot;

export const DefaultReleaseThresholdsSchema = ReleaseThresholdSnapshotSchema;
export type DefaultReleaseThresholds = z.infer<typeof DefaultReleaseThresholdsSchema>;

export const parseReleasePolicyResult = (input: unknown): ReleasePolicyResult =>
  ReleasePolicyResultSchema.parse(input);