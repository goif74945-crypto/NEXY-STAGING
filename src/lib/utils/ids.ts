function assertNonEmptyString(name: string, input: string): string {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }

  return trimmed;
}

function normalizeIdPart(name: string, input: string): string {
  const trimmed = assertNonEmptyString(name, input);
  const normalized = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (normalized.length === 0) {
    throw new Error(`${name} must contain at least one alphanumeric character.`);
  }

  return normalized;
}

export function createRequestId(prefix: string, value: string): string {
  const normalizedPrefix = normalizeIdPart('Request id prefix', prefix);
  const normalizedValue = normalizeIdPart('Request id value', value);

  return `${normalizedPrefix}_${normalizedValue}`;
}

export function createEntityId(prefix: string, value: string): string {
  const normalizedPrefix = normalizeIdPart('Entity id prefix', prefix);
  const normalizedValue = normalizeIdPart('Entity id value', value);

  return `${normalizedPrefix}_${normalizedValue}`;
}
