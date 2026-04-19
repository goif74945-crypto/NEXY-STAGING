import type { ErrorCode } from '../contracts/errors';
import type { EvidenceBatch } from '../contracts/evidence';
import {
  DEFAULT_RELEASE_THRESHOLDS,
  type FreezeReason,
  type ReleasePolicyGate,
  type ReleasePolicyResult,
  type ReleaseThresholdSnapshot,
} from '../contracts/release-policy';
import { parseEvidenceBatch } from '../contracts/evidence';
import {
  parseReleasePolicyEvaluationRequest,
  type ReleasePolicyEvaluationRequest,
} from '../validation/release-policy.schema';

export type BuildReleasePolicyGateInput = {
  evidenceBatch: unknown;
  quorumCount: number;
  confidence?: number;
  deterministicMatchScore?: number;
};

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function deriveConfidence(evidenceBatch: EvidenceBatch): number {
  return average(evidenceBatch.items.map((item) => item.confidence));
}

function deriveDeterministicMatchScore(evidenceBatch: EvidenceBatch): number {
  return average(
    evidenceBatch.items.map((item) => Math.min(item.weight.integrity, item.weight.relevance)),
  );
}

function buildFreezeReason(
  code: 'EVIDENCE_MISSING' | 'CONSENSUS_FAILED' | 'RELEASE_POLICY_FAILED',
  trigger: string,
  blockingLayer: FreezeReason['blocking_layer'],
  evidenceCount: number,
  quorumCount: number,
): FreezeReason {
  return {
    code,
    trigger,
    blocking_layer: blockingLayer,
    recoverable: true,
    primary_incident_id: `release-policy:${code}:${evidenceCount}:${quorumCount}`,
  };
}

export function buildReleasePolicyGate(input: BuildReleasePolicyGateInput): ReleasePolicyGate {
  const evidenceBatch = parseEvidenceBatch(input.evidenceBatch);

  if (!Number.isInteger(input.quorumCount) || input.quorumCount < 0) {
    throw new Error('quorumCount must be a non-negative integer.');
  }

  return {
    confidence:
      typeof input.confidence === 'number' ? input.confidence : deriveConfidence(evidenceBatch),
    deterministic_match_score:
      typeof input.deterministicMatchScore === 'number'
        ? input.deterministicMatchScore
        : deriveDeterministicMatchScore(evidenceBatch),
    quorum_count: input.quorumCount,
    evidence_count: evidenceBatch.items.length,
  };
}

function evaluateGateAgainstThresholds(
  gate: ReleasePolicyGate,
  thresholdSnapshot: ReleaseThresholdSnapshot,
): ErrorCode[] {
  const reasons: ErrorCode[] = [];

  if (gate.evidence_count < thresholdSnapshot.minimum_evidence_count) {
    reasons.push('EVIDENCE_MISSING');
  }

  if (gate.quorum_count < thresholdSnapshot.quorum_min) {
    reasons.push('CONSENSUS_FAILED');
  }

  if (
    gate.confidence < thresholdSnapshot.confidence_min ||
    gate.deterministic_match_score < thresholdSnapshot.deterministic_match_min
  ) {
    reasons.push('RELEASE_POLICY_FAILED');
  }

  return reasons;
}

export function evaluateReleasePolicy(
  input: unknown,
): ReleasePolicyResult {
  const request: ReleasePolicyEvaluationRequest = parseReleasePolicyEvaluationRequest(input);
  const gate = request.gate;
  const thresholdSnapshot = request.threshold_snapshot;
  const reasons = evaluateGateAgainstThresholds(gate, thresholdSnapshot);

  if (reasons.length === 0) {
    return {
      passed: true,
      decision: 'ACCEPT',
      releaseable: true,
      accepted: true,
      reasons: [],
      threshold_snapshot: thresholdSnapshot,
    };
  }

  const shouldFreeze =
    reasons.includes('EVIDENCE_MISSING') || reasons.includes('CONSENSUS_FAILED');

  if (shouldFreeze) {
    const primaryCode = reasons.includes('EVIDENCE_MISSING')
      ? 'EVIDENCE_MISSING'
      : 'CONSENSUS_FAILED';

    return {
      passed: false,
      decision: 'FREEZE',
      releaseable: false,
      accepted: false,
      reasons,
      threshold_snapshot: thresholdSnapshot,
      freeze_reason: buildFreezeReason(
        primaryCode,
        'Release policy entered FREEZE due to missing evidence or unsatisfied quorum.',
        primaryCode === 'EVIDENCE_MISSING' ? 'JUDGE' : 'LAW',
        gate.evidence_count,
        gate.quorum_count,
      ),
    };
  }

  return {
    passed: false,
    decision: 'REJECT',
    releaseable: false,
    accepted: false,
    reasons,
    threshold_snapshot: thresholdSnapshot,
  };
}

export function evaluateReleasePolicyFromEvidence(input: {
  evidenceBatch: unknown;
  quorumCount: number;
  confidence?: number;
  deterministicMatchScore?: number;
  thresholdSnapshot?: ReleaseThresholdSnapshot;
}): ReleasePolicyResult {
  const gate = buildReleasePolicyGate({
    evidenceBatch: input.evidenceBatch,
    quorumCount: input.quorumCount,
    confidence: input.confidence,
    deterministicMatchScore: input.deterministicMatchScore,
  });

  return evaluateReleasePolicy({
    gate,
    threshold_snapshot: input.thresholdSnapshot ?? DEFAULT_RELEASE_THRESHOLDS,
  });
}