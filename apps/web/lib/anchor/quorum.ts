import { z } from 'zod';

export const AnchorQuorumSchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    required_signers: z.array(z.string().trim().min(1).max(256)),
    signed_signers: z.array(z.string().trim().min(1).max(256)),
    quorum_reached: z.boolean(),
  })
  .strict();

export type AnchorQuorum = z.infer<typeof AnchorQuorumSchema>;

function normalizeSignerList(signers: readonly string[]): string[] {
  return signers.map((signer) => signer.trim());
}

export function computeAnchorQuorumReached(input: {
  required_signers: readonly string[];
  signed_signers: readonly string[];
}): boolean {
  const required = normalizeSignerList(input.required_signers);
  const signed = new Set(normalizeSignerList(input.signed_signers));

  return required.every((signer) => signed.has(signer));
}

export function parseAnchorQuorum(input: unknown): AnchorQuorum {
  return AnchorQuorumSchema.parse(input);
}

export function validateAnchorQuorum(input: unknown): boolean {
  return AnchorQuorumSchema.safeParse(input).success;
}
