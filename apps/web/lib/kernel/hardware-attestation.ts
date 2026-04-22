import { z } from 'zod';

export const HardwareAttestationSchema = z
  .object({
    node_id: z.string().trim().min(1).max(256),
    hsm_backed: z.boolean(),
    tpm_attested: z.boolean(),
    boot_verified: z.boolean(),
    authoritative: z.boolean(),
  })
  .strict();

export type HardwareAttestation = z.infer<typeof HardwareAttestationSchema>;

export function parseHardwareAttestation(input: unknown): HardwareAttestation {
  return HardwareAttestationSchema.parse(input);
}

export function validateHardwareAttestation(input: unknown): boolean {
  return HardwareAttestationSchema.safeParse(input).success;
}

export function buildHardwareAttestation(
  input: HardwareAttestation,
): HardwareAttestation {
  const parsed = parseHardwareAttestation(input);
  const authoritative =
    parsed.hsm_backed && parsed.tpm_attested && parsed.boot_verified;

  if (parsed.authoritative !== authoritative) {
    throw new Error('Illegal hardware attestation contradiction.');
  }

  return {
    node_id: parsed.node_id,
    hsm_backed: parsed.hsm_backed,
    tpm_attested: parsed.tpm_attested,
    boot_verified: parsed.boot_verified,
    authoritative,
  };
}
