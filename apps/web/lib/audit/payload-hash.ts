import { z } from 'zod';

export const AuditPayloadHashInputSchema = z
  .object({
    audit_id: z.string().trim().min(1).max(256),
    payload: z.unknown(),
  })
  .strict();

export const AuditPayloadHashRecordSchema = z
  .object({
    audit_id: z.string().trim().min(1).max(256),
    payload_hash: z.string().trim().min(1).max(256),
  })
  .strict();

export type AuditPayloadHashInput = z.infer<typeof AuditPayloadHashInputSchema>;
export type AuditPayloadHashRecord = z.infer<typeof AuditPayloadHashRecordSchema>;

type CanonicalValue =
  | string
  | number
  | boolean
  | null
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function normalizeValue(value: unknown): CanonicalValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Audit payload contains a non-finite number.');
    }

    return value;
  }

  if (typeof value === 'undefined') {
    throw new Error('Audit payload contains an unsupported undefined value.');
  }

  if (typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') {
    throw new Error('Audit payload contains an unsupported value type.');
  }

  if (value instanceof Date || value instanceof Map || value instanceof Set) {
    throw new Error('Audit payload contains an unsupported object type.');
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (isPlainObject(value)) {
    const normalizedEntries = Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .flatMap((key) => {
        const nextValue = value[key];

        if (typeof nextValue === 'undefined') {
          return [];
        }

        return [[key, normalizeValue(nextValue)] as const];
      });

    return Object.fromEntries(normalizedEntries);
  }

  throw new Error('Audit payload contains an unsupported structure.');
}

function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeValue(value));
}

function reducePayloadHash(seed: string): string {
  let hash = 0;

  for (const character of seed) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  }

  return `payload_${hash.toString(16).padStart(8, '0')}`;
}

export function parseAuditPayloadHashInput(
  input: unknown,
): AuditPayloadHashInput {
  return AuditPayloadHashInputSchema.parse(input);
}

export function computeAuditPayloadHash(
  input: AuditPayloadHashInput,
): string {
  const parsed = parseAuditPayloadHashInput(input);
  const canonical = stableStringify({
    audit_id: parsed.audit_id,
    payload: parsed.payload,
  });

  return reducePayloadHash(canonical);
}

export function buildAuditPayloadHashRecord(
  input: AuditPayloadHashInput,
): AuditPayloadHashRecord {
  const parsed = parseAuditPayloadHashInput(input);

  return {
    audit_id: parsed.audit_id,
    payload_hash: computeAuditPayloadHash(parsed),
  };
}
