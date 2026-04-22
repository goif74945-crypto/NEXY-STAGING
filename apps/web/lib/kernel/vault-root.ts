import { z } from 'zod';

export const VaultRootSchema = z
  .object({
    vault_id: z.string().trim().min(1).max(256),
    workspace_id: z.string().trim().min(1).max(256),
    timeline_enabled: z.boolean(),
    immutable_audit: z.boolean(),
  })
  .strict();

export type VaultRoot = z.infer<typeof VaultRootSchema>;

export function parseVaultRoot(input: unknown): VaultRoot {
  return VaultRootSchema.parse(input);
}

export function validateVaultRoot(input: unknown): boolean {
  return VaultRootSchema.safeParse(input).success;
}

export function buildVaultRoot(input: VaultRoot): VaultRoot {
  const parsed = parseVaultRoot(input);

  return {
    vault_id: parsed.vault_id,
    workspace_id: parsed.workspace_id,
    timeline_enabled: parsed.timeline_enabled,
    immutable_audit: parsed.immutable_audit,
  };
}
