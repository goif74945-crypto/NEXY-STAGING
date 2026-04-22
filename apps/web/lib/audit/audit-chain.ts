import { z } from 'zod';

export const AuditChainEntrySchema = z
  .object({
    index: z.number().int().nonnegative(),
    audit_id: z.string().trim().min(1).max(256),
    payload_hash: z.string().trim().min(1).max(256),
    chain_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export const AuditChainSchema = z
  .object({
    entries: z.array(AuditChainEntrySchema),
  })
  .strict();

export type AuditChainEntry = z.infer<typeof AuditChainEntrySchema>;
export type AuditChain = z.infer<typeof AuditChainSchema>;

const NewAuditChainEntryInputSchema = z
  .object({
    audit_id: z.string().trim().min(1).max(256),
    payload_hash: z.string().trim().min(1).max(256),
  })
  .strict();

type NewAuditChainEntryInput = z.infer<typeof NewAuditChainEntryInputSchema>;

function reduceAuditChainHash(seed: string): string {
  let hash = 2166136261;

  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return `chain_${hash.toString(16).padStart(8, '0')}`;
}

function assertSequentialEntries(entries: readonly AuditChainEntry[]): void {
  for (let index = 0; index < entries.length; index += 1) {
    if (entries[index].index !== index) {
      throw new Error('Illegal audit chain index sequence.');
    }
  }
}

export function parseAuditChain(input: unknown): AuditChain {
  const parsed = AuditChainSchema.parse(input);

  assertSequentialEntries(parsed.entries);

  return parsed;
}

export function validateAuditChain(input: unknown): boolean {
  try {
    parseAuditChain(input);
    return true;
  } catch {
    return false;
  }
}

export function appendAuditChainEntry(
  chain: AuditChain,
  entry: NewAuditChainEntryInput,
): AuditChain {
  const parsedChain = parseAuditChain(chain);
  const parsedEntry = NewAuditChainEntryInputSchema.parse(entry);

  const previousEntry =
    parsedChain.entries.length === 0
      ? null
      : parsedChain.entries[parsedChain.entries.length - 1];

  const nextIndex = previousEntry === null ? 0 : previousEntry.index + 1;
  const previousChainHash = previousEntry === null ? 'chain_root' : previousEntry.chain_hash;
  const chainHash = reduceAuditChainHash(
    `${previousChainHash}|${nextIndex}|${parsedEntry.audit_id}|${parsedEntry.payload_hash}`,
  );

  return {
    entries: [
      ...parsedChain.entries.map((item) => ({
        index: item.index,
        audit_id: item.audit_id,
        payload_hash: item.payload_hash,
        chain_hash: item.chain_hash,
      })),
      {
        index: nextIndex,
        audit_id: parsedEntry.audit_id,
        payload_hash: parsedEntry.payload_hash,
        chain_hash: chainHash,
      },
    ],
  };
}
