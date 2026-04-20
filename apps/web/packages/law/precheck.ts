import { z } from 'zod';

import { DirectiveSchema } from '../contracts/directive';
import { ErrorCodeSchema } from '../contracts/errors';
import { RoleSchema, SystemStateSchema } from '../contracts/state';
import {
  CoreGuardNameValues,
  ensureDirectiveValid,
  ensureSystemState,
  guardDirectiveValid,
  guardNotInStop,
  guardSystemValid,
} from '../core/guards';

export const PrecheckInputSchema = z
  .object({
    state: z.unknown(),
    directive: z.unknown(),
    requested_by_role: RoleSchema.optional(),
  })
  .strict();
export type PrecheckInput = z.infer<typeof PrecheckInputSchema>;

export const PrecheckCheckSchema = z
  .object({
    guard: z.enum(CoreGuardNameValues),
    passed: z.boolean(),
    reason: z.string().nullable(),
  })
  .strict();
export type PrecheckCheck = z.infer<typeof PrecheckCheckSchema>;

export const PrecheckFailureCodeSchema = z.array(ErrorCodeSchema);
export type PrecheckFailureCode = z.infer<typeof ErrorCodeSchema>;
export type PrecheckFailureCodes = z.infer<typeof PrecheckFailureCodeSchema>;

export const PrecheckResultSchema = z
  .object({
    passed: z.boolean(),
    normalized_state: SystemStateSchema.nullable(),
    normalized_directive: DirectiveSchema.nullable(),
    checks: z.array(PrecheckCheckSchema),
    failure_codes: PrecheckFailureCodeSchema,
  })
  .strict();
export type PrecheckResult = z.infer<typeof PrecheckResultSchema>;

function mapGuardToFailureCode(guard: z.infer<z.ZodEnum<typeof CoreGuardNameValues>>): PrecheckFailureCode {
  switch (guard) {
    case 'system_valid':
    case 'not_in_stop':
      return 'INVALID_STATE';
    case 'directive_valid':
      return 'INVALID_DIRECTIVE';
    case 'results_exist':
    case 'evidence_valid':
      return 'EVIDENCE_MISSING';
    case 'quorum_satisfied':
      return 'CONSENSUS_FAILED';
    case 'release_policy_passed':
    case 'release_policy_result_valid':
      return 'RELEASE_POLICY_FAILED';
    case 'freeze_recovery_allowed':
      return 'FREEZE_RECOVERY_DENIED';
  }
}

export function parsePrecheckInput(input: unknown): PrecheckInput {
  return PrecheckInputSchema.parse(input);
}

export function runPrecheck(input: unknown): PrecheckResult {
  const parsed = parsePrecheckInput(input);

  const systemGuard = guardSystemValid(parsed.state);
  const stopGuard = guardNotInStop(parsed.state);
  const directiveGuard = guardDirectiveValid(parsed.directive);

  const checks: PrecheckCheck[] = [
    {
      guard: systemGuard.guard,
      passed: systemGuard.passed,
      reason: systemGuard.reason,
    },
    {
      guard: stopGuard.guard,
      passed: stopGuard.passed,
      reason: stopGuard.reason,
    },
    {
      guard: directiveGuard.guard,
      passed: directiveGuard.passed,
      reason: directiveGuard.reason,
    },
  ];

  const failure_codes = checks
    .filter((check) => !check.passed)
    .map((check) => mapGuardToFailureCode(check.guard));

  const normalized_state = systemGuard.passed ? ensureSystemState(parsed.state) : null;
  const normalized_directive = directiveGuard.passed
    ? ensureDirectiveValid(parsed.directive)
    : null;

  return {
    passed: failure_codes.length === 0,
    normalized_state,
    normalized_directive,
    checks,
    failure_codes,
  };
}

export function assertPrecheckPasses(input: unknown): PrecheckResult {
  const result = runPrecheck(input);

  if (!result.passed) {
    throw new Error(
      `Precheck failed: ${result.failure_codes.join(', ') || 'UNKNOWN_PRECHECK_FAILURE'}`,
    );
  }

  return result;
}

export function validatePrecheckInput(input: unknown): boolean {
  return PrecheckInputSchema.safeParse(input).success;
}