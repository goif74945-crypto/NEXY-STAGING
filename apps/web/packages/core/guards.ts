import { parseDirective, type Directive } from '../contracts/directive';
import { parseEvidenceBatch, type EvidenceBatch } from '../contracts/evidence';
import {
  parseReleasePolicyResult,
  type ReleasePolicyResult,
} from '../contracts/release-policy';
import { type Role, type SystemState, SystemStateSchema } from '../contracts/state';
import {
  parseReleasePolicyEvaluationRequest,
  type ReleasePolicyEvaluationRequest,
} from '../validation/release-policy.schema';
import { evaluateReleasePolicy } from './release-policy';

export const CoreGuardNameValues = [
  'system_valid',
  'directive_valid',
  'results_exist',
  'evidence_valid',
  'quorum_satisfied',
  'release_policy_passed',
  'release_policy_result_valid',
  'freeze_recovery_allowed',
  'not_in_stop',
] as const;
export type CoreGuardName = (typeof CoreGuardNameValues)[number];

export type GuardPassResult = {
  guard: CoreGuardName;
  passed: true;
  reason: null;
};

export type GuardFailResult = {
  guard: CoreGuardName;
  passed: false;
  reason: string;
};

export type GuardResult = GuardPassResult | GuardFailResult;

export type DirectiveGuardResult =
  | (GuardPassResult & {
      directive: Directive;
    })
  | (GuardFailResult & {
      directive: null;
    });

export type EvidenceGuardResult =
  | (GuardPassResult & {
      evidenceBatch: EvidenceBatch;
    })
  | (GuardFailResult & {
      evidenceBatch: null;
    });

export type ReleasePolicyEvaluationGuardResult =
  | (GuardPassResult & {
      request: ReleasePolicyEvaluationRequest;
      result: ReleasePolicyResult;
    })
  | (GuardFailResult & {
      request: null;
      result: null;
    });

export type ReleasePolicyResultGuardResult =
  | (GuardPassResult & {
      result: ReleasePolicyResult;
    })
  | (GuardFailResult & {
      result: null;
    });

function pass(guard: CoreGuardName): GuardPassResult {
  return {
    guard,
    passed: true,
    reason: null,
  };
}

function fail(guard: CoreGuardName, reason: string): GuardFailResult {
  return {
    guard,
    passed: false,
    reason,
  };
}

export function ensureSystemState(input: unknown): SystemState {
  return SystemStateSchema.parse(input);
}

export function ensureDirectiveValid(input: unknown): Directive {
  return parseDirective(input);
}

export function ensureEvidenceBatchValid(input: unknown): EvidenceBatch {
  return parseEvidenceBatch(input);
}

export function ensureReleasePolicyEvaluationRequestValid(
  input: unknown,
): ReleasePolicyEvaluationRequest {
  return parseReleasePolicyEvaluationRequest(input);
}

export function ensureReleasePolicyResultValid(input: unknown): ReleasePolicyResult {
  return parseReleasePolicyResult(input);
}

export function guardSystemValid(stateInput: unknown): GuardResult {
  try {
    ensureSystemState(stateInput);
    return pass('system_valid');
  } catch {
    return fail('system_valid', 'System state is invalid.');
  }
}

export function guardDirectiveValid(input: unknown): DirectiveGuardResult {
  try {
    const directive = ensureDirectiveValid(input);
    return {
      ...pass('directive_valid'),
      directive,
    };
  } catch {
    return {
      ...fail('directive_valid', 'Directive payload is invalid.'),
      directive: null,
    };
  }
}

export function guardResultsExist(input: unknown): EvidenceGuardResult {
  try {
    const evidenceBatch = ensureEvidenceBatchValid(input);

    if (evidenceBatch.items.length === 0) {
      return {
        ...fail('results_exist', 'Evidence batch contains no items.'),
        evidenceBatch: null,
      };
    }

    return {
      ...pass('results_exist'),
      evidenceBatch,
    };
  } catch {
    return {
      ...fail('results_exist', 'Evidence batch is invalid.'),
      evidenceBatch: null,
    };
  }
}

export function guardEvidenceValid(input: unknown): EvidenceGuardResult {
  try {
    const evidenceBatch = ensureEvidenceBatchValid(input);

    const invalidItem = evidenceBatch.items.find(
      (item) =>
        !item.verified ||
        item.contradicted === true ||
        item.weight.confidence <= 0 ||
        item.weight.integrity <= 0,
    );

    if (invalidItem) {
      return {
        ...fail('evidence_valid', `Evidence item ${invalidItem.id} is not valid for verification.`),
        evidenceBatch: null,
      };
    }

    return {
      ...pass('evidence_valid'),
      evidenceBatch,
    };
  } catch {
    return {
      ...fail('evidence_valid', 'Evidence batch failed structural validation.'),
      evidenceBatch: null,
    };
  }
}

export function guardQuorumSatisfied(quorumCount: number, requiredQuorum: number): GuardResult {
  if (!Number.isInteger(quorumCount) || quorumCount < 0) {
    return fail('quorum_satisfied', 'quorumCount must be a non-negative integer.');
  }

  if (!Number.isInteger(requiredQuorum) || requiredQuorum <= 0) {
    return fail('quorum_satisfied', 'requiredQuorum must be a positive integer.');
  }

  if (quorumCount < requiredQuorum) {
    return fail(
      'quorum_satisfied',
      `Quorum not satisfied: received ${quorumCount}, required ${requiredQuorum}.`,
    );
  }

  return pass('quorum_satisfied');
}

export function guardReleasePolicyPassed(input: unknown): ReleasePolicyEvaluationGuardResult {
  try {
    const request = ensureReleasePolicyEvaluationRequestValid(input);
    const result = evaluateReleasePolicy(request);

    if (!result.passed) {
      return {
        ...fail('release_policy_passed', 'Release policy evaluation did not pass.'),
        request: null,
        result: null,
      };
    }

    return {
      ...pass('release_policy_passed'),
      request,
      result,
    };
  } catch {
    return {
      ...fail('release_policy_passed', 'Release policy evaluation request is invalid.'),
      request: null,
      result: null,
    };
  }
}

export function guardReleasePolicyResultValid(input: unknown): ReleasePolicyResultGuardResult {
  try {
    const result = ensureReleasePolicyResultValid(input);

    return {
      ...pass('release_policy_result_valid'),
      result,
    };
  } catch {
    return {
      ...fail('release_policy_result_valid', 'ReleasePolicyResult payload is invalid.'),
      result: null,
    };
  }
}

export function guardFreezeRecoveryAllowed(stateInput: unknown, actorRoleInput: unknown): GuardResult {
  let state: SystemState;

  try {
    state = ensureSystemState(stateInput);
  } catch {
    return fail('freeze_recovery_allowed', 'System state is invalid.');
  }

  const actorRole = actorRoleInput as Role;

  if (state !== 'FREEZE') {
    return fail('freeze_recovery_allowed', 'Recovery is only allowed from FREEZE.');
  }

  if (actorRole !== 'OWNER' && actorRole !== 'SYSTEM') {
    return fail('freeze_recovery_allowed', 'Only OWNER or SYSTEM can recover from FREEZE.');
  }

  return pass('freeze_recovery_allowed');
}

export function guardNotInStop(stateInput: unknown): GuardResult {
  try {
    const state = ensureSystemState(stateInput);

    if (state === 'STOP') {
      return fail('not_in_stop', 'System is already in STOP.');
    }

    return pass('not_in_stop');
  } catch {
    return fail('not_in_stop', 'System state is invalid.');
  }
}

export function evaluateCoreGuards(input: {
  state: unknown;
  directive?: unknown;
  evidenceBatch?: unknown;
  releasePolicy?: unknown;
  releasePolicyResult?: unknown;
  requestedByRole?: unknown;
  quorumCount?: number;
  requiredQuorum?: number;
}): GuardResult[] {
  const results: GuardResult[] = [];

  results.push(guardSystemValid(input.state));
  results.push(guardNotInStop(input.state));

  if (input.directive !== undefined) {
    const directiveGuard = guardDirectiveValid(input.directive);
    results.push({
      guard: directiveGuard.guard,
      passed: directiveGuard.passed,
      reason: directiveGuard.reason,
    });
  }

  if (input.evidenceBatch !== undefined) {
    const resultsGuard = guardResultsExist(input.evidenceBatch);
    const evidenceGuard = guardEvidenceValid(input.evidenceBatch);

    results.push({
      guard: resultsGuard.guard,
      passed: resultsGuard.passed,
      reason: resultsGuard.reason,
    });
    results.push({
      guard: evidenceGuard.guard,
      passed: evidenceGuard.passed,
      reason: evidenceGuard.reason,
    });
  }

  if (
    typeof input.quorumCount === 'number' &&
    typeof input.requiredQuorum === 'number'
  ) {
    results.push(guardQuorumSatisfied(input.quorumCount, input.requiredQuorum));
  }

  if (input.releasePolicy !== undefined) {
    const releaseGuard = guardReleasePolicyPassed(input.releasePolicy);
    results.push({
      guard: releaseGuard.guard,
      passed: releaseGuard.passed,
      reason: releaseGuard.reason,
    });
  }

  if (input.releasePolicyResult !== undefined) {
    const releasePolicyResultGuard = guardReleasePolicyResultValid(input.releasePolicyResult);
    results.push({
      guard: releasePolicyResultGuard.guard,
      passed: releasePolicyResultGuard.passed,
      reason: releasePolicyResultGuard.reason,
    });
  }

  if (input.requestedByRole !== undefined) {
    results.push(guardFreezeRecoveryAllowed(input.state, input.requestedByRole));
  }

  return results;
}