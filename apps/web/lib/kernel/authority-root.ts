import { z } from 'zod';

export const AuthorityRootSchema = z
  .object({
    root_id: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    owner: z.string().trim().min(1).max(256),
    write_locked: z.boolean(),
  })
  .strict();

export type AuthorityRoot = z.infer<typeof AuthorityRootSchema>;

export function parseAuthorityRoot(input: unknown): AuthorityRoot {
  return AuthorityRootSchema.parse(input);
}

export function validateAuthorityRoot(input: unknown): boolean {
  return AuthorityRootSchema.safeParse(input).success;
}

export function buildAuthorityRoot(input: AuthorityRoot): AuthorityRoot {
  const parsed = parseAuthorityRoot(input);

  return {
    root_id: parsed.root_id,
    version: parsed.version,
    owner: parsed.owner,
    write_locked: parsed.write_locked,
  };
}
