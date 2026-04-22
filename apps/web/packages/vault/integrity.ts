import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

import {
  CommitRecordSchema,
  type CommitRecord,
  RevisionRecordSchema,
  type RevisionRecord,
} from './repository';

export const CanonicalPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const HashAlgorithmSchema = z.literal('sha256');
export type HashAlgorithm = z.infer<typeof HashAlgorithmSchema>;

export const DigestSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'Digest must be lowercase SHA-256 hex.');
export type Digest = z.infer<typeof DigestSchema>;

export function parseDigest(input: unknown): Digest {
  return DigestSchema.parse(input);
}

export function validateDigest(input: unknown) {
  return DigestSchema.safeParse(input);
}

function canonicalizeValue(value: unknown, visited: WeakSet<object>): string {
  if (CanonicalPrimitiveSchema.safeParse(value).success) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const serializedItems = value.map((item) => canonicalizeValue(item, visited));
    return `[${serializedItems.join(',')}]`;
  }

  if (typeof value === 'object' && value !== null) {
    if (visited.has(value)) {
      throw new Error('Cannot canonicalize cyclic structures.');
    }

    visited.add(value);

    const objectValue = value as Record<string, unknown>;
    const sortedKeys = Object.keys(objectValue).sort((left, right) => left.localeCompare(right));
    const serializedFields = sortedKeys.map(
      (key) => `${JSON.stringify(key)}:${canonicalizeValue(objectValue[key], visited)}`,
    );

    visited.delete(value);
    return `{${serializedFields.join(',')}}`;
  }

  throw new Error('Unsupported value type for canonical serialization.');
}

export function canonicalStringify(payload: unknown): string {
  return canonicalizeValue(payload, new WeakSet<object>());
}

export function hashPayload(payload: unknown, algorithm: HashAlgorithm = 'sha256'): Digest {
  const parsedAlgorithm = HashAlgorithmSchema.parse(algorithm);
  const canonical = canonicalStringify(payload);
  const digest = createHash(parsedAlgorithm).update(canonical).digest('hex');
  return DigestSchema.parse(digest);
}

export function hashRevision(input: unknown): Digest {
  const revision: RevisionRecord = RevisionRecordSchema.parse(input);
  const payload = {
    entity_id: revision.entity_id,
    revision_index: revision.revision_index,
    revision_key: revision.revision_key,
    previous_revision_key: revision.previous_revision_key ?? null,
    snapshot: revision.snapshot,
  };

  return hashPayload(payload);
}

export function hashCommit(input: unknown): Digest {
  const commit: CommitRecord = CommitRecordSchema.parse(input);
  const payload = {
    entity_id: commit.entity_id,
    commit_index: commit.commit_index,
    commit_key: commit.commit_key,
    revision_key: commit.revision_key,
    revision_hash: commit.revision_hash,
    author: commit.author,
    message: commit.message,
  };

  return hashPayload(payload);
}

export function verifyIntegrityEquality(leftDigestInput: unknown, rightDigestInput: unknown): boolean {
  const leftDigest = parseDigest(leftDigestInput);
  const rightDigest = parseDigest(rightDigestInput);

  const leftBytes = Buffer.from(leftDigest, 'hex');
  const rightBytes = Buffer.from(rightDigest, 'hex');

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  return timingSafeEqual(leftBytes, rightBytes);
}
