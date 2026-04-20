import { z } from 'zod';

import {
  type ConsensusBatch,
  type ConsensusDecision,
  type ConsensusResult,
  type ConsensusVote,
  ConsensusBatchSchema,
  ConsensusResultSchema,
  ConsensusThresholdUsedSchema,
  ConsensusVoteSchema,
} from '../contracts/consensus';
import { type EvidenceBatch, EvidenceBatchSchema } from '../contracts/evidence';
import {
  DEFAULT_RELEASE_THRESHOLDS,
  type ReleasePolicyResult,
  type ReleaseThresholdSnapshot,
  ReleasePolicyResultSchema,
  ReleaseThresholdSnapshotSchema,
} from '../contracts/release-policy';
import { TimestampIsoSchema } from '../contracts/state';
import { guardEvidenceValid } from '../core/guards';
import { evaluateReleasePolicyFromEvidence } from '../core/release-policy';
import { QuorumTallySchema, tallyQuorum, type QuorumTally } from './quorum';
import {
  EvidenceScoreBatchSchema,
  scoreEvidenceBatch,
  type EvidenceScoreBatch,
} from './scoring';

export const ConsensusInputSchema = z
  .object({
    evidence_batch: EvidenceBatchSchema,
    votes: z.array(ConsensusVoteSchema),
    threshold_snapshot: ReleaseThresholdSnapshotSchema.default(DEFAULT_RELEASE_THRESHOLDS),
    reference_time: TimestampIsoSchema,
    output: z.string().optional(),
    excluded_agents: z.array(z.string().trim().min(1).max(128)).default([]),
  })
  .strict();
export type ConsensusInput = z.infer<typeof ConsensusInputSchema>;

export const ConsensusEvaluationSchema = z
  .object({
    scoring: EvidenceScoreBatchSchema,
    quorum: QuorumTallySchema,
    release_policy_result: ReleasePolicyResultSchema,
    result: ConsensusResultSchema,
  })
  .strict();
export type ConsensusEvaluation = z.infer<typeof ConsensusEvaluationSchema>;

function toUniqueAgentIds(agentIds: readonly string[]): string[] {
  return [...new Set(agentIds)];
}

function buildConflictReport(
  supportVotes: readonly ConsensusVote[],
  oppositionVotes: readonly ConsensusVote[],
): ConsensusResult['conflict_report'] {
  if (supportVotes.length === 0 || oppositionVotes.length === 0) {
    return undefined;
  }

  return {
    conflicting_agents: toUniqueAgentIds([
      ...supportVotes.map((vote) => vote.agent_id),
      ...oppositionVotes.map((vote) => vote.agent_id),
    ]),
    reason: 'Consensus contains both support and opposition votes.',
  };
}

function buildDecision(
  evidenceGuardPassed: boolean,
  quorum: QuorumTally,
  releasePolicyResult: ReleasePolicyResult,
): ConsensusDecision {
  if (!evidenceGuardPassed) {
    return 'FREEZE';
  }

  if (!quorum.quorum_satisfied) {
    return 'FREEZE';
  }

  if (releasePolicyResult.decision === 'FREEZE') {
    return 'FREEZE';
  }

  if (releasePolicyResult.passed && releasePolicyResult.accepted && quorum.majority_support) {
    return 'ACCEPT';
  }

  return 'REJECT';
}

function buildDecisionReason(
  evidenceGuardReason: string | null,
  decision: ConsensusDecision,
  quorum: QuorumTally,
  releasePolicyResult: ReleasePolicyResult,
): string {
  if (decision === 'FREEZE' && evidenceGuardReason) {
    return evidenceGuardReason;
  }

  if (decision === 'FREEZE' && !quorum.quorum_satisfied) {
    return `Quorum not satisfied: received ${quorum.participating_count}, required ${quorum.required_quorum}.`;
  }

  if (decision === 'FREEZE' && releasePolicyResult.freeze_reason) {
    return releasePolicyResult.freeze_reason.trigger;
  }

  if (decision === 'ACCEPT') {
    return 'Consensus accepted with passed release policy and majority support.';
  }

  return 'Consensus rejected due to failed release policy or insufficient majority support.';
}

function buildFreezeContract(
  decision: ConsensusDecision,
  evidenceGuardReason: string | null,
  quorum: QuorumTally,
  releasePolicyResult: ReleasePolicyResult,
): ConsensusResult['freeze'] {
  if (decision !== 'FREEZE') {
    return {
      should_freeze: false,
    };
  }

  if (evidenceGuardReason) {
    return {
      should_freeze: true,
      freeze_code: 'evidence_validation_failed',
      reason: evidenceGuardReason,
    };
  }

  if (!quorum.quorum_satisfied) {
    return {
      should_freeze: true,
      freeze_code: 'quorum_not_satisfied',
      reason: `Required quorum ${quorum.required_quorum} was not satisfied by ${quorum.participating_count} participating agents.`,
    };
  }

  if (releasePolicyResult.freeze_reason) {
    return {
      should_freeze: true,
      freeze_code: releasePolicyResult.freeze_reason.code,
      reason: releasePolicyResult.freeze_reason.trigger,
    };
  }

  return {
    should_freeze: true,
    freeze_code: 'consensus_frozen',
    reason: 'Consensus entered FREEZE without a more specific freeze reason.',
  };
}

function buildThresholdUsed(
  thresholdSnapshot: ReleaseThresholdSnapshot,
): z.infer<typeof ConsensusThresholdUsedSchema> {
  return {
    confidence_min: thresholdSnapshot.confidence_min,
    deterministic_match_min: thresholdSnapshot.deterministic_match_min,
    quorum_min: thresholdSnapshot.quorum_min,
  };
}

export function evaluateConsensus(input: unknown): ConsensusEvaluation {
  const parsed: ConsensusInput = ConsensusInputSchema.parse(input);
  const evidenceBatch: EvidenceBatch = parsed.evidence_batch;

  const evidenceGuard = guardEvidenceValid(evidenceBatch);
  const scoring = scoreEvidenceBatch({
    evidence_batch: evidenceBatch,
    reference_time: parsed.reference_time,
  });
  const thresholdUsed = buildThresholdUsed(parsed.threshold_snapshot);
  const quorum = tallyQuorum({
    votes: parsed.votes,
    threshold_used: thresholdUsed,
  });

  const releasePolicyResult = evaluateReleasePolicyFromEvidence({
    evidenceBatch,
    quorumCount: quorum.participating_count,
    confidence: scoring.aggregate_score,
    deterministicMatchScore: Math.min(
      scoring.average_integrity,
      scoring.average_relevance,
    ),
    thresholdSnapshot: parsed.threshold_snapshot,
  });

  const decision = buildDecision(evidenceGuard.passed, quorum, releasePolicyResult);
  const supportVotes = parsed.votes.filter((vote) => vote.vote === 'SUPPORT');
  const oppositionVotes = parsed.votes.filter((vote) => vote.vote === 'OPPOSE');

  const participatingAgents = toUniqueAgentIds([
    ...quorum.supporting_agents,
    ...quorum.opposing_agents,
    ...quorum.abstaining_agents,
  ]);

  const excludedAgents = parsed.excluded_agents.filter(
    (agentId) => !participatingAgents.includes(agentId),
  );

  const result: ConsensusResult = ConsensusResultSchema.parse({
    accepted: decision === 'ACCEPT',
    releaseable: decision === 'ACCEPT' && releasePolicyResult.releaseable,
    ...(parsed.output ? { output: parsed.output } : {}),
    confidence: scoring.aggregate_score,
    deterministic_match_score: Math.min(
      scoring.average_integrity,
      scoring.average_relevance,
    ),
    participating_agents: participatingAgents,
    excluded_agents: excludedAgents,
    evidence: evidenceBatch.items,
    threshold_used: thresholdUsed,
    decision_reason: buildDecisionReason(
      evidenceGuard.passed ? null : evidenceGuard.reason,
      decision,
      quorum,
      releasePolicyResult,
    ),
    ...(supportVotes.length > 0 && oppositionVotes.length > 0
      ? { conflict_report: buildConflictReport(supportVotes, oppositionVotes) }
      : {}),
    decision,
    support: {
      count: supportVotes.length,
      votes: supportVotes,
    },
    opposition: {
      count: oppositionVotes.length,
      votes: oppositionVotes,
    },
    freeze: buildFreezeContract(
      decision,
      evidenceGuard.passed ? null : evidenceGuard.reason,
      quorum,
      releasePolicyResult,
    ),
  });

  return {
    scoring,
    quorum,
    release_policy_result: releasePolicyResult,
    result,
  };
}

export function buildConsensusBatch(input: unknown): ConsensusBatch {
  const parsed = ConsensusInputSchema.parse(input);
  const evaluation = evaluateConsensus(parsed);

  return ConsensusBatchSchema.parse({
    evidence_batch: parsed.evidence_batch,
    result: evaluation.result,
  });
}

export function parseConsensusInput(input: unknown): ConsensusInput {
  return ConsensusInputSchema.parse(input);
}

export function parseConsensusEvaluation(input: unknown): ConsensusEvaluation {
  return ConsensusEvaluationSchema.parse(input);
}

export function validateConsensusInput(input: unknown): boolean {
  return ConsensusInputSchema.safeParse(input).success;
}