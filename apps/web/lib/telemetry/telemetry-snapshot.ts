import { z } from 'zod';

export const TelemetrySnapshotSchema = z
  .object({
    generated_at_epoch_ms: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    error_events: z.number().int().nonnegative(),
    warn_events: z.number().int().nonnegative(),
    active_workers: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
  })
  .strict();

export type TelemetrySnapshot = z.infer<typeof TelemetrySnapshotSchema>;

export function parseTelemetrySnapshot(input: unknown): TelemetrySnapshot {
  return TelemetrySnapshotSchema.parse(input);
}

export function validateTelemetrySnapshot(input: unknown): boolean {
  return TelemetrySnapshotSchema.safeParse(input).success;
}

export function buildTelemetrySnapshot(
  input: TelemetrySnapshot,
): TelemetrySnapshot {
  const parsed = parseTelemetrySnapshot(input);

  return {
    generated_at_epoch_ms: parsed.generated_at_epoch_ms,
    open_incidents: parsed.open_incidents,
    error_events: parsed.error_events,
    warn_events: parsed.warn_events,
    active_workers: parsed.active_workers,
    queued_jobs: parsed.queued_jobs,
    running_jobs: parsed.running_jobs,
  };
}
