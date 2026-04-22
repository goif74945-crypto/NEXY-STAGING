import { z } from 'zod';

export const ConstitutionalBranchSchema = z
  .object({
    branch: z.string().trim().min(1).max(256),
    parent_branch: z.string().trim().min(1).max(256),
    constitutional: z.boolean(),
    write_locked: z.boolean(),
  })
  .strict();

export type ConstitutionalBranch = z.infer<typeof ConstitutionalBranchSchema>;

export function parseConstitutionalBranch(
  input: unknown,
): ConstitutionalBranch {
  return ConstitutionalBranchSchema.parse(input);
}

export function validateConstitutionalBranch(input: unknown): boolean {
  return ConstitutionalBranchSchema.safeParse(input).success;
}

export function buildConstitutionalBranch(
  input: ConstitutionalBranch,
): ConstitutionalBranch {
  const parsed = parseConstitutionalBranch(input);

  return {
    branch: parsed.branch,
    parent_branch: parsed.parent_branch,
    constitutional: parsed.constitutional,
    write_locked: parsed.write_locked,
  };
}
