import { z } from 'zod';

export const AnchorStateSchema = z.enum(['proposed', 'signed', 'finalized']);

export type AnchorState = z.infer<typeof AnchorStateSchema>;

export function parseAnchorState(input: unknown): AnchorState {
  return AnchorStateSchema.parse(input);
}

export function validateAnchorState(input: unknown): boolean {
  return AnchorStateSchema.safeParse(input).success;
}
