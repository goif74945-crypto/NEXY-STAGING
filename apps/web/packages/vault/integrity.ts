import { createHash } from 'node:crypto';
import { z } from 'zod';

type IntegrityJsonPrimitive = string | number | boolean | null;
type IntegrityJsonValue =
  | IntegrityJsonPrimitive
  | IntegrityJsonValue[]
  | { [key: string]: IntegrityJsonValue };

const IntegrityPrimitiveSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const IntegrityPayloadSchema: z.ZodType<IntegrityJsonValue> = z.lazy(() =>
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

const RevisionHashInputSchema = z
  .object({
    entity_id: z.string().trim().min(1).max(128),
    revision_index: z.number().int().nonnegative(),
    version: z.string().trim().min(1),
    payload: IntegrityPayloadSchema,
  })
  .strict();

const CommitHashInputSchema = z
  .object({
    entity_id: z.string().trim().min(1).max(128),
    commit_index: z.number().int().nonnegative(),
    version: z.string().trim().min(1),
    payload: IntegrityPayloadSchema,
  })
  .strict();

function isPlainObject(input: unknown): input is Record<string, unknown> {
  if (Object.prototype.toString.call(input) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(input);
  return prototype === Object.prototype || prototype === null;
}

function normalizeNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('Unsupported number value.');
  }

  if (Object.is(value, -0)) {
    throw new Error('Unsupported number value.');
  }

  return value;
}

function normalizePayload(input: unknown, isRoot: boolean): IntegrityPayload {
  if (typeof input === 'undefined') {
    if (isRoot) {
      throw new Error('Undefined root payload is not allowed.');
    }

    throw new Error('Undefined value is not allowed in this position.');
  }

  if (input === null) {
    return null;
  }

  if (typeof input === 'string' || typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'number') {
    return normalizeNumber(input);
  }

  if (typeof input === 'bigint' || typeof input === 'function' || typeof input === 'symbol') {
    throw new Error('Unsupported payload value.');
  }

  if (input instanceof Date || input instanceof Map || input instanceof Set) {
    throw new Error('Unsupported payload value.');
  }

  if (Array.isArray(input)) {
    return input.map((item) => (typeof item === 'undefined' ? null : normalizePayload(item, false)));
  }

  if (isPlainObject(input)) {
    const keys = Object.keys(input).sort((left, right) => {
      if (left < right) {
        return -1;
      }

      if (left > right) {
        return 1;
      }

      return 0;
    });

    const normalized: { [key: string]: IntegrityPayload } = {};

    for (const key of keys) {
      const value = input[key];

      if (typeof value === 'undefined') {
        continue;
      }

      normalized[key] = normalizePayload(value, false);
    }

    return normalized;
  }

  throw new Error('Unsupported payload value.');
}

function serializeCanonical(input: IntegrityPayload): string {
  if (input === null) {
    return 'null';
  }

  if (typeof input === 'string') {
    return JSON.stringify(input);
  }

  if (typeof input === 'number') {
    return JSON.stringify(input);
  }

  if (typeof input === 'boolean') {
    return input ? 'true' : 'false';
  }

  if (Array.isArray(input)) {
    return `[${input.map((item) => serializeCanonical(item)).join(',')}]`;
  }

  const keys = Object.keys(input).sort((left, right) => {
    if (left < right) {
      return -1;
    }

    if (left > right) {
      return 1;
    }

    return 0;
  });

  const entries = keys.map((key) => `${JSON.stringify(key)}:${serializeCanonical(input[key])}`);
  return `{${entries.join(',')}}`;
}

function computeSha256(input: string): Sha256Hash {
  const digest = createHash('sha256').update(input, 'utf8').digest('hex').toLowerCase();
  return Sha256HashSchema.parse(digest);
}

export function canonicalStringify(input: unknown): string {
  const payload = parseIntegrityPayload(input);
  return serializeCanonical(payload);
}

export function hashPayload(input: IntegrityPayload): Sha256Hash {
  const payload = parseIntegrityPayload(input);
  return computeSha256(serializeCanonical(payload));
}

export function hashRevision(input: unknown): Sha256Hash {
  const parsed = RevisionHashInputSchema.parse(input);
  return computeSha256(
    canonicalStringify({
      entity_id: parsed.entity_id,
      revision_index: parsed.revision_index,
      version: parsed.version,
      payload: parsed.payload,
    }),
  );
}

export function hashCommit(input: unknown): Sha256Hash {
  const parsed = CommitHashInputSchema.parse(input);
  return computeSha256(
    canonicalStringify({
      entity_id: parsed.entity_id,
      commit_index: parsed.commit_index,
      version: parsed.version,
      payload: parsed.payload,
    }),
  );
}

export function verifyIntegrityEquality(
  expectedHashInput: unknown,
  actualHashInput: unknown,
): IntegrityVerificationResult {
  const expected_hash = parseSha256Hash(expectedHashInput);
  const actual_hash = parseSha256Hash(actualHashInput);

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
  return IntegrityPayloadSchema.parse(normalizePayload(input, true));
}

export function validateIntegrityPayload(input: unknown): boolean {
  try {
    return IntegrityPayloadSchema.safeParse(normalizePayload(input, true)).success;
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
