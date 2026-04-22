import { z } from 'zod';

export const CanonVersionSchema = z
  .object({
    version: z.string().trim().min(1).max(128),
    branch: z.string().trim().min(1).max(256),
    amendment_count: z.number().int().nonnegative(),
    forked: z.boolean(),
  })
  .strict();

export type CanonVersion = z.infer<typeof CanonVersionSchema>;

export function parseCanonVersion(input: unknown): CanonVersion {
  return CanonVersionSchema.parse(input);
}

export function validateCanonVersion(input: unknown): boolean {
  return CanonVersionSchema.safeParse(input).success;
}
