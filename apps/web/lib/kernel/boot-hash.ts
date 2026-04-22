import { z } from 'zod';

export const BootHashInputSchema = z
  .object({
    node_id: z.string().trim().min(1).max(256),
    boot_components: z.array(z.string().trim().min(1).max(4096)),
  })
  .strict();

export const BootHashRecordSchema = z
  .object({
    node_id: z.string().trim().min(1).max(256),
    boot_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export type BootHashInput = z.infer<typeof BootHashInputSchema>;
export type BootHashRecord = z.infer<typeof BootHashRecordSchema>;

function reduceBootSeed(text: string): number {
  let hash = 2166136261;

  for (const character of text) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return hash >>> 0;
}

function formatBootHash(value: number): string {
  return `boot_${value.toString(16).padStart(8, '0')}`;
}

export function parseBootHashInput(input: unknown): BootHashInput {
  return BootHashInputSchema.parse(input);
}

export function computeBootHash(input: BootHashInput): string {
  const parsed = parseBootHashInput(input);
  const seed = `${parsed.node_id}|${parsed.boot_components.join('|')}`;

  return formatBootHash(reduceBootSeed(seed));
}

export function buildBootHashRecord(input: BootHashInput): BootHashRecord {
  const parsed = parseBootHashInput(input);

  return BootHashRecordSchema.parse({
    node_id: parsed.node_id,
    boot_hash: computeBootHash(parsed),
  });
}
