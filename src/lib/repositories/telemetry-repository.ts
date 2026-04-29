import { z } from 'zod';

export const QueueStatusSchema = z
  .object({
    queued: z.number().int().nonnegative(),
    running: z.number().int().nonnegative(),
    succeeded: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    cancelled: z.number().int().nonnegative(),
  })
  .strict();

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

export type QueueStatus = z.infer<typeof QueueStatusSchema>;
export type RunTelemetry = z.infer<typeof RunTelemetrySchema>;
export type SystemTelemetry = z.infer<typeof SystemTelemetrySchema>;

export function getQueueStatus(): QueueStatus {
  return QueueStatusSchema.parse({
    queued: 3,
    running: 1,
    succeeded: 12,
    failed: 1,
    cancelled: 0,
  });
}

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
