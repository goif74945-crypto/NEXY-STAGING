import { z } from 'zod';

export const UniverseStateSchema = z.enum([
  'running',
  'paused',
  'quarantined',
  'stopped',
  'terminated',
]);

export type UniverseState = z.infer<typeof UniverseStateSchema>;

export function parseUniverseState(input: unknown): UniverseState {
  return UniverseStateSchema.parse(input);
}

export function validateUniverseState(input: unknown): boolean {
  return UniverseStateSchema.safeParse(input).success;
}
