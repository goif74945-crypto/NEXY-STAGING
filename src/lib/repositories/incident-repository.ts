import { z } from 'zod';

export const IncidentRepositorySeveritySchema = z.enum([
  'S0',
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
]);

export const IncidentRepositoryStatusSchema = z.enum([
  'open',
  'investigating',
  'resolved',
]);

export const IncidentRepositoryRecordSchema = z
  .object({
    incident_id: z.string().trim().min(1),
    severity: IncidentRepositorySeveritySchema,
    status: IncidentRepositoryStatusSchema,
    title: z.string().trim().min(1),
  })
  .strict();

export const IncidentCreateInputSchema = z
  .object({
    incident_id: z.string().trim().min(1).max(256),
    severity: IncidentRepositorySeveritySchema,
    title: z.string().trim().min(1).max(256),
    status: IncidentRepositoryStatusSchema,
  })
  .strict();

export const IncidentResolveBodySchema = z
  .object({
    resolution: z.string().trim().min(1).max(4096),
    resolved_by: z.string().trim().min(1).max(256),
  })
  .strict();

export const IncidentResolveInputSchema = IncidentResolveBodySchema.extend({
  incident_id: z.string().trim().min(1).max(256),
}).strict();

export const IncidentResolveResultSchema = z
  .object({
    incident_id: z.string().trim().min(1).max(256),
    status: z.literal('resolved'),
    resolution: z.string().trim().min(1).max(4096),
    resolved_by: z.string().trim().min(1).max(256),
  })
  .strict();

export type IncidentRepositorySeverity = z.infer<
  typeof IncidentRepositorySeveritySchema
>;
export type IncidentRepositoryStatus = z.infer<
  typeof IncidentRepositoryStatusSchema
>;
export type IncidentRepositoryRecord = z.infer<
  typeof IncidentRepositoryRecordSchema
>;
export type IncidentCreateInput = z.infer<typeof IncidentCreateInputSchema>;
export type IncidentResolveBody = z.infer<typeof IncidentResolveBodySchema>;
export type IncidentResolveInput = z.infer<typeof IncidentResolveInputSchema>;
export type IncidentResolveResult = z.infer<typeof IncidentResolveResultSchema>;

function buildIncidentRecords(): IncidentRepositoryRecord[] {
  return [
    IncidentRepositoryRecordSchema.parse({
      incident_id: 'incident_001',
      severity: 'S2',
      status: 'open',
      title: 'Deterministic queue pressure',
    }),
    IncidentRepositoryRecordSchema.parse({
      incident_id: 'incident_002',
      severity: 'S1',
      status: 'investigating',
      title: 'Telemetry warning threshold',
    }),
  ];
}

function cloneIncidentRecord(
  record: IncidentRepositoryRecord,
): IncidentRepositoryRecord {
  return IncidentRepositoryRecordSchema.parse({
    incident_id: record.incident_id,
    severity: record.severity,
    status: record.status,
    title: record.title,
  });
}

export function listIncidents(): IncidentRepositoryRecord[] {
  return buildIncidentRecords().map(cloneIncidentRecord);
}

export function getIncidentById(
  incidentId: string,
): IncidentRepositoryRecord | null {
  const incident = buildIncidentRecords().find(
    (record) => record.incident_id === incidentId,
  );

  return incident === undefined ? null : cloneIncidentRecord(incident);
}

export function createIncidentRecord(
  input: IncidentCreateInput,
): IncidentRepositoryRecord {
  const parsed = IncidentCreateInputSchema.parse(input);

  return IncidentRepositoryRecordSchema.parse({
    incident_id: parsed.incident_id,
    severity: parsed.severity,
    status: parsed.status,
    title: parsed.title,
  });
}

export function resolveIncident(
  input: IncidentResolveInput,
): IncidentResolveResult {
  const parsed = IncidentResolveInputSchema.parse(input);

  return IncidentResolveResultSchema.parse({
    incident_id: parsed.incident_id,
    status: 'resolved',
    resolution: parsed.resolution,
    resolved_by: parsed.resolved_by,
  });
}
