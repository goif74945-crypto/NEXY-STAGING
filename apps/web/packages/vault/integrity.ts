import { createHash } from 'node:crypto';
import { z } from 'zod';

export type CanonicalJsonPrimitive = string | number | boolean | null;
export type CanonicalJsonValue =
  | CanonicalJsonPrimitive
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue };

export const Sha256HashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/i, 'SHA-256 hash must be 64 hex characters.');
export type Sha256Hash = z.infer<typeof Sha256HashSchema>;

export const IntegrityPayloadKindSchema = z.enum(['payload', 'revision', 'commit']);
export type IntegrityPayloadKind = z.infer<typeof IntegrityPayloadKindSchema>;

export const IntegrityPayloadSchema = z
  .object({
    kind: IntegrityPayloadKindSchema,
    canonical_json: z.string(),
    sha256: Sha256HashSchema,
  })
  .strict();
export type IntegrityPayload = z.infer<typeof IntegrityPayloadSchema>;

export const IntegrityVerificationResultSchema = z
  .object({
    matches: z.boolean(),
    expected_hash: Sha256HashSchema,
    actual_hash: Sha256HashSchema,
    expected_canonical_json: z.string(),
    actual_canonical_json: z.string(),
    reason: z.string().nullable(),
  })
  .strict();
export type IntegrityVerificationResult = z.infer<typeof IntegrityVerificationResultSchema>;

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return Object.prototype.toString.call(input) === '[object Object]';
}

function normalizeCanonicalValue(input: unknown): CanonicalJsonValue {
  if (input === null) {
    return null;
  }

  if (typeof input === 'string' || typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      throw new Error('Canonical JSON does not support non-finite numbers.');
    }

    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => normalizeCanonicalValue(item));
  }

  if (isPlainObject(input)) {
    const normalizedObject: { [key: string]: CanonicalJsonValue } = {};
    const keys = Object.keys(input).sort();

    for (const key of keys) {
      const value = input[key];

      if (value === undefined) {
        continue;
      }

      normalizedObject[key] = normalizeCanonicalValue(value);
    }

    return normalizedObject;
  }

  throw new Error('Canonical JSON only supports plain objects, arrays, strings, booleans, numbers, and null.');
}

export function canonicalStringify(input: unknown): string {
  const normalized = normalizeCanonicalValue(input);

  if (normalized === null) {
    return 'null';
  }

  if (typeof normalized === 'string') {
    return JSON.stringify(normalized);
  }

  if (typeof normalized === 'number' || typeof normalized === 'boolean') {
    return JSON.stringify(normalized);
  }

  if (Array.isArray(normalized)) {
    return `[${normalized.map((item) => canonicalStringify(item)).join(',')}]`;
  }

  const keys = Object.keys(normalized).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(normalized[key])}`);

  return `{${entries.join(',')}}`;
}

function buildIntegrityPayload(
  kind: IntegrityPayloadKind,
  input: unknown,
): IntegrityPayload {
  const canonical_json = canonicalStringify(input);
  const sha256 = createHash('sha256').update(canonical_json, 'utf8').digest('hex');

  return IntegrityPayloadSchema.parse({
    kind,
    canonical_json,
    sha256,
  });
}

export function hashPayload(input: unknown): IntegrityPayload {
  return buildIntegrityPayload('payload', input);
}

export function hashRevision(input: unknown): IntegrityPayload {
  return buildIntegrityPayload('revision', input);
}

export function hashCommit(input: unknown): IntegrityPayload {
  return buildIntegrityPayload('commit', input);
}

export function verifyIntegrityEquality(
  expectedInput: unknown,
  actualInput: unknown,
): IntegrityVerificationResult {
  const expected = IntegrityPayloadSchema.parse(expectedInput);
  const actual = IntegrityPayloadSchema.parse(actualInput);

  const matches =
    expected.sha256 === actual.sha256 &&
    expected.canonical_json === actual.canonical_json;

  return IntegrityVerificationResultSchema.parse({
    matches,
    expected_hash: expected.sha256,
    actual_hash: actual.sha256,
    expected_canonical_json: expected.canonical_json,
    actual_canonical_json: actual.canonical_json,
    reason: matches ? null : 'Integrity payloads are not equal.',
  });
}

export function parseSha256Hash(input: unknown): Sha256Hash {
  return Sha256HashSchema.parse(input);
}

export function parseIntegrityPayload(input: unknown): IntegrityPayload {
  return IntegrityPayloadSchema.parse(input);
}

export function parseIntegrityVerificationResult(
  input: unknown,
): IntegrityVerificationResult {
  return IntegrityVerificationResultSchema.parse(input);
}

export function validateSha256Hash(input: unknown): boolean {
  return Sha256HashSchema.safeParse(input).success;
}

export function validateIntegrityPayload(input: unknown): boolean {
  return IntegrityPayloadSchema.safeParse(input).success;
}

export function validateIntegrityVerificationResult(input: unknown): boolean {
  return IntegrityVerificationResultSchema.safeParse(input).success;
}