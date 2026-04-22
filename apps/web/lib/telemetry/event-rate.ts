import { z } from 'zod';

export const TelemetryEventRateSchema = z
  .object({
    error_events: z.number().int().nonnegative(),
    warn_events: z.number().int().nonnegative(),
    total_events: z.number().int().nonnegative(),
    error_ratio: z.number().min(0),
  })
  .strict();

export type TelemetryEventRate = z.infer<typeof TelemetryEventRateSchema>;

export function parseTelemetryEventRate(input: unknown): TelemetryEventRate {
  return TelemetryEventRateSchema.parse(input);
}

export function validateTelemetryEventRate(input: unknown): boolean {
  return TelemetryEventRateSchema.safeParse(input).success;
}

export function buildTelemetryEventRate(
  input: TelemetryEventRate,
): TelemetryEventRate {
  const parsed = parseTelemetryEventRate(input);
  const total_events = parsed.error_events + parsed.warn_events;
  const error_ratio =
    total_events === 0 ? 0 : parsed.error_events / total_events;

  if (
    parsed.total_events !== total_events ||
    Math.abs(parsed.error_ratio - error_ratio) > Number.EPSILON
  ) {
    throw new Error('Illegal telemetry event rate contradiction.');
  }

  return {
    error_events: parsed.error_events,
    warn_events: parsed.warn_events,
    total_events,
    error_ratio,
  };
}
