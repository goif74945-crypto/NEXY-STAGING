import { createHash } from 'node:crypto';
import { z } from 'zod';

type IntegrityPrimitive = string | number | boolean | null;
type IntegrityValue =
  | IntegrityPrimitive
  | IntegrityValue[]
  | { [key: string]: IntegrityValue };

const IntegrityPrimitiveSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const IntegrityPayloadSchema: z.ZodType<IntegrityValue> = z.lazy(() =>
  z.union([
    IntegrityPrimitiveSchema,
    z.array(IntegrityPayloadSchema),
    z.record(IntegrityPayloadSchema),
  ]),
);
export type IntegrityPayload = z.infer<typeof IntegrityPayloadSchema>;

export const Sha256HashSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/, 'SHA-256 hash must be lower-case hex with 64 characters.');
export type Sha256Hash = z.infer<typeof Sha256HashSchema>;

export const IntegrityVerificationResultSchema = z
  .object({
    expected_hash: Sha256HashSchema,
    actual_hash: Sha256HashSchema,
    matches: z.boolean(),
  })
  .strict();
export type IntegrityVerificationResult = z.infer<typeof IntegrityVerificationResultSchema>;

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return Object.prototype.toString.call(input) === '[object Object]';
}

function normalizeIntegrityValue(input: unknown): IntegrityValue {
  if (input === null) {
    return null;
  }

  if (typeof input === 'string' || typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      throw new Error('Integrity payload cannot contain non-finite numbers.');
    }

    return input;
  }

  if (typeof input === 'undefined') {
    throw new Error('Top-level undefined is not supported.');
  }

  if (typeof input === 'function') {
    throw new Error('Functions are not supported in integrity payloads.');
  }

  if (typeof input === 'symbol') {
    throw new Error('Symbols are not supported in integrity payloads.');
  }

  if (typeof input === 'bigint') {
    throw new Error('BigInt is not supported in integrity payloads.');
  }

  if (Array.isArray(input)) {
    return input.map((item) => {
      if (typeof item === 'undefined') {
        return null;
      }

      return normalizeIntegrityValue(item);
    });
  }

  if (isPlainObject(input)) {
    const normalized: { [key: string]: IntegrityValue } = {};
    const keys = Object.keys(input).sort((left, right) => left.localeCompare(right));

    for (const key of keys) {
      const value = input[key];

      if (typeof value === 'undefined') {
        continue;
      }

      normalized[key] = normalizeIntegrityValue(value);
    }

    return normalized;
  }

  throw new Error('Unsupported integrity payload value.');
}

export function canonicalStringify(input: unknown): string {
  const normalized = normalizeIntegrityValue(input);

  if (normalized === null) {
    return 'null';
  }

  if (typeof normalized === 'string') {
    return JSON.stringify(normalized);
  }

  if (typeof normalized === 'number') {
    return JSON.stringify(normalized);
  }

  if (typeof normalized === 'boolean') {
    return normalized ? 'true' : 'false';
  }

  if (Array.isArray(normalized)) {
    return `[${normalized.map((item) => canonicalStringify(item)).join(',')}]`;
  }

  const keys = Object.keys(normalized).sort((left, right) => left.localeCompare(right));
  const entries = keys.map((key) => `${JSON.stringify(key)}:${canonicalStringify(normalized[key])}`);

  return `{${entries.join(',')}}`;
}

function sha256FromCanonicalString(input: string): Sha256Hash {
  const digest = createHash('sha256').update(input, 'utf8').digest('hex').toLowerCase();
  return Sha256HashSchema.parse(digest);
}

export function hashPayload(input: unknown): Sha256Hash {
  const payload = parseIntegrityPayload(input);
  const canonical = canonicalStringify(payload);
  return sha256FromCanonicalString(canonical);
}

export function hashRevision(input: unknown): Sha256Hash {
  const payload = parseIntegrityPayload(input);
  const canonical = canonicalStringify(payload);
  return sha256FromCanonicalString(canonical);
}

export function hashCommit(input: unknown): Sha256Hash {
  const payload = parseIntegrityPayload(input);
  const canonical = canonicalStringify(payload);
  return sha256FromCanonicalString(canonical);
}

export function verifyIntegrityEquality(
  expectedInput: unknown,
  actualInput: unknown,
): IntegrityVerificationResult {
  const expected_hash = parseSha256Hash(expectedInput);
  const actual_hash = parseSha256Hash(actualInput);

  return IntegrityVerificationResultSchema.parse({
    expected_hash,
    actual_hash,
    matches: expected_hash === actual_hash,
  });
}

export function parseSha256Hash(input: unknown): Sha256Hash {
  return Sha256HashSchema.parse(input);
}

export function validateSha256Hash(input: unknown): boolean {
  return Sha256HashSchema.safeParse(input).success;
}

export function parseIntegrityPayload(input: unknown): IntegrityPayload {
  return IntegrityPayloadSchema.parse(normalizeIntegrityValue(input));
}

export function validateIntegrityPayload(input: unknown): boolean {
  try {
    return IntegrityPayloadSchema.safeParse(normalizeIntegrityValue(input)).success;
  } catch {
    return false;
  }
}

export function parseIntegrityVerificationResult(input: unknown): IntegrityVerificationResult {
  return IntegrityVerificationResultSchema.parse(input);
}

export function validateIntegrityVerificationResult(input: unknown): boolean {
  return IntegrityVerificationResultSchema.safeParse(input).success;
}