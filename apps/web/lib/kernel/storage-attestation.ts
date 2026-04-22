import { z } from 'zod';

export const StorageAttestationSchema = z
  .object({
    device_model: z.string().trim().min(1).max(256),
    firmware_version: z.string().trim().min(1).max(128),
    filesystem_uuid: z.string().trim().min(1).max(256),
    mount_options: z.array(z.string().trim().min(1).max(256)),
    io_scheduler: z.string().trim().min(1).max(128),
    kernel_version: z.string().trim().min(1).max(128),
    cpu_model: z.string().trim().min(1).max(256),
    microcode_version: z.string().trim().min(1).max(128),
  })
  .strict();

export type StorageAttestation = z.infer<typeof StorageAttestationSchema>;

export function parseStorageAttestation(input: unknown): StorageAttestation {
  return StorageAttestationSchema.parse(input);
}

export function validateStorageAttestation(input: unknown): boolean {
  return StorageAttestationSchema.safeParse(input).success;
}

export function stringifyStorageAttestationFingerprint(
  input: StorageAttestation,
): string {
  const parsed = parseStorageAttestation(input);

  return [
    `device_model=${parsed.device_model}`,
    `firmware_version=${parsed.firmware_version}`,
    `filesystem_uuid=${parsed.filesystem_uuid}`,
    `mount_options=${parsed.mount_options.join(',')}`,
    `io_scheduler=${parsed.io_scheduler}`,
    `kernel_version=${parsed.kernel_version}`,
    `cpu_model=${parsed.cpu_model}`,
    `microcode_version=${parsed.microcode_version}`,
  ].join('|');
}
