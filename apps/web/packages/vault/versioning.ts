import { z } from 'zod';

const NumericVersionPartSchema = z
  .string()
  .regex(/^(0|[1-9]\d*)$/, 'Version parts must be non-negative integers without leading zeroes.');

export const VersionStringSchema = z
  .string()
  .trim()
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
    'Version string must match major.minor.patch without leading zeroes.',
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

const VersionPartsSchema = z
  .tuple([NumericVersionPartSchema, NumericVersionPartSchema, NumericVersionPartSchema])
  .readonly();

type VersionParts = z.infer<typeof VersionPartsSchema>;

function splitVersionParts(versionInput: unknown): VersionParts {
  const version = parseVersionString(versionInput);
  const parts = version.split('.');

  return VersionPartsSchema.parse([parts[0], parts[1], parts[2]]);
}

function parseVersionPart(partInput: string): number {
  const part = NumericVersionPartSchema.parse(partInput);
  return Number.parseInt(part, 10);
}

export function normalizeVersionString(versionInput: unknown): VersionString {
  const raw = z.string().parse(versionInput);
  const trimmed = raw.trim();
  const parts = trimmed.split('.');

  if (parts.length !== 3) {
    throw new Error('Version string must contain exactly three numeric segments.');
  }

  const validatedParts = VersionPartsSchema.parse([parts[0], parts[1], parts[2]]);

  return VersionStringSchema.parse(validatedParts.join('.'));
}

export function compareVersion(leftInput: unknown, rightInput: unknown): -1 | 0 | 1 {
  const leftParts = splitVersionParts(leftInput);
  const rightParts = splitVersionParts(rightInput);

  for (let index = 0; index < 3; index += 1) {
    const leftValue = parseVersionPart(leftParts[index]);
    const rightValue = parseVersionPart(rightParts[index]);

    if (leftValue < rightValue) {
      return -1;
    }

    if (leftValue > rightValue) {
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
  return VersionStringSchema.parse(z.string().parse(input).trim());
}

export function validateVersionString(input: unknown): boolean {
  return VersionStringSchema.safeParse(z.string().safeParse(input).success ? z.string().parse(input).trim() : input)
    .success;
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