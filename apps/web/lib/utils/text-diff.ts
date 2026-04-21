import { z } from 'zod';

export const TextDiffChunkSchema = z
  .object({
    kind: z.enum(['equal', 'insert', 'delete']),
    value: z.string(),
  })
  .strict();
export type TextDiffChunk = z.infer<typeof TextDiffChunkSchema>;

export const TextDiffSummarySchema = z
  .object({
    added_lines: z.number().int().nonnegative(),
    removed_lines: z.number().int().nonnegative(),
    changed: z.boolean(),
  })
  .strict();
export type TextDiffSummary = z.infer<typeof TextDiffSummarySchema>;

export const TextDiffResultSchema = z
  .object({
    chunks: z.array(TextDiffChunkSchema),
    summary: TextDiffSummarySchema,
  })
  .strict();
export type TextDiffResult = z.infer<typeof TextDiffResultSchema>;

function splitLines(input: string): string[] {
  return input.split('\n');
}

function buildLcsTable(leftLines: readonly string[], rightLines: readonly string[]): number[][] {
  const rows = leftLines.length + 1;
  const cols = rightLines.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let leftIndex = leftLines.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = rightLines.length - 1; rightIndex >= 0; rightIndex -= 1) {
      if (leftLines[leftIndex] === rightLines[rightIndex]) {
        table[leftIndex][rightIndex] = table[leftIndex + 1][rightIndex + 1] + 1;
      } else {
        table[leftIndex][rightIndex] = Math.max(
          table[leftIndex + 1][rightIndex],
          table[leftIndex][rightIndex + 1],
        );
      }
    }
  }

  return table;
}

function pushChunk(chunks: TextDiffChunk[], kind: TextDiffChunk['kind'], value: string): void {
  const lastChunk = chunks[chunks.length - 1];

  if (lastChunk && lastChunk.kind === kind) {
    lastChunk.value = `${lastChunk.value}\n${value}`;
    return;
  }

  chunks.push(
    TextDiffChunkSchema.parse({
      kind,
      value,
    }),
  );
}

export function diffText(leftInput: unknown, rightInput: unknown): TextDiffResult {
  const leftText = z.string().parse(leftInput);
  const rightText = z.string().parse(rightInput);

  const leftLines = splitLines(leftText);
  const rightLines = splitLines(rightText);
  const lcsTable = buildLcsTable(leftLines, rightLines);

  const chunks: TextDiffChunk[] = [];
  let leftIndex = 0;
  let rightIndex = 0;
  let added_lines = 0;
  let removed_lines = 0;

  while (leftIndex < leftLines.length && rightIndex < rightLines.length) {
    if (leftLines[leftIndex] === rightLines[rightIndex]) {
      pushChunk(chunks, 'equal', leftLines[leftIndex]);
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }

    if (lcsTable[leftIndex + 1][rightIndex] >= lcsTable[leftIndex][rightIndex + 1]) {
      pushChunk(chunks, 'delete', leftLines[leftIndex]);
      removed_lines += 1;
      leftIndex += 1;
    } else {
      pushChunk(chunks, 'insert', rightLines[rightIndex]);
      added_lines += 1;
      rightIndex += 1;
    }
  }

  while (leftIndex < leftLines.length) {
    pushChunk(chunks, 'delete', leftLines[leftIndex]);
    removed_lines += 1;
    leftIndex += 1;
  }

  while (rightIndex < rightLines.length) {
    pushChunk(chunks, 'insert', rightLines[rightIndex]);
    added_lines += 1;
    rightIndex += 1;
  }

  return TextDiffResultSchema.parse({
    chunks,
    summary: {
      added_lines,
      removed_lines,
      changed: added_lines > 0 || removed_lines > 0,
    },
  });
}

export function hasTextDifference(leftInput: unknown, rightInput: unknown): boolean {
  return diffText(leftInput, rightInput).summary.changed;
}

export function summarizeTextDifference(
  leftInput: unknown,
  rightInput: unknown,
): TextDiffSummary {
  return diffText(leftInput, rightInput).summary;
}