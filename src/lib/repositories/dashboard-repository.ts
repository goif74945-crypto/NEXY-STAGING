import { z } from 'zod';

import { OutputClassSchema } from '@/lib/types/output-class';

export const DashboardSummarySchema = z
  .object({
    active_sessions: z.number().int().nonnegative(),
    total_runs: z.number().int().nonnegative(),
    open_incidents: z.number().int().nonnegative(),
    queued_jobs: z.number().int().nonnegative(),
    running_jobs: z.number().int().nonnegative(),
    agents_online: z.number().int().nonnegative(),
  })
  .strict();

export const DashboardRecentRunSchema = z
  .object({
    run_id: z.string().trim().min(1),
    status: z.string().trim().min(1),
    output_class: OutputClassSchema,
    updated_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export const DashboardIncidentSchema = z
  .object({
    incident_id: z.string().trim().min(1),
    severity: z.enum(['S0', 'S1', 'S2', 'S3', 'S4', 'S5']),
    status: z.enum(['open', 'investigating', 'resolved']),
    title: z.string().trim().min(1),
  })
  .strict();

export const DashboardAgentSchema = z
  .object({
    agent_id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    status: z.enum(['online', 'idle', 'offline', 'blocked']),
    current_run_id: z.string().trim().min(1),
  })
  .strict();

export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
export type DashboardRecentRun = z.infer<typeof DashboardRecentRunSchema>;
export type DashboardIncident = z.infer<typeof DashboardIncidentSchema>;
export type DashboardAgent = z.infer<typeof DashboardAgentSchema>;

export function getDashboardSummary(): DashboardSummary {
  return DashboardSummarySchema.parse({
    active_sessions: 2,
    total_runs: 4,
    open_incidents: 1,
    queued_jobs: 3,
    running_jobs: 1,
    agents_online: 2,
  });
}

export function getDashboardRecentRuns(): DashboardRecentRun[] {
  return [
    DashboardRecentRunSchema.parse({
      run_id: 'run_004',
      status: 'stable',
      output_class: 'FINAL',
      updated_at_epoch_ms: 1700000040000,
    }),
    DashboardRecentRunSchema.parse({
      run_id: 'run_003',
      status: 'verifying',
      output_class: 'CLEAN',
      updated_at_epoch_ms: 1700000030000,
    }),
  ];
}

export function getDashboardIncidents(): DashboardIncident[] {
  return [
    DashboardIncidentSchema.parse({
      incident_id: 'incident_001',
      severity: 'S2',
      status: 'open',
      title: 'Deterministic queue pressure',
    }),
    DashboardIncidentSchema.parse({
      incident_id: 'incident_002',
      severity: 'S1',
      status: 'investigating',
      title: 'Telemetry warning threshold',
    }),
  ];
}

export function getDashboardAgents(): DashboardAgent[] {
  return [
    DashboardAgentSchema.parse({
      agent_id: 'agent_001',
      label: 'Judge agent',
      status: 'online',
      current_run_id: 'run_004',
    }),
    DashboardAgentSchema.parse({
      agent_id: 'agent_002',
      label: 'Swarm agent',
      status: 'idle',
      current_run_id: 'none',
    }),
  ];
}
