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

export type IncidentRepositoryRecord = z.infer<
  typeof IncidentRepositoryRecordSchema
>;

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
