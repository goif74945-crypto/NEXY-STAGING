import { z } from 'zod';

export const VersionSchema = z.string().trim().min(1).max(64);
export type Version = z.infer<typeof VersionSchema>;

export const NormalizedVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'Version must be in MAJOR.MINOR.PATCH format.');
export type NormalizedVersion = z.infer<typeof NormalizedVersionSchema>;

export const VersionComponentSchema = z.number().int().nonnegative();
export type VersionComponent = z.infer<typeof VersionComponentSchema>;

export const RevisionIndexSchema = z.number().int().nonnegative();
export type RevisionIndex = z.infer<typeof RevisionIndexSchema>;

export const CommitIndexSchema = z.number().int().nonnegative();
export type CommitIndex = z.infer<typeof CommitIndexSchema>;

export const EntityIdSchema = z.string().trim().min(1).max(128);
export type EntityId = z.infer<typeof EntityIdSchema>;

export const RevisionKeyInputSchema = z
  .object({
    entity_id: EntityIdSchema,
    revision_index: RevisionIndexSchema,
    version: VersionSchema,
  })
  .strict();
export type RevisionKeyInput = z.infer<typeof RevisionKeyInputSchema>;

export const CommitKeyInputSchema = z
  .object({
    entity_id: EntityIdSchema,
    commit_index: CommitIndexSchema,
    revision_key: z.string().trim().min(1).max(512),
  })
  .strict();
export type CommitKeyInput = z.infer<typeof CommitKeyInputSchema>;

const ParsedVersionTupleSchema = z.tuple([
  VersionComponentSchema,
  VersionComponentSchema,
  VersionComponentSchema,
]);
type ParsedVersionTuple = z.infer<typeof ParsedVersionTupleSchema>;

function parseVersionTuple(input: string): ParsedVersionTuple {
  const trimmed = VersionSchema.parse(input);
  const withoutPrefix = trimmed.startsWith('v') ? trimmed.slice(1) : trimmed;
  const pieces = withoutPrefix.split('.');

  if (pieces.length !== 3) {
    throw new Error('Version must contain exactly 3 numeric components.');
  }

  const numericPieces = pieces.map((piece) => {
    if (!/^\d+$/.test(piece)) {
      throw new Error('Version components must be numeric.');
    }

    return Number(piece);
  });

  return ParsedVersionTupleSchema.parse(numericPieces);
}

export function normalizeVersionString(input: string): NormalizedVersion {
  const [major, minor, patch] = parseVersionTuple(input);
  const normalized = `${major}.${minor}.${patch}`;
  return NormalizedVersionSchema.parse(normalized);
}

export function compareVersion(left: string, right: string): -1 | 0 | 1 {
  const leftTuple = parseVersionTuple(left);
  const rightTuple = parseVersionTuple(right);

  for (let index = 0; index < leftTuple.length; index += 1) {
    if (leftTuple[index] > rightTuple[index]) {
      return 1;
    }

    if (leftTuple[index] < rightTuple[index]) {
      return -1;
    }
  }

  return 0;
}

export function nextRevisionIndex(previousRevisionIndices: readonly number[]): RevisionIndex {
  const parsed = z.array(RevisionIndexSchema).parse(previousRevisionIndices);

  if (parsed.length === 0) {
    return 0;
  }

  const maxIndex = parsed.reduce((max, current) => (current > max ? current : max), parsed[0]);
  return RevisionIndexSchema.parse(maxIndex + 1);
}

export function nextCommitIndex(previousCommitIndices: readonly number[]): CommitIndex {
  const parsed = z.array(CommitIndexSchema).parse(previousCommitIndices);

  if (parsed.length === 0) {
    return 0;
  }

  const maxIndex = parsed.reduce((max, current) => (current > max ? current : max), parsed[0]);
  return CommitIndexSchema.parse(maxIndex + 1);
}

export function buildRevisionKey(input: RevisionKeyInput): string {
  const parsed = RevisionKeyInputSchema.parse(input);
  const normalizedVersion = normalizeVersionString(parsed.version);
  return `${parsed.entity_id}@r${parsed.revision_index}:${normalizedVersion}`;
}

export function buildCommitKey(input: CommitKeyInput): string {
  const parsed = CommitKeyInputSchema.parse(input);
  return `${parsed.entity_id}#c${parsed.commit_index}:${parsed.revision_key}`;
}
