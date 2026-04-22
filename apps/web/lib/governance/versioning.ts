import { z } from 'zod';

export const GovernanceVersionSchema = z
  .object({
    version: z.string().trim().min(1).max(128),
    branch: z.string().trim().min(1).max(256),
    amendment_count: z.number().int().nonnegative(),
  })
  .strict();

export type GovernanceVersion = z.infer<typeof GovernanceVersionSchema>;

export function parseGovernanceVersion(input: unknown): GovernanceVersion {
  return GovernanceVersionSchema.parse(input);
}

export function validateGovernanceVersion(input: unknown): boolean {
  return GovernanceVersionSchema.safeParse(input).success;
}

export function bumpGovernanceAmendment(
  input: GovernanceVersion,
): GovernanceVersion {
  const parsed = parseGovernanceVersion(input);

  return {
    version: parsed.version,
    branch: parsed.branch,
    amendment_count: parsed.amendment_count + 1,
  };
}
