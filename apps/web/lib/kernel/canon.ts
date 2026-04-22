import { z } from 'zod';

export const KernelCanonSchema = z
  .object({
    version: z.string().trim().min(1).max(128),
    branch: z.string().trim().min(1).max(256),
    forked: z.boolean(),
    amendment_count: z.number().int().nonnegative(),
    write_authority: z.string().trim().min(1).max(256),
  })
  .strict();

export type KernelCanon = z.infer<typeof KernelCanonSchema>;

export function parseKernelCanon(input: unknown): KernelCanon {
  return KernelCanonSchema.parse(input);
}

export function validateKernelCanon(input: unknown): boolean {
  return KernelCanonSchema.safeParse(input).success;
}

export function buildKernelCanon(input: KernelCanon): KernelCanon {
  const parsed = parseKernelCanon(input);

  return {
    version: parsed.version,
    branch: parsed.branch,
    forked: parsed.forked,
    amendment_count: parsed.amendment_count,
    write_authority: parsed.write_authority,
  };
}
