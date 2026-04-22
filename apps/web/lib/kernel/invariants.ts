import { z } from 'zod';

import { AuthorityRootSchema } from './authority-root';
import { KernelCanonSchema } from './canon';
import { VaultRootSchema } from './vault-root';
import { RecoveryRootSchema } from './recovery-root';

export const KernelInvariantInputSchema = z
  .object({
    authority_root: AuthorityRootSchema,
    kernel_canon: KernelCanonSchema,
    vault_root: VaultRootSchema,
    recovery_root: RecoveryRootSchema,
  })
  .strict();

export const KernelInvariantResultSchema = z
  .object({
    ok: z.boolean(),
    violations: z.array(z.string().trim().min(1).max(4096)),
  })
  .strict();

export type KernelInvariantInput = z.infer<typeof KernelInvariantInputSchema>;
export type KernelInvariantResult = z.infer<typeof KernelInvariantResultSchema>;

export function parseKernelInvariantInput(input: unknown): KernelInvariantInput {
  return KernelInvariantInputSchema.parse(input);
}

export function evaluateKernelInvariants(
  input: KernelInvariantInput,
): KernelInvariantResult {
  const parsed = parseKernelInvariantInput(input);
  const violations: string[] = [];

  if (parsed.authority_root.write_locked === false && parsed.kernel_canon.forked === true) {
    violations.push(
      'authority_root.write_locked must not be false when kernel_canon.forked is true',
    );
  }

  if (parsed.vault_root.immutable_audit === false) {
    violations.push('vault_root.immutable_audit must be true');
  }

  if (parsed.recovery_root.freeze_on_mismatch === false) {
    violations.push('recovery_root.freeze_on_mismatch must be true');
  }

  if (
    parsed.authority_root.write_locked === true &&
    parsed.kernel_canon.write_authority !== parsed.authority_root.owner
  ) {
    violations.push('kernel_canon.write_authority must match authority_root.owner');
  }

  return KernelInvariantResultSchema.parse({
    ok: violations.length === 0,
    violations,
  });
}
