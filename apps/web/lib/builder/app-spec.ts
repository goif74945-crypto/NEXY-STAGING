import { z } from 'zod';

export const BuilderAppSpecSourceSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    locked: z.boolean(),
  })
  .strict();

export const BuilderAppSpecRecordSchema = z
  .object({
    spec_id: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    canonical_json: z.string().trim().min(1).max(100000),
    spec_hash: z.string().trim().min(1).max(256),
    sources: z.array(BuilderAppSpecSourceSchema),
  })
  .strict();

export type BuilderAppSpecSource = z.infer<typeof BuilderAppSpecSourceSchema>;
export type BuilderAppSpecRecord = z.infer<typeof BuilderAppSpecRecordSchema>;

export function parseBuilderAppSpecRecord(input: unknown): BuilderAppSpecRecord {
  return BuilderAppSpecRecordSchema.parse(input);
}

export function validateBuilderAppSpecRecord(input: unknown): boolean {
  return BuilderAppSpecRecordSchema.safeParse(input).success;
}

export function toBuilderAppSpecRecord(input: unknown): BuilderAppSpecRecord {
  const parsed = parseBuilderAppSpecRecord(input);

  return {
    spec_id: parsed.spec_id,
    version: parsed.version,
    canonical_json: parsed.canonical_json,
    spec_hash: parsed.spec_hash,
    sources: parsed.sources.map((source) => ({
      name: source.name,
      version: source.version,
      locked: source.locked,
    })),
  };
}
