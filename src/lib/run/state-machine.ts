import { z } from 'zod';

import { AppError } from '@/lib/errors/app-errors';

export const RunStatusSchema = z.enum([
  'queued',
  'running',
  'verifying',
  'stable',
  'freeze',
  'failed',
  'cancelled',
]);

export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunStateTransitionSchema = z
  .object({
    from_status: RunStatusSchema,
    to_status: RunStatusSchema,
  })
  .strict();

export type RunStateTransition = z.infer<typeof RunStateTransitionSchema>;

const ALLOWED_TRANSITIONS: Record<RunStatus, readonly RunStatus[]> = {
  queued: ['running', 'freeze', 'failed', 'cancelled'],
  running: ['verifying', 'freeze', 'failed', 'cancelled'],
  verifying: ['stable', 'freeze', 'failed', 'cancelled'],
  stable: ['freeze', 'failed'],
  freeze: ['verifying', 'failed'],
  failed: [],
  cancelled: [],
};

export function canTransitionRunStatus(
  fromStatus: RunStatus,
  toStatus: RunStatus,
): boolean {
  const from_status = RunStatusSchema.parse(fromStatus);
  const to_status = RunStatusSchema.parse(toStatus);

  return ALLOWED_TRANSITIONS[from_status].includes(to_status);
}

export function assertRunTransitionAllowed(
  fromStatus: RunStatus,
  toStatus: RunStatus,
): RunStateTransition {
  const transition = RunStateTransitionSchema.parse({
    from_status: fromStatus,
    to_status: toStatus,
  });

  if (!canTransitionRunStatus(transition.from_status, transition.to_status)) {
    throw new AppError({
      code: 'STATE_TRANSITION_DENIED',
      message: 'Run state transition is not allowed.',
      statusCode: 409,
      source: 'run.state-machine',
      recoverable: false,
      details: {
        from_status: transition.from_status,
        to_status: transition.to_status,
      },
    });
  }

  return transition;
}
