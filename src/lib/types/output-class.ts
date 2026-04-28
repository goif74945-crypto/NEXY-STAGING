import { z } from 'zod';

export const OutputClassSchema = z.enum(['RAW', 'CLEAN', 'FINAL', 'REJECT']);

export type OutputClass = z.infer<typeof OutputClassSchema>;

export function parseOutputClass(input: unknown): OutputClass {
  return OutputClassSchema.parse(input);
}

export function validateOutputClass(input: unknown): boolean {
  return OutputClassSchema.safeParse(input).success;
}
