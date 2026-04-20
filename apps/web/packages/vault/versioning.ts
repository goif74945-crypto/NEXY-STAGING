import { z } from 'zod';

const VERSION_SEGMENT_PATTERN = '(0|[1-9]\\d*)';
const VERSION_PATTERN = new RegExp(
  `^${VERSION_SEGMENT_PATTERN}\\.${VERSION_SEGMENT_PATTERN}\\.${VERSION_SEGMENT_PATTERN}$`,
);

export const VersionStringSchema = z
  .string()
  .trim()
  .regex(
    VERSION_PATTERN,
    'Version string must match major.minor.patch using non-negative integers without leading zeroes.',
  );
export type VersionString = z.infer<typeof VersionStringSchema>;

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
    new RegExp(
      `^rev:.+:\\d+:${VERSION_SEGMENT_PATTERN}\\.${VERSION_SEGMENT_PATTERN}\\.${VERSION_SEGMENT_PATTERN}$`,
    ),
    'Revision key must match rev:<entityId>:<revisionIndex>:<version>.',
  );
export type RevisionKey = z.infer<typeof RevisionKeySchema>;

export const CommitKeySchema = z
  .string()
  .trim()
  .regex(
    new RegExp(
      `^commit:.+:\\d+:${VERSION_SEGMENT_PATTERN}\\.${VERSION_SEGMENT_PATTERN}\\.${VERSION_SEGMENT_PATTERN}$`,
    ),
    'Commit key must match commit:<entityId>:<commitIndex>:<version>.',
  );
export type CommitKey = z.infer<typeof CommitKeySchema>;

const VersionPartsSchema = z.tuple([
  z.number().int().nonnegative(),
  z.number().int().nonnegative(),
  z.number().int().nonnegative(),
]);
type VersionParts = z.infer<typeof VersionPartsSchema>;

function parseVersionParts(versionInput: unknown): VersionParts {
  const normalized = normalizeVersionString(versionInput);
  const rawParts = normalized.split('.');

  if (rawParts.length !== 3) {
    throw new Error('Version string must contain exactly three numeric segments.');
  }

  return VersionPartsSchema.parse([
    Number.parseInt(rawParts[0], 10),
    Number.parseInt(rawParts[1], 10),
    Number.parseInt(rawParts[2], 10),
  ]);
}

export function normalizeVersionString(versionInput: unknown): VersionString {
  const raw = z.string().parse(versionInput);
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw new Error('Version string cannot be empty.');
  }

  if (trimmed.includes(' ')) {
    throw new Error('Version string cannot contain whitespace.');
  }

  const parts = trimmed.split('.');

  if (parts.length !== 3) {
    throw new Error('Version string must contain exactly three numeric segments.');
  }

  for (const part of parts) {
    if (part.length === 0) {
      throw new Error('Version string cannot contain empty segments.');
    }

    if (!/^\d+$/.test(part)) {
      throw new Error('Version segments must be numeric.');
    }

    if (part.length > 1 && part.startsWith('0')) {
      throw new Error('Version segments cannot contain leading zeroes unless the segment is exactly "0".');
    }
  }

  return VersionStringSchema.parse(parts.join('.'));
}

export function compareVersion(leftInput: unknown, rightInput: unknown): -1 | 0 | 1 {
  const left = parseVersionParts(leftInput);
  const right = parseVersionParts(rightInput);

  for (let index = 0; index < 3; index += 1) {
    if (left[index] < right[index]) {
      return -1;
    }

    if (left[index] > right[index]) {
      return 1;
    }
  }

  return 0;
}

export function nextRevisionIndex(currentInput: unknown): RevisionIndex {
  const current = parseRevisionIndex(currentInput);
  return RevisionIndexSchema.parse(current + 1);
}

export function nextCommitIndex(currentInput: unknown): CommitIndex {
  const current = parseCommitIndex(currentInput);
  return CommitIndexSchema.parse(current + 1);
}

export function buildRevisionKey(
  entityIdInput: unknown,
  revisionIndexInput: unknown,
  versionInput: unknown,
): RevisionKey {
  const entityId = parseRepositoryEntityId(entityIdInput);
  const revisionIndex = parseRevisionIndex(revisionIndexInput);
  const version = normalizeVersionString(versionInput);

  return RevisionKeySchema.parse(`rev:${entityId}:${revisionIndex}:${version}`);
}

export function buildCommitKey(
  entityIdInput: unknown,
  commitIndexInput: unknown,
  versionInput: unknown,
): CommitKey {
  const entityId = parseRepositoryEntityId(entityIdInput);
  const commitIndex = parseCommitIndex(commitIndexInput);
  const version = normalizeVersionString(versionInput);

  return CommitKeySchema.parse(`commit:${entityId}:${commitIndex}:${version}`);
}

export function parseVersionString(input: unknown): VersionString {
  return normalizeVersionString(input);
}

export function validateVersionString(input: unknown): boolean {
  try {
    normalizeVersionString(input);
    return true;
  } catch {
    return false;
  }
}

export function parseRevisionIndex(input: unknown): RevisionIndex {
  return RevisionIndexSchema.parse(input);
}

export function validateRevisionIndex(input: unknown): boolean {
  return RevisionIndexSchema.safeParse(input).success;
}

export function parseCommitIndex(input: unknown): CommitIndex {
  return CommitIndexSchema.parse(input);
}

export function validateCommitIndex(input: unknown): boolean {
  return CommitIndexSchema.safeParse(input).success;
}

export function parseRepositoryEntityId(input: unknown): RepositoryEntityId {
  return RepositoryEntityIdSchema.parse(input);
}

export function validateRepositoryEntityId(input: unknown): boolean {
  return RepositoryEntityIdSchema.safeParse(input).success;
}

export function parseRevisionKey(input: unknown): RevisionKey {
  return RevisionKeySchema.parse(input);
}

export function validateRevisionKey(input: unknown): boolean {
  return RevisionKeySchema.safeParse(input).success;
}

export function parseCommitKey(input: unknown): CommitKey {
  return CommitKeySchema.parse(input);
}

export function validateCommitKey(input: unknown): boolean {
  return CommitKeySchema.safeParse(input).success;
}