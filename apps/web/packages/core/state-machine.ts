import type { Directive } from '../contracts/directive';
import type { EvidenceBatch } from '../contracts/evidence';
import type { ReleasePolicyResult } from '../contracts/release-policy';
import { type Role, type SystemState, SystemStateSchema } from '../contracts/state';
import {
  ensureDirectiveValid,
  ensureEvidenceBatchValid,
  guardFreezeRecoveryAllowed,
  guardReleasePolicyResultValid,
  guardResultsExist,
  guardSystemValid,
} from './guards';

export const CoreStateMachineEventTypeValues = [
  'BOOT',
  'EXECUTE',
  'AGENTS_DONE',
  'VERIFIED',
  'ACCEPTED',
  'REJECTED',
  'ERROR',
  'RECOVER',
  'FATAL',
] as const;
export type CoreStateMachineEventType = (typeof CoreStateMachineEventTypeValues)[number];

export type CoreStateMachineEvent =
  | { type: 'BOOT' }
  | { type: 'EXECUTE'; directive: unknown }
  | { type: 'AGENTS_DONE'; evidenceBatch: unknown }
  | { type: 'VERIFIED'; evidenceBatch: unknown }
  | { type: 'ACCEPTED'; releasePolicyResult: unknown }
  | { type: 'REJECTED'; releasePolicyResult: unknown }
  | { type: 'ERROR'; reason: string }
  | { type: 'RECOVER'; actorRole: unknown }
  | { type: 'FATAL'; reason: string };

export type TransitionResult =
  | {
      allowed: true;
      from: SystemState;
      to: SystemState;
      event: CoreStateMachineEventType;
    }
  | {
      allowed: false;
      from: SystemState;
      event: CoreStateMachineEventType;
      reason: string;
    };

function toSystemState(input: unknown): SystemState {
  return SystemStateSchema.parse(input);
}

function expectDirective(input: unknown): Directive {
  return ensureDirectiveValid(input);
}

function expectEvidenceBatch(input: unknown): EvidenceBatch {
  return ensureEvidenceBatchValid(input);
}

function expectReleasePolicyResult(input: unknown): ReleasePolicyResult {
  const guard = guardReleasePolicyResultValid(input);

  if (!guard.passed || !guard.result) {
    throw new Error(guard.reason);
  }

  return guard.result;
}

function toRole(input: unknown): Role {
  if (
    input === 'OWNER' ||
    input === 'OPERATOR' ||
    input === 'AUDITOR' ||
    input === 'SYSTEM' ||
    input === 'PUBLIC_USER'
  ) {
    return input;
  }

  throw new Error('Invalid actor role for recovery event.');
}

export function canTransitionSystemState(
  stateInput: unknown,
  event: CoreStateMachineEvent,
): TransitionResult {
  const state = toSystemState(stateInput);

  if (!guardSystemValid(state).passed && event.type !== 'FATAL') {
    return {
      allowed: false,
      from: state,
      event: event.type,
      reason: 'System state is not valid for transition.',
    };
  }

  switch (event.type) {
    case 'BOOT': {
      if (state !== 'INIT') {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'BOOT is only allowed from INIT.',
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'READY',
        event: event.type,
      };
    }

    case 'EXECUTE': {
      expectDirective(event.directive);

      if (state !== 'READY') {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'EXECUTE is only allowed from READY.',
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'RUNNING',
        event: event.type,
      };
    }

    case 'AGENTS_DONE': {
      const resultGuard = guardResultsExist(event.evidenceBatch);

      if (!resultGuard.passed) {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: resultGuard.reason,
        };
      }

      if (state !== 'RUNNING') {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'AGENTS_DONE is only allowed from RUNNING.',
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'VERIFYING',
        event: event.type,
      };
    }

    case 'VERIFIED': {
      const evidenceBatch = expectEvidenceBatch(event.evidenceBatch);

      if (evidenceBatch.items.length === 0) {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'VERIFIED requires at least one evidence item.',
        };
      }

      if (state !== 'VERIFYING') {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'VERIFIED is only allowed from VERIFYING.',
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'CONSENSUS',
        event: event.type,
      };
    }

    case 'ACCEPTED': {
      const releasePolicyResult = expectReleasePolicyResult(event.releasePolicyResult);

      if (!releasePolicyResult.passed || !releasePolicyResult.accepted) {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'ACCEPTED requires ReleasePolicyResult with passed=true and accepted=true.',
        };
      }

      if (
        releasePolicyResult.decision !== 'ACCEPT' &&
        releasePolicyResult.decision !== 'RELEASEABLE'
      ) {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'ACCEPTED requires decision ACCEPT or RELEASEABLE.',
        };
      }

      if (state !== 'CONSENSUS') {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'ACCEPTED is only allowed from CONSENSUS.',
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'STABLE',
        event: event.type,
      };
    }

    case 'REJECTED': {
      const releasePolicyResult = expectReleasePolicyResult(event.releasePolicyResult);

      if (releasePolicyResult.passed || releasePolicyResult.accepted) {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'REJECTED requires ReleasePolicyResult with passed=false and accepted=false.',
        };
      }

      if (
        releasePolicyResult.decision !== 'REJECT' &&
        releasePolicyResult.decision !== 'FREEZE'
      ) {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'REJECTED requires decision REJECT or FREEZE.',
        };
      }

      if (state !== 'CONSENSUS') {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'REJECTED is only allowed from CONSENSUS.',
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'FREEZE',
        event: event.type,
      };
    }

    case 'ERROR': {
      if (state === 'STOP') {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'ERROR cannot transition from STOP.',
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'FREEZE',
        event: event.type,
      };
    }

    case 'RECOVER': {
      const actorRole = toRole(event.actorRole);
      const recoveryGuard = guardFreezeRecoveryAllowed(state, actorRole);

      if (!recoveryGuard.passed) {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: recoveryGuard.reason,
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'READY',
        event: event.type,
      };
    }

    case 'FATAL': {
      if (state !== 'FREEZE') {
        return {
          allowed: false,
          from: state,
          event: event.type,
          reason: 'FATAL is only allowed from FREEZE.',
        };
      }

      return {
        allowed: true,
        from: state,
        to: 'STOP',
        event: event.type,
      };
    }
  }
}

export function transitionSystemState(
  stateInput: unknown,
  event: CoreStateMachineEvent,
): SystemState {
  const result = canTransitionSystemState(stateInput, event);

  if (!result.allowed) {
    throw new Error(result.reason);
  }

  return result.to;
}​