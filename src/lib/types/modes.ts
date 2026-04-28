import { z } from 'zod';

export const ModeSchema = z.enum(['VIEW', 'RUN', 'FORGE']);

export type Mode = z.infer<typeof ModeSchema>;

export function parseMode(input: unknown): Mode {
  return ModeSchema.parse(input);
}

export function validateMode(input: unknown): boolean {
  return ModeSchema.safeParse(input).success;
}
