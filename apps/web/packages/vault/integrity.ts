import { createHash } from 'node:crypto';
import { z } from 'zod';

type IntegrityPrimitive = string | number | boolean | null;
export type IntegrityPayload =
  | IntegrityPrimitive
  | IntegrityPayload[]
  | { [key: string]: IntegrityPayload };

const IntegrityPrimitiveSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const IntegrityPayloadSchema: z.ZodType<IntegrityPayload> = z.lazy(() =>
  z.union([
    IntegrityPrimitiveSchema,
    z.array(IntegrityPayloadSchema),
    z.record(IntegrityPayloadSchema),
  ]),
);

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

function isDateObject(input: unknown): input is Date {
  return input instanceof Date;
}

function isMapObject(input: unknown): input is Map<unknown, unknown> {
  return input instanceof Map;
}

function isSetObject(input: unknown): input is Set<unknown> {
  return input instanceof Set;
}

function isPlainRecord(input: unknown): input is Record<string, unknown> {
  if (Object.prototype.toString.call(input) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(input);
  return prototype === Object.prototype || prototype === null;
}

function normalizeNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('Integrity payload does not support NaN or Infinity.');
  }

  if (Object.is(value, -0)) {
    throw new Error('Integrity payload does not support -0.');
  }

  return value;
}

function normalizeIntegrityPayload(input: unknown, atRoot: boolean): IntegrityPayload {
  if (typeof input === 'undefined') {
    if (atRoot) {
      throw new Error('Root integrity payload cannot be undefined.');
    }

    throw new Error('Undefined is not allowed in this position.');
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

  if (typeof input === 'bigint') {
    throw new Error('Integrity payload does not support bigint.');
  }

  if (typeof input === 'function') {
    throw new Error('Integrity payload does not support function values.');
  }

  if (typeof input === 'symbol') {
    throw new Error('Integrity payload does not support symbol values.');
  }

  if (isDateObject(input)) {
    throw new Error('Integrity payload does not support Date objects.');
  }

  if (isMapObject(input)) {
    throw new Error('Integrity payload does not support Map objects.');
  }

  if (isSetObject(input)) {
    throw new Error('Integrity payload does not support Set objects.');
  }

  if (Array.isArray(input)) {
    return input.map((item) =>
      typeof item === 'undefined' ? null : normalizeIntegrityPayload(item, false),
    );
  }

  if (isPlainRecord(input)) {
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

      normalized[key] = normalizeIntegrityPayload(value, false);
    }

    return normalized;
  }

  throw new Error('Integrity payload contains an unsupported value.');
}

function canonicalSerialize(input: IntegrityPayload): string {
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
    return `[${input.map((item) => canonicalSerialize(item)).join(',')}]`;
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

  const serializedEntries = keys.map(
    (key) => `${JSON.stringify(key)}:${canonicalSerialize(input[key])}`,
  );

  return `{${serializedEntries.join(',')}}`;
}

function sha256Hex(input: string): Sha256Hash {
  const digest = createHash('sha256').update(input, 'utf8').digest('hex').toLowerCase();
  return Sha256HashSchema.parse(digest);
}

const RevisionHashInputSchema = z
  .object({
    entity_id: z.string().trim().min(1),
    revision_index: z.number().int().nonnegative(),
    version: z.string().trim().min(1),
    payload: IntegrityPayloadSchema,
  })
  .strict();

const CommitHashInputSchema = z
  .object({
    entity_id: z.string().trim().min(1),
    commit_index: z.number().int().nonnegative(),
    version: z.string().trim().min(1),
    payload: IntegrityPayloadSchema,
  })
  .strict();

export function canonicalStringify(input: unknown): string {
  const payload = parseIntegrityPayload(input);
  return canonicalSerialize(payload);
}

export function hashPayload(input: IntegrityPayload): Sha256Hash {
  const payload = parseIntegrityPayload(input);
  const canonical = canonicalSerialize(payload);
  return sha256Hex(canonical);
}

export function hashRevision(input: unknown): Sha256Hash {
  const parsed = RevisionHashInputSchema.parse({
    ...z.object({
      entity_id: z.string().trim().min(1),
      revision_index: z.number().int().nonnegative(),
      version: z.string().trim().min(1),
      payload: z.unknown(),
    }).parse(input),
    payload: parseIntegrityPayload(
      z.object({
        entity_id: z.string().trim().min(1),
        revision_index: z.number().int().nonnegative(),
        version: z.string().trim().min(1),
        payload: z.unknown(),
      }).parse(input).payload,
    ),
  });

  const canonical = canonicalSerialize({
    entity_id: parsed.entity_id,
    revision_index: parsed.revision_index,
    version: parsed.version,
    payload: parsed.payload,
  });

  return sha256Hex(canonical);
}

export function hashCommit(input: unknown): Sha256Hash {
  const parsed = CommitHashInputSchema.parse({
    ...z.object({
      entity_id: z.string().trim().min(1),
      commit_index: z.number().int().nonnegative(),
      version: z.string().trim().min(1),
      payload: z.unknown(),
    }).parse(input),
    payload: parseIntegrityPayload(
      z.object({
        entity_id: z.string().trim().min(1),
        commit_index: z.number().int().nonnegative(),
        version: z.string().trim().min(1),
        payload: z.unknown(),
      }).parse(input).payload,
    ),
  });

  const canonical = canonicalSerialize({
    entity_id: parsed.entity_id,
    commit_index: parsed.commit_index,
    version: parsed.version,
    payload: parsed.payload,
  });

  return sha256Hex(canonical);
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
  return IntegrityPayloadSchema.parse(normalizeIntegrityPayload(input, true));
}

export function validateIntegrityPayload(input: unknown): boolean {
  try {
    const normalized = normalizeIntegrityPayload(input, true);
    return IntegrityPayloadSchema.safeParse(normalized).success;
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