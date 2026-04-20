import { z } from 'zod';

export const VersionStringSchema = z
  .string()
  .trim()
  .regex(/^(?:v|V)?\d+(?:\.\d+){0,2}$/, 'Version string must contain 1 to 3 numeric segments.');
export type VersionString = z.infer<typeof VersionStringSchema>;

export const NormalizedVersionStringSchema = z
  .string()
  .trim()
  .regex(/^\d+\.\d+\.\d+$/, 'Normalized version must match major.minor.patch.');
export type NormalizedVersionString = z.infer<typeof NormalizedVersionStringSchema>;

export const RevisionIndexSchema = z.number().int().nonnegative();
export type RevisionIndex = z.infer<typeof RevisionIndexSchema>;

export const CommitIndexSchema = z.number().int().nonnegative();
export type CommitIndex = z.infer<typeof CommitIndexSchema>;

export const RepositoryEntityIdSchema = z.string().trim().min(1).max(256);
export type RepositoryEntityId = z.infer<typeof RepositoryEntityIdSchema>;

export const RevisionKeySchema = z
  .string()
  .trim()
  .regex(
    /^[^\s].*::revision::\d+::\d+\.\d+\.\d+$/,
    'Revision key must match <entityId>::revision::<revisionIndex>::<normalizedVersion>.',
  );
export type RevisionKey = z.infer<typeof RevisionKeySchema>;

export const CommitKeySchema = z
  .string()
  .trim()
  .regex(
    /^[^\s].*::commit::\d+::\d+\.\d+\.\d+$/,
    'Commit key must match <entityId>::commit::<commitIndex>::<normalizedVersion>.',
  );
export type CommitKey = z.infer<typeof CommitKeySchema>;

export const VersionSegmentsSchema = z
  .tuple([
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
  ])
  .readonly();
export type VersionSegments = z.infer<typeof VersionSegmentsSchema>;

function parseVersionSegments(versionInput: unknown): VersionSegments {
  const raw = VersionStringSchema.parse(versionInput);
  const withoutPrefix = raw.replace(/^[vV]/, '');
  const rawSegments = withoutPrefix.split('.');

  if (rawSegments.length === 0 || rawSegments.length > 3) {
    throw new Error('Version string must contain between 1 and 3 numeric segments.');
  }

  const paddedSegments = [...rawSegments];
  while (paddedSegments.length < 3) {
    paddedSegments.push('0');
  }

  const numericSegments = paddedSegments.map((segment) => {
    if (!/^\d+$/.test(segment)) {
      throw new Error('Version segments must be numeric.');
    }

    return Number.parseInt(segment, 10);
  });

  return VersionSegmentsSchema.parse([
    numericSegments[0],
    numericSegments[1],
    numericSegments[2],
  ]);
}

export function normalizeVersionString(versionInput: unknown): NormalizedVersionString {
  const [major, minor, patch] = parseVersionSegments(versionInput);
  return NormalizedVersionStringSchema.parse(`${major}.${minor}.${patch}`);
}

export function compareVersion(leftInput: unknown, rightInput: unknown): -1 | 0 | 1 {
  const left = parseVersionSegments(leftInput);
  const right = parseVersionSegments(rightInput);

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] < right[index]) {
      return -1;
    }

    if (left[index] > right[index]) {
      return 1;
    }
  }

  return 0;
}

export function nextRevisionIndex(currentIndexInput: unknown): RevisionIndex {
  const currentIndex = RevisionIndexSchema.parse(currentIndexInput);
  return RevisionIndexSchema.parse(currentIndex + 1);
}

export function nextCommitIndex(currentIndexInput: unknown): CommitIndex {
  const currentIndex = CommitIndexSchema.parse(currentIndexInput);
  return CommitIndexSchema.parse(currentIndex + 1);
}

export function buildRevisionKey(
  entityIdInput: unknown,
  revisionIndexInput: unknown,
  versionInput: unknown,
): RevisionKey {
  const entityId = RepositoryEntityIdSchema.parse(entityIdInput);
  const revisionIndex = RevisionIndexSchema.parse(revisionIndexInput);
  const version = normalizeVersionString(versionInput);

  return RevisionKeySchema.parse(`${entityId}::revision::${revisionIndex}::${version}`);
}

export function buildCommitKey(
  entityIdInput: unknown,
  commitIndexInput: unknown,
  versionInput: unknown,
): CommitKey {
  const entityId = RepositoryEntityIdSchema.parse(entityIdInput);
  const commitIndex = CommitIndexSchema.parse(commitIndexInput);
  const version = normalizeVersionString(versionInput);

  return CommitKeySchema.parse(`${entityId}::commit::${commitIndex}::${version}`);
}

export function parseVersionString(input: unknown): VersionString {
  return VersionStringSchema.parse(input);
}

export function parseNormalizedVersionString(input: unknown): NormalizedVersionString {
  return NormalizedVersionStringSchema.parse(input);
}

export function parseRevisionIndex(input: unknown): RevisionIndex {
  return RevisionIndexSchema.parse(input);
}

export function parseCommitIndex(input: unknown): CommitIndex {
  return CommitIndexSchema.parse(input);
}

export function parseRepositoryEntityId(input: unknown): RepositoryEntityId {
  return RepositoryEntityIdSchema.parse(input);
}

export function parseRevisionKey(input: unknown): RevisionKey {
  return RevisionKeySchema.parse(input);
}

export function parseCommitKey(input: unknown): CommitKey {
  return CommitKeySchema.parse(input);
}

export function validateVersionString(input: unknown): boolean {
  return VersionStringSchema.safeParse(input).success;
}

export function validateNormalizedVersionString(input: unknown): boolean {
  return NormalizedVersionStringSchema.safeParse(input).success;
}

export function validateRevisionIndex(input: unknown): boolean {
  return RevisionIndexSchema.safeParse(input).success;
}

export function validateCommitIndex(input: unknown): boolean {
  return CommitIndexSchema.safeParse(input).success;
}

export function validateRepositoryEntityId(input: unknown): boolean {
  return RepositoryEntityIdSchema.safeParse(input).success;
}

export function validateRevisionKey(input: unknown): boolean {
  return RevisionKeySchema.safeParse(input).success;
}

export function validateCommitKey(input: unknown): boolean {
  return CommitKeySchema.safeParse(input).success;
}