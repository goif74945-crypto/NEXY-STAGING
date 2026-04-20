import { z } from 'zod';

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const VersionStringSchema = z
  .string()
  .trim()
  .regex(VERSION_PATTERN, 'Version must use exact major.minor.patch format.');
export type VersionString = z.infer<typeof VersionStringSchema>;

export const RevisionIndexSchema = z.number().int().nonnegative();
export type RevisionIndex = z.infer<typeof RevisionIndexSchema>;

export const CommitIndexSchema = z.number().int().nonnegative();
export type CommitIndex = z.infer<typeof CommitIndexSchema>;

export const RepositoryEntityIdSchema = z.string().trim().min(1).max(128);
export type RepositoryEntityId = z.infer<typeof RepositoryEntityIdSchema>;

export const RevisionKeySchema = z
  .string()
  .trim()
  .regex(
    /^rev:.+:\d+:(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
    'Revision key must match rev:<entityId>:<revisionIndex>:<version>.',
  );
export type RevisionKey = z.infer<typeof RevisionKeySchema>;

export const CommitKeySchema = z
  .string()
  .trim()
  .regex(
    /^commit:.+:\d+:(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
    'Commit key must match commit:<entityId>:<commitIndex>:<version>.',
  );
export type CommitKey = z.infer<typeof CommitKeySchema>;

function parseVersionSegments(versionInput: unknown): [number, number, number] {
  const normalized = normalizeVersionString(versionInput);
  const parts = normalized.split('.');

  if (parts.length !== 3) {
    throw new Error('Version must have exactly 3 segments.');
  }

  return [
    Number.parseInt(parts[0], 10),
    Number.parseInt(parts[1], 10),
    Number.parseInt(parts[2], 10),
  ];
}

export function parseVersionString(input: unknown): VersionString {
  return VersionStringSchema.parse(input);
}

export function validateVersionString(input: unknown): boolean {
  return VersionStringSchema.safeParse(input).success;
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

export function normalizeVersionString(input: unknown): VersionString {
  const raw = z.string().parse(input);
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw new Error('Version must not be empty.');
  }

  if (/\s/.test(trimmed)) {
    throw new Error('Version must not contain whitespace.');
  }

  const parts = trimmed.split('.');

  if (parts.length !== 3) {
    throw new Error('Version must have exactly 3 segments.');
  }

  const normalizedParts = parts.map((part) => {
    if (part.length === 0) {
      throw new Error('Version segments must not be empty.');
    }

    if (!/^\d+$/.test(part)) {
      throw new Error('Version segments must be numeric.');
    }

    if (part.length > 1 && part.startsWith('0')) {
      throw new Error('Version segments must not contain leading zeroes.');
    }

    return String(Number.parseInt(part, 10));
  });

  return VersionStringSchema.parse(normalizedParts.join('.'));
}

export function compareVersion(leftInput: unknown, rightInput: unknown): -1 | 0 | 1 {
  const left = parseVersionSegments(leftInput);
  const right = parseVersionSegments(rightInput);

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
