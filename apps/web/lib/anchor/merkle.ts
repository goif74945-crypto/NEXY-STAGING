import { z } from 'zod';

export const MerkleBatchInputSchema = z
  .object({
    batch_id: z.string().trim().min(1).max(256),
    items: z.array(z.string().trim().min(1).max(4096)),
  })
  .strict();

export const MerkleBatchRecordSchema = z
  .object({
    batch_id: z.string().trim().min(1).max(256),
    item_count: z.number().int().nonnegative(),
    root: z.string().trim().min(1).max(256),
  })
  .strict();

export type MerkleBatchInput = z.infer<typeof MerkleBatchInputSchema>;
export type MerkleBatchRecord = z.infer<typeof MerkleBatchRecordSchema>;

function reduceMerkleSeed(input: string): number {
  let accumulator = 7;

  for (const character of input) {
    accumulator = (Math.imul(accumulator, 131) + character.charCodeAt(0)) >>> 0;
  }

  return accumulator >>> 0;
}

function formatMerkleRoot(value: number): string {
  return `root_${value.toString(16).padStart(8, '0')}`;
}

export function buildMerkleBatchRecord(
  input: MerkleBatchInput,
): MerkleBatchRecord {
  const parsed = MerkleBatchInputSchema.parse(input);
  const joined = `${parsed.batch_id}|${parsed.items.join('|')}`;

  return MerkleBatchRecordSchema.parse({
    batch_id: parsed.batch_id,
    item_count: parsed.items.length,
    root: formatMerkleRoot(reduceMerkleSeed(joined)),
  });
}

export function parseMerkleBatchInput(input: unknown): MerkleBatchInput {
  return MerkleBatchInputSchema.parse(input);
}
