import { z } from 'zod';

import { EvidenceBatchSchema } from '../contracts/evidence';
import { ErrorCodeSchema } from '../contracts/errors';
import {
  BlockingLayerSchema,
  DEFAULT_RELEASE_THRESHOLDS,
  FreezeReasonSchema,
  ReleasePolicyGateSchema,
  ReleasePolicyResultSchema,
  ReleaseThresholdSnapshotSchema,
} from '../contracts/release-policy';
import { guardEvidenceValid, guardQuorumSatisfied } from '../core/guards';
import { buildReleasePolicyGate, evaluateReleasePolicyFromEvidence } from '../core/release-policy';

export const PrereleaseInputSchema = z
  .object({
    evidence_batch: EvidenceBatchSchema,
    quorum_count: z.number().int().nonnegative(),
    confidence: z.number().finite().min(0).max(1).optional(),
    deterministic_match_score: z.number().finite().min(0).max(1).optional(),
    threshold_snapshot: ReleaseThresholdSnapshotSchema.default(DEFAULT_RELEASE_THRESHOLDS),
  })
  .strict();
export type PrereleaseInput = z.infer<typeof PrereleaseInputSchema>;

export const PrereleaseResultSchema = z
  .object({
    passed: z.boolean(),
    evidence_valid: z.boolean(),
    quorum_satisfied: z.boolean(),
    gate: ReleasePolicyGateSchema,
    release_policy_result: ReleasePolicyResultSchema,
    blocking_codes: z.array(ErrorCodeSchema),
    freeze_reason: FreezeReasonSchema.optional(),
  })
  .strict();
export type PrereleaseResult = z.infer<typeof PrereleaseResultSchema>;

function buildFreezeReason(
  code: 'CONSENSUS_FAILED' | 'RELEASE_POLICY_FAILED',
  trigger: string,
  blockingLayer: z.infer<typeof BlockingLayerSchema>,
  evidenceCount: number,
  quorumCount: number,
) {
  return FreezeReasonSchema.parse({
    code,
    trigger,
    blocking_layer: blockingLayer,
    recoverable: true,
    primary_incident_id: `law-prerelease:${code}:${evidenceCount}:${quorumCount}`,
  });
}

function buildFrozenPrereleaseResult(
  input: PrereleaseInput,
  code: 'CONSENSUS_FAILED' | 'RELEASE_POLICY_FAILED',
  trigger: string,
  evidenceValid: boolean,
  quorumSatisfied: boolean,
): PrereleaseResult {
  const gate = buildReleasePolicyGate({
    evidenceBatch: input.evidence_batch,
    quorumCount: input.quorum_count,
    confidence: input.confidence,
    deterministicMatchScore: input.deterministic_match_score,
  });

  const freeze_reason = buildFreezeReason(
    code,
    trigger,
    code === 'CONSENSUS_FAILED' ? 'LAW' : 'OBS',
    gate.evidence_count,
    gate.quorum_count,
  );

  return {
    passed: false,
    evidence_valid: evidenceValid,
    quorum_satisfied: quorumSatisfied,
    gate,
    release_policy_result: {
      passed: false,
      decision: 'FREEZE',
      releaseable: false,
      accepted: false,
      reasons: [code],
      threshold_snapshot: input.threshold_snapshot,
      freeze_reason,
    },
    blocking_codes: [code],
    freeze_reason,
  };
}

export function parsePrereleaseInput(input: unknown): PrereleaseInput {
  return PrereleaseInputSchema.parse(input);
}

export function runPrerelease(input: unknown): PrereleaseResult {
  const parsed = parsePrereleaseInput(input);

  const evidenceGuard = guardEvidenceValid(parsed.evidence_batch);
  const quorumGuard = guardQuorumSatisfied(
    parsed.quorum_count,
    parsed.threshold_snapshot.quorum_min,
  );

  if (!evidenceGuard.passed) {
    return buildFrozenPrereleaseResult(
      parsed,
      'RELEASE_POLICY_FAILED',
      evidenceGuard.reason,
      false,
      quorumGuard.passed,
    );
  }

  if (!quorumGuard.passed) {
    return buildFrozenPrereleaseResult(
      parsed,
      'CONSENSUS_FAILED',
      quorumGuard.reason,
      true,
      false,
    );
  }

  const gate = buildReleasePolicyGate({
    evidenceBatch: parsed.evidence_batch,
    quorumCount: parsed.quorum_count,
    confidence: parsed.confidence,
    deterministicMatchScore: parsed.deterministic_match_score,
  });

  const release_policy_result = evaluateReleasePolicyFromEvidence({
    evidenceBatch: parsed.evidence_batch,
    quorumCount: parsed.quorum_count,
    confidence: parsed.confidence,
    deterministicMatchScore: parsed.deterministic_match_score,
    thresholdSnapshot: parsed.threshold_snapshot,
  });

  return {
    passed: release_policy_result.passed,
    evidence_valid: true,
    quorum_satisfied: true,
    gate,
    release_policy_result,
    blocking_codes: release_policy_result.reasons,
    ...(release_policy_result.freeze_reason
      ? { freeze_reason: release_policy_result.freeze_reason }
      : {}),
  };
}

export function assertPrereleasePasses(input: unknown): PrereleaseResult {
  const result = runPrerelease(input);

  if (!result.passed) {
    throw new Error(
      `Prerelease blocked: ${result.blocking_codes.join(', ') || 'UNKNOWN_PRERELEASE_FAILURE'}`,
    );
  }

  return result;
}

export function validatePrereleaseInput(input: unknown): boolean {
  return PrereleaseInputSchema.safeParse(input).success;
}