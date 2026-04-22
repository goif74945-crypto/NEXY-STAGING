import { z } from 'zod';

export const SpecHashSchema = z
  .object({
    spec_id: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    spec_hash: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export type SpecHash = z.infer<typeof SpecHashSchema>;

export function parseSpecHash(input: unknown): SpecHash {
  return SpecHashSchema.parse(input);
}

export function validateSpecHash(input: unknown): boolean {
  return SpecHashSchema.safeParse(input).success;
}
