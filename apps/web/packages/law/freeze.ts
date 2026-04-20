import { z } from 'zod';

import { ErrorCodeSchema } from '../contracts/errors';
import {
  BlockingLayerSchema,
  FreezeReasonSchema,
  ReleasePolicyResultSchema,
} from '../contracts/release-policy';
import { RoleSchema, SystemStateSchema } from '../contracts/state';
import {
  guardFreezeRecoveryAllowed,
  guardNotInStop,
  guardReleasePolicyResultValid,
  guardSystemValid,
} from '../core/guards';

export const FreezeRequestSchema = z
  .object({
    state: SystemStateSchema,
    code: ErrorCodeSchema,
    trigger: z.string().trim().min(1).max(4096),
    blocking_layer: BlockingLayerSchema,
    recoverable: z.boolean(),
    primary_incident_id: z.string().trim().min(1).max(128),
  })
  .strict();
export type FreezeRequest = z.infer<typeof FreezeRequestSchema>;

export const FreezeResultSchema = z
  .object({
    state_before: SystemStateSchema,
    state_after: z.literal('FREEZE'),
    freeze_reason: FreezeReasonSchema,
    recoverable: z.boolean(),
  })
  .strict();
export type FreezeResult = z.infer<typeof FreezeResultSchema>;

export const FreezeRecoveryRequestSchema = z
  .object({
    state: SystemStateSchema,
    actor_role: RoleSchema,
  })
  .strict();
export type FreezeRecoveryRequest = z.infer<typeof FreezeRecoveryRequestSchema>;

export const FreezeRecoveryResultSchema = z
  .object({
    allowed: z.boolean(),
    reason: z.string().nullable(),
  })
  .strict();
export type FreezeRecoveryResult = z.infer<typeof FreezeRecoveryResultSchema>;

export const FreezeFromReleasePolicyInputSchema = z
  .object({
    state: SystemStateSchema,
    release_policy_result: ReleasePolicyResultSchema,
  })
  .strict();
export type FreezeFromReleasePolicyInput = z.infer<typeof FreezeFromReleasePolicyInputSchema>;

export function parseFreezeRequest(input: unknown): FreezeRequest {
  return FreezeRequestSchema.parse(input);
}

export function buildFreezeReason(input: FreezeRequest) {
  return FreezeReasonSchema.parse({
    code: input.code,
    trigger: input.trigger,
    blocking_layer: input.blocking_layer,
    recoverable: input.recoverable,
    primary_incident_id: input.primary_incident_id,
  });
}

export function enforceFreeze(input: unknown): FreezeResult {
  const request = parseFreezeRequest(input);

  const systemGuard = guardSystemValid(request.state);
  if (!systemGuard.passed) {
    throw new Error(systemGuard.reason);
  }

  const stopGuard = guardNotInStop(request.state);
  if (!stopGuard.passed) {
    throw new Error(stopGuard.reason);
  }

  return {
    state_before: request.state,
    state_after: 'FREEZE',
    freeze_reason: buildFreezeReason(request),
    recoverable: request.recoverable,
  };
}

export function deriveFreezeFromReleasePolicy(input: unknown): FreezeResult | null {
  const parsed = FreezeFromReleasePolicyInputSchema.parse(input);
  const releaseGuard = guardReleasePolicyResultValid(parsed.release_policy_result);

  if (!releaseGuard.passed || !releaseGuard.result) {
    throw new Error(releaseGuard.reason);
  }

  if (releaseGuard.result.decision !== 'FREEZE' || !releaseGuard.result.freeze_reason) {
    return null;
  }

  const systemGuard = guardSystemValid(parsed.state);
  if (!systemGuard.passed) {
    throw new Error(systemGuard.reason);
  }

  return {
    state_before: parsed.state,
    state_after: 'FREEZE',
    freeze_reason: releaseGuard.result.freeze_reason,
    recoverable: releaseGuard.result.freeze_reason.recoverable,
  };
}

export function evaluateFreezeRecovery(input: unknown): FreezeRecoveryResult {
  const parsed = FreezeRecoveryRequestSchema.parse(input);
  const guard = guardFreezeRecoveryAllowed(parsed.state, parsed.actor_role);

  return {
    allowed: guard.passed,
    reason: guard.reason,
  };
}

export function validateFreezeRequest(input: unknown): boolean {
  return FreezeRequestSchema.safeParse(input).success;
}