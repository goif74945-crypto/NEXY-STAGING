import type { Directive } from '../contracts/directive';
import type { EvidenceBatch } from '../contracts/evidence';
import type { ReleasePolicyResult } from '../contracts/release-policy';
import type { Role, SystemState } from '../contracts/state';
import {
  ensureDirectiveValid,
  ensureEvidenceBatchValid,
  evaluateCoreGuards,
  type GuardResult,
} from './guards';
import { evaluateReleasePolicyFromEvidence } from './release-policy';
import { transitionSystemState } from './state-machine';

export type OrchestratorInput = {
  currentState: SystemState;
  directive: unknown;
  evidenceBatch?: unknown;
  quorumCount?: number;
  confidence?: number;
  deterministicMatchScore?: number;
  actorRole?: Role;
};

export type OrchestratorResult = {
  state_before: SystemState;
  state_after: SystemState;
  directive: Directive;
  evidence_batch?: EvidenceBatch;
  release_policy_result?: ReleasePolicyResult;
  guard_results: GuardResult[];
};

function deriveDefaultQuorumCount(evidenceBatch: EvidenceBatch): number {
  return evidenceBatch.items.length;
}

export function orchestrateDirective(input: OrchestratorInput): OrchestratorResult {
  const guardResults: GuardResult[] = [];
  const directive = ensureDirectiveValid(input.directive);

  let workingState: SystemState = input.currentState;

  guardResults.push(...evaluateCoreGuards({ state: workingState, directive }));

  if (workingState === 'INIT') {
    workingState = transitionSystemState(workingState, { type: 'BOOT' });
  }

  if (workingState === 'READY') {
    workingState = transitionSystemState(workingState, {
      type: 'EXECUTE',
      directive,
    });
  }

  let evidenceBatch: EvidenceBatch | undefined;
  let releasePolicyResult: ReleasePolicyResult | undefined;

  if (input.evidenceBatch !== undefined) {
    evidenceBatch = ensureEvidenceBatchValid(input.evidenceBatch);

    guardResults.push(...evaluateCoreGuards({ state: workingState, evidenceBatch }));

    if (workingState === 'RUNNING') {
      workingState = transitionSystemState(workingState, {
        type: 'AGENTS_DONE',
        evidenceBatch,
      });
    }

    if (workingState === 'VERIFYING') {
      workingState = transitionSystemState(workingState, {
        type: 'VERIFIED',
        evidenceBatch,
      });
    }

    if (workingState === 'CONSENSUS') {
      releasePolicyResult = evaluateReleasePolicyFromEvidence({
        evidenceBatch,
        quorumCount:
          typeof input.quorumCount === 'number'
            ? input.quorumCount
            : deriveDefaultQuorumCount(evidenceBatch),
        confidence: input.confidence,
        deterministicMatchScore: input.deterministicMatchScore,
      });

      guardResults.push(
        ...evaluateCoreGuards({
          state: workingState,
          releasePolicy: {
            gate: {
              confidence:
                typeof input.confidence === 'number'
                  ? input.confidence
                  : releasePolicyResult.threshold_snapshot.confidence_min,
              deterministic_match_score:
                typeof input.deterministicMatchScore === 'number'
                  ? input.deterministicMatchScore
                  : releasePolicyResult.threshold_snapshot.deterministic_match_min,
              quorum_count:
                typeof input.quorumCount === 'number'
                  ? input.quorumCount
                  : deriveDefaultQuorumCount(evidenceBatch),
              evidence_count: evidenceBatch.items.length,
            },
            threshold_snapshot: releasePolicyResult.threshold_snapshot,
          },
          quorumCount:
            typeof input.quorumCount === 'number'
              ? input.quorumCount
              : deriveDefaultQuorumCount(evidenceBatch),
          requiredQuorum: releasePolicyResult.threshold_snapshot.quorum_min,
        }),
      );

      if (releasePolicyResult.decision === 'ACCEPT') {
        workingState = transitionSystemState(workingState, {
          type: 'ACCEPTED',
          releasePolicyResult,
        });
      } else {
        workingState = transitionSystemState(workingState, {
          type: 'REJECTED',
          releasePolicyResult,
        });
      }
    }
  }

  return {
    state_before: input.currentState,
    state_after: workingState,
    directive,
    ...(evidenceBatch ? { evidence_batch: evidenceBatch } : {}),
    ...(releasePolicyResult ? { release_policy_result: releasePolicyResult } : {}),
    guard_results: guardResults,
  };
}