import { z } from 'zod';

export const RunTelemetrySchema = z
  .object({
    total_runs: z.number().int().nonnegative(),
    succeeded_runs: z.number().int().nonnegative(),
    failed_runs: z.number().int().nonnegative(),
    frozen_runs: z.number().int().nonnegative(),
    average_duration_ms: z.number().int().nonnegative(),
  })
  .strict();

export const SystemTelemetrySchema = z
  .object({
    health: z.enum(['green', 'yellow', 'red']),
    active_workers: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    error_events: z.number().int().nonnegative(),
    warn_events: z.number().int().nonnegative(),
  })
  .strict();

export type RunTelemetry = z.infer<typeof RunTelemetrySchema>;
export type SystemTelemetry = z.infer<typeof SystemTelemetrySchema>;

export function getRunTelemetry(): RunTelemetry {
  return RunTelemetrySchema.parse({
    total_runs: 16,
    succeeded_runs: 12,
    failed_runs: 1,
    frozen_runs: 3,
    average_duration_ms: 2400,
  });
}

export function getSystemTelemetry(): SystemTelemetry {
  return SystemTelemetrySchema.parse({
    health: 'yellow',
    active_workers: 2,
    queued_jobs: 3,
    open_incidents: 1,
    error_events: 1,
    warn_events: 4,
  });
}
