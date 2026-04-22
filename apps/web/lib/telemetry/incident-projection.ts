import { z } from 'zod';

import { TrustLevelSchema } from '../types/trust-level';

export const TelemetryIncidentProjectionSchema = z
  .object({
    incident_id: z.string().trim().min(1).max(256),
    severity: TrustLevelSchema,
    status: z.string().trim().min(1).max(128),
    title: z.string().trim().min(1).max(256),
    summary: z.string().trim().min(1).max(4096),
  })
  .strict();

export type TelemetryIncidentProjection = z.infer<
  typeof TelemetryIncidentProjectionSchema
>;

export function parseTelemetryIncidentProjection(
  input: unknown,
): TelemetryIncidentProjection {
  return TelemetryIncidentProjectionSchema.parse(input);
}

export function validateTelemetryIncidentProjection(input: unknown): boolean {
  return TelemetryIncidentProjectionSchema.safeParse(input).success;
}

export function buildTelemetryIncidentProjection(
  input: TelemetryIncidentProjection,
): TelemetryIncidentProjection {
  const parsed = parseTelemetryIncidentProjection(input);

  return {
    incident_id: parsed.incident_id,
    severity: parsed.severity,
    status: parsed.status,
    title: parsed.title,
    summary: parsed.summary,
  };
}
