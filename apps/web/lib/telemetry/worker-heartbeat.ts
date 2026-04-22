import { z } from 'zod';

export const WorkerHeartbeatSchema = z
  .object({
    worker_id: z.string().trim().min(1).max(256),
    status: z.string().trim().min(1).max(128),
    current_job_id: z.string().trim().max(256),
    last_heartbeat_epoch_ms: z.number().int().nonnegative(),
    stale: z.boolean(),
  })
  .strict();

export type WorkerHeartbeat = z.infer<typeof WorkerHeartbeatSchema>;

export function parseWorkerHeartbeat(input: unknown): WorkerHeartbeat {
  return WorkerHeartbeatSchema.parse(input);
}

export function validateWorkerHeartbeat(input: unknown): boolean {
  return WorkerHeartbeatSchema.safeParse(input).success;
}

export function buildWorkerHeartbeat(
  input: WorkerHeartbeat,
): WorkerHeartbeat {
  const parsed = parseWorkerHeartbeat(input);

  return {
    worker_id: parsed.worker_id,
    status: parsed.status,
    current_job_id: parsed.current_job_id,
    last_heartbeat_epoch_ms: parsed.last_heartbeat_epoch_ms,
    stale: parsed.stale,
  };
}
