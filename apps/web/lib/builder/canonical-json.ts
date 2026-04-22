import { z } from 'zod';

export const CanonicalJsonInputSchema = z
  .object({
    value: z.unknown(),
  })
  .strict();

export type CanonicalJsonInput = z.infer<typeof CanonicalJsonInputSchema>;

type CanonicalJsonPrimitive = string | number | boolean | null;
type CanonicalJsonValue =
  | CanonicalJsonPrimitive
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function normalizeObject(input: Record<string, unknown>): { [key: string]: CanonicalJsonValue } {
  const normalizedEntries = Object.keys(input)
    .sort((left, right) => left.localeCompare(right))
    .flatMap((key) => {
      const value = input[key];

      if (value === undefined) {
        return [];
      }

      return [[key, normalizeCanonicalJsonValue(value)] as const];
    });

  return Object.fromEntries(normalizedEntries);
}

function normalizeArray(input: readonly unknown[]): CanonicalJsonValue[] {
  return input.map((item) => normalizeCanonicalJsonValue(item));
}

export function normalizeCanonicalJsonValue(value: unknown): CanonicalJsonValue {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Canonical JSON does not support non-finite numbers.');
    }

    return value;
  }

  if (typeof value === 'undefined') {
    throw new Error('Canonical JSON does not support undefined values.');
  }

  if (typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') {
    throw new Error('Canonical JSON does not support this value type.');
  }

  if (value instanceof Date || value instanceof Map || value instanceof Set) {
    throw new Error('Canonical JSON does not support this object type.');
  }

  if (Array.isArray(value)) {
    return normalizeArray(value);
  }

  if (isPlainObject(value)) {
    return normalizeObject(value);
  }

  throw new Error('Canonical JSON received an unsupported value.');
}

export function stringifyCanonicalJson(value: unknown): string {
  const normalized = normalizeCanonicalJsonValue(value);

  return JSON.stringify(normalized);
}

export function parseCanonicalJsonInput(input: unknown): CanonicalJsonInput {
  return CanonicalJsonInputSchema.parse(input);
}
