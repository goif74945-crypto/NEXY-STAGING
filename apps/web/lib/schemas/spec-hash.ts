import { z } from 'zod';

import { SpecHashSchema } from '../types/spec-hash';

export const SpecHashRecordSchema = SpecHashSchema;

export type SpecHashRecord = z.infer<typeof SpecHashRecordSchema>;

export function parseSpecHashRecord(input: unknown): SpecHashRecord {
  return SpecHashRecordSchema.parse(input);
}

export function validateSpecHashRecord(input: unknown): boolean {
  return SpecHashRecordSchema.safeParse(input).success;
}
