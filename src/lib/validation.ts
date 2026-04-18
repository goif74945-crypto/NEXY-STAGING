import { ValidationAppError } from '@/lib/errors/app-errors';

export function assertNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationAppError({
      field: fieldName,
      reason: 'Expected a non-empty string.',
    });
  }

  return value.trim();
}

export function assertBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationAppError({
      field: fieldName,
      reason: 'Expected a boolean value.',
    });
  }

  return value;
}

export function assertPositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new ValidationAppError({
      field: fieldName,
      reason: 'Expected a positive integer.',
    });
  }

  return value;
}
