import { z } from 'zod';

import { stringifyCanonicalJson } from './canonical-json';

export const ArtifactHashInputSchema = z
  .object({
    artifact_id: z.string().trim().min(1).max(256),
    payload: z.unknown(),
  })
  .strict();

export const ArtifactHashRecordSchema = z
  .object({
    artifact_id: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export type ArtifactHashInput = z.infer<typeof ArtifactHashInputSchema>;
export type ArtifactHashRecord = z.infer<typeof ArtifactHashRecordSchema>;

function reduceArtifactSeed(input: string): number {
  let hash = 0;

  for (const character of input) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  }

  return hash >>> 0;
}

function formatArtifactHash(value: number): string {
  return `artifact_${value.toString(16).padStart(8, '0')}`;
}

export function computeArtifactHash(input: ArtifactHashInput): string {
  const parsed = ArtifactHashInputSchema.parse(input);
  const normalized = stringifyCanonicalJson({
    artifact_id: parsed.artifact_id,
    payload: parsed.payload,
  });

  return formatArtifactHash(reduceArtifactSeed(normalized));
}

export function buildArtifactHashRecord(
  input: ArtifactHashInput,
): ArtifactHashRecord {
  const parsed = ArtifactHashInputSchema.parse(input);

  return ArtifactHashRecordSchema.parse({
    artifact_id: parsed.artifact_id,
    artifact_hash: computeArtifactHash(parsed),
  });
}

export function parseArtifactHashInput(input: unknown): ArtifactHashInput {
  return ArtifactHashInputSchema.parse(input);
}
