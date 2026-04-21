import { z } from 'zod';

export const LowerHexIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]+$/, 'Value must be lower-case hex.');
export type LowerHexId = z.infer<typeof LowerHexIdSchema>;

export const PrefixedIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9][a-z0-9_-]*(?::[a-z0-9][a-z0-9_-]*)+$/, 'Invalid prefixed id.');
export type PrefixedId = z.infer<typeof PrefixedIdSchema>;

const IdSegmentSchema = z.union([z.string(), z.number().int().nonnegative()]);

export function normalizeIdSegment(input: unknown): string {
  const parsed = IdSegmentSchema.parse(input);
  const raw = String(parsed).trim().toLowerCase();

  if (raw.length === 0) {
    throw new Error('ID segment cannot be empty.');
  }

  const normalized = raw.replace(/\s+/g, '-');

  if (!/^[a-z0-9_-]+$/.test(normalized)) {
    throw new Error('ID segment contains unsupported characters.');
  }

  return normalized;
}

export function buildPrefixedId(prefixInput: unknown, ...segmentInputs: unknown[]): PrefixedId {
  const prefix = normalizeIdSegment(prefixInput);

  if (segmentInputs.length === 0) {
    throw new Error('At least one id segment is required.');
  }

  const segments = segmentInputs.map((segment) => normalizeIdSegment(segment));
  return PrefixedIdSchema.parse([prefix, ...segments].join(':'));
}

export function buildCompositeId(...segmentInputs: unknown[]): string {
  if (segmentInputs.length === 0) {
    throw new Error('At least one id segment is required.');
  }

  return segmentInputs.map((segment) => normalizeIdSegment(segment)).join(':');
}

export function validatePrefixedId(input: unknown): boolean {
  return PrefixedIdSchema.safeParse(input).success;
}