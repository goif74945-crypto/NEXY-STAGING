import { z } from 'zod';

export const WalEntrySchema = z
  .object({
    index: z.number().int().nonnegative(),
    state_hash: z.string().trim().min(1).max(256),
    note: z.string().trim().min(1).max(4096),
  })
  .strict();

export const WalRecordSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    entries: z.array(WalEntrySchema),
  })
  .strict();

export type WalEntry = z.infer<typeof WalEntrySchema>;
export type WalRecord = z.infer<typeof WalRecordSchema>;

const NewWalEntryInputSchema = z
  .object({
    state_hash: z.string().trim().min(1).max(256),
    note: z.string().trim().min(1).max(4096),
  })
  .strict();

type NewWalEntryInput = z.infer<typeof NewWalEntryInputSchema>;

function assertSequentialIndexes(entries: readonly WalEntry[]): void {
  let expectedIndex = 0;

  for (const entry of entries) {
    if (entry.index !== expectedIndex) {
      throw new Error('Illegal WAL index sequence.');
    }

    expectedIndex += 1;
  }
}

export function parseWalRecord(input: unknown): WalRecord {
  const parsed = WalRecordSchema.parse(input);

  assertSequentialIndexes(parsed.entries);

  return parsed;
}

export function validateWalRecord(input: unknown): boolean {
  try {
    parseWalRecord(input);
    return true;
  } catch {
    return false;
  }
}

export function appendWalEntry(
  record: WalRecord,
  entry: NewWalEntryInput,
): WalRecord {
  const parsedRecord = parseWalRecord(record);
  const parsedEntry = NewWalEntryInputSchema.parse(entry);
  const nextIndex =
    parsedRecord.entries.length === 0
      ? 0
      : parsedRecord.entries[parsedRecord.entries.length - 1].index + 1;

  return {
    universe_id: parsedRecord.universe_id,
    entries: [
      ...parsedRecord.entries.map((item) => ({
        index: item.index,
        state_hash: item.state_hash,
        note: item.note,
      })),
      {
        index: nextIndex,
        state_hash: parsedEntry.state_hash,
        note: parsedEntry.note,
      },
    ],
  };
}
