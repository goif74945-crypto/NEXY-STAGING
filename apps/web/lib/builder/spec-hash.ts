import { z } from 'zod';

import { stringifyCanonicalJson } from './canonical-json';

export const BuilderSpecHashInputSchema = z
  .object({
    spec_id: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    canonical_json: z.string().trim().min(1).max(100000),
  })
  .strict();

export const BuilderSpecHashRecordSchema = z
  .object({
    spec_id: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    spec_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export type BuilderSpecHashInput = z.infer<typeof BuilderSpecHashInputSchema>;
export type BuilderSpecHashRecord = z.infer<typeof BuilderSpecHashRecordSchema>;

function reduceHashSeed(input: string): number {
  let hash = 2166136261;

  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return hash >>> 0;
}

function formatHash(value: number): string {
  return `spec_${value.toString(16).padStart(8, '0')}`;
}

export function computeSpecHash(input: BuilderSpecHashInput): string {
  const parsed = BuilderSpecHashInputSchema.parse(input);
  const normalized = stringifyCanonicalJson({
    spec_id: parsed.spec_id,
    version: parsed.version,
    canonical_json: parsed.canonical_json,
  });

  return formatHash(reduceHashSeed(normalized));
}

export function buildSpecHashRecord(input: BuilderSpecHashInput): BuilderSpecHashRecord {
  const parsed = BuilderSpecHashInputSchema.parse(input);

  return BuilderSpecHashRecordSchema.parse({
    spec_id: parsed.spec_id,
    version: parsed.version,
    spec_hash: computeSpecHash(parsed),
  });
}

export function parseBuilderSpecHashInput(input: unknown): BuilderSpecHashInput {
  return BuilderSpecHashInputSchema.parse(input);
}
