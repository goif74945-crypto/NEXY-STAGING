import { z } from 'zod';

export const NodeAttestationSchema = z
  .object({
    node_id: z.string().trim().min(1).max(256),
    boot_hash: z.string().trim().min(1).max(256),
    hardware_attested: z.boolean(),
    storage_fingerprint: z.string().trim().min(1).max(2048),
    authoritative: z.boolean(),
  })
  .strict();

export type NodeAttestation = z.infer<typeof NodeAttestationSchema>;

export function parseNodeAttestation(input: unknown): NodeAttestation {
  return NodeAttestationSchema.parse(input);
}

export function validateNodeAttestation(input: unknown): boolean {
  return NodeAttestationSchema.safeParse(input).success;
}

export function buildNodeAttestation(
  input: NodeAttestation,
): NodeAttestation {
  const parsed = parseNodeAttestation(input);
  const authoritative =
    parsed.hardware_attested &&
    parsed.boot_hash.trim().length > 0 &&
    parsed.storage_fingerprint.trim().length > 0;

  if (parsed.authoritative !== authoritative) {
    throw new Error('Illegal node attestation contradiction.');
  }

  return {
    node_id: parsed.node_id,
    boot_hash: parsed.boot_hash,
    hardware_attested: parsed.hardware_attested,
    storage_fingerprint: parsed.storage_fingerprint,
    authoritative,
  };
}
