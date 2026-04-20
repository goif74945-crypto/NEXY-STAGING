import { z } from 'zod';

import { ConsensusVoteSchema, type ConsensusResult } from '../contracts/consensus';
import { DirectiveSchema, type Directive } from '../contracts/directive';
import { EvidenceBatchSchema, type EvidenceBatch } from '../contracts/evidence';
import { type ErrorCode } from '../contracts/errors';
import {
  DEFAULT_RELEASE_THRESHOLDS,
  ReleaseThresholdSnapshotSchema,
  type ReleasePolicyResult,
  type ReleaseThresholdSnapshot,
} from '../contracts/release-policy';
import {
  RoleSchema,
  SystemStateSchema,
  TimestampIsoSchema,
  type Role,
  type SystemState,
} from '../contracts/state';
import { evaluateCoreGuards, type GuardResult } from '../core/guards';
import { parseDirectiveCreateRequest } from '../validation/directive.schema';
import { parseEvidenceBatchResponse } from '../validation/evidence.schema';
import { parseReleasePolicyEvaluationRequest } from '../validation/release-policy.schema';
import { evaluateConsensus, type ConsensusEvaluation } from '../judge/consensus';
import { deriveFreezeFromReleasePolicy, enforceFreeze, type FreezeResult } from '../law/freeze';
import { runPrecheck, type PrecheckResult } from '../law/precheck';
import { runPrerelease, type PrereleaseResult } from '../law/prerelease';

export const SwarmPipelineInputSchema = z
  .object({
    current_state: SystemStateSchema,
    directive: DirectiveSchema,
    evidence_batch: EvidenceBatchSchema,
    votes: z.array(ConsensusVoteSchema).min(1),
    reference_time: TimestampIsoSchema,
    actor_role: RoleSchema.default('SYSTEM'),
    threshold_snapshot: ReleaseThresholdSnapshotSchema.default(DEFAULT_RELEASE_THRESHOLDS),
    output: z.string().optional(),
    excluded_agents: z.array(z.string().trim().min(1).max(128)).default([]),
  })
  .strict();
export type SwarmPipelineInput = z.infer<typeof SwarmPipelineInputSchema>;

export const SwarmPipelineStageValues = ['PRECHECK', 'CONSENSUS', 'PRERELEASE', 'FREEZE', 'STABLE'] as const;
export const SwarmPipelineStageSchema = z.enum(SwarmPipelineStageValues);
export type SwarmPipelineStage = z.infer<typeof SwarmPipelineStageSchema>;

export const SwarmPipelineResultSchema = z
  .object({
    stage: SwarmPipelineStageSchema,
    state_before: SystemStateSchema,
    state_after: SystemStateSchema,
    directive: DirectiveSchema,
    evidence_batch: EvidenceBatchSchema,
    precheck: z.unknown(),
    guard_results: z.array(z.unknown()),
    consensus: z.unknown().nullable(),
    prerelease: z.unknown().nullable(),
    freeze: z.unknown().nullable(),
    final_consensus_result: z.unknown().nullable(),
    final_release_policy_result: z.unknown().nullable(),
  })
  .strict();
export type SwarmPipelineResult = {
  stage: SwarmPipelineStage;
  state_before: SystemState;
  state_after: SystemState;
  directive: Directive;
  evidence_batch: EvidenceBatch;
  precheck: PrecheckResult;
  guard_results: GuardResult[];
  consensus: ConsensusEvaluation | null;
  prerelease: PrereleaseResult | null;
  freeze: FreezeResult | null;
  final_consensus_result: ConsensusResult | null;
  final_release_policy_result: ReleasePolicyResult | null;
};

function buildPrecheckFreeze(
  state: SystemState,
  directive: Directive,
  precheck: PrecheckResult,
): FreezeResult {
  const code: ErrorCode = precheck.failure_codes[0] ?? 'INVALID_STATE';

  return enforceFreeze({
    state,
    code,
    trigger: `Precheck failed for directive ${directive.id}: ${precheck.failure_codes.join(', ') || 'UNKNOWN_PRECHECK_FAILURE'}`,
    blocking_layer: 'LAW',
    recoverable: true,
    primary_incident_id: `swarm-precheck:${directive.id}`,
  });
}

function buildConsensusFreeze(
  state: SystemState,
  directive: Directive,
  consensus: ConsensusEvaluation,
): FreezeResult {
  const freezeFromPolicy = deriveFreezeFromReleasePolicy({
    state,
    release_policy_result: consensus.release_policy_result,
  });

  if (freezeFromPolicy) {
    return freezeFromPolicy;
  }

  return enforceFreeze({
    state,
    code: 'RELEASE_POLICY_FAILED',
    trigger: consensus.result.decision_reason,
    blocking_layer: 'JUDGE',
    recoverable: true,
    primary_incident_id: `swarm-consensus:${directive.id}`,
  });
}

function buildPrereleaseFreeze(
  state: SystemState,
  directive: Directive,
  prerelease: PrereleaseResult,
): FreezeResult {
  if (prerelease.freeze_reason) {
    return enforceFreeze({
      state,
      code: prerelease.freeze_reason.code,
      trigger: prerelease.freeze_reason.trigger,
      blocking_layer: prerelease.freeze_reason.blocking_layer,
      recoverable: prerelease.freeze_reason.recoverable,
      primary_incident_id: prerelease.freeze_reason.primary_incident_id,
    });
  }

  return enforceFreeze({
    state,
    code: prerelease.blocking_codes[0] ?? 'RELEASE_POLICY_FAILED',
    trigger: `Prerelease failed for directive ${directive.id}: ${prerelease.blocking_codes.join(', ') || 'UNKNOWN_PRERELEASE_FAILURE'}`,
    blocking_layer: 'LAW',
    recoverable: true,
    primary_incident_id: `swarm-prerelease:${directive.id}`,
  });
}

function collectGuardResults(
  currentState: SystemState,
  directive: Directive,
  evidenceBatch: EvidenceBatch,
  thresholdSnapshot: ReleaseThresholdSnapshot,
  actorRole: Role,
  releasePolicyResult?: ReleasePolicyResult,
): GuardResult[] {
  return evaluateCoreGuards({
    state: currentState,
    directive,
    evidenceBatch,
    releasePolicyResult,
    requestedByRole: actorRole,
    quorumCount: evidenceBatch.items.length,
    requiredQuorum: thresholdSnapshot.quorum_min,
  });
}

export function parseSwarmPipelineInput(input: unknown): SwarmPipelineInput {
  return SwarmPipelineInputSchema.parse(input);
}

export function runSwarmPipeline(input: unknown): SwarmPipelineResult {
  const parsed = parseSwarmPipelineInput(input);

  const directive = parseDirectiveCreateRequest(parsed.directive);
  const evidenceBatch = parseEvidenceBatchResponse({
    data: parsed.evidence_batch,
  }).data;

  const precheck = runPrecheck({
    state: parsed.current_state,
    directive,
    requested_by_role: parsed.actor_role,
  });

  const initialGuardResults = collectGuardResults(
    parsed.current_state,
    directive,
    evidenceBatch,
    parsed.threshold_snapshot,
    parsed.actor_role,
  );

  if (!precheck.passed) {
    const freeze = buildPrecheckFreeze(parsed.current_state, directive, precheck);

    return {
      stage: 'FREEZE',
      state_before: parsed.current_state,
      state_after: freeze.state_after,
      directive,
      evidence_batch: evidenceBatch,
      precheck,
      guard_results: initialGuardResults,
      consensus: null,
      prerelease: null,
      freeze,
      final_consensus_result: null,
      final_release_policy_result: null,
    };
  }

  const consensus = evaluateConsensus({
    evidence_batch: evidenceBatch,
    votes: parsed.votes,
    reference_time: parsed.reference_time,
    threshold_snapshot: parsed.threshold_snapshot,
    ...(parsed.output ? { output: parsed.output } : {}),
    excluded_agents: parsed.excluded_agents,
  });

  const releasePolicyRequest = parseReleasePolicyEvaluationRequest({
    gate: {
      confidence: consensus.result.confidence,
      deterministic_match_score: consensus.result.deterministic_match_score,
      quorum_count: consensus.quorum.participating_count,
      evidence_count: evidenceBatch.items.length,
    },
    threshold_snapshot: parsed.threshold_snapshot,
  });

  const prerelease = runPrerelease({
    evidence_batch: evidenceBatch,
    quorum_count: releasePolicyRequest.gate.quorum_count,
    confidence: releasePolicyRequest.gate.confidence,
    deterministic_match_score: releasePolicyRequest.gate.deterministic_match_score,
    threshold_snapshot: parsed.threshold_snapshot,
  });

  const resolvedGuardResults = collectGuardResults(
    parsed.current_state,
    directive,
    evidenceBatch,
    parsed.threshold_snapshot,
    parsed.actor_role,
    consensus.release_policy_result,
  );

  if (consensus.result.decision === 'FREEZE') {
    const freeze = buildConsensusFreeze(parsed.current_state, directive, consensus);

    return {
      stage: 'FREEZE',
      state_before: parsed.current_state,
      state_after: freeze.state_after,
      directive,
      evidence_batch: evidenceBatch,
      precheck,
      guard_results: resolvedGuardResults,
      consensus,
      prerelease,
      freeze,
      final_consensus_result: consensus.result,
      final_release_policy_result: consensus.release_policy_result,
    };
  }

  if (!prerelease.passed) {
    const freeze = buildPrereleaseFreeze(parsed.current_state, directive, prerelease);

    return {
      stage: 'FREEZE',
      state_before: parsed.current_state,
      state_after: freeze.state_after,
      directive,
      evidence_batch: evidenceBatch,
      precheck,
      guard_results: resolvedGuardResults,
      consensus,
      prerelease,
      freeze,
      final_consensus_result: consensus.result,
      final_release_policy_result: prerelease.release_policy_result,
    };
  }

  return {
    stage: 'STABLE',
    state_before: parsed.current_state,
    state_after: 'STABLE',
    directive,
    evidence_batch: evidenceBatch,
    precheck,
    guard_results: resolvedGuardResults,
    consensus,
    prerelease,
    freeze: null,
    final_consensus_result: consensus.result,
    final_release_policy_result: prerelease.release_policy_result,
  };
}

export function validateSwarmPipelineInput(input: unknown): boolean {
  return SwarmPipelineInputSchema.safeParse(input).success;
}