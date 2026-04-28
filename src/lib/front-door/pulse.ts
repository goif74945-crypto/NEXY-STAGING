import { z } from 'zod';

export const PulseSchema = z
  .object({
    active_sessions: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
    total_runs: z.number().int().nonnegative(),
  })
  .strict();

export type Pulse = z.infer<typeof PulseSchema>;

export function parsePulse(input: unknown): Pulse {
  return PulseSchema.parse(input);
}

export function buildPulse(input: {
  active_sessions: number;
  open_incidents: number;
  queued_jobs: number;
  running_jobs: number;
  total_runs: number;
}): Pulse {
  return PulseSchema.parse({
    active_sessions: input.active_sessions,
    open_incidents: input.open_incidents,
    queued_jobs: input.queued_jobs,
    running_jobs: input.running_jobs,
    total_runs: input.total_runs,
  });
}
