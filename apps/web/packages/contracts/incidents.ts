import { z } from 'zod';

import { ErrorCodeSchema } from './errors';
import { TimestampIsoSchema } from './state';

export const IncidentIdSchema = z.string().trim().min(1).max(128);
export type IncidentId = z.infer<typeof IncidentIdSchema>;

export const IncidentSeverityValues = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const IncidentSeveritySchema = z.enum(IncidentSeverityValues);
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;

export const IncidentStatusValues = [
  'OPEN',
  'INVESTIGATING',
  'MITIGATED',
  'RESOLVED',
  'CLOSED',
] as const;
export const IncidentStatusSchema = z.enum(IncidentStatusValues);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const IncidentLinkSchema = z
  .object({
    parent_incident_id: IncidentIdSchema.optional(),
    related_incident_ids: z.array(IncidentIdSchema),
    run_id: z.string().trim().min(1).max(128).optional(),
    artifact_id: z.string().trim().min(1).max(128).optional(),
    session_id: z.string().trim().min(1).max(128).optional(),
  })
  .strict();
export type IncidentLink = z.infer<typeof IncidentLinkSchema>;

export const IncidentSchema = z
  .object({
    id: IncidentIdSchema,
    code: ErrorCodeSchema,
    severity: IncidentSeveritySchema,
    status: IncidentStatusSchema,
    title: z.string().trim().min(1).max(256),
    message: z.string().trim().min(1).max(4096),
    created_at: TimestampIsoSchema,
    updated_at: TimestampIsoSchema,
    links: IncidentLinkSchema,
  })
  .strict();
export type Incident = z.infer<typeof IncidentSchema>;

export const IncidentListSchema = z.array(IncidentSchema);
export type IncidentList = z.infer<typeof IncidentListSchema>;

export const parseIncident = (input: unknown): Incident => IncidentSchema.parse(input);