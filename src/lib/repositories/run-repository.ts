import { z } from 'zod';

import { SessionRoleSchema } from '@/lib/auth/session';
import { AppError } from '@/lib/errors/app-errors';
import {
  AuditRecordSchema,
  buildStateControlAuditRecord,
} from '@/lib/repositories/audit-repository';
import {
  FreezeAuthoritySchema,
  FreezeReasonCodeSchema,
  evaluateFreezeAuthority,
  evaluateKillAuthority,
  evaluateUnfreezeAuthority,
} from '@/lib/run/freeze-policy';
import {
  RunStatusSchema,
  type RunStatus,
  assertRunTransitionAllowed,
} from '@/lib/run/state-machine';
import { OutputClassSchema } from '@/lib/types/output-class';

export const RunRepositoryRecordSchema = z
  .object({
    run_id: z.string().trim().min(1),
    directive_id: z.string().trim().min(1),
    status: RunStatusSchema,
    output_class: OutputClassSchema,
    started_at_epoch_ms: z.number().int().nonnegative(),
    updated_at_epoch_ms: z.number().int().nonnegative(),
    freeze_reason: z.string(),
  })
  .strict();

export const RunStateControlActionSchema = z.enum([
  'freeze',
  'unfreeze',
  'kill',
]);

export const RunStateControlInputSchema = z
  .object({
    run_id: z.string().trim().min(1).max(256),
    action: RunStateControlActionSchema,
    actor_id: z.string().trim().min(1).max(256),
    actor_role: SessionRoleSchema,
    authority_source: FreezeAuthoritySchema,
    reason_code: FreezeReasonCodeSchema,
    controlled_at_epoch_ms: z.number().int().nonnegative(),
    current_status: RunStatusSchema.optional(),
  })
  .strict();

export const RunStateControlResultSchema = z
  .object({
    run: RunRepositoryRecordSchema,
    audit: AuditRecordSchema,
  })
  .strict();

export type RunRepositoryRecord = z.infer<typeof RunRepositoryRecordSchema>;
export type RunStateControlAction = z.infer<typeof RunStateControlActionSchema>;
export type RunStateControlInput = z.infer<typeof RunStateControlInputSchema>;
export type RunStateControlResult = z.infer<
  typeof RunStateControlResultSchema
>;

function buildRunRecords(): RunRepositoryRecord[] {
  return [
    RunRepositoryRecordSchema.parse({
      run_id: 'run_001',
      directive_id: 'directive_001',
      status: 'stable',
      output_class: 'FINAL',
      started_at_epoch_ms: 1_700_000_000_000,
      updated_at_epoch_ms: 1_700_000_010_000,
      freeze_reason: '',
    }),
    RunRepositoryRecordSchema.parse({
      run_id: 'run_002',
      directive_id: 'directive_002',
      status: 'verifying',
      output_class: 'CLEAN',
      started_at_epoch_ms: 1_700_000_020_000,
      updated_at_epoch_ms: 1_700_000_030_000,
      freeze_reason: '',
    }),
  ];
}

function cloneRunRecord(record: RunRepositoryRecord): RunRepositoryRecord {
  return RunRepositoryRecordSchema.parse({
    run_id: record.run_id,
    directive_id: record.directive_id,
    status: record.status,
    output_class: record.output_class,
    started_at_epoch_ms: record.started_at_epoch_ms,
    updated_at_epoch_ms: record.updated_at_epoch_ms,
    freeze_reason: record.freeze_reason,
  });
}

function getNextStatusForAction(action: RunStateControlAction): RunStatus {
  if (action === 'freeze') {
    return 'freeze';
  }

  if (action === 'unfreeze') {
    return 'verifying';
  }

  return 'failed';
}

function getAuditActionForStateControl(
  action: RunStateControlAction,
): 'run_freeze' | 'run_unfreeze' | 'run_kill' {
  if (action === 'freeze') {
    return 'run_freeze';
  }

  if (action === 'unfreeze') {
    return 'run_unfreeze';
  }

  return 'run_kill';
}

function assertAuthority(input: RunStateControlInput): void {
  const decision =
    input.action === 'freeze'
      ? evaluateFreezeAuthority(input)
      : input.action === 'unfreeze'
        ? evaluateUnfreezeAuthority(input)
        : evaluateKillAuthority(input);

  if (!decision.allowed) {
    throw new AppError({
      code: 'FORBIDDEN',
      message: decision.denial_reason ?? 'State-control authority denied.',
      statusCode: 403,
      source: 'run.state-control-policy',
      recoverable: false,
      details: {
        action: decision.action,
        actor_role: decision.actor_role,
        authority_source: decision.authority_source,
        reason_code: decision.reason_code,
      },
    });
  }
}

export function listRuns(): RunRepositoryRecord[] {
  return buildRunRecords().map(cloneRunRecord);
}

export function getRunById(runId: string): RunRepositoryRecord | null {
  const run = buildRunRecords().find((record) => record.run_id === runId);

  return run === undefined ? null : cloneRunRecord(run);
}

export function listRecentRuns(): RunRepositoryRecord[] {
  return buildRunRecords()
    .slice()
    .sort((left, right) => {
      if (left.updated_at_epoch_ms !== right.updated_at_epoch_ms) {
        return right.updated_at_epoch_ms - left.updated_at_epoch_ms;
      }

      return left.run_id.localeCompare(right.run_id);
    })
    .map(cloneRunRecord);
}

export function buildRunStateControlResult(
  input: RunStateControlInput,
): RunStateControlResult {
  const parsed = RunStateControlInputSchema.parse(input);
  const currentRun = getRunById(parsed.run_id);

  if (currentRun === null) {
    throw new AppError({
      code: 'REVISION_NOT_FOUND',
      message: 'Run was not found.',
      statusCode: 404,
      source: 'run.repository',
      recoverable: false,
      details: {
        run_id: parsed.run_id,
      },
    });
  }

  assertAuthority(parsed);

  const previousStatus = parsed.current_status ?? currentRun.status;
  const nextStatus = getNextStatusForAction(parsed.action);

  assertRunTransitionAllowed(previousStatus, nextStatus);

  const run = RunRepositoryRecordSchema.parse({
    run_id: currentRun.run_id,
    directive_id: currentRun.directive_id,
    status: nextStatus,
    output_class: currentRun.output_class,
    started_at_epoch_ms: currentRun.started_at_epoch_ms,
    updated_at_epoch_ms: parsed.controlled_at_epoch_ms,
    freeze_reason:
      nextStatus === 'freeze' || nextStatus === 'failed'
        ? parsed.reason_code
        : '',
  });

  const audit = buildStateControlAuditRecord({
    actor_id: parsed.actor_id,
    action: getAuditActionForStateControl(parsed.action),
    target_id: parsed.run_id,
    created_at_epoch_ms: parsed.controlled_at_epoch_ms,
    reason_code: parsed.reason_code,
    authority_source: parsed.authority_source,
    previous_status: previousStatus,
    next_status: nextStatus,
  });

  return RunStateControlResultSchema.parse({
    run,
    audit,
  });
}

export function freezeRun(
  input: Omit<RunStateControlInput, 'action'>,
): RunStateControlResult {
  return buildRunStateControlResult({
    ...input,
    action: 'freeze',
  });
}

export function unfreezeRun(
  input: Omit<RunStateControlInput, 'action'>,
): RunStateControlResult {
  return buildRunStateControlResult({
    ...input,
    action: 'unfreeze',
  });
}

export function killRun(
  input: Omit<RunStateControlInput, 'action'>,
): RunStateControlResult {
  return buildRunStateControlResult({
    ...input,
    action: 'kill',
  });
}

export function rejectClientRunCreation(): never {
  throw new AppError({
    code: 'PIPELINE_CAP_EXCEEDED',
    message: 'Run creation requires the core pipeline and cannot trust client-provided run records.',
    statusCode: 409,
    source: 'run.repository',
    recoverable: false,
  });
}
